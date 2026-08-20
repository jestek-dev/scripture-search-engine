/**
 * Golden test for the independent reviewer's evidence packet: fixture
 * baselines in, exact markdown out. Byte-exact because the packet is what a
 * reviewer signs against — silent rendering drift is evidence drift.
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { describeTargetId, renderBaselineReviewPacket, reviewPacketSha256 } from '../src/baselineReviewPacket.js';
import { canonicalJsonSha256, type Probe, type ProbeBaseline } from '../src/gates/probes.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const EVAL_ROOT = join(HERE, '..');
const TSX_CLI = fileURLToPath(new URL('../../node_modules/tsx/dist/cli.mjs', import.meta.url));

const BEFORE: ProbeBaseline = {
  corpusFingerprint: 'a'.repeat(64),
  engineVersion: '0.9.0-test',
  layerFingerprint: 'b'.repeat(64),
  observations: [
    { id: 'adversarial-nonsense', top: [], resultCount: 0, weakReasonShare: 0, meanTopScore: 0 },
    { id: 'broad-love', top: ['WEB:45005008', 'WEB:43003016', 'WEB:62004010'], resultCount: 20, weakReasonShare: 0.5, meanTopScore: 10 },
    { id: 'stable-probe', top: ['WEB:19046001'], resultCount: 3, weakReasonShare: 0.1, meanTopScore: 5 },
  ],
};

const AFTER: ProbeBaseline = {
  corpusFingerprint: 'a'.repeat(64),
  engineVersion: '0.9.0-test',
  layerFingerprint: 'c'.repeat(64),
  observations: [
    { id: 'adversarial-nonsense', top: ['WEB:01005006'], resultCount: 2, weakReasonShare: 1, meanTopScore: 0.5 },
    { id: 'broad-love', top: ['WEB:45008039', 'WEB:45005008', 'WEB:62004010'], resultCount: 22, weakReasonShare: 0.7, meanTopScore: 11.5 },
    { id: 'stable-probe', top: ['WEB:19046001'], resultCount: 3, weakReasonShare: 0.1, meanTopScore: 5 },
  ],
};

const PROBES: { probes: Probe[] } = {
  probes: [
    { id: 'broad-love', query: 'love', kind: 'broad' },
    {
      id: 'adversarial-nonsense', query: 'quantum photosynthesis algorithm', kind: 'adversarial',
      expectNoResults: true, why: 'No scriptural content exists for this query.',
    },
    { id: 'stable-probe', query: 'as the deer pants', kind: 'narrow' },
  ],
};

const NOISE = { maxTop10ChurnRatio: 0.4, maxWeakReasonShareIncrease: 0.15 };

describe('baseline review packet', () => {
  it('decodes canonical verse ids through the engine reference utilities', () => {
    expect(describeTargetId('WEB:45005008')).toBe('`WEB:45005008` Romans 5:8');
    expect(describeTargetId('WEB:19046001')).toBe('`WEB:19046001` Psalms 46:1');
    // Undecodable ids pass through rather than crashing the packet.
    expect(describeTargetId('not-a-verse')).toBe('`not-a-verse`');
    expect(describeTargetId('WEB:99999999')).toBe('`WEB:99999999`');
  });

  it('renders the exact golden markdown from fixture baselines', () => {
    const packet = renderBaselineReviewPacket({ before: BEFORE, after: AFTER, probeFile: PROBES, noise: NOISE });
    const golden = readFileSync(join(HERE, 'fixtures', 'baseline-review-packet.golden.md'), 'utf8');
    expect(`${packet}\n`).toBe(golden);
  });

  it('prints exactly the digest and identity values the approval must bind', () => {
    const packet = renderBaselineReviewPacket({ before: BEFORE, after: AFTER, probeFile: PROBES, noise: NOISE });
    expect(packet).toContain(`- \`baselineSha256\`: \`${canonicalJsonSha256(AFTER)}\``);
    expect(packet).toContain(`- \`probesSha256\`: \`${canonicalJsonSha256(PROBES)}\``);
    expect(packet).toContain(`- \`engine.layerFingerprint\`: \`${'c'.repeat(64)}\``);
    expect(packet).toContain(canonicalJsonSha256(BEFORE));
  });

  it('emits the packet hash a v2 approval must quote, matching the written bytes exactly', () => {
    const packet = renderBaselineReviewPacket({ before: BEFORE, after: AFTER, probeFile: PROBES, noise: NOISE });
    // The footer tells the reviewer where the hash comes from.
    expect(packet).toContain('reviewPacketSha256');

    const dir = mkdtempSync(join(tmpdir(), 'review-packet-'));
    const paths = {
      before: join(dir, 'before.json'),
      after: join(dir, 'after.json'),
      probes: join(dir, 'probes.json'),
      budgets: join(dir, 'budgets.json'),
      out: join(dir, 'packet.md'),
    };
    writeFileSync(paths.before, JSON.stringify(BEFORE), 'utf8');
    writeFileSync(paths.after, JSON.stringify(AFTER), 'utf8');
    writeFileSync(paths.probes, JSON.stringify(PROBES), 'utf8');
    writeFileSync(paths.budgets, JSON.stringify({ noise: NOISE }), 'utf8');
    const run = spawnSync(process.execPath, [
      TSX_CLI, 'src/baselineReviewPacket.ts',
      '--before', paths.before, '--after', paths.after,
      '--probes', paths.probes, '--budgets', paths.budgets,
      '--out', paths.out,
    ], { cwd: EVAL_ROOT, encoding: 'utf8' });
    expect(run.status).toBe(0);

    // The exported hash IS the hash of the file the tool wrote, so
    // `sha256sum <packet>.md` reproduces what the approval quotes.
    const written = createHash('sha256').update(readFileSync(paths.out)).digest('hex');
    expect(reviewPacketSha256(packet)).toBe(written);
    expect(run.stderr).toContain('reviewPacketSha256');
    expect(run.stderr).toContain(written);
  });

  it('marks exceeded budgets and broken adversarial silence so a reviewer cannot miss them', () => {
    const packet = renderBaselineReviewPacket({ before: BEFORE, after: AFTER, probeFile: PROBES, noise: NOISE });
    // broad-love weak-reason share rose 0.2 against a 0.15 budget.
    expect(packet).toContain('rise max +0.15 — **EXCEEDED**');
    expect(packet).toContain('**Adversarial probe returns 2 result(s) but must return none.**');
    // stable-probe did not change, so it renders no section of its own.
    expect(packet).not.toContain('### `stable-probe`');
    expect(packet).toContain('- Unchanged: `stable-probe`.');
  });
});
