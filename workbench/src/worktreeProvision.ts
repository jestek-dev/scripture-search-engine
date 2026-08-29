/**
 * Provisioning for the detached worktrees the guard-train machinery creates
 * (votes-to-engine plan §5.5 gap 3 / §8.4 — a D11 shakedown finding).
 *
 * `git worktree add --detach` materializes only TRACKED files, but the fixed
 * commands the admission, control-run, and publish steps run inside the
 * worktree — `npm run build:artifact --workspace pipeline`, `npm run verify`,
 * the release gauntlet — need the gitignored inputs a working checkout
 * carries:
 *
 *   - node_modules/           (pipeline scripts invoke ../node_modules/.bin/tsx)
 *   - curation/node_modules/  (the root typecheck spans curation/)
 *   - pipeline/sources/       (the fetched, checksummed source corpus)
 *   - pipeline/.cache/        (the derived-source cache; optional, speeds builds)
 *
 * Each is provisioned as a REAL directory whose top-level entries are
 * symbolic links into the primary root. The real directory matters: the
 * repo's .gitignore patterns for these paths end in '/' (directory-only
 * matches), so a symlinked directory would surface as an untracked path and
 * fail the admission worktree audits, while a real ignored directory stays
 * invisible to them (`--untracked-files=all --ignored=no`).
 *
 * Deliberate consequence (recorded in DEVIATIONS as a P2 note): workspace
 * packages resolve through the shared node_modules to the PRIMARY root's
 * code, so the worktree build runs the primary tree's dependency state
 * rather than a from-scratch `npm ci` at the base commit. This is sound for
 * Phase-2 guard trains because the rebuild's identity triple is verified
 * against the pinned base identity (admission.ts `validateRebuild`) — any
 * engine/corpus divergence refuses fail-closed before an admission manifest
 * exists. Phase 3's data trains revisit this with a full install.
 */
import { existsSync } from 'node:fs';
import { mkdir, readdir, stat, symlink } from 'node:fs/promises';
import path from 'node:path';

const SHARED_DIRECTORIES = [
  'node_modules',
  'curation/node_modules',
  'pipeline/sources',
  'pipeline/.cache',
] as const;

async function linkContents(sourceDir: string, targetDir: string): Promise<void> {
  await mkdir(targetDir, { recursive: true });
  for (const name of await readdir(sourceDir)) {
    const target = path.join(targetDir, name);
    if (existsSync(target)) continue;
    const source = path.join(sourceDir, name);
    const stats = await stat(source);
    await symlink(source, target, stats.isDirectory() ? 'junction' : 'file');
  }
}

/**
 * Shares the primary root's installed dependencies and fetched sources into
 * a freshly created detached worktree. Missing sources are skipped silently:
 * the fixed commands that need them fail with their own honest errors.
 */
export async function provisionDetachedWorktree(primaryRoot: string, worktree: string): Promise<void> {
  for (const relative of SHARED_DIRECTORIES) {
    const source = path.join(primaryRoot, ...relative.split('/'));
    if (!existsSync(source)) continue;
    await linkContents(source, path.join(worktree, ...relative.split('/')));
  }
}
