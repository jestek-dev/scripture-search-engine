/**
 * Layer-2 AI-assisted grading — schema and mechanical validation (MS-8).
 *
 * Covenant-legal: offline tooling whose output reaches the artifact only
 * as human-authored fixtures through the gauntlet and Jesse's merge. The
 * checks here are the MECHANICAL half of trust (schema, 100% queue
 * coverage, forced crisisReview, zero double-grading of Layer-1-resolved
 * rows, manifest hash pins, the no-downgrade rule); the MEASURED half is
 * MS-9's agreement gate — no grade is believed before it passes.
 */
import { readFileSync } from 'node:fs';

import { sha256Hex } from '../canonical.js';
import type { UniverseLine } from '../universe/types.js';

export const GRADE_VALUES = ['excellent', 'good', 'acceptable', 'poor', 'harmful'] as const;
export type GradeValue = (typeof GRADE_VALUES)[number];

export interface Layer2Grade {
  readonly queryId: string;
  readonly grade: GradeValue;
  readonly perResult: readonly { readonly rank: number; readonly relevance: 0 | 1 | 2 | 3 }[];
  readonly defectClass?: string;
  readonly explanationFaithful: boolean;
  /** Mandatory escalation: doctrine, pastoral ordering, §4 non-criteria, watchlist proximity. */
  readonly escalate: boolean;
  readonly escalateReason?: string;
  /** Script-FORCED from the row's crisisAdjacent tag — schema-distinct from escalate. */
  readonly crisisReview: boolean;
  readonly rationale: string;
  /**
   * Present only when a human changed the grade. A downgrade of
   * harmful/escalate is valid ONLY with overriddenBy 'jesse' (J64's
   * standing rule).
   */
  readonly override?: {
    readonly grade: GradeValue;
    readonly overriddenBy: string;
    readonly at: string;
  };
}

export interface GradingManifest {
  readonly schema: string;
  readonly modelId: string;
  readonly rubricSha256: string;
  readonly gradedAt: string;
  readonly queueSha256: string;
  readonly gradesSha256: string;
  readonly counts: { readonly queue: number; readonly graded: number };
}

export const GRADING_MANIFEST_SCHEMA = 'scripture-search-engine/sweep-grading-manifest/v1';

export interface GradeFinding {
  readonly level: 'fail';
  readonly message: string;
}

export function validateGrades(options: {
  readonly gradesPath: string;
  readonly manifestPath: string;
  readonly rubricPath: string;
  /** needs-ai-grade.jsonl: {queryId, line} rows from grade-l1. */
  readonly queuePath: string;
}): GradeFinding[] {
  const findings: GradeFinding[] = [];
  const manifest = JSON.parse(readFileSync(options.manifestPath, 'utf8')) as GradingManifest;

  const gradesBody = readFileSync(options.gradesPath, 'utf8');
  if (sha256Hex(gradesBody) !== manifest.gradesSha256) {
    findings.push({ level: 'fail', message: 'grades file does not match manifest gradesSha256' });
  }
  if (sha256Hex(readFileSync(options.rubricPath, 'utf8')) !== manifest.rubricSha256) {
    findings.push({ level: 'fail', message: 'committed rubric does not match manifest rubricSha256 — grades from an unknown rubric are meaningless' });
  }
  const queueBody = readFileSync(options.queuePath, 'utf8');
  if (sha256Hex(queueBody) !== manifest.queueSha256) {
    findings.push({ level: 'fail', message: 'queue file does not match manifest queueSha256' });
  }

  const queue = new Map<string, UniverseLine | undefined>(
    queueBody
      .split('\n')
      .filter((line) => line.length > 0)
      .map((line) => {
        const parsed = JSON.parse(line) as { queryId: string; line?: UniverseLine };
        return [parsed.queryId, parsed.line];
      }),
  );

  const graded = new Set<string>();
  const grades = gradesBody
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as Layer2Grade);

  for (const [index, grade] of grades.entries()) {
    const at = `grade line ${index + 1} (${grade.queryId})`;
    if (!GRADE_VALUES.includes(grade.grade)) {
      findings.push({ level: 'fail', message: `${at}: unknown grade "${grade.grade}"` });
    }
    if (typeof grade.escalate !== 'boolean' || typeof grade.crisisReview !== 'boolean') {
      findings.push({
        level: 'fail',
        message: `${at}: escalate and crisisReview must BOTH be present booleans — they are schema-distinct by design`,
      });
    }
    if (grade.escalate === true && (grade.escalateReason ?? '').length === 0) {
      findings.push({ level: 'fail', message: `${at}: escalate without escalateReason` });
    }
    if (typeof grade.rationale !== 'string' || grade.rationale.length === 0) {
      findings.push({ level: 'fail', message: `${at}: missing rationale` });
    }
    if (!queue.has(grade.queryId)) {
      // Zero double-grading of Layer-1-resolved rows.
      findings.push({
        level: 'fail',
        message: `${at}: not in the needs-ai-grade queue — Layer-1-resolved rows are never AI-graded`,
      });
    } else {
      if (graded.has(grade.queryId)) {
        findings.push({ level: 'fail', message: `${at}: graded twice` });
      }
      graded.add(grade.queryId);
      const line = queue.get(grade.queryId);
      if (line?.crisisAdjacent === true && grade.crisisReview !== true) {
        findings.push({
          level: 'fail',
          message: `${at}: crisisAdjacent row without forced crisisReview — the script forces this regardless of model output`,
        });
      }
    }
    // The J64 standing rule: no downgrade of harmful/escalate except Jesse.
    if (grade.override !== undefined) {
      const wasProtected = grade.grade === 'harmful' || grade.escalate === true;
      const softens = grade.override.grade !== 'harmful';
      if (wasProtected && softens && grade.override.overriddenBy !== 'jesse') {
        findings.push({
          level: 'fail',
          message: `${at}: harmful/escalate downgraded by "${grade.override.overriddenBy}" — only Jesse personally may downgrade (J64)`,
        });
      }
    }
  }

  // 100% queue coverage.
  for (const queryId of queue.keys()) {
    if (!graded.has(queryId)) {
      findings.push({ level: 'fail', message: `queue row ${queryId} has no grade — ungraded is unacceptable` });
    }
  }
  if (manifest.counts.queue !== queue.size || manifest.counts.graded !== graded.size) {
    findings.push({ level: 'fail', message: 'manifest counts do not match queue/grades' });
  }

  return findings;
}
