/**
 * A `ContentQueryPort` backed by Node's built-in SQLite.
 *
 * Lives in eval/, not engine/, on purpose: the engine must stay I/O-free, and
 * each consumer brings its own port (Maskil uses OP-SQLite on device). This
 * one exists so the gauntlet can run real queries against the fixture
 * artifact in CI.
 *
 * Opened read-only. The gates must never be able to mutate the artifact they
 * are measuring.
 */

import { DatabaseSync } from 'node:sqlite';

import type { ContentQueryPort, ContentQueryResult, ContentScalar } from '@jestek-dev/scripture-engine';

export function openCorpus(path: string): ContentQueryPort {
  const database = new DatabaseSync(path, { readOnly: true });
  return {
    async execute(query: string, params: readonly ContentScalar[] = []): Promise<ContentQueryResult> {
      const statement = database.prepare(query);
      const rows = statement.all(...(params as never[])) as Record<string, ContentScalar>[];
      return { rows };
    },
    async close(): Promise<void> {
      database.close();
    },
  };
}
