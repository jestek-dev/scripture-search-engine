// Fetch the pinned embedding model (P4.16 / B4) into curation/.models/.
//
// Downloads exactly the files named in model.lock.json, at exactly the
// pinned revision, and verifies every sha256 before declaring success.
// A mismatched download is deleted and the run fails closed — the lock is
// the authority, never the network. This is the ONLY file in the
// repository that downloads model weights, and it writes only under
// curation/.models/ (gitignored).
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { CURATION_ROOT, readModelLock, sha256OfFile, verifyLocalModel } from './modelLock.js';

const lock = readModelLock();
const modelDir = join(CURATION_ROOT, lock.localPath);

const already = verifyLocalModel(lock);
if (already.status === 'verified') {
  console.log(`model already present and verified at ${lock.localPath} (revision ${lock.pinned.revision})`);
  process.exit(0);
}

console.log(`fetching ${lock.pinned.repo} @ ${lock.pinned.revision} (${lock.pinned.license}) ...`);
for (const [file, expected] of Object.entries(lock.pinned.files)) {
  const url = `https://huggingface.co/${lock.pinned.repo}/resolve/${lock.pinned.revision}/${file}`;
  const target = join(modelDir, file);
  mkdirSync(dirname(target), { recursive: true });
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`download failed for ${file}: HTTP ${response.status} from ${url}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  writeFileSync(target, bytes);
  const actual = sha256OfFile(target);
  if (actual !== expected) {
    rmSync(target);
    throw new Error(
      `sha256 mismatch for ${file}: lock pins ${expected}, download was ${actual} — deleted the download and refusing to proceed`,
    );
  }
  console.log(`  ${file} ok (${bytes.length} bytes, sha256 ${actual.slice(0, 12)}…)`);
}

const verification = verifyLocalModel(lock);
if (verification.status !== 'verified') {
  throw new Error(`post-fetch verification failed: ${verification.reason}`);
}
console.log(`model verified at ${lock.localPath}`);
