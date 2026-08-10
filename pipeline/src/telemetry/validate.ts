/**
 * Distillate validation — hand-rolled against the schema rather than pulled
 * from a validator dependency, for the same reason the pipeline chose
 * `node:sqlite` over better-sqlite3: a build that can fail on dependency
 * availability eventually blocks an audit for a reason unrelated to the
 * data. The JSON Schema files remain the cross-repo contract; this module
 * is this repo's enforcement of it, and the test suite is where the two are
 * held together.
 *
 * The posture is refuse-and-name, never repair: a distillate that fails
 * validation is excluded entirely and the reason reported. Guessing at
 * malformed telemetry is how bad input data becomes bad evidence.
 */

import type { Distillate, DistillateQuery } from './types.js';

const APPS = new Set(['maskil', 'setlist', 'versed']);
const SHA256 = /^[0-9a-f]{64}$/;
const PERIOD = /^\d{4}-Q[1-4]$/;

export interface ValidationResult {
  readonly ok: boolean;
  readonly errors: readonly string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/* eslint-disable complexity -- the flatness IS the readability here: one
   check per schema clause, in schema order, so a reader can diff this file
   against distillate.schema.json clause by clause. */
export function validateDistillate(value: unknown): ValidationResult {
  const errors: string[] = [];
  const fail = (message: string): ValidationResult => ({ ok: false, errors: [...errors, message] });

  if (!isRecord(value)) return fail('distillate is not an object');
  if (value['v'] !== 1) return fail(`unsupported schema version ${JSON.stringify(value['v'])} (supported: 1)`);
  if (typeof value['app'] !== 'string' || !APPS.has(value['app'])) errors.push(`app ${JSON.stringify(value['app'])} is not one of maskil|setlist|versed`);
  if (typeof value['period'] !== 'string' || !PERIOD.test(value['period'])) errors.push(`period ${JSON.stringify(value['period'])} is not YYYY-Qn`);
  if (typeof value['token'] !== 'string' || value['token'].length < 8 || value['token'].length > 64) errors.push('token missing or outside 8-64 chars');

  if (!Array.isArray(value['queries'])) {
    errors.push('queries is not an array');
  } else {
    value['queries'].forEach((row, index) => {
      const at = `queries[${index}]`;
      if (!isRecord(row)) { errors.push(`${at} is not an object`); return; }
      if (typeof row['query'] !== 'string' || row['query'].length === 0) errors.push(`${at}.query missing`);
      const identity = row['identity'];
      if (!isRecord(identity)) {
        errors.push(`${at}.identity missing`);
      } else {
        if (typeof identity['engineVersion'] !== 'string' || identity['engineVersion'].length === 0) errors.push(`${at}.identity.engineVersion missing`);
        if (typeof identity['corpusFingerprint'] !== 'string' || !SHA256.test(identity['corpusFingerprint'])) errors.push(`${at}.identity.corpusFingerprint is not a sha256`);
        if (typeof identity['layerFingerprint'] !== 'string' || !SHA256.test(identity['layerFingerprint'])) errors.push(`${at}.identity.layerFingerprint is not a sha256`);
      }
      const outcomes = row['outcomes'];
      if (!isRecord(outcomes) || !isCount(outcomes['empty']) || !isCount(outcomes['abandoned']) || !isCount(outcomes['converted'])) {
        errors.push(`${at}.outcomes must carry integer empty/abandoned/converted`);
      }
      if (!Array.isArray(row['conversions'])) {
        errors.push(`${at}.conversions is not an array`);
      } else {
        row['conversions'].forEach((conversion, conversionIndex) => {
          const cat = `${at}.conversions[${conversionIndex}]`;
          if (!isRecord(conversion)) { errors.push(`${cat} is not an object`); return; }
          if (typeof conversion['target'] !== 'string' || conversion['target'].length === 0) errors.push(`${cat}.target missing`);
          if (!isCount(conversion['rank']) || (conversion['rank'] as number) < 1) errors.push(`${cat}.rank must be a positive integer`);
          if (!isCount(conversion['count']) || (conversion['count'] as number) < 1) errors.push(`${cat}.count must be a positive integer`);
        });
      }
    });
  }

  if (!Array.isArray(value['pairs'])) {
    errors.push('pairs is not an array');
  } else {
    value['pairs'].forEach((pair, index) => {
      const at = `pairs[${index}]`;
      if (!isRecord(pair)) { errors.push(`${at} is not an object`); return; }
      if (typeof pair['from'] !== 'string' || pair['from'].length === 0) errors.push(`${at}.from missing`);
      if (typeof pair['to'] !== 'string' || pair['to'].length === 0) errors.push(`${at}.to missing`);
      if (!isCount(pair['count']) || (pair['count'] as number) < 1) errors.push(`${at}.count must be a positive integer`);
    });
  }

  // The structural privacy assertion: fields that would carry a history are
  // not merely unrequired, they are FORBIDDEN. A distillate with sessions,
  // dates, or events in it was built by a broken shim and must not be mined.
  for (const forbidden of ['session', 'sessions', 'date', 'dates', 'events', 'deviceId', 'userId']) {
    if (forbidden in value) errors.push(`forbidden field '${forbidden}' present — distillates must not carry history or identity`);
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true, errors: [] };
}

/** Refuses a mixed-version batch outright — mixed schemas mean a half-updated fleet, and guessing which half is right is not the miner's job. */
export function assertSingleVersion(distillates: readonly Distillate[]): void {
  const versions = new Set(distillates.map((distillate) => distillate.v));
  if (versions.size > 1) {
    throw new Error(`mixed distillate schema versions in one audit: ${[...versions].join(', ')}. Audit them separately.`);
  }
}

/** Convenience for tests and the miner: total observed events for a query row. */
export function queryEventCount(row: DistillateQuery): number {
  return row.outcomes.empty + row.outcomes.abandoned + row.outcomes.converted;
}
