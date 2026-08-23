import { describe, expect, it } from 'vitest';

import type { ConceptRecord } from '../src/gates/collision.js';
import { lexiconInventoryCheck, LEXICON_INVENTORY_PATH } from '../src/gates/lexiconInventory.js';

function concept(id: string, lexicon: string[]): ConceptRecord {
  return { id, label: id, lexicon };
}

/** A minimal well-formed inventory document. */
function inventory(rows: string): string {
  return `concepts:\n${rows}`;
}

describe('G4 lexicon bare-word inventory', () => {
  const WORSHIP = concept('worship', ['worship the lord', 'worship', 'bow down before him']);

  it('passes when every concept has a row and every decision matches behaviour', () => {
    const result = lexiconInventoryCheck({
      concepts: [WORSHIP],
      inventoryFileContents: inventory('  - id: worship\n    admitted: [worship, bow]\n'),
    });
    expect(result.status).toBe('pass');
    expect(result.findings ?? []).toHaveLength(0);
    expect(result.metrics).toMatchObject({ inventoryRows: 1, admittedBareWords: 2 });
  });

  it('BLOCKS a concept with no inventory row — a pack cannot ship without a bare-word decision', () => {
    const result = lexiconInventoryCheck({
      concepts: [WORSHIP, concept('praise', ['praise the lord', 'praise'])],
      inventoryFileContents: inventory('  - id: worship\n    admitted: [worship, bow]\n'),
    });
    expect(result.status).toBe('fail');
    expect(result.findings?.some((finding) => finding.message.includes('praise: no row'))).toBe(true);
  });

  it('BLOCKS a row for a concept that does not exist', () => {
    const result = lexiconInventoryCheck({
      concepts: [WORSHIP],
      inventoryFileContents: inventory(
        '  - id: worship\n    admitted: [worship, bow]\n' +
          '  - id: healing\n    admitted: [healing]\n',
      ),
    });
    expect(result.status).toBe('fail');
    const message = result.findings?.map((finding) => finding.message).join('\n') ?? '';
    // The keying trap is named: rows key by compiled id, not filename.
    expect(message).toContain('no concept "healing" compiles');
    expect(message).toContain('never by filename');
  });

  it('BLOCKS an admitted token that does not fire', () => {
    const result = lexiconInventoryCheck({
      concepts: [concept('holiness', ['be holy', 'pursue holiness'])],
      inventoryFileContents: inventory('  - id: holiness\n    admitted: [holy, holiness]\n'),
    });
    expect(result.status).toBe('fail');
    expect(
      result.findings?.some((finding) => finding.message.includes('"holiness" (token "holiness") does not fire')),
    ).toBe(true);
  });

  it('BLOCKS a skipped token that DOES fire — the 2026-08-08 accident class', () => {
    const result = lexiconInventoryCheck({
      // "god with us" collapses to the single token "god".
      concepts: [concept('presence-of-god', ['god with us', 'in your presence'])],
      inventoryFileContents: inventory(
        '  - id: presence-of-god\n' +
          '    admitted: [presence]\n' +
          '    skipped:\n' +
          '      - token: god\n' +
          '        reason: removed 2026-08-08; must not return\n',
      ),
    });
    expect(result.status).toBe('fail');
    expect(
      result.findings?.some((finding) => finding.message.includes('skipped "god" (token "god") FIRES')),
    ).toBe(true);
  });

  it('BLOCKS an empty skip reason via the parser', () => {
    const result = lexiconInventoryCheck({
      concepts: [WORSHIP],
      inventoryFileContents: inventory(
        '  - id: worship\n' +
          '    admitted: [worship, bow]\n' +
          '    skipped:\n' +
          '      - token: sing\n' +
          '        reason: ""\n',
      ),
    });
    expect(result.status).toBe('fail');
    expect(
      result.findings?.some((finding) => finding.message.includes('reason must be a non-empty explanation')),
    ).toBe(true);
  });

  it('BLOCKS a token that is both admitted and skipped', () => {
    const result = lexiconInventoryCheck({
      concepts: [WORSHIP],
      inventoryFileContents: inventory(
        '  - id: worship\n' +
          '    admitted: [worship]\n' +
          '    skipped:\n' +
          '      - token: worship\n' +
          '        reason: contradicts the admitted list\n',
      ),
    });
    expect(result.status).toBe('fail');
    expect(result.findings?.some((finding) => finding.message.includes('both admitted and skipped'))).toBe(true);
  });

  it('BLOCKS an admitted entry that is not one significant token', () => {
    const result = lexiconInventoryCheck({
      concepts: [WORSHIP],
      inventoryFileContents: inventory('  - id: worship\n    admitted: [worship, the]\n'),
    });
    expect(result.status).toBe('fail');
    expect(
      result.findings?.some((finding) => finding.message.includes('does not normalize to one significant token')),
    ).toBe(true);
  });

  it('fails closed when the inventory file is missing', () => {
    const result = lexiconInventoryCheck({
      concepts: [WORSHIP],
      inventoryFileContents: null,
    });
    expect(result.status).toBe('fail');
    expect(result.summary).toContain(LEXICON_INVENTORY_PATH);
  });

  it('REPORTS (never blocks) a firing token with no recorded decision', () => {
    const result = lexiconInventoryCheck({
      // "bow down before him" collapses to "bow", which the row omits.
      concepts: [WORSHIP],
      inventoryFileContents: inventory('  - id: worship\n    admitted: [worship]\n'),
    });
    expect(result.status).toBe('pass');
    expect(
      result.findings?.some((finding) => finding.message.includes('"bow" fires this concept but has no admitted entry')),
    ).toBe(true);
  });

  it('matches with the engine tokenizer, so stemmed surface forms fire ("tempted" → "tempt")', () => {
    const result = lexiconInventoryCheck({
      concepts: [concept('remembered-a-way-of-escape', ['tempted', 'temptation'])],
      inventoryFileContents: inventory(
        '  - id: remembered-a-way-of-escape\n    admitted: [temptation, tempted]\n',
      ),
    });
    expect(result.status).toBe('pass');
    expect(result.findings ?? []).toHaveLength(0);
  });

  it('is not applicable before any concept exists', () => {
    const result = lexiconInventoryCheck({ concepts: [], inventoryFileContents: null });
    expect(result.status).toBe('not-applicable');
  });
});
