import http from 'node:http';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import type { ArtifactDescriptor } from '../src/descriptor.js';
import {
  StartupListenError,
  listenOnLoopback,
  preflightArtifactFile,
  preflightLog,
  startupFailureJson,
  startupState,
} from '../src/startupPreflight.js';

const directories: string[] = [];
const servers: http.Server[] = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function fixtureDirectory(): Promise<string> {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'sse-startup-preflight-'));
  directories.push(directory);
  return directory;
}

function descriptor(databaseSha256: string): ArtifactDescriptor {
  return {
    schemaVersion: 'test',
    engineVersion: 'test',
    corpusFingerprint: '1'.repeat(64),
    layerFingerprint: '2'.repeat(64),
    databaseSha256,
    databaseBytes: 1,
    translations: [],
  };
}

describe('startup preflight states', () => {
  it('distinguishes ready and degraded-read-only state deterministically', () => {
    expect(startupState([])).toEqual({ schemaVersion: 1, mode: 'ready', issues: [] });
    const problem = {
      code: 'artifact_missing' as const,
      area: 'artifact' as const,
      message: 'missing',
      remediation: 'fetch it',
    };
    expect(startupState([problem])).toEqual({ schemaVersion: 1, mode: 'degraded-read-only', issues: [problem] });
  });

  it('classifies missing, mismatched, and matching artifacts', async () => {
    const directory = await fixtureDirectory();
    const database = path.join(directory, 'content.db');
    expect(await preflightArtifactFile(database, descriptor('0'.repeat(64)))).toMatchObject({ code: 'artifact_missing' });

    await writeFile(database, 'database');
    const mismatch = await preflightArtifactFile(database, descriptor('0'.repeat(64)));
    expect(mismatch).toMatchObject({ code: 'artifact_hash_mismatch', details: { expectedSha256: '0'.repeat(64) } });

    const { createHash } = await import('node:crypto');
    const actual = createHash('sha256').update('database').digest('hex');
    expect(await preflightArtifactFile(database, descriptor(actual))).toBeNull();
  });

  it.each([
    ['case', 'unsupported_case_log_schema', 'cases'],
    ['judgment', 'unsupported_judgment_log_schema', 'judgments'],
  ] as const)('classifies unsupported %s log schemas with path and remediation', async (kind, code, area) => {
    const issue = await preflightLog(kind, `/tmp/${kind}.jsonl`, async () => {
      throw new Error('schemaVersion 99 is unsupported');
    });
    expect(issue).toMatchObject({ code, area, details: { path: `/tmp/${kind}.jsonl` } });
    expect(issue?.message).toContain('schemaVersion 99');
    expect(issue?.remediation).toContain('repair or migrate');
    expect(await preflightLog(kind, '/unused', async () => [])).toBeNull();
  });

  it('classifies a real occupied loopback port and emits parseable failure JSON', async () => {
    const occupied = http.createServer();
    servers.push(occupied);
    const port = await listenOnLoopback(occupied, 0);
    const contender = http.createServer();

    let failure: StartupListenError | null = null;
    try {
      await listenOnLoopback(contender, port);
    } catch (error) {
      failure = error as StartupListenError;
    }

    expect(failure).toBeInstanceOf(StartupListenError);
    expect(failure?.startupIssue).toMatchObject({ code: 'port_occupied', details: { host: '127.0.0.1', port } });
    expect(JSON.parse(startupFailureJson(failure!))).toMatchObject({
      schema: 'scripture-workbench/startup-failure/v1',
      state: 'startup-failed',
      issue: { code: 'port_occupied' },
    });
  });
});
