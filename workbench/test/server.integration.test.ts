import { spawn, type ChildProcess } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';
import { createEngine, type ScriptureEngine } from '@jestek-dev/scripture-engine';
import { buildFixtureDatabase } from '../../pipeline/src/buildFixtureDb.js';
import {
  buildMachineReport,
  captureRepositoryIdentity,
  captureRunIdentity,
  GAUNTLET_GATE_ROSTER,
  parseGauntletOptions,
} from '../../eval/src/gauntletMachineReport.js';
import { buildReport } from '../../eval/src/report.js';
import { notApplicable, pass } from '../../eval/src/gates/types.js';

import { repoRoot } from '../src/descriptor.js';
import { openCorpus } from '../src/nodeSqlitePort.js';
import { compareEngines, type EngineIdentity } from '../src/comparison.js';
import { buildQualityDashboard, type QualityDashboardInput } from '../src/qualityDashboard.js';
import type { ReviewSessionCase } from '../src/reviewSessions.js';
import type { Distillate } from '../../pipeline/src/telemetry/index.js';

const children: ChildProcess[] = [];
const temporaryFiles: string[] = [];
const temporaryDirectories: string[] = [];
const engines: ScriptureEngine[] = [];
const serverOutput = new WeakMap<ChildProcess, { text: string }>();

function runningMarker(startedAt: string): object {
  const flags = parseGauntletOptions(['--require-admit']);
  return {
    schema: 'scripture-search-engine/gauntlet-running/v1',
    pid: process.pid,
    startedAt,
    identity: captureRepositoryIdentity(repoRoot, flags),
  };
}

afterEach(async () => {
  for (const child of children.splice(0)) child.kill();
  await Promise.all(engines.splice(0).map((engine) => engine.close()));
  for (const file of temporaryFiles.splice(0)) {
    try {
      unlinkSync(file);
    } catch {
      // A failed test may already have removed its temporary file.
    }
  }
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('v2 fixture compilation HTTP contracts', () => {
  it('runs an allowlisted check and refuses overlapping repository work', async () => {
    const port = await unusedPort();
    await startReviewedFixtureServer(port);
    const started = await postJson(`http://127.0.0.1:${port}/api/v2/checks`, { jobId: 'typecheck' });
    expect(started.status).toBe(202);
    const startedBody = await responseJson(started) as any;
    const runId = startedBody.data.job.runId as string;

    const overlap = await postJson(`http://127.0.0.1:${port}/api/v2/checks`, { jobId: 'test' });
    expect(overlap.status).toBe(409);
    const overlappingApply = await postJson(`http://127.0.0.1:${port}/api/v2/compile/apply`, {
      digest: '0'.repeat(64),
    });
    expect(overlappingApply.status).toBe(409);

    let job = startedBody.data.job;
    for (let attempt = 0; attempt < 300 && !['passed', 'failed', 'timed-out', 'cancelled'].includes(job.state); attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      let response: Response;
      try { response = await fetch(`http://127.0.0.1:${port}/api/v2/jobs/${runId}`); }
      catch (error) {
        const serverChild = children[0]!;
        if (serverChild.exitCode === null && serverChild.signalCode === null) continue;
        throw new Error(`job status connection failed after server exit (${serverChild.exitCode}/${serverChild.signalCode}): ${String(error)}\n${serverOutput.get(serverChild)?.text ?? ''}`);
      }
      const status = await responseJson(response) as any;
      job = status.data.job;
    }
    expect(job.state, JSON.stringify(job, null, 2)).toBe('passed');
    expect(job.command).toBe(process.execPath);
    expect(job.args[0]).toMatch(/npm-cli\.js$/);
  }, 60_000);

  it('stops admission before draining an active check during SIGTERM shutdown', async () => {
    const port = await unusedPort();
    await startReviewedFixtureServer(port);
    const child = children.at(-1)!;
    const started = await postJson(`http://127.0.0.1:${port}/api/v2/checks`, { jobId: 'typecheck' });
    expect(started.status).toBe(202);
    expect(child.kill('SIGTERM')).toBe(true);
    const late = await postJson(`http://127.0.0.1:${port}/api/v2/checks`, { jobId: 'test' }).catch(() => null);
    expect(late === null || late.status === 503).toBe(true);
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('server did not finish SIGTERM shutdown')), 20_000);
      child.once('exit', () => { clearTimeout(timer); resolve(); });
    });
    const index = children.indexOf(child);
    if (index >= 0) children.splice(index, 1);
  }, 30_000);

  it('returns the same exact preview bytes the apply endpoint installs', async () => {
    const port = await unusedPort();
    const compilationRoot = scaffoldCompilationRepo();
    await startReviewedFixtureServer(port, { WORKBENCH_REPO_ROOT: compilationRoot });

    const previewResponse = await postJson(`http://127.0.0.1:${port}/api/v2/compile/preview`, {});
    expect(previewResponse.status).toBe(200);
    const preview = await responseJson(previewResponse) as any;
    const plan = preview.data.plan;
    const fixtureOperation = plan.operations.find((operation: any) =>
      operation.path.endsWith('noisy-result.json'),
    );
    expect(fixtureOperation.afterText).toContain('"generatedBy": "workbench"');

    const applyResponse = await postJson(`http://127.0.0.1:${port}/api/v2/compile/apply`, {
      digest: plan.digest,
    });
    expect(applyResponse.status).toBe(200);
    expect(readFileSync(path.join(compilationRoot, fixtureOperation.path), 'utf8')).toBe(
      fixtureOperation.afterText,
    );

    const promotionWithoutEvidence = await postJson(
      `http://127.0.0.1:${port}/api/v2/fixtures/noisy-result/promotion/preview`,
      {},
    );
    expect(promotionWithoutEvidence.status).toBe(422);
    expect((await responseJson(promotionWithoutEvidence)).error).toMatchObject({
      code: 'promotion_preview_failed',
    });
  }, 30_000);

  it('rejects stale and malformed apply requests without writing', async () => {
    const port = await unusedPort();
    const compilationRoot = scaffoldCompilationRepo();
    await startReviewedFixtureServer(port, { WORKBENCH_REPO_ROOT: compilationRoot });

    const preview = await responseJson(
      await postJson(`http://127.0.0.1:${port}/api/v2/compile/preview`, {}),
    ) as any;
    const digest = preview.data.plan.digest as string;
    const judgmentsPath = path.join(compilationRoot, 'workbench', 'judgments.jsonl');
    writeFileSync(judgmentsPath, `${readFileSync(judgmentsPath, 'utf8')}\n`);

    const stale = await postJson(`http://127.0.0.1:${port}/api/v2/compile/apply`, { digest });
    expect(stale.status).toBe(409);
    expect((await responseJson(stale)).error).toMatchObject({ code: 'stale_preview' });
    expect(() => readFileSync(path.join(compilationRoot, 'eval', 'golden', 'noisy-result.json'))).toThrow();

    const malformed = await postJson(`http://127.0.0.1:${port}/api/v2/compile/apply`, {
      digest,
      command: 'anything',
    });
    expect(malformed.status).toBe(400);

    const injectedCheck = await postJson(`http://127.0.0.1:${port}/api/v2/checks`, {
      jobId: 'verify',
      args: ['--update-baseline'],
    });
    expect(injectedCheck.status).toBe(400);

    const plainText = await fetch(`http://127.0.0.1:${port}/api/v2/compile/preview`, {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: '{}',
    });
    expect(plainText.status).toBe(403);
    const foreignOrigin = await fetch(`http://127.0.0.1:${port}/api/v2/compile/preview`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://attacker.invalid' },
      body: '{}',
    });
    expect(foreignOrigin.status).toBe(403);
    const jsonp = await fetch(`http://127.0.0.1:${port}/api/v2/compile/preview`, {
      method: 'POST', headers: { 'content-type': 'application/jsonp' }, body: '{}',
    });
    expect(jsonp.status).toBe(403);
    const wrongScheme = await fetch(`http://127.0.0.1:${port}/api/v2/compile/preview`, {
      method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8', origin: `https://127.0.0.1:${port}` }, body: '{}',
    });
    expect(wrongScheme.status).toBe(403);
    const opaqueOrigin = await fetch(`http://127.0.0.1:${port}/api/v2/compile/preview`, {
      method: 'POST', headers: { 'content-type': 'application/json', origin: 'null' }, body: '{}',
    });
    expect(opaqueOrigin.status).toBe(403);
  }, 30_000);
});

async function unusedPort(): Promise<number> {
  const server = net.createServer();
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  const port = typeof address === 'object' && address !== null ? address.port : 0;
  await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  return port;
}

async function waitForReady(child: ChildProcess): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    let output = '';
    const timer = setTimeout(() => reject(new Error(`server startup timed out:\n${output}`)), 10_000);
    const onData = (chunk: Buffer): void => {
      output += chunk.toString('utf8');
      if (output.includes('Workbench viewer at')) {
        clearTimeout(timer);
        resolve();
      }
    };
    child.stdout?.on('data', onData);
    child.stderr?.on('data', onData);
    child.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`server exited before startup (${code}):\n${output}`));
    });
  });
}

async function startServer(
  port: number,
  databasePath: string,
  overrides: Readonly<Record<string, string>> = {},
): Promise<ChildProcess> {
  const child = spawn(process.execPath, ['--import', 'tsx', 'src/server.ts'], {
    cwd: new URL('../', import.meta.url),
    env: {
      ...process.env,
      WORKBENCH_PORT: String(port),
      WORKBENCH_DATABASE_PATH: databasePath,
      ...overrides,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  const captured = { text: '' };
  serverOutput.set(child, captured);
  child.stdout?.on('data', (chunk: Buffer) => { captured.text += chunk.toString('utf8'); });
  child.stderr?.on('data', (chunk: Buffer) => { captured.text += chunk.toString('utf8'); });
  children.push(child);
  await waitForReady(child);
  return child;
}

function sha256(file: string): string {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

async function startReviewedFixtureServer(
  port: number,
  overrides: Readonly<Record<string, string>> = {},
  descriptorOverride:
    | Readonly<Record<string, unknown>>
    | ((descriptor: Readonly<Record<string, unknown>>) => Readonly<Record<string, unknown>>) = {},
): Promise<{ readonly engine: ScriptureEngine; readonly databasePath: string }> {
  const nonce = `${process.pid}-${port}-${Date.now()}`;
  const databasePath = path.join(os.tmpdir(), `sse-workbench-fixture-${nonce}.db`);
  const descriptorPath = path.join(os.tmpdir(), `sse-workbench-descriptor-${nonce}.json`);
  temporaryFiles.push(databasePath, descriptorPath);
  buildFixtureDatabase(databasePath);

  const engine = await createEngine(openCorpus(databasePath));
  engines.push(engine);
  const descriptor = {
    schemaVersion: 'test',
    engineVersion: engine.engineVersion,
    corpusFingerprint: engine.corpusFingerprint,
    layerFingerprint: engine.layerFingerprint,
    databaseSha256: sha256(databasePath),
    databaseBytes: statSync(databasePath).size,
    translations: [],
  };
  const reviewedDescriptor = typeof descriptorOverride === 'function'
    ? descriptorOverride(descriptor)
    : { ...descriptor, ...descriptorOverride };
  writeFileSync(descriptorPath, JSON.stringify(reviewedDescriptor), 'utf8');
  await startServer(port, databasePath, { WORKBENCH_DESCRIPTOR_PATH: descriptorPath, ...overrides });
  return { engine, databasePath };
}

async function responseJson(response: Response): Promise<Record<string, unknown>> {
  return (await response.json()) as Record<string, unknown>;
}

async function postJson(url: string, body: unknown): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function blindFixtureFiles(options: { readonly blocking?: boolean } = {}): Promise<{
  readonly root: string;
  readonly fixturePath: string;
  readonly eventsPath: string;
  readonly reviewId: string;
}> {
  const root = mkdtempSync(path.join(os.tmpdir(), 'sse-blind-api-'));
  temporaryDirectories.push(root);
  const reviewId = 'review-blind-api-one';
  const referenceIdentity: EngineIdentity = { engineVersion: 'blind-test', corpusFingerprint: 'a'.repeat(64), layerFingerprint: 'layer-one' };
  const proposalIdentity: EngineIdentity = { engineVersion: 'blind-test', corpusFingerprint: 'a'.repeat(64), layerFingerprint: 'layer-two' };
  const comparisonEngine = (identity: EngineIdentity): ScriptureEngine => ({
    ...identity,
    async research(query) {
      return {
        kind: 'discovery' as const, query, ...identity,
        results: [
          { targetId: 'WEB:19046001', reference: 'Psalm 46:1', excerpt: 'God is our refuge.', score: 10, reasons: [{ family: 'concept_anchor' as const, label: 'Theme anchor', points: 10, provenance: { sourceId: 'ontology-source', label: 'Ontology', locator: 'concepts/refuge', weight: 1 } }] },
          { targetId: 'WEB:43003016', reference: 'John 3:16', excerpt: 'For God so loved.', score: 8, reasons: [{ family: 'token_overlap' as const, label: 'Word overlap', points: 8 }] },
        ],
      };
    },
    async themes() { return []; }, async passage() { throw new Error('not used'); }, async related() { throw new Error('not used'); },
    async forSong() { throw new Error('not used'); }, async close() {},
  });
  const report = await compareEngines({
    linkedCases: [{ sourceId: 'case-hope', query: 'hope' }, { sourceId: 'case-refuge', query: 'refuge' }],
    fixtureQueries: [], g8Probes: [], calibrationQueries: [], holdoutQueries: [], affectedConceptCases: [],
  }, comparisonEngine(referenceIdentity), comparisonEngine(proposalIdentity));
  const digest = (value: string): string => createHash('sha256').update(value).digest('hex');
  const fixturePath = path.join(root, 'publications.json');
  const eventsPath = path.join(root, 'blind-events.jsonl');
  writeFileSync(fixturePath, JSON.stringify({
    publications: [{
      reviewId,
      machine: {
        schemaVersion: 1,
        kind: 'scripture-search-comparison',
        binding: {
          cacheKey: digest('cache'), proposalDigest: digest('proposal'), databaseSha256: digest('database'), descriptorSha256: digest('descriptor'),
          referenceIdentity, candidateIdentity: proposalIdentity, comparisonDigest: report.digest,
        },
        report,
      },
      ...(options.blocking ? { gateFindings: [{ gateId: 'manual-gate', group: 'blocking', message: 'A required safety gate rejected this comparison.' }] } : {}),
    }],
  }), 'utf8');
  return { root, fixturePath, eventsPath, reviewId };
}

function scaffoldCompilationRepo(): string {
  const root = mkdtempSync(path.join(os.tmpdir(), 'sse-compile-api-'));
  temporaryDirectories.push(root);
  for (const directory of [
    path.join(root, 'artifacts'),
    path.join(root, 'eval', 'golden'),
    path.join(root, 'pipeline', 'fixtures'),
    path.join(root, 'workbench'),
  ]) mkdirSync(directory, { recursive: true });
  writeFileSync(
    path.join(root, 'artifacts', 'content-artifact.json'),
    `${JSON.stringify({ layerFingerprint: 'api-layer' }, null, 2)}\n`,
  );
  writeFileSync(
    path.join(root, 'pipeline', 'fixtures', 'web-subset.json'),
    `${JSON.stringify({ selection: [{ book: 'James', chapters: [1], why: 'test' }], verses: [] }, null, 2)}\n`,
  );
  writeFileSync(
    path.join(root, 'workbench', 'judgments.jsonl'),
    `${JSON.stringify({
      at: '2026-08-11T00:00:00.000Z',
      reviewer: 'api-reviewer',
      query: 'noisy result',
      verdict: 'doesnt-fit',
      targetId: 'WEB:59001022',
      cause: 'lexical-noise',
      engineVersion: '0.9.0',
      corpusFingerprint: 'api-corpus',
      layerFingerprint: 'api-layer',
    })}\n`,
  );
  return root;
}

async function stopServer(child: ChildProcess): Promise<void> {
  child.kill();
  await new Promise<void>((resolve) => child.once('exit', () => resolve()));
  const index = children.indexOf(child);
  if (index >= 0) children.splice(index, 1);
}

function freshGauntletReport(reportPath: string): object {
  const baseline = JSON.parse(readFileSync(new URL('../../eval/baselines/probes.json', import.meta.url), 'utf8')) as {
    engineVersion: string;
    corpusFingerprint: string;
    layerFingerprint: string;
  };
  const relativeReportPath = path.relative(repoRoot, reportPath).replaceAll('\\', '/');
  const options = parseGauntletOptions(['--require-admit', '--json', relativeReportPath]);
  const report = buildReport({
    gates: GAUNTLET_GATE_ROSTER.map((definition) =>
      definition.applicability === 'optional-advisory'
        ? notApplicable(definition.id, definition.title, 'not requested')
        : pass(definition.id, definition.title, 'test gate passed'),
    ),
  });
  const at = new Date().toISOString();
  return buildMachineReport({
    startedAt: at,
    finishedAt: at,
    identity: captureRunIdentity(repoRoot, options, baseline),
    report,
  });
}

describe('v2 blind candidate comparison HTTP contracts', () => {
  it('keeps pre-reveal responses anonymous, resumes durably, and reveals only after append', async () => {
    const port = await unusedPort();
    const fixture = await blindFixtureFiles();
    await startReviewedFixtureServer(port, {
      WORKBENCH_BLIND_FIXTURES_PATH: fixture.fixturePath,
      WORKBENCH_BLIND_EVENTS_PATH: fixture.eventsPath,
      WORKBENCH_BLIND_LOCK_ROOT: fixture.root,
    });
    const origin = `http://127.0.0.1:${port}`;

    const listed = await responseJson(await fetch(`${origin}/api/v2/candidates`)) as any;
    expect(listed.data.reviews).toEqual([expect.objectContaining({ reviewId: fixture.reviewId, queryCount: 2, status: 'not-started' })]);

    const startedResponse = await postJson(`${origin}/api/v2/candidates/${fixture.reviewId}/blind-sessions`, { requestId: 'request-api-start-0001' });
    expect(startedResponse.status).toBe(201);
    let view = (await responseJson(startedResponse) as any).data.session;
    const preRevealWire = JSON.stringify(view).toLowerCase();
    for (const secret of ['candidateidentity', 'referenceidentity', 'cachekey', 'layerfingerprint', 'seed', 'assignment', 'originalorder']) {
      expect(preRevealWire).not.toContain(secret);
    }
    expect(view.queries.every((query: any) => query.judgment === null && query.reveal === undefined)).toBe(true);

    const passage = await responseJson(await fetch(
      `${origin}/api/v2/candidates/${fixture.reviewId}/blind-sessions/${view.sessionId}/passages?queryId=${view.queries[0].queryId}&passageId=${view.queries[0].sides.a[0].passageId}`,
    )) as any;
    expect(passage.data).toMatchObject({ reference: expect.any(String), contextReference: expect.any(String), verses: expect.any(Array) });
    expect(JSON.stringify(passage.data)).not.toMatch(/engineVersion|corpusFingerprint|layerFingerprint|cacheKey|candidateIdentity|referenceIdentity/);

    const resumed = await responseJson(await fetch(`${origin}/api/v2/candidates/${fixture.reviewId}/blind-sessions/${view.sessionId}`)) as any;
    expect(resumed.data.session.queries).toEqual(view.queries);
    const repeatedStart = await responseJson(await postJson(`${origin}/api/v2/candidates/${fixture.reviewId}/blind-sessions`, { requestId: 'request-api-resume-0001' })) as any;
    expect(repeatedStart.data.session.sessionId).toBe(view.sessionId);
    expect(repeatedStart.data.session.queries).toEqual(view.queries);

    const firstQuery = view.queries[0];
    const missingBody = {
      requestId: 'request-api-missing-0001', revision: view.revision, stateDigest: view.stateDigest,
      queryId: firstQuery.queryId, reference: 'Romans 8:28', note: 'Expected passage',
    };
    const missing = await postJson(`${origin}/api/v2/candidates/${fixture.reviewId}/blind-sessions/${view.sessionId}/missing-passages`, missingBody);
    expect(missing.status).toBe(201);
    view = (await responseJson(missing) as any).data.session;
    expect(view.progress.reviewed).toBe(0);
    expect(view.queries.find((query: any) => query.queryId === firstQuery.queryId).missingPassages).toHaveLength(1);

    const judgmentBody = {
      requestId: 'request-api-judge-0001', revision: view.revision, stateDigest: view.stateDigest,
      queryId: firstQuery.queryId, choice: 'a-wins',
    };
    const judged = await postJson(`${origin}/api/v2/candidates/${fixture.reviewId}/blind-sessions/${view.sessionId}/judgments`, judgmentBody);
    expect(judged.status).toBe(201);
    view = (await responseJson(judged) as any).data.session;
    const revealed = view.queries.find((query: any) => query.queryId === firstQuery.queryId);
    expect(revealed.judgment.choice).toBe('a-wins');
    expect(revealed.reveal).toMatchObject({ sideA: expect.stringMatching(/Current|Candidate/), sideB: expect.stringMatching(/Current|Candidate/) });

    const replay = await postJson(`${origin}/api/v2/candidates/${fixture.reviewId}/blind-sessions/${view.sessionId}/judgments`, judgmentBody);
    expect(replay.status).toBe(201);
    expect((await responseJson(replay) as any).data.session.revision).toBe(view.revision);
    expect(readFileSync(fixture.eventsPath, 'utf8').trim().split('\n')).toHaveLength(3);

    const stale = await postJson(`${origin}/api/v2/candidates/${fixture.reviewId}/blind-sessions/${view.sessionId}/judgments`, {
      requestId: 'request-api-stale-0001', revision: 0, stateDigest: '0'.repeat(64), queryId: view.queries[1].queryId, choice: 'tie',
    });
    expect(stale.status).toBe(409);
    expect((await responseJson(stale)).error).toMatchObject({ code: 'stale_session' });

    const getMutation = await fetch(`${origin}/api/v2/candidates/${fixture.reviewId}/blind-sessions/${view.sessionId}/judgments`);
    expect(getMutation.status).toBe(405);
    const hostile = await fetch(`${origin}/api/v2/candidates/${fixture.reviewId}/blind-sessions/${view.sessionId}/judgments`, {
      method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://attacker.invalid' }, body: JSON.stringify(judgmentBody),
    });
    expect(hostile.status).toBe(403);
  }, 30_000);

  it('requires every query judgment and preserves independent blocking gate rejection', async () => {
    const port = await unusedPort();
    const fixture = await blindFixtureFiles({ blocking: true });
    await startReviewedFixtureServer(port, {
      WORKBENCH_BLIND_FIXTURES_PATH: fixture.fixturePath,
      WORKBENCH_BLIND_EVENTS_PATH: fixture.eventsPath,
      WORKBENCH_BLIND_LOCK_ROOT: fixture.root,
    });
    const origin = `http://127.0.0.1:${port}`;
    let view = (await responseJson(await postJson(`${origin}/api/v2/candidates/${fixture.reviewId}/blind-sessions`, { requestId: 'request-gate-start-0001' })) as any).data.session;
    expect(view.gateGroups.blocking).toHaveLength(1);
    expect(view.admission.enabled).toBe(false);
    for (const query of view.queries) {
      view = (await responseJson(await postJson(`${origin}/api/v2/candidates/${fixture.reviewId}/blind-sessions/${view.sessionId}/judgments`, {
        requestId: `request-gate-${query.queryId}`, revision: view.revision, stateDigest: view.stateDigest, queryId: query.queryId, choice: 'tie',
      })) as any).data.session;
    }
    expect(view.progress.complete).toBe(true);
    expect(view.admission.enabled).toBe(false);
    expect(view.admission.blockers.join(' ')).toMatch(/blocking gate/i);
  }, 30_000);

  it('keeps candidate review mutations disabled during degraded startup', async () => {
    const port = await unusedPort();
    const fixture = await blindFixtureFiles();
    await startServer(port, path.join(os.tmpdir(), `missing-blind-artifact-${process.pid}-${port}.db`), {
      WORKBENCH_BLIND_FIXTURES_PATH: fixture.fixturePath,
      WORKBENCH_BLIND_EVENTS_PATH: fixture.eventsPath,
      WORKBENCH_BLIND_LOCK_ROOT: fixture.root,
    });
    const origin = `http://127.0.0.1:${port}`;
    const listed = await fetch(`${origin}/api/v2/candidates`);
    expect(listed.status).toBe(200);
    expect((await responseJson(listed) as any).data.readOnly).toBe(true);
    const blocked = await postJson(`${origin}/api/v2/candidates/${fixture.reviewId}/blind-sessions`, { requestId: 'request-degraded-0001' });
    expect(blocked.status).toBe(503);
    expect((await responseJson(blocked)).error).toMatchObject({ code: 'startup_degraded_read_only' });
    expect(() => readFileSync(fixture.eventsPath, 'utf8')).toThrow();
  }, 30_000);
});

function studioQualityReport(engine: ScriptureEngine) {
  const candidate = { artifactId: 'studio-candidate', descriptorSha256: 'a'.repeat(64), engineVersion: engine.engineVersion, corpusFingerprint: engine.corpusFingerprint, layerFingerprint: engine.layerFingerprint };
  const reference = { artifactId: 'studio-reference', descriptorSha256: 'b'.repeat(64), engineVersion: 'studio-reference-engine', corpusFingerprint: 'c'.repeat(64), layerFingerprint: 'd'.repeat(64) };
  const scope = { artifact: candidate, reviewCycleId: 'studio-cycle' };
  const observation = (recordId: string, caseId: string, partition: 'calibration' | 'holdout') => ({ recordId, caseId, partition, essentialTargetIds: ['A'], irrelevantTargetIds: ['X'], currentTop10TargetIds: ['A'], candidateTop10TargetIds: ['A'], ...scope });
  const input: QualityDashboardInput = {
    schemaVersion: 1, artifact: candidate, referenceArtifact: reference, reviewCycle: { cycleId: 'studio-cycle' }, observedAt: '2026-08-11T12:00:00.000Z', sparseSampleThreshold: 2,
    benchmarkObservations: [observation('cal-a', 'cal-case-a', 'calibration'), observation('cal-b', 'cal-case-b', 'calibration'), observation('hold-a', 'holdout-network-canary-a', 'holdout'), observation('hold-b', 'holdout-network-canary-b', 'holdout')],
    blindComparisons: [], telemetryAggregates: [], coverageRecords: [], caseLifecycles: [], admissions: [],
    requiredGateEvaluations: [
      { recordId: 'gate-cal', gateId: 'cal-gate', partition: 'calibration', required: true, currentPass: true, candidatePass: true, ...scope },
      { recordId: 'gate-hold', gateId: 'hold-gate', partition: 'holdout', required: true, currentPass: true, candidatePass: false, ...scope },
    ],
    artifactGenealogy: [
      { artifact: reference, reviewCycleId: 'reference-cycle', observedAt: '2026-08-01T12:00:00.000Z', parent: null },
      { artifact: candidate, reviewCycleId: 'studio-cycle', observedAt: '2026-08-11T12:00:00.000Z', parent: { artifact: reference, reviewCycleId: 'reference-cycle' } },
    ], trendHistory: [],
  };
  return buildQualityDashboard(input);
}

function studioApiFixture(engine: ScriptureEngine) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'sse-studio-api-'));
  temporaryDirectories.push(root);
  const sessionCasesPath = path.join(root, 'session-cases.json');
  const qualityPath = path.join(root, 'quality.json');
  const policyPath = path.join(root, 'policy.json');
  const createdAt = '2026-07-01T12:00:00.000Z';
  const cases: ReviewSessionCase[] = [
    { caseId: 'case-studio-a', query: 'hope in God', source: 'manual', outcomeClass: 'failure', deviceCount: 2, convertedRank: 4, recurrence: 1, createdAt },
    { caseId: 'case-studio-b', query: 'refuge in trouble', source: 'coverage', outcomeClass: 'ambiguous', deviceCount: 1, convertedRank: null, recurrence: 1, createdAt },
    { caseId: 'case-studio-c', query: 'hearing and doing', source: 'gauntlet', outcomeClass: 'regressed', deviceCount: 3, convertedRank: 8, recurrence: 2, createdAt },
    { caseId: 'holdout-api-secret-a', query: 'private benchmark alpha', source: 'manual', outcomeClass: 'failure', deviceCount: 0, convertedRank: null, recurrence: 1, createdAt, holdout: true },
    { caseId: 'holdout-api-secret-b', query: 'private benchmark beta', source: 'manual', outcomeClass: 'failure', deviceCount: 0, convertedRank: null, recurrence: 1, createdAt, holdout: true },
  ];
  writeFileSync(sessionCasesPath, JSON.stringify(cases));
  writeFileSync(qualityPath, JSON.stringify(studioQualityReport(engine)));
  writeFileSync(policyPath, JSON.stringify({ budgets: { minDistinctDevices: 2, rawRetentionDays: 90, weakConvertedRank: 3 }, categories: { v: 1, categories: [{ id: 'private', entries: [{ phrase: 'sensitive audit response canary' }] }] } }));
  const row = (query: string) => ({ query, identity: { engineVersion: engine.engineVersion, corpusFingerprint: engine.corpusFingerprint, layerFingerprint: engine.layerFingerprint }, outcomes: { empty: 0, abandoned: 1, converted: 0 }, conversions: [] });
  const distillate = (token: string, includePrivate: boolean): Distillate => ({ v: 1, app: 'maskil', period: '2026-Q3', token, queries: [row('approved studio aggregate'), ...(includePrivate ? [row('below threshold audit response canary'), row('sensitive audit response canary')] : [])], pairs: [] });
  const upload = (filename: string, value: Distillate) => { const bytes = Buffer.from(JSON.stringify(value)); return { filename, size: bytes.length, contentBase64: bytes.toString('base64') }; };
  return { root, sessionCasesPath, qualityPath, policyPath, files: [upload('one.json', distillate('opaque-token-one', true)), upload('two.json', distillate('opaque-token-two', false))] };
}

describe('v2 integrated Studio HTTP contracts', () => {
  it('runs audit, session, and redacted quality lifecycles through strict localhost APIs', async () => {
    const port = await unusedPort();
    const first = await startReviewedFixtureServer(port);
    const fixture = studioApiFixture(first.engine);
    const firstChild = children.pop()!;
    firstChild.kill();
    await new Promise<void>((resolve) => firstChild.once('exit', () => resolve()));
    await startReviewedFixtureServer(port, { WORKBENCH_REPO_ROOT: fixture.root, WORKBENCH_STUDIO_SESSION_CASES_PATH: fixture.sessionCasesPath, WORKBENCH_STUDIO_QUALITY_REPORT_PATH: fixture.qualityPath, WORKBENCH_STUDIO_AUDIT_POLICY_PATH: fixture.policyPath });
    const origin = `http://127.0.0.1:${port}`;

    const qualityResponse = await fetch(`${origin}/api/v2/quality`);
    const quality = await responseJson(qualityResponse) as any;
    expect(qualityResponse.status).toBe(200);
    expect(quality.data.quality.candidateImprovement).toMatchObject({ blocked: true });
    expect(JSON.stringify(quality)).not.toContain('holdout-network-canary');
    expect(JSON.stringify(quality)).not.toContain('authorizedReportDigest');

    const startedResponse = await postJson(`${origin}/api/v2/sessions`, { kind: 'weekly-triage', reviewedSize: 2, seed: 'studio-seed', reviewer: 'api-reviewer', qualifiedReviewer: false });
    const startedBody = await responseJson(startedResponse) as any;
    expect(startedResponse.status, `${JSON.stringify(startedBody)}\n${serverOutput.get(children.at(-1)!)?.text ?? ''}`).toBe(201);
    let session = startedBody.data.session;
    const [firstItem, secondItem] = session.queue.map((item: any) => item.itemId);
    session = (await responseJson(await postJson(`${origin}/api/v2/sessions/${session.sessionId}/skip-item`, { requestId: 'skip:00000000-0000-4000-8000-000000000001', expectedRevision: session.revision, expectedDigest: session.digest, itemId: firstItem, reason: 'needs-context', requeue: 'next-session' })) as any).data.session;
    session = (await responseJson(await postJson(`${origin}/api/v2/sessions/${session.sessionId}/complete-item`, { requestId: 'done:00000000-0000-4000-8000-000000000002', expectedRevision: session.revision, expectedDigest: session.digest, itemId: secondItem })) as any).data.session;
    session = (await responseJson(await postJson(`${origin}/api/v2/sessions/${session.sessionId}/complete-session`, { requestId: 'close:00000000-0000-4000-8000-000000000003', expectedRevision: session.revision, expectedDigest: session.digest })) as any).data.session;
    expect(session).toMatchObject({ status: 'completed', progress: { handled: 2, remaining: 0 } });
    expect(JSON.stringify(await responseJson(await fetch(`${origin}/api/v2/sessions`)))).not.toContain('holdout-api-secret');

    const previewResponse = await postJson(`${origin}/api/v2/audits/preview`, { files: fixture.files });
    expect(previewResponse.status).toBe(200);
    const preview = (await responseJson(previewResponse) as any).data.audit;
    const previewText = JSON.stringify(preview);
    expect(preview).toMatchObject({ status: 'ready', revision: 0, opaqueTokenCount: 2 });
    for (const privateValue of ['below threshold audit response canary', 'sensitive audit response canary', 'opaque-token']) expect(previewText).not.toContain(privateValue);
    const applyBody = { auditDigest: preview.auditDigest, previewDigest: preview.previewDigest, expectedRevision: 0 };
    const applied = (await responseJson(await postJson(`${origin}/api/v2/audits/apply`, applyBody)) as any).data.audit;
    expect((await responseJson(await postJson(`${origin}/api/v2/audits/apply`, applyBody)) as any).data.audit).toMatchObject({ status: 'applied', idempotent: true });
    const closeBody = { auditDigest: applied.auditDigest, previewDigest: applied.previewDigest, expectedRevision: 1 };
    expect((await responseJson(await postJson(`${origin}/api/v2/audits/close`, closeBody)) as any).data.audit).toMatchObject({ status: 'closed', dumpDeleted: true });
    expect((await responseJson(await postJson(`${origin}/api/v2/audits/close`, closeBody)) as any).data.audit).toMatchObject({ status: 'closed', idempotent: true });
    const hostile = await fetch(`${origin}/api/v2/audits/preview`, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://attacker.invalid' }, body: JSON.stringify({ files: fixture.files }) });
    expect(hostile.status).toBe(403);
  }, 60_000);
});

describe('degraded workbench server', () => {
  it('binds health while artifact-dependent APIs fail closed', async () => {
    const port = await unusedPort();
    await startServer(port, path.join(os.tmpdir(), `missing-workbench-${process.pid}.db`));

    const healthResponse = await fetch(`http://127.0.0.1:${port}/api/v2/health`);
    expect(healthResponse.status).toBe(200);
    const health = (await healthResponse.json()) as {
      readonly ok: true;
      readonly data: {
        readonly schemaVersion: number;
        readonly status: string;
        readonly artifact: { readonly identity: unknown };
      };
    };
    expect(health).toMatchObject({ ok: true, data: { schemaVersion: 1, status: 'unavailable' } });
    expect(health.data.artifact.identity).toBeNull();

    const searchResponse = await fetch(`http://127.0.0.1:${port}/api/search?q=hope`);
    expect(searchResponse.status).toBe(503);
  }, 15_000);

  it('binds health when an artifact exists but fails its reviewed hash', async () => {
    const port = await unusedPort();
    const wrongArtifact = path.join(os.tmpdir(), `wrong-workbench-${process.pid}-${port}.db`);
    writeFileSync(wrongArtifact, 'not the reviewed sqlite artifact', 'utf8');
    temporaryFiles.push(wrongArtifact);
    await startServer(port, wrongArtifact);

    const healthResponse = await fetch(`http://127.0.0.1:${port}/api/v2/health`);
    const health = (await healthResponse.json()) as { readonly ok: true; readonly data: { readonly status: string } };
    expect(healthResponse.status).toBe(200);
    expect(health.data.status).toBe('unavailable');

    const conceptsResponse = await fetch(`http://127.0.0.1:${port}/api/concepts`);
    expect(conceptsResponse.status).toBe(503);
  }, 15_000);

  it('fails closed when the descriptor is malformed', async () => {
    const port = await unusedPort();
    await startReviewedFixtureServer(port, {}, { translations: null });

    const health = await responseJson(await fetch(`http://127.0.0.1:${port}/api/v2/health`));
    expect(health).toMatchObject({ ok: true, data: { status: 'unavailable', artifact: { identity: null } } });
    expect((health.data as { startup: { diagnostics: readonly string[] } }).startup.diagnostics.join(' ')).toContain(
      'Invalid artifact descriptor',
    );
    expect((await fetch(`http://127.0.0.1:${port}/api/search?q=hope`)).status).toBe(503);
  }, 60_000);

  it('fails closed when an opened artifact does not match descriptor identity', async () => {
    const port = await unusedPort();
    await startReviewedFixtureServer(port, {}, (descriptor) => ({
      ...descriptor,
      engineVersion: `mismatch-${String(descriptor['engineVersion'])}`,
    }));

    const health = await responseJson(await fetch(`http://127.0.0.1:${port}/api/v2/health`));
    expect(health).toMatchObject({ ok: true, data: { status: 'unavailable', artifact: { identity: null } } });
    expect((health.data as { startup: { diagnostics: readonly string[] } }).startup.diagnostics.join(' ')).toContain(
      'Artifact identity mismatch',
    );
    expect((await fetch(`http://127.0.0.1:${port}/api/meta`)).status).toBe(503);
  }, 60_000);

  it('binds a safe fallback page when the static snapshot is missing', async () => {
    const port = await unusedPort();
    const missingPage = path.join(os.tmpdir(), `missing-workbench-page-${process.pid}-${port}.html`);
    await startServer(port, path.join(os.tmpdir(), `missing-workbench-${process.pid}-${port}.db`), {
      WORKBENCH_STATIC_PAGE_PATH: missingPage,
    });

    const page = await fetch(`http://127.0.0.1:${port}/`);
    expect(page.status).toBe(200);
    expect(await page.text()).toContain('Workbench unavailable');

    const health = await responseJson(await fetch(`http://127.0.0.1:${port}/api/v2/health`));
    expect(health).toMatchObject({ ok: true, data: { startup: { degraded: true } } });
    expect((health.data as { startup: { diagnostics: readonly string[] } }).startup.diagnostics.join(' ')).toContain('static page');
  }, 15_000);

  it('binds health when a matching-hash artifact cannot be opened as SQLite', async () => {
    const port = await unusedPort();
    const invalidDatabase = path.join(os.tmpdir(), `invalid-workbench-${process.pid}-${port}.db`);
    const descriptor = path.join(os.tmpdir(), `invalid-workbench-descriptor-${process.pid}-${port}.json`);
    writeFileSync(invalidDatabase, 'not sqlite', 'utf8');
    writeFileSync(descriptor, JSON.stringify({
      schemaVersion: 'test',
      engineVersion: '0.9.0',
      corpusFingerprint: '0'.repeat(64),
      layerFingerprint: '1'.repeat(64),
      databaseSha256: sha256(invalidDatabase),
      databaseBytes: statSync(invalidDatabase).size,
      translations: [],
    }), 'utf8');
    temporaryFiles.push(invalidDatabase, descriptor);
    await startServer(port, invalidDatabase, { WORKBENCH_DESCRIPTOR_PATH: descriptor });

    const health = await responseJson(await fetch(`http://127.0.0.1:${port}/api/v2/health`));
    expect(health).toMatchObject({ ok: true, data: { status: 'unavailable', startup: { degraded: true } } });
    expect((health.data as { startup: { diagnostics: readonly string[] } }).startup.diagnostics.join(' ')).toContain('preflight failed');
  }, 15_000);

  it('keeps the v2 health surface GET-only and envelopes every routing error', async () => {
    const port = await unusedPort();
    await startServer(port, path.join(os.tmpdir(), `missing-workbench-${process.pid}-${port}.db`));

    const methodNotAllowed = await fetch(`http://127.0.0.1:${port}/api/v2/health`, { method: 'POST' });
    expect(methodNotAllowed.status).toBe(405);
    expect(await responseJson(methodNotAllowed)).toEqual({
      ok: false,
      error: { code: 'method_not_allowed', message: 'Only GET is allowed for /api/v2/health.' },
    });

    const notFound = await fetch(`http://127.0.0.1:${port}/api/v2/nope`);
    expect(notFound.status).toBe(404);
    expect(await responseJson(notFound)).toEqual({
      ok: false,
      error: { code: 'not_found', message: 'Unknown /api/v2/ endpoint.' },
    });
  }, 15_000);

  it('lets only a live, current, identity-bound marker override a fresh report', async () => {
    const marker = path.join(os.tmpdir(), `gauntlet-running-${process.pid}.json`);
    const reportPath = path.join(repoRoot, 'eval', '.runs', `sse-fresh-gauntlet-${process.pid}-${Date.now()}.json`);
    temporaryFiles.push(marker, reportPath);
    writeFileSync(reportPath, JSON.stringify(freshGauntletReport(reportPath)), 'utf8');

    writeFileSync(marker, JSON.stringify(runningMarker(new Date().toISOString())), 'utf8');
    const runningPort = await unusedPort();
    await startReviewedFixtureServer(runningPort, {
      WORKBENCH_GAUNTLET_RUNNING_PATH: marker,
      WORKBENCH_GAUNTLET_REPORT_PATH: reportPath,
    });
    const running = await responseJson(await fetch(`http://127.0.0.1:${runningPort}/api/v2/health`));
    expect(running, JSON.stringify(running, null, 2)).toMatchObject({ ok: true, data: { status: 'running', gauntlet: { status: 'running' } } });

    writeFileSync(marker, JSON.stringify(runningMarker('2000-01-01T00:00:00.000Z')), 'utf8');
    const stalePort = await unusedPort();
    await startReviewedFixtureServer(stalePort, {
      WORKBENCH_GAUNTLET_RUNNING_PATH: marker,
      WORKBENCH_GAUNTLET_REPORT_PATH: reportPath,
    });
    const stale = await responseJson(await fetch(`http://127.0.0.1:${stalePort}/api/v2/health`));
    expect(stale).toMatchObject({ ok: true, data: { gauntlet: { status: 'healthy' } } });

    const valid = runningMarker(new Date().toISOString()) as {
      readonly identity: Record<string, unknown>;
    };
    writeFileSync(marker, JSON.stringify({
      ...valid,
      identity: { ...valid.identity, dirtyTreeSha256: '0'.repeat(64) },
    }), 'utf8');
    const forgedPort = await unusedPort();
    await startReviewedFixtureServer(forgedPort, {
      WORKBENCH_GAUNTLET_RUNNING_PATH: marker,
      WORKBENCH_GAUNTLET_REPORT_PATH: reportPath,
    });
    const forged = await responseJson(await fetch(`http://127.0.0.1:${forgedPort}/api/v2/health`));
    expect(forged).toMatchObject({ ok: true, data: { gauntlet: { status: 'healthy' } } });

    writeFileSync(marker, JSON.stringify({ ...valid, pid: process.pid + 1 }), 'utf8');
    const pidMismatchPort = await unusedPort();
    await startReviewedFixtureServer(pidMismatchPort, {
      WORKBENCH_GAUNTLET_RUNNING_PATH: marker,
      WORKBENCH_GAUNTLET_REPORT_PATH: reportPath,
    });
    const pidMismatch = await responseJson(await fetch(`http://127.0.0.1:${pidMismatchPort}/api/v2/health`));
    expect(pidMismatch).toMatchObject({ ok: true, data: { gauntlet: { status: 'healthy' } } });
  }, 60_000);

  it('keeps digest-tampered reports rejected when no live marker exists', async () => {
    const tampered = path.join(repoRoot, 'eval', '.runs', `sse-tampered-${process.pid}-${Date.now()}.json`);
    const current = freshGauntletReport(tampered) as Record<string, unknown>;
    writeFileSync(tampered, JSON.stringify({ ...current, reportSha256: '0'.repeat(64) }), 'utf8');
    temporaryFiles.push(tampered);
    const rejectedPort = await unusedPort();
    await startReviewedFixtureServer(rejectedPort, {
      WORKBENCH_GAUNTLET_RUNNING_PATH: `${tampered}.missing`,
      WORKBENCH_GAUNTLET_REPORT_PATH: tampered,
    });
    const rejected = await responseJson(await fetch(`http://127.0.0.1:${rejectedPort}/api/v2/health`));
    expect(rejected, JSON.stringify(rejected, null, 2)).toMatchObject({ ok: true, data: { status: 'rejected', gauntlet: { status: 'rejected' } } });
  }, 60_000);
});

describe('legacy HTTP contracts', () => {
  it('returns search and passage results byte-for-object from the engine without a v2 envelope', async () => {
    const port = await unusedPort();
    const { engine } = await startReviewedFixtureServer(port);

    const expectedSearch = await engine.research('hope');
    const search = await fetch(`http://127.0.0.1:${port}/api/search?q=hope`);
    expect(search.status).toBe(200);
    expect(await search.json()).toEqual(expectedSearch);

    const expectedPassage = await engine.passage('Psalm 46:1');
    const passage = await fetch(`http://127.0.0.1:${port}/api/passage?ref=${encodeURIComponent('Psalm 46:1')}`);
    expect(passage.status).toBe(200);
    expect(await passage.json()).toEqual(expectedPassage);
  }, 60_000);
});

describe('v2 review HTTP contracts', () => {
  it('classifies malformed and oversized case bodies as client errors', async () => {
    const port = await unusedPort();
    const casesPath = path.join(os.tmpdir(), `sse-bad-body-cases-${process.pid}-${port}.jsonl`);
    const judgmentsPath = path.join(os.tmpdir(), `sse-bad-body-judgments-${process.pid}-${port}.jsonl`);
    temporaryFiles.push(casesPath, judgmentsPath);
    await startReviewedFixtureServer(port, {
      WORKBENCH_CASES_PATH: casesPath,
      WORKBENCH_JUDGMENTS_PATH: judgmentsPath,
    });

    const malformed = await fetch(`http://127.0.0.1:${port}/api/v2/cases`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{not-json',
    });
    expect(malformed.status).toBe(400);
    expect(await responseJson(malformed)).toMatchObject({ ok: false, error: { code: 'bad_request' } });

    const oversized = await postJson(`http://127.0.0.1:${port}/api/v2/cases`, {
      query: 'x'.repeat(65 * 1024),
      source: 'manual',
    });
    expect(oversized.status).toBe(400);
    expect(await responseJson(oversized)).toEqual({
      ok: false,
      error: { code: 'bad_request', message: 'Request body too large.' },
    });
    expect(() => readFileSync(casesPath)).toThrow();
  }, 60_000);

  it('creates a review case, stamps immutable evidence, and returns filtered history', async () => {
    const port = await unusedPort();
    const nonce = `${process.pid}-${port}-${Date.now()}`;
    const casesPath = path.join(os.tmpdir(), `sse-cases-${nonce}.jsonl`);
    const judgmentsPath = path.join(os.tmpdir(), `sse-judgments-${nonce}.jsonl`);
    temporaryFiles.push(casesPath, judgmentsPath);
    await startReviewedFixtureServer(port, {
      WORKBENCH_CASES_PATH: casesPath,
      WORKBENCH_JUDGMENTS_PATH: judgmentsPath,
      WORKBENCH_GAUNTLET_REPORT_PATH: `${casesPath}.missing-report`,
      WORKBENCH_REVIEWER: 'api-reviewer',
    });

    const createdResponse = await postJson(`http://127.0.0.1:${port}/api/v2/cases`, {
      query: 'hope',
      source: 'manual',
    });
    expect(createdResponse.status).toBe(201);
    const created = await responseJson(createdResponse) as {
      ok: true;
      data: {
        case: { caseId: string; query: string };
        review: {
          token: string;
          resultSetDigest: string;
          displayedWindowDigest: string;
          result: { kind: string; results: { targetId: string; reference: string }[] };
        };
      };
    };
    expect(created).toMatchObject({ ok: true, data: { case: { query: 'hope' }, review: { freshness: 'fresh' } } });
    expect(created.data.review.resultSetDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(created.data.review.displayedWindowDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(created.data.review.result.kind).toBe('discovery');
    const firstResult = created.data.review.result.results[0]!;
    const targetId = firstResult.targetId;
    const context = await responseJson(await fetch(
      `http://127.0.0.1:${port}/api/v2/context?ref=${encodeURIComponent(firstResult.reference)}`,
    )) as { data: { context: { kind: string; passage: { verses: unknown[] } } } };
    expect(context.data.context.kind).toBe('passage');
    expect(context.data.context.passage.verses.length).toBeGreaterThan(1);

    const reviewing = await postJson(
      `http://127.0.0.1:${port}/api/v2/cases/${created.data.case.caseId}/state`,
      { state: 'reviewing' },
    );
    expect(reviewing.status).toBe(200);
    expect(await responseJson(reviewing)).toMatchObject({ ok: true, data: { case: { state: 'reviewing' } } });
    const inbox = await responseJson(await fetch(`http://127.0.0.1:${port}/api/v2/inbox`));
    expect(inbox).toMatchObject({
      ok: true,
      data: {
        items: [{
          kind: 'case',
          case: { caseId: created.data.case.caseId, query: 'hope', state: 'reviewing' },
          resultCount: expect.any(Number),
          reason: expect.stringContaining('days old'),
        }],
      },
    });

    const forged = await postJson(`http://127.0.0.1:${port}/api/v2/judgments`, {
      caseId: created.data.case.caseId,
      snapshotToken: created.data.review.token,
      action: 'helpful',
      targetId,
      observedRank: 99,
    });
    expect(forged.status).toBe(400);
    expect(await responseJson(forged)).toMatchObject({
      ok: false,
      error: { code: 'validation_failed', message: expect.stringContaining('stamped by the server') },
    });

    const acceptedResponse = await postJson(`http://127.0.0.1:${port}/api/v2/judgments`, {
      caseId: created.data.case.caseId,
      snapshotToken: created.data.review.token,
      action: 'helpful',
      targetId,
    });
    expect(acceptedResponse.status).toBe(201);
    const accepted = await responseJson(acceptedResponse) as {
      data: { judgment: Record<string, unknown> };
    };
    expect(accepted.data.judgment).toMatchObject({
      schemaVersion: 2,
      caseId: created.data.case.caseId,
      query: 'hope',
      reviewer: 'api-reviewer',
      action: 'helpful',
      targetId,
      observedRank: 1,
      resultSetDigest: created.data.review.resultSetDigest,
      displayedWindowDigest: created.data.review.displayedWindowDigest,
    });
    expect(accepted.data.judgment).not.toHaveProperty('snapshotToken');

    const correctionResponse = await postJson(`http://127.0.0.1:${port}/api/v2/judgments`, {
      caseId: created.data.case.caseId,
      snapshotToken: created.data.review.token,
      action: 'essential',
      targetId,
      withinTop: 1,
      supersedes: accepted.data.judgment.judgmentId,
    });
    expect(correctionResponse.status).toBe(201);
    const correction = await responseJson(correctionResponse) as { data: { judgment: Record<string, unknown> } };
    expect(correction.data.judgment).toMatchObject({
      action: 'essential',
      supersedes: accepted.data.judgment.judgmentId,
      withinTop: 1,
    });

    const judged = await postJson(
      `http://127.0.0.1:${port}/api/v2/cases/${created.data.case.caseId}/state`,
      { state: 'judged' },
    );
    expect(judged.status).toBe(200);
    expect(await responseJson(judged)).toMatchObject({ ok: true, data: { case: { state: 'judged' } } });
    const repeated = await postJson(
      `http://127.0.0.1:${port}/api/v2/cases/${created.data.case.caseId}/state`,
      { state: 'judged' },
    );
    expect(repeated.status).toBe(409);

    const cases = await responseJson(await fetch(`http://127.0.0.1:${port}/api/v2/cases`));
    expect(cases).toMatchObject({ ok: true, data: { cases: [{ caseId: created.data.case.caseId, query: 'hope', state: 'judged' }] } });
    const history = await responseJson(await fetch(
      `http://127.0.0.1:${port}/api/v2/judgments?caseId=${created.data.case.caseId}`,
    ));
    expect(history).toMatchObject({
      ok: true,
      data: {
        caseId: created.data.case.caseId,
        judgments: [
          { judgmentId: accepted.data.judgment.judgmentId },
          { judgmentId: correction.data.judgment.judgmentId, supersedes: accepted.data.judgment.judgmentId },
        ],
      },
    });
    expect(readFileSync(judgmentsPath, 'utf8').trim().split('\n')).toHaveLength(2);
  }, 60_000);

  it('requires a newly captured snapshot after restart before accepting a judgment', async () => {
    const port = await unusedPort();
    const nonce = `${process.pid}-${port}-${Date.now()}`;
    const casesPath = path.join(os.tmpdir(), `sse-restart-cases-${nonce}.jsonl`);
    const judgmentsPath = path.join(os.tmpdir(), `sse-restart-judgments-${nonce}.jsonl`);
    temporaryFiles.push(casesPath, judgmentsPath);
    const overrides = { WORKBENCH_CASES_PATH: casesPath, WORKBENCH_JUDGMENTS_PATH: judgmentsPath };
    await startReviewedFixtureServer(port, overrides);
    const firstChild = children.at(-1)!;
    const created = await responseJson(await postJson(`http://127.0.0.1:${port}/api/v2/cases`, {
      query: 'faith', source: 'manual',
    })) as { data: { case: { caseId: string }; review: { token: string; result: { results: { targetId: string }[] } } } };
    const oldToken = created.data.review.token;
    const targetId = created.data.review.result.results[0]!.targetId;
    await stopServer(firstChild);

    await startReviewedFixtureServer(port, overrides);
    const stale = await postJson(`http://127.0.0.1:${port}/api/v2/judgments`, {
      caseId: created.data.case.caseId,
      snapshotToken: oldToken,
      action: 'helpful',
      targetId,
    });
    expect(stale.status).toBe(409);
    expect(await responseJson(stale)).toMatchObject({ ok: false, error: { code: 'review_snapshot_required' } });

    const reopened = await responseJson(await fetch(
      `http://127.0.0.1:${port}/api/v2/cases/${created.data.case.caseId}`,
    )) as { data: { review: { token: string; freshness: string; result: { results: { targetId: string }[] } } } };
    expect(reopened.data.review.freshness).toBe('fresh');
    expect(reopened.data.review.token).not.toBe(oldToken);
    const accepted = await postJson(`http://127.0.0.1:${port}/api/v2/judgments`, {
      caseId: created.data.case.caseId,
      snapshotToken: reopened.data.review.token,
      action: 'helpful',
      targetId: reopened.data.review.result.results[0]!.targetId,
    });
    expect(accepted.status).toBe(201);
  }, 60_000);

  it('fails every v2 write closed when the artifact is unavailable', async () => {
    const port = await unusedPort();
    const casesPath = path.join(os.tmpdir(), `sse-degraded-cases-${process.pid}-${port}.jsonl`);
    const judgmentsPath = path.join(os.tmpdir(), `sse-degraded-judgments-${process.pid}-${port}.jsonl`);
    temporaryFiles.push(casesPath, judgmentsPath);
    await startServer(port, `${casesPath}.missing.db`, {
      WORKBENCH_CASES_PATH: casesPath,
      WORKBENCH_JUDGMENTS_PATH: judgmentsPath,
    });
    const create = await postJson(`http://127.0.0.1:${port}/api/v2/cases`, { query: 'hope', source: 'manual' });
    expect(create.status).toBe(503);
    const judge = await postJson(`http://127.0.0.1:${port}/api/v2/judgments`, {
      caseId: '00000000-0000-4000-8000-000000000001',
      snapshotToken: '00000000-0000-4000-8000-000000000002',
      action: 'helpful',
      targetId: 'WEB:59001022',
    });
    expect(judge.status).toBe(503);
    expect(() => readFileSync(casesPath)).toThrow();
    expect(() => readFileSync(judgmentsPath)).toThrow();
  }, 15_000);
});
