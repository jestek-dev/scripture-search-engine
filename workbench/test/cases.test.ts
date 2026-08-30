import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  CaseValidationError,
  deriveLegacyCaseEvents,
  foldCaseEvents,
  parseCaseEventLog,
  parseLegacyJudgmentLog,
  readCanonicalLegacyCaseEvents,
  readFoldedCanonicalLegacyCases,
  readFoldedCaseEventLog,
  readValidatedCaseEventLog,
  serializeCaseEventLog,
  validateCanonicalLegacyCaseLog,
  validateCaseEvents,
  type CaseEvent,
  type LegacyCaseLogPaths,
  type LegacyMigrationManifest,
} from '../src/cases.js';

const CASE_A = '11111111-1111-4111-8111-111111111111';
const CASE_B = '22222222-2222-4222-8222-222222222222';
const EVENT_1 = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const EVENT_2 = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const EVENT_3 = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const EVENT_4 = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const EVENT_5 = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const EVENT_6 = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
const EVENT_7 = '12345678-1234-4123-8123-123456789abc';
const EVENT_8 = '23456789-2345-4234-8234-23456789abcd';
const EVENT_9 = '34567890-3456-4345-8345-34567890abcd';
const EVENT_10 = '45678901-4567-4456-8456-45678901abcd';
const EVENT_11 = '56789012-5678-4567-8567-56789012abcd';
const EVENT_12 = '67890123-6789-4678-8678-67890123abcd';
const EVENT_13 = '78901234-7890-4789-8789-78901234abcd';
const SESSION = '33333333-3333-4333-8333-333333333333';
const PROPOSAL = '44444444-4444-4444-8444-444444444444';
const CANDIDATE = '55555555-5555-4555-8555-555555555555';
const ADMISSION = '66666666-6666-4666-8666-666666666666';

function created(caseId = CASE_A, eventId = EVENT_1): CaseEvent {
  return {
    schemaVersion: 2,
    eventId,
    caseId,
    at: '2026-08-10T12:00:00.000Z',
    reviewer: 'reviewer',
    sequence: 1,
    kind: 'case-created',
    query: 'Who is like the Lord?',
    source: 'manual',
    artifact: { engineVersion: '0.7.1', corpusFingerprint: 'corpus', layerFingerprint: 'layers' },
  };
}

function state(eventId: string, parentEventId: string, sequence: number, next: string, caseId = CASE_A): CaseEvent {
  return {
    schemaVersion: 2,
    eventId,
    caseId,
    at: `2026-08-10T12:${String(sequence).padStart(2, '0')}:00.000Z`,
    reviewer: 'reviewer',
    sequence,
    parentEventId,
    kind: 'case-state-changed',
    state: next as never,
  };
}

const COMPLETE_CHAIN: readonly CaseEvent[] = [
  created(),
  state(EVENT_2, EVENT_1, 2, 'reviewing'),
  state(EVENT_3, EVENT_2, 3, 'judged'),
  state(EVENT_4, EVENT_3, 4, 'proposed'),
  { schemaVersion: 2, eventId: EVENT_5, caseId: CASE_A, at: '2026-08-10T12:05:00.000Z', reviewer: 'reviewer', sequence: 5, parentEventId: EVENT_4, kind: 'proposal-linked', proposalId: PROPOSAL },
  state(EVENT_6, EVENT_5, 6, 'candidate-ready'),
  { schemaVersion: 2, eventId: EVENT_7, caseId: CASE_A, at: '2026-08-10T12:07:00.000Z', reviewer: 'reviewer', sequence: 7, parentEventId: EVENT_6, kind: 'candidate-linked', candidateId: CANDIDATE },
  state(EVENT_8, EVENT_7, 8, 'admitted'),
  { schemaVersion: 2, eventId: EVENT_9, caseId: CASE_A, at: '2026-08-10T12:09:00.000Z', reviewer: 'reviewer', sequence: 9, parentEventId: EVENT_8, kind: 'admission-recorded', admissionId: ADMISSION },
  state(EVENT_10, EVENT_9, 10, 'pr-prepared'),
  { schemaVersion: 2, eventId: EVENT_11, caseId: CASE_A, at: '2026-08-10T12:11:00.000Z', reviewer: 'reviewer', sequence: 11, parentEventId: EVENT_10, kind: 'pull-request-linked', pullRequestUrl: 'https://github.com/example/repo/pull/1' },
  state(EVENT_12, EVENT_11, 12, 'merged'),
  state(EVENT_13, EVENT_12, 13, 'monitored'),
];

function expectRejected(events: readonly unknown[], pattern: RegExp): void {
  expect(() => foldCaseEvents(events)).toThrow(CaseValidationError);
  expect(() => foldCaseEvents(events)).toThrow(pattern);
}

function paths(): LegacyCaseLogPaths {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  return {
    casesPath: path.join(root, 'cases.jsonl'),
    manifestPath: path.join(root, 'legacy', 'migration-manifest.json'),
    judgmentsPath: path.join(root, 'judgments.jsonl'),
  };
}

async function legacyInputs(): Promise<{ rawCases: string; rawJudgments: string; manifest: LegacyMigrationManifest }> {
  const files = paths();
  const [rawCases, rawJudgments, manifestRaw] = await Promise.all([
    readFile(files.casesPath, 'utf8'),
    readFile(files.judgmentsPath, 'utf8'),
    readFile(files.manifestPath, 'utf8'),
  ]);
  return { rawCases, rawJudgments, manifest: JSON.parse(manifestRaw) as LegacyMigrationManifest };
}

describe('case event folding', () => {
  it('folds every planned event kind and the full legal state path', () => {
    const [snapshot] = foldCaseEvents(COMPLETE_CHAIN);
    expect(snapshot?.state).toBe('monitored');
    expect(snapshot?.proposalIds).toEqual([PROPOSAL]);
    expect(snapshot?.candidateIds).toEqual([CANDIDATE]);
    expect(snapshot?.admissionIds).toEqual([ADMISSION]);
    expect(snapshot?.pullRequestUrls).toEqual(['https://github.com/example/repo/pull/1']);
  });

  it('accepts terminal branches from their legal states', () => {
    const candidateReady = COMPLETE_CHAIN.slice(0, 7);
    expect(foldCaseEvents([...candidateReady, state(EVENT_8, EVENT_7, 8, 'rejected')])[0]?.state).toBe('rejected');
    expect(foldCaseEvents([created(), state(EVENT_2, EVENT_1, 2, 'reviewing'), state(EVENT_3, EVENT_2, 3, 'judged'), state(EVENT_4, EVENT_3, 4, 'needs-engineering')])[0]?.state).toBe('needs-engineering');
  });

  it('folds a session assignment without changing the derived state', () => {
    const assigned: CaseEvent = {
      schemaVersion: 2,
      eventId: EVENT_2,
      caseId: CASE_A,
      at: '2026-08-10T12:02:00.000Z',
      reviewer: 'reviewer',
      sequence: 2,
      parentEventId: EVENT_1,
      kind: 'case-assigned-to-session',
      sessionId: SESSION,
    };
    const [snapshot] = foldCaseEvents([created(), assigned, state(EVENT_3, EVENT_2, 3, 'reviewing')]);
    expect(snapshot?.state).toBe('reviewing');
    expect(snapshot?.sessionIds).toEqual([SESSION]);
  });

  it('is deterministic when raw file order is reversed and case ids vary', () => {
    expect(foldCaseEvents([...COMPLETE_CHAIN].reverse())).toEqual(foldCaseEvents(COMPLETE_CHAIN));
    const second = created(CASE_B, '01234567-89ab-4123-8abc-0123456789ab');
    expect(foldCaseEvents([second, ...COMPLETE_CHAIN]).map((snapshot) => snapshot.caseId)).toEqual([CASE_A, CASE_B]);
  });
});

describe('case event validation', () => {
  it('rejects malformed records, unknown fields, bad UUIDs, and bad timestamps', () => {
    expectRejected([{ ...created(), eventId: 'not-a-uuid' }], /UUID/);
    expectRejected([{ ...created(), at: '2026-08-10T12:00:00Z' }], /canonical UTC ISO timestamp/);
    expectRejected([{ ...created(), surprise: true }], /unknown field/);
    expectRejected([{ ...created(), source: 'guess' }], /known case source/);
    expectRejected([{ ...created(), sequence: 2 }], /must be 1/);
  });

  it('rejects missing parents, cross-case parents, sequence gaps, duplicates, and forks', () => {
    expectRejected([created(), state(EVENT_2, EVENT_3, 2, 'reviewing')], /missing parentEventId/);
    expectRejected([created(), created(CASE_B, '01234567-89ab-4123-8abc-0123456789ab'), { ...state(EVENT_2, EVENT_1, 2, 'reviewing'), caseId: CASE_B }], /parent in another case/);
    expectRejected([created(), state(EVENT_2, EVENT_1, 1, 'reviewing')], /repeats sequence/);
    expectRejected([created(), state(EVENT_2, EVENT_1, 4, 'reviewing')], /next deterministic sequence/);
    expectRejected([created(), state(EVENT_2, EVENT_1, 2, 'reviewing'), state(EVENT_3, EVENT_2, 3, 'judged'), { ...state(EVENT_4, EVENT_3, 4, 'proposed'), eventId: EVENT_2 }], /Duplicate eventId/);
    expectRejected([created(), state(EVENT_2, EVENT_1, 2, 'reviewing'), { ...state(EVENT_3, EVENT_1, 3, 'reviewing') }], /must not fork/);
  });

  it('rejects cycles, backdated children, and disconnected causal graphs', () => {
    expectRejected([created(), state(EVENT_2, EVENT_3, 2, 'reviewing'), state(EVENT_3, EVENT_2, 3, 'judged')], /parent cycle/);
    expectRejected([created(), { ...state(EVENT_2, EVENT_1, 2, 'reviewing'), at: '2026-08-10T11:59:59.999Z' }], /cannot be earlier than its parent timestamp/);
    expect(foldCaseEvents([created(), { ...state(EVENT_2, EVENT_1, 2, 'reviewing'), at: '2026-08-10T12:00:00.000Z' }])[0]?.state).toBe('reviewing');
  });

  it('rejects every illegal state transition and terminal-state continuation', () => {
    expectRejected([created(), state(EVENT_2, EVENT_1, 2, 'judged')], /Illegal state transition/);
    expectRejected([created(), state(EVENT_2, EVENT_1, 2, 'reviewing'), state(EVENT_3, EVENT_2, 3, 'judged'), state(EVENT_4, EVENT_3, 4, 'needs-engineering'), state(EVENT_5, EVENT_4, 5, 'proposed')], /Illegal state transition/);
  });

  it('enforces state preconditions for proposal, candidate, admission, and PR links during validation', () => {
    const proposalTooEarly: CaseEvent = { schemaVersion: 2, eventId: EVENT_4, caseId: CASE_A, at: '2026-08-10T12:04:00.000Z', reviewer: 'reviewer', sequence: 4, parentEventId: EVENT_3, kind: 'proposal-linked', proposalId: PROPOSAL };
    expect(() => validateCaseEvents([created(), state(EVENT_2, EVENT_1, 2, 'reviewing'), state(EVENT_3, EVENT_2, 3, 'judged'), proposalTooEarly])).toThrow(/requires state "proposed"/);

    const candidateTooEarly: CaseEvent = { schemaVersion: 2, eventId: EVENT_13, caseId: CASE_A, at: '2026-08-10T12:06:00.000Z', reviewer: 'reviewer', sequence: 6, parentEventId: EVENT_5, kind: 'candidate-linked', candidateId: CANDIDATE };
    expectRejected([...COMPLETE_CHAIN.slice(0, 5), candidateTooEarly], /requires state "candidate-ready"/);

    const admissionTooEarly: CaseEvent = { schemaVersion: 2, eventId: EVENT_13, caseId: CASE_A, at: '2026-08-10T12:08:00.000Z', reviewer: 'reviewer', sequence: 8, parentEventId: EVENT_7, kind: 'admission-recorded', admissionId: ADMISSION };
    expectRejected([...COMPLETE_CHAIN.slice(0, 7), admissionTooEarly], /requires state "admitted"/);

    const prTooEarly: CaseEvent = { schemaVersion: 2, eventId: EVENT_13, caseId: CASE_A, at: '2026-08-10T12:10:00.000Z', reviewer: 'reviewer', sequence: 10, parentEventId: EVENT_9, kind: 'pull-request-linked', pullRequestUrl: 'https://github.com/example/repo/pull/1' };
    expectRejected([...COMPLETE_CHAIN.slice(0, 9), prTooEarly], /requires state "pr-prepared"/);
  });

  it('parses JSONL without ignoring blank or malformed lines', () => {
    expect(parseCaseEventLog(`${JSON.stringify(created())}\n`)).toEqual([created()]);
    expect(() => parseCaseEventLog(`${JSON.stringify(created())}\n\n`)).toThrow(/line 2 is blank/);
    expect(() => parseCaseEventLog('{not json}\n')).toThrow(/line 1 is not valid JSON/);
  });
});

describe('legacy migration manifest', () => {
  it('maps exactly the three immutable v1 judgments to the committed canonical cases log', async () => {
    const { rawCases, rawJudgments, manifest } = await legacyInputs();
    const judgments = parseLegacyJudgmentLog(rawJudgments);
    const events = deriveLegacyCaseEvents(manifest, judgments);
    const canonical = validateCanonicalLegacyCaseLog(rawCases, manifest, judgments);
    const [snapshot] = foldCaseEvents(canonical);

    expect(events.map((event) => event.eventId)).toEqual(manifest.cases[0]?.entries.map((entry) => entry.eventId));
    expect(rawCases).toBe(serializeCaseEventLog(events));
    expect(snapshot).toMatchObject({ caseId: manifest.cases[0]?.caseId, query: 'Who is like the Lord?', state: 'judged' });
  });

  it('fails closed for every source-line byte or field mutation', async () => {
    const { rawJudgments, manifest } = await legacyInputs();
    const mutations = [
      rawJudgments.replace('uses that exact wording.', 'uses altered wording.'),
      rawJudgments.replace('"note":"uses that exact wording."', '"excerpt":"text","note":"uses that exact wording."'),
      rawJudgments.replace('"reviewer":"jesse"', '"reviewer":"other"'),
      rawJudgments.replace('"engineVersion":"0.7.1"', '"unknown":true,"engineVersion":"0.7.1"'),
    ];
    for (const mutated of mutations) {
      expect(() => deriveLegacyCaseEvents(manifest, parseLegacyJudgmentLog(mutated))).toThrow(/line SHA-256/);
    }
  });

  it('requires both the line digest and full record identity, never a projection', async () => {
    const { rawJudgments, manifest } = await legacyInputs();
    const judgments = parseLegacyJudgmentLog(rawJudgments);
    const tamperedManifest = JSON.parse(JSON.stringify(manifest)) as {
      cases: { entries: { judgment: Record<string, unknown> }[] }[];
    };
    tamperedManifest.cases[0]!.entries[0]!.judgment.note = 'altered manifest identity';
    expect(() => deriveLegacyCaseEvents(tamperedManifest as unknown as LegacyMigrationManifest, judgments)).toThrow(/full identity/);
    expect(() => deriveLegacyCaseEvents(manifest, [...judgments, judgments[0]!])).toThrow(/duplicate line number/);
  });

  it('names stray line numbers and the remediation, and removing the stray restores validity', async () => {
    const { rawJudgments, manifest } = await legacyInputs();
    const strayRecord = { ...JSON.parse(rawJudgments.split('\n')[0]!) as object, note: 'a stray legacy append' };
    const withStray = `${rawJudgments}${JSON.stringify(strayRecord)}\n`;

    let failure: Error | null = null;
    try {
      deriveLegacyCaseEvents(manifest, parseLegacyJudgmentLog(withStray));
    } catch (error) {
      failure = error as Error;
    }
    expect(failure).not.toBeNull();
    expect(failure!.message).toContain('line(s) 4');
    expect(failure!.message).toContain('delete the stray line(s)');
    expect(failure!.message).toContain('v2 workbench');

    // Recoverable, not a permanent brick: the same inputs minus the stray
    // line derive the canonical events again.
    expect(deriveLegacyCaseEvents(manifest, parseLegacyJudgmentLog(rawJudgments)).length).toBeGreaterThan(0);
  });

  it('rejects a semantically valid but noncanonical cases projection', async () => {
    const { rawCases, rawJudgments, manifest } = await legacyInputs();
    expect(() => validateCanonicalLegacyCaseLog(rawCases.replace('Who is like the Lord?', 'Who compares to the Lord?'), manifest, parseLegacyJudgmentLog(rawJudgments))).toThrow(/not the canonical/);
  });

  it('tolerates live v2 case events appended AFTER the byte-pinned legacy prefix (§5.1 two-writer coexistence)', async () => {
    // Found in anger by the D11 shakedown: a whole-file canonical pin made
    // the first live case brick every later derivation. The legacy prefix
    // stays pinned; appends after it are ordinary case events.
    const { rawCases, rawJudgments, manifest } = await legacyInputs();
    const judgments = parseLegacyJudgmentLog(rawJudgments);
    const appended: CaseEvent = {
      schemaVersion: 2,
      eventId: '44444444-4444-4444-8444-444444444444',
      caseId: '55555555-5555-4555-8555-555555555555',
      at: '2026-08-28T09:00:00.000Z',
      reviewer: 'jesse',
      sequence: 1,
      kind: 'case-created',
      query: 'hearing and doing',
      source: 'manual',
      artifact: { engineVersion: '0.14.0', corpusFingerprint: 'c'.repeat(64), layerFingerprint: 'l'.repeat(64) },
    };
    const grown = `${rawCases}${JSON.stringify(appended)}\n`;
    const events = validateCanonicalLegacyCaseLog(grown, manifest, judgments);
    expect(events.at(-1)).toMatchObject({ eventId: appended.eventId, query: 'hearing and doing' });
    // The pin still holds over the PREFIX: mutating a legacy byte refuses
    // even when live appends follow it.
    const tamperedPrefix = grown.replace('Who is like the Lord?', 'Who compares to the Lord?');
    expect(() => validateCanonicalLegacyCaseLog(tamperedPrefix, manifest, judgments)).toThrow(/not the canonical/);
  });

  it('exposes read-only read, validate, and fold helpers for later integrations', async () => {
    const files = paths();
    const events = await readValidatedCaseEventLog(files.casesPath);
    const snapshots = await readFoldedCaseEventLog(files.casesPath);
    const canonicalEvents = await readCanonicalLegacyCaseEvents(files);
    const canonicalSnapshots = await readFoldedCanonicalLegacyCases(files);

    expect(events).toEqual(canonicalEvents);
    expect(snapshots).toEqual(canonicalSnapshots);
    expect(canonicalSnapshots[0]?.state).toBe('judged');
  });
});
