/**
 * Writes Layer A (concepts) and the cross-reference graph into the artifact.
 *
 * Runs after the scripture corpus exists, because both layers are filtered
 * against the verses actually present: an anchor or edge pointing at a verse
 * this artifact does not contain is dead weight, and dead weight in a
 * size-budgeted artifact is a cost with no benefit.
 */

import { createHash } from 'node:crypto';

import { checkProvenance, type ManifestSet } from './provenance/manifest.js';
import type { CompiledOntology } from './importers/ontologyImporter.js';
import type { CrossReferenceRow, TopicAnchorRow } from './importers/openbibleImporter.js';
import { scoreToWeight } from './importers/openbibleImporter.js';
import type { SqliteDatabase } from './buildCorpus.js';
import type { PericopeRow } from './buildPericopes.js';

export interface ConceptLayerInput {
  readonly ontology: CompiledOntology;
  readonly topicRows: readonly TopicAnchorRow[];
  readonly crossReferences: readonly CrossReferenceRow[];
  /**
   * Derived pericope tiling (schema v8, CO-3 PR 1) — ALREADY derived over
   * this artifact's present verses by buildPericopes.ts; inserted verbatim
   * and fed per-record into the layer fingerprint, because a re-tiled
   * corpus returns differently-grouped results once PR 2 lands and a
   * consumer must be able to tell that happened.
   */
  readonly pericopes?: readonly PericopeRow[];
  readonly manifests: ManifestSet;
  /** Verse ids present in this artifact; anything outside is dropped. */
  readonly presentVerseIds: ReadonlySet<number>;
  /**
   * Cross-translation vocabulary, verse-keyed. Stems only — see schema.ts.
   * Empty when the derived index has not been generated.
   */
  readonly translationTokens?: ReadonlyMap<number, readonly string[]>;
  /** Layer B distillate, verse-keyed. Empty until expositions are ingested. */
  readonly verseTerms?: readonly {
    verseId: number;
    term: string;
    pmi: number;
    count: number;
    sourceIds: string;
    authorCount: number;
    minSpanVerses: number;
    locator: string;
  }[];
}

export interface ConceptLayerResult {
  readonly concepts: number;
  readonly lexiconEntries: number;
  readonly editorialAnchors: number;
  readonly topicAnchors: number;
  readonly crossReferences: number;
  readonly pericopes: number;
  readonly verseTerms: number;
  readonly translationTokens: number;
  readonly droppedOutOfCorpus: number;
  /**
   * Identifies everything in the curated layers that can change a result.
   *
   * The corpus fingerprint covers scripture text only, so before this existed
   * an ontology edit altered rankings while both published identities stayed
   * the same — which made the reproducibility contract
   * (engineVersion, corpusFingerprint, query) -> identical ordering
   * quietly false. Consumers must pin this too.
   */
  readonly layerFingerprint: string;
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
  const pericopeCited = (input.pericopes ?? []).length > 0 ? ['openbible-sections'] : [];
  const termCited = [
    ...new Set((input.verseTerms ?? []).flatMap((term) => term.sourceIds.split('+'))),
  ];
  const failures = checkProvenance({
    manifests: input.manifests,
    citedSourceIds: [
      ...input.ontology.citedSourceIds,
      ...topicCited,
      ...xrefCited,
      ...pericopeCited,
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
  const insertTranslationToken = database.prepare(
    'INSERT INTO verse_translation_tokens(verse_id, token) VALUES (?, ?)',
  );
  const insertVerseTerm = database.prepare(
    `INSERT INTO verse_terms(verse_id, term, pmi, count, source_ids, author_count,
                             min_span_verses, locator)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertXref = database.prepare(
    `INSERT INTO cross_references(from_verse_id, to_start_verse_id, to_end_verse_id, source_id, votes)
     VALUES (?, ?, ?, ?, ?)`,
  );
  const insertPericope = database.prepare(
    `INSERT INTO pericopes(start_verse_id, end_verse_id, boundary_votes, source_id)
     VALUES (?, ?, ?, ?)`,
  );

  let editorialAnchors = 0;
  let topicAnchors = 0;
  let crossReferences = 0;
  let pericopes = 0;
  let verseTerms = 0;
  let translationTokens = 0;
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
    // Pericope rows are derived over the present verses upstream
    // (buildPericopes.ts checks its tiling invariants there), so they are
    // inserted verbatim — a drop here would silently break the tiling.
    for (const pericope of input.pericopes ?? []) {
      insertPericope.run(
        pericope.startVerseId,
        pericope.endVerseId,
        pericope.boundaryVotes,
        'openbible-sections',
      );
      pericopes += 1;
    }
    for (const term of input.verseTerms ?? []) {
      if (!input.presentVerseIds.has(term.verseId)) {
        dropped += 1;
        continue;
      }
      insertVerseTerm.run(
        term.verseId,
        term.term,
        term.pmi,
        term.count,
        term.sourceIds,
        term.authorCount,
        term.minSpanVerses,
        term.locator,
      );
      verseTerms += 1;
    }
    for (const [verseId, tokens] of input.translationTokens ?? new Map()) {
      if (!input.presentVerseIds.has(verseId)) {
        dropped += 1;
        continue;
      }
      for (const token of tokens) {
        insertTranslationToken.run(verseId, token);
        translationTokens += 1;
      }
    }
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }

  // Length-delimited canonical stream, same discipline as the corpus
  // fingerprint: without length prefixes, differently-split fields could hash
  // identically and the fingerprint would not be evidence of anything.
  const hash = createHash('sha256');
  const feed = (parts: readonly (string | number)[]): void => {
    const record = parts.join(' ');
    hash.update(String(record.length));
    hash.update(' ');
    hash.update(record);
  };
  for (const concept of [...input.ontology.concepts].sort((a, b) => (a.id < b.id ? -1 : 1))) {
    feed(['c', concept.id, concept.label]);
  }
  for (const entry of [...input.ontology.lexicon].sort((a, b) =>
    a.conceptId !== b.conceptId
      ? a.conceptId < b.conceptId
        ? -1
        : 1
      : a.normalized < b.normalized
        ? -1
        : 1,
  )) {
    feed(['l', entry.conceptId, entry.normalized]);
  }
  for (const anchor of [...input.ontology.anchors].sort((a, b) =>
    a.conceptId !== b.conceptId
      ? a.conceptId < b.conceptId
        ? -1
        : 1
      : a.startVerseId - b.startVerseId || (a.sourceId < b.sourceId ? -1 : 1),
  )) {
    feed(['a', anchor.conceptId, anchor.startVerseId, anchor.endVerseId, anchor.sourceId, anchor.weight]);
  }
  for (const edge of [...input.ontology.related].sort((a, b) =>
    a.conceptId !== b.conceptId ? (a.conceptId < b.conceptId ? -1 : 1) : a.relatedId < b.relatedId ? -1 : 1,
  )) {
    feed(['r', edge.conceptId, edge.relatedId]);
  }
  // Pericope rows join the fingerprint PER-RECORD (CO-3 PR 1): the derived
  // tiling is a deterministic function of (source rows, threshold, present
  // verses), and a change to any of the three — a re-rolled upstream file,
  // a threshold edit, a corpus change — re-groups results once PR 2 lands.
  // Rows arrive already sorted by verse id from the derivation; sorted again
  // here so the fingerprint never depends on a caller's ordering.
  for (const pericope of [...(input.pericopes ?? [])].sort(
    (a, b) => a.startVerseId - b.startVerseId,
  )) {
    feed(['p', pericope.startVerseId, pericope.endVerseId, pericope.boundaryVotes]);
  }
  // translationTokens joins the fingerprint because it changes RESULTS:
  // admitting another translation's vocabulary makes verses reachable that
  // were not before, and a consumer must be able to tell that happened.
  // The pericope count joined in the same move (CO-3 PR 1) — this widening
  // moves EVERY layer fingerprint once, sanctioned and baselined in-train.
  feed(['counts', topicAnchors, crossReferences, verseTerms, translationTokens, pericopes]);
  const layerFingerprint = hash.digest('hex');

  // Written with REPLACE because the corpus build already populated meta.
  database
    .prepare('INSERT OR REPLACE INTO meta(key, value) VALUES (?, ?)')
    .run('layer_fingerprint', layerFingerprint);

  return {
    layerFingerprint,
    concepts: input.ontology.concepts.length,
    lexiconEntries: input.ontology.lexicon.length,
    editorialAnchors,
    topicAnchors,
    crossReferences,
    pericopes,
    verseTerms,
    translationTokens,
    droppedOutOfCorpus: dropped,
  };
}
