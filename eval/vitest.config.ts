import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// The eval harness consumes the engine's SOURCE, not its build output, so a
// gate change and an engine change are always tested against each other.
export default defineConfig({
  // These are integration tests: several BUILD a real SQLite fixture database
  // before asserting anything. Vitest's 5s default is sized for unit tests,
  // and the fixture has grown from 828 verses to 1,077 with 32k Layer B terms
  // — enough that a Windows runner exceeded it while Linux and macOS passed.
  //
  // A test that fails on one platform for timing reasons is the same problem
  // as a gate that fires at random: people learn to re-run rather than read.
  // Several suites rebuild pipeline/output/fixture.db. Keep them serialized so
  // a gauntlet process never reads another test's half-built fixture artifact.
  test: {
    testTimeout: 60_000,
    hookTimeout: 60_000,
    fileParallelism: false,
  },
  resolve: {
    alias: {
      '@jestek-dev/scripture-engine': fileURLToPath(new URL('../engine/src/index.ts', import.meta.url)),
    },
  },
});
