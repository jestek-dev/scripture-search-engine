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
 *
 * node_modules trees are provisioned as REAL directories whose top-level
 * entries are symbolic links into the primary root. The real directory
 * matters: the repo's .gitignore patterns for these paths end in '/'
 * (directory-only matches), so a symlinked directory would surface as an
 * untracked path and fail the admission worktree audits, while a real
 * ignored directory stays invisible to them (`--untracked-files=all
 * --ignored=no`).
 *
 * pipeline/sources is provisioned by recursive HARDLINK instead: the
 * curation-boundary guard (pipeline/test/curationBoundary.test.ts, round 3)
 * asserts ZERO symlinks anywhere under pipeline/ outside node_modules/dist,
 * and the D11 shakedown proved symlinked source entries fail that guard
 * inside the worktree's own `npm run verify`. Hardlinked files are regular
 * files to every scan, cost no space, and the fetched sources are
 * read-only, checksummed inputs. pipeline/.cache is NOT provisioned at all:
 * it is an optional build accelerator, symlinks would trip the same guard,
 * and hardlinking a mutable cache risks cross-tree corruption — the
 * worktree build simply runs cold.
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
import { copyFile, link, mkdir, readdir, stat, symlink } from 'node:fs/promises';
import path from 'node:path';

const SYMLINKED_DIRECTORIES = [
  'node_modules',
  'curation/node_modules',
] as const;

const HARDLINKED_DIRECTORIES = ['pipeline/sources'] as const;

/**
 * Ignored output directories a working checkout carries but a fresh worktree
 * lacks. They are materialized EMPTY (never shared — reports and run outputs
 * must stay per-worktree): the release/control gauntlets write their pinned
 * reports under eval/.runs, and two workbench integration tests write fresh
 * reports there (the fresh-checkout ENOENT pair documented in the build
 * notes) — both fail on a missing directory.
 */
const MATERIALIZED_DIRECTORIES = ['eval/.runs'] as const;

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

async function hardlinkTree(sourceDir: string, targetDir: string): Promise<void> {
  await mkdir(targetDir, { recursive: true });
  for (const name of await readdir(sourceDir)) {
    const source = path.join(sourceDir, name);
    const target = path.join(targetDir, name);
    const stats = await stat(source);
    if (stats.isDirectory()) {
      await hardlinkTree(source, target);
    } else if (!existsSync(target)) {
      // Cross-device roots cannot hardlink; fall back to a real copy so the
      // provisioned tree is regular files either way.
      await link(source, target).catch(() => copyFile(source, target));
    }
  }
}

/**
 * Shares the primary root's installed dependencies and fetched sources into
 * a freshly created detached worktree. Missing sources are skipped silently:
 * the fixed commands that need them fail with their own honest errors.
 */
export async function provisionDetachedWorktree(primaryRoot: string, worktree: string): Promise<void> {
  for (const relative of SYMLINKED_DIRECTORIES) {
    const source = path.join(primaryRoot, ...relative.split('/'));
    if (!existsSync(source)) continue;
    await linkContents(source, path.join(worktree, ...relative.split('/')));
  }
  for (const relative of HARDLINKED_DIRECTORIES) {
    const source = path.join(primaryRoot, ...relative.split('/'));
    if (!existsSync(source)) continue;
    await hardlinkTree(source, path.join(worktree, ...relative.split('/')));
  }
  for (const relative of MATERIALIZED_DIRECTORIES) {
    await mkdir(path.join(worktree, ...relative.split('/')), { recursive: true });
  }
}
