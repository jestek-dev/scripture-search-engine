import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// The pipeline consumes the engine's SOURCE for its tokenizer, because
// pipeline and runtime must tokenize identically or precomputed term profiles
// describe a vocabulary the query side cannot produce. Testing against the
// source rather than a build output keeps that guarantee honest.
export default defineConfig({
  // These are integration tests: several BUILD a real SQLite fixture database
  // before asserting anything. Vitest's 5s default is sized for unit tests,
  // and the fixture has grown from 828 verses to 1,077 with 32k Layer B terms
  // — enough that a Windows runner exceeded it while Linux and macOS passed.
  //
  // A test that fails on one platform for timing reasons is the same problem
  // as a gate that fires at random: people learn to re-run rather than read.
  testTimeout: 60_000,
  hookTimeout: 60_000,
  resolve: {
    alias: {
      // The subpath alias must come FIRST: Vite string aliases also match
      // 'key/…' prefixes, so the bare-package entry would otherwise rewrite
      // '…/internal' to '…/index.ts/internal'.
      '@jestek-dev/scripture-engine/internal': fileURLToPath(new URL('../engine/src/internal.ts', import.meta.url)),
      '@jestek-dev/scripture-engine': fileURLToPath(new URL('../engine/src/index.ts', import.meta.url)),
    },
  },
});
