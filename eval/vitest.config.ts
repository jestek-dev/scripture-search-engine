import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// The eval harness consumes the engine's SOURCE, not its build output, so a
// gate change and an engine change are always tested against each other.
export default defineConfig({
  resolve: {
    alias: {
      '@lh/scripture-engine': fileURLToPath(new URL('../engine/src/index.ts', import.meta.url)),
    },
  },
});
