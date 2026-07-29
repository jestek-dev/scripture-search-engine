/**
 * Writes Layer A (concepts) and the cross-reference graph into the artifact.
 *
 * Runs after the scripture corpus exists, because both layers are filtered
 * against the verses actually present: an anchor or edge pointing at a verse
 * this artifact does not contain is dead weight, and dead weight in a
 * size-budgeted artifact is a cost with no benefit.
 */

import { checkProvenance, type ManifestSet } from './provenance/manifest.js';
import type { CompiledOntology } from './importers/ontologyImporter.js';
import type { CrossReferenceRow, TopicAnchorRow } from './importers/openbibleImporter.js';
import { scoreToWeight } from './importers/openbibleImporter.js';
import type { SqliteDatabase } from './buildCorpus.js';

export interface ConceptLayerInput {
  readonly ontology: CompiledOntology;
  readonly topicRows: readonly TopicAnchorRow[];
  readonly crossReferences: readonly CrossReferenceRow[];
  readonly manifests: ManifestSet;
  /** Verse ids present in this artifact; anything outside is dropped. */
  readonly presentVerseIds: ReadonlySet<number>;
  /** Layer B distillate. Empty until expositions are ingested. */
  readonly passageTerms?: readonly {
    startVerseId: number;
    endVerseId: number;
    term: string;
    pmi: number;
    count: number;
    sourceId: string;
    locator: string;
  }[];
}

export interface ConceptLayerResult {
  readonly concepts: number;
  readonly lexiconEntries: number;
  readonly editorialAnchors: number;
  readonly topicAnchors: number;
  readonly crossReferences: number;
  readonly passageTerms: number;
  readonly droppedOutOfCorpus: number;
}

/** True when any verse of the range exists in this artifact. */
function rangeIsPresent(
  start: number,
  end: number,
  present: ReadonlySet<number>,
): boolean {
  if (present.has(start) || present.has(end)) return true;
  // Ranges are small in practice; a bounded scan beats materializing them.
  for (let id = start; id <= end && id - start < 400; id += 1) {
    if (present.has(id)) return true;
  }
  return false;
}

export function buildConceptLayer(
  database: SqliteDatabase,
  input: ConceptLayerInput,
): ConceptLayerResult {
  // G1 runs BEFORE a single row is written. A build that would ship
  // unattributable rows must fail, not produce an artifact somebody then has
  // to remember not to release.
  const topicCited = input.ontology.topicSubscriptions.length > 0 ? ['openbible-topics'] : [];
  const xrefCited = input.crossReferences.length > 0 ? ['openbible-xrefs'] : [];
  const termCited = [
    ...new Set((input.passageTerms ?? []).flatMap((term) => term.sourceId.split('+'))),
  ];
  const failures = checkProvenance({
    manifests: input.manifests,
    citedSourceIds: [
      ...input.ontology.citedSourceIds,
      ...topicCited,
      ...xrefCited,
      ...termCited,
    ],
    tier: 'public_distribution',
  });
  if (failures.length > 0) {
    throw new Error(`buildConceptLayer: provenance check failed:\n  ${failures.join('\n  ')}`);
  }

  const insertConcept = database.prepare('INSERT INTO concepts(id, label) VALUES (?, ?)');
  const insertLexicon = database.prepare(
    'INSERT INTO concept_lexicon(concept_id, phrase, normalized, token_count) VALUES (?, ?, ?, ?)',
  );
  const insertAnchor = database.prepare(
    `INSERT INTO concept_anchors(concept_id, start_verse_id, end_verse_id, source_id, weight, locator)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const insertRelated = database.prepare(
    'INSERT INTO concept_related(concept_id, related_id) VALUES (?, ?)',
  );
  const insertPassageTerm = database.prepare(
    `INSERT INTO passage_terms(start_verse_id, end_verse_id, term, pmi, count, source_id, locator)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertXref = database.prepare(
    `INSERT INTO cross_references(from_verse_id, to_start_verse_id, to_end_verse_id, source_id, votes)
     VALUES (?, ?, ?, ?, ?)`,
  );

  let editorialAnchors = 0;
  let topicAnchors = 0;
  let crossReferences = 0;
  let passageTerms = 0;
  let dropped = 0;

  database.exec('BEGIN');
  try {
    for (const concept of input.ontology.concepts) {
      insertConcept.run(concept.id, concept.label);
    }
    for (const entry of input.ontology.lexicon) {
      insertLexicon.run(entry.conceptId, entry.phrase, entry.normalized, entry.tokenCount);
    }
    for (const edge of input.ontology.related) {
      insertRelated.run(edge.conceptId, edge.relatedId);
    }

    for (const anchor of input.ontology.anchors) {
      if (!rangeIsPresent(anchor.startVerseId, anchor.endVerseId, input.presentVerseIds)) {
        dropped += 1;
        continue;
      }
      insertAnchor.run(
        anchor.conceptId,
        anchor.startVerseId,
        anchor.endVerseId,
        anchor.sourceId,
        anchor.weight,
        anchor.locator,
      );
      editorialAnchors += 1;
    }

    // Topic subscriptions: a concept opts into a named OpenBible topic, and
    // that topic's voted passages become anchors CITING OPENBIBLE — never
    // laundered into editorial anchors.
    const rowsByTopic = new Map<string, TopicAnchorRow[]>();
    for (const row of input.topicRows) {
      const bucket = rowsByTopic.get(row.topic);
      if (bucket) bucket.push(row);
      else rowsByTopic.set(row.topic, [row]);
    }
    for (const subscription of input.ontology.topicSubscriptions) {
      for (const row of rowsByTopic.get(subscription.topic) ?? []) {
        if (!rangeIsPresent(row.startVerseId, row.endVerseId, input.presentVerseIds)) {
          dropped += 1;
          continue;
        }
        const weight = scoreToWeight(row.score);
        if (weight <= 0) continue;
        insertAnchor.run(
          subscription.conceptId,
          row.startVerseId,
          row.endVerseId,
          'openbible-topics',
          weight,
          `topic: ${subscription.topic}`,
        );
        topicAnchors += 1;
      }
    }

    for (const edge of input.crossReferences) {
      if (!input.presentVerseIds.has(edge.fromVerseId)) {
        dropped += 1;
        continue;
      }
      if (!rangeIsPresent(edge.toStartVerseId, edge.toEndVerseId, input.presentVerseIds)) {
        dropped += 1;
        continue;
      }
      insertXref.run(
        edge.fromVerseId,
        edge.toStartVerseId,
        edge.toEndVerseId,
        'openbible-xrefs',
        edge.votes,
      );
      crossReferences += 1;
    }
    for (const term of input.passageTerms ?? []) {
      if (!rangeIsPresent(term.startVerseId, term.endVerseId, input.presentVerseIds)) {
        dropped += 1;
        continue;
      }
      insertPassageTerm.run(
        term.startVerseId,
        term.endVerseId,
        term.term,
        term.pmi,
        term.count,
        term.sourceId,
        term.locator,
      );
      passageTerms += 1;
    }
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }

  return {
    concepts: input.ontology.concepts.length,
    lexiconEntries: input.ontology.lexicon.length,
    editorialAnchors,
    topicAnchors,
    crossReferences,
    passageTerms,
    droppedOutOfCorpus: dropped,
  };
}
