/**
 * A `ContentQueryPort` backed by Node's built-in SQLite — copied from
 * eval/src/nodeSqlitePort.ts per plan MS-1 (the sweep workspace carries its
 * own port rather than importing across workspace boundaries, so the eval
 * harness and the sweep harness can evolve independently).
 *
 * Lives in sweep/, not engine/, on purpose: the engine must stay I/O-free
 * (covenant #3), and each consumer brings its own port.
 *
 * Opened read-only. The sweep must never be able to mutate the artifact it
 * is measuring.
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
