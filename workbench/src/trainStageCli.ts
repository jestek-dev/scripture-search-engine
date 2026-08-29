/**
 * D12 — the fixed CLI behind the three train-stage jobs. Invoked ONLY by the
 * job runner's allowlisted definitions (`npm run train:build` /
 * `train:measure` / `train:gauntlet` at the repository root): the single
 * argv token names the stage, and everything else — which train, which
 * paths — is located by the stage itself from the repository state. No
 * free-form command ever crosses the HTTP boundary (control-plane rule).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runTrainStage, TrainStageError, TRAIN_STAGES, type TrainStage } from './trainStages.js';

async function main(): Promise<void> {
  const stage = process.argv[2];
  if (stage === undefined || !(TRAIN_STAGES as readonly string[]).includes(stage)) {
    console.error(`Usage: train-stage <${TRAIN_STAGES.join('|')}>`);
    process.exitCode = 2;
    return;
  }
  // The same environment knobs the server honors, so a sandboxed state root
  // (tests, the D15 shakedown) steers both the panel and the stage jobs.
  const repoRoot = process.env.WORKBENCH_REPO_ROOT
    ?? path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
  const result = await runTrainStage(stage as TrainStage, {
    repoRoot,
    reviewer: process.env.WORKBENCH_REVIEWER ?? 'jesse',
    independentSigner: process.env.WORKBENCH_INDEPENDENT_SIGNER ?? null,
    ...(process.env.WORKBENCH_UPDATES_PATH === undefined ? {} : { updatesLogPath: process.env.WORKBENCH_UPDATES_PATH }),
    ...(process.env.WORKBENCH_JUDGMENTS_PATH === undefined ? {} : { judgmentsLogPath: process.env.WORKBENCH_JUDGMENTS_PATH }),
    ...(process.env.WORKBENCH_CASES_PATH === undefined ? {} : { casesLogPath: process.env.WORKBENCH_CASES_PATH }),
    ...(process.env.WORKBENCH_ADMISSION_EVIDENCE_PATH === undefined ? {} : { evidencePath: process.env.WORKBENCH_ADMISSION_EVIDENCE_PATH }),
  });
  console.log(`train-stage ${result.stage}: ${result.status}${result.stopReason === null ? '' : ` (${result.stopReason})`} — ${result.detail} [${result.trainId}]`);
  if (result.status === 'STOPPED') process.exitCode = 1;
}

main().catch((error: unknown) => {
  if (error instanceof TrainStageError) {
    console.error(`train-stage refused (${error.code}): ${error.message}`);
  } else {
    console.error(`train-stage failed: ${error instanceof Error ? error.message : String(error)}`);
  }
  process.exitCode = 1;
});
