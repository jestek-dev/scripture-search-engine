/** Supported build-time boundary for workbench telemetry audits. */
export {
  analyzeTelemetryAudit,
  parseMasterRecord,
  serializeMasterRecord,
  telemetryAuditDigest,
  TelemetryAuditValidationError,
  validateSelectedDistillates,
} from './audit.js';

export type {
  SelectedDistillateBytes,
  TelemetryAuditAnalysis,
  TelemetryAuditSummary,
  TelemetryCandidateCase,
  ValidatedDistillateFile,
} from './audit.js';
export type { SensitiveCategories } from './categories.js';
export type { MasterRecord } from './mine.js';
export type { Distillate, TelemetryBudgets } from './types.js';
