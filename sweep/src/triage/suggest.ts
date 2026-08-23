/**
 * Triage suggestion tool (MS-11) — SUGGESTS, never finalizes.
 *
 * Implements the sweep/TRIAGE-RULES.md boundary (PENDING J66) mechanically:
 * confident-fix requires ALL its clauses; needs-jesse fires on ANY of its
 * clauses; anything unrecognized is doubt, and any doubt ⇒ needs-jesse.
 * A human confirms EVERY record via confirmTriage — the suggester has no
 * write path into the record at all.
 */
import type { DefectRecord, DefectTriage, TriageDecision } from '../defect/schema.js';

/**
 * Approval state for the two "under an ALREADY-Jesse-approved rule" clauses.
 * The caller records these from Jesse's standing decisions; the tooling
 * never flips them itself. Both false until his rulings say otherwise.
 */
export interface ApprovedRules {
  readonly soleWeakDemotionRule: boolean;
  readonly pmiTieBreakApproved: boolean;
}

export interface TriageSuggestion {
  readonly suggestion: TriageDecision;
  /** The TRIAGE-RULES clause the suggestion cites — every decision is
   *  traceable to a rule clause or a verdict (MS-11 DoD). */
  readonly clause: string;
  readonly rationale: string;
}

const CONFIDENT_CAUSES: ReadonlyMap<string, string> = new Map([
  ['reference-grammar', 'CF: mis-parse / typed-kind violation vs the written contract'],
  ['spelling-correction', 'CF: silent correction vs the citation contract'],
  ['display-pipeline', 'CF: chip misstating evidence'],
  ['stale-label', 'CF: chip misstating evidence'],
  ['anchor-attribution', 'CF: chip misstating evidence (right rank, wrong reason — covenant #5)'],
  ['duplicate-anchor', 'CF: mechanical dedup'],
  ['data-typo', "CF: data typo per the pack's own comment"],
]);

export function suggestTriage(record: DefectRecord, approved: ApprovedRules): TriageSuggestion {
  // needs-jesse: ANY suffices. Checked first — these clauses outrank
  // everything, including an otherwise-mechanical cause.
  if (record.crisisAdjacent) {
    return {
      suggestion: 'needs-jesse',
      clause: 'NJ: anything crisisAdjacent',
      rationale: 'crisis-adjacent rows are never triaged by tooling',
    };
  }
  if (record.severity === 'theologically-harmful') {
    return {
      suggestion: 'needs-jesse',
      clause: 'NJ: doctrinal/watchlist-near',
      rationale: 'theologically-harmful is never a confident fix',
    };
  }
  if (record.suspectedCause === 'negative-context-surfacing') {
    return {
      suggestion: 'needs-jesse',
      clause: 'NJ: watchlist-near',
      rationale: 'watchlist proximity — the tooling flags, Jesse rules',
    };
  }
  if (record.suspectedCause === 'coverage-gap') {
    return {
      suggestion: 'needs-jesse',
      clause: 'NJ: any new concept/anchor/weight/lexicon entry',
      rationale: 'closing a coverage gap means new curated data — his call',
    };
  }
  if (record.suspectedCause === 'ranking-or-coverage') {
    return {
      suggestion: 'needs-jesse',
      clause: 'NJ: which verse best answers a query / pastoral ordering',
      rationale: 'curated-anchor disagreement is a which-verse question',
    };
  }
  if (record.suspectedCause === 'engine-scoring') {
    if (record.defectClass === 'wrong-verse') {
      return approved.soleWeakDemotionRule
        ? {
            suggestion: 'confident-fix',
            clause: 'CF: sole-weak junk #1 under an ALREADY-Jesse-approved rule',
            rationale: 'demotion rule is Jesse-approved; the fix applies his decision',
          }
        : {
            suggestion: 'needs-jesse',
            clause: 'NJ: correctives (sole-weak demotion rule not yet Jesse-approved)',
            rationale: 'replacing a junk #1 chooses a corrective — his call until the rule lands',
          };
    }
    if (record.defectClass === 'poor-prioritization') {
      return approved.pmiTieBreakApproved
        ? {
            suggestion: 'confident-fix',
            clause: 'CF: flat tie resolved by the approved PMI mechanism',
            rationale: 'the PMI tie-break is Jesse-approved; applying it makes no new decision',
          }
        : {
            suggestion: 'needs-jesse',
            clause: 'NJ: any unapproved engine change (PMI tie-break not yet approved)',
            rationale: 'breaking the tie needs the mechanism approved first',
          };
    }
  }
  const confidentClause = CONFIDENT_CAUSES.get(record.suspectedCause);
  if (confidentClause !== undefined) {
    return {
      suggestion: 'confident-fix',
      clause: confidentClause,
      rationale:
        'objectively wrong against a written contract; human confirms the remaining ALL-clauses ' +
        '(fix mechanism ratified; no concept-teaching/sense-read/weight change)',
    };
  }
  return {
    suggestion: 'needs-jesse',
    clause: 'any doubt ⇒ needs-jesse',
    rationale: `unrecognized suspectedCause "${record.suspectedCause}" — doubt routes to Jesse`,
  };
}

/**
 * Human confirmation — the ONLY way a triage lands on a record. The tool
 * never finalizes: decidedBy must name a person, and a needs-jesse decision
 * moving toward fixed later requires a batchRef (checkTriageDiscipline).
 */
export function confirmTriage(
  record: DefectRecord,
  confirmation: {
    readonly decision: TriageDecision;
    readonly decidedBy: string;
    readonly at: string;
    readonly rationale?: string;
    readonly batchRef?: string;
  },
): DefectRecord {
  const decidedBy = confirmation.decidedBy.trim();
  if (decidedBy.length === 0 || /^(tool|tooling|suggest|auto|bot|ai)/i.test(decidedBy)) {
    throw new Error(
      `triage confirmation requires a human decidedBy — got "${confirmation.decidedBy}"; the tool suggests, a human confirms`,
    );
  }
  if (confirmation.decision === 'wontfix-with-rationale' && !confirmation.rationale) {
    throw new Error('wontfix-with-rationale requires a rationale');
  }
  const triage: DefectTriage = {
    decision: confirmation.decision,
    decidedBy,
    at: confirmation.at,
    ...(confirmation.rationale !== undefined ? { rationale: confirmation.rationale } : {}),
    ...(confirmation.batchRef !== undefined ? { batchRef: confirmation.batchRef } : {}),
  };
  return { ...record, triage, status: 'triaged' };
}

export interface TriageViolation {
  readonly id: string;
  readonly queryId: string;
  readonly problem: string;
}

/**
 * CI-grep-style discipline check (MS-11): no fixed-status defect with
 * triage needs-jesse may lack a batch-verdict reference, and nothing
 * reaches a fixed status untriaged.
 */
export function checkTriageDiscipline(records: readonly DefectRecord[]): TriageViolation[] {
  const violations: TriageViolation[] = [];
  const fixedStatuses = new Set(['fix-in-wave', 'fixed', 'verified-fixed']);
  for (const record of records) {
    if (!fixedStatuses.has(record.status)) continue;
    if (record.triage === undefined) {
      violations.push({
        id: record.id,
        queryId: record.queryId,
        problem: `status ${record.status} with no triage decision at all`,
      });
      continue;
    }
    if (record.triage.decision === 'needs-jesse' && !record.triage.batchRef) {
      violations.push({
        id: record.id,
        queryId: record.queryId,
        problem: `status ${record.status} on a needs-jesse defect with NO batch-verdict reference`,
      });
    }
  }
  return violations;
}
