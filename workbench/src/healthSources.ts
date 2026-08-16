import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import { repoRoot } from './descriptor.js';
import type {
  ConceptCoverageInput,
  GitBranchHealthInput,
  GoldenFixtureHealthInput,
  JudgmentHealthInput,
  GauntletHealthInput,
  LegacyLogHealthInput,
} from './health.js';
import {
  GAUNTLET_RUNNING_MARKER_SCHEMA,
  captureRepositoryIdentity,
  parseGauntletOptions,
  repositoryIdentitiesMatch,
  verifyMachineReportFreshness,
  type GauntletOptions,
  type RepositoryRunIdentity,
} from '../../eval/src/gauntletMachineReport.js';

const execFileAsync = promisify(execFile);
export const GAUNTLET_REPORT_PATH = path.join(repoRoot, 'eval', '.runs', 'gauntlet-report.json');
export const GAUNTLET_RUNNING_DIRECTORY = path.join(repoRoot, 'eval', '.runs');
const RUNNING_MARKER_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const VERDICTS = new Set(['ADMIT', 'ADMIT_WITH_WARNINGS', 'REJECT', 'NO_MEASURABLE_EFFECT']);

function pathIsInside(parent: string, candidate: string): boolean {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate));
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

/** Keep an external report diagnosable without presenting a traversal-looking path. */
export function displayReportPath(reportPath: string): string {
  const resolved = path.resolve(reportPath);
  if (pathIsInside(repoRoot, resolved)) {
    return path.relative(repoRoot, resolved).replaceAll('\\', '/');
  }
  return `external:${resolved.replaceAll('\\', '/')}`;
}

function mismatchClass(
  mismatches: readonly { readonly code?: string; readonly message: string }[],
): 'stale' | 'rejected' | 'unavailable' {
  if (mismatches.some((mismatch) => mismatch.code?.includes('invalid-shape') || mismatch.code?.includes('verification-error'))) {
    return 'unavailable';
  }
  if (mismatches.some((mismatch) => mismatch.code?.includes('digest-mismatch') || mismatch.code?.includes('report-path-mismatch'))) {
    return 'rejected';
  }
  return 'stale';
}

export function gauntletHealthFromParsed(
  parsed: unknown,
  freshness: {
    readonly fresh: boolean;
    readonly mismatches: readonly { readonly code?: string; readonly message: string }[];
  },
  reportPath: string,
): GauntletHealthInput {
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {
      status: 'unavailable',
      reason: 'latest gauntlet report is not a JSON object.',
      reportPath,
      fresh: false,
      mismatchReasons: ['invalid report shape'],
    };
  }
  const record = parsed as Record<string, unknown>;
  const payload = record['payload'];
  const payloadRecord =
    typeof payload === 'object' && payload !== null && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : null;
  const verdict = payloadRecord?.['verdict'];
  const headline = payloadRecord?.['headline'];
  if (typeof verdict !== 'string' || !VERDICTS.has(verdict)) {
    return {
      status: 'unavailable',
      reason: 'latest gauntlet report has no valid verdict.',
      reportPath,
      fresh: false,
      mismatchReasons: freshness.mismatches.map((mismatch) => mismatch.message),
    };
  }
  const mismatchReasons = freshness.mismatches.map((mismatch) => mismatch.message);
  const staleOrRejected = mismatchClass(freshness.mismatches);
  return {
    status: freshness.fresh ? (verdict === 'ADMIT' ? 'healthy' : 'rejected') : staleOrRejected,
    verdict: verdict as NonNullable<GauntletHealthInput['verdict']>,
    ...(typeof headline === 'string' ? { summary: headline } : {}),
    ...(!freshness.fresh ? { reason: mismatchReasons.join('; ') } : {}),
    reportPath,
    fresh: freshness.fresh,
    ...(mismatchReasons.length > 0 ? { mismatchReasons } : {}),
  };
}

interface RunningMarker {
  readonly schema: typeof GAUNTLET_RUNNING_MARKER_SCHEMA;
  readonly startedAt: string;
  readonly pid: number;
  readonly identity: RepositoryRunIdentity;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSha(value: unknown, length: number): value is string {
  return typeof value === 'string' && new RegExp(`^[a-f0-9]{${length}}$`).test(value);
}

function exactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
): boolean {
  const allowed = new Set([...required, ...optional]);
  return required.every((key) => Object.hasOwn(value, key)) && Object.keys(value).every((key) => allowed.has(key));
}

function isIsoInstant(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString() === value;
}

function parseMarkerFlags(value: unknown): GauntletOptions | null {
  if (!isRecord(value) || !exactKeys(value, ['checkSources', 'updateBaseline', 'requireAdmit', 'argv'], ['jsonPath'])) {
    return null;
  }
  if (
    typeof value['checkSources'] !== 'boolean' ||
    typeof value['updateBaseline'] !== 'boolean' ||
    typeof value['requireAdmit'] !== 'boolean' ||
    !Array.isArray(value['argv']) ||
    !value['argv'].every((argument) => typeof argument === 'string') ||
    (value['jsonPath'] !== undefined && !isNonEmptyString(value['jsonPath']))
  ) {
    return null;
  }
  try {
    const parsed = parseGauntletOptions(value['argv']);
    return parsed.checkSources === value['checkSources'] &&
      parsed.updateBaseline === value['updateBaseline'] &&
      parsed.requireAdmit === value['requireAdmit'] &&
      parsed.jsonPath === value['jsonPath']
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function parseRepositoryIdentity(value: unknown): RepositoryRunIdentity | null {
  if (!isRecord(value) || !exactKeys(value, [
    'gitCommitSha',
    'dirtyTreeSha256',
    'descriptor',
    'budgetsSha256',
    'fixtureInputSha256',
    'flags',
  ])) return null;
  if (!isRecord(value['descriptor']) || !exactKeys(value['descriptor'], ['path', 'sha256'])) return null;
  const flags = parseMarkerFlags(value['flags']);
  if (flags === null) return null;
  const descriptor = value['descriptor'];
  if (!(isSha(value['gitCommitSha'], 40) &&
    isSha(value['dirtyTreeSha256'], 64) &&
    descriptor['path'] === 'artifacts/content-artifact.json' &&
    isSha(descriptor['sha256'], 64) &&
    isSha(value['budgetsSha256'], 64) &&
    isSha(value['fixtureInputSha256'], 64))) return null;
  return {
    gitCommitSha: value['gitCommitSha'],
    dirtyTreeSha256: value['dirtyTreeSha256'],
    descriptor: { path: descriptor['path'], sha256: descriptor['sha256'] },
    budgetsSha256: value['budgetsSha256'],
    fixtureInputSha256: value['fixtureInputSha256'],
    flags,
  };
}

function parseRunningMarker(value: unknown): RunningMarker | null {
  if (!isRecord(value) || !exactKeys(value, ['schema', 'pid', 'startedAt', 'identity'])) return null;
  if (value['schema'] !== GAUNTLET_RUNNING_MARKER_SCHEMA) return null;
  const pid = value['pid'];
  if (typeof pid !== 'number' || !Number.isInteger(pid) || pid <= 0) return null;
  if (!isIsoInstant(value['startedAt'])) return null;
  const identity = parseRepositoryIdentity(value['identity']);
  if (identity === null) return null;
  return {
    schema: GAUNTLET_RUNNING_MARKER_SCHEMA,
    pid,
    startedAt: value['startedAt'],
    identity,
  };
}

function processIsAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    // EPERM proves a process exists but cannot be signalled by this user.
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
}

async function defaultMarkerPaths(): Promise<readonly string[]> {
  try {
    return (await readdir(GAUNTLET_RUNNING_DIRECTORY))
      .filter((name) => /^gauntlet-running-\d+\.json$/.test(name))
      .sort()
      .map((name) => path.join(GAUNTLET_RUNNING_DIRECTORY, name));
  } catch {
    return [];
  }
}

function markerFilenameMatches(markerPath: string, marker: RunningMarker): boolean {
  return path.basename(markerPath) === `gauntlet-running-${marker.pid}.json`;
}

function markerIdentityMatchesCurrentRepository(marker: RunningMarker): boolean {
  try {
    return repositoryIdentitiesMatch(
      marker.identity,
      captureRepositoryIdentity(repoRoot, marker.identity.flags),
    );
  } catch {
    return false;
  }
}

function markerIsLive(marker: RunningMarker): boolean {
  const startedAt = Date.parse(marker.startedAt);
  const now = Date.now();
  return startedAt <= now + 5_000 && now - startedAt <= RUNNING_MARKER_MAX_AGE_MS && processIsAlive(marker.pid);
}

async function readActiveMarker(markerPath?: string): Promise<GauntletHealthInput | null> {
  const configured = markerPath ?? process.env.WORKBENCH_GAUNTLET_RUNNING_PATH;
  const paths = configured === undefined ? await defaultMarkerPaths() : [configured];
  const active: { readonly marker: RunningMarker; readonly path: string }[] = [];
  for (const candidate of paths) {
    try {
      const marker = parseRunningMarker(JSON.parse(await readFile(candidate, 'utf8')) as unknown);
      if (
        marker !== null &&
        markerFilenameMatches(candidate, marker) &&
        markerIsLive(marker) &&
        markerIdentityMatchesCurrentRepository(marker)
      ) {
        active.push({ marker, path: candidate });
      }
    } catch {
      // Markers are advisory only after all live identity checks succeed.
    }
  }
  const newest = active.sort((left, right) =>
    Date.parse(right.marker.startedAt) - Date.parse(left.marker.startedAt) || left.path.localeCompare(right.path),
  )[0];
  return newest === undefined
    ? null
    : { status: 'running', summary: 'gauntlet run is active', reportPath: displayReportPath(newest.path) };
}

/** Returns only a currently live, identity-bound gauntlet run. */
export async function readActiveGauntletRun(markerPath?: string): Promise<GauntletHealthInput | null> {
  return readActiveMarker(markerPath);
}

export async function readGauntletHealth(
  reportPath: string = process.env.WORKBENCH_GAUNTLET_REPORT_PATH ?? GAUNTLET_REPORT_PATH,
): Promise<GauntletHealthInput> {
  const running = await readActiveGauntletRun();
  if (running !== null) return running;
  try {
    const parsed = JSON.parse(await readFile(reportPath, 'utf8')) as unknown;
    return gauntletHealthFromParsed(
      parsed,
      verifyMachineReportFreshness(repoRoot, reportPath, parsed),
      displayReportPath(reportPath),
    );
  } catch (error) {
    return {
      status: 'unavailable',
      reason: `latest gauntlet report is unavailable: ${error instanceof Error ? error.message : 'unknown error'}`,
      reportPath: displayReportPath(reportPath),
      fresh: false,
      mismatchReasons: ['report unavailable or malformed'],
    };
  }
}

interface GoldenFile {
  readonly id?: unknown;
  readonly status?: unknown;
  readonly generatedBy?: unknown;
  readonly coversConcepts?: unknown;
  readonly query?: unknown;
  readonly expectedTop?: unknown;
}

async function jsonFiles(directory: string): Promise<readonly string[]> {
  try {
    return (await readdir(directory))
      .filter((name) => name.endsWith('.json'))
      .sort()
      .map((name) => path.join(directory, name));
  } catch {
    return [];
  }
}

function yamlScalar(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      return typeof parsed === 'string' ? parsed : null;
    } catch {
      return null;
    }
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replaceAll("''", "'");
  }
  return trimmed.split(/\s+#/, 1)[0] ?? null;
}

export async function readGoldenAndCoverage(): Promise<{
  readonly golden: readonly GoldenFixtureHealthInput[];
  readonly coverage: readonly ConceptCoverageInput[];
}> {
  const fixturePaths = await jsonFiles(path.join(repoRoot, 'eval', 'golden'));
  const golden: GoldenFixtureHealthInput[] = [];
  const fixtures: GoldenFile[] = [];
  for (const fixturePath of fixturePaths) {
    try {
      const fixture = JSON.parse(await readFile(fixturePath, 'utf8')) as GoldenFile;
      fixtures.push(fixture);
      golden.push({
        id: path.basename(fixturePath, '.json'),
        status: fixture.status === 'pending' ? 'pending' : 'active',
        ...(typeof fixture.generatedBy === 'string' ? { generatedBy: fixture.generatedBy } : {}),
      });
    } catch {
      // The gauntlet owns malformed-fixture diagnostics.
    }
  }

  const coverage: ConceptCoverageInput[] = [];
  const conceptDirectory = path.join(repoRoot, 'ontology', 'concepts');
  try {
    for (const name of (await readdir(conceptDirectory)).filter((entry) => entry.endsWith('.yaml')).sort()) {
      const source = await readFile(path.join(conceptDirectory, name), 'utf8');
      const id = /^id:\s*([^\s#]+)/m.exec(source)?.[1];
      const labelMatch = /^label:\s*(.+?)\s*$/m.exec(source)?.[1];
      const label = labelMatch === undefined ? undefined : yamlScalar(labelMatch);
      if (id === undefined || label === undefined || label === null || label.length === 0) continue;
      const expectedLabel = `Theme: ${label}`;
      const demonstrated = fixtures.some((fixture) => {
        const explicitlyClaimed = fixture.coversConcepts !== undefined;
        const claimed = Array.isArray(fixture.coversConcepts)
          ? fixture.coversConcepts
          : !explicitlyClaimed && fixture.id === id
            ? [id]
            : [];
        return claimed.includes(id) &&
          fixture.status === 'active' &&
          typeof fixture.query === 'string' &&
          fixture.query.trim().length > 0 &&
          Array.isArray(fixture.expectedTop) &&
          fixture.expectedTop.some((expectation) =>
            isRecord(expectation) &&
            expectation['requiredReasonFamily'] === 'concept_anchor' &&
            expectation['requiredReasonLabel'] === expectedLabel,
          );
      });
      coverage.push({ id, status: demonstrated ? 'active' : 'uncovered' });
    }
  } catch {
    // A missing ontology is represented by an empty set and a rejected gauntlet.
  }
  return { golden, coverage };
}

export async function readJudgmentHealth(
  judgmentPath: string = process.env.WORKBENCH_JUDGMENTS_PATH ?? path.join(repoRoot, 'workbench', 'judgments.jsonl'),
): Promise<readonly JudgmentHealthInput[]> {
  try {
    const lines = (await readFile(judgmentPath, 'utf8'))
      .split(/\r?\n/)
      .filter(Boolean);
    const judgments: JudgmentHealthInput[] = [];
    for (const line of lines) {
      try {
        const row = JSON.parse(line) as Partial<JudgmentHealthInput>;
        if (
          typeof row.query === 'string' &&
          typeof row.at === 'string' &&
          typeof row.engineVersion === 'string' &&
          typeof row.corpusFingerprint === 'string' &&
          typeof row.layerFingerprint === 'string'
        ) {
          judgments.push(row as JudgmentHealthInput);
        }
      } catch {
        // Ignore a torn final append; the compiler owns log repair.
      }
    }
    return judgments;
  } catch {
    return [];
  }
}

/**
 * Reconciles the closed v1 portion of `judgments.jsonl` against the
 * migration manifest, by line digest, at true file line numbers. A health
 * warning surface only — it never throws and never degrades the server; the
 * compiler stays the fail-closed guard.
 */
export async function readLegacyLogHealth(
  judgmentsPath: string = process.env.WORKBENCH_JUDGMENTS_PATH ?? path.join(repoRoot, 'workbench', 'judgments.jsonl'),
  manifestPath: string = path.join(repoRoot, 'workbench', 'legacy', 'migration-manifest.json'),
): Promise<LegacyLogHealthInput | null> {
  const manifestShaCounts = new Map<string, number>();
  let manifestedLineTotal = 0;
  try {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as {
      cases?: readonly { entries?: readonly { lineSha256?: unknown }[] }[];
    };
    for (const legacyCase of manifest.cases ?? []) {
      for (const entry of legacyCase.entries ?? []) {
        if (typeof entry.lineSha256 !== 'string') continue;
        manifestShaCounts.set(entry.lineSha256, (manifestShaCounts.get(entry.lineSha256) ?? 0) + 1);
        manifestedLineTotal += 1;
      }
    }
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {
        status: 'absent',
        strayLineNumbers: [],
        message: 'No legacy migration manifest; there is no closed v1 log to reconcile.',
      };
    }
    return null;
  }

  let raw: string;
  try {
    raw = await readFile(judgmentsPath, 'utf8');
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') return null;
    raw = '';
  }

  const strayLineNumbers: number[] = [];
  let matchedLineTotal = 0;
  const remaining = new Map(manifestShaCounts);
  const lines = raw.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]!;
    if (line.trim() === '') continue;
    try {
      if (Object.hasOwn(JSON.parse(line) as object, 'schemaVersion')) continue;
    } catch {
      strayLineNumbers.push(index + 1);
      continue;
    }
    const digest = createHash('sha256').update(Buffer.from(line, 'utf8')).digest('hex');
    const available = remaining.get(digest) ?? 0;
    if (available > 0) {
      remaining.set(digest, available - 1);
      matchedLineTotal += 1;
    } else {
      strayLineNumbers.push(index + 1);
    }
  }

  if (strayLineNumbers.length > 0) {
    return {
      status: 'stray-lines',
      strayLineNumbers,
      message:
        `judgments.jsonl line(s) ${strayLineNumbers.join(', ')} hold legacy v1 record(s) outside the closed ` +
        'migration manifest. Delete the stray line(s) and re-enter each judgment through the v2 workbench; ' +
        'the manifested lines stay untouched.',
    };
  }
  if (matchedLineTotal !== manifestedLineTotal) {
    return {
      status: 'not-canonical',
      strayLineNumbers: [],
      message:
        `judgments.jsonl matches only ${matchedLineTotal} of ${manifestedLineTotal} manifested v1 line(s); ` +
        'a closed legacy line was edited or deleted. Restore workbench/judgments.jsonl from git history.',
    };
  }
  return {
    status: 'closed-canonical',
    strayLineNumbers: [],
    message: `Legacy judgment log is closed and canonical (${manifestedLineTotal} manifested v1 lines).`,
  };
}

async function git(args: readonly string[]): Promise<string> {
  const { stdout } = await execFileAsync('git', [...args], { cwd: repoRoot, windowsHide: true });
  return stdout.trim();
}

export async function readGitHealth(): Promise<GitBranchHealthInput | null> {
  try {
    const [branch, porcelain] = await Promise.all([
      git(['branch', '--show-current']),
      git(['status', '--porcelain=v1']),
    ]);
    let aheadBy = 0;
    let behindBy = 0;
    try {
      const counts = await git(['rev-list', '--left-right', '--count', 'origin/main...HEAD']);
      const [behind = '0', ahead = '0'] = counts.split(/\s+/);
      behindBy = Number(behind) || 0;
      aheadBy = Number(ahead) || 0;
    } catch {
      // Local branch health is still useful without origin/main.
    }
    return {
      branch: branch || null,
      state: branch === '' ? 'detached' : branch === 'main' ? 'main' : 'branch',
      dirty: porcelain !== '',
      aheadBy,
      behindBy,
    };
  } catch {
    return null;
  }
}
