import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// The pipeline consumes the engine's SOURCE for its tokenizer, because
// pipeline and runtime must tokenize identically or precomputed term profiles
// describe a vocabulary the query side cannot produce. Testing against the
// source rather than a build output keeps that guarantee honest.
export default defineConfig({
  resolve: {
    alias: {
      '@jestek-dev/scripture-engine': fileURLToPath(new URL('../engine/src/index.ts', import.meta.url)),
    },
  },
});
