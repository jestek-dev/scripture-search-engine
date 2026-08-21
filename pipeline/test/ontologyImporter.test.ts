/**
 * A concept must not list the same anchor range twice.
 *
 * The engine SUMS anchor rows, so a duplicate entry double-counts a passage —
 * the case that forced this: peace-of-god listed 1 Peter 5:7 under torrey
 * (0.75) and again under editorial (0.85), and the summed 1.6 outranked the
 * concept's own 1.0 anchor for the bare query "peace". The importer now
 * rejects the shape at compile time, which fails G4 before any artifact can
 * carry the double count.
 *
 * Multi-source SINGLE entries stay legal: `sources: [torrey, editorial]` is
 * provenance, not duplication. Overlapping-but-not-identical ranges are a
 * separate reporting concern that lands with `ranking-fixes`.
 */

import { describe, expect, it } from 'vitest';

import { compileOntology } from '../src/importers/ontologyImporter.js';

function concept(name: string, contents: string): { name: string; contents: string } {
  return { name, contents };
}

const DUPLICATE_RANGE = concept(
  'peace.yaml',
  `id: peace-test
label: Peace Test
lexicon:
  - peace
anchors:
  - ref: 1 Peter 5:7
    sources: [torrey]
    weight: 0.75
  - ref: 1 Peter 5:7
    sources: [editorial]
    weight: 0.85
`,
);

describe('compileOntology duplicate-anchor guard', () => {
  it('rejects a second anchor entry resolving to an identical range', () => {
    const { errors } = compileOntology([DUPLICATE_RANGE]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('peace-test');
    expect(errors[0]).toContain('1 Peter 5:7');
    expect(errors[0]).toContain('same range');
  });

  it('keeps only the first entry of a duplicated range in the compiled rows', () => {
    const { ontology } = compileOntology([DUPLICATE_RANGE]);
    const rows = ontology.anchors.filter((anchor) => anchor.conceptId === 'peace-test');
    expect(rows).toHaveLength(1);
    expect(rows[0]!.sourceId).toBe('torrey');
    expect(rows[0]!.weight).toBe(0.75);
  });

  it('catches duplicates spelled differently when they resolve to one range', () => {
    const { errors } = compileOntology([
      concept(
        'spelled.yaml',
        `id: spelled-test
label: Spelled Test
lexicon:
  - refuge
anchors:
  - ref: Psalms 46:1
    sources: [editorial]
  - ref: Psalm 46:1
    sources: [torrey]
`,
      ),
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('"Psalm 46:1" resolves to the same range as anchor "Psalms 46:1"');
  });

  it('accepts a single entry citing multiple sources (provenance, not duplication)', () => {
    const { ontology, errors } = compileOntology([
      concept(
        'multi.yaml',
        `id: multi-test
label: Multi Test
lexicon:
  - peace
anchors:
  - ref: 1 Peter 5:7
    sources: [torrey, editorial]
    weight: 0.75
`,
      ),
    ]);
    expect(errors).toHaveLength(0);
    const rows = ontology.anchors.filter((anchor) => anchor.conceptId === 'multi-test');
    expect(rows.map((row) => row.sourceId)).toEqual(['torrey', 'editorial']);
    // Both rows describe the SAME entry: identical range and weight.
    expect(new Set(rows.map((row) => `${row.startVerseId}:${row.endVerseId}:${row.weight}`)).size).toBe(1);
  });

  it('does not flag overlapping-but-not-identical ranges (reported later by ranking-fixes)', () => {
    const { errors } = compileOntology([
      concept(
        'overlap.yaml',
        `id: overlap-test
label: Overlap Test
lexicon:
  - anxious
anchors:
  - ref: Philippians 4:6-7
    sources: [editorial]
  - ref: Philippians 4:6
    sources: [torrey]
`,
      ),
    ]);
    expect(errors).toHaveLength(0);
  });

  it('tracks seen ranges per concept, not globally', () => {
    const shared = (id: string) => concept(
      `${id}.yaml`,
      `id: ${id}
label: ${id}
lexicon:
  - peace
anchors:
  - ref: 1 Peter 5:7
    sources: [editorial]
`,
    );
    const { errors } = compileOntology([shared('first-test'), shared('second-test')]);
    expect(errors).toHaveLength(0);
  });

  it('does not report a duplicate against an entry that itself failed to compile', () => {
    const { errors } = compileOntology([
      concept(
        'broken.yaml',
        `id: broken-test
label: Broken Test
lexicon:
  - peace
anchors:
  - ref: 1 Peter 5:7
    sources: []
  - ref: 1 Peter 5:7
    sources: [torrey]
`,
      ),
    ]);
    // The sourceless entry is its own error; the second entry is then the
    // FIRST valid claim on the range, not a duplicate of a rejected one.
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('declares no sources');
  });
});

describe('compileOntology repeated-token lexicon invariant', () => {
  // The engine's full-query parity (0.10.0 stage 3) assumes a phrase's stored
  // tokenCount counts DISTINCT tokens. The shared tokenizer's
  // significantWords() deduplicates by construction (pinned in
  // engine/test/tokenizer.test.ts), so the importer's repeated-token error is
  // unreachable today; it exists to fail closed under tokenizer drift. These
  // tests keep the distinctness a checked invariant rather than a property of
  // today's data.
  it('stores deduplicated tokens for a phrase whose surface form repeats a word', () => {
    const { errors, ontology } = compileOntology([
      concept(
        'lex-repeat.yaml',
        `id: lex-repeat-test
label: Lex Repeat Test
lexicon:
  - an eye for an eye
`,
      ),
    ]);
    expect(errors).toHaveLength(0);
    const rows = ontology.lexicon.filter((entry) => entry.conceptId === 'lex-repeat-test');
    expect(rows).toHaveLength(1);
    // The stored form is the deduplicated one, and tokenCount counts it —
    // NOT the surface form's two occurrences of "eye". This is exactly the
    // count parity compares against the query's (also deduplicated) tokens.
    expect(rows[0]!.normalized).toBe('eye');
    expect(rows[0]!.tokenCount).toBe(1);
  });

  it('keeps phrases whose normalized tokens are distinct, however many stopwords repeat', () => {
    const { errors, ontology } = compileOntology([
      concept(
        'lex-distinct.yaml',
        `id: lex-distinct-test
label: Lex Distinct Test
lexicon:
  - the peace of the God of the hope
  - be doers of the word
`,
      ),
    ]);
    // Stopwords may repeat freely ("the" and "of" above); only a repeated
    // SIGNIFICANT token is the hazard. What normalization keeps is the
    // tokenizer's call, so assert via the compiled rows rather than guessing.
    const rows = ontology.lexicon.filter((entry) => entry.conceptId === 'lex-distinct-test');
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const tokens = row.normalized.split(' ');
      expect(new Set(tokens).size).toBe(tokens.length);
    }
    expect(errors.filter((error) => error.includes('repeated token'))).toHaveLength(0);
  });
});
