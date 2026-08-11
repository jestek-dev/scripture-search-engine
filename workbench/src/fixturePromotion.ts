import { createHash } from 'node:crypto';
import { lstat, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';

import { validateCorpusFixture } from '../../eval/src/gates/corpusGolden.js';
import { verifyMachineReportFreshness } from '../../eval/src/gauntletMachineReport.js';

import {
  applyMutationPlan,
  createMutationPlan,
  type ApplyOptions,
  type ApplyResult,
  type MutationPlan,
} from './applyJournal.js';

export interface FixturePromotionEvidence {
  readonly reportPath: string;
  readonly reportSha256: string;
  readonly finishedAt: string;
  readonly gateSummary: string;
}

export type PromotionEvidenceVerifier = (
  repoRoot: string,
  fixtureId: string,
) => Promise<FixturePromotionEvidence>;

export interface FixturePromotionOptions {
  readonly reportPath?: string;
  /** Dependency seam for deterministic tests; production uses the signed report. */
  readonly evidenceVerifier?: PromotionEvidenceVerifier;
}

export interface FixturePromotionPlan {
  readonly schemaVersion: 1;
  readonly fixtureId: string;
  readonly fixturePath: string;
  readonly fromStatus: 'pending';
  readonly toStatus: 'active';
  readonly before: { readonly text: string; readonly base64: string; readonly sha256: string };
  readonly after: { readonly text: string; readonly base64: string; readonly sha256: string };
  readonly evidence: FixturePromotionEvidence;
  readonly mutationPlan: MutationPlan;
  readonly digest: string;
}

export interface ApplyFixturePromotionOptions extends FixturePromotionOptions {
  readonly apply?: ApplyOptions;
}

export class FixturePromotionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FixturePromotionError';
  }
}

function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function canonical(value: unknown): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (!isRecord(value)) throw new FixturePromotionError('Promotion plan contains non-JSON data.');
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
}

function safeFixtureId(value: string): string {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.trim() !== value ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
  ) {
    throw new FixturePromotionError('fixtureId must be a lowercase filename slug.');
  }
  return value;
}

async function safeFixturePath(repoRoot: string, fixtureId: string): Promise<{ root: string; target: string; relative: string }> {
  const requestedRoot = path.resolve(repoRoot);
  const rootStats = await lstat(requestedRoot).catch(() => null);
  if (rootStats === null || !rootStats.isDirectory() || rootStats.isSymbolicLink()) {
    throw new FixturePromotionError('Repository root must be a real directory.');
  }
  const root = await realpath(requestedRoot);
  const relative = `eval/golden/${safeFixtureId(fixtureId)}.json`;
  let current = root;
  for (const component of relative.split('/')) {
    current = path.join(current, component);
    const stats = await lstat(current).catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    if (stats === null) throw new FixturePromotionError(`Fixture ${fixtureId} does not exist.`);
    if (stats.isSymbolicLink()) throw new FixturePromotionError('Fixture path may not contain links or junctions.');
  }
  const target = await realpath(current);
  const contained = path.relative(root, target);
  if (contained.startsWith(`..${path.sep}`) || contained === '..' || path.isAbsolute(contained)) {
    throw new FixturePromotionError('Fixture path resolves outside the repository.');
  }
  const targetStats = await lstat(target);
  if (!targetStats.isFile()) throw new FixturePromotionError(`Fixture ${fixtureId} is not a regular file.`);
  return { root, target, relative };
}

async function defaultEvidenceVerifier(
  repoRoot: string,
  fixtureId: string,
  configuredReportPath?: string,
): Promise<FixturePromotionEvidence> {
  const reportPath = path.resolve(
    configuredReportPath ?? path.join(repoRoot, 'eval', '.runs', 'gauntlet-report.json'),
  );
  let bytes: Buffer;
  let parsed: unknown;
  try {
    bytes = await readFile(reportPath);
    parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw new FixturePromotionError('A valid gauntlet report is required before promotion.');
  }
  const freshness = verifyMachineReportFreshness(repoRoot, reportPath, parsed);
  if (!freshness.fresh) {
    throw new FixturePromotionError('The gauntlet report is stale; run the gauntlet again before promotion.');
  }
  if (!isRecord(parsed) || !isRecord(parsed.payload) || !Array.isArray(parsed.payload.gates)) {
    throw new FixturePromotionError('The gauntlet report does not contain gate results.');
  }
  const gate = parsed.payload.gates.find(
    (candidate): candidate is Record<string, unknown> =>
      isRecord(candidate) && candidate.gate === 'G3-golden',
  );
  const summary = gate?.summary;
  const candidates = gate?.promotionCandidates;
  if (
    typeof summary !== 'string' ||
    !Array.isArray(candidates) ||
    !candidates.every((candidate) => typeof candidate === 'string') ||
    !candidates.includes(fixtureId)
  ) {
    throw new FixturePromotionError(`Fixture ${fixtureId} is not proven passing by the current G3 result.`);
  }
  if (typeof parsed.finishedAt !== 'string' || typeof parsed.reportSha256 !== 'string') {
    throw new FixturePromotionError('The gauntlet report identity is incomplete.');
  }
  return {
    reportPath: path.relative(repoRoot, reportPath).replaceAll('\\', '/'),
    reportSha256: parsed.reportSha256,
    finishedAt: parsed.finishedAt,
    gateSummary: summary,
  };
}

function decodeCanonicalFixture(bytes: Buffer, fixtureId: string): { parsed: Record<string, unknown>; text: string } {
  let text: string;
  let parsed: unknown;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    parsed = JSON.parse(text);
  } catch {
    throw new FixturePromotionError(`Fixture ${fixtureId} must be valid UTF-8 JSON.`);
  }
  if (!isRecord(parsed)) throw new FixturePromotionError(`Fixture ${fixtureId} must be a JSON object.`);
  const findings = validateCorpusFixture(parsed);
  if (findings.length > 0) {
    throw new FixturePromotionError(`Fixture ${fixtureId} fails the authoritative fixture schema.`);
  }
  if (parsed.id !== fixtureId) throw new FixturePromotionError(`Fixture ${fixtureId} has a mismatched id.`);
  if (parsed.generatedBy !== 'workbench') {
    throw new FixturePromotionError(`Fixture ${fixtureId} is not owned by the workbench.`);
  }
  if (parsed.status !== 'pending') throw new FixturePromotionError(`Fixture ${fixtureId} is not pending.`);
  const canonicalText = `${JSON.stringify(parsed, null, 2)}\n`;
  if (text !== canonicalText) {
    throw new FixturePromotionError(`Fixture ${fixtureId} is not canonical compiler output; recompile it before promotion.`);
  }
  return { parsed, text };
}

export async function previewFixturePromotion(
  repoRoot: string,
  fixtureId: string,
  options: FixturePromotionOptions = {},
): Promise<FixturePromotionPlan> {
  const location = await safeFixturePath(repoRoot, fixtureId);
  const beforeBytes = await readFile(location.target);
  const { parsed, text: beforeText } = decodeCanonicalFixture(beforeBytes, fixtureId);
  const afterText = `${JSON.stringify({ ...parsed, status: 'active' }, null, 2)}\n`;
  const afterBytes = Buffer.from(afterText, 'utf8');
  const evidence = options.evidenceVerifier === undefined
    ? await defaultEvidenceVerifier(location.root, fixtureId, options.reportPath)
    : await options.evidenceVerifier(location.root, fixtureId);
  const mutationPlan = await createMutationPlan(location.root, [{
    path: location.relative,
    beforeSha256: sha256(beforeBytes),
    after: afterBytes,
  }]);
  const content = {
    schemaVersion: 1 as const,
    fixtureId,
    fixturePath: location.relative,
    fromStatus: 'pending' as const,
    toStatus: 'active' as const,
    before: { text: beforeText, base64: beforeBytes.toString('base64'), sha256: sha256(beforeBytes) },
    after: { text: afterText, base64: afterBytes.toString('base64'), sha256: sha256(afterBytes) },
    evidence,
    mutationPlan,
  };
  return { ...content, digest: sha256(canonical(content)) };
}

export async function applyFixturePromotion(
  repoRoot: string,
  fixtureId: string,
  expectedDigest: string,
  options: ApplyFixturePromotionOptions = {},
): Promise<{ readonly plan: FixturePromotionPlan; readonly result: ApplyResult }> {
  const plan = await previewFixturePromotion(repoRoot, fixtureId, options);
  if (plan.digest !== expectedDigest) {
    throw new FixturePromotionError('Promotion preview is stale; create and review a fresh preview.');
  }
  const callerPhase = options.apply?.onPhase;
  const result = await applyMutationPlan(repoRoot, plan.mutationPlan, {
    ...options.apply,
    onPhase: async (phase, operationId) => {
      if (phase === 'journal-created') {
        const lockedPlan = await previewFixturePromotion(repoRoot, fixtureId, options);
        if (lockedPlan.digest !== expectedDigest || lockedPlan.mutationPlan.digest !== plan.mutationPlan.digest) {
          throw new FixturePromotionError('Promotion preview became stale while waiting for the repository lock.');
        }
      }
      await callerPhase?.(phase, operationId);
    },
  });
  return { plan, result };
}
