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
      // The subpath alias must come FIRST: Vite string aliases also match
      // 'key/…' prefixes, so the bare-package entry would otherwise rewrite
      // '…/internal' to '…/index.ts/internal'.
      '@jestek-dev/scripture-engine/internal': fileURLToPath(new URL('../engine/src/internal.ts', import.meta.url)),
      '@jestek-dev/scripture-engine': fileURLToPath(new URL('../engine/src/index.ts', import.meta.url)),
    },
  },
});
