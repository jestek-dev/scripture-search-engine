/**
 * The shared judgment-selection core (votes-to-engine plan V1, D3).
 *
 * One selection logic, written once: the fixture compiler
 * (`compileJudgments.ts`) and the updates deriver (`deriveUpdates.ts`) must
 * select exactly the same judgment leaves from the same log, or the compiled
 * answer sheet and the derived cards would disagree about which votes count —
 * the one-tokenizer discipline applied to judgment selection. This module
 * carries the three pieces both callers need:
 *
 *   1. Supersession resolution — the validated v2 correction graph and its
 *      leaf filter, plus the legacy timestamp rule and the mixed-history
 *      combinator.
 *   2. Case cross-validation — every v2 judgment's caseId must exist in the
 *      case log with a matching query, and the byte-pinned legacy migration
 *      manifest must validate fail-closed.
 *   3. Canonical reference handling — target-id decoding and reference
 *      canonicalization through the pipeline's own parser, which guarantees
 *      every reference either caller writes parses under G3 exactly as it
 *      parsed here.
 *
 * Every function here is a pure function of its inputs: no file reads, no
 * clock, no randomness. Callers observe the world and hand the bytes in.
 */

import { BOOKS } from '../../pipeline/src/books.js';
import { parseAnchorRef } from '../../pipeline/src/importers/ontologyImporter.js';
import { parseVerseId } from '../../pipeline/src/verseId.js';

import {
  parseCaseEventLog,
  parseLegacyJudgmentLine,
  validateCanonicalLegacyCaseLog,
  validateCaseEvents,
  validateLegacyMigrationManifest,
} from './cases.js';
import {
  parseJudgmentRecord,
  type JudgmentRecord,
  type JudgmentRecordV2,
  type ParsedJudgmentRecord,
} from './judgments.js';

/** Slug for `eval/golden/<slug>.json`. Deterministic, filename-safe. */
export function slugOf(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** "WEB:59001022" -> "James 1:22", via the pipeline's own verse-id encoding. */
export function referenceOfTargetId(targetId: string): string {
  const numeric = targetId.split(':')[1];
  const location = parseVerseId(Number(numeric));
  const book = BOOKS[location.bookId - 1];
  if (!book) throw new Error(`referenceOfTargetId: no book for id ${location.bookId}`);
  return `${book.name} ${location.chapter}:${location.verse}`;
}

/** Parses and strictly validates a whole judgments.jsonl log body. */
export function parseJudgmentLog(raw: string): ParsedJudgmentRecord[] {
  const records: ParsedJudgmentRecord[] = [];
  const lines = raw.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]!.trim();
    if (line === '') continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch {
      throw new Error(`judgments.jsonl line ${index + 1} is not valid JSON.`);
    }
    const result = parseJudgmentRecord(parsed);
    if (!result.ok) throw new Error(`judgments.jsonl line ${index + 1} is invalid: ${result.reason}`);
    records.push(result.record);
  }
  return records;
}

export function isV2Judgment(record: ParsedJudgmentRecord): record is JudgmentRecordV2 {
  return 'schemaVersion' in record && record.schemaVersion === 2;
}

/**
 * The v1 supersession rule (§4): a later judgment on the same query + target
 * (targetId for ✓/✗, reference for missing) supersedes an earlier one, by
 * `at` order; the later log line wins a timestamp tie.
 */
function legacyEffectiveJudgments(records: readonly JudgmentRecord[]): JudgmentRecord[] {
  const byTarget = new Map<string, JudgmentRecord>();
  for (const record of records) {
    const target = record.targetId ?? record.reference ?? '';
    const key = `${record.query}\u0000${target}`;
    const existing = byTarget.get(key);
    if (existing === undefined || record.at >= existing.at) byTarget.set(key, record);
  }
  return [...byTarget.values()];
}

/**
 * The per-class supersession target key: `reference:` for missing, sorted
 * `pair:` for prefer, `target:` otherwise — the same identity the judgment
 * log's own supersession validation uses (judgments.ts `v2TargetKey`).
 */
export function v2SupersessionKey(record: JudgmentRecordV2): string {
  if (record.action === 'missing') return `reference:${record.reference ?? ''}`;
  if (record.action === 'prefer') {
    const pair = [record.preferredTargetId ?? '', record.otherTargetId ?? ''].sort();
    return `pair:${pair[0]}\u0000${pair[1]}`;
  }
  return `target:${record.targetId ?? ''}`;
}

/**
 * v2 corrections are an explicit append-only graph, never a timestamp race.
 * Validate the full graph before selecting its leaves so a malformed history
 * cannot quietly change a generated fixture or a derived card.
 */
export function activeV2Judgments(records: readonly JudgmentRecordV2[]): JudgmentRecordV2[] {
  const byId = new Map<string, { record: JudgmentRecordV2; line: number }>();
  for (const [index, record] of records.entries()) {
    if (byId.has(record.judgmentId)) {
      throw new Error(`judgments.jsonl contains duplicate v2 judgmentId "${record.judgmentId}".`);
    }
    byId.set(record.judgmentId, { record, line: index });
  }

  const superseded = new Set<string>();
  for (const [index, record] of records.entries()) {
    if (record.supersedes === undefined) continue;
    const prior = byId.get(record.supersedes);
    if (prior === undefined) {
      throw new Error(`v2 judgment "${record.judgmentId}" supersedes unknown judgment "${record.supersedes}".`);
    }
    if (prior.line >= index) {
      throw new Error(`v2 judgment "${record.judgmentId}" must supersede an earlier judgment.`);
    }
    if (Date.parse(record.at) <= Date.parse(prior.record.at)) {
      throw new Error(`v2 judgment "${record.judgmentId}" must be timestamped after the judgment it supersedes.`);
    }
    if (
      prior.record.query !== record.query ||
      prior.record.caseId !== record.caseId ||
      v2SupersessionKey(prior.record) !== v2SupersessionKey(record)
    ) {
      throw new Error(
        `v2 judgment "${record.judgmentId}" must supersede the same query, case, and target.`,
      );
    }
    if (superseded.has(record.supersedes)) {
      throw new Error(`v2 judgment "${record.supersedes}" has multiple active superseding corrections.`);
    }
    superseded.add(record.supersedes);
  }
  return records.filter((record) => !superseded.has(record.judgmentId));
}

/** Mixed histories preserve v1's historic timestamp rule and add v2 leaves. */
export function effectiveJudgments(records: readonly ParsedJudgmentRecord[]): ParsedJudgmentRecord[] {
  const legacy = records.filter((record): record is JudgmentRecord => !isV2Judgment(record));
  const v2 = records.filter(isV2Judgment);
  return [...legacyEffectiveJudgments(legacy), ...activeV2Judgments(v2)];
}

export function anchorRangeOf(reference: string, context: string): { start: number; end: number } {
  const range = parseAnchorRef(reference);
  if (!range) {
    throw new Error(`${context}: reference "${reference}" cannot be parsed by parseAnchorRef.`);
  }
  return range;
}

/**
 * Canonicalizes a human-typed reference to the single-chapter range shape G3
 * consumes. A cross-chapter range is a hard error here; the deriver routes
 * that refusal to a card instead of crashing (plan §02.3(c)).
 */
export function canonicalReferenceOf(reference: string, context: string): string {
  const range = anchorRangeOf(reference, context);
  const start = parseVerseId(range.start);
  const end = parseVerseId(range.end);
  if (start.bookId !== end.bookId || start.chapter !== end.chapter) {
    throw new Error(`${context}: reference "${reference}" cannot be emitted as a canonical single-chapter range.`);
  }
  const book = BOOKS[start.bookId - 1];
  if (!book) throw new Error(`${context}: reference "${reference}" has an unknown book.`);
  return `${book.name} ${start.chapter}:${start.verse}${start.verse === end.verse ? '' : `-${end.verse}`}`;
}

/** The observed text of the two case-validation inputs; null = file absent. */
export interface CaseValidationInputs {
  /** Raw bytes of workbench/judgments.jsonl (may be empty). */
  readonly rawJudgmentsLog: string;
  /** Raw workbench/cases.jsonl text, or null when the file does not exist. */
  readonly casesJsonl: string | null;
  /** Raw migration-manifest JSON text, or null when the file does not exist. */
  readonly migrationManifestJson: string | null;
}

/**
 * Case cross-validation, extracted from the compiler (compileJudgments.ts
 * `validateCasesBeforeCompilation`) as a pure function over observed bytes:
 * every v2 judgment's caseId must exist with a matching query, and when the
 * byte-pinned legacy migration manifest exists it must validate fail-closed
 * against the raw log's v1 lines and the canonical case log.
 */
export function validateCasesForJudgments(
  records: readonly ParsedJudgmentRecord[],
  inputs: CaseValidationInputs,
): void {
  const v2Records = records.filter(isV2Judgment);
  const hasCases = inputs.casesJsonl !== null;
  const hasManifest = inputs.migrationManifestJson !== null;

  if (!hasCases) {
    if (v2Records.length > 0) throw new Error('v2 judgments require a validated workbench/cases.jsonl case log.');
    if (hasManifest) throw new Error('workbench/legacy/migration-manifest.json exists without workbench/cases.jsonl.');
    return;
  }

  const cases = validateCaseEvents(parseCaseEventLog(inputs.casesJsonl!));
  const caseQueries = new Map(
    cases
      .filter((event) => event.kind === 'case-created')
      .map((event) => [event.caseId, event.query] as const),
  );
  for (const record of v2Records) {
    const caseQuery = caseQueries.get(record.caseId);
    if (caseQuery === undefined) {
      throw new Error(`v2 judgment "${record.judgmentId}" names missing caseId "${record.caseId}".`);
    }
    if (caseQuery !== record.query) {
      throw new Error(
        `v2 judgment "${record.judgmentId}" query does not match case "${record.caseId}".`,
      );
    }
  }

  if (!hasManifest) return;
  let manifest: unknown;
  try {
    manifest = JSON.parse(inputs.migrationManifestJson!) as unknown;
  } catch {
    throw new Error('workbench legacy migration manifest is not valid JSON.');
  }
  // Legacy lines keep their true file line numbers, so a stray v1 append is
  // reported at the exact line to delete — recoverable, not a permanent brick.
  const legacyLines = inputs.rawJudgmentsLog
    .split('\n')
    .map((text, index) => ({ text, lineNumber: index + 1 }))
    .filter(({ text }) => text.trim() !== '')
    .filter(({ text }) => !Object.hasOwn(JSON.parse(text) as object, 'schemaVersion'));
  validateCanonicalLegacyCaseLog(
    inputs.casesJsonl!,
    validateLegacyMigrationManifest(manifest),
    legacyLines.map(({ text, lineNumber }) => parseLegacyJudgmentLine(text, lineNumber)),
  );
}
