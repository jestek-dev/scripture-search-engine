/**
 * MS-8 verification: Layer-2 grading schema + mechanical validation with
 * positive controls (doctored grades bytes, rubric drift, unforced
 * crisisReview, double-grading, grading a Layer-1-resolved row, missing
 * coverage, escalate without reason, non-Jesse downgrade of harmful all
 * FIRE); and the grading script's refusal guards (no network is ever
 * touched here).
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { sha256Hex } from '../src/canonical.js';
import { REPO_ROOT } from '../src/universe/compileFromRepo.js';
import {
  GRADING_MANIFEST_SCHEMA,
  validateGrades,
  type GradingManifest,
  type Layer2Grade,
} from '../src/grade/layer2.js';
import type { UniverseLine } from '../src/universe/types.js';

const RUBRIC_PATH = join(REPO_ROOT, 'sweep', 'grading', 'rubric-v1.md');

function universeLine(patch: Partial<UniverseLine> & { queryId: string; query: string }): UniverseLine {
  return {
    generator: 'grammar:test',
    register: 'church-member',
    category: 'felt-need',
    expectation: { kind: 'none' },
    universeVersion: '1.0.0-test',
    ...patch,
  } as UniverseLine;
}

const QUEUE_ROWS: { queryId: string; line: UniverseLine }[] = [
  {
    queryId: 'q:aaaa000000000000',
    line: universeLine({ queryId: 'q:aaaa000000000000', query: 'i want to give up', crisisAdjacent: true }),
  },
  {
    queryId: 'q:bbbb000000000000',
    line: universeLine({ queryId: 'q:bbbb000000000000', query: 'what is faith' }),
  },
];

function grade(patch: Partial<Layer2Grade> & { queryId: string }): Layer2Grade {
  return {
    grade: 'good',
    perResult: [{ rank: 1, relevance: 2 }],
    explanationFaithful: true,
    escalate: false,
    crisisReview: false,
    rationale: 'On-theme results; supplied text supports the ordering.',
    ...patch,
  };
}

/** Well-formed grades matching QUEUE_ROWS (crisis row carries forced crisisReview). */
function goodGrades(): Layer2Grade[] {
  return [
    grade({ queryId: 'q:aaaa000000000000', crisisReview: true }),
    grade({ queryId: 'q:bbbb000000000000' }),
  ];
}

describe('validateGrades (mechanical half of trust)', () => {
  let dir: string;
  let counter = 0;

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'sweep-layer2-'));
  });
  afterAll(() => {
    rmSync(dir, { force: true, recursive: true });
  });

  function writeBatch(
    grades: readonly Layer2Grade[],
    options: {
      queueRows?: readonly { queryId: string; line: UniverseLine }[];
      manifestPatch?: Partial<GradingManifest>;
    } = {},
  ): { gradesPath: string; manifestPath: string; rubricPath: string; queuePath: string } {
    const queueRows = options.queueRows ?? QUEUE_ROWS;
    const prefix = `b${counter++}`;
    const gradesPath = join(dir, `${prefix}-grades.jsonl`);
    const queuePath = join(dir, `${prefix}-queue.jsonl`);
    const manifestPath = join(dir, `${prefix}-manifest.json`);
    const gradesBody = grades.map((row) => JSON.stringify(row)).join('\n') + '\n';
    const queueBody = queueRows.map((row) => JSON.stringify(row)).join('\n') + '\n';
    writeFileSync(gradesPath, gradesBody);
    writeFileSync(queuePath, queueBody);
    const manifest: GradingManifest = {
      schema: GRADING_MANIFEST_SCHEMA,
      modelId: 'claude-opus-5',
      rubricSha256: sha256Hex(readFileSync(RUBRIC_PATH, 'utf8')),
      gradedAt: '2026-08-23T00:00:00Z',
      queueSha256: sha256Hex(queueBody),
      gradesSha256: sha256Hex(gradesBody),
      counts: { queue: queueRows.length, graded: new Set(grades.map((g) => g.queryId)).size },
      ...options.manifestPatch,
    };
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    return { gradesPath, manifestPath, rubricPath: RUBRIC_PATH, queuePath };
  }

  it('a well-formed batch with 100% coverage has zero failures', () => {
    const findings = validateGrades(writeBatch(goodGrades()));
    expect(findings).toEqual([]);
  });

  it('positive control: doctored grades bytes FIRE the gradesSha256 pin', () => {
    const paths = writeBatch(goodGrades());
    writeFileSync(paths.gradesPath, readFileSync(paths.gradesPath, 'utf8') + '\n');
    expect(
      validateGrades(paths).some((f) => f.message.includes('gradesSha256')),
    ).toBe(true);
  });

  it('positive control: a rubric-hash mismatch FIRES — grades from an unknown rubric are meaningless', () => {
    const paths = writeBatch(goodGrades(), {
      manifestPatch: { rubricSha256: sha256Hex('some other rubric entirely') },
    });
    expect(
      validateGrades(paths).some((f) => f.message.includes('rubricSha256')),
    ).toBe(true);
  });

  it('positive control: doctored queue bytes FIRE the queueSha256 pin', () => {
    const paths = writeBatch(goodGrades());
    writeFileSync(paths.queuePath, readFileSync(paths.queuePath, 'utf8') + '\n');
    expect(
      validateGrades(paths).some((f) => f.message.includes('queueSha256')),
    ).toBe(true);
  });

  it('positive control: a crisisAdjacent row without forced crisisReview FIRES', () => {
    const paths = writeBatch([
      grade({ queryId: 'q:aaaa000000000000', crisisReview: false }),
      grade({ queryId: 'q:bbbb000000000000' }),
    ]);
    expect(
      validateGrades(paths).some((f) => f.message.includes('forced crisisReview')),
    ).toBe(true);
  });

  it('positive control: a grade for a Layer-1-resolved row (not in queue) FIRES', () => {
    const paths = writeBatch(
      [...goodGrades(), grade({ queryId: 'q:cccc000000000000' })],
      { manifestPatch: { counts: { queue: 2, graded: 2 } } },
    );
    expect(
      validateGrades(paths).some((f) =>
        f.message.includes('Layer-1-resolved rows are never AI-graded'),
      ),
    ).toBe(true);
  });

  it('positive control: double-grading FIRES', () => {
    const paths = writeBatch([...goodGrades(), grade({ queryId: 'q:bbbb000000000000' })]);
    expect(validateGrades(paths).some((f) => f.message.includes('graded twice'))).toBe(true);
  });

  it('positive control: an ungraded queue row FIRES — ungraded is unacceptable', () => {
    const paths = writeBatch(
      [grade({ queryId: 'q:aaaa000000000000', crisisReview: true })],
      { manifestPatch: { counts: { queue: 2, graded: 1 } } },
    );
    expect(validateGrades(paths).some((f) => f.message.includes('has no grade'))).toBe(true);
  });

  it('positive control: escalate without escalateReason FIRES', () => {
    const paths = writeBatch([
      grade({ queryId: 'q:aaaa000000000000', crisisReview: true, escalate: true }),
      grade({ queryId: 'q:bbbb000000000000' }),
    ]);
    expect(
      validateGrades(paths).some((f) => f.message.includes('escalate without escalateReason')),
    ).toBe(true);
  });

  it('positive control (J64): a non-Jesse downgrade of harmful FIRES; Jesse\'s stands', () => {
    const harmful = grade({
      queryId: 'q:aaaa000000000000',
      grade: 'harmful',
      crisisReview: true,
      escalate: true,
      escalateReason: 'sense-inverted result leads for a pastoral query',
    });
    const nonJesse = writeBatch([
      { ...harmful, override: { grade: 'acceptable', overriddenBy: 'reviewer-2', at: '2026-08-23' } },
      grade({ queryId: 'q:bbbb000000000000' }),
    ]);
    expect(
      validateGrades(nonJesse).some((f) => f.message.includes('only Jesse personally may downgrade')),
    ).toBe(true);
    const byJesse = writeBatch([
      { ...harmful, override: { grade: 'acceptable', overriddenBy: 'jesse', at: '2026-08-23' } },
      grade({ queryId: 'q:bbbb000000000000' }),
    ]);
    expect(validateGrades(byJesse)).toEqual([]);
  });

  it('escalate on a non-harmful grade is protected the same way (J64 covers escalate, not just harmful)', () => {
    const escalated = grade({
      queryId: 'q:bbbb000000000000',
      grade: 'good',
      escalate: true,
      escalateReason: 'pastoral ordering between two defensible passages',
      override: { grade: 'good', overriddenBy: 'reviewer-2', at: '2026-08-23' },
    });
    const paths = writeBatch([
      grade({ queryId: 'q:aaaa000000000000', crisisReview: true }),
      escalated,
    ]);
    expect(
      validateGrades(paths).some((f) => f.message.includes('only Jesse personally may downgrade')),
    ).toBe(true);
  });

  it('positive control: manifest counts that disagree with the files FIRE', () => {
    const paths = writeBatch(goodGrades(), {
      manifestPatch: { counts: { queue: 99, graded: 2 } },
    });
    expect(
      validateGrades(paths).some((f) => f.message.includes('manifest counts')),
    ).toBe(true);
  });
});

describe('rubric-v1 commitments (the sha-pinned text says what the tooling enforces)', () => {
  const rubric = readFileSync(RUBRIC_PATH, 'utf8');

  it('is marked pending J64 and carries the no-downgrade standing rule', () => {
    expect(rubric).toMatch(/PENDING JESSE'S RATIFICATION \(J64\)/);
    expect(rubric).toMatch(/ever downgraded except by Jesse personally/);
  });

  it('quotes the §4 non-criteria verbatim from the doctrinal basis', () => {
    const basis = readFileSync(join(REPO_ROOT, 'docs', 'DOCTRINAL-BASIS.md'), 'utf8');
    for (const item of [
      'Baptism — mode or subjects (immersion vs. sprinkling, believers vs. infants)',
      'Election — Calvinism vs. Arminianism',
      'Continuation or cessation of spiritual gifts',
      'Gender roles in church and home',
      'Millennial views',
      'Church polity and denominational structure',
    ]) {
      expect(rubric, `rubric must quote: ${item}`).toContain(item);
      expect(basis, `doctrinal basis must contain: ${item}`).toContain(item);
    }
  });

  it('keeps crisisReview script-forced and schema-distinct from escalate', () => {
    expect(rubric).toMatch(/crisisReview — script-forced, not yours to set/);
    expect(rubric).toMatch(/schema-distinct from `escalate`/);
  });

  it('requires grading the supplied WEB text, never memory', () => {
    expect(rubric).toMatch(/NEVER your\s+memory of the verse/);
  });
});

describe('grading script guards (no network)', () => {
  it('refuses without --j64-acknowledged, and again without --confirm-network', () => {
    const tsx = join(REPO_ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs');
    const script = join(REPO_ROOT, 'sweep', 'scripts', 'gradeQueue.ts');
    const noJ64 = spawnSync(process.execPath, [tsx, script], { encoding: 'utf8', timeout: 60_000 });
    expect(noJ64.status).toBe(2);
    expect(noJ64.stderr).toMatch(/J64/);
    const noNetwork = spawnSync(process.execPath, [tsx, script, '--j64-acknowledged'], {
      encoding: 'utf8',
      timeout: 60_000,
    });
    expect(noNetwork.status).toBe(2);
    expect(noNetwork.stderr).toMatch(/--confirm-network/);
  });
});
