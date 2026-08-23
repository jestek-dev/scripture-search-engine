/**
 * MS-11 verification: the mechanical classifier routes the audit's own
 * judgments correctly (ad7/ad8/fn3/fn13/ph4 → needs-jesse; ms1/ref1/
 * flat-tie/dup-anchor → confident-fix — the audit is the test oracle); the
 * tool suggests and NEVER finalizes; the CI-grep-style discipline check
 * fires on fixed needs-jesse defects without a batch verdict; the approval
 * batch format enforces its cap and the J69 redaction; TRIAGE-RULES.md
 * carries the boundary verbatim and is marked pending J66.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { REPO_ROOT } from '../src/universe/compileFromRepo.js';
import {
  anchorSignature,
  clusterKeyOf,
  defectId,
  DEFECT_SCHEMA,
  type DefectRecord,
} from '../src/defect/schema.js';
import { clusterDefects } from '../src/defect/cluster.js';
import { renderApprovalBatch, BATCH_CLUSTER_CAP, type BatchItem } from '../src/triage/batch.js';
import {
  checkTriageDiscipline,
  confirmTriage,
  suggestTriage,
  type ApprovedRules,
} from '../src/triage/suggest.js';

function record(patch: Partial<DefectRecord> & { queryId: string }): DefectRecord {
  const top5 = patch.got?.top5 ?? [
    { rank: 1, reference: 'Romans 6:23', score: 3, reasonFamilies: ['translation_variant'] },
  ];
  const defectClass = patch.defectClass ?? 'wrong-verse';
  const suspectedCause = patch.suspectedCause ?? 'engine-scoring';
  return {
    schema: DEFECT_SCHEMA,
    id: defectId('run-1', patch.queryId, defectClass),
    runId: 'run-1',
    query: 'some query',
    generator: 'grammar:test',
    category: 'adversarial',
    register: 'church-member',
    crisisAdjacent: false,
    identity: {
      engineVersion: '0.14.0',
      corpusFingerprint: 'c'.repeat(64),
      layerFingerprint: 'l'.repeat(64),
    },
    expectation: { kind: 'none' },
    got: {
      top5,
      snapshotRef: 'runs/run-1/snapshot-merged.jsonl',
      replayCmd: 'npm run replay --workspace sweep -- … --query-id ' + patch.queryId,
    },
    defectClass,
    severity: 'wrong',
    gradedBy: 'layer1',
    suspectedCause,
    causeEvidence: 'evidence',
    clusterKey: clusterKeyOf(defectClass, suspectedCause, anchorSignature(top5)),
    status: 'open',
    ...patch,
  };
}

/** Approval state per the audit's standing decisions: the PMI tie-break fix
 *  was the approved mechanism; no sole-weak demotion rule has been
 *  Jesse-approved. Inputs recorded by the caller, never tooling opinion. */
const APPROVALS: ApprovedRules = { soleWeakDemotionRule: false, pmiTieBreakApproved: true };

describe('mechanical classifier vs the audit\'s own judgments (the test oracle)', () => {
  const canaries: { name: string; rec: DefectRecord; expected: 'needs-jesse' | 'confident-fix' }[] = [
    {
      // ad7 "wages of sin": sole translation_variant #1 — the fix chooses a
      // corrective, and no demotion rule is Jesse-approved yet.
      name: 'ad7 (sole-weak corrective)',
      rec: record({ queryId: 'ad7', defectClass: 'wrong-verse', suspectedCause: 'engine-scoring' }),
      expected: 'needs-jesse',
    },
    {
      // ad8 "lord's supper": 1 Cor 11:20 watchlist proximity (pending J3).
      name: 'ad8 (watchlist-near)',
      rec: record({
        queryId: 'ad8',
        suspectedCause: 'negative-context-surfacing',
        severity: 'theologically-harmful',
      }),
      expected: 'needs-jesse',
    },
    {
      // fn3 "does God forgive me": assurance-vs-conditional pastoral ordering (J1).
      name: 'fn3 (pastoral ordering)',
      rec: record({
        queryId: 'fn3',
        defectClass: 'poor-prioritization',
        suspectedCause: 'ranking-or-coverage',
      }),
      expected: 'needs-jesse',
    },
    {
      // fn13 "caring for a dying parent": missing concept + crisis-adjacent (J7).
      name: 'fn13 (crisis + coverage gap)',
      rec: record({
        queryId: 'fn13',
        defectClass: 'missing-verse',
        suspectedCause: 'coverage-gap',
        crisisAdjacent: true,
      }),
      expected: 'needs-jesse',
    },
    {
      // ph4 "cast all your anxiety on him": quoted-verse ordering (J4).
      name: 'ph4 (quoted-verse ordering)',
      rec: record({
        queryId: 'ph4',
        defectClass: 'poor-prioritization',
        suspectedCause: 'ranking-or-coverage',
      }),
      expected: 'needs-jesse',
    },
    {
      // ms1 "forgivness": silent correction against the citation contract.
      name: 'ms1 (silent correction)',
      rec: record({ queryId: 'ms1', defectClass: 'parse-failure', suspectedCause: 'spelling-correction' }),
      expected: 'confident-fix',
    },
    {
      // ref1: mis-parse against the supported reference grammar.
      name: 'ref1 (reference mis-parse)',
      rec: record({ queryId: 'ref1', defectClass: 'parse-failure', suspectedCause: 'reference-grammar' }),
      expected: 'confident-fix',
    },
    {
      // th2-style flat tie, resolved by the approved PMI mechanism.
      name: 'flat-tie (approved PMI mechanism)',
      rec: record({ queryId: 'th2', defectClass: 'poor-prioritization', suspectedCause: 'engine-scoring' }),
      expected: 'confident-fix',
    },
    {
      // Duplicate anchor: mechanical dedup.
      name: 'dup-anchor (mechanical dedup)',
      rec: record({ queryId: 'dup1', defectClass: 'wrong-verse', suspectedCause: 'duplicate-anchor' }),
      expected: 'confident-fix',
    },
  ];

  for (const canary of canaries) {
    it(`routes ${canary.name} → ${canary.expected}`, () => {
      const suggestion = suggestTriage(canary.rec, APPROVALS);
      expect(suggestion.suggestion).toBe(canary.expected);
      expect(suggestion.clause.length).toBeGreaterThan(0);
    });
  }

  it('any doubt ⇒ needs-jesse: an unrecognized cause routes to Jesse', () => {
    const suggestion = suggestTriage(record({ queryId: 'x', suspectedCause: 'mystery-cause' }), APPROVALS);
    expect(suggestion.suggestion).toBe('needs-jesse');
    expect(suggestion.clause).toBe('any doubt ⇒ needs-jesse');
  });

  it('the approved-rule flags are inputs: flipping them flips ONLY their clauses', () => {
    const soleWeak = record({ queryId: 'ad7', defectClass: 'wrong-verse', suspectedCause: 'engine-scoring' });
    expect(
      suggestTriage(soleWeak, { soleWeakDemotionRule: true, pmiTieBreakApproved: true }).suggestion,
    ).toBe('confident-fix');
    const flatTie = record({ queryId: 'th2', defectClass: 'poor-prioritization', suspectedCause: 'engine-scoring' });
    expect(
      suggestTriage(flatTie, { soleWeakDemotionRule: false, pmiTieBreakApproved: false }).suggestion,
    ).toBe('needs-jesse');
    // Crisis outranks an approved rule — ANY needs-jesse clause suffices.
    const crisisTie = record({
      queryId: 'ct',
      defectClass: 'poor-prioritization',
      suspectedCause: 'engine-scoring',
      crisisAdjacent: true,
    });
    expect(suggestTriage(crisisTie, APPROVALS).suggestion).toBe('needs-jesse');
  });
});

describe('the tool suggests, a human confirms — never finalizes', () => {
  it('suggestTriage leaves the record untouched', () => {
    const rec = record({ queryId: 'q1' });
    const before = JSON.stringify(rec);
    suggestTriage(rec, APPROVALS);
    expect(JSON.stringify(rec)).toBe(before);
    expect(rec.triage).toBeUndefined();
  });

  it('confirmTriage refuses tool-ish deciders and rationale-less wontfix', () => {
    const rec = record({ queryId: 'q1' });
    for (const decider of ['', '  ', 'tooling', 'suggest-tool', 'auto-triage', 'AI grader']) {
      expect(() =>
        confirmTriage(rec, { decision: 'confident-fix', decidedBy: decider, at: '2026-08-23' }),
      ).toThrow(/human/);
    }
    expect(() =>
      confirmTriage(rec, { decision: 'wontfix-with-rationale', decidedBy: 'jesse', at: '2026-08-23' }),
    ).toThrow(/rationale/);
    const confirmed = confirmTriage(rec, {
      decision: 'needs-jesse',
      decidedBy: 'jesse',
      at: '2026-08-23',
    });
    expect(confirmed.status).toBe('triaged');
    expect(confirmed.triage?.decision).toBe('needs-jesse');
    // The original record is not mutated.
    expect(rec.triage).toBeUndefined();
  });
});

describe('CI-grep-style discipline check', () => {
  it('POSITIVE CONTROL: a fixed needs-jesse defect without a batch verdict FIRES', () => {
    const bad = {
      ...record({ queryId: 'q1' }),
      status: 'fixed' as const,
      triage: { decision: 'needs-jesse' as const, decidedBy: 'jesse', at: '2026-08-23' },
    };
    const violations = checkTriageDiscipline([bad]);
    expect(violations.length).toBe(1);
    expect(violations[0]!.problem).toMatch(/NO batch-verdict reference/);
  });

  it('a batch-referenced fix and an open needs-jesse row are both clean; untriaged-fixed fires', () => {
    const good = {
      ...record({ queryId: 'q1' }),
      status: 'verified-fixed' as const,
      triage: {
        decision: 'needs-jesse' as const,
        decidedBy: 'jesse',
        at: '2026-08-23',
        batchRef: 'docs/reviews/sweep/approvals/2026-08-23-batch-000-audit-seed.md#3',
      },
    };
    const open = {
      ...record({ queryId: 'q2' }),
      triage: { decision: 'needs-jesse' as const, decidedBy: 'jesse', at: '2026-08-23' },
    };
    const untriagedFixed = { ...record({ queryId: 'q3' }), status: 'fixed' as const };
    const violations = checkTriageDiscipline([good, open, untriagedFixed]);
    expect(violations.length).toBe(1);
    expect(violations[0]!.queryId).toBe('q3');
    expect(violations[0]!.problem).toMatch(/no triage decision/);
  });
});

describe('approval batch format', () => {
  function items(count: number, crisis = false): BatchItem[] {
    const records = Array.from({ length: count }, (_, i) =>
      record({
        queryId: `b:${String(i).padStart(4, '0')}`,
        query: crisis ? 'SENSITIVE-CRISIS-TEXT' : 'what is grace',
        crisisAdjacent: crisis,
        suspectedCause: `cause-${i}`,
      }),
    );
    return clusterDefects(records).map((cluster) => ({
      cluster,
      issue: 'the #1 rests on a sole weak family',
      options: ['recommended: demote sole-weak #1 (needs rule approval)', 'leave as is'],
      implications: 'affects this cluster only',
    }));
  }

  it('caps batches at 25 clusters', () => {
    expect(() => renderApprovalBatch('001', '2026-08-23', items(BATCH_CLUSTER_CAP + 1))).toThrow(/cap is 25/);
    const rendered = renderApprovalBatch('001', '2026-08-23', items(3));
    expect(rendered).toContain('APPROVE / AMEND / REJECT / DEFER');
    expect(rendered).toContain('**VERDICT:**');
    expect(rendered).toContain('Replay:');
  });

  it('POSITIVE CONTROL: crisis text never reaches a committed batch (J69)', () => {
    const rendered = renderApprovalBatch('002', '2026-08-23', items(2, true));
    expect(rendered).not.toContain('SENSITIVE-CRISIS-TEXT');
    expect(rendered).toContain('J69');
  });
});

describe('TRIAGE-RULES.md (the normative boundary, pending J66)', () => {
  const rules = readFileSync(join(REPO_ROOT, 'sweep', 'TRIAGE-RULES.md'), 'utf8');

  it('is marked pending J66 and carries the plan boundary verbatim', () => {
    expect(rules).toMatch(/PENDING JESSE'S RATIFICATION \(J66\)/);
    expect(rules).toContain('**confident-fix (ALL must hold; any doubt ⇒ needs-jesse):**');
    expect(rules).toContain('**needs-Jesse (ANY suffices):**');
    for (const clause of [
      'mis-parse vs the supported-grammar list',
      'structural zero-results',
      'silent correction',
      'typed-kind violation',
      'chip\nmisstating evidence',
      'sole-weak junk #1 under an ALREADY-Jesse-approved\nrule',
      'duplicate anchor',
      "data typo per the pack's own comment",
      'flat tie\nresolved by the approved PMI mechanism',
      'which verse best answers a query',
      'pastoral\nordering',
      'anything doctrinal or watchlist-near',
      'any unapproved engine change',
      'correctives',
      'mustNotRank/watchlist additions',
      'anything crisisAdjacent',
      'never majority-voted',
    ]) {
      expect(rules, `boundary clause missing: ${clause}`).toContain(clause);
    }
  });

  it('the seed batch pre-loads the audit\'s seven FLAGs', () => {
    const seed = readFileSync(
      join(REPO_ROOT, 'docs', 'reviews', 'sweep', 'approvals', '2026-08-23-batch-000-audit-seed.md'),
      'utf8',
    );
    for (const id of ['fn3', 'fn14', 'ad8', 'ph4', 'ad12', 'fn6', 'fn13']) {
      expect(seed, `seed batch missing audit FLAG query ${id}`).toContain(`${id} —`);
    }
    expect(seed).toContain('search-quality-report-2026-08-20');
    expect(seed).toMatch(/must not re-discover what the audit already\s+escalated/);
  });
});
