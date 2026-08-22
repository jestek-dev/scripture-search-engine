/**
 * Writes the curated phrase/hymn alias rows (QR-6, 0.13.0) into an artifact
 * whose corpus, layers, and spelling index are already built, and chains the
 * layer fingerprint over them.
 *
 * No schema bump: `curated_aliases` shipped EMPTY at v7 (QR-5), and the
 * engine probes presence-and-rows — so an artifact built with an empty pack
 * is byte-for-byte the pre-QR-6 artifact, fingerprint included. That
 * conditional no-op IS the rollback story: rebuild without alias rows and
 * behavior (and identity) revert with no engine change.
 *
 * Layer-fingerprint feed: every alias row individually decides what a
 * whole-query match answers, so each row feeds the chained fingerprint as
 * its own length-delimited record (the spelling_terms per-record precedent —
 * a count could not see one phrase retargeted to another concept). Runs
 * AFTER buildSpellingIndex, so the chain order is fixed:
 * concept layer → spelling vocabulary → aliases.
 *
 * The pieces are exported separately (fingerprint / row-reader / writer)
 * because the curation workbench's candidate builder must REPRODUCE the
 * chain independently: candidates never touch alias rows (they are a
 * non-owned, byte-verified table), but the candidate's expected layer
 * fingerprint must still end with the same alias links the base's does.
 */

import { createHash } from 'node:crypto';

import type { CompiledAliasRow } from './importers/aliasImporter.js';
import { checkProvenance, type ManifestSet } from './provenance/manifest.js';
import type { SqliteReadWriteDatabase } from './buildSpellingIndex.js';

export interface AliasLayerResult {
  readonly aliasCount: number;
  /** The layer fingerprint now in meta (unchanged when no rows shipped). */
  readonly layerFingerprint: string;
}

/**
 * Chains the layer fingerprint over the alias rows: previous identity, then
 * one length-delimited record per row in normalizedRaw order. Pure; callers
 * pass rows already sorted (the importer and the reader both sort).
 */
export function aliasLayerFingerprint(
  previousLayerFingerprint: string,
  rows: readonly CompiledAliasRow[],
): string {
  const hash = createHash('sha256');
  const feed = (parts: readonly (string | number)[]): void => {
    const record = parts.join(' ');
    hash.update(String(record.length));
    hash.update(' ');
    hash.update(record);
  };
  feed(['alias-base', previousLayerFingerprint]);
  for (const row of rows) {
    feed([
      'h',
      row.normalizedRaw,
      row.title,
      row.conceptId ?? `${row.startVerseId}-${row.endVerseId}`,
      row.sourceId,
      row.weight,
      row.locator,
    ]);
  }
  return hash.digest('hex');
}

/**
 * Reads the shipped alias rows back out of a database, in the same
 * normalizedRaw order the writer inserted them — the candidate builder's
 * input for reproducing the fingerprint chain over a verified base copy.
 */
export function readCuratedAliasRows(
  database: SqliteReadWriteDatabase,
): readonly CompiledAliasRow[] {
  const rows = database
    .prepare(
      `SELECT normalized_raw AS normalizedRaw, title, concept_id AS conceptId,
              start_verse_id AS startVerseId, end_verse_id AS endVerseId,
              source_id AS sourceId, weight, locator
       FROM curated_aliases ORDER BY normalized_raw`,
    )
    .all() as {
    normalizedRaw: string;
    title: string;
    conceptId: string | null;
    startVerseId: number | null;
    endVerseId: number | null;
    sourceId: string;
    weight: number;
    locator: string | null;
  }[];
  return rows.map((row) => ({
    normalizedRaw: row.normalizedRaw,
    title: row.title,
    conceptId: row.conceptId,
    startVerseId: row.startVerseId,
    endVerseId: row.endVerseId,
    sourceId: row.sourceId,
    weight: row.weight,
    locator: row.locator ?? '',
  }));
}

/**
 * Chains the alias links onto whatever layer fingerprint the database
 * currently carries, from the rows already in its curated_aliases table.
 * Used by the candidate builder AFTER buildSpellingIndex rewrote meta (the
 * alias rows themselves are copied, non-owned, byte-verified bytes). A
 * rowless table is a no-op by design.
 */
export function chainAliasLayerFingerprint(database: SqliteReadWriteDatabase): AliasLayerResult {
  const rows = readCuratedAliasRows(database);
  const previous = (database
    .prepare("SELECT value FROM meta WHERE key = 'layer_fingerprint'")
    .all() as { value: string }[])[0]?.value ?? '';
  if (rows.length === 0) return { aliasCount: 0, layerFingerprint: previous };
  const layerFingerprint = aliasLayerFingerprint(previous, rows);
  database
    .prepare('INSERT OR REPLACE INTO meta(key, value) VALUES (?, ?)')
    .run('layer_fingerprint', layerFingerprint);
  return { aliasCount: rows.length, layerFingerprint };
}

/**
 * Builds (or rebuilds) the curated_aliases table from compiled pack rows and
 * chains the fingerprint. G1 runs BEFORE a single row is written, exactly as
 * buildConceptLayer does: an alias pack citing an unadmitted source fails
 * the build, never ships an unattributable row.
 */
export function buildAliasLayer(
  database: SqliteReadWriteDatabase,
  rows: readonly CompiledAliasRow[],
  manifests: ManifestSet,
): AliasLayerResult {
  if (rows.length === 0) {
    const previous = (database
      .prepare("SELECT value FROM meta WHERE key = 'layer_fingerprint'")
      .all() as { value: string }[])[0]?.value ?? '';
    return { aliasCount: 0, layerFingerprint: previous };
  }

  const failures = checkProvenance({
    manifests,
    citedSourceIds: [...new Set(rows.map((row) => row.sourceId))].sort(),
    tier: 'public_distribution',
  });
  if (failures.length > 0) {
    throw new Error(`buildAliasLayer: provenance check failed:\n  ${failures.join('\n  ')}`);
  }

  const sorted = [...rows].sort((a, b) => (a.normalizedRaw < b.normalizedRaw ? -1 : 1));
  const insert = database.prepare(
    `INSERT INTO curated_aliases(title, normalized_raw, concept_id, start_verse_id,
                                 end_verse_id, source_id, weight, locator)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  database.exec('BEGIN');
  try {
    database.exec('DELETE FROM curated_aliases;');
    for (const row of sorted) {
      insert.run(
        row.title,
        row.normalizedRaw,
        row.conceptId,
        row.startVerseId,
        row.endVerseId,
        row.sourceId,
        row.weight,
        row.locator,
      );
    }
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
  return chainAliasLayerFingerprint(database);
}
