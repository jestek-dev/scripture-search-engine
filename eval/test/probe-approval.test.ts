/**
 * Approval schema v2: an approval is valid only when it names an identifiable
 * independent reviewer, attests to what they did not author, and binds the
 * review record's bytes. The committed approval is still the v1 record, so
 * v1 validates too — with exactly its original checks, none loosened — until
 * the cutover commit re-issues the approval as a signed v2 record and deletes
 * v1 acceptance in the same change. That commit is held unopened until the
 * designated reviewer signs (docs/governance/probe-baseline-review.md), so
 * the repository never carries an approval its own gauntlet rejects.
 */

import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  APPROVAL_EVIDENCE_PATH_PATTERN,
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

const EVIDENCE_BYTES = Buffer.from('# Probe baseline review record\n\nAccepted.\n');
const EVIDENCE_SHA256 = createHash('sha256').update(EVIDENCE_BYTES).digest('hex');

const PRIOR_PROVENANCE = {
  baselineGitBlobSha1: 'a'.repeat(40),
  engine: { engineVersion: '0.7.1', corpusFingerprint: 'b'.repeat(64), layerFingerprint: null },
};

function v1Approval(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    schema: PROBE_BASELINE_APPROVAL_SCHEMA,
    baselineSha256: canonicalJsonSha256(BASELINE),
    probesSha256: '9'.repeat(64),
    engine: { ...ENGINE },
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
    reviewedAt: '2026-08-15',
    rationale: 'The reviewed movement sharpens anchors without silent regression.',
    priorProvenance: { ...PRIOR_PROVENANCE },
    ...overrides,
  };
}

function validate(approval: unknown, evidenceSha256: string | null = EVIDENCE_SHA256) {
  return validateProbeBaselineApproval({
    baseline: BASELINE,
    approval,
    baselineSha256: canonicalJsonSha256(BASELINE),
    probesSha256: '9'.repeat(64),
    engine: ENGINE,
    evidenceSha256,
  });
}

function categories(findings: readonly { categoryCode?: string }[]): string[] {
  return findings.map((finding) => finding.categoryCode!.split('.').at(-1)!);
}

describe('probe baseline approval schema v2', () => {
  it('validates a complete v2 approval with matching evidence bytes', () => {
    expect(validate(v2Approval())).toEqual([]);
  });

  it('still validates the committed v1 record with its original checks until the signed cutover', () => {
    expect(validate(v1Approval(), null)).toEqual([]);
  });

  it('keeps every original v1 check: a blank reviewer or missing field is still malformed', () => {
    expect(categories([...validate(v1Approval({ reviewer: '   ' }), null)]))
      .toEqual(['baseline-approval-malformed']);
    const { rationale: _dropped, ...withoutRationale } = v1Approval();
    expect(categories([...validate(withoutRationale, null)]))
      .toEqual(['baseline-approval-malformed']);
  });

  it('rejects an unrecognized schema outright', () => {
    expect(categories([...validate(v1Approval({ schema: 'scripture-search-engine/probe-baseline-approval/v3' }))]))
      .toEqual(['baseline-approval-malformed']);
  });

  it('rejects a v2 document that smuggles v1 keys or drops v2 ones', () => {
    expect(categories([...validate(v2Approval({ reviewer: 'free-text role' }))]))
      .toEqual(['baseline-approval-malformed']);
    const { independence: _dropped, ...withoutIndependence } = v2Approval();
    expect(categories([...validate(withoutIndependence)]))
      .toEqual(['baseline-approval-malformed']);
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

  it('still binds digests and engine identity exactly, on both schema branches', () => {
    for (const approval of [
      () => ({ document: v2Approval, evidence: EVIDENCE_SHA256 }),
      () => ({ document: v1Approval, evidence: null }),
    ]) {
      const { document, evidence } = approval();
      expect(categories([...validate(document({ baselineSha256: '0'.repeat(64) }), evidence)]))
        .toEqual(['baseline-approval-baseline-mismatch']);
      expect(categories([...validate(document({ probesSha256: '0'.repeat(64) }), evidence)]))
        .toEqual(['baseline-approval-probes-mismatch']);
      expect(categories([...validate(document({ engine: { ...ENGINE, layerFingerprint: '0'.repeat(64) } }), evidence)]))
        .toEqual(['baseline-approval-engine-mismatch']);
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
});
