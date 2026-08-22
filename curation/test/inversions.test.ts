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
// Calibration record (all-MiniLM-L6-v2 quantized, revision 751bff37,
// measured 2026-08-22 on this runner):
//   Job 16:2   simRegister 0.3109 vs floor 0.5210  -> below-register-floor
//   Eccl 1:9   simRegister 0.4001 vs floor 0.4716  -> below-register-floor
//   Col 3:20-21 simRegister 0.5105, parenting 0.7919 (gap 0.2814)
//                                              -> cross-concept-claim
//   Honest token-sharing anchors: all >= floor; largest cross-claim gap
//   measured 0.057 (Ezekiel 36:26 vs gods-faithfulness) — under the 0.10
//   margin. The floor gaps (0.21 / 0.07) and claim gap (0.28 vs 0.10)
//   leave real headroom over floating-point drift, but if a different
//   platform's ONNX runtime flips a case, recalibrate against these
//   numbers rather than loosening the mechanism.
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

function floorText(definition: RegisterDefinition, index: number): string {
  const text = definition.floorTexts[index];
  if (!text) throw new Error(`fixture floor text missing at ${index}`);
  return text;
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
      const report = await analyzeInversions(embedder, {
        query: 'comforter',
        register: comforterRegister,
        candidates: [
          { reference: 'Job 16:2', text: JOB_16_2 },
          // Honest neighbours: the register's own lead anchors.
          { reference: 'John 14:16-17', text: floorText(comforterRegister, 0) },
          { reference: 'John 14:26', text: floorText(comforterRegister, 1) },
        ],
        competingRegisters: [register('god-of-all-comfort')],
      });
      const [job, anchor1, anchor2] = [finding(report, 0), finding(report, 1), finding(report, 2)];
      expect(job.flagged).toBe(true);
      expect(job.flagReasons).toContain('below-register-floor');
      expect(job.sharedTokens.length).toBeGreaterThan(0);
      expect(anchor1.flagged).toBe(false);
      expect(anchor2.flagged).toBe(false);
    }, 120_000);

    it('flags Ecclesiastes 1:9 for the new-beginnings register, below the register floor', async () => {
      const embedder = await createEmbedder();
      const newCreationRegister = register('new-creation');
      const report = await analyzeInversions(embedder, {
        query: 'new beginnings',
        register: newCreationRegister,
        candidates: [
          { reference: 'Ecclesiastes 1:9', text: ECCLESIASTES_1_9 },
          // Honest token-sharing anchors ("new creation", "new heart"):
          { reference: '2 Corinthians 5:17', text: floorText(newCreationRegister, 0) },
          { reference: 'Ezekiel 36:26', text: floorText(newCreationRegister, 3) },
        ],
      });
      const [ecclesiastes, anchor1, anchor2] = [finding(report, 0), finding(report, 1), finding(report, 2)];
      expect(ecclesiastes.flagged).toBe(true);
      expect(ecclesiastes.flagReasons).toContain('below-register-floor');
      expect(ecclesiastes.sharedTokens).toContain('new');
      expect(anchor1.flagged).toBe(false);
      expect(anchor2.flagged).toBe(false);
    }, 120_000);

    it('flags Colossians 3:20-21 for the dying-parent register as claimed by parenting (fn13)', async () => {
      const embedder = await createEmbedder();
      const caringRegister = register('caring-for-aging-parents');
      const report = await analyzeInversions(embedder, {
        query: 'caring for a dying parent',
        register: caringRegister,
        candidates: [
          { reference: 'Colossians 3:20-21', text: COLOSSIANS_3_20_21 },
          // Honest neighbours: the comfort lead and the valley psalm.
          { reference: '2 Corinthians 1:3-4', text: floorText(caringRegister, 0) },
          { reference: 'Psalms 23:4', text: floorText(caringRegister, 2) },
        ],
        competingRegisters: [register('parenting'), register('god-of-all-comfort')],
      });
      const [colossians, comfort, psalm] = [finding(report, 0), finding(report, 1), finding(report, 2)];
      expect(colossians.flagged).toBe(true);
      expect(colossians.flagReasons).toContain('cross-concept-claim');
      // The flag names the claiming concept — fn13's actual diagnosis.
      expect(colossians.bestCompetitor?.id).toBe('parenting');
      expect(comfort.flagged).toBe(false);
      expect(psalm.flagged).toBe(false);
    }, 120_000);
  });
}
