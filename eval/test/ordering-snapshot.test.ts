/**
 * G2 ordering snapshot: any reordering anywhere in the probe top-25 fails the
 * gauntlet unless the engine identity moved in the same commit and the
 * snapshot's digest-bound approval was rewritten to say so. These tests walk
 * the gate's 7-rule decision table and the approval validator it shares with
 * the gauntlet, including the rule-6 tripwire that closes the
 * regenerate-without-bump hole. Approvals here are schema v2; the committed
 * v1 record stays valid only through the fingerprint-identity grandfather.
 */

import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  ORDERING_SNAPSHOT_APPROVAL_SCHEMA,
  ORDERING_SNAPSHOT_APPROVAL_SCHEMA_V2,
  orderingSnapshotGate,
  probeListsSha256,
  validateOrderingSnapshotApproval,
  type OrderingSnapshot,
  type ProbeOrderedResults,
} from '../src/gates/orderingSnapshot.js';
import {
  APPROVAL_V1_SUNSET_DATE,
  GRANDFATHERED_V1_APPROVAL_IDENTITIES,
  canonicalJsonSha256,
} from '../src/gates/probes.js';
import { parseGauntletOptions } from '../src/gauntletMachineReport.js';

const ENGINE = {
  engineVersion: '0.9.0-test',
  corpusFingerprint: '1'.repeat(64),
  layerFingerprint: '2'.repeat(64),
};

const PROBES: readonly ProbeOrderedResults[] = [
  {
    id: 'broad-love',
    results: [
      { targetId: 'WEB:45005008', score: 24.5 },
      { targetId: 'WEB:43003016', score: 22.104233 },
      { targetId: 'WEB:62004010', score: 20.75 },
      { targetId: 'WEB:62004009', score: 19.5 },
      { targetId: 'WEB:43015013', score: 18.25 },
      { targetId: 'WEB:24031003', score: 17 },
    ],
  },
  { id: 'adversarial-silence', results: [] },
];

const SNAPSHOT: OrderingSnapshot = { ...ENGINE, probes: PROBES };

const EVIDENCE_SHA256 = createHash('sha256')
  .update('# Ordering snapshot review record\n\nAccepted.\n')
  .digest('hex');

function approval(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    schema: ORDERING_SNAPSHOT_APPROVAL_SCHEMA_V2,
    snapshotSha256: canonicalJsonSha256(SNAPSHOT),
    probeListsSha256: probeListsSha256(SNAPSHOT.probes),
    engine: { ...ENGINE },
    reviewerName: 'Genuinely Independent Reviewer',
    reviewerContact: 'reviewer@example.test',
    independence: 'I did not author the snapshot regeneration or the change that motivated it.',
    evidence: { path: 'docs/reviews/2026-08-21-ordering-snapshot-review.md', sha256: EVIDENCE_SHA256 },
    reviewedAt: '2026-08-21',
    rationale: 'Ordering snapshot for the test identity.',
    priorProvenance: priorProvenance(),
    ...overrides,
  };
}

function priorProvenance(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    snapshotGitBlobSha1: 'a'.repeat(40),
    probeListsSha256: probeListsSha256(SNAPSHOT.probes),
    engine: { engineVersion: '0.8.0', corpusFingerprint: 'b'.repeat(64), layerFingerprint: 'c'.repeat(64) },
    ...overrides,
  };
}

function validate(
  document: unknown,
  evidenceSha256: string | null = EVIDENCE_SHA256,
  snapshot: OrderingSnapshot = SNAPSHOT,
) {
  return validateOrderingSnapshotApproval({
    snapshot,
    approval: document,
    snapshotSha256: canonicalJsonSha256(snapshot),
    probeListsSha256: probeListsSha256(snapshot.probes),
    engine: {
      engineVersion: snapshot.engineVersion,
      corpusFingerprint: snapshot.corpusFingerprint,
      layerFingerprint: snapshot.layerFingerprint,
    },
    evidenceSha256,
  });
}

function categories(findings: readonly { categoryCode?: string }[]): string[] {
  return findings.map((finding) => finding.categoryCode!.split('.').at(-1)!);
}

describe('ordering snapshot approval validator', () => {
  it('validates a complete v2 approval with matching evidence bytes', () => {
    expect(validate(approval())).toEqual([]);
  });

  it('accepts a v2 bootstrap: null priorProvenance beside a documented reason', () => {
    expect(validate(approval({
      priorProvenance: null,
      bootstrap: 'First snapshot for this identity: no prior snapshot exists to chain.',
    }))).toEqual([]);
    const bare = validate(approval({ priorProvenance: null }));
    expect(categories([...bare])).toEqual(['ordering-approval-malformed']);
    expect(bare[0]!.message).toContain('priorProvenance');
    expect(bare[0]!.message).toContain('bootstrap');
  });

  it('reports a missing approval as its own named finding', () => {
    expect(categories([...validate(null)])).toEqual(['ordering-approval-missing']);
  });

  it('rejects an unrecognized schema outright', () => {
    expect(categories([...validate(approval({ schema: 'scripture-search-engine/ordering-snapshot-approval/v3' }))]))
      .toEqual(['ordering-approval-malformed']);
  });

  it('rejects a v2 document with a blank, missing, or extra field, naming the field', () => {
    const smuggled = validate(approval({ reviewer: 'free-text role' }));
    expect(categories([...smuggled])).toEqual(['ordering-approval-malformed']);
    expect(smuggled[0]!.message).toContain('"reviewer"');
    const { rationale: _dropped, ...withoutRationale } = approval();
    const missing = validate(withoutRationale);
    expect(categories([...missing])).toEqual(['ordering-approval-malformed']);
    expect(missing[0]!.message).toContain('"rationale"');
  });

  it('names a blank reviewer identity or independence attestation', () => {
    expect(categories([...validate(approval({ reviewerName: '  ' }))]))
      .toEqual(['ordering-approval-reviewer-unidentified']);
    expect(categories([...validate(approval({ independence: '' }))]))
      .toEqual(['ordering-approval-independence-missing']);
  });

  it('fails closed on missing or mismatching evidence bytes', () => {
    expect(categories([...validate(approval(), null)]))
      .toEqual(['ordering-approval-evidence-mismatch']);
    expect(categories([...validate(approval(), '0'.repeat(64))]))
      .toEqual(['ordering-approval-evidence-mismatch']);
  });

  it('rejects a priorProvenance that is present but incomplete', () => {
    const { probeListsSha256: _dropped, ...withoutLists } = priorProvenance();
    expect(categories([...validate(approval({ priorProvenance: withoutLists }))]))
      .toEqual(['ordering-approval-malformed']);
  });

  it('binds the snapshot digest, the probe-lists digest, and the engine identity exactly', () => {
    expect(categories([...validate(approval({ snapshotSha256: '0'.repeat(64) }))]))
      .toEqual(['ordering-approval-snapshot-mismatch']);
    expect(categories([...validate(approval({ probeListsSha256: '0'.repeat(64) }))]))
      .toEqual(['ordering-approval-probe-lists-mismatch']);
    expect(categories([...validate(approval({ engine: { ...ENGINE, layerFingerprint: '0'.repeat(64) } }))]))
      .toEqual(['ordering-approval-engine-mismatch']);
  });

  it('reports every deficiency at once so one fix does not hide the next', () => {
    const findings = validate(approval({ snapshotSha256: '0'.repeat(64), probeListsSha256: '0'.repeat(64) }));
    expect(categories([...findings]).sort()).toEqual([
      'ordering-approval-probe-lists-mismatch',
      'ordering-approval-snapshot-mismatch',
    ]);
  });
});

describe('ordering approval v1 grandfather and sunset', () => {
  const GRANDFATHERED_ENGINE = GRANDFATHERED_V1_APPROVAL_IDENTITIES[0]!;
  const GRANDFATHERED_SNAPSHOT: OrderingSnapshot = { ...GRANDFATHERED_ENGINE, probes: PROBES };

  function v1Approval(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      schema: ORDERING_SNAPSHOT_APPROVAL_SCHEMA,
      snapshotSha256: canonicalJsonSha256(GRANDFATHERED_SNAPSHOT),
      probeListsSha256: probeListsSha256(GRANDFATHERED_SNAPSHOT.probes),
      engine: { ...GRANDFATHERED_ENGINE },
      reviewer: 'project owner (bootstrap ordering snapshot, approved by merging PR-A)',
      reviewedAt: '2026-08-17',
      rationale: 'Bootstrap ordering snapshot: no prior snapshot exists, so priorProvenance is null.',
      priorProvenance: null,
      ...overrides,
    };
  }

  it('still validates the committed v1 bootstrap record: grandfathered identity, pre-sunset date', () => {
    expect(validate(v1Approval(), null, GRANDFATHERED_SNAPSHOT)).toEqual([]);
  });

  it('rejects a v1 approval dated after the sunset', () => {
    const retired = validate(v1Approval({ reviewedAt: '2026-08-21' }), null, GRANDFATHERED_SNAPSHOT);
    expect(categories([...retired])).toEqual(['ordering-approval-v1-retired']);
    expect(retired[0]!.message).toContain(APPROVAL_V1_SUNSET_DATE);
  });

  it('rejects a v1 approval for any identity outside the grandfathered records', () => {
    const findings = validate(v1Approval({
      snapshotSha256: canonicalJsonSha256(SNAPSHOT),
      probeListsSha256: probeListsSha256(SNAPSHOT.probes),
      engine: { ...ENGINE },
    }), null);
    expect(categories([...findings])).toEqual(['ordering-approval-v1-not-grandfathered']);
    expect(findings[0]!.message).toContain('v2');
  });

  it('keeps every original v1 check: blank reviewer, missing field, or extra key is still malformed', () => {
    expect(categories([...validate(v1Approval({ reviewer: '   ' }), null, GRANDFATHERED_SNAPSHOT)]))
      .toEqual(['ordering-approval-malformed']);
    const { rationale: _dropped, ...withoutRationale } = v1Approval();
    expect(categories([...validate(withoutRationale, null, GRANDFATHERED_SNAPSHOT)]))
      .toEqual(['ordering-approval-malformed']);
    expect(categories([...validate(v1Approval({ smuggled: true }), null, GRANDFATHERED_SNAPSHOT)]))
      .toEqual(['ordering-approval-malformed']);
  });
});

describe('ordering snapshot gate decision table', () => {
  const observed = (probes: readonly ProbeOrderedResults[] = PROBES, identity = ENGINE) => ({
    identity,
    probes,
  });

  function gate(options: {
    snapshot?: OrderingSnapshot | null;
    approval?: unknown;
    observed: ReturnType<typeof observed> | null;
    evidenceSha256?: string | null;
  }) {
    return orderingSnapshotGate({
      snapshot: options.snapshot === undefined ? SNAPSHOT : options.snapshot,
      approval: options.approval === undefined ? approval() : options.approval,
      evidenceSha256: options.evidenceSha256 === undefined ? EVIDENCE_SHA256 : options.evidenceSha256,
      observed: options.observed,
    });
  }

  it('rule 7: passes when snapshot, approval, identity, and orderings all agree', () => {
    const result = gate({ observed: observed() });
    expect(result.status).toBe('pass');
    expect(result.summary).toContain('byte-identical');
  });

  it('rule 1: fails closed when the committed snapshot is missing', () => {
    const result = gate({ snapshot: null, observed: observed() });
    expect(result.status).toBe('fail');
    expect(categories([...(result.findings ?? [])])).toEqual(['ordering-snapshot-missing']);
    expect(result.findings?.[0]?.message).toContain('--update-ordering-snapshot');
  });

  it('rules 2-3: fails when the approval is absent, unbound, or missing its evidence', () => {
    expect(gate({ approval: null, observed: observed() }).status).toBe('fail');
    const tampered = gate({ approval: approval({ snapshotSha256: '0'.repeat(64) }), observed: observed() });
    expect(tampered.status).toBe('fail');
    expect(categories([...(tampered.findings ?? [])])).toContain('ordering-approval-snapshot-mismatch');
    const unreadableEvidence = gate({ observed: observed(), evidenceSha256: null });
    expect(unreadableEvidence.status).toBe('fail');
    expect(categories([...(unreadableEvidence.findings ?? [])])).toContain('ordering-approval-evidence-mismatch');
  });

  it('rule 4: fails when the engine identity moved but the snapshot was not regenerated', () => {
    const result = gate({ observed: observed(PROBES, { ...ENGINE, engineVersion: '0.10.0-test' }) });
    expect(result.status).toBe('fail');
    expect(categories([...(result.findings ?? [])])).toEqual(['ordering-snapshot-stale-identity']);
    expect(result.findings?.[0]?.message).toContain('--update-ordering-snapshot');
  });

  it('rule 5: fails a reordering under an unmoved identity, naming the probe with before/after top-5s', () => {
    const reordered: ProbeOrderedResults[] = [
      {
        id: 'broad-love',
        // The exact silent regression this exists for: #2 and #1 swapped.
        results: [PROBES[0]!.results[1]!, PROBES[0]!.results[0]!, ...PROBES[0]!.results.slice(2)],
      },
      PROBES[1]!,
    ];
    const result = gate({ observed: observed(reordered) });
    expect(result.status).toBe('fail');
    expect(categories([...(result.findings ?? [])])).toEqual(['ordering-changed-without-version-bump']);
    const message = result.findings?.[0]?.message ?? '';
    expect(result.findings?.[0]?.subjects).toEqual(['broad-love']);
    expect(message).toContain('Before top-5: [WEB:45005008@24.5, WEB:43003016@22.104233');
    expect(message).toContain('After top-5: [WEB:43003016@22.104233, WEB:45005008@24.5');
    expect(message).toContain('Bump ENGINE_VERSION');
  });

  it('rule 5: a score change alone is an ordering-snapshot change too', () => {
    const rescored: ProbeOrderedResults[] = [
      {
        id: 'broad-love',
        results: [{ ...PROBES[0]!.results[0]!, score: 24.500001 }, ...PROBES[0]!.results.slice(1)],
      },
      PROBES[1]!,
    ];
    const result = gate({ observed: observed(rescored) });
    expect(result.status).toBe('fail');
    expect(categories([...(result.findings ?? [])])).toEqual(['ordering-changed-without-version-bump']);
  });

  it('rule 5: a probe missing from either side is named rather than skipped', () => {
    const result = gate({ observed: observed([PROBES[0]!]) });
    expect(result.status).toBe('fail');
    expect(result.findings?.[0]?.subjects).toEqual(['adversarial-silence']);
    expect(result.findings?.[0]?.message).toContain('probe absent from this run');
  });

  it('rule 6 tripwire: regenerated lists with an unmoved engine identity fail even when internally consistent', () => {
    // The forged-regeneration scenario rules 1-5 cannot see: snapshot and
    // approval were BOTH rewritten, so digests bind and observed orderings
    // match — but priorProvenance shows the same engine produced different
    // lists, which is a reordering without a version bump.
    const result = gate({
      approval: approval({
        priorProvenance: priorProvenance({ probeListsSha256: '0'.repeat(64), engine: { ...ENGINE } }),
      }),
      observed: observed(),
    });
    expect(result.status).toBe('fail');
    expect(categories([...(result.findings ?? [])])).toEqual(['ordering-approval-tripwire']);
    expect(result.findings?.[0]?.message).toContain('bump');
  });

  it('rule 6: a legitimate regeneration — identity moved with the lists — does not trip', () => {
    const result = gate({
      approval: approval({ priorProvenance: priorProvenance({ probeListsSha256: '0'.repeat(64) }) }),
      observed: observed(),
    });
    expect(result.status).toBe('pass');
  });

  it('explicit target runs verify document integrity and the tripwire, never the orderings', () => {
    const clean = gate({ observed: null });
    expect(clean.status).toBe('pass');
    expect(clean.summary).toContain('explicit target run');

    const tripped = gate({
      approval: approval({
        priorProvenance: priorProvenance({ probeListsSha256: '0'.repeat(64), engine: { ...ENGINE } }),
      }),
      observed: null,
    });
    expect(tripped.status).toBe('fail');
    expect(categories([...(tripped.findings ?? [])])).toEqual(['ordering-approval-tripwire']);
  });

  it('reports the approval problem and the ordering change together, not one at a time', () => {
    const result = gate({
      approval: approval({ probeListsSha256: '0'.repeat(64) }),
      observed: observed([PROBES[0]!, { id: 'adversarial-silence', results: [{ targetId: 'WEB:1', score: 1 }] }]),
    });
    expect(result.status).toBe('fail');
    expect(categories([...(result.findings ?? [])]).sort()).toEqual([
      'ordering-approval-probe-lists-mismatch',
      'ordering-changed-without-version-bump',
    ]);
  });
});

describe('--update-ordering-snapshot CLI contract', () => {
  it('parses the flag and keeps it out of the recorded options when absent', () => {
    expect(parseGauntletOptions(['--update-ordering-snapshot']).updateOrderingSnapshot).toBe(true);
    expect('updateOrderingSnapshot' in parseGauntletOptions([])).toBe(false);
  });

  it('cannot be combined with --require-admit or --json: a run must not attest to the snapshot it wrote', () => {
    expect(() => parseGauntletOptions(['--update-ordering-snapshot', '--require-admit']))
      .toThrow('--update-ordering-snapshot cannot be combined');
    expect(() => parseGauntletOptions(['--update-ordering-snapshot', '--json', 'eval/.runs/report.json']))
      .toThrow('--update-ordering-snapshot cannot be combined');
  });

  it('cannot evaluate an explicit candidate or release target', () => {
    expect(() => parseGauntletOptions(['--update-ordering-snapshot', '--release-database', 'workbench/.artifact/content.db']))
      .toThrow('--update-ordering-snapshot cannot evaluate');
  });

  it('rejects a duplicated flag', () => {
    expect(() => parseGauntletOptions(['--update-ordering-snapshot', '--update-ordering-snapshot']))
      .toThrow('Duplicate --update-ordering-snapshot');
  });
});
