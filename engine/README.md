# @jestek-dev/scripture-engine

Pure, deterministic Scripture retrieval and ranking core. Zero I/O, zero
runtime AI, zero dependencies. Every result carries typed reasons and the
identities that make it reproducible:
`(engineVersion, corpusFingerprint, layerFingerprint, query)` yields identical
ordering on every platform.

The engine reads a prebuilt SQLite artifact (`content.db`) through the one
seam it knows, `ContentQueryPort` — supply it with any SQLite binding
(`node:sqlite`, OP-SQLite, expo-sqlite):

```ts
import { createEngine } from '@jestek-dev/scripture-engine';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('content.db', { readOnly: true });
const engine = await createEngine({
  async execute(sql, params = []) { return { rows: db.prepare(sql).all(...params) }; },
  async close() { db.close(); },
});

const result = await engine.research('hearing and doing');
```

The artifact ships separately as a
[GitHub Release asset](https://github.com/jestek-dev/scripture-search-engine/releases),
alongside a reviewed descriptor. Verify `content.db` against the descriptor's
`databaseSha256` before opening it.

Full documentation, architecture, data provenance and the admission gauntlet:
[jestek-dev/scripture-search-engine](https://github.com/jestek-dev/scripture-search-engine).

MIT — the code, not the corpora it is built from; those carry their own terms,
recorded per source in the repository's `docs/ATTRIBUTIONS.md`.
