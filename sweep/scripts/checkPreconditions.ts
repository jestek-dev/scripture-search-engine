/**
 * CI entry for the certified-sweep preconditions (MS-6). Exit 0 only when
 * every precondition holds; otherwise print each not-applicable reason and
 * exit 2 — the workflow fails closed rather than passing vacuously.
 */
import { checkCertifiedPreconditions } from '../src/preconditions.js';

const findings = checkCertifiedPreconditions();
let failed = false;
for (const finding of findings) {
  console.log(`${finding.ok ? 'OK ' : 'FAIL'} ${finding.name}: ${finding.reason}`);
  if (!finding.ok) failed = true;
}
if (failed) {
  console.error(
    '\nCertified mega-sweep preconditions are not met; refusing to run. ' +
      'Interim shakedown stays available locally via runFullSweep --interim-shakedown ' +
      'with explicit --k-grammar/--k-paraphrase.',
  );
  process.exit(2);
}
