/**
 * Gate vocabulary shared by every gate in the gauntlet.
 *
 * A gate never throws to signal a data problem — it returns findings. The
 * gauntlet aggregates them into one Admission Report so a PR author sees
 * every problem in a single run rather than fixing them one CI round at a
 * time.
 */

export type GateId =
  | 'G1-provenance'
  /** Companion to G1: are the pinned source URLs still retrievable? */
  | 'G1b-reachability'
  | 'G2-determinism'
  | 'G3-golden'
  | 'G4-collision'
  | 'G5-distinctiveness'
  | 'G6-signal-budgets'
  | 'G7-correlation'
  | 'G8-noise-probes'
  | 'G9-saturation'
  | 'G10-size'
  | 'G11-latency'
  | 'G12-battery';

export type GateStatus =
  /** Ran and passed. */
  | 'pass'
  /** Ran and failed — blocks admission. */
  | 'fail'
  /** Ran, passed, but found something a human should read. */
  | 'warn'
  /**
   * Could not run because its inputs do not exist yet (e.g. no artifact
   * before Phase 2). Reported explicitly and never silently counted as a
   * pass — a gate that is not running must look different from a gate that
   * is running and finding nothing.
   */
  | 'not-applicable';

/**
 * Whether an unavailable gate prevents an exact admission. Optional advisory
 * gates are visible evidence, but their absence cannot turn a healthy run
 * into a false failure because they do not grade repository content.
 */
export type GateApplicability = 'required' | 'optional-advisory';

/**
 * What kind of run a gate result is being produced for. The battery gate is
 * the reason this exists: it measures the release/candidate artifact, so on
 * an explicit-target run an unrun battery must REJECT, while on the fixture
 * corpus it can only be visible advisory evidence.
 */
export interface GateRunContext {
  readonly explicitTarget: boolean;
}

/**
 * The conservative default. A caller that loses its context produces an
 * advisory row — still visible, never wrongly green as a satisfied required
 * gate — instead of silently upgrading itself to enforcement it cannot back.
 */
export const DEFAULT_GATE_RUN_CONTEXT: GateRunContext = { explicitTarget: false };

/** The opt-in network check is always advisory; the battery is required only where it can actually run (an explicit artifact target); every other gate is required. */
export function gateApplicability(
  gate: GateId,
  context: GateRunContext = DEFAULT_GATE_RUN_CONTEXT,
): GateApplicability {
  if (gate === 'G1b-reachability') return 'optional-advisory';
  if (gate === 'G12-battery') return context.explicitTarget ? 'required' : 'optional-advisory';
  return 'required';
}

export interface GateFinding {
  /** One line, specific enough to act on without opening the dataset. */
  readonly message: string;
  /** Rows, concept ids, or probe names implicated. */
  readonly subjects?: readonly string[];
  /** A stable semantic category. Omit only for legacy callers; the report supplies a gate-scoped fallback. */
  readonly categoryCode?: string;
  /** Structured, additive context for automation. */
  readonly params?: Readonly<Record<string, string | number | boolean | readonly string[]>>;
  /** Numeric context for trend and threshold consumers. */
  readonly metrics?: Readonly<Record<string, number>>;
}

export interface GateResult {
  readonly gate: GateId;
  readonly title: string;
  readonly status: GateStatus;
  readonly applicability: GateApplicability;
  /** One-line summary shown even when the gate passes. */
  readonly summary: string;
  readonly findings?: readonly GateFinding[];
  /** Numbers worth trending across builds (counts, ratios, bytes, ms). */
  readonly metrics?: Readonly<Record<string, number>>;
  /** Pending fixture ids proven passing by this exact gate run. */
  readonly promotionCandidates?: readonly string[];
}

export function pass(
  gate: GateId,
  title: string,
  summary: string,
  metrics?: Readonly<Record<string, number>>,
  context?: GateRunContext,
): GateResult {
  return {
    gate,
    title,
    status: 'pass',
    applicability: gateApplicability(gate, context),
    summary,
    ...(metrics ? { metrics } : {}),
  };
}

export function fail(
  gate: GateId,
  title: string,
  summary: string,
  findings: readonly GateFinding[],
  metrics?: Readonly<Record<string, number>>,
  context?: GateRunContext,
): GateResult {
  return {
    gate,
    title,
    status: 'fail',
    applicability: gateApplicability(gate, context),
    summary,
    findings,
    ...(metrics ? { metrics } : {}),
  };
}

export function notApplicable(
  gate: GateId,
  title: string,
  reason: string,
  context?: GateRunContext,
): GateResult {
  return {
    gate,
    title,
    status: 'not-applicable',
    applicability: gateApplicability(gate, context),
    summary: reason,
  };
}

/**
 * Ran, found something, but does not block admission.
 *
 * Reserved for findings whose cause is outside the change under review — a
 * third-party host being down, say, or a pending fixture that specifies
 * UNLANDED engine work: its failing state is definitionally not this
 * change's fault, but hiding it would make the specification invisible.
 * Blocking on those trains people to override gates, which costs more than
 * the finding is worth.
 */
export function warn(
  gate: GateId,
  title: string,
  summary: string,
  findings: readonly GateFinding[],
  metrics?: Readonly<Record<string, number>>,
  context?: GateRunContext,
): GateResult {
  return {
    gate,
    title,
    status: 'warn',
    applicability: gateApplicability(gate, context),
    summary,
    findings,
    ...(metrics ? { metrics } : {}),
  };
}
