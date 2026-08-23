// Model-lock discipline tests (P4.16 / B4). These run with or without the
// fetched model — the lock itself and the fail-closed verification logic
// are testable from bytes alone.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import { CURATION_ROOT, readModelLock, verifyLocalModel, type ModelLock } from '../src/modelLock.js';

describe('model.lock.json', () => {
  const lock = readModelLock();

  it('pins the mandated model with license and full revisions', () => {
    expect(lock.upstream.model).toBe('sentence-transformers/all-MiniLM-L6-v2');
    expect(lock.upstream.license).toBe('Apache-2.0');
    expect(lock.pinned.license).toBe('Apache-2.0');
    expect(lock.upstream.revision).toMatch(/^[0-9a-f]{40}$/);
    expect(lock.pinned.revision).toMatch(/^[0-9a-f]{40}$/);
  });

  it('pins a full sha256 for every model file', () => {
    const files = Object.entries(lock.pinned.files);
    expect(files.length).toBeGreaterThan(0);
    for (const [file, sha] of files) {
      expect(file.length).toBeGreaterThan(0);
      expect(sha).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it('keeps the model directory out of git (weights are fetched, never committed)', () => {
    expect(lock.localPath.startsWith('.models/')).toBe(true);
  });
});

describe('verifyLocalModel', () => {
  const scratch = join(CURATION_ROOT, '.cache', 'modelLock-test-scratch');
  afterAll(() => rmSync(scratch, { recursive: true, force: true }));

  it('reports absent (with the fetch instruction) for an unfetched model', () => {
    const lock: ModelLock = {
      upstream: { model: 'x', license: 'Apache-2.0', revision: 'a'.repeat(40) },
      pinned: { repo: 'x/y', license: 'Apache-2.0', revision: 'a'.repeat(40), files: { 'a.txt': 'b'.repeat(64) } },
      localPath: '.cache/modelLock-test-scratch/does-not-exist',
    };
    const result = verifyLocalModel(lock);
    expect(result.status).toBe('absent');
    if (result.status === 'absent') expect(result.reason).toContain('fetch-model');
  });

  it('fails closed on a sha256 mismatch', () => {
    const dir = join(scratch, 'mismatch');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'a.txt'), 'not the pinned bytes');
    const lock: ModelLock = {
      upstream: { model: 'x', license: 'Apache-2.0', revision: 'a'.repeat(40) },
      pinned: { repo: 'x/y', license: 'Apache-2.0', revision: 'a'.repeat(40), files: { 'a.txt': 'b'.repeat(64) } },
      localPath: '.cache/modelLock-test-scratch/mismatch',
    };
    const result = verifyLocalModel(lock);
    expect(result.status).toBe('mismatch');
    if (result.status === 'mismatch') expect(result.reason).toContain('refusing');
  });
});
