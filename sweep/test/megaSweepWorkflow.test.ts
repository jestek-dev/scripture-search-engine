/**
 * MS-6 verification: the workflow is workflow_dispatch-only, fails closed
 * on unmet preconditions (currently HONESTLY unmet: no terminus mint for
 * this engine, no J43 signature), keeps AI grading out of CI, and the
 * precondition CLI exits non-zero with the not-applicable reasons.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';

import { checkCertifiedPreconditions } from '../src/preconditions.js';
import { REPO_ROOT } from '../src/universe/compileFromRepo.js';

const WORKFLOW_PATH = join(REPO_ROOT, '.github', 'workflows', 'mega-sweep.yml');

describe('mega-sweep.yml shape', () => {
  const workflow = parseYaml(readFileSync(WORKFLOW_PATH, 'utf8')) as {
    on: Record<string, unknown> | string;
    jobs: Record<string, { needs?: string | string[]; steps: { run?: string; uses?: string }[] }>;
  };

  it('is workflow_dispatch-only', () => {
    expect(typeof workflow.on).toBe('object');
    expect(Object.keys(workflow.on as object)).toEqual(['workflow_dispatch']);
  });

  it('gates every job behind the fail-closed precondition check', () => {
    expect(workflow.jobs.preconditions).toBeDefined();
    const preSteps = workflow.jobs.preconditions!.steps.map((step) => step.run ?? '').join('\n');
    expect(preSteps).toMatch(/checkPreconditions/);
    // Every other job must (transitively) need `preconditions`.
    const jobs = workflow.jobs;
    const reaches = (name: string, seen = new Set<string>()): boolean => {
      if (name === 'preconditions') return true;
      if (seen.has(name)) return false;
      seen.add(name);
      const needs = jobs[name]?.needs;
      const list = needs === undefined ? [] : Array.isArray(needs) ? needs : [needs];
      return list.some((dep) => reaches(dep, seen));
    };
    for (const name of Object.keys(jobs)) {
      expect(reaches(name), `job ${name} does not depend on preconditions`).toBe(true);
    }
  });

  it('runs an 8-shard matrix, a cross-OS determinism spot, and no AI grading', () => {
    const body = readFileSync(WORKFLOW_PATH, 'utf8');
    expect(body).toMatch(/shard: \[0, 1, 2, 3, 4, 5, 6, 7\]/);
    expect(body).toMatch(/windows-latest/);
    expect(body).toMatch(/needs-ai-grade/); // the queue is an artifact…
    expect(body).not.toMatch(/ANTHROPIC_API_KEY|anthropic-ai\/sdk|gradeQueue/); // …not a CI job
    // The artifact arrives sha-verified, the fetchArtifact way.
    expect(body).toMatch(/fetchReleaseArtifact/);
  });
});

describe('certified preconditions (honest current state)', () => {
  it('reports both preconditions unmet with not-applicable reasons', () => {
    const findings = checkCertifiedPreconditions();
    const byName = new Map(findings.map((finding) => [finding.name, finding]));
    const terminus = byName.get('terminus-identity')!;
    const numbers = byName.get('j43-numbers')!;
    // The committed descriptor pins an older engine (no terminus mint yet)
    // and J43 has signed nothing: both must be honest failures.
    expect(terminus.ok).toBe(false);
    expect(terminus.reason).toMatch(/not-applicable/);
    expect(numbers.ok).toBe(false);
    expect(numbers.reason).toMatch(/not-applicable.*J43/);
  });

  it('the CLI exits 2 and prints every reason (fail-closed, never vacuous)', () => {
    const tsx = join(REPO_ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs');
    const result = spawnSync(
      process.execPath,
      [tsx, join(REPO_ROOT, 'sweep', 'scripts', 'checkPreconditions.ts')],
      { encoding: 'utf8', timeout: 120_000, cwd: REPO_ROOT },
    );
    expect(result.status).toBe(2);
    expect(result.stdout).toMatch(/terminus-identity/);
    expect(result.stdout).toMatch(/j43-numbers/);
  });
});
