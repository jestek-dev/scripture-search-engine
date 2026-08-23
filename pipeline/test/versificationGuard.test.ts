/**
 * P6.4 (B5) S1 — TVTMS versification guard.
 *
 * The guard is a zero-shipped-bytes build-time witness: TVTMS catalogues
 * every locus where Bible versifications disagree, and the corpus's verse-ID
 * shape must match a recognized English-tradition stanza at each of them (or
 * a reviewed, named exception). These tests pin the parser's
 * structural-columns-only contract, the tri-state predicate semantics
 * (skips are never guesses), the reviewed-exception discipline, and — with
 * the real corpus on hand — the exact full-corpus report the admission
 * recorded, plus the seeded-corruption proof that the guard actually fires.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { importVpl } from '../src/importers/vplImporter.js';
import {
  declaredNullLine,
  parseTvtmsExpanded,
  REVIEWED_EXCEPTIONS,
  runVersificationGuard,
  type TvtmsLocus,
} from '../src/versificationGuard.js';
import { TVTMS_ENGLISH_LOCI } from '../src/versification/tvtms.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const VPL_PATH = join(HERE, '..', 'sources', 'vpl', 'engwebp_vpl.txt');

/** Builds one expanded-section data line: 9 tab-separated cells. */
function row(
  sourceType: string,
  sourceRef: string,
  standardRef: string,
  action: string,
  tests: string,
): string {
  // Cells 4–7 are TVTMS's prose/note columns — filled with sentinel text the
  // parser must drop.
  return [sourceType, sourceRef, standardRef, action, 'PROSE', 'NOTE', 'INFO', 'EXTRA', tests].join(
    '\t',
  );
}

function tvtmsFile(body: readonly string[]): string {
  return ['#DataStart(Expanded)', ...body, '#DataEnd(Expanded)'].join('\n');
}

/** Complete KJV Genesis 1: verses 1–31. */
function genesisOne(): Set<number> {
  const ids = new Set<number>();
  for (let verse = 1; verse <= 31; verse++) ids.add(1_001_000 + verse);
  return ids;
}

describe('parseTvtmsExpanded', () => {
  it('requires the expanded-section markers', () => {
    expect(() => parseTvtmsExpanded('no markers here')).toThrow(/markers not found/);
  });

  it('groups rows into loci at non-row lines and keeps only English-relevant loci', () => {
    const loci = parseTvtmsExpanded(
      tvtmsFile([
        row('Eng-KJV', 'Gen.1:1', 'Gen.1:1', 'Keep verse', 'Gen.1:1=Exist'),
        '',
        row('Hebrew', 'Gen.31:55', 'Gen.32:1', 'Renumber verse', 'Gen.31:55=NotExist'),
        '',
        row('Eng-NRSV', 'Exo.20:13', 'Exo.20:13', 'Keep verse', 'Exo.20:13=Exist'),
      ]),
    );
    expect(loci.map((locus) => locus.id)).toEqual(['Gen.1:1', 'Exo.20:13']);
  });

  it('keeps only the five structural columns — prose cells never survive', () => {
    const [locus] = parseTvtmsExpanded(
      tvtmsFile([row('Eng-KJV', 'Gen.1:1', 'Gen.1:2', 'Renumber verse', 'Gen.1:1=Exist')]),
    );
    expect(locus!.rows[0]).toEqual({
      sourceType: 'Eng-KJV',
      sourceRef: 'Gen.1:1',
      standardRef: 'Gen.1:2',
      action: 'Renumber verse',
      tests: 'Gen.1:1=Exist',
    });
  });

  it('drops non-English rows from a mixed locus unless a reviewed exception names their tradition', () => {
    const mixed = tvtmsFile([
      row('Eng-KJV+Greek', 'Rom.14:22', 'Rom.14:22', 'Keep verse', 'Rom.16:27=Last'),
      row('Greek2', 'Rom.14:22', 'Rom.14:24', 'Renumber verse', 'Rom.14:26=Last'),
      row('Latin', 'Rom.14:22', 'Rom.14:22', 'Keep verse', 'Rom.16:24=Last'),
    ]);
    const [locus] = parseTvtmsExpanded(mixed);
    // Rom.14:22 has a reviewed exception naming Greek2 — Greek2 rows are
    // retained for that locus; Latin rows are not.
    expect(REVIEWED_EXCEPTIONS.has('Rom.14:22')).toBe(true);
    expect(locus!.rows.map((entry) => entry.sourceType)).toEqual(['Eng-KJV+Greek', 'Greek2']);
  });

  it('disambiguates repeated base references with #n suffixes', () => {
    const loci = parseTvtmsExpanded(
      tvtmsFile([
        row('Eng-KJV', 'Psa.3:1', 'Psa.3:1', 'Keep verse', 'Psa.3:1=Exist'),
        '',
        row('Eng-KJV', 'Psa.3:1', 'Psa.3:2', 'Renumber verse', 'Psa.3:2=Exist'),
      ]),
    );
    expect(loci.map((locus) => locus.id)).toEqual(['Psa.3:1', 'Psa.3:1#2']);
  });
});

describe('runVersificationGuard semantics', () => {
  const locusOf = (tests: string, sourceType = 'Eng-KJV'): TvtmsLocus[] => [
    { id: 'Gen.1:31', rows: [{ sourceType, sourceRef: 'Gen.1:31', standardRef: 'Gen.1:31', action: 'Keep verse', tests }] },
  ];

  it('evaluates Exist, NotExist and Last against the verse-ID set', () => {
    const present = genesisOne();
    const pass = runVersificationGuard(
      locusOf('Gen.1:1=Exist & Gen.1:32=NotExist & Gen.1:31=Last'),
      present,
      'full',
    );
    expect(pass.passed).toBe(1);
    expect(pass.mismatches).toEqual([]);

    const truncated = new Set(present);
    truncated.delete(1_001_031);
    const fail = runVersificationGuard(locusOf('Gen.1:31=Last'), truncated, 'full');
    expect(fail.passed).toBe(0);
    expect(fail.mismatches).toHaveLength(1);
    expect(fail.mismatches[0]).toContain('Gen.1:31');
    expect(fail.mismatches[0]).toContain('matches no English-tradition stanza');
  });

  it('skips what it cannot evaluate — subverses, apocrypha, comparisons — and never guesses', () => {
    // Every predicate unevaluable -> the locus is reported skipped, and a
    // vacuous row NEVER counts as a pass.
    const report = runVersificationGuard(
      locusOf('Gen.5:31.2=Exist & Tob.1:1=Exist & Gen.6:1<Gen.6:2 & Psa.11:TextBeforeV1=Exist'),
      genesisOne(),
      'full',
    );
    expect(report.passed).toBe(0);
    expect(report.mismatches).toEqual([]);
    expect(report.skipped.get('non-evaluable')).toEqual(['Gen.1:31']);
  });

  it('a mixed row fails on its evaluable predicates even when others are skipped', () => {
    // One evaluable-and-false predicate beside a skipped one: the row is NOT
    // vacuous, and it does not pass.
    const report = runVersificationGuard(
      locusOf('Gen.5:31.2=Exist & Gen.1:32=Exist'),
      genesisOne(),
      'full',
    );
    expect(report.mismatches).toHaveLength(1);
  });

  it('passes when ANY English-tradition stanza matches (the traditions are alternatives)', () => {
    const loci: TvtmsLocus[] = [
      {
        id: '3Jn.1:14',
        rows: [
          { sourceType: 'Eng-KJV', sourceRef: '3Jn.1:14', standardRef: '3Jn.1:14', action: 'Keep verse', tests: '3Jn.1:14=Last' },
          { sourceType: 'Eng-NRSV', sourceRef: '3Jn.1:15', standardRef: '3Jn.1:15', action: 'Keep verse', tests: '3Jn.1:15=Last' },
        ],
      },
    ];
    const nrsvShaped = new Set([64_001_014, 64_001_015]);
    expect(runVersificationGuard(loci, nrsvShaped, 'full').passed).toBe(1);
    const kjvShaped = new Set([64_001_014]);
    expect(runVersificationGuard(loci, kjvShaped, 'full').passed).toBe(1);
  });

  it('reviewed exceptions resolve to the NAMED tradition and stay loud when that fails too', () => {
    const loci: TvtmsLocus[] = [
      {
        id: 'Rom.14:22',
        rows: [
          { sourceType: 'Eng-KJV+Greek', sourceRef: 'Rom.14:22', standardRef: 'Rom.14:22', action: 'Keep verse', tests: 'Rom.16:27=Last' },
          { sourceType: 'Greek2', sourceRef: 'Rom.14:22', standardRef: 'Rom.14:24', action: 'Renumber verse', tests: 'Rom.16:24=Last' },
        ],
      },
    ];
    // Matches the exception's named tradition (chapter 16 ends at v.24).
    const greek2Shaped = new Set([45_016_024]);
    const viaException = runVersificationGuard(loci, greek2Shaped, 'full');
    expect(viaException.passed).toBe(1);
    expect(viaException.passedViaException).toEqual(['Rom.14:22']);

    // Matches NEITHER the English stanza nor the named tradition: the
    // exception never blanket-skips, and the mismatch names it.
    const neither = new Set([45_016_024, 45_016_025]);
    const stillLoud = runVersificationGuard(loci, neither, 'full');
    expect(stillLoud.mismatches).toHaveLength(1);
    expect(stillLoud.mismatches[0]).toContain("nor the reviewed exception 'Greek2'");
  });

  it('fixture mode evaluates only loci whose referenced chapters are complete', () => {
    const loci = locusOf('Gen.1:31=Last');
    const complete = genesisOne();
    expect(runVersificationGuard(loci, complete, 'fixture').passed).toBe(1);

    // Drop the chapter's last verse: in fixture mode the chapter is
    // incomplete against KJV extents, so the locus is SKIPPED (reported, not
    // silent) — while full mode calls the same shape a mismatch.
    const partial = new Set(complete);
    partial.delete(1_001_031);
    const fixtureReport = runVersificationGuard(loci, partial, 'fixture');
    expect(fixtureReport.passed).toBe(0);
    expect(fixtureReport.mismatches).toEqual([]);
    expect(fixtureReport.skipped.get('incomplete-chapter')).toEqual(['Gen.1:31']);
    expect(runVersificationGuard(loci, partial, 'full').mismatches).toHaveLength(1);
  });

  it('prints the mandated declared-null admission line', () => {
    const report = runVersificationGuard(locusOf('Gen.1:31=Last'), genesisOne(), 'full');
    const line = declaredNullLine(report);
    expect(line).toContain('versification guard (stepbible-tvtms): 1 English loci, 1 matched');
    expect(line).toContain('zero-row guard source: NO MEASURABLE EFFECT expected and accepted');
  });
});

describe('committed TVTMS distillate', () => {
  it('carries the census the admission recorded', () => {
    // Pinned against the admitted snapshot (sha256 63058e0f…): any drift in
    // these numbers means the source or the distillation changed.
    expect(TVTMS_ENGLISH_LOCI).toHaveLength(400);
    const rowCount = TVTMS_ENGLISH_LOCI.reduce((sum, locus) => sum + locus.rows.length, 0);
    expect(rowCount).toBe(7592);
  });

  it('every locus keeps at least one English-tradition row, ids unique', () => {
    const ids = new Set<string>();
    for (const locus of TVTMS_ENGLISH_LOCI) {
      expect(ids.has(locus.id), `duplicate locus id ${locus.id}`).toBe(false);
      ids.add(locus.id);
      expect(
        locus.rows.some((entry) => entry.sourceType.includes('Eng')),
        `${locus.id} has no English row`,
      ).toBe(true);
    }
  });

  it('non-English rows appear only where a reviewed exception names their tradition', () => {
    for (const locus of TVTMS_ENGLISH_LOCI) {
      const exception = REVIEWED_EXCEPTIONS.get(locus.id);
      for (const entry of locus.rows) {
        if (entry.sourceType.includes('Eng')) continue;
        expect(
          exception?.matchInstead,
          `${locus.id} carries a non-English row '${entry.sourceType}' with no reviewed exception`,
        ).toBe(entry.sourceType);
      }
    }
  });
});

describe('versification guard against the full WEB corpus', () => {
  const available = existsSync(VPL_PATH);

  const fullVerseSet = (): Set<number> => {
    const { verses } = importVpl(readFileSync(VPL_PATH, 'utf8'));
    return new Set(verses.map((verse) => verse.verseId));
  };

  it.skipIf(!available)(
    'reports exactly the admission census: 294 matched, 1 via the reviewed Romans exception, 106 non-evaluable, zero mismatches (skip reason: sources/vpl not fetched)',
    () => {
      const report = runVersificationGuard(TVTMS_ENGLISH_LOCI, fullVerseSet(), 'full');
      expect(report.engLoci).toBe(400);
      expect(report.passed).toBe(294);
      expect(report.passedViaException).toEqual(['Rom.14:22']);
      expect([...report.skipped.keys()]).toEqual(['non-evaluable']);
      expect(report.skipped.get('non-evaluable')).toHaveLength(106);
      expect(report.mismatches).toEqual([]);
      expect(declaredNullLine(report)).toBe(
        'versification guard (stepbible-tvtms): 400 English loci, ' +
          '294 matched (1 via reviewed exception: Rom.14:22), 106 skipped as non-evaluable; ' +
          'zero-row guard source: NO MEASURABLE EFFECT expected and accepted',
      );
    },
  );

  it.skipIf(!available)(
    'SEEDED CORRUPTION: deleting Genesis 2:25 makes the guard fire (skip reason: sources/vpl not fetched)',
    () => {
      const corrupted = fullVerseSet();
      corrupted.delete(1_002_025);
      const report = runVersificationGuard(TVTMS_ENGLISH_LOCI, corrupted, 'full');
      expect(report.mismatches.length).toBeGreaterThan(0);
      expect(report.mismatches.join('\n')).toContain('Gen.2:25');
    },
  );

  it.skipIf(!available)(
    'SEEDED CORRUPTION: a phantom Romans 16:25 makes the guard fire — the reviewed exception stays loud (skip reason: sources/vpl not fetched)',
    () => {
      // WEB legitimately ends Romans 16 at v.24 (the Greek2 stanza the
      // Rom.14:22 exception names). Inserting a phantom 16:25 matches
      // NEITHER that stanza NOR the KJV one — proving the exception narrows
      // to a named tradition instead of muting the locus.
      const corrupted = fullVerseSet();
      corrupted.add(45_016_025);
      const report = runVersificationGuard(TVTMS_ENGLISH_LOCI, corrupted, 'full');
      expect(report.mismatches.length).toBeGreaterThan(0);
      expect(report.mismatches.join('\n')).toContain("nor the reviewed exception 'Greek2'");
    },
  );
});
