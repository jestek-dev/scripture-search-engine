import { configDefaults, defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Same aliasing as eval: the workbench consumes the engine's SOURCE, so a
// workbench change and an engine change are always tested against each other
// (and no dist build is required to run the tests).
export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'e2e/**'],
    maxWorkers: 1,
    testTimeout: 30_000,
  },
  resolve: {
    alias: {
      '@jestek-dev/scripture-engine': fileURLToPath(new URL('../engine/src/index.ts', import.meta.url)),
    },
  },
});
