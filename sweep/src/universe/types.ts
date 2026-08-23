/**
 * Universe line and expectation schema (MS-1 consumes, MS-2 compiles).
 *
 * Every universe line carries its expectation block AT GENERATION TIME —
 * grading never guesses what a query was for. The five expectation kinds are
 * the plan's, verbatim:
 *
 *   concept-anchors     the query targets a concept; its curated anchors are
 *                       the expected surface (graded by MS-7 check 1/2)
 *   verse-ref           the query is a reference (or variant); it must
 *                       resolve to exactly this passage, or type as invalid
 *   base-query-oracle   a Ring-2 perturbation; its expected results are its
 *                       BASE query's own snapshot from the same run, with the
 *                       correction cited (MS-4's perturbation oracle)
 *   correction-cited    the query contains a deliberate misspelling; any
 *                       substitution must be cited, never silent
 *   none                exploratory — no machine expectation; the residue
 *                       feeds AI grading and the measured-gap channel
 */

export const UNIVERSE_LINE_SCHEMA = 'scripture-search-engine/sweep-universe-line/v1';

export type Register = 'church-member' | 'worship-leader' | 'pastor';

export const REGISTERS: readonly Register[] = ['church-member', 'worship-leader', 'pastor'];

export type Expectation =
  | {
      readonly kind: 'concept-anchors';
      readonly conceptId: string;
      /** Curated anchor references expected to surface (from the concept pack). */
      readonly anchors: readonly string[];
      /** Additional concept ids also acceptable as the leading theme. */
      readonly alsoAcceptable?: readonly string[];
    }
  | {
      readonly kind: 'verse-ref';
      /** Canonical passage label this must resolve to… */
      readonly expectedReference?: string;
      /** …or, for malformed inputs, the typed invalid-reference contract. */
      readonly expectInvalid?: true;
      /** When invalid, the suggestion the dead end should carry (if any). */
      readonly expectedSuggestion?: string;
    }
  | {
      readonly kind: 'base-query-oracle';
      /** The Ring-1 queryId whose snapshot is this line's oracle. */
      readonly baseQueryId: string;
      /** Every substituted token must be cited — silent correction = defect. */
      readonly requireCitedCorrection: boolean;
    }
  | {
      readonly kind: 'correction-cited';
      /** The misspelled surface forms planted in the query. */
      readonly misspelled: readonly string[];
    }
  | { readonly kind: 'none' };

export interface UniverseLine {
  /** Stable, re-derivable id: `<grammarId>:<hash>` for compiled lines. */
  readonly queryId: string;
  readonly query: string;
  /** Which generator wrote the line (grammarId, 'paraphrase', 'perturb', …). */
  readonly generator: string;
  readonly register?: Register;
  /** Battery-style category, when the generator maps to one. */
  readonly category?: string;
  readonly expectation: Expectation;
  /**
   * Crisis-register lines are INCLUDED (harmful #1s cost most there) and
   * tagged, so MS-9's tiered human policy can route them. The telemetry
   * crisis-exclusion governs user logs, not synthetic queries.
   */
  readonly crisisAdjacent?: true;
  /**
   * Adversarial lines: references that must NOT lead the results — each one
   * names (or is checked against) an MS-7 watchlist row. Attribution of a
   * documented negative context, never a theology score (covenant #6).
   */
  readonly mustNotLead?: readonly string[];
  /**
   * Paraphrase lines inherit their seed's expectation at reduced confidence:
   * a miss routes to AI grading, not straight to a defect record.
   */
  readonly confidence?: 'generated' | 'inherited';
  /** UNIVERSE-VERSION at compile time (MS-2). */
  readonly universeVersion?: string;
}

const EXPECTATION_KINDS = new Set([
  'concept-anchors',
  'verse-ref',
  'base-query-oracle',
  'correction-cited',
  'none',
]);

export class UniverseSchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UniverseSchemaError';
  }
}

/** Fail-closed structural validation of one universe line. */
export function validateUniverseLine(value: unknown, lineNumber: number): UniverseLine {
  const fail = (why: string): never => {
    throw new UniverseSchemaError(`universe line ${lineNumber}: ${why}`);
  };
  if (value === null || typeof value !== 'object' || Array.isArray(value)) fail('not an object');
  const line = value as Record<string, unknown>;
  if (typeof line.queryId !== 'string' || line.queryId.length === 0) fail('missing queryId');
  if (typeof line.query !== 'string' || line.query.length === 0) fail('missing query');
  if (typeof line.generator !== 'string' || line.generator.length === 0) fail('missing generator');
  if (line.register !== undefined && !REGISTERS.includes(line.register as Register)) {
    fail(`unknown register ${String(line.register)}`);
  }
  const expectation = line.expectation as Record<string, unknown> | undefined;
  if (expectation === null || typeof expectation !== 'object') fail('missing expectation block');
  const kind = (expectation as Record<string, unknown>).kind;
  if (typeof kind !== 'string' || !EXPECTATION_KINDS.has(kind)) {
    fail(`unknown expectation kind ${String(kind)}`);
  }
  if (kind === 'concept-anchors') {
    const anchors = (expectation as Record<string, unknown>).anchors;
    const conceptId = (expectation as Record<string, unknown>).conceptId;
    if (typeof conceptId !== 'string' || conceptId.length === 0) fail('concept-anchors without conceptId');
    if (!Array.isArray(anchors) || anchors.length === 0 || anchors.some((a) => typeof a !== 'string')) {
      fail('concept-anchors without anchors[]');
    }
  }
  if (kind === 'verse-ref') {
    const expected = (expectation as Record<string, unknown>).expectedReference;
    const invalid = (expectation as Record<string, unknown>).expectInvalid;
    if (expected === undefined && invalid !== true) {
      fail('verse-ref needs expectedReference or expectInvalid:true');
    }
  }
  if (kind === 'base-query-oracle') {
    const base = (expectation as Record<string, unknown>).baseQueryId;
    if (typeof base !== 'string' || base.length === 0) fail('base-query-oracle without baseQueryId');
  }
  if (kind === 'correction-cited') {
    const misspelled = (expectation as Record<string, unknown>).misspelled;
    if (!Array.isArray(misspelled) || misspelled.length === 0) {
      fail('correction-cited without misspelled[]');
    }
  }
  return line as unknown as UniverseLine;
}

/** Parse a universe JSONL body: schema-valid, sorted by queryId, unique. */
export function parseUniverse(body: string): UniverseLine[] {
  const lines = body.split('\n').filter((line) => line.length > 0);
  const parsed = lines.map((line, index) => validateUniverseLine(JSON.parse(line), index + 1));
  for (let i = 1; i < parsed.length; i += 1) {
    const previous = parsed[i - 1];
    const current = parsed[i];
    if (previous !== undefined && current !== undefined && !(previous.queryId < current.queryId)) {
      throw new UniverseSchemaError(
        `universe not sorted/unique at line ${i + 1}: ${previous.queryId} !< ${current.queryId}`,
      );
    }
  }
  return parsed;
}
