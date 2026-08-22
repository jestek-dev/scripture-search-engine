/**
 * The doctrinal-guardrail red-flag checks (DOCTRINAL-BASIS.md §5).
 *
 * Three behaviours matter and each is pinned here: the checks FIRE on a
 * synthetic violation, stay SILENT on the repository's current data (the
 * 2026-08-15 audit found zero violations — the checks protect future
 * additions), and never report pass without having run (missing or broken
 * data files warn loudly). Firing is verified with synthetic data only —
 * never by mutating real reviewed data.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  compileOntology,
  parseAnchorRef,
  type CompiledAnchor,
} from '../../pipeline/src/importers/ontologyImporter.js';
import {
  parseDoctrinalReviews,
  parseFlaggedPairings,
} from '../../pipeline/src/importers/doctrinalReviews.js';
import {
  doctrinalReviewRecordsCheck,
  flaggedPairingsCheck,
} from '../src/gates/doctrinalGuardrail.js';
import { decideVerdict } from '../src/report.js';
import { mergeGateResults } from '../src/gates/merge.js';
import { pass } from '../src/gates/types.js';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function realManifestIds(): string[] {
  const directory = join(REPO_ROOT, 'pipeline', 'manifests');
  return readdirSync(directory)
    .filter((name) => name.endsWith('.json'))
    .map((name) => (JSON.parse(readFileSync(join(directory, name), 'utf8')) as { id: string }).id);
}

function realReviewsYaml(): string {
  return readFileSync(join(REPO_ROOT, 'ontology', 'doctrinal-reviews.yaml'), 'utf8');
}

function realWatchlistYaml(): string {
  return readFileSync(join(REPO_ROOT, 'ontology', 'flagged-pairings.yaml'), 'utf8');
}

function realOntology() {
  const directory = join(REPO_ROOT, 'ontology', 'concepts');
  const files = readdirSync(directory)
    .filter((name) => name.endsWith('.yaml'))
    .sort()
    .map((name) => ({ name, contents: readFileSync(join(directory, name), 'utf8') }));
  return compileOntology(files);
}

function reviewRow(source: string): string {
  return [
    `  - source: ${source}`,
    '    reviewedAt: "2026-08-15"',
    '    reviewer: "synthetic test reviewer"',
    '    verdict: compatible',
    '    criteria: ["DOCTRINAL-BASIS.md §3"]',
  ].join('\n');
}

function anchorFor(conceptId: string, ref: string, sourceId = 'editorial'): CompiledAnchor {
  const range = parseAnchorRef(ref);
  if (!range) throw new Error(`test reference did not parse: ${ref}`);
  return {
    conceptId,
    startVerseId: range.start,
    endVerseId: range.end,
    sourceId,
    weight: 1,
    locator: null,
  };
}

const SYNTHETIC_WATCHLIST = [
  'materialFrameKeywords:',
  '  - wealth',
  '  - financial',
  '  - breakthrough',
  'watchlist:',
  '  - ref: "Malachi 3:10"',
  '    concern: "Tithe-transaction proof-text recruited as return-on-giving."',
  '  - ref: "Mark 11:24"',
  '    concern: "Ask-believing recruited as a claim-it guarantee."',
].join('\n');

describe('doctrinal review records check (merged into G1)', () => {
  it('passes on the real repository data — every manifest has a row, no orphans', () => {
    const ids = realManifestIds();
    expect(ids.length).toBe(20);
    const result = doctrinalReviewRecordsCheck(ids, realReviewsYaml());
    expect(result.status).toBe('pass');
    expect(result.summary).toContain('all 20 source(s)');
    expect(result.metrics?.['doctrinalReviewFlags']).toBe(0);
  });

  it('raises a red flag naming a source that has no review row', () => {
    const contents = `reviews:\n${reviewRow('barnes')}\n`;
    const result = doctrinalReviewRecordsCheck(['barnes', 'unreviewed-source'], contents);
    expect(result.status).toBe('warn');
    const messages = (result.findings ?? []).map((finding) => finding.message);
    expect(messages.some((message) => message.includes('DOCTRINAL RED FLAG') && message.includes('"unreviewed-source"'))).toBe(true);
  });

  it('raises a red flag for an orphaned review row that names no manifest', () => {
    const contents = `reviews:\n${reviewRow('barnes')}\n${reviewRow('renamed-away')}\n`;
    const result = doctrinalReviewRecordsCheck(['barnes'], contents);
    expect(result.status).toBe('warn');
    expect(
      (result.findings ?? []).some(
        (finding) => finding.message.includes('"renamed-away"') && finding.message.includes('orphaned'),
      ),
    ).toBe(true);
  });

  it('never silently passes when the records file is missing', () => {
    const result = doctrinalReviewRecordsCheck(['barnes'], null);
    expect(result.status).toBe('warn');
    expect(result.summary).toContain('did not run');
    expect((result.findings ?? []).length).toBeGreaterThan(0);
  });

  it('never silently passes when the records file is unparseable', () => {
    const result = doctrinalReviewRecordsCheck(['barnes'], 'reviews: [{source: barnes, verdict: theology-is-great}]');
    expect(result.status).toBe('warn');
    expect(result.summary).toContain('did not run');
  });

  it('is not-applicable, with the reason, before any source is admitted', () => {
    const result = doctrinalReviewRecordsCheck([], realReviewsYaml());
    expect(result.status).toBe('not-applicable');
    expect(result.summary).toContain('no source manifests admitted yet');
  });

  it('rejects a verdict outside the mechanical vocabulary — no theology scores', () => {
    const contents = [
      'reviews:',
      '  - source: barnes',
      '    reviewedAt: "2026-08-15"',
      '    reviewer: "synthetic"',
      '    verdict: doctrinally-excellent',
      '    criteria: ["DOCTRINAL-BASIS.md §3"]',
    ].join('\n');
    const { errors } = parseDoctrinalReviews(contents);
    expect(errors.some((error) => error.includes('never a theology score'))).toBe(true);
  });

  it('requires a stated bound for admissible-with-bound', () => {
    const contents = [
      'reviews:',
      '  - source: openbible-topics',
      '    reviewedAt: "2026-08-15"',
      '    reviewer: "synthetic"',
      '    verdict: admissible-with-bound',
      '    criteria: ["DOCTRINAL-BASIS.md §3"]',
    ].join('\n');
    const { errors } = parseDoctrinalReviews(contents);
    expect(errors.some((error) => error.includes('requires a stated bound'))).toBe(true);
  });
});

describe('flagged pairings check (merged into G4)', () => {
  it('is silent on the real repository data — the 2026-08-15 audit found zero pairings', () => {
    const { ontology, errors } = realOntology();
    expect(errors).toEqual([]);
    const result = flaggedPairingsCheck({
      concepts: ontology.concepts.map((concept) => ({ ...concept, lexicon: [] })),
      anchors: ontology.anchors,
      ontologyCompiled: true,
      watchlistFileContents: realWatchlistYaml(),
    });
    expect(result.status).toBe('pass');
    expect(result.metrics?.['doctrinalPairingFlags']).toBe(0);
    // The pass proves it ran: the summary reports what was actually scanned.
    expect(result.summary).toMatch(/scanned \d+ anchor\(s\) against \d+ watchlist reference\(s\)/);
    expect(result.metrics?.['doctrinalScannedAnchors']).toBeGreaterThan(0);
  });

  it('is silent on the real data including real lexicons', () => {
    const { ontology } = realOntology();
    const lexiconByConcept = new Map<string, string[]>();
    for (const entry of ontology.lexicon) {
      lexiconByConcept.set(entry.conceptId, [...(lexiconByConcept.get(entry.conceptId) ?? []), entry.phrase]);
    }
    const result = flaggedPairingsCheck({
      concepts: ontology.concepts.map((concept) => ({
        ...concept,
        lexicon: lexiconByConcept.get(concept.id) ?? [],
      })),
      anchors: ontology.anchors,
      ontologyCompiled: true,
      watchlistFileContents: realWatchlistYaml(),
    });
    expect(result.status).toBe('pass');
  });

  it('fires on a synthetic material-framed concept anchoring a watchlist verse', () => {
    const result = flaggedPairingsCheck({
      concepts: [
        {
          id: 'financial-breakthrough',
          label: 'Financial breakthrough',
          lexicon: ['sow a seed', 'hundredfold return'],
        },
      ],
      anchors: [anchorFor('financial-breakthrough', 'Malachi 3:10')],
      ontologyCompiled: true,
      watchlistFileContents: SYNTHETIC_WATCHLIST,
    });
    expect(result.status).toBe('warn');
    const message = result.findings?.[0]?.message ?? '';
    expect(message).toContain('DOCTRINAL RED FLAG');
    expect(message).toContain('financial-breakthrough');
    expect(message).toContain('Malachi 3:10');
    expect(message).toContain('DOCTRINAL-BASIS.md §3');
  });

  it('fires when the material vocabulary is only in the lexicon', () => {
    const result = flaggedPairingsCheck({
      concepts: [{ id: 'gods-gifts', label: 'Gifts of God', lexicon: ['financial blessing'] }],
      anchors: [anchorFor('gods-gifts', 'Mark 11:24')],
      ontologyCompiled: true,
      watchlistFileContents: SYNTHETIC_WATCHLIST,
    });
    expect(result.status).toBe('warn');
    expect(result.findings?.[0]?.message).toContain('financial');
  });

  it('does NOT fire when a non-material concept anchors a watchlist verse — the verse is never the problem', () => {
    const result = flaggedPairingsCheck({
      concepts: [{ id: 'prayer', label: 'Prayer', lexicon: ['ask in faith', 'pray believing'] }],
      anchors: [anchorFor('prayer', 'Mark 11:24')],
      ontologyCompiled: true,
      watchlistFileContents: SYNTHETIC_WATCHLIST,
    });
    expect(result.status).toBe('pass');
    expect(result.metrics?.['doctrinalPairingFlags']).toBe(0);
  });

  it('reports not-applicable with the reason when the ontology failed to compile', () => {
    const result = flaggedPairingsCheck({
      concepts: [],
      anchors: [],
      ontologyCompiled: false,
      watchlistFileContents: SYNTHETIC_WATCHLIST,
    });
    expect(result.status).toBe('not-applicable');
    expect(result.summary).toContain('ontology failed to compile');
  });

  it('never silently passes when the watchlist file is missing or unparseable', () => {
    const missing = flaggedPairingsCheck({
      concepts: [],
      anchors: [],
      ontologyCompiled: true,
      watchlistFileContents: null,
    });
    expect(missing.status).toBe('warn');
    expect(missing.summary).toContain('did not run');

    const broken = flaggedPairingsCheck({
      concepts: [],
      anchors: [],
      ontologyCompiled: true,
      watchlistFileContents: 'watchlist:\n  - ref: "Not A Book 1:1"\n    concern: "x"',
    });
    expect(broken.status).toBe('warn');
    expect(broken.summary).toContain('did not run');
  });

  it('rejects a watchlist whose keywords are not single lowercase words', () => {
    const { errors } = parseFlaggedPairings(
      'materialFrameKeywords:\n  - "Money Talks"\nwatchlist:\n  - ref: "Malachi 3:10"\n    concern: "x"',
    );
    expect(errors.some((error) => error.includes('single lowercase word'))).toBe(true);
  });
});

describe('a doctrinal flag never flips the verdict', () => {
  it('a firing check merged into its gate yields ADMIT_WITH_WARNINGS, never REJECT — the G1b shape', () => {
    const firing = flaggedPairingsCheck({
      concepts: [{ id: 'wealth-transfer', label: 'Wealth transfer', lexicon: ['end-time wealth'] }],
      anchors: [anchorFor('wealth-transfer', 'Malachi 3:10')],
      ontologyCompiled: true,
      watchlistFileContents: SYNTHETIC_WATCHLIST,
    });
    expect(firing.status).toBe('warn');
    const merged = mergeGateResults('Concept collision', [
      pass('G4-collision', 'Concept collision', 'no collisions'),
      firing,
    ]);
    expect(merged.status).toBe('warn');
    expect(decideVerdict({ gates: [merged] })).toBe('ADMIT_WITH_WARNINGS');
  });

  it('a silent check keeps the merged gate passing and the verdict ADMIT', () => {
    const silent = flaggedPairingsCheck({
      concepts: [{ id: 'prayer', label: 'Prayer', lexicon: ['pray'] }],
      anchors: [],
      ontologyCompiled: true,
      watchlistFileContents: SYNTHETIC_WATCHLIST,
    });
    const merged = mergeGateResults('Concept collision', [
      pass('G4-collision', 'Concept collision', 'no collisions'),
      silent,
    ]);
    expect(merged.status).toBe('pass');
    expect(decideVerdict({ gates: [merged] })).toBe('ADMIT');
  });
});
