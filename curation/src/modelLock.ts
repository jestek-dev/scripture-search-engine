// Model-lock verification for the offline curation tooling (P4.16 / B4).
//
// The lock (curation/model.lock.json) pins ONE embedding model by
// repository, revision, and per-file sha256. Every entry point that loads
// the model calls `verifyLocalModel()` first and FAILS CLOSED on any
// missing or mismatched file — an unverified model must never produce a
// suggestion a human might approve. This module does I/O; it lives in
// curation/, which is outside the artifact build graph by design (see
// pipeline/test/curationBoundary.test.ts for the enforced import boundary).
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const CURATION_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export interface ModelLock {
  readonly upstream: { readonly model: string; readonly license: string; readonly revision: string };
  readonly pinned: {
    readonly repo: string;
    readonly license: string;
    readonly revision: string;
    readonly files: Readonly<Record<string, string>>;
  };
  readonly localPath: string;
}

export function readModelLock(): ModelLock {
  return JSON.parse(readFileSync(join(CURATION_ROOT, 'model.lock.json'), 'utf8')) as ModelLock;
}

export function sha256OfFile(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

export type ModelVerification =
  | { readonly status: 'verified'; readonly modelDir: string }
  | { readonly status: 'absent'; readonly reason: string }
  | { readonly status: 'mismatch'; readonly reason: string };

/**
 * Verify the locally fetched model against the lock. Distinguishes
 * "absent" (not fetched yet — callers may report not-applicable with this
 * reason, never pass) from "mismatch" (bytes differ from the pin — always
 * a hard failure).
 */
export function verifyLocalModel(lock: ModelLock = readModelLock()): ModelVerification {
  const modelDir = join(CURATION_ROOT, lock.localPath);
  if (!existsSync(modelDir)) {
    return {
      status: 'absent',
      reason: `model directory ${lock.localPath} not fetched; run \`npm run fetch-model\` in curation/`,
    };
  }
  for (const [file, expected] of Object.entries(lock.pinned.files)) {
    const path = join(modelDir, file);
    if (!existsSync(path)) {
      return {
        status: 'absent',
        reason: `model file ${file} missing from ${lock.localPath}; run \`npm run fetch-model\` in curation/`,
      };
    }
    const actual = sha256OfFile(path);
    if (actual !== expected) {
      return {
        status: 'mismatch',
        reason: `sha256 mismatch for ${file}: lock pins ${expected}, local file is ${actual} — refusing to load an unpinned model`,
      };
    }
  }
  return { status: 'verified', modelDir };
}
