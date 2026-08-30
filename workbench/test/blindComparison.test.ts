import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, readdir, rename, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { ResearchResult, ScriptureEngine } from '@jestek-dev/scripture-engine';
import { afterEach, describe, expect, it } from 'vitest';

import {
  assertBlindPayloadSanitized,
  BlindComparisonError,
  BlindComparisonStore,
  parseBlindJudgmentInput,
  parseMissingPassageInput,
  type BlindChoice,
} from '../src/blindComparison.js';
import { compareEngines, type ComparisonReport, type ComparisonUniverseInput, type EngineIdentity } from '../src/comparison.js';
import { renderComparisonPublication } from '../src/comparisonRunner.js';

const roots: string[] = [];
const BASE = { engineVersion: 'test', corpusFingerprint: 'a'.repeat(64), layerFingerprint: 'base' };
const PROPOSAL = { engineVersion: 'test', corpusFingerprint: 'a'.repeat(64), layerFingerprint: 'proposal' };

function hash(value: string): string { return createHash('sha256').update(value).digest('hex'); }

function engine(identity: EngineIdentity, variant: 'base' | 'proposal'): ScriptureEngine {
  return {
    ...identity,
    async research(query: string): Promise<ResearchResult> {
      const first = variant === 'proposal' && query === 'hope' ? 'John 3:16' : 'Psalm 46:1';
      const second = first === 'John 3:16' ? 'Psalm 46:1' : 'John 3:16';
      return {
        kind: 'discovery', query, ...identity,
        results: [first, second].map((reference, index) => ({
          targetId: reference,
          reference,
          excerpt: `${reference} text`,
          score: 10 - index,
          reasons: [{
            family: index === 0 ? 'concept_anchor' : 'token_overlap',
            label: index === 0 ? 'Theme anchor' : 'Phrase match',
            points: 10 - index,
            ...(index === 0 ? { uncappedPoints: 12, provenance: { sourceId: 'source-one', label: 'Ontology', locator: 'concepts/hope', weight: 1 } } : {}),
          }],
        })),
      };
    },
    async themes() { return []; },
    async passage() { throw new Error('not used'); },
    async related() { throw new Error('not used'); },
    async forSong() { throw new Error('not used'); },
    async close() {},
  };
}

function universe(withInheritedFailure = false): ComparisonUniverseInput {
  return {
    linkedCases: [
      { sourceId: 'case-hope', query: 'hope', ...(withInheritedFailure ? { expected: { targetId: 'Missing 1:1', withinTop: 3 as const } } : {}) },
      { sourceId: 'case-peace', query: 'peace' },
    ],
    fixtureQueries: [], g8Probes: [], calibrationQueries: [], holdoutQueries: [], affectedConceptCases: [],
  };
}

async function report(withInheritedFailure = false): Promise<ComparisonReport> {
  return compareEngines(universe(withInheritedFailure), engine(BASE, 'base'), engine(PROPOSAL, 'proposal'));
}

async function fixture(reviewId = 'review-quality-one', inherited = false) {
  const comparison = await report(inherited);
  return {
    reviewId,
    machine: {
      schemaVersion: 1,
      kind: 'scripture-search-comparison',
      binding: {
        cacheKey: hash('cache'), proposalDigest: hash('proposal'), databaseSha256: hash('database'), descriptorSha256: hash('descriptor'),
        referenceIdentity: BASE, candidateIdentity: PROPOSAL, comparisonDigest: comparison.digest,
      },
      report: comparison,
    },
  } as const;
}

async function store(fixtures: readonly Awaited<ReturnType<typeof fixture>>[], seed = 7) {
  const root = await mkdtemp(path.join(tmpdir(), 'blind-comparison-'));
  roots.push(root);
  const eventLogPath = path.join(root, 'events.jsonl');
  const instance = new BlindComparisonStore({
    eventLogPath,
    reviewer: 'reviewer-one',
    fixtures,
    seedFactory: () => Buffer.alloc(32, seed),
    now: () => new Date('2026-08-11T12:00:00.000Z'),
  });
  await instance.ready();
  return { instance, eventLogPath };
}

afterEach(async () => {
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true });
});

describe('M9 blind comparison domain', () => {
  it('emits only sanitized A/B data before judgment and resumes the same seeded order', async () => {
    const publication = await fixture();
    const { instance, eventLogPath } = await store([publication]);
    const started = await instance.start(publication.reviewId, 'request-start-0001') as any;
    expect(started.phase).toBe('blind');
    expect(started.queries).toHaveLength(2);
    expect(started.queries[0].sides).toEqual({ a: expect.any(Array), b: expect.any(Array) });
    expect(() => assertBlindPayloadSanitized(started)).not.toThrow();
    expect(() => assertBlindPayloadSanitized({ query: 'current events in scripture' })).not.toThrow();
    expect(() => assertBlindPayloadSanitized({ side: 'Candidate' })).toThrow(/leaks an identity/);
    const wire = JSON.stringify(started).toLowerCase();
    for (const secret of ['candidateidentity', 'referenceidentity', 'cachekey', 'layerfingerprint', 'seed', 'assignment', 'originalorder']) expect(wire).not.toContain(secret);
    const first = started.queries[0];
    expect(instance.passageReference(publication.reviewId, started.sessionId, first.queryId, first.sides.a[0].passageId)).toMatch(/Psalm 46:1|John 3:16/);
    expect(() => instance.passageReference(publication.reviewId, started.sessionId, first.queryId, `p-${'f'.repeat(20)}`)).toThrow(/Unknown or ambiguous blind passage/);

    const resumed = new BlindComparisonStore({ eventLogPath, reviewer: 'reviewer-one', fixtures: [publication] });
    await resumed.ready();
    expect(resumed.get(publication.reviewId, started.sessionId)).toEqual(started);
    expect((await resumed.start(publication.reviewId, 'request-resume-0001') as any).queries).toEqual(started.queries);
    await expect(resumed.judge(publication.reviewId, started.sessionId, {
      requestId: 'request-start-0001', revision: started.revision, stateDigest: started.stateDigest,
      queryId: started.queries[0].queryId, choice: 'tie',
    })).rejects.toMatchObject({ code: 'idempotency_conflict' });

    const otherReviewer = new BlindComparisonStore({ eventLogPath, reviewer: 'reviewer-two', fixtures: [publication] });
    await expect(otherReviewer.ready()).rejects.toMatchObject({ code: 'state_invalid' });
  });

  it.each<BlindChoice>(['a-wins', 'b-wins', 'tie', 'both-wrong'])('persists, reveals, and idempotently replays %s without changing the judgment', async (choice) => {
    const publication = await fixture(`review-${choice.replaceAll('-', '')}`);
    const { instance, eventLogPath } = await store([publication], choice.length);
    const started = await instance.start(publication.reviewId, `request-start-${choice}`) as any;
    const input = parseBlindJudgmentInput({
      requestId: `request-judge-${choice}`,
      revision: started.revision,
      stateDigest: started.stateDigest,
      queryId: started.queries[0].queryId,
      choice,
    });
    const revealed = await instance.judge(publication.reviewId, started.sessionId, input) as any;
    expect(revealed.queries[0].judgment.choice).toBe(choice);
    expect(revealed.queries[0].reveal).toMatchObject({ sideA: expect.stringMatching(/Current|Candidate/), sideB: expect.stringMatching(/Current|Candidate/) });
    expect((await instance.judge(publication.reviewId, started.sessionId, input) as any).revision).toBe(revealed.revision);
    await expect(instance.judge(publication.reviewId, started.sessionId, { ...input, choice: choice === 'tie' ? 'both-wrong' : 'tie' })).rejects.toMatchObject({ code: 'idempotency_conflict' });
    expect((await readFile(eventLogPath, 'utf8')).trim().split('\n')).toHaveLength(2);
  });

  it('keeps missing-passage evidence separate and does not count it as a preference', async () => {
    const publication = await fixture();
    const { instance } = await store([publication]);
    const started = await instance.start(publication.reviewId, 'request-start-missing') as any;
    const missing = parseMissingPassageInput({
      requestId: 'request-missing-0001', revision: started.revision, stateDigest: started.stateDigest,
      queryId: started.queries[0].queryId, reference: 'Romans 8:28', note: 'Expected in this context',
    });
    const recorded = await instance.recordMissing(publication.reviewId, started.sessionId, missing) as any;
    expect(recorded.progress.reviewed).toBe(0);
    expect(recorded.queries[0].missingPassages).toEqual([{ reference: 'Romans 8:28', note: 'Expected in this context', recordedAt: expect.any(String) }]);
    expect(recorded.queries[0].judgment).toBeNull();
    await expect(instance.recordMissing(publication.reviewId, started.sessionId, { ...missing, reference: 'Psalm 23:1' })).rejects.toMatchObject({ code: 'idempotency_conflict' });
  });

  it('enforces exact state preconditions, immutable judgments, and admission gates', async () => {
    const publication = await fixture('review-gated-one', true);
    const { instance } = await store([publication]);
    let view = await instance.start(publication.reviewId, 'request-start-gated') as any;
    expect(view.admission.enabled).toBe(false);
    expect(view.gateGroups.blocking.length).toBeGreaterThan(0);
    const stale = { requestId: 'request-stale-0001', revision: view.revision + 1, stateDigest: view.stateDigest, queryId: view.queries[0].queryId, choice: 'tie' as const };
    await expect(instance.judge(publication.reviewId, view.sessionId, stale)).rejects.toMatchObject({ code: 'stale_session' });
    for (const query of view.queries) {
      view = await instance.judge(publication.reviewId, view.sessionId, {
        requestId: `request-${query.queryId}`, revision: view.revision, stateDigest: view.stateDigest, queryId: query.queryId, choice: 'tie',
      }) as any;
    }
    expect(view.progress.complete).toBe(true);
    expect(view.admission.enabled).toBe(false);
    expect(view.admission.blockers.join(' ')).toMatch(/inherited expectation|blocking gate/i);
    const judged = view.queries[0];
    await expect(instance.judge(publication.reviewId, view.sessionId, {
      requestId: 'request-second-judgment', revision: view.revision, stateDigest: view.stateDigest, queryId: judged.queryId, choice: 'a-wins',
    })).rejects.toMatchObject({ code: 'judgment_immutable' });
  });

  it('enables admission only after every required query is reviewed with no blocker', async () => {
    const publication = await fixture();
    const { instance } = await store([publication]);
    let view = await instance.start(publication.reviewId, 'request-start-admit') as any;
    for (const query of view.queries) {
      view = await instance.judge(publication.reviewId, view.sessionId, {
        requestId: `request-admit-${query.queryId}`, revision: view.revision, stateDigest: view.stateDigest, queryId: query.queryId, choice: 'tie',
      }) as any;
    }
    expect(view.admission).toEqual({ enabled: true, blockers: [] });
  });

  it('fails closed on truncated, reordered, or stale append-only state', async () => {
    const publication = await fixture();
    const { instance, eventLogPath } = await store([publication]);
    const started = await instance.start(publication.reviewId, 'request-start-tamper') as any;
    await instance.judge(publication.reviewId, started.sessionId, {
      requestId: 'request-judge-tamper', revision: started.revision, stateDigest: started.stateDigest, queryId: started.queries[0].queryId, choice: 'tie',
    });
    const lines = (await readFile(eventLogPath, 'utf8')).trim().split('\n');
    await writeFile(eventLogPath, `${lines[1]}\n${lines[0]}\n`);
    const reopened = new BlindComparisonStore({ eventLogPath, reviewer: 'reviewer-one', fixtures: [publication] });
    await expect(reopened.ready()).rejects.toBeInstanceOf(BlindComparisonError);
  });

  it('serializes independent store instances and rejects the stale concurrent writer without corrupting state', async () => {
    const publication = await fixture();
    const root = await mkdtemp(path.join(tmpdir(), 'blind-comparison-race-'));
    roots.push(root);
    const eventLogPath = path.join(root, 'events.jsonl');
    const make = () => new BlindComparisonStore({
      eventLogPath, reviewer: 'reviewer-one', fixtures: [publication], lockRoot: root,
      seedFactory: () => Buffer.alloc(32, 9), now: () => new Date('2026-08-11T12:00:00.000Z'),
    });
    const left = make();
    const right = make();
    await Promise.all([left.ready(), right.ready()]);
    const started = await left.start(publication.reviewId, 'request-race-start') as any;
    const [first, second] = await Promise.allSettled([
      left.judge(publication.reviewId, started.sessionId, {
        requestId: 'request-race-left', revision: started.revision, stateDigest: started.stateDigest,
        queryId: started.queries[0].queryId, choice: 'a-wins',
      }),
      right.judge(publication.reviewId, started.sessionId, {
        requestId: 'request-race-right', revision: started.revision, stateDigest: started.stateDigest,
        queryId: started.queries[1].queryId, choice: 'b-wins',
      }),
    ]);
    const rejectionDetails = [first, second].filter((entry) => entry.status === 'rejected')
      .map((entry) => String((entry as PromiseRejectedResult).reason?.stack ?? (entry as PromiseRejectedResult).reason));
    expect([first.status, second.status].sort(), rejectionDetails.join('\n---\n')).toEqual(['fulfilled', 'rejected']);
    const rejection = [first, second].find((entry) => entry.status === 'rejected') as PromiseRejectedResult;
    expect(rejection.reason).toMatchObject({ code: 'stale_session' });
    const reopened = make();
    await expect(reopened.ready()).resolves.toBeUndefined();
    expect((reopened.get(publication.reviewId, started.sessionId) as any).progress.reviewed).toBe(1);
  }, 30_000);

  it('idempotently serializes the same judgment from concurrent store instances', async () => {
    const publication = await fixture('review-concurrent-replay');
    const root = await mkdtemp(path.join(tmpdir(), 'blind-comparison-replay-race-'));
    roots.push(root);
    const eventLogPath = path.join(root, 'events.jsonl');
    const make = () => new BlindComparisonStore({
      eventLogPath, reviewer: 'reviewer-one', fixtures: [publication], lockRoot: root,
      seedFactory: () => Buffer.alloc(32, 10), now: () => new Date('2026-08-11T12:00:00.000Z'),
    });
    const left = make();
    const right = make();
    await Promise.all([left.ready(), right.ready()]);
    const started = await left.start(publication.reviewId, 'request-replay-race-start') as any;
    const input = {
      requestId: 'request-replay-race-judge', revision: started.revision, stateDigest: started.stateDigest,
      queryId: started.queries[0].queryId, choice: 'tie' as const,
    };

    const [leftView, rightView] = await Promise.all([
      left.judge(publication.reviewId, started.sessionId, input) as Promise<any>,
      right.judge(publication.reviewId, started.sessionId, input) as Promise<any>,
    ]);

    expect(rightView).toEqual(leftView);
    expect((await readFile(eventLogPath, 'utf8')).trim().split('\n')).toHaveLength(2);
  }, 30_000);

  it('fails closed when the canonical parent is replaced between locked validation and open', async () => {
    const publication = await fixture('review-parent-race');
    const root = await mkdtemp(path.join(tmpdir(), 'blind-comparison-parent-race-'));
    const outside = await mkdtemp(path.join(tmpdir(), 'blind-comparison-parent-outside-'));
    roots.push(root, outside);
    const parent = path.join(root, 'review-data');
    const moved = path.join(root, 'review-data.moved');
    const eventLogPath = path.join(parent, 'events.jsonl');
    await mkdir(parent);
    await writeFile(path.join(outside, 'events.jsonl'), 'outside privacy canary');
    const base = new BlindComparisonStore({
      eventLogPath, reviewer: 'reviewer-one', fixtures: [publication], lockRoot: root,
      seedFactory: () => Buffer.alloc(32, 11), now: () => new Date('2026-08-11T12:00:00.000Z'),
    });
    await base.ready();
    const started = await base.start(publication.reviewId, 'request-parent-race-start') as any;
    let armed = false;
    let replaced = false;
    const faulting = new BlindComparisonStore({
      eventLogPath, reviewer: 'reviewer-one', fixtures: [publication], lockRoot: root,
      onJournalReadPhase: async (phase, relativePath) => {
        if (!armed || replaced || phase !== 'path-validated' || relativePath !== 'review-data/events.jsonl') return;
        await rename(parent, moved);
        await symlink(outside, parent, process.platform === 'win32' ? 'junction' : 'dir');
        replaced = true;
      },
    });
    await faulting.ready();
    armed = true;
    const input = {
      requestId: 'request-parent-race-judge', revision: started.revision, stateDigest: started.stateDigest,
      queryId: started.queries[0].queryId, choice: 'a-wins' as const,
    };
    try {
      await expect(faulting.judge(publication.reviewId, started.sessionId, input)).rejects.toMatchObject({ code: 'path_escape' });
      expect(await readFile(path.join(outside, 'events.jsonl'), 'utf8')).toBe('outside privacy canary');
      expect(await readdir(outside)).toEqual(['events.jsonl']);
    } finally {
      if (replaced) {
        await unlink(parent);
        await rename(moved, parent);
      }
    }

    const restarted = new BlindComparisonStore({ eventLogPath, reviewer: 'reviewer-one', fixtures: [publication], lockRoot: root });
    await restarted.ready();
    const revealed = await restarted.judge(publication.reviewId, started.sessionId, input) as any;
    expect(revealed.queries[0].reveal).toBeTruthy();
    expect((await readFile(eventLogPath, 'utf8')).trim().split('\n')).toHaveLength(2);
  });

  it('recovers a replaced log after its atomic install without revealing or duplicating the judgment', async () => {
    const publication = await fixture('review-replace-after-sync');
    const root = await mkdtemp(path.join(tmpdir(), 'blind-comparison-replace-log-'));
    roots.push(root);
    const eventLogPath = path.join(root, 'events.jsonl');
    const base = new BlindComparisonStore({
      eventLogPath, reviewer: 'reviewer-one', fixtures: [publication], lockRoot: root,
      seedFactory: () => Buffer.alloc(32, 12), now: () => new Date('2026-08-11T12:00:00.000Z'),
    });
    await base.ready();
    const started = await base.start(publication.reviewId, 'request-replace-log-start') as any;
    const before = await readFile(eventLogPath, 'utf8');
    let replaced = false;
    const faulting = new BlindComparisonStore({
      eventLogPath, reviewer: 'reviewer-one', fixtures: [publication], lockRoot: root,
      now: () => new Date('2026-08-11T12:00:00.000Z'),
      onJournalPhase: async (phase) => {
        if (replaced || phase !== 'file-replaced') return;
        await rename(eventLogPath, path.join(root, 'events.displaced.jsonl'));
        await writeFile(eventLogPath, before);
        replaced = true;
      },
    });
    await faulting.ready();
    const input = {
      requestId: 'request-replace-log-judge', revision: started.revision, stateDigest: started.stateDigest,
      queryId: started.queries[0].queryId, choice: 'b-wins' as const,
    };
    await expect(faulting.judge(publication.reviewId, started.sessionId, input)).rejects.toMatchObject({ code: 'apply_conflict' });

    const restarted = new BlindComparisonStore({ eventLogPath, reviewer: 'reviewer-one', fixtures: [publication], lockRoot: root });
    await restarted.ready();
    const revealed = await restarted.judge(publication.reviewId, started.sessionId, input) as any;
    expect(revealed.queries[0].reveal).toBeTruthy();
    expect(revealed.revision).toBe(1);
    expect((await readFile(eventLogPath, 'utf8')).trim().split('\n')).toHaveLength(2);
  });

  it('withholds reveal when the post-commit canonical reread fails and replays after restart', async () => {
    const publication = await fixture('review-post-commit-reread');
    const root = await mkdtemp(path.join(tmpdir(), 'blind-comparison-post-commit-'));
    roots.push(root);
    const eventLogPath = path.join(root, 'events.jsonl');
    const base = new BlindComparisonStore({
      eventLogPath, reviewer: 'reviewer-one', fixtures: [publication], lockRoot: root,
      seedFactory: () => Buffer.alloc(32, 13), now: () => new Date('2026-08-11T12:00:00.000Z'),
    });
    await base.ready();
    const started = await base.start(publication.reviewId, 'request-post-commit-start') as any;
    let committed = false;
    const faulting = new BlindComparisonStore({
      eventLogPath, reviewer: 'reviewer-one', fixtures: [publication], lockRoot: root,
      now: () => new Date('2026-08-11T12:00:00.000Z'),
      onJournalPhase: (phase) => { if (phase === 'committed') committed = true; },
      onJournalReadPhase: (phase) => {
        if (committed && phase === 'path-validated') throw new Error('Injected post-commit canonical reread failure.');
      },
    });
    await faulting.ready();
    const input = {
      requestId: 'request-post-commit-judge', revision: started.revision, stateDigest: started.stateDigest,
      queryId: started.queries[0].queryId, choice: 'both-wrong' as const,
    };
    await expect(faulting.judge(publication.reviewId, started.sessionId, input)).rejects.toThrow('Injected post-commit');

    const restarted = new BlindComparisonStore({ eventLogPath, reviewer: 'reviewer-one', fixtures: [publication], lockRoot: root });
    await restarted.ready();
    const revealed = await restarted.judge(publication.reviewId, started.sessionId, input) as any;
    expect(revealed.queries[0].reveal).toBeTruthy();
    expect(revealed.revision).toBe(1);
    expect((await readFile(eventLogPath, 'utf8')).trim().split('\n')).toHaveLength(2);
  });

  it('discovers only content-addressed M8 publications whose descriptor and database bytes still match', async () => {
    const source = await fixture();
    const machine = JSON.parse(JSON.stringify(source.machine)) as any;
    const root = await mkdtemp(path.join(tmpdir(), 'blind-comparison-publication-'));
    roots.push(root);
    const candidatesRoot = path.join(root, 'candidates');
    const cacheKey = hash('disk-cache');
    const directory = path.join(candidatesRoot, cacheKey);
    await mkdir(path.join(directory, 'comparison'), { recursive: true });
    const descriptor = '{"kind":"fixture-descriptor"}\n';
    const database = 'verified candidate database bytes';
    machine.binding.cacheKey = cacheKey;
    machine.binding.descriptorSha256 = hash(descriptor);
    machine.binding.databaseSha256 = hash(database);
    await writeFile(path.join(directory, 'candidate-artifact.json'), descriptor);
    await writeFile(path.join(directory, 'content.db'), database);
    await writeFile(path.join(directory, 'comparison', 'comparison.json'), renderComparisonPublication(machine.binding, machine.report).machineJson);
    const eventLogPath = path.join(root, 'events.jsonl');
    const verified = new BlindComparisonStore({ candidatesRoot, eventLogPath, reviewer: 'reviewer-one', lockRoot: root });
    await verified.ready();
    expect(verified.list()).toEqual([expect.objectContaining({ queryCount: 2, status: 'not-started' })]);

    await writeFile(path.join(directory, 'content.db'), `${database}-tampered`);
    const tampered = new BlindComparisonStore({ candidatesRoot, eventLogPath, reviewer: 'reviewer-one', lockRoot: root });
    await expect(tampered.ready()).rejects.toMatchObject({ code: 'publication_invalid' });
  });

  it('skips a built-not-yet-measured candidate (no comparison.json) instead of failing startup closed (D12)', async () => {
    // A data train's candidate exists between the build and measure stages
    // with NO comparison publication — a server restart there must come up
    // clean (the mid-chain restart of the D15 ride found startup degraded).
    const root = await mkdtemp(path.join(tmpdir(), 'blind-comparison-unmeasured-'));
    roots.push(root);
    const candidatesRoot = path.join(root, 'candidates');
    const directory = path.join(candidatesRoot, hash('unmeasured-cache'));
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, 'candidate-artifact.json'), '{"kind":"fixture-descriptor"}\n');
    await writeFile(path.join(directory, 'content.db'), 'candidate database bytes');
    const eventLogPath = path.join(root, 'events.jsonl');
    const store = new BlindComparisonStore({ candidatesRoot, eventLogPath, reviewer: 'reviewer-one', lockRoot: root });
    await store.ready();
    expect(store.list()).toEqual([]);
    // The same holds when the comparison directory exists but the machine
    // report never landed (a measure leg killed mid-run): never a
    // publication, never a startup failure.
    await mkdir(path.join(directory, 'comparison'), { recursive: true });
    const partial = new BlindComparisonStore({ candidatesRoot, eventLogPath, reviewer: 'reviewer-one', lockRoot: root });
    await partial.ready();
    expect(partial.list()).toEqual([]);
  });

  it('refuses a linked event log without modifying its target', async () => {
    const publication = await fixture();
    const root = await mkdtemp(path.join(tmpdir(), 'blind-comparison-linked-log-'));
    roots.push(root);
    const outside = path.join(root, 'outside.jsonl');
    const eventLogPath = path.join(root, 'events.jsonl');
    await writeFile(outside, 'sentinel');
    await symlink(outside, eventLogPath, 'file');
    const linked = new BlindComparisonStore({ eventLogPath, reviewer: 'reviewer-one', fixtures: [publication], lockRoot: root });
    await expect(linked.ready()).rejects.toMatchObject({ code: 'path_escape' });
    expect(await readFile(outside, 'utf8')).toBe('sentinel');
  });
});
