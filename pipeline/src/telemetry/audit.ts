import { createHash } from 'node:crypto';

import type { ScriptureEngine } from '@jestek-dev/scripture-engine';

import { buildSensitiveMatcher, type SensitiveCategories } from './categories.js';
import { mine, updateMasterRecord, type MasterRecord } from './mine.js';
import type { Distillate, GapVerdict, TelemetryBudgets } from './types.js';
import { validateDistillate } from './validate.js';

const SHA256 = /^[0-9a-f]{64}$/;
const SAFE_FILENAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,126}\.json$/;
const DISTILLATE_KEYS = ['v', 'app', 'period', 'token', 'queries', 'pairs'] as const;
const QUERY_KEYS = ['query', 'identity', 'outcomes', 'conversions'] as const;
const IDENTITY_KEYS = ['engineVersion', 'corpusFingerprint', 'layerFingerprint'] as const;
const OUTCOME_KEYS = ['empty', 'abandoned', 'converted'] as const;
const CONVERSION_KEYS = ['target', 'rank', 'count'] as const;
const PAIR_KEYS = ['from', 'to', 'count'] as const;
const FORBIDDEN_KEYS = new Set([
  'date',
  'dates',
  'deviceId',
  'events',
  'history',
  'session',
  'sessions',
  'timestamp',
  'timestamps',
  'userId',
]);
const MAX_FILES = 1_000;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_JSON_DEPTH = 64;

export class TelemetryAuditValidationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'TelemetryAuditValidationError';
    this.code = code;
  }
}

export interface SelectedDistillateBytes {
  readonly filename: string;
  readonly bytes: Uint8Array;
}

export interface ValidatedDistillateFile {
  readonly filename: string;
  readonly contentSha256: string;
  readonly canonicalBytes: Uint8Array;
  readonly distillate: Distillate;
}

export interface TelemetryCandidateCase {
  readonly candidateKey: string;
  readonly query: string;
  readonly verdict: Exclude<GapVerdict, 'SATISFIED'>;
  readonly devices: number;
  readonly outcomes: { readonly empty: number; readonly abandoned: number; readonly converted: number };
  readonly artifact: {
    readonly engineVersion: string;
    readonly corpusFingerprint: string;
    readonly layerFingerprint: string;
  };
}

export interface TelemetryAuditSummary {
  readonly schemaVersion: 1;
  readonly auditDigest: string;
  readonly contentDigests: readonly string[];
  readonly distillateCount: number;
  readonly schemaVersions: readonly number[];
  readonly period: string;
  readonly distinctAuditTokens: number;
  readonly suppression: { readonly belowThreshold: number; readonly sensitiveExcluded: number };
  readonly excludedEvidence: { readonly rankMismatch: number; readonly unreplayable: number };
  readonly candidateCaseCount: number;
  readonly candidateCases: readonly TelemetryCandidateCase[];
}

export interface TelemetryAuditAnalysis {
  readonly summary: TelemetryAuditSummary;
  readonly nextMasterRecord: MasterRecord;
}

function fail(code: string, message: string): never {
  throw new TelemetryAuditValidationError(code, message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sha256(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

function canonical(value: unknown): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail('malformed_distillate', 'Distillate contains a non-finite number.');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (!isRecord(value)) fail('malformed_distillate', 'Distillate contains a non-JSON value.');
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[], label: string, rejectForbidden = true): void {
  const expected = new Set(keys);
  for (const key of Object.keys(value)) {
    if (rejectForbidden && FORBIDDEN_KEYS.has(key)) fail('raw_or_sensitive_shape', `${label} contains a forbidden telemetry field.`);
    if (!expected.has(key)) fail('unknown_field', `${label} contains an unknown field.`);
  }
  for (const key of keys) {
    if (!Object.hasOwn(value, key)) fail('missing_field', `${label} is missing a required field.`);
  }
}

function assertNoDuplicateJsonKeys(text: string): void {
  let offset = 0;
  const whitespace = (): void => { while (/\s/u.test(text[offset] ?? '')) offset += 1; };
  const parseString = (): string => {
    const start = offset;
    if (text[offset] !== '"') fail('malformed_json', 'A selected distillate is not valid JSON.');
    offset += 1;
    while (offset < text.length) {
      const character = text[offset]!;
      if (character === '"') {
        offset += 1;
        return JSON.parse(text.slice(start, offset)) as string;
      }
      if (character === '\\') {
        offset += 1;
        if (text[offset] === 'u') offset += 5;
        else offset += 1;
      } else {
        offset += 1;
      }
    }
    fail('malformed_json', 'A selected distillate is not valid JSON.');
  };
  const parseValue = (depth: number): void => {
    if (depth > MAX_JSON_DEPTH) fail('json_too_deep', 'A selected distillate exceeds the JSON nesting limit.');
    whitespace();
    const character = text[offset];
    if (character === '"') {
      parseString();
      return;
    }
    if (character === '{') {
      offset += 1;
      whitespace();
      const keys = new Set<string>();
      if (text[offset] === '}') { offset += 1; return; }
      while (offset < text.length) {
        whitespace();
        const key = parseString();
        if (keys.has(key)) fail('duplicate_json_key', 'A selected distillate contains a duplicate object field.');
        keys.add(key);
        whitespace();
        if (text[offset] !== ':') fail('malformed_json', 'A selected distillate is not valid JSON.');
        offset += 1;
        parseValue(depth + 1);
        whitespace();
        if (text[offset] === '}') { offset += 1; return; }
        if (text[offset] !== ',') fail('malformed_json', 'A selected distillate is not valid JSON.');
        offset += 1;
      }
      fail('malformed_json', 'A selected distillate is not valid JSON.');
    }
    if (character === '[') {
      offset += 1;
      whitespace();
      if (text[offset] === ']') { offset += 1; return; }
      while (offset < text.length) {
        parseValue(depth + 1);
        whitespace();
        if (text[offset] === ']') { offset += 1; return; }
        if (text[offset] !== ',') fail('malformed_json', 'A selected distillate is not valid JSON.');
        offset += 1;
      }
      fail('malformed_json', 'A selected distillate is not valid JSON.');
    }
    const scalar = /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/u.exec(text.slice(offset));
    if (scalar === null) fail('malformed_json', 'A selected distillate is not valid JSON.');
    offset += scalar[0].length;
  };
  parseValue(0);
  whitespace();
  if (offset !== text.length) fail('malformed_json', 'A selected distillate is not valid JSON.');
}

function assertClosedDistillateShape(value: unknown): asserts value is Distillate {
  if (!isRecord(value)) fail('malformed_distillate', 'Distillate root must be an object.');
  exactKeys(value, DISTILLATE_KEYS, 'Distillate');
  if (!Array.isArray(value.queries) || !Array.isArray(value.pairs)) {
    fail('malformed_distillate', 'Distillate collections must be arrays.');
  }
  for (const row of value.queries) {
    if (!isRecord(row)) fail('malformed_distillate', 'A query aggregate must be an object.');
    exactKeys(row, QUERY_KEYS, 'Query aggregate');
    if (!isRecord(row.identity) || !isRecord(row.outcomes) || !Array.isArray(row.conversions)) {
      fail('malformed_distillate', 'A query aggregate has malformed nested fields.');
    }
    exactKeys(row.identity, IDENTITY_KEYS, 'Query identity');
    exactKeys(row.outcomes, OUTCOME_KEYS, 'Query outcomes');
    for (const conversion of row.conversions) {
      if (!isRecord(conversion)) fail('malformed_distillate', 'A conversion aggregate must be an object.');
      exactKeys(conversion, CONVERSION_KEYS, 'Conversion aggregate');
    }
  }
  for (const pair of value.pairs) {
    if (!isRecord(pair)) fail('malformed_distillate', 'A query pair must be an object.');
    exactKeys(pair, PAIR_KEYS, 'Query pair');
  }
  const validation = validateDistillate(value);
  if (!validation.ok) fail('invalid_distillate', `Distillate failed schema validation (${validation.errors.length} issue(s)).`);
  for (const row of value.queries) {
    const claims = new Set<string>();
    let claimedConversions = 0;
    for (const conversion of row.conversions) {
      const key = `${conversion.target}\u0000${conversion.rank}`;
      if (claims.has(key)) fail('conversion_contradiction', 'A query row repeats a conversion claim.');
      claims.add(key);
      claimedConversions += conversion.count;
    }
    if (claimedConversions !== row.outcomes.converted) {
      fail('conversion_contradiction', 'A query row conversion total contradicts its outcome count.');
    }
  }
}

function normalizedFilename(filename: string): string {
  if (!SAFE_FILENAME.test(filename) || filename === '.' || filename === '..') {
    fail('unsafe_filename', 'Selected distillate filename is not a safe JSON basename.');
  }
  return filename.toLocaleLowerCase('en-US');
}

export function validateSelectedDistillates(input: readonly SelectedDistillateBytes[]): readonly ValidatedDistillateFile[] {
  if (!Array.isArray(input) || input.length === 0) fail('empty_selection', 'Select at least one distillate JSON file.');
  if (input.length > MAX_FILES) fail('selection_too_large', 'Telemetry audit selection exceeds the file-count limit.');
  const filenames = new Set<string>();
  const contentDigests = new Set<string>();
  const tokens = new Set<string>();
  const periods = new Set<string>();
  const versions = new Set<number>();
  const validated: ValidatedDistillateFile[] = [];

  for (const selected of input) {
    const filenameKey = normalizedFilename(selected.filename);
    if (filenames.has(filenameKey)) fail('duplicate_filename', 'Selected distillate filenames collide.');
    filenames.add(filenameKey);
    const bytes = Buffer.from(selected.bytes);
    if (bytes.length === 0 || bytes.length > MAX_FILE_BYTES) fail('invalid_file_size', 'A selected distillate has an invalid file size.');
    const contentSha256 = sha256(bytes);
    if (contentDigests.has(contentSha256)) fail('duplicate_content', 'Selected distillates contain duplicate content.');
    contentDigests.add(contentSha256);
    let parsed: unknown;
    try {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      assertNoDuplicateJsonKeys(text);
      parsed = JSON.parse(text) as unknown;
    } catch (error) {
      if (error instanceof TelemetryAuditValidationError) throw error;
      fail('malformed_json', 'A selected distillate is not valid JSON.');
    }
    assertClosedDistillateShape(parsed);
    if (tokens.has(parsed.token)) fail('token_contradiction', 'An audit token appears in more than one selected distillate.');
    tokens.add(parsed.token);
    periods.add(parsed.period);
    versions.add(parsed.v);
    const canonicalBytes = bytes;
    validated.push({ filename: '', contentSha256, canonicalBytes, distillate: parsed });
  }
  if (versions.size !== 1) fail('mixed_schema', 'Selected distillates use mixed schema versions.');
  if (periods.size !== 1) fail('mixed_period', 'Selected distillates use mixed audit periods.');
  return validated
    .sort((left, right) => left.contentSha256.localeCompare(right.contentSha256))
    .map((file, index) => ({ ...file, filename: `distillate-${String(index + 1).padStart(4, '0')}.json` }));
}

function engineIdentity(engine: ScriptureEngine): string {
  if (typeof engine.engineVersion !== 'string' || engine.engineVersion.length === 0 ||
      !SHA256.test(engine.corpusFingerprint) || !SHA256.test(engine.layerFingerprint)) {
    fail('unverified_engine', 'A replay engine does not expose a verified artifact identity.');
  }
  return `${engine.engineVersion}\u0000${engine.corpusFingerprint}\u0000${engine.layerFingerprint}`;
}

export function telemetryAuditDigest(
  files: readonly ValidatedDistillateFile[],
  engines: readonly ScriptureEngine[],
  budgets: TelemetryBudgets,
  categories: SensitiveCategories,
): string {
  return sha256(canonical({
    schemaVersion: 1,
    contentDigests: files.map((file) => file.contentSha256).sort(),
    engineIdentities: engines.map(engineIdentity).sort(),
    budgets,
    sensitiveCategories: categories,
  }));
}

export async function analyzeTelemetryAudit(
  files: readonly ValidatedDistillateFile[],
  engines: readonly ScriptureEngine[],
  budgets: TelemetryBudgets,
  categories: SensitiveCategories,
  previousMasterRecord: MasterRecord | null,
): Promise<TelemetryAuditAnalysis> {
  if (files.length === 0) fail('empty_selection', 'Select at least one validated distillate.');
  const identities = new Set<string>();
  for (const engine of engines) {
    const identity = engineIdentity(engine);
    if (identities.has(identity)) fail('duplicate_engine', 'Replay engines contain a duplicate artifact identity.');
    identities.add(identity);
  }
  if (!Number.isSafeInteger(budgets.minDistinctDevices) || budgets.minDistinctDevices < 2 ||
      !Number.isSafeInteger(budgets.weakConvertedRank) || budgets.weakConvertedRank < 1) {
    fail('invalid_budgets', 'Telemetry audit budgets are invalid.');
  }

  const distillates = files.map((file) => file.distillate);
  const { report, evidenceArtifacts } = await mine(distillates, engines, budgets, buildSensitiveMatcher(categories));
  const digest = telemetryAuditDigest(files, engines, budgets, categories);
  const candidateCases = report.clusters
    .filter((cluster): cluster is typeof cluster & { verdict: Exclude<GapVerdict, 'SATISFIED'> } => cluster.verdict !== 'SATISFIED')
    .map((cluster): TelemetryCandidateCase => {
      const query = cluster.forms[0]?.query ?? cluster.signature;
      const evidenceArtifact = evidenceArtifacts.find((entry) => entry.query === query)?.identity;
      if (evidenceArtifact === undefined) fail('candidate_identity', 'An admitted candidate lacks an exact artifact identity.');
      return {
        candidateKey: sha256(`${digest}\u0000${cluster.signature}`),
        query,
        verdict: cluster.verdict,
        devices: cluster.devices,
        outcomes: { ...cluster.outcomes },
        artifact: { ...evidenceArtifact },
      };
    });

  return {
    summary: {
      schemaVersion: 1,
      auditDigest: digest,
      contentDigests: files.map((file) => file.contentSha256).sort(),
      distillateCount: files.length,
      schemaVersions: [...new Set(distillates.map((entry) => entry.v))].sort(),
      period: report.period,
      distinctAuditTokens: new Set(distillates.map((entry) => entry.token)).size,
      suppression: {
        belowThreshold: report.suppressed.belowThreshold,
        sensitiveExcluded: report.suppressed.sensitiveDropped,
      },
      excludedEvidence: { ...report.flagged },
      candidateCaseCount: candidateCases.length,
      candidateCases,
    },
    nextMasterRecord: updateMasterRecord(previousMasterRecord, report),
  };
}

export function parseMasterRecord(input: unknown): MasterRecord | null {
  if (input === null) return null;
  if (!isRecord(input) || input.v !== 1 || !Array.isArray(input.audits) || !isRecord(input.clusters)) {
    fail('invalid_master', 'Telemetry master record has an invalid root schema.');
  }
  const auditPeriods = new Set<string>();
  for (const audit of input.audits) {
    if (!isRecord(audit)) fail('invalid_master', 'Telemetry master record contains an invalid audit.');
    exactKeys(audit, ['period', 'apps', 'devices', 'clusters', 'zeroConversionRate'], 'Master audit', false);
    if (typeof audit.period !== 'string' || !/^\d{4}-Q[1-4]$/.test(audit.period) || auditPeriods.has(audit.period) ||
        !Array.isArray(audit.apps) || !audit.apps.every((app) => typeof app === 'string' && ['maskil', 'setlist', 'versed'].includes(app)) ||
        new Set(audit.apps).size !== audit.apps.length || !Number.isSafeInteger(audit.devices) || (audit.devices as number) < 0 ||
        !Number.isSafeInteger(audit.clusters) || (audit.clusters as number) < 0 ||
        typeof audit.zeroConversionRate !== 'number' || !Number.isFinite(audit.zeroConversionRate) ||
        audit.zeroConversionRate < 0 || audit.zeroConversionRate > 1) {
      fail('invalid_master', 'Telemetry master record contains a malformed audit.');
    }
    auditPeriods.add(audit.period);
  }
  for (const cluster of Object.values(input.clusters)) {
    if (!isRecord(cluster)) fail('invalid_master', 'Telemetry master record contains an invalid cluster.');
    exactKeys(cluster, ['forms', 'outcomes', 'conversions', 'pairs', 'verdicts'], 'Master cluster', false);
    if (!isRecord(cluster.forms) || !isRecord(cluster.outcomes) || !Array.isArray(cluster.conversions) ||
        !Array.isArray(cluster.pairs) || !isRecord(cluster.verdicts)) {
      fail('invalid_master', 'Telemetry master record contains malformed cluster data.');
    }
    exactKeys(cluster.outcomes, OUTCOME_KEYS, 'Master outcomes', false);
    if (!Object.values(cluster.outcomes).every((count) => Number.isSafeInteger(count) && (count as number) >= 0)) {
      fail('invalid_master', 'Master outcome counts are invalid.');
    }
    for (const form of Object.values(cluster.forms)) {
      if (!isRecord(form)) fail('invalid_master', 'Telemetry master record contains a malformed form.');
      exactKeys(form, ['devices', 'events'], 'Master form', false);
      if (!Number.isSafeInteger(form.devices) || !Number.isSafeInteger(form.events)) fail('invalid_master', 'Master form counts are invalid.');
    }
    for (const conversion of cluster.conversions) {
      if (!isRecord(conversion)) fail('invalid_master', 'Telemetry master record contains a malformed conversion.');
      exactKeys(conversion, ['target', 'reference', 'rank', 'count'], 'Master conversion', false);
      if (typeof conversion.target !== 'string' || conversion.target.length === 0 ||
          typeof conversion.reference !== 'string' || conversion.reference.length === 0 ||
          !Number.isSafeInteger(conversion.rank) || (conversion.rank as number) < 1 ||
          !Number.isSafeInteger(conversion.count) || (conversion.count as number) < 1) {
        fail('invalid_master', 'Master conversion values are invalid.');
      }
    }
    for (const pair of cluster.pairs) {
      if (!isRecord(pair)) fail('invalid_master', 'Telemetry master record contains a malformed pair.');
      exactKeys(pair, PAIR_KEYS, 'Master pair', false);
      if (typeof pair.from !== 'string' || pair.from.length === 0 || typeof pair.to !== 'string' || pair.to.length === 0 ||
          !Number.isSafeInteger(pair.count) || (pair.count as number) < 1) {
        fail('invalid_master', 'Master pair values are invalid.');
      }
    }
    if (!Object.entries(cluster.verdicts).every(([period, verdict]) =>
      auditPeriods.has(period) && ['MISS', 'RENAMED', 'WEAK', 'SATISFIED'].includes(String(verdict)))) {
      fail('invalid_master', 'Telemetry master record contains an unknown verdict.');
    }
  }
  return input as unknown as MasterRecord;
}

export function serializeMasterRecord(record: MasterRecord): string {
  return `${JSON.stringify(record, null, 2)}\n`;
}
