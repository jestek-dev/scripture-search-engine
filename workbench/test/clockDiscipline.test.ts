import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

// Every real-clock read in admission.ts must be a fallback behind an injected
// clock: `?? new Date()` or `?? () => new Date()`. A bare `new Date()` (the
// exact shape of the 2026-08-12 red-main time bomb: a default parameter that
// silently re-entered the real clock) fails this guard the day it lands.
// Residual risk this guard cannot see: a future test that omits its injected
// clock leaks onto the real clock — the 2050-dated fixtures in
// admission.test.ts then fail loudly as future-dated instead of expiring.
const INJECTED_CLOCK_FALLBACK = /\?\?\s*(\(\)\s*=>\s*)?new Date\(\)/;

describe('workbench clock discipline', () => {
  it('permits new Date() in admission.ts only as a fallback behind an injected clock', async () => {
    const source = await readFile(new URL('../src/admission.ts', import.meta.url), 'utf8');
    const clockReads = source.split('\n')
      .map((line, index) => ({ line, lineNumber: index + 1 }))
      .filter(({ line }) => line.includes('new Date()'));
    expect(clockReads.length).toBeGreaterThan(0);
    for (const { line, lineNumber } of clockReads) {
      expect(
        INJECTED_CLOCK_FALLBACK.test(line),
        `admission.ts:${lineNumber} reads the real clock without an injected-clock fallback: ${line.trim()}`,
      ).toBe(true);
    }
  });
});
