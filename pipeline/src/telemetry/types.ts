/**
 * Telemetry types — the TypeScript face of the two JSON Schemas in
 * `pipeline/telemetry/`. The schemas are the cross-repo contract (consumer
 * shims validate against them); these types are what this repo's own code
 * compiles against. If the two ever disagree, the schema wins and the test
 * suite is where the disagreement surfaces.
 *
 * Everything here is build-time only. Nothing in this directory is imported
 * by the engine package — telemetry has no runtime existence, which is the
 * design's core safety property (docs/telemetry-and-gap-mining.md §2).
 */

export type TelemetryApp = 'maskil' | 'setlist' | 'versed';

export type TelemetryOutcome = 'converted' | 'abandoned' | 'empty' | 'reference';

/** On-device event. Never leaves the device; distilled before export. */
export interface TelemetryEvent {
  readonly v: 1;
  readonly app: TelemetryApp;
  /** Date only — a time of day is an identity clue in a congregation. */
  readonly date: string;
  /** Ephemeral, rotates per app launch, maps to nothing. Never exported. */
  readonly session: string;
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
  readonly query: string;
  readonly outcome: TelemetryOutcome;
  /** targetId of the USED result. Null unless converted. */
  readonly target?: string | null;
  /** 1-based displayed rank of the used result. Null unless converted. */
  readonly rank?: number | null;
}

export interface DistillateIdentity {
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
}

export interface DistillateConversion {
  readonly target: string;
  readonly rank: number;
  readonly count: number;
}

export interface DistillateQuery {
  readonly query: string;
  readonly identity: DistillateIdentity;
  readonly outcomes: { readonly empty: number; readonly abandoned: number; readonly converted: number };
  readonly conversions: readonly DistillateConversion[];
}

export interface DistillatePair {
  readonly from: string;
  readonly to: string;
  readonly count: number;
}

/** The only format that leaves a device. Structurally unable to express a history. */
export interface Distillate {
  readonly v: 1;
  readonly app: TelemetryApp;
  /** Audit period, e.g. "2026-Q3" — the finest time granularity that survives export. */
  readonly period: string;
  /** Random, regenerated every period. Counts installs without naming them. */
  readonly token: string;
  readonly queries: readonly DistillateQuery[];
  readonly pairs: readonly DistillatePair[];
}

/** Thresholds read from eval/budgets.json — reviewed data, not constants. */
export interface TelemetryBudgets {
  readonly minDistinctDevices: number;
  readonly rawRetentionDays: number;
  readonly weakConvertedRank: number;
}

export type GapVerdict = 'MISS' | 'RENAMED' | 'WEAK' | 'SATISFIED';

export interface GapCluster {
  readonly verdict: GapVerdict;
  /** Normalized token signature the cluster is keyed by. */
  readonly signature: string;
  /** Surface forms observed, most-attested first — the wording nuance. */
  readonly forms: readonly { readonly query: string; readonly devices: number; readonly events: number }[];
  readonly devices: number;
  readonly outcomes: { readonly empty: number; readonly abandoned: number; readonly converted: number };
  /** Converted targets with replay-verified ranks. */
  readonly conversions: readonly { readonly target: string; readonly reference: string; readonly rank: number; readonly count: number }[];
  /** Reformulation pair candidates arriving at this cluster's queries. */
  readonly pairs: readonly { readonly from: string; readonly to: string; readonly devices: number; readonly count: number }[];
}

export interface GapReport {
  readonly period: string;
  readonly apps: readonly TelemetryApp[];
  readonly devices: number;
  readonly clusters: readonly GapCluster[];
  /** Below-threshold and category-dropped rows, counted but never named. */
  readonly suppressed: { readonly belowThreshold: number; readonly sensitiveDropped: number };
  /** Rows whose logged rank disagreed with deterministic replay, or whose identity no provided artifact could replay. */
  readonly flagged: { readonly rankMismatch: number; readonly unreplayable: number };
  /** The headline metric: clusters with zero conversions / total clusters. */
  readonly zeroConversionRate: number;
}
