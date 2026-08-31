import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  captureRepositoryIdentity,
  parseGauntletOptions,
} from '../../eval/src/gauntletMachineReport.js';
import {
  displayReportPath,
  gauntletHealthFromParsed,
  readActiveGauntletRun,
  readGoldenAndCoverage,
  readLegacyLogHealth,
} from '../src/healthSources.js';
import { repoRoot } from '../src/descriptor.js';

const temporaryFiles: string[] = [];

function runningMarker(startedAt: string): object {
  const flags = parseGauntletOptions(['--require-admit']);
  return {
    schema: 'scripture-search-engine/gauntlet-running/v1',
    pid: process.pid,
    startedAt,
    identity: captureRepositoryIdentity(repoRoot, flags),
  };
}

afterEach(() => {
  for (const file of temporaryFiles.splice(0)) {
    try {
      unlinkSync(file);
    } catch {
      // A test may already have removed its temporary marker.
    }
  }
});

const REPORT = {
  schema: 'scripture-search-engine/gauntlet-report/v2',
  payload: {
    verdict: 'ADMIT',
    headline: 'Admissible. All applicable gates passed.',
  },
};

describe('gauntlet health adapter', () => {
  it('accepts exact ADMIT only after report freshness verifies', () => {
    expect(gauntletHealthFromParsed(REPORT, { fresh: true, mismatches: [] }, 'report.json')).toMatchObject({
      status: 'healthy',
      verdict: 'ADMIT',
      fresh: true,
    });
  });

  it('fails closed when report identity is stale', () => {
    expect(
      gauntletHealthFromParsed(
        REPORT,
        { fresh: false, mismatches: [{ code: 'sse.gauntlet.v1.freshness.dirty-tree-mismatch', message: 'dirty tree changed' }] },
        'report.json',
      ),
    ).toMatchObject({
      status: 'stale',
      fresh: false,
      mismatchReasons: ['dirty tree changed'],
    });
  });

  it('keeps digest-tampered reports rejected', () => {
    expect(
      gauntletHealthFromParsed(
        REPORT,
        {
          fresh: false,
          mismatches: [{ code: 'sse.gauntlet.v1.freshness.report-digest-mismatch', message: 'digest changed' }],
        },
        'report.json',
      ),
    ).toMatchObject({ status: 'rejected', fresh: false });
  });

  it('rejects warning verdicts even when the report is current', () => {
    const warning = { ...REPORT, payload: { ...REPORT.payload, verdict: 'ADMIT_WITH_WARNINGS' } };
    expect(gauntletHealthFromParsed(warning, { fresh: true, mismatches: [] }, 'report.json')).toMatchObject({
      status: 'rejected',
      verdict: 'ADMIT_WITH_WARNINGS',
      fresh: true,
    });
  });
});

describe('health source semantics', () => {
  it('mirrors G3 active fixture coverage, including implicit fixture-id coverage', async () => {
    const { golden, coverage } = await readGoldenAndCoverage();
    expect(golden.filter((fixture) => fixture.status === 'active').length).toBeGreaterThan(0);
    // 131 = 58 founding concepts + the 20 round-1 books-harvest packs +
    // the 30 round-2 books-harvest packs (2026-08-18) + the 14 Genesis-pilot
    // packs (2026-08-22, PR #41) + asking-in-gods-will
    // (2026-08-21 prosperity-slogan adversarial coverage) + benediction +
    // justification-by-faith (2026-08-21 Phase-4 P4.9/P4.1 gap packs) +
    // trinity + incarnation (2026-08-21 Phase-4 P4.4/P4.5 doctrinal
    // locator packs) + baptism + christ-the-cornerstone + doubt
    // (2026-08-21 Phase-4 P4.10a/P4.10b/P4.10c) +
    // caring-for-aging-parents (2026-08-22 Phase-4 P4.6, the fn13 fix)
    // + the 6 apologetics-wave batch-2 packs (2026-08-25: no-other-god,
    // gods-unchanging-nature, supremacy-of-christ, i-am-sayings,
    // the-first-and-the-last, honor-the-son — each with an active
    // demonstrating fixture in the same change)
    // + the 4 apologetics-wave batch-3 packs (2026-08-25:
    // creation-testifies, design-in-creation, conscience,
    // the-breath-of-life — each with an active demonstrating fixture in
    // the same change)
    // + the 4 apologetics-wave batch-4 packs (2026-08-25:
    // why-god-allows-suffering, suffering-of-the-righteous,
    // prosperity-of-the-wicked, resurrection-of-the-dead — each with an
    // active demonstrating fixture in the same change)
    // + the 6 apologetics-wave batch-5 packs (2026-08-25:
    // trustworthiness-of-scripture, power-of-gods-word, no-other-gospel,
    // false-prophets, jesus-the-only-way, giving-an-answer — each with
    // an active demonstrating fixture in the same change).
    // + the 2 apologetics master-tag packs (2026-08-25, Decision D13
    // approved by Jesse: mormon-evangelism, jehovahs-witness-evangelism
    // — each with an active demonstrating fixture in the same change).
    // + the 15 tag-gap rollout batch-1 packs (2026-08-26, Themes A-B of the
    // adopted tag-gap review: idolatry, fasting, empty-worship, priesthood,
    // passover, the-house-of-god, appointed-feasts, clean-and-unclean,
    // remnant, day-of-the-lord, restoration-of-israel, messianic-prophecy,
    // antichrist, servant-of-the-lord, gods-plan-for-israel — each with an
    // active demonstrating fixture in the same change).
    // + the 13 tag-gap rollout batch-2 packs (2026-08-26, Themes C-D of the
    // adopted tag-gap review: slow-to-anger, mercy, knowing-god, god-reigns,
    // the-name-of-god, living-water, glory-of-god, angels,
    // occult-and-divination, holy-spirit, deliverance-from-demons, satan,
    // walking-by-the-spirit — each with an active demonstrating fixture in
    // the same change; the batch's two extensions ride providence and
    // gods-love, so they add no ids here).
    // + the 13 tag-gap rollout batch-3 packs (2026-08-26, Theme E slice of
    // the adopted tag-gap review: oaths-and-vows, leadership,
    // fear-of-the-lord, temptation, hardness-of-heart,
    // money-and-possessions, judging-others, betrayal,
    // grumbling-and-complaining, kindness, integrity, drunkenness,
    // favoritism — each with an active demonstrating fixture in the same
    // change).
    // + the 14 tag-gap rollout batch-4 packs (2026-08-26, Themes E/F/G of
    // the adopted tag-gap review: seasons-of-life, enjoying-gods-gifts,
    // receiving-correction, thought-life, trusting-in-man, covetousness,
    // mortality, justice-and-oppression, sojourners-and-strangers,
    // vengeance, governing-authorities, care-for-widows,
    // bondservants-and-masters, individual-responsibility — each with an
    // active demonstrating fixture in the same change).
    // + the 15 tag-gap rollout batch-5 packs (2026-08-26, Themes H-I of
    // the adopted tag-gap review: lament, unanswered-prayer,
    // comforting-others, aging-and-old-age, slander-and-false-accusation,
    // shame, discipleship, loving-god, servanthood, backsliding,
    // seeking-god, putting-god-first, good-works, complacency,
    // watchman-and-warning — each with an active demonstrating fixture in
    // the same change; the batch's three extensions ride
    // rest-for-the-weary, glory-of-god, and freedom-from-bondage, so they
    // add no ids here).
    // + the 16 tag-gap rollout batch-6 packs (2026-08-26, Themes J-M of
    // the adopted tag-gap review: church-discipline,
    // revival-and-reformation, shepherds-and-the-flock,
    // unity-of-the-church, supporting-gospel-workers, head-coverings,
    // singleness, signs-and-wonders, boldness-in-witness,
    // kingdom-of-heaven, election-and-predestination,
    // adoption-as-gods-children, ascension, witness-testimony,
    // light-and-darkness, zion-city-of-god — each with an active
    // demonstrating fixture in the same change; the batch's four
    // extensions ride spiritual-gifts, walking-in-the-light, conscience,
    // and salvation, so they add no ids here).
    // This mirror moves whenever a concept wave is admitted.
    // 2026-08-26 alias-mining batch 1: 239 -> 243 (remembered-cast-your-care,
    // remembered-no-weapon-shall-prosper, remembered-wait-for-the-lord,
    // remembered-mind-stayed-on-thee — each with an active demonstrating
    // fixture in the same change; the batch's the-cross lexicon extension
    // rides an existing id).
    // 2026-08-27 batch-1 held row admitted post corpus expansion (#64):
    // 243 -> 244 (remembered-calls-things-that-are-not, with its active
    // demonstrating fixture in the same change).
    // 2026-08-27 corpus-blocked roster build (post-#64 full corpus):
    // 244 -> 288 — 44 new ids across five waves (Themes A-M); the
    // roster's three extensions ride loving-god, giving-an-answer, and
    // new-creation, so they add no ids here.
    // 2026-08-30 supplement §2 execution (post-v0.14.0-mint follow-up):
    // 288 -> 289 (virgin-birth — the ruled DISTINCT concept, Decision 11
    // closed; its previously pending fixture flips active in the same
    // change).
    expect(coverage).toHaveLength(289);
    expect(coverage.filter((entry) => entry.status === 'active')).toHaveLength(289);
    expect(coverage.filter((entry) => entry.status === 'uncovered')).toEqual([]);
    expect(coverage).toContainEqual({ id: 'creation', status: 'active' });
  });

  it('recognizes only a fresh, live gauntlet marker as running', async () => {
    const marker = path.join(os.tmpdir(), `gauntlet-running-${process.pid}.json`);
    temporaryFiles.push(marker);
    writeFileSync(marker, JSON.stringify(runningMarker(new Date().toISOString())), 'utf8');
    await expect(readActiveGauntletRun(marker)).resolves.toMatchObject({ status: 'running' });

    writeFileSync(marker, JSON.stringify(runningMarker('2000-01-01T00:00:00.000Z')), 'utf8');
    await expect(readActiveGauntletRun(marker)).resolves.toBeNull();

    writeFileSync(marker, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }), 'utf8');
    await expect(readActiveGauntletRun(marker)).resolves.toBeNull();
  });

  it('labels external reports explicitly instead of displaying relative traversal', () => {
    const external = path.join(os.tmpdir(), 'sse-external-gauntlet-report.json');
    expect(displayReportPath(external)).toBe(`external:${path.resolve(external).replaceAll('\\', '/')}`);
  });
});

describe('legacy judgment log health', () => {
  const realJudgmentsPath = path.join(repoRoot, 'workbench', 'judgments.jsonl');
  const realManifestPath = path.join(repoRoot, 'workbench', 'legacy', 'migration-manifest.json');

  function temporaryLog(suffix: string, content: string): string {
    const file = path.join(os.tmpdir(), `sse-legacy-log-${process.pid}-${suffix}.jsonl`);
    temporaryFiles.push(file);
    writeFileSync(file, content, 'utf8');
    return file;
  }

  it('reports the committed log as closed and canonical', async () => {
    await expect(readLegacyLogHealth(realJudgmentsPath, realManifestPath)).resolves.toEqual({
      status: 'closed-canonical',
      strayLineNumbers: [],
      message: 'Legacy judgment log is closed and canonical (3 manifested v1 lines).',
    });
  });

  it('warns on a stray legacy append with its true file line number, never throwing', async () => {
    const raw = readFileSync(realJudgmentsPath, 'utf8');
    const stray = JSON.stringify({ ...JSON.parse(raw.split('\n')[0]!) as object, note: 'stray' });
    const logPath = temporaryLog('stray', `${raw}${stray}\n`);
    const health = await readLegacyLogHealth(logPath, realManifestPath);
    expect(health).toMatchObject({ status: 'stray-lines', strayLineNumbers: [4] });
    expect(health!.message).toContain('line(s) 4');
    expect(health!.message).toContain('v2 workbench');
  });

  it('ignores v2 lines and counts stray positions in the real file', async () => {
    const raw = readFileSync(realJudgmentsPath, 'utf8');
    const v2Line = JSON.stringify({ schemaVersion: 2, anything: true });
    const stray = JSON.stringify({ ...JSON.parse(raw.split('\n')[0]!) as object, note: 'stray' });
    const logPath = temporaryLog('mixed', `${raw}${v2Line}\n${stray}\n`);
    await expect(readLegacyLogHealth(logPath, realManifestPath)).resolves.toMatchObject({
      status: 'stray-lines',
      strayLineNumbers: [5],
    });
  });

  it('flags an edited or deleted manifested line as not canonical', async () => {
    const raw = readFileSync(realJudgmentsPath, 'utf8');
    const [first, ...rest] = raw.split('\n');
    void first;
    const logPath = temporaryLog('truncated', rest.join('\n'));
    await expect(readLegacyLogHealth(logPath, realManifestPath)).resolves.toMatchObject({
      status: 'not-canonical',
      strayLineNumbers: [],
    });
  });

  it('reports an absent manifest as absent instead of failing', async () => {
    await expect(
      readLegacyLogHealth(realJudgmentsPath, path.join(os.tmpdir(), `sse-no-manifest-${process.pid}.json`)),
    ).resolves.toMatchObject({ status: 'absent' });
  });
});
