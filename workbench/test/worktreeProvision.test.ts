/**
 * Detached-worktree provisioning (plan §5.5 gap 3 / §8.4 — D11 shakedown
 * findings). The pins here are the failure modes proven in anger:
 *
 * - vite's transient `node_modules/.vite-temp` scratch directory must never
 *   be shared into a worktree — a symlink to it dangles the moment vite
 *   cleans up (or the primary reinstalls), and every later in-worktree
 *   vitest dies at startup on the dangling link (it stopped a real train's
 *   verify with a spurious `verify-failed`).
 * - a dangling symlink already sitting in the primary farm is skipped, not
 *   fatal — provisioning must not crash the admission on a stale entry.
 * - everything else keeps the P2-25 shape: node_modules is a REAL directory
 *   (directory-only gitignore patterns) whose top-level entries are symlinks.
 */
import { lstat, mkdir, mkdtemp, readdir, readlink, rm, symlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { provisionDetachedWorktree } from '../src/worktreeProvision.js';

describe('provisionDetachedWorktree', () => {
  let primary: string;
  let worktree: string;

  beforeEach(async () => {
    primary = await mkdtemp(path.join(os.tmpdir(), 'provision-primary-'));
    worktree = await mkdtemp(path.join(os.tmpdir(), 'provision-worktree-'));
  });

  afterEach(async () => {
    await rm(primary, { recursive: true, force: true });
    await rm(worktree, { recursive: true, force: true });
  });

  it('links top-level node_modules entries into a REAL directory (P2-25 shape)', async () => {
    await mkdir(path.join(primary, 'node_modules', '.bin'), { recursive: true });
    await mkdir(path.join(primary, 'node_modules', 'left-pad'), { recursive: true });
    await writeFile(path.join(primary, 'node_modules', '.package-lock.json'), '{}\n');

    await provisionDetachedWorktree(primary, worktree);

    const provisioned = path.join(worktree, 'node_modules');
    expect((await lstat(provisioned)).isSymbolicLink()).toBe(false);
    expect((await lstat(provisioned)).isDirectory()).toBe(true);
    for (const name of ['.bin', 'left-pad', '.package-lock.json']) {
      const entry = path.join(provisioned, name);
      expect((await lstat(entry)).isSymbolicLink()).toBe(true);
      expect(await readlink(entry)).toBe(path.join(primary, 'node_modules', name));
    }
  });

  it('never links vite transient scratch entries — the dangling .vite-temp stop (D11)', async () => {
    // The window proven in anger: vite's scratch dir exists in the primary
    // farm at provisioning time and vanishes afterwards.
    await mkdir(path.join(primary, 'node_modules', '.vite-temp'), { recursive: true });
    await mkdir(path.join(primary, 'node_modules', '.vite'), { recursive: true });
    await mkdir(path.join(primary, 'node_modules', '.bin'), { recursive: true });

    await provisionDetachedWorktree(primary, worktree);

    const provisioned = path.join(worktree, 'node_modules');
    expect(await readdir(provisioned)).toEqual(['.bin']);
    // vite can now create its own real per-worktree scratch directory.
    await mkdir(path.join(provisioned, '.vite-temp'), { recursive: true });
    expect((await lstat(path.join(provisioned, '.vite-temp'))).isSymbolicLink()).toBe(false);
  });

  it('skips a dangling symlink in the primary farm instead of crashing the admission', async () => {
    await mkdir(path.join(primary, 'node_modules'), { recursive: true });
    await mkdir(path.join(primary, 'node_modules', 'alive'), { recursive: true });
    await symlink(path.join(primary, 'gone-forever'), path.join(primary, 'node_modules', 'stale'));

    await provisionDetachedWorktree(primary, worktree);

    const provisioned = path.join(worktree, 'node_modules');
    expect(await readdir(provisioned)).toEqual(['alive']);
    expect(existsSync(path.join(provisioned, 'stale'))).toBe(false);
  });

  it('materializes eval/.runs empty and never shares it (P2-25a)', async () => {
    await mkdir(path.join(primary, 'eval', '.runs'), { recursive: true });
    await writeFile(path.join(primary, 'eval', '.runs', 'primary-report.json'), '{}\n');

    await provisionDetachedWorktree(primary, worktree);

    const runs = path.join(worktree, 'eval', '.runs');
    expect((await lstat(runs)).isDirectory()).toBe(true);
    expect((await lstat(runs)).isSymbolicLink()).toBe(false);
    expect(await readdir(runs)).toEqual([]);
  });
});
