/**
 * G5 — distinctiveness floor, and G9 — saturation.
 *
 * These are the two gates that specifically answer "is this too much data?"
 * for the homiletical layer, and they answer it with arithmetic rather than
 * judgment.
 *
 * G5 verifies the floor actually held: no generic vocabulary slipped into a
 * profile, and no single pericope hoarded terms. Because the floor is applied
 * during distillation, this gate is a POST-CONDITION check — it catches a
 * threshold change or a pipeline bug that quietly stopped enforcing it.
 *
 * G9 turns diminishing returns into a number you can read. It reports how
 * much the profiles moved when the corpus doubled; a delta near zero means
 * the vein is mined out and more works of the same kind will buy nothing.
 */

import { fail, notApplicable, pass, type GateFinding, type GateResult } from './types.js';

export interface PassageTermRow {
  readonly verseId: number;
  readonly term: string;
  readonly pmi: number;
  readonly count: number;
  readonly sourceIds: string;
  readonly authorCount: number;
  readonly minSpanVerses: number;
  readonly locator: string;
}

export interface DistillateFile {
  readonly generatedFrom?: { readonly sourceId: string; readonly sha256: string };
  readonly stats?: {
    readonly sectionsParsed?: number;
    readonly sectionsRejected?: number;
    readonly termsConsidered?: number;
    readonly termsAdmitted?: number;
    readonly halfCorpusProfileDelta?: number;
  };
  readonly terms: readonly PassageTermRow[];
}

export function distinctivenessGate(
  distillate: DistillateFile | null,
  thresholds: { readonly minPmi: number; readonly maxTermsPerVerse: number },
): GateResult {
  if (!distillate || distillate.terms.length === 0) {
    return notApplicable(
      'G5-distinctiveness',
      'Distinctiveness floor',
      'no homiletical term profiles in this build',
    );
  }

  const findings: GateFinding[] = [];
  const below = distillate.terms.filter((term) => term.pmi < thresholds.minPmi);
  if (below.length > 0) {
    findings.push({
      message:
        `${below.length} term(s) are below the PMI floor of ${thresholds.minPmi} but were ` +
        'admitted anyway. The distillation step stopped enforcing G5.',
      subjects: below.slice(0, 5).map((term) => `${term.term} (pmi ${term.pmi})`),
    });
  }

  const perVerse = new Map<number, number>();
  for (const term of distillate.terms) {
    perVerse.set(term.verseId, (perVerse.get(term.verseId) ?? 0) + 1);
  }
  const overCap = [...perVerse.entries()].filter(
    ([, count]) => count > thresholds.maxTermsPerVerse,
  );
  if (overCap.length > 0) {
    findings.push({
      message:
        `${overCap.length} verse(s) exceed the ${thresholds.maxTermsPerVerse}-term cap. ` +
        'One verbose work can then dominate a verse profile.',
      subjects: overCap.slice(0, 5).map(([key, count]) => `${key}: ${count} terms`),
    });
  }

  if (findings.length > 0) {
    return fail('G5-distinctiveness', 'Distinctiveness floor', 'floor not enforced', findings);
  }

  const pericopes = perVerse.size;
  const considered = distillate.stats?.termsConsidered ?? 0;
  const admitted = distillate.stats?.termsAdmitted ?? distillate.terms.length;
  const rejectionRate = considered > 0 ? 1 - admitted / considered : 0;
  return pass(
    'G5-distinctiveness',
    'Distinctiveness floor',
    `${distillate.terms.length} term(s) across ${pericopes} verse(s); ` +
      `${(rejectionRate * 100).toFixed(1)}% of candidate terms rejected as insufficiently ` +
      `distinctive (PMI < ${thresholds.minPmi})`,
    {
      terms: distillate.terms.length,
      verses: pericopes,
      rejectionRate: Number(rejectionRate.toFixed(4)),
    },
  );
}

export function saturationGate(
  distillate: DistillateFile | null,
  thresholds: { readonly minProfileDelta: number; readonly worksPerPericopeBeforeCheck: number },
): GateResult {
  if (!distillate || distillate.terms.length === 0) {
    return notApplicable('G9-saturation', 'Saturation', 'no corpus ingestion in this build');
  }
  const delta = distillate.stats?.halfCorpusProfileDelta;
  if (delta === undefined) {
    return notApplicable(
      'G9-saturation',
      'Saturation',
      'distillate carries no profile-delta measurement',
    );
  }

  // Deliberately NOT a failure condition. Saturation is information for the
  // curator, not an error: a saturated corpus is a signal to stop feeding
  // this vein, and failing the build over it would punish someone for
  // discovering a true fact about their data.
  const saturated = delta < thresholds.minProfileDelta;
  return pass(
    'G9-saturation',
    'Saturation',
    saturated
      ? `Profiles moved ${delta.toFixed(4)} when the corpus doubled — below the ` +
        `${thresholds.minProfileDelta} threshold. THIS SOURCE IS SATURATED: further works of ` +
        'the same kind will add weight without value. Ingest a different author or book.'
      : `Profiles moved ${delta.toFixed(4)} when the corpus doubled (threshold ` +
        `${thresholds.minProfileDelta}) — this source is still paying for itself`,
    { halfCorpusProfileDelta: delta, saturated: saturated ? 1 : 0 },
  );
}
