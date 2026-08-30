/**
 * Approval schema v2 and the v1 grandfather: an approval is valid only when
 * it names an identifiable independent reviewer, attests to what they did not
 * author, binds the review record's bytes, and quotes the review packet the
 * decision was read from. The already-committed v1 records stay valid —
 * grandfathered by their exact fingerprint identity, with none of their
 * original checks loosened — but a v1 approval for any other identity, or
 * dated after the v1 sunset, is rejected with a named finding: every new
 * approval is authored in v2 (docs/governance/probe-baseline-review.md).
 */

import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  APPROVAL_EVIDENCE_PATH_PATTERN,
  APPROVAL_V1_SUNSET_DATE,
  GRANDFATHERED_V1_APPROVAL_IDENTITIES,
  PROBE_BASELINE_APPROVAL_SCHEMA,
  PROBE_BASELINE_APPROVAL_SCHEMA_V2,
  canonicalJsonSha256,
  validateProbeBaselineApproval,
  type ProbeBaseline,
} from '../src/gates/probes.js';

const BASELINE: ProbeBaseline = {
  corpusFingerprint: '1'.repeat(64),
  engineVersion: '0.9.0-test',
  layerFingerprint: '2'.repeat(64),
  observations: [{ id: 'broad-love', top: ['WEB:45005008'], resultCount: 5, weakReasonShare: 0.2, meanTopScore: 9 }],
};

const ENGINE = {
  engineVersion: BASELINE.engineVersion,
  corpusFingerprint: BASELINE.corpusFingerprint,
  layerFingerprint: BASELINE.layerFingerprint,
};

// The one identity v1 records may still bind: the committed approvals'.
const GRANDFATHERED_ENGINE = GRANDFATHERED_V1_APPROVAL_IDENTITIES[0]!;

const GRANDFATHERED_BASELINE: ProbeBaseline = {
  corpusFingerprint: GRANDFATHERED_ENGINE.corpusFingerprint,
  engineVersion: GRANDFATHERED_ENGINE.engineVersion,
  layerFingerprint: GRANDFATHERED_ENGINE.layerFingerprint,
  observations: BASELINE.observations,
};

const EVIDENCE_BYTES = Buffer.from('# Probe baseline review record\n\nAccepted.\n');
const EVIDENCE_SHA256 = createHash('sha256').update(EVIDENCE_BYTES).digest('hex');
const PACKET_SHA256 = createHash('sha256').update('# Probe baseline review packet\n').digest('hex');

const PRIOR_PROVENANCE = {
  baselineGitBlobSha1: 'a'.repeat(40),
  engine: { engineVersion: '0.7.1', corpusFingerprint: 'b'.repeat(64), layerFingerprint: null },
};

function v1Approval(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    schema: PROBE_BASELINE_APPROVAL_SCHEMA,
    baselineSha256: canonicalJsonSha256(GRANDFATHERED_BASELINE),
    probesSha256: '9'.repeat(64),
    engine: { ...GRANDFATHERED_ENGINE },
    reviewer: 'independent admission baseline reviewer',
    reviewedAt: '2026-08-10',
    rationale: 'The reviewed probe movement is acceptable.',
    priorProvenance: { ...PRIOR_PROVENANCE },
    ...overrides,
  };
}

function v2Approval(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    schema: PROBE_BASELINE_APPROVAL_SCHEMA_V2,
    baselineSha256: canonicalJsonSha256(BASELINE),
    probesSha256: '9'.repeat(64),
    engine: { ...ENGINE },
    reviewerName: 'Genuinely Independent Reviewer',
    reviewerContact: 'reviewer@example.test',
    independence: 'I did not author the data change, the engine code, or the proposal under review.',
    evidence: { path: 'docs/reviews/2026-08-15-probe-baseline-re-review.md', sha256: EVIDENCE_SHA256 },
    reviewPacketSha256: PACKET_SHA256,
    reviewedAt: '2026-08-21',
    rationale: 'The reviewed movement sharpens anchors without silent regression.',
    priorProvenance: { ...PRIOR_PROVENANCE },
    ...overrides,
  };
}

function validate(
  approval: unknown,
  evidenceSha256: string | null = EVIDENCE_SHA256,
  baseline: ProbeBaseline = BASELINE,
) {
  return validateProbeBaselineApproval({
    baseline,
    approval,
    baselineSha256: canonicalJsonSha256(baseline),
    probesSha256: '9'.repeat(64),
    engine: {
      engineVersion: baseline.engineVersion,
      corpusFingerprint: baseline.corpusFingerprint,
      layerFingerprint: baseline.layerFingerprint,
    },
    evidenceSha256,
  });
}

/** Committed-record context: grandfathered identity, no evidence file. */
function validateGrandfathered(approval: unknown) {
  return validate(approval, null, GRANDFATHERED_BASELINE);
}

function categories(findings: readonly { categoryCode?: string }[]): string[] {
  return findings.map((finding) => finding.categoryCode!.split('.').at(-1)!);
}

describe('probe baseline approval schema v2', () => {
  it('validates a complete v2 approval with matching evidence bytes', () => {
    expect(validate(v2Approval())).toEqual([]);
  });

  it('accepts a null priorProvenance only beside a documented bootstrap', () => {
    expect(validate(v2Approval({ priorProvenance: null, bootstrap: 'First baseline for this corpus: no prior record exists to chain.' })))
      .toEqual([]);
    const bare = validate(v2Approval({ priorProvenance: null }));
    expect(categories([...bare])).toEqual(['baseline-approval-malformed']);
    expect(bare[0]!.message).toContain('priorProvenance');
    expect(bare[0]!.message).toContain('bootstrap');
  });

  it('rejects a bootstrap that is blank or rides beside a real priorProvenance', () => {
    const blank = validate(v2Approval({ priorProvenance: null, bootstrap: '   ' }));
    expect(categories([...blank])).toEqual(['baseline-approval-malformed']);
    expect(blank[0]!.message).toContain('bootstrap');
    const both = validate(v2Approval({ bootstrap: 'not actually a bootstrap' }));
    expect(categories([...both])).toEqual(['baseline-approval-malformed']);
    expect(both[0]!.message).toContain('bootstrap');
  });

  it('rejects an unrecognized schema outright', () => {
    expect(categories([...validate(v1Approval({ schema: 'scripture-search-engine/probe-baseline-approval/v3' }))]))
      .toEqual(['baseline-approval-malformed']);
  });

  it('rejects a v2 document that smuggles v1 keys or drops v2 ones, naming the field', () => {
    const smuggled = validate(v2Approval({ reviewer: 'free-text role' }));
    expect(categories([...smuggled])).toEqual(['baseline-approval-malformed']);
    expect(smuggled[0]!.message).toContain('"reviewer"');
    const { independence: _dropped, ...withoutIndependence } = v2Approval();
    const missing = validate(withoutIndependence);
    expect(categories([...missing])).toEqual(['baseline-approval-malformed']);
    expect(missing[0]!.message).toContain('"independence"');
  });

  it('requires the review-packet digest and names it when absent or malformed', () => {
    const { reviewPacketSha256: _dropped, ...withoutPacket } = v2Approval();
    const missing = validate(withoutPacket);
    expect(categories([...missing])).toEqual(['baseline-approval-malformed']);
    expect(missing[0]!.message).toContain('"reviewPacketSha256"');
    const malformed = validate(v2Approval({ reviewPacketSha256: 'not-a-digest' }));
    expect(categories([...malformed])).toEqual(['baseline-approval-malformed']);
    expect(malformed[0]!.message).toContain('"reviewPacketSha256"');
  });

  it('names a blank reviewer identity instead of hiding it in malformation', () => {
    expect(categories([...validate(v2Approval({ reviewerName: '   ' }))]))
      .toEqual(['baseline-approval-reviewer-unidentified']);
    expect(categories([...validate(v2Approval({ reviewerContact: '' }))]))
      .toEqual(['baseline-approval-reviewer-unidentified']);
  });

  it('names a blank independence attestation', () => {
    expect(categories([...validate(v2Approval({ independence: ' ' }))]))
      .toEqual(['baseline-approval-independence-missing']);
  });

  it('fails closed on missing or mismatching evidence bytes', () => {
    expect(categories([...validate(v2Approval(), null)]))
      .toEqual(['baseline-approval-evidence-mismatch']);
    expect(categories([...validate(v2Approval(), '0'.repeat(64))]))
      .toEqual(['baseline-approval-evidence-mismatch']);
  });

  it('rejects evidence paths outside docs/reviews or in absolute form', () => {
    for (const path of ['eval/baselines/evidence.md', 'docs/reviews/../../secrets.md', '/home/user/review.md', 'docs/reviews/record.txt']) {
      expect(APPROVAL_EVIDENCE_PATH_PATTERN.test(path)).toBe(false);
      expect(categories([...validate(v2Approval({ evidence: { path, sha256: EVIDENCE_SHA256 } }))]))
        .toEqual(['baseline-approval-malformed']);
    }
  });

  it('reports every deficiency at once so one fix does not hide the next', () => {
    const findings = validate(v2Approval({ reviewerName: '', independence: '' }), null);
    expect(categories([...findings]).sort()).toEqual([
      'baseline-approval-evidence-mismatch',
      'baseline-approval-independence-missing',
      'baseline-approval-reviewer-unidentified',
    ]);
  });

  it('quotes the approved engine identity on every mismatch finding', () => {
    // The admission classifier's deferred-signing marker check verifies the
    // identity a mismatch finding quotes against the marker's recorded
    // pre-regen identity — a mismatch finding with no quoted identity can
    // never be classified, hard-failing every data train's sign act (found
    // in anger by the D15 sandbox ride).
    const identityParams = {
      engineVersion: ENGINE.engineVersion,
      corpusFingerprint: ENGINE.corpusFingerprint,
      layerFingerprint: ENGINE.layerFingerprint,
    };
    for (const findings of [
      validate(v2Approval({ baselineSha256: '0'.repeat(64) })),
      validate(v2Approval({ probesSha256: '0'.repeat(64) })),
      validate(v2Approval(), null),
      validate(v2Approval(), '0'.repeat(64)),
    ]) {
      expect(findings).toHaveLength(1);
      expect(findings[0]!.params).toEqual(identityParams);
    }
    const engineMismatch = validate(v2Approval({ engine: { ...ENGINE, layerFingerprint: '0'.repeat(64) } }));
    expect(engineMismatch[0]!.params).toEqual({ ...identityParams, layerFingerprint: '0'.repeat(64) });
  });
});

describe('v1 grandfather and sunset', () => {
  it('still validates the committed v1 record: grandfathered identity, pre-sunset date', () => {
    expect(validateGrandfathered(v1Approval())).toEqual([]);
  });

  it('accepts a v1 record dated exactly on the sunset day, but none after it', () => {
    expect(validateGrandfathered(v1Approval({ reviewedAt: APPROVAL_V1_SUNSET_DATE }))).toEqual([]);
    const retired = validateGrandfathered(v1Approval({ reviewedAt: '2026-08-21' }));
    expect(categories([...retired])).toEqual(['baseline-approval-v1-retired']);
    expect(retired[0]!.message).toContain('2026-08-21');
    expect(retired[0]!.message).toContain(APPROVAL_V1_SUNSET_DATE);
  });

  it('rejects a v1 approval for any identity outside the grandfathered records', () => {
    const approval = v1Approval({ baselineSha256: canonicalJsonSha256(BASELINE), engine: { ...ENGINE } });
    const findings = validate(approval, null);
    expect(categories([...findings])).toEqual(['baseline-approval-v1-not-grandfathered']);
    expect(findings[0]!.message).toContain('v2');
  });

  it('keeps every original v1 check: a blank reviewer or missing field is still malformed', () => {
    expect(categories([...validateGrandfathered(v1Approval({ reviewer: '   ' }))]))
      .toEqual(['baseline-approval-malformed']);
    const { rationale: _dropped, ...withoutRationale } = v1Approval();
    expect(categories([...validateGrandfathered(withoutRationale)]))
      .toEqual(['baseline-approval-malformed']);
  });

  it('still binds digests and engine identity exactly, on both schema branches', () => {
    expect(categories([...validate(v2Approval({ baselineSha256: '0'.repeat(64) }))]))
      .toEqual(['baseline-approval-baseline-mismatch']);
    expect(categories([...validate(v2Approval({ probesSha256: '0'.repeat(64) }))]))
      .toEqual(['baseline-approval-probes-mismatch']);
    expect(categories([...validate(v2Approval({ engine: { ...ENGINE, layerFingerprint: '0'.repeat(64) } }))]))
      .toEqual(['baseline-approval-engine-mismatch']);

    expect(categories([...validateGrandfathered(v1Approval({ baselineSha256: '0'.repeat(64) }))]))
      .toEqual(['baseline-approval-baseline-mismatch']);
    expect(categories([...validateGrandfathered(v1Approval({ probesSha256: '9'.repeat(63) + 'a' }))]))
      .toEqual(['baseline-approval-probes-mismatch']);
    // Moving a v1 approval off its identity also moves it out of the
    // grandfather: both facts are reported.
    expect(categories([...validateGrandfathered(v1Approval({
      engine: { ...GRANDFATHERED_ENGINE, layerFingerprint: '0'.repeat(64) },
    }))]).sort()).toEqual([
      'baseline-approval-engine-mismatch',
      'baseline-approval-v1-not-grandfathered',
    ]);
  });
});
