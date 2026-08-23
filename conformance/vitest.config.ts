import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Same aliasing as eval: the kit's tests consume the engine's SOURCE, so a
// runner change and an engine change are always tested against each other.
// The tests build a real fixture database, so the timeouts match eval's.
export default defineConfig({
  test: {
    testTimeout: 60_000,
    hookTimeout: 60_000,
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
