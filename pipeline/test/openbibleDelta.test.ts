/**
 * The OpenBible re-pin vote-delta tool's verdicts (plan P2.2 / RH-4, prep
 * item W-E).
 *
 * RH-4's delta measurement is "vote-movement analysis, not verse text: diff
 * topic→verse vote sets, report adds/removes/moved magnitudes, and
 * re-confirm the CC BY license header in the new bytes — a changed header is
 * a rights stop" (scratchpad deep-dive RH-4 §3; process
 * docs/source-repins.md §2). Each verdict authorizes a different human
 * action, so the expensive wrong verdicts are tested by name:
 *
 *   - movement on rows the curated layers consume (subscribed topics /
 *     committed xref evidence) reported as outside-scope would skip the
 *     review Jesse owes those rows before the re-pin merges;
 *   - a subscribed topic vanishing from the candidate reported as a mere
 *     row-removal would hide a dangling subscription (a concept silently
 *     losing every OpenBible anchor);
 *   - a reworded or missing license header reported as data movement would
 *     turn a rights STOP into a checklist item;
 *   - an add/remove invented or hidden under the subset witness would
 *     misstate what the witness can actually see.
 *
 * Everything runs on synthetic payloads written to a temp dir; no network,
 * no committed fixtures touched.
 */

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, describe, expect, it } from 'vitest';

import {
  checkLicenseHeader,
  classifyTopicDelta,
  classifyXrefDelta,
  collectConsumedTopics,
  computeTopicDelta,
  computeXrefDelta,
  formatRange,
  loadCommittedXrefEvidence,
  loadOpenbiblePayload,
  PINNED_FULL_HEADERS,
  runOpenbibleDelta,
  xrefKey,
  type ConsumedTopics,
} from '../scripts/openbibleDelta.js';
import type { CrossReferenceRow, TopicAnchorRow } from '../src/importers/openbibleImporter.js';
import { scoreToWeight } from '../src/importers/openbibleImporter.js';
import { makeVerseId } from '../src/verseId.js';

const PIPELINE_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TMP = mkdtempSync(join(tmpdir(), 'openbible-delta-test-'));
afterAll(() => rmSync(TMP, { recursive: true, force: true }));

function topicRow(topic: string, verseId: number, score: number, endVerseId?: number): TopicAnchorRow {
  return { topic, startVerseId: verseId, endVerseId: endVerseId ?? verseId, score };
}

function xref(from: number, toStart: number, votes: number, toEnd?: number): CrossReferenceRow {
  return { fromVerseId: from, toStartVerseId: toStart, toEndVerseId: toEnd ?? toStart, votes };
}

const JAS_2_14 = makeVerseId(59, 2, 14);
const JAS_2_26 = makeVerseId(59, 2, 26);
const EPH_2_8 = makeVerseId(49, 2, 8);
const PS_46_1 = makeVerseId(19, 46, 1);
const JOHN_15_4 = makeVerseId(43, 15, 4);
const GEN_1_1 = makeVerseId(1, 1, 1);
const PS_124_8 = makeVerseId(19, 124, 8);
const PROV_16_4 = makeVerseId(20, 16, 4);

/** A consumed-scope stub: one subscribed topic, one concept. */
const CONSUMED: ConsumedTopics = {
  topics: new Set(['faith and works']),
  conceptsByTopic: new Map([['faith and works', ['faith-and-works']]]),
  conceptFileCount: 1,
};

// Real header shapes, live-verified 2026-08-21 (smoke capture): the license
// grant plus a per-release generation date the check must NOT stop on.
const TOPICS_HEADER_OLD =
  'Topic\tOSIS\tQuality Score (based on percentage of votes for the passage)\t# Generated 2026-07-27. CC-BY License: www.openbible.info/topics';
const TOPICS_HEADER_NEW =
  'Topic\tOSIS\tQuality Score (based on percentage of votes for the passage)\t# Generated 2026-08-17. CC-BY License: www.openbible.info/topics';
const XREFS_HEADER_OLD = 'From Verse\tTo Verse\tVotes\t#www.openbible.info CC-BY 2026-07-27';
const XREFS_HEADER_NEW = 'From Verse\tTo Verse\tVotes\t#www.openbible.info CC-BY 2026-08-17';

describe('computeTopicDelta', () => {
  const OLD: readonly TopicAnchorRow[] = [
    topicRow('faith and works', JAS_2_14, 4, JAS_2_26),
    topicRow('faith and works', EPH_2_8, 3),
    topicRow('trust', PS_46_1, 5),
  ];

  it('reports row adds, removes, and score shifts with both scores and both weights', () => {
    const NEW: readonly TopicAnchorRow[] = [
      topicRow('faith and works', JAS_2_14, 7, JAS_2_26), // shifted 4 -> 7
      // Eph 2:8 row removed
      topicRow('trust', PS_46_1, 5), // identical
      topicRow('trust', JOHN_15_4, 2), // added
    ];
    const delta = computeTopicDelta(OLD, NEW, CONSUMED);
    expect(delta.scoreShifts).toHaveLength(1);
    const shift = delta.scoreShifts[0]!;
    expect(shift.topic).toBe('faith and works');
    expect(shift.oldScore).toBe(4);
    expect(shift.newScore).toBe(7);
    // The magnitude the curated layers actually consume is scoreToWeight —
    // the exact join buildConceptLayer performs for subscribed topics.
    expect(shift.oldWeight).toBe(scoreToWeight(4));
    expect(shift.newWeight).toBe(scoreToWeight(7));
    expect(shift.consumed).toBe(true);
    expect(delta.rowsRemoved.map((row) => row.topic)).toEqual(['faith and works']);
    expect(delta.rowsAdded.map((row) => row.topic)).toEqual(['trust']);
    expect(delta.rowsAdded[0]!.consumed).toBe(false);
    expect(delta.comparedRows).toBe(2); // rows keyed identically on both sides
  });

  it('keys rows by (topic, range): the same range under two topics is two rows', () => {
    const old = [topicRow('trust', PS_46_1, 5), topicRow('refuge', PS_46_1, 9)];
    const next = [topicRow('trust', PS_46_1, 5), topicRow('refuge', PS_46_1, 4)];
    const delta = computeTopicDelta(old, next, CONSUMED);
    expect(delta.scoreShifts).toHaveLength(1);
    expect(delta.scoreShifts[0]!.topic).toBe('refuge');
  });

  it('a range change is a remove plus an add, never a silent re-keying', () => {
    const old = [topicRow('faith and works', JAS_2_14, 4, JAS_2_26)];
    const next = [topicRow('faith and works', JAS_2_14, 4)]; // range collapsed to one verse
    const delta = computeTopicDelta(old, next, CONSUMED);
    expect(delta.rowsRemoved).toHaveLength(1);
    expect(delta.rowsAdded).toHaveLength(1);
    expect(delta.scoreShifts).toEqual([]);
  });

  it('reports topic-level adds and removes on full payloads', () => {
    const NEW = [
      topicRow('faith and works', JAS_2_14, 4, JAS_2_26),
      topicRow('faith and works', EPH_2_8, 3),
      topicRow('perseverance', JOHN_15_4, 6), // whole new topic
      // 'trust' gone entirely
    ];
    const delta = computeTopicDelta(OLD, NEW, CONSUMED);
    expect(delta.topicsAdded).toEqual(['perseverance']);
    expect(delta.topicsRemoved).toEqual(['trust']);
  });

  it('names a subscribed topic missing from the candidate — a dangling subscription, with its concept ids', () => {
    const NEW = [topicRow('trust', PS_46_1, 5)]; // 'faith and works' gone
    const delta = computeTopicDelta(OLD, NEW, CONSUMED);
    expect(delta.consumedTopicsMissing).toEqual([
      { topic: 'faith and works', conceptIds: ['faith-and-works'] },
    ]);
  });

  it('under the subset witness: adds are out of scope, removals and shifts still report', () => {
    const NEW = [
      topicRow('faith and works', JAS_2_14, 9, JAS_2_26), // shifted
      // Eph 2:8 removed
      topicRow('trust', PS_46_1, 5),
      topicRow('brand new topic', GEN_1_1, 8), // out of the witness's sight
    ];
    const delta = computeTopicDelta(OLD, NEW, CONSUMED, { restrictToWitness: true });
    expect(delta.restricted).toBe(true);
    expect(delta.topicsAdded).toEqual([]);
    expect(delta.rowsAdded).toEqual([]);
    expect(delta.rowsRemoved.map((row) => row.ref)).toEqual(['Ephesians 2:8']);
    expect(delta.scoreShifts).toHaveLength(1);
    expect(delta.scoreShifts[0]!.newScore).toBe(9);
  });

  it('with no consumed scope supplied, nothing is marked consumed', () => {
    const NEW = [topicRow('faith and works', JAS_2_14, 9, JAS_2_26)];
    const delta = computeTopicDelta(
      [topicRow('faith and works', JAS_2_14, 4, JAS_2_26)],
      NEW,
      null,
    );
    expect(delta.scoreShifts[0]!.consumed).toBe(false);
    expect(delta.consumedTopicsMissing).toEqual([]);
  });
});

describe('computeXrefDelta', () => {
  const COMMITTED = new Set([xrefKey(GEN_1_1, PS_124_8, PS_124_8)]);
  const OLD: readonly CrossReferenceRow[] = [
    xref(GEN_1_1, PS_124_8, 71),
    xref(GEN_1_1, PROV_16_4, 65),
    xref(JOHN_15_4, JAS_2_14, 3),
  ];

  it('reports edge adds, removes, and vote shifts with both vote counts', () => {
    const NEW: readonly CrossReferenceRow[] = [
      xref(GEN_1_1, PS_124_8, 74), // shifted 71 -> 74
      // Gen 1:1 -> Prov 16:4 removed
      xref(JOHN_15_4, JAS_2_14, 3), // identical
      xref(JOHN_15_4, EPH_2_8, 5), // added
    ];
    const delta = computeXrefDelta(OLD, NEW, COMMITTED);
    expect(delta.voteShifts).toHaveLength(1);
    expect(delta.voteShifts[0]!.oldVotes).toBe(71);
    expect(delta.voteShifts[0]!.newVotes).toBe(74);
    expect(delta.voteShifts[0]!.touchesCommitted).toBe(true);
    expect(delta.edgesRemoved.map((edge) => edge.ref)).toEqual([
      'Genesis 1:1 -> Proverbs 16:4',
    ]);
    expect(delta.edgesAdded).toHaveLength(1);
    expect(delta.edgesAdded[0]!.touchesCommitted).toBe(false);
    expect(delta.comparedEdges).toBe(2);
  });

  it('marks committed-evidence hits on adds and removes too', () => {
    const committed = new Set([
      xrefKey(GEN_1_1, PROV_16_4, PROV_16_4),
      xrefKey(JOHN_15_4, EPH_2_8, EPH_2_8),
    ]);
    const NEW = [
      xref(GEN_1_1, PS_124_8, 71),
      xref(JOHN_15_4, JAS_2_14, 3),
      xref(JOHN_15_4, EPH_2_8, 5),
    ];
    const delta = computeXrefDelta(OLD, NEW, committed);
    expect(delta.edgesRemoved[0]!.touchesCommitted).toBe(true); // Prov 16:4 edge
    expect(delta.edgesAdded[0]!.touchesCommitted).toBe(true); // Eph 2:8 edge
  });

  it('keeps downvoted edges visible: a vote drop across the import threshold is a shift flagged leaves-build, not a fake removal', () => {
    const old = [xref(GEN_1_1, PS_124_8, 5)];
    const next = [xref(GEN_1_1, PS_124_8, -2)];
    const delta = computeXrefDelta(old, next, COMMITTED);
    expect(delta.edgesRemoved).toEqual([]);
    expect(delta.voteShifts).toHaveLength(1);
    expect(delta.voteShifts[0]!.importability).toBe('leaves-build');
    const back = computeXrefDelta(next, old, COMMITTED);
    expect(back.voteShifts[0]!.importability).toBe('enters-build');
    const within = computeXrefDelta(old, [xref(GEN_1_1, PS_124_8, 9)], COMMITTED);
    expect(within.voteShifts[0]!.importability).toBeNull();
  });

  it('under the subset witness: adds are out of scope, removals still report', () => {
    const NEW = [
      xref(GEN_1_1, PS_124_8, 71),
      // Prov 16:4 edge removed, John->Jas removed
      xref(EPH_2_8, PS_46_1, 12), // outside the witness
    ];
    const delta = computeXrefDelta(OLD, NEW, COMMITTED, { restrictToWitness: true });
    expect(delta.restricted).toBe(true);
    expect(delta.edgesAdded).toEqual([]);
    expect(delta.edgesRemoved).toHaveLength(2);
  });
});

describe('checkLicenseHeader', () => {
  it('accepts an intact license grant whose generation date rolled, and reports both dates', () => {
    const topics = checkLicenseHeader('topics', TOPICS_HEADER_OLD, TOPICS_HEADER_NEW);
    expect(topics.stop).toBe(false);
    expect(topics.markerPresent).toBe(true);
    expect(topics.licenseTextChanged).toBe(false);
    expect(topics.oldDate).toBe('2026-07-27');
    expect(topics.newDate).toBe('2026-08-17');
    const xrefs = checkLicenseHeader('xrefs', XREFS_HEADER_OLD, XREFS_HEADER_NEW);
    expect(xrefs.stop).toBe(false);
    expect(xrefs.licenseTextChanged).toBe(false);
  });

  it('STOPs when the license marker is missing from the new header', () => {
    const stripped = 'Topic\tOSIS\tQuality Score\t# Generated 2026-08-17.';
    const check = checkLicenseHeader('topics', TOPICS_HEADER_OLD, stripped);
    expect(check.markerPresent).toBe(false);
    expect(check.stop).toBe(true);
  });

  it('STOPs when the license text changed beyond the date, even with the marker still present', () => {
    const reworded = XREFS_HEADER_NEW.replace(
      'www.openbible.info CC-BY 2026-08-17',
      'www.openbible.info CC-BY 2026-08-17 (non-commercial use only)',
    );
    const check = checkLicenseHeader('xrefs', XREFS_HEADER_OLD, reworded);
    expect(check.markerPresent).toBe(true);
    expect(check.licenseTextChanged).toBe(true);
    expect(check.stop).toBe(true);
  });

  it('with no old header (subset witness), the pinned wording stands in and the full comparison still runs', () => {
    const check = checkLicenseHeader('topics', null, TOPICS_HEADER_NEW);
    expect(check.stop).toBe(false);
    expect(check.oldWordingSource).toBe('pinned-record');
    // The comparison RAN (against PINNED_FULL_HEADERS), it did not degrade
    // to the marker probe: a date roll relative to the pinned wording is
    // still not a change.
    expect(check.licenseTextChanged).toBe(false);
    const missing = checkLicenseHeader('topics', null, 'Topic\tOSIS\tScore');
    expect(missing.stop).toBe(true);
  });

  it('WRONG VERDICT GUARD: a CC-BY-NC candidate under the witness (no old header) STOPs even though the prefix-open marker matches', () => {
    // "www.openbible.info CC-BY" is a substring of "…CC-BY-NC…", so the
    // marker probe alone would green-light a rights RESTRICTION — the exact
    // class the STOP exists for. The pinned-wording comparison must catch it.
    const nc = 'From Verse\tTo Verse\tVotes\t#www.openbible.info CC-BY-NC 2026-08-17';
    const check = checkLicenseHeader('xrefs', null, nc);
    expect(check.markerPresent).toBe(true); // the marker probe IS fooled
    expect(check.licenseTextChanged).toBe(true);
    expect(check.stop).toBe(true);
    // Topics variant: a suffix appended after the (closed) topics marker.
    const restricted = TOPICS_HEADER_NEW.replace(
      'www.openbible.info/topics',
      'www.openbible.info/topics (non-commercial use only)',
    );
    const topicsCheck = checkLicenseHeader('topics', null, restricted);
    expect(topicsCheck.markerPresent).toBe(true);
    expect(topicsCheck.stop).toBe(true);
  });

  it('pinned wordings mirror the manifests\' licenseRecord quotes and the live-verified headers', () => {
    // The pinned constants are the witness-mode old side; if they drift from
    // what the manifests record (or from the live-verified header shapes,
    // dates aside), witness mode compares against fiction.
    const strip = (header: string): string =>
      header.replace(/\d{4}-\d{2}-\d{2}/g, '<date>');
    expect(strip(PINNED_FULL_HEADERS.topics)).toBe(strip(TOPICS_HEADER_OLD));
    expect(strip(PINNED_FULL_HEADERS.xrefs)).toBe(strip(XREFS_HEADER_OLD));
    for (const [kind, manifest] of [
      ['topics', 'openbible-topics.json'],
      ['xrefs', 'openbible-xrefs.json'],
    ] as const) {
      const record = (
        JSON.parse(readFileSync(join(PIPELINE_ROOT, 'manifests', manifest), 'utf8')) as {
          licenseRecord: string;
        }
      ).licenseRecord;
      const quoted = /header states: '([^']+)'/.exec(record)?.[1];
      expect(quoted).toBeTruthy();
      expect(strip(PINNED_FULL_HEADERS[kind])).toContain(strip(quoted!));
    }
  });
});

describe('classification', () => {
  const okLicense = checkLicenseHeader('topics', TOPICS_HEADER_OLD, TOPICS_HEADER_NEW);
  const okXrefLicense = checkLicenseHeader('xrefs', XREFS_HEADER_OLD, XREFS_HEADER_NEW);

  it('identical payloads with an intact license classify as identical', () => {
    const rows = [topicRow('faith and works', JAS_2_14, 4, JAS_2_26)];
    const delta = computeTopicDelta(rows, rows, CONSUMED);
    expect(classifyTopicDelta(delta, okLicense, true)).toBe('identical');
  });

  it('movement outside consumed scope is class (a)', () => {
    const delta = computeTopicDelta(
      [topicRow('trust', PS_46_1, 5)],
      [topicRow('trust', PS_46_1, 9)],
      CONSUMED,
    );
    expect(classifyTopicDelta(delta, okLicense, true)).toBe('a-outside-consumed-scope');
  });

  it('a shift on a subscribed topic is class (b), the Jesse-review class', () => {
    const delta = computeTopicDelta(
      [topicRow('faith and works', JAS_2_14, 4, JAS_2_26)],
      [topicRow('faith and works', JAS_2_14, 7, JAS_2_26)],
      CONSUMED,
    );
    expect(classifyTopicDelta(delta, okLicense, true)).toBe('b-consumed-scope-movement');
  });

  it('a dangling subscription is class (b) even with every surviving row identical', () => {
    const delta = computeTopicDelta(
      [topicRow('faith and works', JAS_2_14, 4, JAS_2_26), topicRow('trust', PS_46_1, 5)],
      [topicRow('trust', PS_46_1, 5)],
      CONSUMED,
    );
    expect(classifyTopicDelta(delta, okLicense, true)).toBe('b-consumed-scope-movement');
  });

  it('a changed license header overrides every data verdict with license-stop', () => {
    const rows = [topicRow('faith and works', JAS_2_14, 4, JAS_2_26)];
    const identicalDelta = computeTopicDelta(rows, rows, CONSUMED);
    const badLicense = checkLicenseHeader('topics', TOPICS_HEADER_OLD, 'Topic\tOSIS\tScore');
    expect(classifyTopicDelta(identicalDelta, badLicense, true)).toBe('license-stop');
  });

  it('xref movement touching committed evidence is class (b); movement elsewhere is class (a)', () => {
    const committed = new Set([xrefKey(GEN_1_1, PS_124_8, PS_124_8)]);
    const touching = computeXrefDelta(
      [xref(GEN_1_1, PS_124_8, 71)],
      [xref(GEN_1_1, PS_124_8, 74)],
      committed,
    );
    expect(classifyXrefDelta(touching, okXrefLicense, true)).toBe('b-consumed-scope-movement');
    const elsewhere = computeXrefDelta(
      [xref(JOHN_15_4, JAS_2_14, 3)],
      [xref(JOHN_15_4, JAS_2_14, 8)],
      committed,
    );
    expect(classifyXrefDelta(elsewhere, okXrefLicense, true)).toBe('a-outside-consumed-scope');
  });

  it('with consumed scope absent, movement caps at (a) — the report is what warns', () => {
    const delta = computeTopicDelta(
      [topicRow('faith and works', JAS_2_14, 4, JAS_2_26)],
      [topicRow('faith and works', JAS_2_14, 7, JAS_2_26)],
      null,
    );
    expect(classifyTopicDelta(delta, okLicense, false)).toBe('a-outside-consumed-scope');
  });
});

describe('payload loading', () => {
  function write(name: string, contents: string): string {
    const path = join(TMP, name);
    writeFileSync(path, contents);
    return path;
  }

  it('loads a raw topic-scores payload with its header line', () => {
    const path = write(
      'topics.txt',
      [TOPICS_HEADER_NEW, 'faith and works\tJas.2.14-Jas.2.26\t4', 'trust\tPs.46.1\t5', ''].join(
        '\n',
      ),
    );
    const payload = loadOpenbiblePayload(path, 'topics');
    expect(payload.kind).toBe('raw-text');
    expect(payload.header).toBe(TOPICS_HEADER_NEW);
    expect(payload.topicRows).toHaveLength(2);
    expect(payload.topicRows![0]!.startVerseId).toBe(JAS_2_14);
  });

  it('loads a cross-references payload keeping downvoted edges', () => {
    const path = write(
      'xrefs.txt',
      [XREFS_HEADER_NEW, 'Gen.1.1\tPs.124.8\t71', 'John.15.4\tJas.2.14\t-3', ''].join('\n'),
    );
    const payload = loadOpenbiblePayload(path, 'xrefs');
    expect(payload.xrefRows).toHaveLength(2);
    expect(payload.xrefRows![1]!.votes).toBe(-3);
  });

  it('loads the committed subset as a headerless witness for either source', () => {
    const subset = {
      $schema: 'openbible-subset/1',
      topicRows: [{ topic: 'faith and works', startVerseId: JAS_2_14, endVerseId: JAS_2_26, score: 4 }],
      crossReferences: [
        { fromVerseId: GEN_1_1, toStartVerseId: PS_124_8, toEndVerseId: PS_124_8, votes: 71 },
      ],
    };
    const path = write('subset.json', JSON.stringify(subset));
    const topics = loadOpenbiblePayload(path, 'topics');
    expect(topics.kind).toBe('openbible-subset');
    expect(topics.header).toBeNull();
    expect(topics.topicRows).toHaveLength(1);
    const xrefs = loadOpenbiblePayload(path, 'xrefs');
    expect(xrefs.xrefRows).toHaveLength(1);
  });

  it('loads a zip by extracting its single text entry', () => {
    const dir = join(TMP, 'zip-src');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'topic-scores.txt'),
      [TOPICS_HEADER_NEW, 'trust\tPs.46.1\t5', ''].join('\n'),
    );
    const zipPath = join(TMP, 'topics.zip');
    execFileSync('zip', ['-j', '-q', zipPath, join(dir, 'topic-scores.txt')]);
    const payload = loadOpenbiblePayload(zipPath, 'topics');
    expect(payload.kind).toBe('zip');
    expect(payload.topicRows).toHaveLength(1);
    expect(payload.header).toBe(TOPICS_HEADER_NEW);
  });

  it('counts rejected rows instead of silently dropping them', () => {
    const path = write(
      'topics-bad.txt',
      [TOPICS_HEADER_NEW, 'trust\tNonsense.9.9\t5', 'trust\tPs.46.1\t5', ''].join('\n'),
    );
    const payload = loadOpenbiblePayload(path, 'topics');
    expect(payload.rejected).toBe(1);
    expect(payload.topicRows).toHaveLength(1);
  });

  it('loadCommittedXrefEvidence keys every committed edge', () => {
    const subset = {
      crossReferences: [
        { fromVerseId: GEN_1_1, toStartVerseId: PS_124_8, toEndVerseId: PS_124_8, votes: 71 },
      ],
    };
    const path = write('committed.json', JSON.stringify(subset));
    const evidence = loadCommittedXrefEvidence(path);
    expect(evidence.has(xrefKey(GEN_1_1, PS_124_8, PS_124_8))).toBe(true);
    expect(evidence.size).toBe(1);
  });
});

describe('collectConsumedTopics', () => {
  it('reads openbibleTopics subscriptions out of concept YAML', () => {
    const dir = join(TMP, 'concepts');
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'faith-and-works.yaml'),
      [
        'id: faith-and-works',
        'label: Faith and works',
        'lexicon:',
        '  - faith without works',
        '  - dead faith',
        'anchors:',
        '  - ref: James 2:14-26',
        '    sources: [editorial]',
        '    weight: 1.0',
        'openbibleTopics:',
        '  - Faith and Works',
        '',
      ].join('\n'),
    );
    writeFileSync(
      join(dir, 'no-subscription.yaml'),
      [
        'id: no-subscription',
        'label: No subscription',
        'lexicon:',
        '  - some phrase',
        '  - another phrase',
        'anchors:',
        '  - ref: John 15:4',
        '    sources: [editorial]',
        '    weight: 1.0',
        '',
      ].join('\n'),
    );
    const consumed = collectConsumedTopics(dir);
    expect(consumed.conceptFileCount).toBe(2);
    // Normalized exactly like the importer join: trimmed, lowercased.
    expect(consumed.topics.has('faith and works')).toBe(true);
    expect(consumed.conceptsByTopic.get('faith and works')).toEqual(['faith-and-works']);
  });
});

describe('formatRange', () => {
  it('renders single verses, in-chapter ranges, and cross-chapter ranges', () => {
    expect(formatRange(JAS_2_14, JAS_2_14)).toBe('James 2:14');
    expect(formatRange(JAS_2_14, JAS_2_26)).toBe('James 2:14-26');
    expect(formatRange(makeVerseId(59, 2, 14), makeVerseId(59, 3, 2))).toBe(
      'James 2:14 - James 3:2',
    );
  });
});

describe('runOpenbibleDelta (file-level CLI behavior)', () => {
  const conceptsDir = join(TMP, 'cli-concepts');
  mkdirSync(conceptsDir, { recursive: true });
  writeFileSync(
    join(conceptsDir, 'faith-and-works.yaml'),
    [
      'id: faith-and-works',
      'label: Faith and works',
      'lexicon:',
      '  - faith without works',
      '  - dead faith',
      'anchors:',
      '  - ref: James 2:14-26',
      '    sources: [editorial]',
      '    weight: 1.0',
      'openbibleTopics:',
      '  - faith and works',
      '',
    ].join('\n'),
  );

  const OLD_TOPICS = [
    TOPICS_HEADER_OLD,
    'faith and works\tJas.2.14-Jas.2.26\t4',
    'trust\tPs.46.1\t5',
    '',
  ].join('\n');

  function write(name: string, contents: string): string {
    const path = join(TMP, name);
    writeFileSync(path, contents);
    return path;
  }

  it('exits 0 on identical payloads, with or without --check', () => {
    const oldPath = write('cli-old-a.txt', OLD_TOPICS);
    const newPath = write('cli-new-a.txt', OLD_TOPICS);
    const base = { kind: 'topics' as const, oldPath, newPath, conceptsDir };
    expect(runOpenbibleDelta({ ...base, check: true }).exitCode).toBe(0);
    expect(runOpenbibleDelta({ ...base, check: false }).exitCode).toBe(0);
  });

  it('exits 1 under --check on consumed-scope movement, and the report carries both scores and both weights', () => {
    const oldPath = write('cli-old-b.txt', OLD_TOPICS);
    const newPath = write(
      'cli-new-b.txt',
      OLD_TOPICS.replace('faith and works\tJas.2.14-Jas.2.26\t4', 'faith and works\tJas.2.14-Jas.2.26\t9'),
    );
    const unchecked = runOpenbibleDelta({ kind: 'topics', oldPath, newPath, conceptsDir, check: false });
    expect(unchecked.exitCode).toBe(0); // report is the product without --check
    const checked = runOpenbibleDelta({ kind: 'topics', oldPath, newPath, conceptsDir, check: true });
    expect(checked.exitCode).toBe(1);
    expect(checked.outcome).toBe('b-consumed-scope-movement');
    expect(checked.report).toContain('score 4 -> 9');
    expect(checked.report).toContain('weight 0.04 -> 0.09');
    expect(checked.report).toContain('faith-and-works'); // the consuming concept, named
  });

  it('exits 2 under --check on a license STOP, naming both headers', () => {
    const oldPath = write('cli-old-c.txt', OLD_TOPICS);
    const newPath = write(
      'cli-new-c.txt',
      ['Topic\tOSIS\tQuality Score\t# Generated 2026-08-17.', 'trust\tPs.46.1\t5', ''].join('\n'),
    );
    const result = runOpenbibleDelta({ kind: 'topics', oldPath, newPath, conceptsDir, check: true });
    expect(result.exitCode).toBe(2);
    expect(result.outcome).toBe('license-stop');
    expect(result.report).toContain('rights STOP');
    expect(result.report).toContain(TOPICS_HEADER_OLD);
    expect(result.report).toContain('# Generated 2026-08-17.');
  });

  it('runs xrefs end to end with committed evidence and flags the touching change', () => {
    const committedPath = write(
      'cli-committed.json',
      JSON.stringify({
        crossReferences: [
          { fromVerseId: GEN_1_1, toStartVerseId: PS_124_8, toEndVerseId: PS_124_8, votes: 71 },
        ],
      }),
    );
    const oldPath = write(
      'cli-old-x.txt',
      [XREFS_HEADER_OLD, 'Gen.1.1\tPs.124.8\t71', 'John.15.4\tJas.2.14\t3', ''].join('\n'),
    );
    const newPath = write(
      'cli-new-x.txt',
      [XREFS_HEADER_NEW, 'Gen.1.1\tPs.124.8\t74', 'John.15.4\tJas.2.14\t3', ''].join('\n'),
    );
    const result = runOpenbibleDelta({ kind: 'xrefs', oldPath, newPath, committedPath, check: true });
    expect(result.exitCode).toBe(1);
    expect(result.outcome).toBe('b-consumed-scope-movement');
    expect(result.report).toContain('Genesis 1:1 -> Psalms 124:8');
    expect(result.report).toContain('votes 71 -> 74');
    expect(result.report).toContain('COMMITTED EVIDENCE');
  });

  it('under the subset witness the report states what the witness cannot see', () => {
    const subsetPath = write(
      'cli-witness.json',
      JSON.stringify({
        $schema: 'openbible-subset/1',
        topicRows: [
          { topic: 'faith and works', startVerseId: JAS_2_14, endVerseId: JAS_2_26, score: 4 },
        ],
        crossReferences: [],
      }),
    );
    const newPath = write('cli-new-w.txt', OLD_TOPICS);
    const result = runOpenbibleDelta({
      kind: 'topics',
      oldPath: subsetPath,
      newPath,
      conceptsDir,
      check: true,
    });
    expect(result.delta.restricted).toBe(true);
    expect(result.report).toContain('subset witness');
    expect(result.report).toContain('adds are not measurable');
    // The witness carries no raw header; the report must name the pinned
    // wording as the old side rather than claim a raw-header comparison.
    expect(result.report).toContain('witness carries no header');
    expect(result.report).toContain('PINNED header wording');
  });

  it('WRONG VERDICT GUARD: under the witness, a CC-BY-NC candidate is a license STOP (exit 2), never "identical"', () => {
    const witnessPath = write(
      'cli-witness-nc.json',
      JSON.stringify({
        $schema: 'openbible-subset/1',
        topicRows: [],
        crossReferences: [
          { fromVerseId: GEN_1_1, toStartVerseId: PS_124_8, toEndVerseId: PS_124_8, votes: 71 },
        ],
      }),
    );
    // Same rows as the witness, but the grant is now non-commercial. The
    // prefix-open marker ("www.openbible.info CC-BY") still matches, so the
    // old marker-only path reported this as identical / exit 0 — the wrong
    // verdict this test exists to keep dead.
    const ncPath = write(
      'cli-new-nc.txt',
      [
        'From Verse\tTo Verse\tVotes\t#www.openbible.info CC-BY-NC 2026-08-17',
        'Gen.1.1\tPs.124.8\t71',
        '',
      ].join('\n'),
    );
    const result = runOpenbibleDelta({
      kind: 'xrefs',
      oldPath: witnessPath,
      newPath: ncPath,
      committedPath: null,
      check: true,
    });
    expect(result.outcome).toBe('license-stop');
    expect(result.exitCode).toBe(2);
    expect(result.report).toContain('rights STOP');
    expect(result.report).toContain('pinned header wording');
    // The companion direction: an intact grant whose date rolled must still
    // pass under the witness — the STOP must not become decoration.
    const rolledPath = write(
      'cli-new-rolled.txt',
      [XREFS_HEADER_NEW, 'Gen.1.1\tPs.124.8\t71', ''].join('\n'),
    );
    const rolled = runOpenbibleDelta({
      kind: 'xrefs',
      oldPath: witnessPath,
      newPath: rolledPath,
      committedPath: null,
      check: true,
    });
    expect(rolled.outcome).toBe('identical');
    expect(rolled.exitCode).toBe(0);
  });

  it('caps the outside-scope topic-name lists and states the totals', () => {
    const oldPath = write('cli-old-h.txt', [TOPICS_HEADER_OLD, 'trust\tPs.46.1\t5', ''].join('\n'));
    const newLines = [TOPICS_HEADER_NEW, 'trust\tPs.46.1\t5'];
    for (let v = 1; v <= 30; v += 1) newLines.push(`new topic ${String(v).padStart(2, '0')}\tPs.119.${v}\t3`);
    const newPath = write('cli-new-h.txt', `${newLines.join('\n')}\n`);
    const result = runOpenbibleDelta({ kind: 'topics', oldPath, newPath, conceptsDir, check: false });
    const line = result.report.split('\n').find((row) => row.startsWith('- topics added ('));
    expect(line).toContain('topics added (30):');
    expect(line).toContain('(5 more not listed)');
    expect(line!.match(/new topic \d+/g)!.length).toBe(25);
  });

  it('with --no-concepts the report warns that class (b) cannot be ruled out', () => {
    const oldPath = write('cli-old-e.txt', OLD_TOPICS);
    const newPath = write(
      'cli-new-e.txt',
      OLD_TOPICS.replace('faith and works\tJas.2.14-Jas.2.26\t4', 'faith and works\tJas.2.14-Jas.2.26\t9'),
    );
    const result = runOpenbibleDelta({
      kind: 'topics',
      oldPath,
      newPath,
      conceptsDir: null,
      check: true,
    });
    expect(result.outcome).toBe('a-outside-consumed-scope');
    expect(result.report).toContain('no consumed scope supplied');
    expect(result.report).toContain('cannot be ruled out');
  });

  it('caps outside-consumed-scope listings deterministically and says so', () => {
    const oldLines = [TOPICS_HEADER_OLD];
    const newLines = [TOPICS_HEADER_NEW];
    for (let v = 1; v <= 30; v += 1) {
      oldLines.push(`unconsumed topic\tPs.119.${v}\t${v}`);
      newLines.push(`unconsumed topic\tPs.119.${v}\t${v + 40}`); // 30 shifts
    }
    const oldPath = write('cli-old-f.txt', `${oldLines.join('\n')}\n`);
    const newPath = write('cli-new-f.txt', `${newLines.join('\n')}\n`);
    const result = runOpenbibleDelta({ kind: 'topics', oldPath, newPath, conceptsDir, check: false });
    expect(result.report).toContain('30 total');
    expect(result.report).toContain('largest 25 listed');
    // Capped, but the counts above carry the full total.
    expect(result.report.match(/score \d+ -> \d+/g)!.length).toBe(25);
  });

  it('report names both payloads by sha256 so it can stand as PR evidence', () => {
    const oldPath = write('cli-old-g.txt', OLD_TOPICS);
    const newPath = write('cli-new-g.txt', OLD_TOPICS);
    const sha = createHash('sha256').update(OLD_TOPICS).digest('hex');
    const { report } = runOpenbibleDelta({ kind: 'topics', oldPath, newPath, conceptsDir, check: false });
    expect(report).toContain(sha);
  });
});
