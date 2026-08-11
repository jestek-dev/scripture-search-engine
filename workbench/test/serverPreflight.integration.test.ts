import { spawn, type ChildProcess } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

const children: ChildProcess[] = [];
const directories: string[] = [];

afterEach(async () => {
  for (const child of children.splice(0)) child.kill();
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

async function unusedPort(): Promise<number> {
  const server = net.createServer();
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  const port = typeof address === 'object' && address !== null ? address.port : 0;
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

function launch(port: number, overrides: Readonly<Record<string, string>> = {}): ChildProcess {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'sse-server-preflight-'));
  directories.push(directory);
  mkdirSync(path.join(directory, 'workbench'), { recursive: true });
  const child = spawn(process.execPath, ['--import', 'tsx', 'src/server.ts'], {
    cwd: new URL('../', import.meta.url),
    env: {
      ...process.env,
      WORKBENCH_PORT: String(port),
      WORKBENCH_DATABASE_PATH: path.join(directory, 'missing.db'),
      WORKBENCH_CASES_PATH: path.join(directory, 'cases.jsonl'),
      WORKBENCH_JUDGMENTS_PATH: path.join(directory, 'judgments.jsonl'),
      WORKBENCH_REPO_ROOT: directory,
      ...overrides,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  children.push(child);
  return child;
}

async function ready(child: ChildProcess): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    let output = '';
    const timer = setTimeout(() => reject(new Error(`startup timed out:\n${output}`)), 15_000);
    const consume = (chunk: Buffer): void => {
      output += chunk.toString('utf8');
      if (output.includes('Workbench viewer at')) {
        clearTimeout(timer);
        resolve();
      }
    };
    child.stdout?.on('data', consume);
    child.stderr?.on('data', consume);
    child.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`server exited before readiness (${code}):\n${output}`));
    });
  });
}

async function health(port: number): Promise<any> {
  const response = await fetch(`http://127.0.0.1:${port}/api/v2/health`);
  expect(response.status).toBe(200);
  return response.json();
}

describe('server startup preflight integration', () => {
  it('publishes a missing-artifact state and blocks every mutation in degraded mode', async () => {
    const port = await unusedPort();
    const child = launch(port);
    await ready(child);

    const snapshot = await health(port);
    expect(snapshot).toMatchObject({
      ok: true,
      data: {
        startup: {
          degraded: true,
          schemaVersion: 1,
          mode: 'degraded-read-only',
          issues: [{ code: 'artifact_missing', area: 'artifact', remediation: expect.any(String) }],
        },
      },
    });

    for (const [route, body] of [
      ['/api/v2/checks', { jobId: 'typecheck' }],
      ['/api/v2/sessions', { kind: 'weekly-triage' }],
      ['/api/v2/audits/preview', { files: [] }],
      ['/api/v2/admissions/review-admission-one/admit', { decisions: [] }],
      ['/api/v2/publish/review-admission-one/prepare', { push: false }],
    ] as const) {
      const mutation = await fetch(`http://127.0.0.1:${port}${route}`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
      });
      expect(mutation.status).toBe(503);
      expect(await mutation.json()).toMatchObject({ ok: false, error: { code: 'startup_degraded_read_only', details: { mode: 'degraded-read-only' } } });
    }
    const studio = await (await fetch(`http://127.0.0.1:${port}/`)).text();
    expect(studio).toContain('Workbench');
    expect(studio).toContain('Admission');
  }, 30_000);

  it('reports hash mismatch and stale static snapshots with stable codes', async () => {
    const port = await unusedPort();
    const directory = mkdtempSync(path.join(os.tmpdir(), 'sse-preflight-inputs-'));
    directories.push(directory);
    const database = path.join(directory, 'wrong.db');
    const page = path.join(directory, 'old.html');
    writeFileSync(database, 'wrong artifact');
    writeFileSync(page, '<!doctype html><html><body><script>/api/v2/health</script></body></html>');
    const child = launch(port, { WORKBENCH_DATABASE_PATH: database, WORKBENCH_STATIC_PAGE_PATH: page });
    await ready(child);

    const snapshot = await health(port);
    const codes = snapshot.data.startup.issues.map((entry: { code: string }) => entry.code);
    expect(codes).toEqual(expect.arrayContaining(['artifact_hash_mismatch', 'static_snapshot_stale']));
  }, 30_000);

  it.each([
    ['case', 'WORKBENCH_CASES_PATH', 'unsupported_case_log_schema'],
    ['judgment', 'WORKBENCH_JUDGMENTS_PATH', 'unsupported_judgment_log_schema'],
  ] as const)('reports an unsupported %s log before accepting writes', async (_kind, environmentKey, code) => {
    const port = await unusedPort();
    const directory = mkdtempSync(path.join(os.tmpdir(), 'sse-invalid-log-'));
    directories.push(directory);
    const logPath = path.join(directory, 'invalid.jsonl');
    writeFileSync(logPath, '{"schemaVersion":99}\n');
    const child = launch(port, { [environmentKey]: logPath });
    await ready(child);

    const snapshot = await health(port);
    expect(snapshot.data.startup.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code, details: { path: logPath }, remediation: expect.stringContaining('repair or migrate') }),
    ]));
  }, 30_000);

  it('exits nonzero with a clear machine-readable diagnostic when the port is occupied', async () => {
    const occupied = net.createServer();
    await new Promise<void>((resolve, reject) => {
      occupied.once('error', reject);
      occupied.listen(0, '127.0.0.1', resolve);
    });
    const address = occupied.address();
    const port = typeof address === 'object' && address !== null ? address.port : 0;
    const child = launch(port);
    let stderr = '';
    child.stderr?.on('data', (chunk: Buffer) => { stderr += chunk.toString('utf8'); });

    const exitCode = await new Promise<number | null>((resolve) => child.once('exit', resolve));
    await new Promise<void>((resolve, reject) => occupied.close((error) => error ? reject(error) : resolve()));
    const index = children.indexOf(child);
    if (index >= 0) children.splice(index, 1);

    expect(exitCode).not.toBe(0);
    const machineLine = stderr.split(/\r?\n/).find((line) => line.startsWith('{"schema":"scripture-workbench/startup-failure/v1"'));
    expect(machineLine, stderr).toBeDefined();
    expect(JSON.parse(machineLine!)).toMatchObject({
      state: 'startup-failed',
      issue: {
        code: 'port_occupied',
        details: { host: '127.0.0.1', port },
        remediation: expect.stringContaining('WORKBENCH_PORT'),
      },
    });
    expect(stderr).toContain(`port ${port}`);
    expect(stderr).toContain('already in use');
  }, 30_000);
});
