/**
 * MS-5 verification: deterministic seed selection with the three strata;
 * committed seed freshness; frozen-batch validation with positive controls
 * (doctored bytes, register drift, dropped crisis tag, missing skim all
 * FIRE); expectation inheritance at confidence 'inherited'; and the
 * generation script's refusal guards (no network is ever touched here).
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { sha256Hex } from '../src/canonical.js';
import { REPO_ROOT } from '../src/universe/compileFromRepo.js';
import { selectRepoSeeds, SEEDS_PATH } from '../src/paraphrase/seedsCli.js';
import { serializeSeeds, type ParaphraseSeed } from '../src/paraphrase/selectSeeds.js';
import { paraphrasesToUniverse } from '../src/paraphrase/toUniverse.js';
import { validateParaphrases, type ParaphraseLine, type ParaphraseManifest } from '../src/paraphrase/validate.js';

describe('seed selection (deterministic, three strata)', () => {
  it('selects identically twice and matches the committed seed list byte-for-byte', () => {
    const first = selectRepoSeeds();
    const second = selectRepoSeeds();
    expect(serializeSeeds(second)).toBe(serializeSeeds(first));
    expect(serializeSeeds(first)).toBe(readFileSync(SEEDS_PATH, 'utf8'));
  });

  it('covers all three strata and carries curated lines verbatim', () => {
    const seeds = selectRepoSeeds();
    const strata = new Set(seeds.map((seed) => seed.stratum));
    expect(strata).toEqual(new Set(['cell', 'frame', 'curated']));
    const queries = new Set(seeds.map((seed) => seed.query));
    const battery = JSON.parse(
      readFileSync(join(REPO_ROOT, 'eval', 'battery', 'queries.json'), 'utf8'),
    ) as { queries: { query: string }[] };
    for (const row of battery.queries) {
      expect(queries.has(row.query), `battery query missing from seeds: ${row.query}`).toBe(true);
    }
    // Crisis frames keep their tag through selection.
    const crisis = seeds.filter((seed) => seed.crisisAdjacent === true);
    expect(crisis.length).toBeGreaterThan(0);
  });
});

describe('frozen-batch validation', () => {
  let dir: string;
  const seeds: ParaphraseSeed[] = [
    {
      seedId: 'seed:aaaa000000000000',
      query: 'my mother just died',
      stratum: 'frame',
      register: 'church-member',
      category: 'felt-need',
      expectation: { kind: 'concept-anchors', conceptId: 'grief-and-loss', anchors: ['Psalms 34:18'] },
      crisisAdjacent: true,
    },
    {
      seedId: 'seed:bbbb000000000000',
      query: 'what is faith',
      stratum: 'curated',
      register: 'church-member',
      expectation: { kind: 'none' },
    },
  ];
  const lines: ParaphraseLine[] = [
    { seedId: 'seed:aaaa000000000000', index: 0, paraphrase: 'i just lost my mom', register: 'church-member', crisisAdjacent: true },
    { seedId: 'seed:bbbb000000000000', index: 0, paraphrase: 'faith meaning bible', register: 'church-member' },
  ];

  function writeBatch(
    directory: string,
    batchLines: readonly ParaphraseLine[],
    manifestPatch: Partial<ParaphraseManifest> = {},
  ): { paraphrasesPath: string; manifestPath: string; promptPath: string; seedsPath: string } {
    const paraphrasesPath = join(directory, 'paraphrases.jsonl');
    const manifestPath = join(directory, 'manifest.json');
    const promptPath = join(REPO_ROOT, 'sweep', 'paraphrase', 'PROMPT.md');
    const seedsPath = join(directory, 'seeds.jsonl');
    const body = batchLines.map((line) => JSON.stringify(line)).join('\n') + '\n';
    const seedsBody = serializeSeeds(seeds);
    writeFileSync(paraphrasesPath, body);
    writeFileSync(seedsPath, seedsBody);
    const manifest: ParaphraseManifest = {
      schema: 'scripture-search-engine/sweep-paraphrase-manifest/v1',
      modelId: 'claude-opus-5',
      promptSha256: sha256Hex(readFileSync(promptPath, 'utf8')),
      generatedAt: '2026-08-23T00:00:00Z',
      seedsFingerprint: sha256Hex(seedsBody),
      counts: { seeds: seeds.length, raw: batchLines.length, frozen: batchLines.length },
      leverState: 'none',
      paraphrasesSha256: sha256Hex(body),
      skim: { by: 'jesse', at: '2026-08-23', sampleSize: 200 },
      ...manifestPatch,
    };
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    return { paraphrasesPath, manifestPath, promptPath, seedsPath };
  }

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'sweep-paraphrase-'));
  });
  afterAll(() => {
    rmSync(dir, { force: true, recursive: true });
  });

  it('a well-formed skimmed batch has zero failures (floor not-applicable while J43 null)', () => {
    const paths = writeBatch(join(dir, '.'), lines);
    const findings = validateParaphrases({ ...paths, countFloor: null });
    expect(findings.filter((f) => f.level === 'fail')).toEqual([]);
    expect(findings.some((f) => f.message.includes('not-applicable — ringFloors'))).toBe(true);
  });

  it('positive controls: doctored bytes, register drift, dropped crisis tag, missing skim all FIRE', () => {
    // Doctored file byte.
    const doctored = writeBatch(dir, lines);
    writeFileSync(doctored.paraphrasesPath, readFileSync(doctored.paraphrasesPath, 'utf8') + '\n');
    expect(
      validateParaphrases({ ...doctored, countFloor: null }).some((f) =>
        f.message.includes('paraphrasesSha256'),
      ),
    ).toBe(true);
    // Register drift.
    const drift = writeBatch(dir, [
      { ...lines[0]!, register: 'pastor' },
      lines[1]!,
    ]);
    expect(
      validateParaphrases({ ...drift, countFloor: null }).some((f) =>
        f.message.includes('not faithful'),
      ),
    ).toBe(true);
    // Crisis tag dropped from a crisis seed's paraphrase.
    const { crisisAdjacent: _dropped, ...untagged } = lines[0]!;
    const crisis = writeBatch(dir, [untagged, lines[1]!]);
    expect(
      validateParaphrases({ ...crisis, countFloor: null }).some((f) =>
        f.message.includes('untagged paraphrase'),
      ),
    ).toBe(true);
    // Missing skim.
    const unskimmed = writeBatch(dir, lines, { skim: null });
    expect(
      validateParaphrases({ ...unskimmed, countFloor: null }).some((f) =>
        f.message.includes('human skim'),
      ),
    ).toBe(true);
  });

  it('a signed floor is enforced once J43 flips it', () => {
    const paths = writeBatch(dir, lines);
    const findings = validateParaphrases({ ...paths, countFloor: 25000 });
    expect(findings.some((f) => f.message.includes('below the J43-signed floor'))).toBe(true);
  });
});

describe('paraphrase → universe conversion', () => {
  it('inherits the seed expectation at confidence inherited, crisis tag forced', () => {
    const seeds: ParaphraseSeed[] = [
      {
        seedId: 'seed:cccc000000000000',
        query: 'i want to give up',
        stratum: 'frame',
        register: 'church-member',
        expectation: { kind: 'concept-anchors', conceptId: 'do-not-lose-heart', anchors: ['Galatians 6:9'] },
        crisisAdjacent: true,
      },
    ];
    const lines = paraphrasesToUniverse(
      [{ seedId: 'seed:cccc000000000000', index: 0, paraphrase: 'i cant keep going anymore', register: 'church-member', crisisAdjacent: true }],
      seeds,
      '1.0.0-test',
    );
    expect(lines.length).toBe(1);
    expect(lines[0]!.confidence).toBe('inherited');
    expect(lines[0]!.crisisAdjacent).toBe(true);
    expect(lines[0]!.expectation).toEqual(seeds[0]!.expectation);
    expect(() =>
      paraphrasesToUniverse(
        [{ seedId: 'seed:missing0000000000', index: 0, paraphrase: 'x' }],
        seeds,
        '1.0.0-test',
      ),
    ).toThrow(/unknown seed/);
  });
});

describe('generation script guards (no network)', () => {
  it('refuses without --j63-acknowledged, and again without --confirm-network', () => {
    const tsx = join(REPO_ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs');
    const script = join(REPO_ROOT, 'sweep', 'scripts', 'generateParaphrases.ts');
    const noJ63 = spawnSync(process.execPath, [tsx, script], { encoding: 'utf8', timeout: 60_000 });
    expect(noJ63.status).toBe(2);
    expect(noJ63.stderr).toMatch(/J63/);
    const noNetwork = spawnSync(process.execPath, [tsx, script, '--j63-acknowledged'], {
      encoding: 'utf8',
      timeout: 60_000,
    });
    expect(noNetwork.status).toBe(2);
    expect(noNetwork.stderr).toMatch(/--confirm-network/);
  });
});
