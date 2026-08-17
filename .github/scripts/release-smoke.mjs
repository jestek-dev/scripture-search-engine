/**
 * Post-release smoke test — the consumer path, end to end.
 *
 * Proves what a consumer with no credentials and no checkout can do the
 * minute a release goes public: download `content.db` and its descriptor from
 * the release URL, verify the bytes against the reviewed identity, install
 * the engine from the npm registry, and run one real query. This is the check
 * that would have caught v0.7.1 the day it shipped (a published engine that
 * refused the published artifact).
 *
 * Lives outside every workspace on purpose: the engine package does no I/O,
 * so THIS SCRIPT owns the SQLite port — exactly as a consumer would.
 *
 * Environment:
 *   RELEASE_TAG          release to download from (e.g. v0.9.0)  [required*]
 *   ENGINE_VERSION       npm version expected to be installable  [required*]
 *
 * Local dry-run overrides (*replace the corresponding required variable), so
 * the script is exercisable against a locally built artifact + `npm pack`
 * tarball before any release depends on it:
 *   SMOKE_DB_PATH          path to a local content.db  (skips the download)
 *   SMOKE_DESCRIPTOR_PATH  path to its descriptor      (skips the download)
 *   SMOKE_ENGINE_SPEC      npm install spec, e.g. a ./*.tgz path
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { setTimeout as sleep } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

const REPO = 'jestek-dev/scripture-search-engine';
const TOP_WINDOW = 10;
const INSTALL_ATTEMPTS = 10;
const INSTALL_RETRY_MS = 30_000;

function fail(message) {
  console.error(`\nSMOKE FAIL: ${message}`);
  process.exit(1);
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) fail(`${name} must be set`);
  return value;
}

/**
 * Plain fetch, deliberately unauthenticated — the point is what an anonymous
 * consumer sees, and a token would let a private or draft release pass.
 */
async function download(url) {
  console.log(`Downloading ${url}`);
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) fail(`HTTP ${response.status} ${response.statusText} for ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

async function loadReleaseAssets() {
  const dbOverride = process.env.SMOKE_DB_PATH;
  const descriptorOverride = process.env.SMOKE_DESCRIPTOR_PATH;
  if (dbOverride || descriptorOverride) {
    if (!dbOverride || !descriptorOverride) {
      fail('SMOKE_DB_PATH and SMOKE_DESCRIPTOR_PATH must be set together');
    }
    console.log(`Local mode: ${dbOverride} + ${descriptorOverride}`);
    return {
      database: readFileSync(dbOverride),
      descriptor: JSON.parse(readFileSync(descriptorOverride, 'utf8')),
    };
  }
  const tag = requireEnv('RELEASE_TAG');
  const base = `https://github.com/${REPO}/releases/download/${tag}`;
  return {
    database: await download(`${base}/content.db`),
    descriptor: JSON.parse((await download(`${base}/content-artifact.json`)).toString('utf8')),
  };
}

/**
 * Registry propagation is eventually consistent: a version published seconds
 * ago can 404 for a while. Bounded retry — a version still missing after the
 * window is a real failure, not a propagation delay.
 */
async function installEngine(scratch, spec) {
  for (let attempt = 1; attempt <= INSTALL_ATTEMPTS; attempt += 1) {
    try {
      execFileSync('npm', ['install', '--no-audit', '--no-fund', spec], {
        cwd: scratch,
        stdio: 'inherit',
      });
      return;
    } catch (error) {
      if (attempt === INSTALL_ATTEMPTS) throw error;
      console.log(
        `npm install of ${spec} failed (attempt ${attempt}/${INSTALL_ATTEMPTS}) — ` +
          `retrying in ${INSTALL_RETRY_MS / 1000}s for registry propagation`,
      );
      await sleep(INSTALL_RETRY_MS);
    }
  }
}

/** True when `reference` covers James 1:22 — a bare verse or a collapsed run. */
export function coversJames122(reference) {
  const match = /^James 1:(\d+)(?:-(?:1:)?(\d+))?$/.exec(reference.trim());
  if (!match) return false;
  const start = Number(match[1]);
  const end = match[2] === undefined ? start : Number(match[2]);
  return start <= 22 && 22 <= end;
}

async function main() {
  const { database, descriptor } = await loadReleaseAssets();

  // ---- Bytes match the reviewed identity ----
  const sha = createHash('sha256').update(database).digest('hex');
  if (sha !== descriptor.databaseSha256) {
    fail(`content.db sha256 ${sha} does not match descriptor ${descriptor.databaseSha256}`);
  }
  if (database.length !== descriptor.databaseBytes) {
    fail(`content.db is ${database.length} bytes; descriptor says ${descriptor.databaseBytes}`);
  }
  console.log(`sha256 verified: ${sha} (${database.length} bytes)`);

  // ---- The engine a consumer installs accepts these bytes ----
  const spec =
    process.env.SMOKE_ENGINE_SPEC ??
    `@jestek-dev/scripture-engine@${requireEnv('ENGINE_VERSION')}`;
  const scratch = realpathSync(mkdtempSync(join(tmpdir(), 'release-smoke-')));
  try {
    writeFileSync(join(scratch, 'package.json'), JSON.stringify({ private: true }));
    const databasePath = join(scratch, 'content.db');
    writeFileSync(databasePath, database);

    await installEngine(scratch, spec);
    const packageRoot = join(scratch, 'node_modules', '@jestek-dev', 'scripture-engine');
    const installed = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
    console.log(`Installed @jestek-dev/scripture-engine@${installed.version} from ${spec}`);

    const { createEngine } = await import(pathToFileURL(join(packageRoot, 'dist', 'index.js')));

    // The engine does no I/O; the consumer owns the port. This is that port.
    const sqlite = new DatabaseSync(databasePath, { readOnly: true });
    const port = {
      async execute(query, params = []) {
        return { rows: sqlite.prepare(query).all(...params) };
      },
      async close() {
        sqlite.close();
      },
    };

    const engine = await createEngine(port);
    const result = await engine.research('hearing and doing');
    await engine.close();

    // ---- One real query behaves ----
    if (result.kind !== 'discovery') {
      fail(`research('hearing and doing') returned kind "${result.kind}", expected discovery`);
    }
    const window = result.results.slice(0, TOP_WINDOW);
    console.log(`Top ${window.length}: ${window.map((entry) => entry.reference).join('; ')}`);
    // Presence-in-window, not position: exact ordering is the gauntlet's
    // contract, and re-asserting it here would fail releases for rank churn
    // the gauntlet already reviewed.
    if (!window.some((entry) => coversJames122(entry.reference))) {
      fail(`James 1:22 is not in the top ${TOP_WINDOW} for 'hearing and doing'`);
    }
    console.log(`James 1:22 present in the top ${TOP_WINDOW}.`);

    // ---- The identity triple the engine reports IS the reviewed one ----
    const mismatches = ['engineVersion', 'corpusFingerprint', 'layerFingerprint'].filter(
      (field) => result[field] !== descriptor[field],
    );
    if (mismatches.length > 0) {
      fail(
        mismatches
          .map((field) => `${field}: engine reports ${result[field]}, descriptor says ${descriptor[field]}`)
          .join('\n  '),
      );
    }
    console.log(
      `Identity verified: (${result.engineVersion}, ${result.corpusFingerprint}, ${result.layerFingerprint})`,
    );
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }

  console.log('\nSMOKE PASS');
}

// Importable for tests without side effects; executable as a script.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
