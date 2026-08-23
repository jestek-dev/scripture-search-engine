import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// The sweep harness consumes the engine's SOURCE, not its build output, so a
// harness change and an engine change are always tested against each other
// (same posture as eval/vitest.config.ts).
export default defineConfig({
  test: {
    // Several suites build the real SQLite fixture database before asserting
    // anything; the 5s unit default is too small on shared runners, and a
    // test that fails on one platform for timing reasons teaches people to
    // re-run rather than read.
    testTimeout: 120_000,
    hookTimeout: 120_000,
    // Suites that rebuild pipeline/output/fixture.db must never read another
    // test's half-built artifact.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      // Subpath alias FIRST: Vite string aliases also match 'key/…' prefixes.
      '@jestek-dev/scripture-engine/internal': fileURLToPath(
        new URL('../engine/src/internal.ts', import.meta.url),
      ),
      '@jestek-dev/scripture-engine': fileURLToPath(new URL('../engine/src/index.ts', import.meta.url)),
    },
  },
});
