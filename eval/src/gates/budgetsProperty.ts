/**
 * G6, property half: the signal-budget caps hold for ARBITRARY evidence.
 *
 * Until this module existed G6 was a hardcoded pass — "enforced structurally
 * inside the scoring core" — which is precisely the gate-becomes-decoration
 * failure the working agreements forbid. The caps it vouches for are the ones
 * that keep a large mediocre dataset from shouting down an exact match, so
 * when they are ever retuned an unverified G6 would let a regression ship.
 *
 * This half needs no artifact, ontology, or corpus: it interrogates the
 * engine's pure functions directly, so it ALWAYS runs — G6 has no
 * not-applicable branch of its own. The companion `reviewedConstantsCheck`
 * covers the other half of the G6 contract (the constants in
 * `ranking/budgets.ts` matching a reviewed mirror in `eval/budgets.json`);
 * until the ranking-fixes work lands that mirror, it reports not-applicable
 * with its reason rather than a fake pass.
 *
 * Determinism: seed and run count are fixed, committed, and stated in the
 * gate summary — a property run that cannot be reproduced, or whose run count
 * is invisible, is half-decorative. The engine-side twin of this suite lives
 * in `engine/test/properties.test.ts`.
 */

import fc from 'fast-check';

import {
  applyBudgets as engineApplyBudgets,
  CHIP_DISPLAY_MIN_POINTS,
  DEFAULT_BUDGETS,
  EXACT_PHRASE_FULL_AUTHORITY_WORDS,
  isAuthoritative,
  PASSAGE_TERM_CHIP_DISPLAY_FLOOR,
  normalizeToken as engineNormalizeToken,
  PASSAGE_TERM_PMI_HALF_SATURATION,
  rank as engineRank,
  significantWords as engineSignificantWords,
  tokenStream as engineTokenStream,
  type BudgetedScore,
  type Candidate,
  type Evidence,
  type RankedResult,
  type RankOptions,
  type SignalBudgets,
  type SignalFamily,
} from '@jestek-dev/scripture-engine/internal';

import { fail, pass, notApplicable, type GateFinding, type GateResult } from './types.js';

export const G6_PROPERTY_SEED = 20260820;
export const G6_PROPERTY_NUM_RUNS = 150;

/** Float tolerance for scaled points: correlation-group and weak-aggregate
 * scaling divide by an order-summed total, so permutations of the same
 * evidence may differ in the last ulp; anything beyond this is real. */
const POINTS_TOLERANCE = 1e-7;

/**
 * The functions under test, injectable so the gate's own alarm can be proven
 * to ring (eval tests and the mutation harness pass broken subjects). The
 * gauntlet always calls with no overrides — the real engine.
 */
export interface BudgetsPropertySubjects {
  readonly budgets: SignalBudgets;
  readonly applyBudgets: (evidence: readonly Evidence[]) => BudgetedScore;
  readonly rank: (
    candidates: readonly Candidate[],
    options?: RankOptions,
  ) => readonly RankedResult[];
  readonly normalizeToken: (raw: string) => string | null;
  readonly significantWords: (text: string) => readonly string[];
  readonly tokenStream: (text: string) => readonly { token: string; position: number }[];
}

const REAL_ENGINE: BudgetsPropertySubjects = {
  budgets: DEFAULT_BUDGETS,
  applyBudgets: (evidence) => engineApplyBudgets(evidence),
  rank: engineRank,
  normalizeToken: engineNormalizeToken,
  significantWords: engineSignificantWords,
  tokenStream: engineTokenStream,
};

/** Committed sample across the stopword list's categories; none may ever
 * survive into tokenizer output. */
const SAMPLE_STOPWORDS: readonly string[] = [
  'the', 'and', 'of', 'to', 'a', 'is', 'that', 'it',
  'thou', 'thee', 'thy', 'hath', 'unto', 'shall', 'wherefore',
];

function permutationOf<T>(items: readonly T[]): fc.Arbitrary<readonly T[]> {
  return items.length === 0
    ? fc.constant([] as readonly T[])
    : fc.shuffledSubarray(items as T[], { minLength: items.length, maxLength: items.length });
}

/** The slice of fast-check's RunDetails the gate consumes (RunDetails itself
 * is invariant in its type parameter, so the full type cannot be shared
 * across differently-shaped properties). */
interface PropertyRunDetails {
  readonly failed: boolean;
  readonly counterexample: unknown;
  readonly errorInstance: unknown;
}

interface NamedProperty {
  readonly name: string;
  /** Runs the property at the committed seed/numRuns and reports the details. */
  readonly check: () => PropertyRunDetails;
}

const RUN_PARAMETERS = { seed: G6_PROPERTY_SEED, numRuns: G6_PROPERTY_NUM_RUNS } as const;

function buildProperties(subjects: BudgetsPropertySubjects): readonly NamedProperty[] {
  const families = Object.keys(subjects.budgets.families).sort() as SignalFamily[];

  // Dyadic-grid strengths make permutation comparisons float-noise-free;
  // free doubles (including out-of-range values the clamp must absorb)
  // exercise the caps themselves.
  const gridStrengthArb = fc.constantFrom(0, 0.25, 0.5, 0.75, 1);
  const freeStrengthArb = fc.oneof(
    fc.constantFrom(0, 0.5, 1),
    fc.double({ min: -0.25, max: 1.25, noNaN: true }),
  );
  const labelArb = fc.constantFrom('alpha', 'beta', 'shared', 'gamma');
  const provenanceArb = fc.option(
    fc.record({
      sourceId: fc.constantFrom('src-a', 'src-b'),
      label: fc.constant('Source'),
      locator: fc.constantFrom('loc-1', 'loc-2'),
    }),
    { nil: undefined },
  );
  const evidenceArb = (strengthArb: fc.Arbitrary<number>): fc.Arbitrary<Evidence> =>
    fc
      .record({
        family: fc.constantFrom(...families),
        label: labelArb,
        strength: strengthArb,
        provenance: provenanceArb,
      })
      .map(({ provenance, ...rest }) => (provenance ? { ...rest, provenance } : rest));
  const gridEvidenceListArb = fc.array(evidenceArb(gridStrengthArb), { maxLength: 12 });
  const freeEvidenceListArb = fc.array(evidenceArb(freeStrengthArb), { maxLength: 12 });

  // Identical evidence lists shared across candidates force score ties —
  // exactly where a broken comparator would fall back to input order.
  const tiedEvidencePool: readonly (readonly Evidence[])[] = [
    [{ family: 'token_overlap', label: 'alpha', strength: 1 }],
    [{ family: 'exact_phrase', label: 'alpha', strength: 1 }],
    [
      { family: 'concept_lexicon', label: 'alpha', strength: 0.5 },
      { family: 'proximity', label: 'beta', strength: 0.5 },
    ],
  ];
  const candidatesArb: fc.Arbitrary<readonly Candidate[]> = fc
    .array(
      fc.record({
        groupId: fc.constantFrom('g1', 'g2', 'g3'),
        evidence: fc.oneof(
          fc.constantFrom(...tiedEvidencePool),
          fc.array(evidenceArb(gridStrengthArb), { maxLength: 6 }),
        ),
      }),
      { maxLength: 15 },
    )
    .map((specs) =>
      specs.map((spec, index) => ({
        targetId: `t${String(index).padStart(2, '0')}`,
        groupId: spec.groupId,
        evidence: spec.evidence,
      })),
    );
  const rankOptionsArb: fc.Arbitrary<RankOptions> = fc.constantFrom(
    {},
    { limit: 5 },
    { limit: 10, maxPerGroup: 1 },
  );

  // Vowel-free words are provably absent from the tokenizer's stopword,
  // archaic, and lemma tables (every entry there contains a vowel or y), so
  // they exercise the bare stemmer with no table interference.
  const consonantWordArb = fc
    .array(fc.constantFrom('b', 'c', 'd', 'f', 'g', 'h', 'k', 'l', 'm', 'p', 'r', 't'), {
      minLength: 1,
      maxLength: 8,
    })
    .map((letters) => letters.join(''));
  const textArb = fc
    .array(
      fc.oneof(
        consonantWordArb,
        fc.constantFrom(...SAMPLE_STOPWORDS),
        fc.constantFrom('love', 'mercy', 'covenant', 'blessings', 'doeth', 'hearing', 'doers'),
        fc.string({ maxLength: 6 }),
      ),
      { maxLength: 20 },
    )
    .map((words) => words.join(' '));

  const expectSameBudgeted = (actual: BudgetedScore, expected: BudgetedScore): void => {
    if (actual.capped !== expected.capped) throw new Error('capped flag differs across permutations');
    const identity = (score: BudgetedScore) =>
      JSON.stringify(
        score.reasons.map((r) => [r.family, r.label, r.provenance?.sourceId ?? '']),
      );
    if (identity(actual) !== identity(expected)) {
      throw new Error(`reason ordering differs across permutations: ${identity(actual)} vs ${identity(expected)}`);
    }
    actual.reasons.forEach((reason, index) => {
      const other = expected.reasons[index]!;
      if (Math.abs(reason.points - other.points) > POINTS_TOLERANCE) {
        throw new Error(`points differ across permutations: ${reason.points} vs ${other.points}`);
      }
      if ((reason.uncappedPoints === undefined) !== (other.uncappedPoints === undefined)) {
        throw new Error('uncappedPoints presence differs across permutations');
      }
    });
    if (Math.abs(actual.score - expected.score) > POINTS_TOLERANCE) {
      throw new Error(`score differs across permutations: ${actual.score} vs ${expected.score}`);
    }
  };

  return [
    {
      name: 'applyBudgets-permutation-invariance',
      check: () => fc.check(fc.property(
        gridEvidenceListArb.chain((items) => fc.tuple(fc.constant(items), permutationOf(items))),
        ([original, shuffled]) => {
          expectSameBudgeted(subjects.applyBudgets(shuffled), subjects.applyBudgets(original));
        },
      ), RUN_PARAMETERS),
    },
    {
      name: 'rank-permutation-invariance',
      check: () => fc.check(fc.property(
        candidatesArb.chain((cands) => fc.tuple(fc.constant(cands), permutationOf(cands))),
        rankOptionsArb,
        ([original, shuffled], options) => {
          // Each candidate's evidence list travels intact, so outputs must be
          // exactly identical — bit-identical scores included.
          const a = JSON.stringify(subjects.rank(shuffled, options));
          const b = JSON.stringify(subjects.rank(original, options));
          if (a !== b) throw new Error('candidate input order changed rank output');
        },
      ), RUN_PARAMETERS),
    },
    {
      name: 'per-family-reason-count-cap',
      check: () => fc.check(fc.property(freeEvidenceListArb, (evidence) => {
        const counts = new Map<SignalFamily, number>();
        for (const reason of subjects.applyBudgets(evidence).reasons) {
          counts.set(reason.family, (counts.get(reason.family) ?? 0) + 1);
        }
        for (const [family, count] of counts) {
          const max = subjects.budgets.families[family].maxReasons;
          if (count > max) throw new Error(`${family} kept ${count} reasons, maxReasons ${max}`);
        }
      }), RUN_PARAMETERS),
    },
    {
      name: 'per-family-point-cap',
      check: () => fc.check(fc.property(freeEvidenceListArb, (evidence) => {
        for (const reason of subjects.applyBudgets(evidence).reasons) {
          const max = subjects.budgets.families[reason.family].maxPoints;
          if (reason.points > max + 1e-9 || reason.points < 0) {
            throw new Error(`${reason.family} awarded ${reason.points}, maxPoints ${max}`);
          }
        }
      }), RUN_PARAMETERS),
    },
    {
      name: 'weak-aggregate-cap',
      check: () => fc.check(fc.property(freeEvidenceListArb, (evidence) => {
        const weakTotal = subjects
          .applyBudgets(evidence)
          .reasons.filter((reason) => !isAuthoritative(reason.family))
          .reduce((sum, reason) => sum + reason.points, 0);
        if (weakTotal > subjects.budgets.weakAggregateCap + 1e-9) {
          throw new Error(
            `weak families sum to ${weakTotal}, weakAggregateCap ${subjects.budgets.weakAggregateCap}`,
          );
        }
      }), RUN_PARAMETERS),
    },
    {
      name: 'capped-flag-truthful',
      check: () => fc.check(fc.property(freeEvidenceListArb, (evidence) => {
        const { reasons, capped } = subjects.applyBudgets(evidence);
        const dropped = reasons.length < evidence.length;
        const scaled = reasons.some((reason) => reason.uncappedPoints !== undefined);
        if (capped !== (dropped || scaled)) {
          throw new Error(
            `capped=${capped} but dropped=${dropped}, scaled=${scaled} — the flag misstates what happened`,
          );
        }
      }), RUN_PARAMETERS),
    },
    {
      name: 'tokenizer-output-hygiene',
      check: () => fc.check(fc.property(textArb, (text) => {
        const tokens = subjects.significantWords(text);
        if (new Set(tokens).size !== tokens.length) throw new Error('duplicate tokens emitted');
        for (const token of tokens) {
          if (!/^[\p{L}\p{N}]+$/u.test(token) || token.length < 2) {
            throw new Error(`malformed token ${JSON.stringify(token)}`);
          }
          if (SAMPLE_STOPWORDS.includes(token)) throw new Error(`stopword '${token}' emitted`);
        }
        if (JSON.stringify(subjects.significantWords(text)) !== JSON.stringify(tokens)) {
          throw new Error('tokenizer is not pure: repeated calls disagree');
        }
        const streamTokens = [...new Set(subjects.tokenStream(text).map((entry) => entry.token))];
        if (JSON.stringify(streamTokens) !== JSON.stringify(tokens)) {
          throw new Error('significantWords is not the deduplicated tokenStream');
        }
      }), RUN_PARAMETERS),
    },
    {
      name: 'tokenizer-stem-floor',
      check: () => fc.check(fc.property(consonantWordArb, fc.constantFrom('s', 'ing'), (base, suffix) => {
        const word = base + suffix;
        const token = subjects.normalizeToken(word);
        const expected = base.length >= 4 ? base : word.length >= 3 ? word : null;
        if (token !== expected) {
          throw new Error(
            `normalizeToken(${JSON.stringify(word)}) = ${JSON.stringify(token)}, expected ${JSON.stringify(expected)}`,
          );
        }
      }), RUN_PARAMETERS),
    },
  ];
}

/**
 * The one constants relation the property runs cannot reach by fuzzing: the
 * evidence hierarchy itself. Every weak signal firing at once must still lose
 * to one verbatim match, which is exactly `weakAggregateCap <
 * exact_phrase.maxPoints`. The full reviewed-constants mirror is Phase 3
 * work; this invariant is checkable today.
 */
function hierarchyInvariantFinding(budgets: SignalBudgets): GateFinding | null {
  const exactPhrase = budgets.families.exact_phrase.maxPoints;
  if (budgets.weakAggregateCap < exactPhrase) return null;
  return {
    message: `weakAggregateCap ${budgets.weakAggregateCap} is not below exact_phrase.maxPoints ${exactPhrase}: accumulated weak evidence could equal a verbatim match`,
    subjects: ['weak-cap-below-exact-phrase'],
    categoryCode: 'hierarchy-inverted',
    metrics: { weakAggregateCap: budgets.weakAggregateCap, exactPhraseMaxPoints: exactPhrase },
  };
}

/**
 * G6 reviewed-constants half: the engine's reviewed ranking constants must
 * equal their mirror in `eval/budgets.json` (`signalBudgets`), so a constant
 * cannot be retuned in code without the reviewed-data change travelling in
 * the same commit. The mirror was built INCREMENTALLY by the 0.10.0 stages —
 * each stage added the constant it introduced — and is complete as of the
 * 0.10.0 squash; this check verifies the relation in BOTH directions: every
 * key the mirror carries must equal the engine value and be one the engine
 * exports (a stale mirror is worse than none: it reads as protection), and
 * every registered engine constant must be present in the mirror (otherwise
 * deleting a key from budgets.json — or landing a stage constant code-only —
 * would silently shrink the reviewed surface while the gate stayed green).
 * With no mirror block at all this half honestly cannot run — and per gate
 * discipline it says so instead of passing.
 *
 * The gauntlet passes the parsed `signalBudgets` block; the gate module does
 * no I/O of its own.
 */
export function reviewedConstantsCheck(signalBudgets?: unknown): GateResult {
  if (signalBudgets === undefined || signalBudgets === null) {
    return notApplicable(
      'G6-signal-budgets',
      'Signal budgets',
      'signalBudgets reviewed-constants mirror absent from budgets.json (0.10.0 stages add it incrementally)',
    );
  }

  const findings: GateFinding[] = [];
  const mirror = signalBudgets as Record<string, unknown>;
  // Engine-exported reviewed constants the mirror may carry. Later 0.10.0
  // stages extend this registry together with the mirror they add.
  const engineValues: Record<string, unknown> = {
    soleEvidenceMaxPoints: DEFAULT_BUDGETS.soleEvidenceMaxPoints,
    exactPhraseFullAuthorityWords: EXACT_PHRASE_FULL_AUTHORITY_WORDS,
    passageTermPmiHalfSaturation: PASSAGE_TERM_PMI_HALF_SATURATION,
    chipDisplayMinPoints: CHIP_DISPLAY_MIN_POINTS,
    passageTermChipDisplayFloor: PASSAGE_TERM_CHIP_DISPLAY_FLOOR,
  };

  const mirroredKeys = Object.keys(mirror)
    .filter((key) => !key.startsWith('$comment'))
    .sort();
  if (mirroredKeys.length === 0) {
    findings.push({
      message:
        'signalBudgets block present but mirrors no constants — an empty mirror reads as protection while providing none',
      subjects: ['signalBudgets'],
      categoryCode: 'empty-mirror',
    });
  }
  for (const key of mirroredKeys) {
    if (!(key in engineValues)) {
      findings.push({
        message: `signalBudgets mirrors '${key}', which the engine does not export — stale mirror`,
        subjects: [key],
        categoryCode: 'unknown-constant',
      });
      continue;
    }
    const expected = canonicalConstant(engineValues[key]);
    const actual = canonicalConstant(mirror[key]);
    if (expected !== actual) {
      findings.push({
        message: `signalBudgets.${key} mirror ${actual} does not equal engine value ${expected}`,
        subjects: [key],
        categoryCode: 'mirror-mismatch',
        params: { expected, actual },
      });
    }
  }
  // Reverse completeness (registry ⊆ mirror): a registered engine constant
  // with no mirror key means the reviewed-data record was deleted or never
  // written — previously a silent mutation, since the loop above only walks
  // the keys the mirror happens to carry.
  for (const key of Object.keys(engineValues).sort()) {
    if (key in mirror) continue;
    findings.push({
      message: `engine constant '${key}' is registered for review but absent from the signalBudgets mirror — the reviewed-data record must travel with the code`,
      subjects: [key],
      categoryCode: 'unmirrored-constant',
    });
  }

  if (findings.length > 0) {
    return fail(
      'G6-signal-budgets',
      'Signal budgets',
      `reviewed-constants mirror disagrees with the engine on ${findings.length} entr${findings.length === 1 ? 'y' : 'ies'}`,
      findings,
    );
  }
  return pass(
    'G6-signal-budgets',
    'Signal budgets',
    `reviewed-constants mirror matches the engine: ${mirroredKeys.join(', ')}`,
    { mirroredConstants: mirroredKeys.length },
  );
}

/** Key-sorted JSON so object mirrors compare by value, not key order. */
function canonicalConstant(value: unknown): string {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalConstant(record[key])}`)
    .join(',')}}`;
}

export function budgetsPropertyGate(
  overrides: Partial<BudgetsPropertySubjects> = {},
): GateResult {
  const subjects: BudgetsPropertySubjects = { ...REAL_ENGINE, ...overrides };
  const properties = buildProperties(subjects);

  const findings: GateFinding[] = [];
  for (const { name, check } of properties) {
    const outcome = check();
    if (!outcome.failed) continue;
    const detail =
      outcome.errorInstance instanceof Error
        ? outcome.errorInstance.message
        : String(outcome.errorInstance ?? 'property falsified');
    findings.push({
      message: `property '${name}' falsified: ${detail}`.slice(0, 500),
      subjects: [name],
      categoryCode: 'property-falsified',
      params: {
        seed: G6_PROPERTY_SEED,
        numRuns: G6_PROPERTY_NUM_RUNS,
        counterexample: JSON.stringify(outcome.counterexample).slice(0, 400),
      },
    });
  }

  const hierarchy = hierarchyInvariantFinding(subjects.budgets);
  if (hierarchy) findings.push(hierarchy);

  const metrics = {
    propertySeed: G6_PROPERTY_SEED,
    propertyRuns: G6_PROPERTY_NUM_RUNS,
    propertiesTotal: properties.length,
    propertiesFalsified: findings.filter((f) => f.categoryCode === 'property-falsified').length,
  };

  if (findings.length > 0) {
    return fail(
      'G6-signal-budgets',
      'Signal budgets',
      `${metrics.propertiesFalsified}/${properties.length} properties falsified (seed ${G6_PROPERTY_SEED}, ${G6_PROPERTY_NUM_RUNS} runs each)${hierarchy ? '; evidence hierarchy inverted' : ''}`,
      findings,
      metrics,
    );
  }
  return pass(
    'G6-signal-budgets',
    'Signal budgets',
    `caps + ordering + tokenizer proven on arbitrary inputs: ${properties.length} properties x ${G6_PROPERTY_NUM_RUNS} runs, seed ${G6_PROPERTY_SEED}; weak cap stays below one exact phrase`,
    metrics,
  );
}
