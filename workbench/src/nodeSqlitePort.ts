/**
 * A `ContentQueryPort` backed by Node's built-in SQLite.
 *
 * Copied from eval/src/nodeSqlitePort.ts; eval exports nothing by design —
 * keep in sync by hand, it is 30 lines.
 *
 * Opened read-only. The workbench must never be able to mutate the artifact
 * it is judging.
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
