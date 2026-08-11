import { createHash } from 'node:crypto';

import type { ConceptCoverageInput, JudgmentHealthInput } from './health.js';
import type { CaseArtifactIdentity, CaseSnapshot, CaseSource, CaseState } from './cases.js';

export type InboxSeedKind = 'case' | 'suggestion';

export interface CandidateRegressionSeed {
  readonly id: string;
  readonly query: string;
  readonly at: string;
  readonly reason: string;
}

export interface InboxSeed {
  readonly id: string;
  readonly kind: InboxSeedKind;
  readonly query: string;
  readonly source: CaseSource;
  readonly state: CaseState;
  readonly artifact: CaseArtifactIdentity;
  readonly reviewer: string | null;
  readonly createdAt: string;
  readonly reason: string;
  readonly blockingGateFinding: boolean;
  readonly sensitive: boolean;
  readonly staleJudgment: boolean;
  readonly uncoveredConcept: boolean;
  readonly case?: CaseSnapshot;
}

export interface InboxSourceInputs {
  readonly cases: readonly CaseSnapshot[];
  readonly coverage: readonly ConceptCoverageInput[];
  readonly judgments: readonly JudgmentHealthInput[];
  readonly currentArtifact: CaseArtifactIdentity;
  readonly gauntletReport?: unknown;
  readonly candidateRegressions?: readonly CandidateRegressionSeed[];
  readonly now?: Date;
}

const SENSITIVE_TERMS = /\b(abuse|addiction|cancer|depression|despair|divorce|grief|miscarriage|porn|relapse|self[- ]?harm|suicid)\b/i;
const MAX_GAUNTLET_FINDINGS = 200;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function canonicalText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function suggestionId(source: CaseSource, query: string, subject: string): string {
  return `suggestion:${createHash('sha256').update(`${source}\u0000${query}\u0000${subject}`).digest('hex').slice(0, 24)}`;
}

function sameIdentity(left: JudgmentHealthInput, right: CaseArtifactIdentity): boolean {
  return left.engineVersion === right.engineVersion &&
    left.corpusFingerprint === right.corpusFingerprint &&
    left.layerFingerprint === right.layerFingerprint;
}

function queryKey(query: string): string {
  return query.trim().toLowerCase();
}

function safeTimestamp(value: unknown, fallback: string): string {
  const text = canonicalText(value);
  if (text === null || Number.isNaN(Date.parse(text))) return fallback;
  return new Date(text).toISOString();
}

function queryFromFinding(finding: Record<string, unknown>): string | null {
  const direct = canonicalText(finding.query);
  if (direct !== null) return direct;
  const message = canonicalText(finding.message) ?? '';
  const quotedQuery = /(?:query|search)\s+"([^"]+)"/i.exec(message)?.[1]?.trim();
  if (quotedQuery) return quotedQuery;
  if (Array.isArray(finding.subjects)) {
    for (const subject of finding.subjects) {
      const text = canonicalText(subject);
      if (text !== null) return text.replaceAll('-', ' ');
    }
  }
  return null;
}

function gauntletSeeds(report: unknown, artifact: CaseArtifactIdentity, now: string): InboxSeed[] {
  if (!isRecord(report) || !isRecord(report.payload) || !Array.isArray(report.payload.gates)) return [];
  const output: InboxSeed[] = [];
  for (const gate of report.payload.gates) {
    if (!isRecord(gate) || !Array.isArray(gate.findings)) continue;
    const gateId = canonicalText(gate.gate) ?? 'unknown-gate';
    const blocking = gate.status === 'fail' || gate.verdict === 'fail';
    for (const finding of gate.findings) {
      if (output.length >= MAX_GAUNTLET_FINDINGS) return output;
      if (!isRecord(finding)) continue;
      const query = queryFromFinding(finding);
      if (query === null) continue;
      const reason = canonicalText(finding.message) ?? `${gateId} needs a human review.`;
      const subject = Array.isArray(finding.subjects) ? finding.subjects.map(String).join(',') : gateId;
      output.push({
        id: suggestionId('gauntlet', query, `${gateId}:${subject}`),
        kind: 'suggestion',
        query,
        source: 'gauntlet',
        state: 'new',
        artifact,
        reviewer: null,
        createdAt: now,
        reason,
        blockingGateFinding: blocking,
        sensitive: SENSITIVE_TERMS.test(query),
        staleJudgment: false,
        uncoveredConcept: false,
      });
    }
  }
  return output;
}

export function buildInboxSeeds(input: InboxSourceInputs): readonly InboxSeed[] {
  const now = (input.now ?? new Date()).toISOString();
  const candidates: InboxSeed[] = input.cases.map((reviewCase) => ({
    id: reviewCase.caseId,
    kind: 'case',
    query: reviewCase.query,
    source: reviewCase.source,
    state: reviewCase.state,
    artifact: reviewCase.artifact,
    reviewer: reviewCase.events.at(-1)?.reviewer ?? null,
    createdAt: reviewCase.events[0]?.at ?? now,
    reason: reviewCase.state === 'new' ? 'Ready for a first human review.' : 'Human review is in progress.',
    blockingGateFinding: false,
    sensitive: SENSITIVE_TERMS.test(reviewCase.query),
    staleJudgment: input.judgments.some((row) => row.query === reviewCase.query && !sameIdentity(row, input.currentArtifact)),
    uncoveredConcept: false,
    case: reviewCase,
  }));

  candidates.push(...gauntletSeeds(input.gauntletReport, input.currentArtifact, now));

  for (const concept of input.coverage) {
    if (concept.status !== 'uncovered') continue;
    const query = concept.id.replaceAll('-', ' ');
    candidates.push({
      id: suggestionId('coverage', query, concept.id),
      kind: 'suggestion',
      query,
      source: 'coverage',
      state: 'new',
      artifact: input.currentArtifact,
      reviewer: null,
      createdAt: now,
      reason: `The ${concept.id} concept has no active demonstrated fixture.`,
      blockingGateFinding: false,
      sensitive: SENSITIVE_TERMS.test(query),
      staleJudgment: false,
      uncoveredConcept: true,
    });
  }

  for (const judgment of input.judgments) {
    if (sameIdentity(judgment, input.currentArtifact)) continue;
    candidates.push({
      id: suggestionId('stale-judgment', judgment.query, judgment.at),
      kind: 'suggestion',
      query: judgment.query,
      source: 'stale-judgment',
      state: 'new',
      artifact: input.currentArtifact,
      reviewer: null,
      createdAt: safeTimestamp(judgment.at, now),
      reason: 'The prior judgment was made under a different engine, corpus, or layer identity.',
      blockingGateFinding: false,
      sensitive: SENSITIVE_TERMS.test(judgment.query),
      staleJudgment: true,
      uncoveredConcept: false,
    });
  }

  for (const regression of input.candidateRegressions ?? []) {
    const query = canonicalText(regression.query);
    if (query === null) continue;
    candidates.push({
      id: suggestionId('regression', query, regression.id),
      kind: 'suggestion',
      query,
      source: 'regression',
      state: 'new',
      artifact: input.currentArtifact,
      reviewer: null,
      createdAt: safeTimestamp(regression.at, now),
      reason: canonicalText(regression.reason) ?? 'A candidate changed this query.',
      blockingGateFinding: false,
      sensitive: SENSITIVE_TERMS.test(query),
      staleJudgment: false,
      uncoveredConcept: false,
    });
  }

  const bySourceAndQuery = new Map<string, InboxSeed>();
  for (const seed of candidates.sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0)) {
    const key = seed.kind === 'case' ? `case:${seed.id}` : `${seed.source}:${queryKey(seed.query)}`;
    if (!bySourceAndQuery.has(key)) bySourceAndQuery.set(key, seed);
  }
  return [...bySourceAndQuery.values()].sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0);
}
