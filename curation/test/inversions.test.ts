// B4 ACCEPTANCE TEST (P4.16): the inversion-flag mode must REDISCOVER the
// three known, audit-measured sense inversions:
//
//   1. "comforter" -> Job 16:2 ("Miserable comforters are you all!") —
//      the gap that motivated holy-spirit-the-comforter's bare-word row.
//   2. "new beginnings" -> Ecclesiastes 1:9 ("no new thing under the
//      sun") — the inversion new-creation.json's demotion guard records.
//   3. fn13: "caring for a dying parent" -> Colossians 3:20-21
//      (child-raising served to someone losing a parent; FLAG #7).
//
// Register definitions are pinned in test/fixtures/canonical-inversions.json
// (generated from the committed tree 2026-08-22) so this test is
// deterministic against future ontology edits: the three cases are
// historical measurements, not live-tree claims.
//
// NEGATIVE CONTROLS (round-1 fix): each is a candidate that genuinely
// EXERCISES the flag paths — it shares a significant token with the query
// (the gate is open), it is NOT one of the register's floorTexts (so the
// floor comparison is a live judgment, not true by construction), and
// competitors are passed (so the cross-claim comparison runs) — and is
// asserted unflagged. Both controls were verified able to fail during
// development by mutating the gates (crossClaimMargin lowered; floor
// raised): the flags fired, then the gates were restored.
//   - "new beginnings": Isaiah 65:17 ("I create new heavens and a new
//     earth" — shares "new", honestly new-creation).
//   - "caring for a dying parent": 1 Timothy 5:4 ("repay their parents" —
//     shares "parent", honestly THIS concept, not parenting).
// The comforter case carries NO negative control, honestly: all eight WEB
// verses containing "comforter(s)" are laments or taunts (the Paraclete is
// "Counselor" in the WEB), so no honest token-sharing neighbour exists for
// that register. And not every honest "new" verse clears the floor: Isaiah
// 43:19 (0.4507) and Revelation 21:1 (0.4468) measure just below it — a
// flag is a prompt for a human to read the passage, never a verdict.
//
// Calibration record (all-MiniLM-L6-v2 quantized, revision 751bff37,
// measured 2026-08-22 on this runner, with the exact candidate batches
// below — batch composition shifts the quantized sims by ~0.01, so these
// are batch-specific):
//   Job 16:2    simRegister 0.3109 vs floor 0.5290 -> below-register-floor
//   Eccl 1:9    simRegister 0.3892 vs floor 0.4861 -> below-register-floor
//   Isa 65:17   simRegister 0.5885 vs floor 0.4861; gods-faithfulness gap
//               -0.2721                            -> unflagged
//   Col 3:20-21 simRegister 0.5148, parenting 0.7895 (gap 0.2747)
//                                                  -> cross-concept-claim
//   1 Tim 5:4   simRegister 0.5539 vs floor 0.3225; parenting gap -0.1096
//                                                  -> unflagged
//   The margins leave real headroom over floating-point drift, but if a
//   different platform's ONNX runtime flips a case, recalibrate against
//   these numbers rather than loosening the mechanism.
//
// GATE DISCIPLINE: when the pinned model has not been fetched the
// inference tests SKIP with the reason printed — they never report pass
// unrun. A sha256 MISMATCH of a present model is a hard failure in every
// mode (fail closed).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { createEmbedder } from '../src/embedder.js';
import { analyzeInversions, type RegisterDefinition } from '../src/inversions.js';
import { verifyLocalModel } from '../src/modelLock.js';

const fixture = JSON.parse(
  readFileSync(join(__dirname, 'fixtures', 'canonical-inversions.json'), 'utf8'),
) as { registers: Record<string, RegisterDefinition> };

function register(id: string): RegisterDefinition {
  const definition = fixture.registers[id];
  if (!definition) throw new Error(`fixture register missing: ${id}`);
  return definition;
}

function finding(report: { findings: readonly unknown[] }, index: number) {
  const entry = report.findings[index];
  if (!entry) throw new Error(`finding missing at ${index}`);
  return entry as (typeof report.findings)[number] & {
    flagged: boolean;
    flagReasons: readonly string[];
    sharedTokens: readonly string[];
    bestCompetitor: { id: string; similarity: number } | null;
  };
}

const JOB_16_2 = 'I have heard many such things. Miserable comforters are you all!';
const ECCLESIASTES_1_9 =
  'That which has been is that which shall be; and that which has been done is that which shall be done: and there is no new thing under the sun.';
const COLOSSIANS_3_20_21 =
  "Children, obey your parents in all things, for this pleases the Lord. Fathers, don't provoke your children, so that they won't be discouraged.";
// Negative-control texts (WEB, from the corpus — see header):
const ISAIAH_65_17 =
  '“For, behold, I create new heavens and a new earth; and the former things will not be remembered, nor come into mind.';
const FIRST_TIMOTHY_5_4 =
  'But if any widow has children or grandchildren, let them learn first to show piety toward their own family and to repay their parents, for this is acceptable in the sight of God.';

const verification = verifyLocalModel();

it('never loads a model whose bytes differ from the lock (fail closed)', () => {
  // "absent" is a legitimate state (fetch is opt-in); "mismatch" never is.
  expect(verification.status, verification.status === 'mismatch' ? (verification as { reason: string }).reason : undefined).not.toBe('mismatch');
});

if (verification.status !== 'verified') {
  // Not-applicable WITH A REASON — never an unrun pass (gate discipline).
  it.skip(`acceptance (SKIPPED: ${(verification as { reason: string }).reason})`, () => {});
} else {
  describe('B4 acceptance: rediscovers the three known inversions', () => {
    it('flags Job 16:2 for the comforter register, below the register floor', async () => {
      const embedder = await createEmbedder();
      const comforterRegister = register('holy-spirit-the-comforter');
      // No negative control here, honestly: every WEB verse containing
      // "comforter(s)" is a lament or taunt (the Paraclete is "Counselor"),
      // so no honest token-sharing neighbour exists for this register. The
      // real negative controls live in the two cases below.
      const report = await analyzeInversions(embedder, {
        query: 'comforter',
        register: comforterRegister,
        candidates: [{ reference: 'Job 16:2', text: JOB_16_2 }],
        competingRegisters: [register('god-of-all-comfort')],
      });
      const job = finding(report, 0);
      expect(job.flagged).toBe(true);
      expect(job.flagReasons).toContain('below-register-floor');
      expect(job.sharedTokens.length).toBeGreaterThan(0);
    }, 120_000);

    it('flags Ecclesiastes 1:9 for the new-beginnings register, below the register floor', async () => {
      const embedder = await createEmbedder();
      const newCreationRegister = register('new-creation');
      const report = await analyzeInversions(embedder, {
        query: 'new beginnings',
        register: newCreationRegister,
        candidates: [
          { reference: 'Ecclesiastes 1:9', text: ECCLESIASTES_1_9 },
          // NEGATIVE CONTROL: honest, token-sharing ("new"), and NOT a
          // floor text — the floor comparison below is a live judgment.
          { reference: 'Isaiah 65:17', text: ISAIAH_65_17 },
        ],
        competingRegisters: [register('gods-faithfulness')],
      });
      const [ecclesiastes, isaiah] = [finding(report, 0), finding(report, 1)];
      expect(ecclesiastes.flagged).toBe(true);
      expect(ecclesiastes.flagReasons).toContain('below-register-floor');
      expect(ecclesiastes.sharedTokens).toContain('new');
      // The control's flag paths are genuinely exercised: the gate is open
      // (shared token), the candidate is outside the pinned floorTexts, and
      // a competitor was scored — then it must come through unflagged.
      expect(isaiah.sharedTokens).toContain('new');
      expect(newCreationRegister.floorTexts).not.toContain(ISAIAH_65_17);
      expect(isaiah.bestCompetitor).not.toBeNull();
      expect(isaiah.flagged).toBe(false);
    }, 120_000);

    it('flags Colossians 3:20-21 for the dying-parent register as claimed by parenting (fn13)', async () => {
      const embedder = await createEmbedder();
      const caringRegister = register('caring-for-aging-parents');
      const report = await analyzeInversions(embedder, {
        query: 'caring for a dying parent',
        register: caringRegister,
        candidates: [
          { reference: 'Colossians 3:20-21', text: COLOSSIANS_3_20_21 },
          // NEGATIVE CONTROL: honest, token-sharing ("parent"), NOT a floor
          // text, and facing the same parenting competitor that claims
          // Colossians — "repay their parents" is THIS concept's meaning.
          { reference: '1 Timothy 5:4', text: FIRST_TIMOTHY_5_4 },
        ],
        competingRegisters: [register('parenting'), register('god-of-all-comfort')],
      });
      const [colossians, timothy] = [finding(report, 0), finding(report, 1)];
      expect(colossians.flagged).toBe(true);
      expect(colossians.flagReasons).toContain('cross-concept-claim');
      // The flag names the claiming concept — fn13's actual diagnosis.
      expect(colossians.bestCompetitor?.id).toBe('parenting');
      // The control's flag paths are genuinely exercised (open gate,
      // non-floor candidate, competitors scored) — then unflagged.
      expect(timothy.sharedTokens).toContain('parent');
      expect(caringRegister.floorTexts).not.toContain(FIRST_TIMOTHY_5_4);
      expect(timothy.bestCompetitor).not.toBeNull();
      expect(timothy.flagged).toBe(false);
    }, 120_000);
  });
}
