/**
 * Certified-sweep preconditions (MS-6). Gate discipline (CLAUDE.md): a
 * check that cannot run reports not-applicable WITH A REASON and the
 * workflow FAILS CLOSED — it never prints a vacuous pass and never
 * defaults a missing number.
 *
 * The Phase-8 preamble's hard preconditions are checked structurally where
 * the repo can see them: (a) the terminus identity — the committed release
 * descriptor must pin the SAME engineVersion the checked-out engine builds,
 * or the sweep would certify an identity that does not exist; (b) the J43
 * numbers — perturbK and ring floors must be signed (non-null) before any
 * run can claim certified scale. Interim shakedown runs state their
 * numbers explicitly on the command line instead.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ENGINE_VERSION } from '@jestek-dev/scripture-engine';

import { REPO_ROOT } from './universe/compileFromRepo.js';
import { readSweepNumbersBlock } from './perturb/deriveRepoRing2.js';

export interface PreconditionFinding {
  readonly ok: boolean;
  readonly name: string;
  readonly reason: string;
}

export function checkCertifiedPreconditions(): PreconditionFinding[] {
  const findings: PreconditionFinding[] = [];

  // (a) Terminus identity: committed descriptor pins the engine we run.
  try {
    const descriptor = JSON.parse(
      readFileSync(join(REPO_ROOT, 'artifacts', 'content-artifact.json'), 'utf8'),
    ) as { engineVersion?: string };
    if (descriptor.engineVersion === ENGINE_VERSION) {
      findings.push({
        ok: true,
        name: 'terminus-identity',
        reason: `committed descriptor pins engineVersion ${ENGINE_VERSION}`,
      });
    } else {
      findings.push({
        ok: false,
        name: 'terminus-identity',
        reason:
          `not-applicable — terminus identity absent: committed descriptor pins ` +
          `engineVersion ${descriptor.engineVersion ?? '(none)'} but the checked-out engine is ` +
          `${ENGINE_VERSION}; the P7.6 terminus mint has not landed for this engine`,
      });
    }
  } catch (error) {
    findings.push({
      ok: false,
      name: 'terminus-identity',
      reason: `not-applicable — no readable committed descriptor: ${String(error)}`,
    });
  }

  // (b) J43 numbers signed.
  const budgets = readSweepNumbersBlock() as {
    perturbK?: { grammar?: number | null; paraphrase?: number | null };
    ringFloors?: Record<string, number | null>;
  };
  const unsignedNumbers: string[] = [];
  if (budgets.perturbK?.grammar == null) unsignedNumbers.push('perturbK.grammar');
  if (budgets.perturbK?.paraphrase == null) unsignedNumbers.push('perturbK.paraphrase');
  for (const key of ['ring1Committed', 'ring1Grammar', 'ring1Paraphrase', 'ring2Derived']) {
    if (budgets.ringFloors?.[key] == null) unsignedNumbers.push(`ringFloors.${key}`);
  }
  if (unsignedNumbers.length === 0) {
    findings.push({ ok: true, name: 'j43-numbers', reason: 'sweep numbers block signed' });
  } else {
    findings.push({
      ok: false,
      name: 'j43-numbers',
      reason:
        `not-applicable — J43 has not signed the sweep numbers block: ` +
        `${unsignedNumbers.join(', ')} are null in the eval/budgets.json sweep block`,
    });
  }

  return findings;
}
