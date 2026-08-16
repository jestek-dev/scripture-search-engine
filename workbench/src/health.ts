import type { ArtifactDescriptor } from './descriptor.js';
import type { JudgmentIdentity } from './judgments.js';

export interface ArtifactIdentity {
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
}

export interface ReleaseStaleness {
  readonly since: string;
  readonly reason: string;
  readonly blocksRelease?: boolean;
}

export interface ReleaseIdentity extends ArtifactIdentity {
  readonly stale?: ReleaseStaleness;
}

export type IdentityField = keyof ArtifactIdentity;
export type IdentityAlignment = 'aligned' | 'mismatch' | 'missing';
export type HealthStatus = 'healthy' | 'rejected' | 'stale' | 'running' | 'unavailable';
export const HEALTH_SCHEMA_VERSION = 1 as const;
export type GoldenFixtureStatus = 'active' | 'pending';
export type CoverageStatus = 'active' | 'pending' | 'uncovered' | 'stale';
export type GauntletStatus = 'available' | 'healthy' | 'rejected' | 'stale' | 'unavailable' | 'running';
export type GitBranchState = 'main' | 'branch' | 'detached' | 'unavailable';

export interface GoldenFixtureHealthInput {
  readonly id: string;
  readonly status: GoldenFixtureStatus;
  readonly generatedBy?: string;
}

export interface ConceptCoverageInput {
  readonly id: string;
  readonly status: CoverageStatus;
}

export interface JudgmentHealthInput extends JudgmentIdentity {
  readonly query: string;
  readonly at: string;
}

export type LegacyLogStatus = 'closed-canonical' | 'stray-lines' | 'not-canonical' | 'absent';

/**
 * The closed v1 portion of `judgments.jsonl` measured against the migration
 * manifest. A warning surface only: strays degrade compile-judgments, never
 * the server, so this never raises health past a warn.
 */
export interface LegacyLogHealthInput {
  readonly status: LegacyLogStatus;
  readonly strayLineNumbers: readonly number[];
  readonly message: string;
}

export interface GauntletHealthInput {
  readonly status: GauntletStatus;
  readonly verdict?: 'ADMIT' | 'ADMIT_WITH_WARNINGS' | 'REJECT' | 'NO_MEASURABLE_EFFECT';
  readonly summary?: string;
  readonly reason?: string;
  readonly reportPath?: string;
  /** True only after the report identity has been checked against this exact tree. */
  readonly fresh?: boolean;
  readonly mismatchReasons?: readonly string[];
}

export interface GitBranchHealthInput {
  readonly branch: string | null;
  readonly state: GitBranchState;
  readonly dirty: boolean;
  readonly aheadBy: number;
  readonly behindBy: number;
}

/** Problems encountered before the HTTP server began accepting requests. */
export interface StartupHealthInput {
  readonly diagnostics: readonly string[];
}

interface DescriptorWithStale extends ArtifactDescriptor {
  readonly stale?: ReleaseStaleness;
}

export interface HealthSignal {
  readonly area: 'descriptor' | 'artifact' | 'golden' | 'coverage' | 'judgment' | 'gauntlet' | 'git';
  readonly severity: 'warn' | 'error';
  readonly message: string;
  readonly subjects?: readonly string[];
}

export interface HealthInputs {
  readonly release: ReleaseIdentity | null;
  readonly artifact: ArtifactIdentity | null;
  readonly golden: readonly GoldenFixtureHealthInput[];
  readonly coverage: readonly ConceptCoverageInput[];
  readonly judgments: readonly JudgmentHealthInput[];
  readonly gauntlet: GauntletHealthInput | null;
  readonly git: GitBranchHealthInput | null;
  readonly startup?: StartupHealthInput;
  readonly legacyLog?: LegacyLogHealthInput | null;
}

export interface HealthSnapshot {
  readonly schemaVersion: typeof HEALTH_SCHEMA_VERSION;
  readonly status: HealthStatus;
  readonly descriptor: {
    readonly identity: ReleaseIdentity | null;
    readonly alignment: IdentityAlignment;
    readonly mismatchFields: readonly IdentityField[];
    readonly stale: ReleaseStaleness | null;
  };
  readonly artifact: {
    readonly identity: ArtifactIdentity | null;
    readonly matchesDescriptor: boolean;
  };
  readonly golden: {
    readonly total: number;
    readonly active: number;
    readonly pending: number;
    readonly generated: number;
    readonly generatedBy: Readonly<Record<string, number>>;
  };
  readonly coverage: {
    readonly total: number;
    readonly active: number;
    readonly pending: number;
    readonly uncovered: number;
    readonly stale: number;
  };
  readonly judgments: {
    readonly total: number;
    readonly effective: number;
    readonly stale: number;
  };
  readonly legacyLog: {
    readonly status: LegacyLogStatus | 'unavailable';
    readonly strayLineNumbers: readonly number[];
    readonly message: string;
  };
  readonly gauntlet: {
    readonly status: GauntletStatus;
    readonly verdict: GauntletHealthInput['verdict'] | null;
    readonly summary: string | null;
    readonly reason: string | null;
    readonly reportPath: string | null;
  };
  readonly git: {
    readonly branch: string | null;
    readonly state: GitBranchState;
    readonly dirty: boolean;
    readonly aheadBy: number;
    readonly behindBy: number;
  };
  readonly startup: {
    readonly degraded: boolean;
    readonly diagnostics: readonly string[];
  };
  readonly signals: readonly HealthSignal[];
}

const STATUS_PRIORITY: Readonly<Record<HealthStatus, number>> = {
  healthy: 0,
  stale: 1,
  running: 2,
  rejected: 3,
  unavailable: 4,
};

function raiseStatus(current: HealthStatus, next: HealthStatus): HealthStatus {
  return STATUS_PRIORITY[next] > STATUS_PRIORITY[current] ? next : current;
}

const IDENTITY_FIELDS: readonly IdentityField[] = [
  'engineVersion',
  'corpusFingerprint',
  'layerFingerprint',
];

function compareIdentity(
  release: ReleaseIdentity | null,
  artifact: ArtifactIdentity | null,
): { readonly alignment: IdentityAlignment; readonly mismatchFields: readonly IdentityField[] } {
  if (release === null || artifact === null) {
    return { alignment: 'missing', mismatchFields: [] };
  }

  const mismatchFields = IDENTITY_FIELDS.filter((field) => release[field] !== artifact[field]);
  return {
    alignment: mismatchFields.length === 0 ? 'aligned' : 'mismatch',
    mismatchFields,
  };
}

function countByStatus<T extends string>(
  rows: readonly { readonly status: T }[],
  statuses: readonly T[],
): Record<T, number> {
  const counts = Object.fromEntries(statuses.map((status) => [status, 0])) as Record<T, number>;
  for (const row of rows) {
    counts[row.status] += 1;
  }
  return counts;
}

function sortRecord(record: Readonly<Record<string, number>>): Readonly<Record<string, number>> {
  const sorted: Record<string, number> = {};
  for (const key of Object.keys(record).sort((left, right) => left.localeCompare(right))) {
    sorted[key] = record[key] ?? 0;
  }
  return sorted;
}

function pushSignal(
  signals: HealthSignal[],
  area: HealthSignal['area'],
  severity: HealthSignal['severity'],
  message: string,
  subjects?: readonly string[],
): void {
  signals.push(subjects === undefined ? { area, severity, message } : { area, severity, message, subjects });
}

function summarizeJudgments(
  judgments: readonly JudgmentHealthInput[],
  artifact: ArtifactIdentity | null,
): { readonly total: number; readonly effective: number; readonly stale: number } {
  const total = judgments.length;
  if (artifact === null) {
    return { total, effective: 0, stale: total };
  }

  let effective = 0;
  for (const judgment of judgments) {
    if (
      judgment.engineVersion === artifact.engineVersion &&
      judgment.corpusFingerprint === artifact.corpusFingerprint &&
      judgment.layerFingerprint === artifact.layerFingerprint
    ) {
      effective += 1;
    }
  }
  return { total, effective, stale: total - effective };
}

function summarizeGit(git: GitBranchHealthInput | null): HealthSnapshot['git'] {
  if (git === null) {
    return { branch: null, state: 'unavailable', dirty: false, aheadBy: 0, behindBy: 0 };
  }
  return {
    branch: git.branch,
    state: git.state,
    dirty: git.dirty,
    aheadBy: git.aheadBy,
    behindBy: git.behindBy,
  };
}

export function aggregateHealth(input: HealthInputs): HealthSnapshot {
  const signals: HealthSignal[] = [];
  const release = input.release;
  const artifact = input.artifact;
  const identity = compareIdentity(release, artifact);

  let status: HealthStatus = 'healthy';

  if (release === null) {
    pushSignal(signals, 'descriptor', 'error', 'release descriptor identity is unavailable.');
    status = raiseStatus(status, 'unavailable');
  }
  if (artifact === null) {
    pushSignal(signals, 'artifact', 'error', 'current artifact identity is unavailable.');
    status = raiseStatus(status, 'unavailable');
  }
  if (input.git === null) {
    pushSignal(signals, 'git', 'error', 'git branch state is unavailable.');
    status = raiseStatus(status, 'unavailable');
  }
  const startupDiagnostics = input.startup?.diagnostics ?? [];
  if (startupDiagnostics.length > 0) {
    for (const diagnostic of startupDiagnostics) {
      pushSignal(signals, 'artifact', 'error', diagnostic);
    }
    status = raiseStatus(status, 'unavailable');
  }

  if (identity.alignment === 'mismatch') {
    pushSignal(
      signals,
      'descriptor',
      'error',
      `descriptor and artifact identities diverge on ${identity.mismatchFields.join(', ')}.`,
      identity.mismatchFields,
    );
    status = raiseStatus(status, 'rejected');
  }

  const descriptorStale = release?.stale ?? null;
  if (descriptorStale !== null) {
    pushSignal(
      signals,
      'descriptor',
      'warn',
      descriptorStale.reason,
      descriptorStale.blocksRelease === true ? ['blocksRelease'] : undefined,
    );
    status = raiseStatus(status, 'stale');
  }

  const goldenCounts = countByStatus(input.golden, ['active', 'pending']);
  const generatedBy = new Map<string, number>();
  for (const fixture of input.golden) {
    if (fixture.generatedBy === undefined) continue;
    generatedBy.set(fixture.generatedBy, (generatedBy.get(fixture.generatedBy) ?? 0) + 1);
  }
  const goldenGenerated = [...generatedBy.values()].reduce((sum, value) => sum + value, 0);
  if (goldenCounts.pending > 0) {
    pushSignal(
      signals,
      'golden',
      'warn',
      `${goldenCounts.pending} pending golden fixture(s) still need promotion.`,
    );
    status = raiseStatus(status, 'stale');
  }

  const coverageCounts = countByStatus(input.coverage, ['active', 'pending', 'uncovered', 'stale']);
  if (coverageCounts.pending > 0) {
    pushSignal(signals, 'coverage', 'warn', `${coverageCounts.pending} concept coverage item(s) are pending.`);
    status = raiseStatus(status, 'stale');
  }
  if (coverageCounts.uncovered > 0) {
    pushSignal(
      signals,
      'coverage',
      'warn',
      `${coverageCounts.uncovered} concept coverage item(s) are uncovered.`,
    );
    status = raiseStatus(status, 'stale');
  }
  if (coverageCounts.stale > 0) {
    pushSignal(signals, 'coverage', 'warn', `${coverageCounts.stale} concept coverage item(s) are stale.`);
    status = raiseStatus(status, 'stale');
  }

  // Warning only, by design: the compiler is where a bad legacy log fails
  // closed, so health reports it without ever degrading the server.
  const legacyLog = input.legacyLog ?? null;
  if (legacyLog !== null && legacyLog.status !== 'closed-canonical' && legacyLog.status !== 'absent') {
    pushSignal(
      signals,
      'judgment',
      'warn',
      legacyLog.message,
      legacyLog.strayLineNumbers.length > 0 ? legacyLog.strayLineNumbers.map(String) : undefined,
    );
    status = raiseStatus(status, 'stale');
  }

  const judgmentCounts = summarizeJudgments(input.judgments, artifact);
  if (judgmentCounts.stale > 0) {
    pushSignal(
      signals,
      'judgment',
      'warn',
      `${judgmentCounts.stale} judgment(s) were made under stale identities.`,
    );
    status = raiseStatus(status, 'stale');
  }

  if (input.gauntlet === null) {
    pushSignal(signals, 'gauntlet', 'error', 'no gauntlet report was provided.');
    status = raiseStatus(status, 'unavailable');
  } else {
    if (
      input.gauntlet.fresh !== true &&
      input.gauntlet.status !== 'running' &&
      input.gauntlet.status !== 'stale' &&
      input.gauntlet.status !== 'unavailable'
    ) {
      const reasons = input.gauntlet.mismatchReasons ?? ['report identity was not verified'];
      pushSignal(
        signals,
        'gauntlet',
        'error',
        `latest gauntlet report is stale: ${reasons.join('; ')}.`,
        reasons,
      );
      status = raiseStatus(status, 'rejected');
    }
    switch (input.gauntlet.status) {
      case 'running':
        status = raiseStatus(status, 'running');
        break;
      case 'unavailable':
        pushSignal(
          signals,
          'gauntlet',
          'error',
          input.gauntlet.reason ?? 'latest gauntlet report is unavailable.',
        );
        status = raiseStatus(status, 'unavailable');
        break;
      case 'rejected':
        pushSignal(
          signals,
          'gauntlet',
          'error',
          input.gauntlet.reason ?? 'latest gauntlet report rejected the current state.',
        );
        status = raiseStatus(status, 'rejected');
        break;
      case 'stale':
        pushSignal(
          signals,
          'gauntlet',
          'warn',
          input.gauntlet.reason ?? 'latest gauntlet report is stale for this checkout.',
        );
        status = raiseStatus(status, 'stale');
        break;
      case 'available':
        pushSignal(signals, 'gauntlet', 'warn', 'latest gauntlet report is available but not green yet.');
        status = raiseStatus(status, 'stale');
        break;
      case 'healthy':
        if (input.gauntlet.verdict !== 'ADMIT') {
          pushSignal(signals, 'gauntlet', 'error', 'latest gauntlet verdict is not exact ADMIT.');
          status = raiseStatus(status, 'rejected');
        }
        break;
    }
  }

  const git = summarizeGit(input.git);
  if (git.state === 'detached') {
    pushSignal(signals, 'git', 'warn', 'git is on a detached HEAD.');
    status = raiseStatus(status, 'stale');
  }

  const counts = {
    total: input.golden.length,
    active: goldenCounts.active,
    pending: goldenCounts.pending,
    generated: goldenGenerated,
    generatedBy: sortRecord(Object.fromEntries([...generatedBy.entries()])),
  };

  return {
    schemaVersion: HEALTH_SCHEMA_VERSION,
    status,
    descriptor: {
      identity: release,
      alignment: identity.alignment,
      mismatchFields: identity.mismatchFields,
      stale: descriptorStale,
    },
    artifact: {
      identity: artifact,
      matchesDescriptor: identity.alignment === 'aligned',
    },
    golden: counts,
    coverage: {
      total: input.coverage.length,
      active: coverageCounts.active,
      pending: coverageCounts.pending,
      uncovered: coverageCounts.uncovered,
      stale: coverageCounts.stale,
    },
    judgments: judgmentCounts,
    legacyLog: legacyLog === null
      ? { status: 'unavailable', strayLineNumbers: [], message: 'Legacy judgment log state was not checked.' }
      : {
          status: legacyLog.status,
          strayLineNumbers: legacyLog.strayLineNumbers,
          message: legacyLog.message,
        },
    gauntlet: {
      status: input.gauntlet?.status ?? 'unavailable',
      verdict: input.gauntlet?.verdict ?? null,
      summary: input.gauntlet?.summary ?? null,
      reason: input.gauntlet?.reason ?? null,
      reportPath: input.gauntlet?.reportPath ?? null,
    },
    git,
    startup: {
      degraded: startupDiagnostics.length > 0,
      diagnostics: startupDiagnostics,
    },
    signals,
  };
}

export function identityOfDescriptor(descriptor: ArtifactDescriptor): ReleaseIdentity {
  const stale = (descriptor as DescriptorWithStale).stale;
  return {
    engineVersion: descriptor.engineVersion,
    corpusFingerprint: descriptor.corpusFingerprint,
    layerFingerprint: descriptor.layerFingerprint,
    ...(stale !== undefined ? { stale } : {}),
  };
}
