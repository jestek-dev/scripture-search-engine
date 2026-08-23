/**
 * Frozen-paraphrase validation (MS-5). A paraphrase batch is USABLE only
 * when: the manifest's hashes pin the exact prompt, seed list, and output
 * bytes; every line is schema-valid and maps to a live seed; register and
 * crisis tags are inherited exactly (zero sensitive-category lines without
 * the crisisAdjacent tag — script-forced, not model-trusted); and the
 * recorded human skim exists. The count floor is J43's number — while null
 * it reports not-applicable, never a hollow pass.
 */
import { readFileSync } from 'node:fs';

import { sha256Hex } from '../canonical.js';
import type { ParaphraseSeed } from './selectSeeds.js';

export interface ParaphraseLine {
  readonly seedId: string;
  readonly index: number;
  readonly paraphrase: string;
  readonly register?: string;
  readonly crisisAdjacent?: true;
}

export interface ParaphraseManifest {
  readonly schema: string;
  readonly modelId: string;
  readonly promptSha256: string;
  readonly generatedAt: string;
  readonly seedsFingerprint: string;
  readonly counts: { readonly seeds: number; readonly raw: number; readonly frozen: number };
  readonly leverState: 'none' | 'supplemental+6' | 'widened-stratum-a';
  readonly paraphrasesSha256: string;
  readonly skim: { readonly by: string; readonly at: string; readonly sampleSize: number } | null;
}

export interface Finding {
  readonly level: 'fail' | 'not-applicable';
  readonly message: string;
}

export function validateParaphrases(options: {
  readonly paraphrasesPath: string;
  readonly manifestPath: string;
  readonly promptPath: string;
  readonly seedsPath: string;
  /** ringFloors.ring1Paraphrase from sweep-budgets (null until J43). */
  readonly countFloor: number | null;
}): Finding[] {
  const findings: Finding[] = [];
  const manifest = JSON.parse(readFileSync(options.manifestPath, 'utf8')) as ParaphraseManifest;

  const body = readFileSync(options.paraphrasesPath, 'utf8');
  if (sha256Hex(body) !== manifest.paraphrasesSha256) {
    findings.push({ level: 'fail', message: 'paraphrases file does not match manifest paraphrasesSha256' });
  }
  const promptBody = readFileSync(options.promptPath, 'utf8');
  if (sha256Hex(promptBody) !== manifest.promptSha256) {
    findings.push({ level: 'fail', message: 'committed prompt does not match manifest promptSha256' });
  }
  const seedsBody = readFileSync(options.seedsPath, 'utf8');
  if (sha256Hex(seedsBody) !== manifest.seedsFingerprint) {
    findings.push({ level: 'fail', message: 'committed seeds do not match manifest seedsFingerprint' });
  }

  const seeds = new Map<string, ParaphraseSeed>(
    seedsBody
      .split('\n')
      .filter((line) => line.length > 0)
      .map((line) => JSON.parse(line) as ParaphraseSeed)
      .map((seed) => [seed.seedId, seed]),
  );

  const lines = body
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line, index) => {
      const parsed = JSON.parse(line) as ParaphraseLine;
      if (typeof parsed.seedId !== 'string' || typeof parsed.paraphrase !== 'string') {
        findings.push({ level: 'fail', message: `line ${index + 1}: missing seedId/paraphrase` });
      }
      return parsed;
    });

  for (const [index, line] of lines.entries()) {
    const seed = seeds.get(line.seedId);
    if (seed === undefined) {
      findings.push({ level: 'fail', message: `line ${index + 1}: unknown seedId ${line.seedId}` });
      continue;
    }
    if (seed.register !== undefined && line.register !== seed.register) {
      findings.push({
        level: 'fail',
        message: `line ${index + 1}: register "${line.register}" not faithful to seed's "${seed.register}"`,
      });
    }
    // Forced propagation: a crisis seed's every paraphrase carries the tag.
    if (seed.crisisAdjacent === true && line.crisisAdjacent !== true) {
      findings.push({
        level: 'fail',
        message: `line ${index + 1}: crisis-adjacent seed ${line.seedId} produced an untagged paraphrase`,
      });
    }
  }

  if (lines.length !== manifest.counts.frozen) {
    findings.push({
      level: 'fail',
      message: `manifest counts.frozen ${manifest.counts.frozen} != actual ${lines.length}`,
    });
  }

  if (options.countFloor === null) {
    findings.push({
      level: 'not-applicable',
      message: 'count floor: not-applicable — ringFloors.ring1Paraphrase unset (J43)',
    });
  } else if (lines.length < options.countFloor) {
    findings.push({
      level: 'fail',
      message: `frozen count ${lines.length} below the J43-signed floor ${options.countFloor}`,
    });
  }

  if (manifest.skim === null) {
    findings.push({
      level: 'fail',
      message: 'no recorded human skim (who/when/size) — the batch is not frozen-ready',
    });
  }

  return findings;
}
