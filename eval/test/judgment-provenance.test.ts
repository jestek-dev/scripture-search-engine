/**
 * Judgment-label provenance lint (P6.5 / B6, label-provenance half).
 *
 * The lint's contract: every judgment row names a provenance source
 * (grader + date at minimum), and a vote-seeded row names the exact pinned
 * snapshot its grades came from — fail-closed in every direction a
 * provenance mark could rot: missing sha, malformed sha, mismatched sha,
 * unreadable manifest, and a snapshot mark sitting on a row that never
 * claimed vote provenance.
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  lintJudgmentProvenance,
  voteSourceOf,
  VOTE_SOURCE_MANIFESTS,
  type PinnedVoteSnapshots,
} from '../src/gates/judgmentProvenance.js';
import { batteryGate, validateBattery } from '../src/gates/rankMetrics.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');

const REAL_JUDGMENTS = JSON.parse(
  readFileSync(join(REPO_ROOT, 'eval', 'battery', 'judgments.json'), 'utf8'),
) as Record<string, unknown>;
const REAL_QUERIES = JSON.parse(
  readFileSync(join(REPO_ROOT, 'eval', 'battery', 'queries.json'), 'utf8'),
) as unknown;

const PINNED_TOPICS_SHA = (JSON.parse(
  readFileSync(join(REPO_ROOT, 'pipeline', 'manifests', 'openbible-topics.json'), 'utf8'),
) as { sha256: string }).sha256;

function pinned(sha: string | null = PINNED_TOPICS_SHA): PinnedVoteSnapshots {
  return { shaBySource: new Map([['openbible-votes', sha]]) };
}

function fileWith(rows: {
  judged?: unknown[];
  harmful?: unknown[];
  legitimatelyEmpty?: unknown;
}): unknown {
  return { judgments: { fn1: rows } };
}

const EDITORIAL_ROW = {
  ref: 'Philippians 4:6-7',
  grade: 3,
  basis: 'test',
  judgedBy: 'battery-seeding (unratified)',
  judgedAt: '2026-08-20',
};

const GOOD_SHA = 'a'.repeat(64);

describe('judgment-provenance lint (P6.5/B6)', () => {
  it('is green over the committed battery judgments file with the real pinned manifest', () => {
    const findings = lintJudgmentProvenance(REAL_JUDGMENTS, pinned());
    expect(findings).toEqual([]);
  });

  it('every committed row already names grader + date (the floor the lint re-asserts)', () => {
    // Independent of the structural schema check: strip nothing, count rows.
    const judgments = REAL_JUDGMENTS['judgments'] as Record<string, Record<string, unknown>>;
    let rows = 0;
    for (const entry of Object.values(judgments)) {
      for (const key of ['judged', 'harmful'] as const) {
        for (const row of (entry[key] as Record<string, unknown>[] | undefined) ?? []) {
          rows += 1;
          expect(typeof row['judgedBy']).toBe('string');
          expect(typeof row['judgedAt']).toBe('string');
        }
      }
    }
    expect(rows).toBeGreaterThan(0);
  });

  it('flags a row with no judgedBy as unattributed', () => {
    const findings = lintJudgmentProvenance(
      fileWith({ judged: [{ ...EDITORIAL_ROW, judgedBy: '' }] }),
      pinned(),
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]!.categoryCode).toContain('provenance-unattributed');
  });

  it('flags a row with a grader but no date', () => {
    const row: Record<string, unknown> = { ...EDITORIAL_ROW };
    delete row['judgedAt'];
    const findings = lintJudgmentProvenance(fileWith({ judged: [row] }), pinned());
    expect(findings).toHaveLength(1);
    expect(findings[0]!.categoryCode).toContain('provenance-undated');
  });

  it('flags a snapshot mark on an editorial-grade row (mark without claim)', () => {
    const findings = lintJudgmentProvenance(
      fileWith({ judged: [{ ...EDITORIAL_ROW, voteSnapshotSha256: PINNED_TOPICS_SHA }] }),
      pinned(),
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]!.categoryCode).toContain('provenance-mark-without-claim');
  });

  it('fails closed on a vote-seeded row with no snapshot sha, and on a malformed one', () => {
    for (const mark of [undefined, 'not-a-sha', 'A'.repeat(64)]) {
      const row: Record<string, unknown> = {
        ...EDITORIAL_ROW,
        judgedBy: 'openbible-votes (seeded by eval/scripts/seedGradedLabels.ts)',
      };
      if (mark !== undefined) row['voteSnapshotSha256'] = mark;
      const findings = lintJudgmentProvenance(fileWith({ judged: [row] }), pinned());
      expect(findings).toHaveLength(1);
      expect(findings[0]!.categoryCode).toContain('provenance-vote-sha-missing');
    }
  });

  it('accepts a vote-seeded row whose sha matches the pinned manifest', () => {
    const findings = lintJudgmentProvenance(
      fileWith({
        judged: [{
          ...EDITORIAL_ROW,
          judgedBy: 'openbible-votes',
          voteSnapshotSha256: PINNED_TOPICS_SHA,
        }],
      }),
      pinned(),
    );
    expect(findings).toEqual([]);
  });

  it('fails a vote-seeded row whose sha does not match the pinned manifest', () => {
    const findings = lintJudgmentProvenance(
      fileWith({
        judged: [{ ...EDITORIAL_ROW, judgedBy: 'openbible-votes', voteSnapshotSha256: GOOD_SHA }],
      }),
      pinned(),
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]!.categoryCode).toContain('provenance-vote-sha-mismatch');
    expect(findings[0]!.message).toContain('re-derived');
  });

  it('fails closed when the vote source manifest could not be read', () => {
    const findings = lintJudgmentProvenance(
      fileWith({
        judged: [{ ...EDITORIAL_ROW, judgedBy: 'openbible-votes', voteSnapshotSha256: GOOD_SHA }],
      }),
      pinned(null),
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]!.categoryCode).toContain('provenance-vote-manifest-unreadable');
  });

  it('fails a vote source the caller has no pin for at all', () => {
    const findings = lintJudgmentProvenance(
      fileWith({
        judged: [{ ...EDITORIAL_ROW, judgedBy: 'openbible-votes', voteSnapshotSha256: GOOD_SHA }],
      }),
      { shaBySource: new Map() },
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]!.categoryCode).toContain('provenance-vote-source-unknown');
  });

  it('lints harmful and legitimatelyEmpty rows, not only judged ones', () => {
    const findings = lintJudgmentProvenance(
      fileWith({
        harmful: [{ ref: 'Genesis 1:1', why: 'test', judgedBy: '', judgedAt: '2026-08-20' }],
        legitimatelyEmpty: { why: 'test', judgedBy: 'someone', judgedAt: '' },
      }),
      pinned(),
    );
    expect(findings.map((finding) => finding.categoryCode)).toEqual([
      'sse.gauntlet.v1.finding.g12-battery.provenance-unattributed',
      'sse.gauntlet.v1.finding.g12-battery.provenance-undated',
    ]);
  });

  it('is deterministic: same input, byte-identical findings', () => {
    const input = fileWith({
      judged: [
        { ...EDITORIAL_ROW, judgedBy: 'openbible-votes' },
        { ...EDITORIAL_ROW, ref: 'Genesis 1:1', judgedBy: '' },
      ],
    });
    const first = lintJudgmentProvenance(input, pinned());
    const second = lintJudgmentProvenance(input, pinned());
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it('skips what the structural validator owns: a malformed file yields no lint findings', () => {
    expect(lintJudgmentProvenance(undefined, pinned())).toEqual([]);
    expect(lintJudgmentProvenance({ judgments: 'nope' }, pinned())).toEqual([]);
    expect(lintJudgmentProvenance({ judgments: { fn1: { judged: 'nope' } } }, pinned())).toEqual([]);
  });

  it('voteSourceOf recognises the roster by prefix, never by substring accident', () => {
    expect(voteSourceOf('openbible-votes')).toBe('openbible-votes');
    expect(voteSourceOf('openbible-votes (seeded)')).toBe('openbible-votes');
    expect(voteSourceOf('openbible-votes: run 3')).toBe('openbible-votes');
    expect(voteSourceOf('openbible-votes-extended')).toBeNull();
    expect(voteSourceOf('battery-seeding (unratified)')).toBeNull();
    expect(VOTE_SOURCE_MANIFESTS.get('openbible-votes')).toBe(
      'pipeline/manifests/openbible-topics.json',
    );
  });

  it('voteSnapshotSha256 is schema-allowed on judged and harmful rows (no unknown-field finding)', () => {
    const judgments = {
      $schema: (REAL_JUDGMENTS as Record<string, unknown>)['$schema'],
      batteryVersion: 1,
      gradeMeanings: {},
      harmfulMeaning: 'x',
      provisionalPolicy: 'x',
      judgments: {
        fn1: {
          judged: [{
            ...EDITORIAL_ROW,
            judgedBy: 'openbible-votes',
            voteSnapshotSha256: PINNED_TOPICS_SHA,
          }],
        },
      },
    };
    const validated = validateBattery(REAL_QUERIES, judgments, null);
    expect(
      validated.findings.filter((finding) => finding.message.includes('voteSnapshotSha256')),
    ).toEqual([]);
  });

  it('lint findings fail the G12 roster row through the instrument-findings channel', () => {
    const validated = validateBattery(REAL_QUERIES, REAL_JUDGMENTS, {
      adversarial: 0, 'felt-need': 0, misspelling: 0, 'multi-concept': 0,
      'reference-adjacent': 0, 'remembered-phrase': 0, 'single-word': 0,
      'theological-term': 0, 'worship-leader': 0,
    });
    expect(validated.findings).toEqual([]);
    const findings = lintJudgmentProvenance(
      fileWith({ judged: [{ ...EDITORIAL_ROW, judgedBy: '' }] }),
      pinned(),
    );
    const gate = batteryGate({
      validated,
      outcomes: null,
      harmfulPresence: null,
      instrumentFindings: findings,
      context: { explicitTarget: false },
    });
    expect(gate.status).toBe('fail');
    expect(gate.summary).toContain('structural validation');
  });
});
