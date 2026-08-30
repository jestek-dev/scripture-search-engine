/**
 * G3, corpus half: golden fixtures expressed as real queries.
 *
 * The ranking-invariant fixtures test the ranker in isolation. These test the
 * whole engine against actual scripture, which is the only way to grade the
 * question that started this project: does "hearing and doing" find James 1?
 *
 * Both halves check REASONS, not just positions. A fixture that only asserted
 * "James 1:22 appears" would have passed in Phase 1 on token overlap alone,
 * and would have told us the concept layer worked when it did not exist.
 */

import type { ScriptureEngine } from '@jestek-dev/scripture-engine';

import { parseAnchorRef } from '../../../pipeline/src/importers/ontologyImporter.js';
import { mergeGateResults } from './merge.js';
import { fail, notApplicable, pass, warn, type GateFinding, type GateResult } from './types.js';

export const WITHIN_TOP_VALUES = [1, 3, 5, 10] as const;
export type WithinTop = (typeof WITHIN_TOP_VALUES)[number];

/**
 * mustNotLead measures leadership, not presence, so its window is narrow by
 * construction: rank 1 (the default) or the top 3. A wider ban is what
 * mustNotRank is for.
 */
export const MUST_NOT_LEAD_WINDOWS = [1, 3] as const;
export type MustNotLeadWindow = (typeof MUST_NOT_LEAD_WINDOWS)[number];

/**
 * Machine-report category for a guard whose reference resolves to no verse
 * in the running corpus. Semantic (not G3_*-coded) because vacuity rides a
 * warn sub-result through report generation on honest runs.
 */
export const GUARD_VACUOUS_CATEGORY = 'sse.gauntlet.v1.finding.g3-golden.guard-vacuous';

export interface CorpusExpectation {
  /** Canonical Milestone 2 spelling. */
  readonly ref?: string;
  /** Legacy spelling retained for hand-written and generated v1 fixtures. */
  readonly reference?: string;
  readonly withinTop?: WithinTop;
  readonly requiredReasonFamily?: string;
  readonly requiredReasonLabel?: string;
  /**
   * P5.6 (CO-3) PR 1 capability: the expectation additionally demands that
   * the hit be a GROUPED result whose grouping provenance cites this source
   * (e.g. "openbible-sections" for the pericope path, "editorial" for the
   * anchor-collapse path). Enforcement is FAIL-CLOSED from day one: the
   * engine emits no grouping until the PR 2 behavior lands, so an ACTIVE
   * fixture carrying this field fails rather than silently passing — a
   * capability field must never be decoration (CLAUDE.md gate discipline).
   */
  readonly requiredGroupingSourceId?: string;
}

export interface PreferredOrder {
  readonly above: string;
  readonly below: string;
  readonly withinTop?: WithinTop;
}

/**
 * The missing middle between preferredOrder (needs a named counterpart
 * present in the window) and mustNotRank (a total ban from the window): the
 * reference MAY rank — it is scripture, and suppressing it is forbidden —
 * but must not LEAD the fixture's query. `why` is required: every guard is
 * an attributed human judgment, and the finding must be able to say whose
 * reasoning it enforces.
 */
export interface MustNotLead {
  readonly ref?: string;
  readonly reference?: string;
  readonly why?: string;
  readonly withinTop?: MustNotLeadWindow;
}

export const REFERENCE_EXPECTATION_KINDS = ['reference', 'invalid-reference', 'discovery'] as const;
export type ReferenceExpectationKind = (typeof REFERENCE_EXPECTATION_KINDS)[number];

/**
 * One reference-intent assertion: this exact query must produce this
 * `research()` outcome kind. Per-query entries rather than one fixture-level
 * pair, because a single fixture may cover queries resolving to different
 * passages (one ordinal fixture pinning both "1st Corinthians 13" and
 * "2nd Timothy 1:7").
 */
export interface ReferenceExpectation {
  readonly query: string;
  readonly expectedKind: ReferenceExpectationKind;
  /**
   * Required with kind `reference`, forbidden otherwise: the exact
   * `passage.reference` label. A kind-only "it resolved" assertion is a
   * hollow guard — every reference pin names the label it must produce.
   */
  readonly expectedPassage?: string;
  /**
   * Valid only with kind `invalid-reference`: the canonical book name the
   * result's `suggestion.book` must cite. Until the engine carries a
   * suggestion field, an entry asserting this fails — keep such fixtures
   * pending; they are the specification for the unlanded work.
   */
  readonly expectedSuggestion?: string;
}

export interface CorpusFixture {
  readonly id: string;
  readonly status: 'active' | 'pending';
  readonly query?: string;
  /**
   * Each assertion may choose its own measurement window. `reference` plus
   * fixture-level `expectedWithinTop` remains valid for legacy fixtures.
   */
  readonly expectedTop?: readonly CorpusExpectation[];
  readonly expectedWithinTop?: WithinTop;
  readonly preferredOrder?: readonly PreferredOrder[];
  readonly additionalQueries?: readonly string[];
  readonly mustNotRank?: readonly { reference?: string; ref?: string; why?: string }[];
  readonly mustNotLead?: readonly MustNotLead[];
  readonly coversConcepts?: readonly string[];
  /**
   * Corpus-expansion ruling 2026-08-26, row 19 (spelling-archaic-guard):
   * a tripwire over EXPLANATIONS rather than a single verse's chip. Every
   * reason label on every returned result, for every query of the fixture,
   * must avoid these substrings. The archaic-forms guard uses it to pin the
   * real invariant — archaic forms fold in the tokenizer, so no chip may
   * ever claim a spelling correction happened — without tying the guard to
   * whichever evidence rung happens to serve the asserted verse today.
   */
  readonly forbiddenReasonLabelSubstrings?: readonly string[];
  /**
   * Reference-intent form: mutually exclusive with every discovery-measuring
   * field above. A fixture measures either reference resolution or discovery
   * ranking, never both, so no combination is ever half-defined.
   */
  readonly referenceExpectations?: readonly ReferenceExpectation[];
  /** Informational fields accepted by the existing hand-written fixtures. */
  readonly note?: readonly string[];
  readonly alsoAcceptable?: readonly string[];
  /** Ownership marker emitted by the workbench fixture compiler. */
  readonly generatedBy?: 'workbench';
}

interface NormalizedExpectation {
  readonly ref: string;
  readonly withinTop: WithinTop;
  readonly range: { start: number; end: number };
  readonly requiredReasonFamily?: string;
  readonly requiredReasonLabel?: string;
  readonly requiredGroupingSourceId?: string;
}

interface NormalizedPreferredOrder {
  readonly above: string;
  readonly below: string;
  readonly withinTop: WithinTop;
  readonly aboveRange: { start: number; end: number };
  readonly belowRange: { start: number; end: number };
}

interface NormalizedCorpusFixture {
  readonly id: string;
  readonly status: 'active' | 'pending';
  readonly query?: string;
  readonly expectedTop: readonly NormalizedExpectation[];
  readonly expectedWithinTop: WithinTop;
  readonly preferredOrder: readonly NormalizedPreferredOrder[];
  readonly additionalQueries: readonly string[];
  readonly mustNotRank: readonly { ref: string; why?: string; range: { start: number; end: number } }[];
  readonly mustNotLead: readonly {
    ref: string;
    why: string;
    withinTop: MustNotLeadWindow;
    range: { start: number; end: number };
  }[];
  readonly coversConcepts?: readonly string[];
  readonly forbiddenReasonLabelSubstrings: readonly string[];
  readonly referenceExpectations: readonly ReferenceExpectation[];
}

interface FixtureValidation {
  readonly fixture?: NormalizedCorpusFixture;
  readonly findings: readonly GateFinding[];
}

const FIXTURE_FIELDS = new Set([
  'id',
  'status',
  'query',
  'expectedTop',
  'expectedWithinTop',
  'preferredOrder',
  'additionalQueries',
  'mustNotRank',
  'mustNotLead',
  'coversConcepts',
  'note',
  'alsoAcceptable',
  'generatedBy',
  'forbiddenReasonLabelSubstrings',
  'referenceExpectations',
]);
/** The discovery-measuring fields a reference-intent fixture may not carry. */
const DISCOVERY_ONLY_FIELDS = [
  'query',
  'additionalQueries',
  'expectedTop',
  'expectedWithinTop',
  'preferredOrder',
  'mustNotRank',
  'mustNotLead',
  'coversConcepts',
  'forbiddenReasonLabelSubstrings',
] as const;
const REFERENCE_EXPECTATION_FIELDS = new Set([
  'query',
  'expectedKind',
  'expectedPassage',
  'expectedSuggestion',
]);
const EXPECTATION_FIELDS = new Set([
  'ref',
  'reference',
  'withinTop',
  'requiredReasonFamily',
  'requiredReasonLabel',
  'requiredGroupingSourceId',
]);
const PREFERRED_ORDER_FIELDS = new Set(['above', 'below', 'withinTop']);
const MUST_NOT_RANK_FIELDS = new Set(['ref', 'reference', 'why']);
const MUST_NOT_LEAD_FIELDS = new Set(['ref', 'reference', 'why', 'withinTop']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isWithinTop(value: unknown): value is WithinTop {
  return typeof value === 'number' && (WITHIN_TOP_VALUES as readonly number[]).includes(value);
}

function isReferenceExpectationKind(value: unknown): value is ReferenceExpectationKind {
  return typeof value === 'string' && (REFERENCE_EXPECTATION_KINDS as readonly string[]).includes(value);
}

function rangesOverlap(
  left: { readonly start: number; readonly end: number },
  right: { readonly start: number; readonly end: number },
): boolean {
  return left.start <= right.end && right.start <= left.end;
}

function fixtureFinding(
  fixtureId: string,
  categoryCode: string,
  message: string,
  params?: Readonly<Record<string, string | number | boolean | readonly string[]>>,
): GateFinding {
  return { message: `${fixtureId}: ${message}`, subjects: [fixtureId], categoryCode, params };
}

function unknownFieldFindings(
  fixtureId: string,
  value: Record<string, unknown>,
  allowed: ReadonlySet<string>,
  location: string,
): GateFinding[] {
  return Object.keys(value)
    .filter((field) => !allowed.has(field))
    .sort()
    .map((field) =>
      fixtureFinding(
        fixtureId,
        'G3_FIXTURE_UNKNOWN_FIELD',
        `${location} has unknown field "${field}"`,
        { field, location },
      ),
    );
}

function parsedRef(
  fixtureId: string,
  value: unknown,
  location: string,
  findings: GateFinding[],
): { ref: string; range: { start: number; end: number } } | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) {
    findings.push(
      fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', `${location} must be a non-empty reference string`),
    );
    return undefined;
  }
  const ref = value.trim();
  const range = parseAnchorRef(ref);
  if (!range) {
    findings.push(
      fixtureFinding(
        fixtureId,
        'G3_FIXTURE_INVALID_REFERENCE',
        `${location} "${ref}" is not a canonical scripture range`,
        { location, ref },
      ),
    );
    return undefined;
  }
  return { ref, range };
}

function normaliseCorpusFixture(input: unknown): FixtureValidation {
  if (!isRecord(input)) {
    return {
      findings: [
        fixtureFinding('<unknown>', 'G3_FIXTURE_MALFORMED', 'fixture must be an object'),
      ],
    };
  }

  // Ranking-only fixtures share the golden directory but are not corpus fixtures.
  const isCorpusFixture =
    'query' in input ||
    'expectedTop' in input ||
    'expectedWithinTop' in input ||
    'preferredOrder' in input ||
    'mustNotRank' in input ||
    'mustNotLead' in input ||
    'additionalQueries' in input ||
    'forbiddenReasonLabelSubstrings' in input ||
    'referenceExpectations' in input;
  if (!isCorpusFixture) return { findings: [] };

  const fixtureId = typeof input.id === 'string' && input.id.trim() ? input.id.trim() : '<unknown>';
  const findings = unknownFieldFindings(fixtureId, input, FIXTURE_FIELDS, 'fixture');
  if (fixtureId === '<unknown>') {
    findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', 'fixture id must be a non-empty string'));
  }
  if (input.status !== 'active' && input.status !== 'pending') {
    findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', 'fixture status must be "active" or "pending"'));
  }
  if (input.query !== undefined && (typeof input.query !== 'string' || input.query.trim().length === 0)) {
    findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', 'fixture query must be a non-empty string'));
  }
  if (input.expectedWithinTop !== undefined && !isWithinTop(input.expectedWithinTop)) {
    findings.push(
      fixtureFinding(
        fixtureId,
        'G3_FIXTURE_INVALID_WINDOW',
        'expectedWithinTop must be one of 1, 3, 5, or 10',
      ),
    );
  }
  if (input.additionalQueries !== undefined &&
    (!Array.isArray(input.additionalQueries) || input.additionalQueries.some((query) => typeof query !== 'string' || query.trim().length === 0))) {
    findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', 'additionalQueries must contain non-empty strings'));
  }

  const expectedWithinTop = isWithinTop(input.expectedWithinTop) ? input.expectedWithinTop : 10;
  const expectedTop: NormalizedExpectation[] = [];
  const expectedRanges = new Set<string>();
  if (input.expectedTop !== undefined && !Array.isArray(input.expectedTop)) {
    findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', 'expectedTop must be an array'));
  } else {
    for (const [index, expectation] of (input.expectedTop ?? []).entries()) {
      const location = `expectedTop[${index}]`;
      if (!isRecord(expectation)) {
        findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', `${location} must be an object`));
        continue;
      }
      findings.push(...unknownFieldFindings(fixtureId, expectation, EXPECTATION_FIELDS, location));
      const hasRef = expectation.ref !== undefined;
      const hasReference = expectation.reference !== undefined;
      if (hasRef === hasReference) {
        findings.push(
          fixtureFinding(
            fixtureId,
            'G3_FIXTURE_MALFORMED',
            `${location} must contain exactly one of "ref" or legacy "reference"`,
          ),
        );
        continue;
      }
      const parsed = parsedRef(fixtureId, hasRef ? expectation.ref : expectation.reference, location, findings);
      if (!parsed) continue;
      if (expectation.withinTop !== undefined && !isWithinTop(expectation.withinTop)) {
        findings.push(
          fixtureFinding(fixtureId, 'G3_FIXTURE_INVALID_WINDOW', `${location}.withinTop must be one of 1, 3, 5, or 10`),
        );
        continue;
      }
      for (const field of [
        'requiredReasonFamily',
        'requiredReasonLabel',
        'requiredGroupingSourceId',
      ] as const) {
        if (expectation[field] !== undefined && (typeof expectation[field] !== 'string' || !expectation[field].trim())) {
          findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', `${location}.${field} must be a non-empty string`));
        }
      }
      const rangeKey = `${parsed.range.start}:${parsed.range.end}`;
      if (expectedRanges.has(rangeKey)) {
        findings.push(
          fixtureFinding(fixtureId, 'G3_FIXTURE_DUPLICATE_EXPECTATION', `${location} duplicates an expectedTop reference range`, { ref: parsed.ref }),
        );
        continue;
      }
      const overlapping = expectedTop.find((entry) => rangesOverlap(entry.range, parsed.range));
      if (overlapping !== undefined) {
        findings.push(
          fixtureFinding(
            fixtureId,
            'G3_FIXTURE_OVERLAPPING_EXPECTATION',
            `${location} overlaps expectedTop reference "${overlapping.ref}"`,
            { ref: parsed.ref, overlaps: overlapping.ref },
          ),
        );
        continue;
      }
      expectedRanges.add(rangeKey);
      expectedTop.push({
        ref: parsed.ref,
        range: parsed.range,
        withinTop: isWithinTop(expectation.withinTop) ? expectation.withinTop : expectedWithinTop,
        ...(typeof expectation.requiredReasonFamily === 'string'
          ? { requiredReasonFamily: expectation.requiredReasonFamily }
          : {}),
        ...(typeof expectation.requiredReasonLabel === 'string'
          ? { requiredReasonLabel: expectation.requiredReasonLabel }
          : {}),
        ...(typeof expectation.requiredGroupingSourceId === 'string'
          ? { requiredGroupingSourceId: expectation.requiredGroupingSourceId }
          : {}),
      });
    }
  }

  const preferredOrder: NormalizedPreferredOrder[] = [];
  const pairKeys = new Set<string>();
  const defaultPairWindow = expectedTop.reduce(
    (largest, expectation) => Math.max(largest, expectation.withinTop) as WithinTop,
    expectedWithinTop,
  );
  if (input.preferredOrder !== undefined && !Array.isArray(input.preferredOrder)) {
    findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', 'preferredOrder must be an array'));
  } else {
    for (const [index, pair] of (input.preferredOrder ?? []).entries()) {
      const location = `preferredOrder[${index}]`;
      if (!isRecord(pair)) {
        findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', `${location} must be an object`));
        continue;
      }
      findings.push(...unknownFieldFindings(fixtureId, pair, PREFERRED_ORDER_FIELDS, location));
      const above = parsedRef(fixtureId, pair.above, `${location}.above`, findings);
      const below = parsedRef(fixtureId, pair.below, `${location}.below`, findings);
      if (!above || !below) continue;
      if (pair.withinTop !== undefined && !isWithinTop(pair.withinTop)) {
        findings.push(
          fixtureFinding(
            fixtureId,
            'G3_FIXTURE_INVALID_WINDOW',
            `${location}.withinTop must be one of 1, 3, 5, or 10`,
          ),
        );
        continue;
      }
      const aboveKey = `${above.range.start}:${above.range.end}`;
      const belowKey = `${below.range.start}:${below.range.end}`;
      if (rangesOverlap(above.range, below.range)) {
        findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_SELF_PAIR', `${location} compares overlapping reference ranges`, { ref: above.ref }));
        continue;
      }
      const pairKey = [aboveKey, belowKey].sort().join('|');
      if (pairKeys.has(pairKey)) {
        findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_DUPLICATE_PAIR', `${location} duplicates or reverses an existing preferredOrder pair`));
        continue;
      }
      pairKeys.add(pairKey);
      preferredOrder.push({
        above: above.ref,
        below: below.ref,
        withinTop: isWithinTop(pair.withinTop) ? pair.withinTop : defaultPairWindow,
        aboveRange: above.range,
        belowRange: below.range,
      });
    }
  }

  const mustNotRank: NormalizedCorpusFixture['mustNotRank'][number][] = [];
  const forbiddenRanges = new Set<string>();
  if (input.mustNotRank !== undefined && !Array.isArray(input.mustNotRank)) {
    findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', 'mustNotRank must be an array'));
  } else {
    for (const [index, forbidden] of (input.mustNotRank ?? []).entries()) {
      const location = `mustNotRank[${index}]`;
      if (!isRecord(forbidden)) {
        findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', `${location} must be an object`));
        continue;
      }
      findings.push(...unknownFieldFindings(fixtureId, forbidden, MUST_NOT_RANK_FIELDS, location));
      const hasRef = forbidden.ref !== undefined;
      const hasReference = forbidden.reference !== undefined;
      if (hasRef === hasReference) {
        findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', `${location} must contain exactly one of "ref" or legacy "reference"`));
        continue;
      }
      const parsed = parsedRef(fixtureId, hasRef ? forbidden.ref : forbidden.reference, location, findings);
      if (!parsed) continue;
      if (forbidden.why !== undefined && (typeof forbidden.why !== 'string' || !forbidden.why.trim())) {
        findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', `${location}.why must be a non-empty string`));
      }
      const rangeKey = `${parsed.range.start}:${parsed.range.end}`;
      if (forbiddenRanges.has(rangeKey)) {
        findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_DUPLICATE_EXPECTATION', `${location} duplicates a mustNotRank reference range`, { ref: parsed.ref }));
        continue;
      }
      forbiddenRanges.add(rangeKey);
      mustNotRank.push({
        ref: parsed.ref,
        range: parsed.range,
        ...(typeof forbidden.why === 'string' ? { why: forbidden.why } : {}),
      });
    }
  }

  const mustNotLead: NormalizedCorpusFixture['mustNotLead'][number][] = [];
  const leadGuardRanges = new Set<string>();
  if (input.mustNotLead !== undefined && !Array.isArray(input.mustNotLead)) {
    findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', 'mustNotLead must be an array'));
  } else {
    for (const [index, guard] of (input.mustNotLead ?? []).entries()) {
      const location = `mustNotLead[${index}]`;
      if (!isRecord(guard)) {
        findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', `${location} must be an object`));
        continue;
      }
      findings.push(...unknownFieldFindings(fixtureId, guard, MUST_NOT_LEAD_FIELDS, location));
      const hasRef = guard.ref !== undefined;
      const hasReference = guard.reference !== undefined;
      if (hasRef === hasReference) {
        findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', `${location} must contain exactly one of "ref" or legacy "reference"`));
        continue;
      }
      const parsed = parsedRef(fixtureId, hasRef ? guard.ref : guard.reference, location, findings);
      if (!parsed) continue;
      if (typeof guard.why !== 'string' || !guard.why.trim()) {
        // Unlike mustNotRank's legacy-optional why: a leadership demotion is
        // always a human ruling, and the finding must be able to cite it.
        findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', `${location}.why is required: name the human judgment this guard enforces`));
        continue;
      }
      if (guard.withinTop !== undefined
          && !(MUST_NOT_LEAD_WINDOWS as readonly number[]).includes(guard.withinTop as number)) {
        findings.push(
          fixtureFinding(
            fixtureId,
            'G3_FIXTURE_INVALID_WINDOW',
            `${location}.withinTop must be 1 or 3 — mustNotLead measures leadership, not presence`,
          ),
        );
        continue;
      }
      const rangeKey = `${parsed.range.start}:${parsed.range.end}`;
      if (leadGuardRanges.has(rangeKey)) {
        findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_DUPLICATE_EXPECTATION', `${location} duplicates a mustNotLead reference range`, { ref: parsed.ref }));
        continue;
      }
      leadGuardRanges.add(rangeKey);
      mustNotLead.push({
        ref: parsed.ref,
        why: guard.why,
        withinTop: (guard.withinTop as MustNotLeadWindow | undefined) ?? 1,
        range: parsed.range,
      });
    }
  }

  const forbiddenReasonLabelSubstrings: string[] = [];
  if (input.forbiddenReasonLabelSubstrings !== undefined) {
    if (
      !Array.isArray(input.forbiddenReasonLabelSubstrings) ||
      input.forbiddenReasonLabelSubstrings.length === 0 ||
      input.forbiddenReasonLabelSubstrings.some(
        (substring) => typeof substring !== 'string' || substring.trim().length === 0,
      )
    ) {
      // An empty list would be an assertion field that asserts nothing —
      // the vacuous decoration the gate-discipline covenant forbids.
      findings.push(
        fixtureFinding(
          fixtureId,
          'G3_FIXTURE_MALFORMED',
          'forbiddenReasonLabelSubstrings must be a non-empty array of non-empty strings',
        ),
      );
    } else {
      forbiddenReasonLabelSubstrings.push(...(input.forbiddenReasonLabelSubstrings as string[]));
    }
  }

  const referenceExpectations: ReferenceExpectation[] = [];
  if (input.referenceExpectations !== undefined) {
    const mixed = DISCOVERY_ONLY_FIELDS.filter((field) => field in input);
    if (mixed.length > 0) {
      findings.push(
        fixtureFinding(
          fixtureId,
          'G3_FIXTURE_MALFORMED',
          `referenceExpectations cannot be combined with ${mixed.join(', ')} — a fixture ` +
            'measures reference resolution or discovery ranking, never both',
          { fields: mixed },
        ),
      );
    }
    if (!Array.isArray(input.referenceExpectations)) {
      findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', 'referenceExpectations must be an array'));
    } else if (input.referenceExpectations.length === 0) {
      // An empty list would be an active fixture asserting nothing — the
      // vacuous pass this schema exists to make impossible.
      findings.push(
        fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', 'referenceExpectations must contain at least one entry'),
      );
    } else {
      const seenQueries = new Set<string>();
      for (const [index, entry] of input.referenceExpectations.entries()) {
        const location = `referenceExpectations[${index}]`;
        if (!isRecord(entry)) {
          findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', `${location} must be an object`));
          continue;
        }
        findings.push(...unknownFieldFindings(fixtureId, entry, REFERENCE_EXPECTATION_FIELDS, location));
        if (typeof entry.query !== 'string' || entry.query.trim().length === 0) {
          findings.push(fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', `${location}.query must be a non-empty string`));
          continue;
        }
        if (!isReferenceExpectationKind(entry.expectedKind)) {
          findings.push(
            fixtureFinding(
              fixtureId,
              'G3_FIXTURE_MALFORMED',
              `${location}.expectedKind must be "reference", "invalid-reference", or "discovery"`,
            ),
          );
          continue;
        }
        if (entry.expectedKind === 'reference') {
          if (typeof entry.expectedPassage !== 'string' || entry.expectedPassage.trim().length === 0) {
            // Kind alone is a hollow guard: "it resolved to SOME passage"
            // admits every mis-resolution. Each reference pin names its label.
            findings.push(
              fixtureFinding(
                fixtureId,
                'G3_FIXTURE_MALFORMED',
                `${location}.expectedPassage is required with expectedKind "reference": ` +
                  'name the exact passage label the query must resolve to',
              ),
            );
            continue;
          }
        } else if (entry.expectedPassage !== undefined) {
          findings.push(
            fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', `${location}.expectedPassage is only valid with expectedKind "reference"`),
          );
          continue;
        }
        if (entry.expectedKind === 'invalid-reference') {
          if (entry.expectedSuggestion !== undefined &&
            (typeof entry.expectedSuggestion !== 'string' || entry.expectedSuggestion.trim().length === 0)) {
            findings.push(
              fixtureFinding(fixtureId, 'G3_FIXTURE_MALFORMED', `${location}.expectedSuggestion must be a non-empty canonical book name`),
            );
            continue;
          }
        } else if (entry.expectedSuggestion !== undefined) {
          findings.push(
            fixtureFinding(
              fixtureId,
              'G3_FIXTURE_MALFORMED',
              `${location}.expectedSuggestion is only valid with expectedKind "invalid-reference"`,
            ),
          );
          continue;
        }
        // Deterministic engine, one query, one outcome: a second entry for
        // the same query is either redundant or contradictory.
        if (seenQueries.has(entry.query)) {
          findings.push(
            fixtureFinding(
              fixtureId,
              'G3_FIXTURE_DUPLICATE_EXPECTATION',
              `${location} duplicates the query "${entry.query}"`,
              { query: entry.query },
            ),
          );
          continue;
        }
        seenQueries.add(entry.query);
        referenceExpectations.push({
          query: entry.query,
          expectedKind: entry.expectedKind,
          ...(typeof entry.expectedPassage === 'string' ? { expectedPassage: entry.expectedPassage } : {}),
          ...(typeof entry.expectedSuggestion === 'string' ? { expectedSuggestion: entry.expectedSuggestion } : {}),
        });
      }
    }
  }

  if (findings.length > 0 || fixtureId === '<unknown>' || (input.status !== 'active' && input.status !== 'pending')) {
    return { findings };
  }
  return {
    findings,
    fixture: {
      id: fixtureId,
      status: input.status,
      ...(typeof input.query === 'string' ? { query: input.query } : {}),
      expectedTop,
      expectedWithinTop,
      preferredOrder,
      additionalQueries: (input.additionalQueries as readonly string[] | undefined) ?? [],
      mustNotRank,
      mustNotLead,
      ...(Array.isArray(input.coversConcepts) ? { coversConcepts: input.coversConcepts as readonly string[] } : {}),
      forbiddenReasonLabelSubstrings,
      referenceExpectations,
    },
  };
}

/** Authoritative fixture-schema validation shared with workbench promotion. */
export function validateCorpusFixture(input: unknown): readonly GateFinding[] {
  return normaliseCorpusFixture(input).findings;
}

function measuredWindow(fixture: NormalizedCorpusFixture): WithinTop {
  return fixture.expectedTop.reduce(
    (largest, expectation) => Math.max(largest, expectation.withinTop) as WithinTop,
    fixture.expectedWithinTop,
  );
}

function hitInRange(entry: { targetId: string }, range: { start: number; end: number }): boolean {
  const verseId = verseIdOf(entry.targetId);
  return verseId !== null && verseId >= range.start && verseId <= range.end;
}

export interface CoverageConcept {
  readonly id: string;
  readonly label: string;
}

/**
 * G3, structural half: every concept must be measured by some fixture.
 *
 * `ontology/README.md` and CLAUDE.md both state that a concept pack shipping
 * without fixtures "is rejected structurally". It was not: the rule lived only
 * in prose, and eight founding concepts had no fixture at all. A rule nobody
 * enforces is the same shape as a gate that always reports pass — this repo's
 * own words for the thing it refuses to ship.
 *
 * Coverage is deliberately cheap to satisfy and impossible to satisfy
 * accidentally: name the fixture after the concept, or say which concepts it
 * covers. What it buys is that no future pack can be admitted with nothing
 * measuring whether it helped.
 */
export function conceptCoverageGate(
  concepts: readonly CoverageConcept[],
  fixtures: readonly CorpusFixture[],
): GateResult {
  if (concepts.length === 0) {
    return notApplicable(
      'G3-golden',
      'Concept fixture coverage',
      'no concepts in ontology/concepts yet; the coverage check is implemented and unit-tested',
    );
  }

  const known = new Map(concepts.map((concept) => [concept.id, concept]));
  const dangling = new Set<string>();
  const unproven = new Map<string, string[]>();
  const covered = new Set<string>();

  // A declaration alone is not evidence. A covered concept must be exercised
  // by an active query and name its own anchor family and exact Theme label.
  // This makes deleting that concept fail its supposed coverage fixture even
  // when a neighbouring concept happens to anchor the same passage.
  for (const fixture of fixtures) {
    const explicitlyClaimed = fixture.coversConcepts !== undefined;
    const claimed = fixture.coversConcepts ?? (known.has(fixture.id) ? [fixture.id] : []);
    for (const id of claimed) {
      const concept = known.get(id);
      if (!concept) {
        if (explicitlyClaimed) dangling.add(id);
        continue;
      }
      const expectedLabel = `Theme: ${concept.label}`;
      const demonstrates =
        fixture.status === 'active' &&
        typeof fixture.query === 'string' &&
        fixture.query.trim().length > 0 &&
        (fixture.expectedTop ?? []).some(
          (expectation) =>
            expectation.requiredReasonFamily === 'concept_anchor' &&
            expectation.requiredReasonLabel === expectedLabel,
        );
      if (demonstrates) {
        covered.add(id);
      } else {
        const fixtureIds = unproven.get(id) ?? [];
        fixtureIds.push(fixture.id);
        unproven.set(id, fixtureIds);
      }
    }
  }

  const findings: GateFinding[] = [];
  for (const id of [...dangling].sort()) {
    findings.push({
      message:
        `no concept "${id}" exists, but a fixture declares it in coversConcepts. The concept ` +
        'was renamed or removed and the fixture now measures nothing under that name.',
      subjects: [id],
    });
  }

  for (const concept of concepts) {
    if (covered.has(concept.id)) continue;
    const claimers = unproven.get(concept.id) ?? [];
    findings.push({
      message:
        `${concept.id}: no active fixture demonstrates this concept with an expectedTop assertion ` +
        `requiring concept_anchor and the exact label "Theme: ${concept.label}". ` +
        (claimers.length > 0
          ? `Declared by ${claimers.join(', ')}, but the assertion is incomplete.`
          : `Add eval/golden/${concept.id}.json or a complete coversConcepts assertion.`),
      subjects: [concept.id],
    });
  }

  if (findings.length > 0) {
    return fail(
      'G3-golden',
      'Concept fixture coverage',
      `${findings.length} concept coverage claim(s) are missing, dangling, or unproven`,
      findings,
    );
  }

  return pass(
    'G3-golden',
    'Concept fixture coverage',
    `all ${concepts.length} concept(s) are demonstrated by an active anchor assertion`,
    { concepts: concepts.length },
  );
}

/** Verse id encoded in a target id like "WEB:59001022". */
function verseIdOf(targetId: string): number | null {
  const numeric = targetId.split(':')[1];
  if (!numeric) return null;
  const value = Number(numeric);
  return Number.isFinite(value) ? value : null;
}

export async function runCorpusFixture(
  engine: ScriptureEngine,
  fixture: CorpusFixture,
): Promise<string[]> {
  const validated = normaliseCorpusFixture(fixture);
  if (!validated.fixture) return validated.findings.map((finding) => finding.message);
  if (!isRunnable(validated.fixture)) return [];
  return (await runNormalisedFixture(engine, validated.fixture)).map((finding) => finding.message);
}

function isRunnable(fixture: NormalizedCorpusFixture): boolean {
  return Boolean(fixture.query) || fixture.referenceExpectations.length > 0;
}

async function runNormalisedFixture(
  engine: ScriptureEngine,
  fixture: NormalizedCorpusFixture,
): Promise<GateFinding[]> {
  const findings: GateFinding[] = [];
  // The two fixture forms are structurally exclusive, so exactly one loop runs.
  for (const expectation of fixture.referenceExpectations) {
    findings.push(...(await runOneReferenceQuery(engine, fixture.id, expectation)));
  }
  if (fixture.query) {
    for (const query of [fixture.query, ...fixture.additionalQueries]) {
      findings.push(...(await runOneQuery(engine, fixture, query)));
    }
    findings.push(...(await guardVacuityFindings(engine, fixture, findings)));
  }
  return findings;
}

/**
 * A guard that never fires has two very different explanations: the corpus
 * behaved, or the corpus does not contain the guarded passage at all. The
 * second is a decoration wearing a guard's name — the F34 finding — so it is
 * reported as VACUOUS, named, at warn level. Never as a pass.
 */
async function guardVacuityFindings(
  engine: ScriptureEngine,
  fixture: NormalizedCorpusFixture,
  observed: readonly GateFinding[],
): Promise<GateFinding[]> {
  const violatedRefs = new Set(
    observed
      .filter(
        (finding) =>
          finding.categoryCode === 'G3_MUST_NOT_RANK' || finding.categoryCode === 'G3_MUST_NOT_LEAD',
      )
      .map((finding) => finding.params?.['ref'])
      .filter((ref): ref is string => typeof ref === 'string'),
  );
  const findings: GateFinding[] = [];
  const guards: readonly { readonly field: string; readonly ref: string }[] = [
    ...fixture.mustNotRank.map((guard) => ({ field: 'mustNotRank', ref: guard.ref })),
    ...fixture.mustNotLead.map((guard) => ({ field: 'mustNotLead', ref: guard.ref })),
  ];
  for (const guard of guards) {
    // A ref observed in the results is definitionally present; the violation
    // finding already rings and must not be contradicted by a vacuity claim.
    if (violatedRefs.has(guard.ref)) continue;
    const passage = await engine.passage(guard.ref);
    const present = passage.kind === 'passage' && passage.passage.verses.length > 0;
    if (present) continue;
    findings.push({
      message:
        `${fixture.id}${fixture.status === 'pending' ? ' (pending)' : ''}: ${guard.field} guard ` +
        `"${guard.ref}" is VACUOUS — the reference resolves to no verse in the running corpus, so ` +
        'the guard cannot protect anything until the corpus carries it',
      subjects: [fixture.id],
      categoryCode: GUARD_VACUOUS_CATEGORY,
      params: { field: guard.field, ref: guard.ref, fixtureStatus: fixture.status },
    });
  }
  return findings;
}

async function runOneReferenceQuery(
  engine: ScriptureEngine,
  fixtureId: string,
  expectation: ReferenceExpectation,
): Promise<GateFinding[]> {
  const { query, expectedKind } = expectation;
  const result = await engine.research(query);
  if (result.kind !== expectedKind) {
    return [
      fixtureFinding(
        fixtureId,
        'G3_REFERENCE_KIND',
        `expected "${query}" to resolve as ${expectedKind}, but the engine returned ${result.kind}`,
        { query, expectedKind, actualKind: result.kind },
      ),
    ];
  }
  const findings: GateFinding[] = [];
  if (result.kind === 'reference' && expectation.expectedPassage !== undefined &&
    result.passage.reference !== expectation.expectedPassage) {
    findings.push(
      fixtureFinding(
        fixtureId,
        'G3_REFERENCE_PASSAGE_LABEL',
        `"${query}" resolves to "${result.passage.reference}", expected exactly ` +
          `"${expectation.expectedPassage}". The label is part of the contract: the right ` +
          'passage under the wrong name is still a failure.',
        { query, expectedPassage: expectation.expectedPassage, actualPassage: result.passage.reference },
      ),
    );
  }
  if (result.kind === 'invalid-reference' && expectation.expectedSuggestion !== undefined) {
    // The suggestion field is unlanded engine work; read it structurally so
    // the assertion fails honestly against its absence instead of the runner
    // passing vacuously or refusing the fixture.
    const suggestion = (result as { readonly suggestion?: { readonly book?: unknown } }).suggestion;
    const book = typeof suggestion?.book === 'string' ? suggestion.book : undefined;
    if (book !== expectation.expectedSuggestion) {
      findings.push(
        fixtureFinding(
          fixtureId,
          'G3_REFERENCE_SUGGESTION',
          `"${query}" is invalid-reference but ` +
            (book === undefined ? 'carries no suggestion' : `suggests the book "${book}"`) +
            `; expected the suggestion book "${expectation.expectedSuggestion}"`,
          { query, expectedSuggestion: expectation.expectedSuggestion, actualSuggestion: book ?? '' },
        ),
      );
    }
  }
  return findings;
}

async function runOneQuery(
  engine: ScriptureEngine,
  fixture: NormalizedCorpusFixture,
  query: string,
): Promise<GateFinding[]> {
  const findings: GateFinding[] = [];
  const result = await engine.research(query);
  const results = result.kind === 'discovery' ? result.results : [];

  for (const expectation of fixture.expectedTop) {
    const top = results.slice(0, expectation.withinTop);
    const hits = top.filter((entry) => hitInRange(entry, expectation.range));
    if (hits.length === 0) {
      findings.push(
        fixtureFinding(
          fixture.id,
          'G3_EXPECTED_TOP_ABSENT',
          `expected ${expectation.ref} within the top ${expectation.withinTop} for "${query}", but it is absent`,
          { query, ref: expectation.ref, withinTop: expectation.withinTop },
        ),
      );
      continue;
    }
    if (
      expectation.requiredReasonLabel &&
      !hits.some((hit) =>
        hit.reasons.some((reason) => reason.label === expectation.requiredReasonLabel),
      )
    ) {
      // Two concepts may legitimately anchor one verse; without this the
      // fixture measures whichever of them happens to survive.
      findings.push(
        fixtureFinding(
          fixture.id,
          'G3_EXPECTED_TOP_REASON_LABEL',
          `${expectation.ref} ranks for "${query}" but carries no reason labelled ` +
            `'${expectation.requiredReasonLabel}' (has: ` +
            `${[...new Set(hits.flatMap((hit) => hit.reasons.map((reason) => reason.label)))].join(' | ')}). ` +
            'The fixture is measuring a different concept than the one it covers.',
          { query, ref: expectation.ref, withinTop: expectation.withinTop },
        ),
      );
    }

    if (
      expectation.requiredReasonFamily &&
      !hits.some((hit) =>
        hit.reasons.some((reason) => reason.family === expectation.requiredReasonFamily),
      )
    ) {
      // The Phase 1 trap, made explicit: right verse, wrong evidence.
      findings.push(
        fixtureFinding(
          fixture.id,
          'G3_EXPECTED_TOP_REASON_FAMILY',
          `${expectation.ref} ranks for "${query}" but carries no ` +
            `'${expectation.requiredReasonFamily}' reason (has: ` +
            `${[...new Set(hits.flatMap((hit) => hit.reasons.map((reason) => reason.family)))].join(', ')}). ` +
            'The right passage for the wrong reason is still a failure.',
          { query, ref: expectation.ref, withinTop: expectation.withinTop },
        ),
      );
    }

    if (expectation.requiredGroupingSourceId !== undefined) {
      // P5.6 PR 1 capability, fail-closed by construction: the engine does
      // not emit result grouping until the PR 2 behavior lands, so this read
      // is structural (the §5 `grouping` field does not exist on
      // DiscoveryResult yet) and the check CANNOT pass today. That is the
      // point — an active fixture demanding grouping provenance must fail
      // until the mechanism it names exists and cites the named source, and
      // when PR 2 adds the typed field this code enforces it unchanged.
      const satisfied = hits.some((hit) => {
        const grouping = (
          hit as { grouping?: { provenance?: { sourceId?: unknown } } }
        ).grouping;
        return grouping?.provenance?.sourceId === expectation.requiredGroupingSourceId;
      });
      if (!satisfied) {
        findings.push(
          fixtureFinding(
            fixture.id,
            'G3_EXPECTED_TOP_GROUPING_SOURCE',
            `${expectation.ref} ranks for "${query}" but is not a grouped result ` +
              `citing '${expectation.requiredGroupingSourceId}' grouping provenance. ` +
              'A passage grouped by the wrong mechanism — or not grouped at all — ' +
              'is a failure: the grouping explanation is part of the contract.',
            { query, ref: expectation.ref, withinTop: expectation.withinTop },
          ),
        );
      }
    }
  }

  const withinTop = measuredWindow(fixture);
  const top = results.slice(0, withinTop);
  for (const forbidden of fixture.mustNotRank) {
    const offender = top.find((entry) => hitInRange(entry, forbidden.range));
    if (offender) {
      findings.push(
        fixtureFinding(
          fixture.id,
          'G3_MUST_NOT_RANK',
          `${forbidden.ref} must not rank for "${query}" but appears at position ` +
            `${top.indexOf(offender) + 1}. ${forbidden.why ?? ''}`.trim(),
          { query, ref: forbidden.ref, withinTop },
        ),
      );
    }
  }

  for (const guard of fixture.mustNotLead) {
    const window = results.slice(0, guard.withinTop);
    const offender = window.find((entry) => hitInRange(entry, guard.range));
    if (offender) {
      findings.push(
        fixtureFinding(
          fixture.id,
          'G3_MUST_NOT_LEAD',
          `${guard.ref} must not lead "${query}" but appears at position ` +
            `${window.indexOf(offender) + 1} of the top ${guard.withinTop}. ${guard.why} ` +
            '(It may rank below the leadership window — scripture is demoted here, never suppressed.)',
          { query, ref: guard.ref, withinTop: guard.withinTop },
        ),
      );
    }
  }

  // Explanation tripwire (ruling row 19): scans EVERY returned result, not a
  // window — a forbidden claim is a contract breach wherever it appears.
  for (const substring of fixture.forbiddenReasonLabelSubstrings) {
    for (const entry of results) {
      const offending = entry.reasons.find((reason) => reason.label.includes(substring));
      if (offending) {
        findings.push(
          fixtureFinding(
            fixture.id,
            'G3_FORBIDDEN_REASON_LABEL',
            `a result for "${query}" carries the reason '${offending.label}', which contains ` +
              `the forbidden fragment '${substring}'. The explanation is part of the contract: ` +
              'this fixture forbids any chip from making that claim for its queries.',
            { query, substring, label: offending.label },
          ),
        );
        break;
      }
    }
  }

  for (const preference of fixture.preferredOrder) {
    const pairWindow = results.slice(0, preference.withinTop);
    const above = pairWindow.find((entry) => hitInRange(entry, preference.aboveRange));
    const below = pairWindow.find((entry) => hitInRange(entry, preference.belowRange));
    // Absence is intentionally not a pairwise failure. expectedTop owns that assertion.
    if (above && below && pairWindow.indexOf(above) >= pairWindow.indexOf(below)) {
      findings.push(
        fixtureFinding(
          fixture.id,
          'G3_PREFERRED_ORDER',
          `expected ${preference.above} above ${preference.below} within the top ${preference.withinTop} ` +
            `for "${query}", but found them at positions ${pairWindow.indexOf(above) + 1} and ` +
            `${pairWindow.indexOf(below) + 1}`,
          {
            query,
            above: preference.above,
            below: preference.below,
            withinTop: preference.withinTop,
          },
        ),
      );
    }
  }

  return findings;
}

export async function corpusGoldenGate(
  engine: ScriptureEngine,
  fixtures: readonly CorpusFixture[],
): Promise<GateResult> {
  const validated = fixtures.map(normaliseCorpusFixture);
  const runnable = validated.flatMap((result) => result.fixture ? [result.fixture] : []);
  const active = runnable.filter((fixture) => fixture.status === 'active' && isRunnable(fixture));
  const pending = runnable.filter((fixture) => fixture.status === 'pending' && isRunnable(fixture));
  const isVacuous = (finding: GateFinding): boolean =>
    finding.categoryCode === GUARD_VACUOUS_CATEGORY;

  const activeRun: GateFinding[] = [];
  for (const fixture of active) {
    activeRun.push(...(await runNormalisedFixture(engine, fixture)));
  }
  const findings: GateFinding[] = [
    ...validated.flatMap((result) => result.findings),
    ...activeRun.filter((finding) => !isVacuous(finding)),
  ];
  const vacuousFindings: GateFinding[] = activeRun.filter(isVacuous);

  const metrics = {
    activeCorpusFixtures: active.length,
    pendingCorpusFixtures: pending.length,
    expectedTopAssertions: runnable.reduce((count, fixture) => count + fixture.expectedTop.length, 0),
    preferredOrderAssertions: runnable.reduce((count, fixture) => count + fixture.preferredOrder.length, 0),
    mustNotLeadAssertions: runnable.reduce((count, fixture) => count + fixture.mustNotLead.length, 0),
    fixtureValidationFailures: validated.reduce((count, result) => count + result.findings.length, 0),
  };

  if (findings.length > 0) {
    const failure = fail(
      'G3-golden',
      'Golden regression (corpus)',
      `${findings.length} corpus fixture expectation(s) failed`,
      findings,
      metrics,
    );
    // Vacuity stays visible even beside real failures — a red run must not
    // hide which of its guards were decorations all along.
    return vacuousFindings.length > 0
      ? mergeGateResults('Golden regression (corpus)', [
          failure,
          guardVacuityResult(vacuousFindings),
        ])
      : failure;
  }

  // Pending fixtures are RUN even though they cannot fail the build, because
  // both of their states carry a signal nobody would notice otherwise: one
  // that has started passing is exactly the promotion trigger, and one that
  // still fails is the live specification for unlanded engine work — its
  // current failure detail must be visible, not just "now passing".
  const nowPassing: string[] = [];
  const stillFailing: GateFinding[] = [];
  let vacuousOnlyPending = 0;
  for (const fixture of pending) {
    const allPendingFindings = await runNormalisedFixture(engine, fixture);
    const pendingFindings = allPendingFindings.filter((finding) => !isVacuous(finding));
    const pendingVacuous = allPendingFindings.filter(isVacuous);
    vacuousFindings.push(...pendingVacuous);
    if (allPendingFindings.length === 0) {
      nowPassing.push(fixture.id);
      continue;
    }
    if (pendingFindings.length === 0) {
      // Only vacuous guards: nothing failed, but nothing was measured either.
      // Not a promotion candidate — promoting it would activate a decoration.
      vacuousOnlyPending += 1;
      continue;
    }
    const preview = pendingFindings
      .slice(0, 2)
      .map((finding) => {
        const ref = finding.params?.['ref'];
        return typeof ref === 'string' ? `${finding.categoryCode} ${ref}` : `${finding.categoryCode}`;
      })
      .join(', ');
    stillFailing.push({
      message:
        `pending fixture ${fixture.id}: currently fails ${pendingFindings.length} ` +
        `expectation(s): ${preview}; full detail in machine report`,
      subjects: [fixture.id],
      // Semantic (machine-report) form, unlike the G3_* codes above: this
      // finding rides a warn gate through report generation on every honest
      // run, so it must satisfy the machine report's category pattern.
      categoryCode: 'sse.gauntlet.v1.finding.g3-golden.pending-still-failing',
      params: { failedExpectationMessages: pendingFindings.map((finding) => finding.message) },
      metrics: { failedExpectations: pendingFindings.length },
    });
  }

  const promote =
    nowPassing.length > 0
      ? ` — PENDING FIXTURES NOW PASSING, promote to active: ${nowPassing.join(', ')}`
      : '';
  const corpusResult: GateResult = {
    ...pass(
    'G3-golden',
    'Golden regression (corpus)',
    `${active.length} corpus fixture(s) hold; ${pending.length} pending${promote}`,
    { ...metrics, vacuousGuards: vacuousFindings.length },
    ),
    promotionCandidates: nowPassing,
  };
  // Warn, never fail: a pending fixture specifies unlanded work, so its
  // failing state is outside the change under review. The warn status flips
  // the verdict to ADMIT_WITH_WARNINGS through the normal status path —
  // findings alone cannot change a verdict.
  const pendingStatus =
    stillFailing.length > 0
      ? warn(
          'G3-golden',
          'Pending fixture status',
          `Pending fixture status: ${stillFailing.length} of ${pending.length} still failing`,
          stillFailing,
          { pendingFailures: stillFailing.length },
        )
      : pass(
          'G3-golden',
          'Pending fixture status',
          pending.length === 0
            ? 'Pending fixture status: no pending fixtures'
            : vacuousOnlyPending > 0
              ? `Pending fixture status: ${pending.length} pending, ` +
                `${vacuousOnlyPending} vacuous-guarded (see Guard vacuity), none failing`
              : `Pending fixture status: ${pending.length} pending, all currently passing`,
          { pendingFailures: 0 },
        );
  return mergeGateResults('Golden regression (corpus)', [
    corpusResult,
    pendingStatus,
    ...(vacuousFindings.length > 0 ? [guardVacuityResult(vacuousFindings)] : []),
  ]);
}

/**
 * The vacuity sub-result: warn-level, named refs, merged into G3 so an
 * unmeasurable guard flips the verdict to ADMIT_WITH_WARNINGS instead of
 * passing silently. S-tier declares zero vacuous guards a requirement.
 */
function guardVacuityResult(vacuousFindings: readonly GateFinding[]): GateResult {
  return warn(
    'G3-golden',
    'Guard vacuity',
    `Guard vacuity: ${vacuousFindings.length} guard(s) name references absent from this corpus`,
    vacuousFindings,
  );
}
