/**
 * Stage 3 — the fixture compiler (plan §5).
 *
 * A pure function of the entire judgment log: reads
 * `workbench/judgments.jsonl`, groups judgments by query, and emits one
 * fixture file per query at `eval/golden/<slug>.json` in the exact shape G3
 * consumes (`CorpusFixture`, eval/src/gates/corpusGolden.ts). Same log in,
 * byte-identical files out; there is no applied-state tracking, so re-running
 * is always safe.
 *
 * The compiler's job ends at the working tree: it never commits, never
 * touches `eval/budgets.json`, and writes no YAML. (Ontology work was once
 * printed as a manual checklist here; Phase 4 D18 retired it — the deriver's
 * cards on the Updates screen carry those facts now.)
 *
 * The pipeline imports below are relative-path reaches into another
 * workspace, following the repo's one existing precedent
 * (eval/src/gates/corpusGolden.ts imports pipeline's parseAnchorRef the same
 * way). Using pipeline's own parser guarantees every reference this compiler
 * writes parses under G3 exactly as it parsed here.
 */

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { BOOKS, findBook } from '../../pipeline/src/books.js';
import { parseVerseId } from '../../pipeline/src/verseId.js';

import { repoRoot as realRepoRoot } from './descriptor.js';
import { applyMutationPlan, createMutationPlan, type ApplyOptions } from './applyJournal.js';
import {
  anchorRangeOf,
  canonicalReferenceOf,
  effectiveJudgments,
  isV2Judgment,
  parseJudgmentLog,
  referenceOfTargetId,
  slugOf,
  validateCasesForJudgments,
} from './effectiveJudgments.js';
import {
  type JudgmentRecordV2,
  type ParsedJudgmentRecord,
  type WithinTop,
} from './judgments.js';

/**
 * The shape G3 consumes (CorpusFixture) plus the ownership marker. The
 * gauntlet loads fixtures with a structural cast and the gates read only
 * their declared fields, so the extra `generatedBy` field is ignored there —
 * existing hand-written fixtures already carry extra fields the same way.
 */
export interface CompiledFixture {
  readonly id: string;
  readonly generatedBy: 'workbench';
  readonly status: 'active' | 'pending';
  readonly query: string;
  readonly expectedTop: readonly {
    /** Canonical v2 fixture spelling. */
    ref?: string;
    /** Byte-compatible v1 fixture spelling. */
    reference?: string;
    requiredReasonFamily?: string;
    /** v2 expectation window; v1 continues to use fixture-level top 10. */
    withinTop?: WithinTop;
  }[];
  /** Legacy v1 default. Omitted for v2-only fixtures. */
  readonly expectedWithinTop?: number;
  readonly mustNotRank: readonly { ref?: string; reference?: string; why?: string }[];
  readonly preferredOrder?: readonly { above: string; below: string; withinTop: number }[];
}

export interface ProposedSelectionEntry {
  readonly book: string;
  readonly chapters: readonly number[];
  readonly why: string;
}

export interface CompileOutcome {
  /** Repo-root-relative paths of fixture files written, with their status. */
  readonly fixturesWritten: readonly { path: string; fixture: CompiledFixture }[];
  /** Workbench-owned generated fixtures removed because no assertion survives. */
  readonly fixturesRemoved: readonly string[];
  readonly proposedSelections: readonly ProposedSelectionEntry[];
  /**
   * RETIRED (Phase 4, D18): permanently empty. The deriver's Updates cards
   * subsumed the printed manual ontology checklist; the field survives only
   * so a revert restores it (the tombstone is code, not data).
   */
  readonly checklist: readonly string[];
  readonly warnings: readonly string[];
  /** The full exit report, exactly as the CLI prints it. */
  readonly report: string;
}

export interface PlannedCompilationFile {
  /** Repo-root-relative path. Absolute paths and traversal are never emitted. */
  readonly path: string;
  /** SHA-256 of the bytes observed while planning, or null when absent. */
  readonly beforeSha256: string | null;
  /** Exact UTF-8 bytes to install, or null to delete the file. */
  readonly afterText: string | null;
}

export interface ObservedCompilationInput {
  readonly path: string;
  readonly sha256: string | null;
}

export interface JudgmentCompilationPlan extends CompileOutcome {
  readonly schemaVersion: 1;
  readonly inputs: readonly ObservedCompilationInput[];
  readonly operations: readonly PlannedCompilationFile[];
  /** Canonical digest clients must echo when applying a preview. */
  readonly digest: string;
}

interface WebSubsetFile {
  /**
   * Chapter-level entries carry `chapters`; verse-level entries (P5.2/QR-3)
   * carry `verses: ["chapter:verse", …]` instead and no `chapters` at all —
   * both shapes ship in pipeline/fixtures/web-subset.json (the authoritative
   * shape is `Selection` in pipeline/scripts/generateFixture.ts).
   */
  selection: { book: string; chapters?: number[]; verses?: string[]; why: string }[];
  [key: string]: unknown;
}

function assertV2Compilable(record: JudgmentRecordV2): void {
  const requireTarget = (): string => {
    if (typeof record.targetId !== 'string' || record.targetId === '') {
      throw new Error(`v2 judgment "${record.judgmentId}" (${record.action}) needs a targetId.`);
    }
    referenceOfTargetId(record.targetId);
    return record.targetId;
  };
  if (record.action === 'essential' || record.action === 'helpful' || record.action === 'irrelevant') {
    requireTarget();
  }
  if (record.action === 'missing') {
    if (typeof record.reference !== 'string' || record.reference === '') {
      throw new Error(`v2 judgment "${record.judgmentId}" (missing) needs a reference.`);
    }
    anchorRangeOf(record.reference, `v2 judgment "${record.judgmentId}"`);
  }
  if (record.action === 'irrelevant' && record.diagnosis === undefined) {
    throw new Error(`v2 judgment "${record.judgmentId}" (irrelevant) needs a diagnosis.`);
  }
  if (record.action === 'prefer') {
    if (
      typeof record.preferredTargetId !== 'string' ||
      typeof record.otherTargetId !== 'string' ||
      record.preferredTargetId === '' ||
      record.otherTargetId === '' ||
      record.preferredTargetId === record.otherTargetId
    ) {
      throw new Error(`v2 judgment "${record.judgmentId}" (prefer) needs two distinct targets.`);
    }
    referenceOfTargetId(record.preferredTargetId);
    referenceOfTargetId(record.otherTargetId);
  }
}

function rangesOverlap(
  left: { start: number; end: number },
  right: { start: number; end: number },
): boolean {
  return left.start <= right.end && right.start <= left.end;
}

function stableJson(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`).join(',')}}`;
  }
  throw new Error('Generated fixture contains non-JSON data.');
}

function sha256(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex');
}

/**
 * Repo-root-relative plan path, always spelled with '/'. Plan paths are
 * digest-visible bytes, so they must be identical on every platform: on POSIX
 * the replace is the identity, on Windows it undoes path.relative's '\\'
 * separators (which otherwise yield a different digest for the same plan —
 * the windows-latest golden-refactor failure).
 */
function planPathOf(repoRoot: string, target: string): string {
  return path.relative(repoRoot, target).replaceAll('\\', '/');
}

function canonicalPlanDigest(
  inputs: readonly ObservedCompilationInput[],
  operations: readonly PlannedCompilationFile[],
): string {
  return sha256(JSON.stringify({ schemaVersion: 1, inputs, operations }));
}

async function observeCompilationInputs(repoRoot: string): Promise<ObservedCompilationInput[]> {
  // Digest-visible paths: '/'-separated on every platform (path.join spells
  // them with '\\' on Windows, which must never reach the plan bytes).
  const inputs = [
    'artifacts/content-artifact.json',
    'pipeline/fixtures/web-subset.json',
    'workbench/cases.jsonl',
    'workbench/judgments.jsonl',
    'workbench/legacy/migration-manifest.json',
  ];
  return Promise.all(inputs.map(async (relativePath) => {
    const target = path.join(repoRoot, relativePath);
    return {
      path: relativePath,
      sha256: existsSync(target) ? sha256(await readFile(target)) : null,
    };
  }));
}

function sameGeneratedAssertions(existing: Record<string, unknown>, candidate: CompiledFixture): boolean {
  const { status: _existingStatus, ...existingAssertions } = existing;
  const { status: _candidateStatus, ...candidateAssertions } = candidate;
  return stableJson(existingAssertions) === stableJson(candidateAssertions);
}

/**
 * I/O shim over the shared core's pure case cross-validation
 * (effectiveJudgments.ts, V1/D3): observe the two files, hand the bytes in.
 */
async function validateCasesBeforeCompilation(
  repoRoot: string,
  rawLog: string,
  records: readonly ParsedJudgmentRecord[],
): Promise<void> {
  const casesPath = path.join(repoRoot, 'workbench', 'cases.jsonl');
  const manifestPath = path.join(repoRoot, 'workbench', 'legacy', 'migration-manifest.json');
  validateCasesForJudgments(records, {
    rawJudgmentsLog: rawLog,
    casesJsonl: existsSync(casesPath) ? await readFile(casesPath, 'utf8') : null,
    migrationManifestJson: existsSync(manifestPath) ? await readFile(manifestPath, 'utf8') : null,
  });
}

export async function planJudgmentCompilation(
  repoRoot: string = realRepoRoot,
): Promise<JudgmentCompilationPlan> {
  const inputs = await observeCompilationInputs(repoRoot);
  const judgmentsPath = path.join(repoRoot, 'workbench', 'judgments.jsonl');
  const goldenDir = path.join(repoRoot, 'eval', 'golden');
  const webSubsetPath = path.join(repoRoot, 'pipeline', 'fixtures', 'web-subset.json');
  const descriptorPath = path.join(repoRoot, 'artifacts', 'content-artifact.json');

  const descriptor = JSON.parse(await readFile(descriptorPath, 'utf8')) as {
    engineVersion: string;
    corpusFingerprint: string;
    layerFingerprint: string;
  };

  const rawLog = existsSync(judgmentsPath) ? await readFile(judgmentsPath, 'utf8') : '';
  const records = rawLog === '' ? [] : parseJudgmentLog(rawLog);
  await validateCasesBeforeCompilation(repoRoot, rawLog, records);
  const effective = effectiveJudgments(records);
  const operations: PlannedCompilationFile[] = [];

  // RETIRED (Phase 4, D16): the identity staleness warning that lived here —
  // first the layer-only compare, then D1's interim full-triple warning per
  // judgment and per moved dimension — is superseded by V6's full-triple
  // SEAL-TIME REPLAY (deriveUpdates.ts, `replayObservations`/`replay`): at
  // seal every contributing query is re-run against the artifact the
  // workbench serves and each identity-moved card is sorted into §02.5's
  // three dispositions mechanically, instead of a warning a human was
  // supposed to remember. The compiler no longer second-guesses identity —
  // the deriver owns staleness end to end.
  const warnings: string[] = [];

  // Group by query; drop queries whose surviving judgments compile to nothing
  // (plain ✓ is log-only: evidence for the human, not a regression pin).
  const byQuery = new Map<string, ParsedJudgmentRecord[]>();
  for (const record of effective) {
    const group = byQuery.get(record.query) ?? [];
    group.push(record);
    byQuery.set(record.query, group);
  }

  const slugs = new Map<string, string>();
  for (const query of byQuery.keys()) {
    const slug = slugOf(query);
    if (slug === '') throw new Error(`Query "${query}" produces an empty fixture slug.`);
    const taken = slugs.get(slug);
    if (taken !== undefined && taken !== query) {
      throw new Error(`Queries "${taken}" and "${query}" collide on fixture slug "${slug}".`);
    }
    slugs.set(slug, query);
  }

  interface PlannedFixture {
    readonly slug: string;
    readonly query: string;
    readonly judgments: readonly ParsedJudgmentRecord[];
    readonly expectedTop: {
      ref?: string;
      reference?: string;
      requiredReasonFamily?: string;
      withinTop?: WithinTop;
      reviewer?: string;
    }[];
    readonly mustNotRank: { ref?: string; reference?: string; why?: string }[];
    readonly preferredOrder: { above: string; below: string; withinTop: number }[];
    readonly hasLegacyExpectation: boolean;
  }

  const planned: PlannedFixture[] = [];
  for (const slug of [...slugs.keys()].sort()) {
    const query = slugs.get(slug)!;
    const judgments = byQuery.get(query)!;

    // The routing table (§5).
    const expectedTop: {
      ref?: string;
      reference?: string;
      requiredReasonFamily?: string;
      withinTop?: WithinTop;
      reviewer?: string;
    }[] = [];
    const mustNotRank: { ref?: string; reference?: string; why?: string }[] = [];
    const preferredOrder: { above: string; below: string; withinTop: number }[] = [];
    let hasLegacyExpectation = false;
    for (const judgment of judgments) {
      if (isV2Judgment(judgment)) {
        assertV2Compilable(judgment);
        if (judgment.action === 'essential') {
          expectedTop.push({
            ref: referenceOfTargetId(judgment.targetId!),
            withinTop: judgment.withinTop!,
            reviewer: judgment.reviewer,
          });
        } else if (judgment.action === 'missing') {
          expectedTop.push({
            ref: canonicalReferenceOf(judgment.reference!, `v2 judgment "${judgment.judgmentId}"`),
            withinTop: judgment.withinTop!,
            reviewer: judgment.reviewer,
          });
        } else if (judgment.action === 'irrelevant') {
          mustNotRank.push({
            ref: referenceOfTargetId(judgment.targetId!),
            why:
              judgment.note ??
              (judgment.diagnosis === 'lexical-noise'
                ? 'matched words, not meaning; judged not a fit for this query'
                : judgment.diagnosis!),
          });
        } else if (judgment.action === 'prefer') {
          preferredOrder.push({
            above: referenceOfTargetId(judgment.preferredTargetId!),
            below: referenceOfTargetId(judgment.otherTargetId!),
            withinTop: judgment.observedWindow,
          });
        }
        // Helpful remains evidence for the history and review UI only.
        continue;
      }
      if (judgment.verdict === 'doesnt-fit') {
        mustNotRank.push({
          reference: referenceOfTargetId(judgment.targetId!),
          // The note is optional for lexical-noise (§4, v1.1): the cause is
          // self-explaining, so the fallback spells it out in plain words
          // rather than leaking the jargon token into a reviewed fixture.
          why:
            judgment.note ??
            (judgment.cause === 'lexical-noise'
              ? 'matched words, not meaning; judged not a fit for this query'
              : judgment.cause!),
        });
      } else if (judgment.verdict === 'fits' && judgment.pin === true) {
        hasLegacyExpectation = true;
        expectedTop.push({
          reference: referenceOfTargetId(judgment.targetId!),
          ...(judgment.reasonFamily !== undefined
            ? { requiredReasonFamily: judgment.reasonFamily }
            : {}),
        });
      } else if (judgment.verdict === 'missing') {
        hasLegacyExpectation = true;
        expectedTop.push({ reference: judgment.reference! });
      }
      // ✓ without pin: nothing. Log-only.
    }
    if (expectedTop.length === 0 && mustNotRank.length === 0 && preferredOrder.length === 0) continue;

    const fixtureReference = (entry: { ref?: string; reference?: string }): string => {
      const reference = entry.ref ?? entry.reference;
      if (reference === undefined) throw new Error(`fixture "${slug}" has an assertion without a reference.`);
      return reference;
    };
    const byRange = (
      left: { ref?: string; reference?: string },
      right: { ref?: string; reference?: string },
    ): number => {
      const leftReference = fixtureReference(left);
      const rightReference = fixtureReference(right);
      const a = anchorRangeOf(leftReference, `fixture "${slug}"`);
      const b = anchorRangeOf(rightReference, `fixture "${slug}"`);
      return a.start - b.start || a.end - b.end || leftReference.localeCompare(rightReference);
    };
    const canonicalKey = (reference: string): string => {
      const range = anchorRangeOf(reference, `fixture "${slug}"`);
      return `${range.start}:${range.end}`;
    };
    const expectedByReference = new Map<string, (typeof expectedTop)[number]>();
    for (const expectation of expectedTop) {
      const reference = fixtureReference(expectation);
      const key = canonicalKey(reference);
      const existing = expectedByReference.get(key);
      if (existing === undefined) {
        expectedByReference.set(key, expectation);
        continue;
      }
      if (
        existing.requiredReasonFamily !== undefined &&
        expectation.requiredReasonFamily !== undefined &&
        existing.requiredReasonFamily !== expectation.requiredReasonFamily
      ) {
        throw new Error(`fixture "${slug}" has conflicting reason families for ${reference}.`);
      }
      const existingWindow = existing.withinTop ?? 10;
      const expectationWindow = expectation.withinTop ?? 10;
      if (existingWindow !== expectationWindow) {
        throw new Error(
          `fixture "${slug}" has conflicting rank windows for ${reference}: ` +
            `top ${existingWindow} vs top ${expectationWindow}.`,
        );
      }
      expectedByReference.set(key, {
        ...(existing.ref !== undefined ? { ref: existing.ref } : { reference: existing.reference! }),
        ...(existing.requiredReasonFamily ?? expectation.requiredReasonFamily
          ? { requiredReasonFamily: existing.requiredReasonFamily ?? expectation.requiredReasonFamily }
          : {}),
        ...(existing.withinTop !== undefined || expectation.withinTop !== undefined
          ? { withinTop: existingWindow as WithinTop }
          : {}),
        ...(existing.reviewer !== undefined ? { reviewer: existing.reviewer } : {}),
      });
    }
    const forbiddenByReference = new Map<string, (typeof mustNotRank)[number]>();
    for (const forbidden of mustNotRank) {
      const reference = fixtureReference(forbidden);
      const key = canonicalKey(reference);
      const existing = forbiddenByReference.get(key);
      if (existing === undefined) {
        forbiddenByReference.set(key, forbidden);
      } else if (existing.why !== forbidden.why) {
        throw new Error(`fixture "${slug}" has conflicting mustNotRank explanations for ${reference}.`);
      }
    }
    const rangesOverlap = (left: { start: number; end: number }, right: { start: number; end: number }): boolean =>
      left.start <= right.end && right.start <= left.end;
    const assertNoOverlaps = (
      entries: readonly { ref?: string; reference?: string }[],
      label: string,
    ): void => {
      for (let leftIndex = 0; leftIndex < entries.length; leftIndex += 1) {
        const leftReference = fixtureReference(entries[leftIndex]!);
        const left = anchorRangeOf(leftReference, `fixture "${slug}"`);
        for (let rightIndex = leftIndex + 1; rightIndex < entries.length; rightIndex += 1) {
          const rightReference = fixtureReference(entries[rightIndex]!);
          const right = anchorRangeOf(rightReference, `fixture "${slug}"`);
          if (rangesOverlap(left, right)) {
            throw new Error(
              `fixture "${slug}" has overlapping ${label} ranges: ${leftReference} and ${rightReference}.`,
            );
          }
        }
      }
    };
    assertNoOverlaps([...expectedByReference.values()], 'expectedTop');
    assertNoOverlaps([...forbiddenByReference.values()], 'mustNotRank');
    for (const expectation of expectedByReference.values()) {
      const expectedRange = anchorRangeOf(fixtureReference(expectation), `fixture "${slug}"`);
      for (const forbidden of forbiddenByReference.values()) {
        const forbiddenRange = anchorRangeOf(fixtureReference(forbidden), `fixture "${slug}"`);
        if (rangesOverlap(expectedRange, forbiddenRange)) {
          throw new Error(`fixture "${slug}" both expects and forbids overlapping references.`);
        }
      }
    }
    const preferredByPair = new Map<string, (typeof preferredOrder)[number]>();
    for (const preference of preferredOrder) {
      const above = canonicalKey(preference.above);
      const below = canonicalKey(preference.below);
      const aboveRange = anchorRangeOf(preference.above, `fixture "${slug}"`);
      const belowRange = anchorRangeOf(preference.below, `fixture "${slug}"`);
      if (rangesOverlap(aboveRange, belowRange)) {
        throw new Error(`fixture "${slug}" prefers overlapping references.`);
      }
      const pair = `${above}\u0000${below}`;
      const reverse = `${below}\u0000${above}`;
      if (preferredByPair.has(reverse)) {
        throw new Error(`fixture "${slug}" has conflicting preferred-order judgments.`);
      }
      const existing = preferredByPair.get(pair);
      if (existing !== undefined && existing.withinTop !== preference.withinTop) {
        throw new Error(`fixture "${slug}" has conflicting preferred-order windows.`);
      }
      preferredByPair.set(pair, preference);
    }

    const sortedExpectedTop = [...expectedByReference.values()].sort(byRange);
    const sortedMustNotRank = [...forbiddenByReference.values()].sort(byRange);
    const sortedPreferredOrder = [...preferredByPair.values()].sort(
      (left, right) =>
        byRange({ reference: left.above }, { reference: right.above }) ||
        byRange({ reference: left.below }, { reference: right.below }),
    );
    planned.push({
      slug,
      query,
      judgments,
      expectedTop: sortedExpectedTop,
      mustNotRank: sortedMustNotRank,
      preferredOrder: sortedPreferredOrder,
      hasLegacyExpectation,
    });
  }

  // Ownership rule (§5): validate every target BEFORE writing anything. A
  // file without the marker is a hand-written fixture and never workbench
  // property — stop with an error naming it.
  const existingFixtures = new Map<string, Record<string, unknown>>();
  for (const fixture of planned) {
    const target = path.join(goldenDir, `${fixture.slug}.json`);
    if (!existsSync(target)) continue;
    const existing = JSON.parse(await readFile(target, 'utf8')) as {
      generatedBy?: string;
      status?: string;
    };
    if (existing.generatedBy !== 'workbench') {
      throw new Error(
        `Refusing to overwrite ${path.relative(repoRoot, target)}: it has no ` +
          `"generatedBy": "workbench" marker, so it is a hand-written fixture and not ` +
          'workbench property. Rename the query or fold the judgments in by hand.',
      );
    }
    existingFixtures.set(fixture.slug, existing as Record<string, unknown>);
  }

  const plannedSlugs = new Set(planned.map((fixture) => fixture.slug));
  const fixturesRemoved: string[] = [];
  for (const slug of slugs.keys()) {
    if (plannedSlugs.has(slug)) continue;
    const target = path.join(goldenDir, `${slug}.json`);
    if (!existsSync(target)) continue;
    const existing = JSON.parse(await readFile(target, 'utf8')) as { generatedBy?: string };
    if (existing.generatedBy !== 'workbench') continue;
    const relativeTarget = planPathOf(repoRoot, target);
    operations.push({
      path: relativeTarget,
      beforeSha256: sha256(await readFile(target)),
      afterText: null,
    });
    fixturesRemoved.push(relativeTarget);
  }
  fixturesRemoved.sort();

  const fixturesWritten: { path: string; fixture: CompiledFixture }[] = [];
  for (const entry of planned) {
    const pendingFixture: CompiledFixture = {
      id: entry.slug,
      generatedBy: 'workbench',
      // Every NEW fixture starts pending (§5); promotion to active is a human
      // edit, which a re-run must not revert.
      status: 'pending',
      query: entry.query,
      expectedTop: entry.expectedTop.map(({ reviewer: _reviewer, ...expectation }) => expectation),
      ...(entry.hasLegacyExpectation ? { expectedWithinTop: 10 } : {}),
      mustNotRank: entry.mustNotRank,
      ...(entry.preferredOrder.length > 0 ? { preferredOrder: entry.preferredOrder } : {}),
    };
    const existing = existingFixtures.get(entry.slug);
    const fixture: CompiledFixture = existing?.['status'] === 'active' && sameGeneratedAssertions(existing, pendingFixture)
      ? { ...pendingFixture, status: 'active' }
      : pendingFixture;
    const target = path.join(goldenDir, `${entry.slug}.json`);
    const relativeTarget = planPathOf(repoRoot, target);
    operations.push({
      path: relativeTarget,
      beforeSha256: existsSync(target) ? sha256(await readFile(target)) : null,
      afterText: `${JSON.stringify(fixture, null, 2)}\n`,
    });
    fixturesWritten.push({ path: relativeTarget, fixture });
  }

  // Fixture-corpus membership check (§5, decision 3): G3 corpus fixtures run
  // against a database built from web-subset.json, so a passage that subset
  // never sampled is vacuous in CI. Propose chapter-granular additions.
  const subset = JSON.parse(await readFile(webSubsetPath, 'utf8')) as WebSubsetFile;
  const memberChapters = new Map<number, Set<number>>();
  for (const selection of subset.selection) {
    const book = findBook(selection.book);
    if (!book) continue;
    const set = memberChapters.get(book.id) ?? new Set<number>();
    // Verse-level selections sample single verses, not whole chapters, so
    // they grant no chapter membership: counting them would let a fixture
    // referencing the REST of that chapter pass as sampled when CI never
    // loaded those verses. The conservative cost is a chapter-granular
    // proposal for a chapter the subset already partially covers, which the
    // human reviews before it lands either way.
    for (const chapter of selection.chapters ?? []) set.add(chapter);
    memberChapters.set(book.id, set);
  }

  const proposedSelections: ProposedSelectionEntry[] = [];
  for (const entry of planned) {
    const missingByBook = new Map<number, Set<number>>();
    const references = [
      ...entry.expectedTop.map((expectation) => expectation.ref ?? expectation.reference),
      ...entry.mustNotRank.map((forbidden) => forbidden.ref ?? forbidden.reference),
      ...entry.preferredOrder.flatMap((preference) => [preference.above, preference.below]),
    ].filter((reference): reference is string => reference !== undefined);
    for (const reference of references) {
      const range = anchorRangeOf(reference, `fixture "${entry.slug}"`);
      const start = parseVerseId(range.start);
      const end = parseVerseId(range.end);
      for (let chapter = start.chapter; chapter <= end.chapter; chapter += 1) {
        if (!memberChapters.get(start.bookId)?.has(chapter)) {
          const set = missingByBook.get(start.bookId) ?? new Set<number>();
          set.add(chapter);
          missingByBook.set(start.bookId, set);
        }
      }
    }
    if (missingByBook.size === 0) continue;
    const date = entry.judgments.map((judgment) => judgment.at).sort().at(-1)!.slice(0, 10);
    for (const bookId of [...missingByBook.keys()].sort((a, b) => a - b)) {
      const book = BOOKS[bookId - 1]!;
      const chapters = [...missingByBook.get(bookId)!].sort((a, b) => a - b);
      const proposal: ProposedSelectionEntry = {
        book: book.name,
        chapters,
        why: `workbench judgment: ${entry.query} (${date})`,
      };
      proposedSelections.push(proposal);
      subset.selection.push({ book: proposal.book, chapters: [...chapters], why: proposal.why });
      const set = memberChapters.get(bookId) ?? new Set<number>();
      for (const chapter of chapters) set.add(chapter);
      memberChapters.set(bookId, set);
    }
  }
  if (proposedSelections.length > 0) {
    // The file round-trips byte-identically through JSON.parse/stringify at
    // indent 2, so untouched entries (and the verses array) keep their bytes.
    operations.push({
      path: planPathOf(repoRoot, webSubsetPath),
      beforeSha256: sha256(await readFile(webSubsetPath)),
      afterText: `${JSON.stringify(subset, null, 2)}\n`,
    });
  }

  // RETIRED (Phase 4, D18, gated on J72): the printed manual ontology
  // checklist that was built here is gone — tombstoned the way the v1
  // POST /api/judgment endpoint became a method-agnostic 410 (server.ts):
  // the field stays, permanently empty, so a revert restores the checklist
  // and nothing half-works meanwhile. The deriver's cards subsumed every
  // fact a checklist line carried (V1): a `missing` line is a
  // missing-passage/expectation card (query + reference in the card
  // identity, the note/excerpt defense in card.evidence, the drafted
  // operations carrying the work); an anchor-affecting `irrelevant` line is
  // a guard-and-anchor card (diagnosis + conceptId in card.evidence and
  // derived.anchorRemove/sourceOwnedAnchor). The Updates screen renders
  // them and decisions persist in workbench/updates.jsonl — the printout
  // recorded nothing. compileJudgments.test.ts guards this field never
  // refills.
  const checklist: string[] = [];

  const lines: string[] = [];
  lines.push('Workbench judgment compiler');
  lines.push(`  judgments read: ${records.length} (${effective.length} effective after supersession)`);
  lines.push('');
  if (fixturesWritten.length === 0) {
    lines.push('No fixture files to write (no judgment compiles to an expectation).');
  } else {
    lines.push('Fixture files written:');
    for (const written of fixturesWritten) {
      lines.push(
        `  ${written.path} (${written.fixture.status}, ` +
          `${written.fixture.expectedTop.length} expectedTop, ` +
          `${written.fixture.mustNotRank.length} mustNotRank)`,
      );
    }
  }
  if (proposedSelections.length > 0) {
    lines.push('');
    lines.push(`Proposed additions to ${path.relative(repoRoot, webSubsetPath)}:`);
    for (const proposal of proposedSelections) {
      lines.push(`  ${JSON.stringify(proposal)}`);
    }
    lines.push(
      '  WARNING: these change the fixture database, so a G8 ' +
        '`npm run gauntlet -- --update-baseline` refresh will be needed after the ' +
        'additions are reviewed.',
    );
  }
  if (warnings.length > 0) {
    lines.push('');
    lines.push('Warnings:');
    for (const warning of warnings) lines.push(`  - ${warning}`);
  }
  lines.push('');
  lines.push(
    'Next: review with `git diff`, run `npm run verify`, and commit/PR by hand. ' +
      "The compiler's job ends at the working tree.",
  );

  operations.sort((left, right) => left.path.localeCompare(right.path));
  const inputsAfterPlanning = await observeCompilationInputs(repoRoot);
  if (JSON.stringify(inputsAfterPlanning) !== JSON.stringify(inputs)) {
    throw new Error('Compilation inputs changed while the preview was being created; try again.');
  }
  return {
    schemaVersion: 1,
    inputs,
    operations,
    digest: canonicalPlanDigest(inputs, operations),
    fixturesWritten,
    fixturesRemoved,
    proposedSelections,
    checklist,
    warnings,
    report: lines.join('\n'),
  };
}

/** Apply an unchanged compiler preview through the crash-recoverable journal. */
export async function applyJudgmentCompilationPlan(
  repoRoot: string,
  plan: JudgmentCompilationPlan,
  expectedDigest: string,
  options: { readonly apply?: ApplyOptions } = {},
): Promise<CompileOutcome> {
  const recomputed = canonicalPlanDigest(plan.inputs, plan.operations);
  if (plan.digest !== expectedDigest || recomputed !== expectedDigest) {
    throw new Error('Compilation preview digest does not match; create a fresh preview.');
  }

  const currentInputs = await observeCompilationInputs(repoRoot);
  if (JSON.stringify(currentInputs) !== JSON.stringify(plan.inputs)) {
    throw new Error('Compilation preview is stale because its inputs changed; create a fresh preview.');
  }

  if (plan.operations.length > 0) {
    const mutationPlan = await createMutationPlan(
      repoRoot,
      plan.operations.map((operation) => ({
        path: operation.path.replaceAll('\\', '/'),
        beforeSha256: operation.beforeSha256,
        after: operation.afterText,
      })),
    );
    const callerPhase = options.apply?.onPhase;
    await applyMutationPlan(repoRoot, mutationPlan, {
      ...options.apply,
      onPhase: async (phase, operationId) => {
        if (phase === 'journal-created') {
          const lockedInputs = await observeCompilationInputs(repoRoot);
          if (JSON.stringify(lockedInputs) !== JSON.stringify(plan.inputs)) {
            throw new Error('Compilation preview is stale because its inputs changed while waiting for the repository lock.');
          }
          const lockedMutationPlan = await createMutationPlan(
            repoRoot,
            plan.operations.map((operation) => ({
              path: operation.path.replaceAll('\\', '/'),
              beforeSha256: operation.beforeSha256,
              after: operation.afterText,
            })),
          );
          if (lockedMutationPlan.digest !== mutationPlan.digest) {
            throw new Error('Compilation preview is stale because its target files changed while waiting for the repository lock.');
          }
        }
        await callerPhase?.(phase, operationId);
      },
    });
  }

  const {
    schemaVersion: _schemaVersion,
    inputs: _inputs,
    operations: _operations,
    digest: _digest,
    ...outcome
  } = plan;
  return outcome;
}

// RETIRED (Phase 4, D18, gated on J72): `compileJudgments()` — the one-breath
// plan-and-apply that wrote the working tree with no digest confirmation and
// no human review of the preview — is gone, tombstoned the way the v1
// POST /api/judgment endpoint became a method-agnostic 410 (server.ts): the
// CLI entry below fails loud for every invocation instead of half-working.
// The supervised halves both survive: `planJudgmentCompilation` +
// digest-confirmed `applyJudgmentCompilationPlan` remain the only write path,
// driven by the workbench Finish up screen (POST /api/v2/compile/preview +
// POST /api/v2/compile/apply).
export const COMPILE_JUDGMENTS_RETIRED =
  'compile-judgments is gone; the direct compile-and-write path is closed. ' +
  'Review derived updates on the workbench Updates screen, and apply the ' +
  'fixture plan through the Finish up screen (its digest-confirmed ' +
  'preview-then-apply). Start the workbench with `npm start --workspace workbench`.';

const invokedDirectly =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (invokedDirectly) {
  console.error(COMPILE_JUDGMENTS_RETIRED);
  process.exit(1);
}
