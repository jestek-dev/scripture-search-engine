import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { ENDPOINT_FAILURES } from '../e2e/endpointFailures.js';

// D39 parity check: the ENDPOINT_FAILURES table's key set must equal the
// function names parsed from the Study page's `// §api` section (§4.8 —
// one named function per endpoint). A new fetch site cannot ship unmapped,
// and a stale table entry cannot outlive its function.
//
// The table lives in workbench/e2e/endpointFailures.ts (a plain data module
// with no @playwright/test import) precisely so this vitest can import it:
// e2e/** is excluded from vitest collection, and importing a Playwright
// spec from a vitest test throws at import time.

// The Study page lives at static/index.html since the flip (D41).
const studyHtml = readFileSync(new URL('../static/index.html', import.meta.url), 'utf8');

describe('ENDPOINT_FAILURES ↔ §api parity', () => {
  it('maps exactly the functions in the // §api section', () => {
    const sectionMatch = /\/\/ §api[\s\S]*?(?=\n\s*\/\/ §stores)/.exec(studyHtml);
    expect(sectionMatch, 'study page contains a // §api … // §stores section').not.toBeNull();
    const section = sectionMatch![0];
    const names = [...section.matchAll(/function (\w+)\(/g)].map((match) => match[1]!);
    expect(names.length).toBeGreaterThan(0);
    expect(new Set(names).size, 'no duplicate function names in §api').toBe(names.length);
    expect([...names].sort()).toEqual(Object.keys(ENDPOINT_FAILURES).sort());
  });

  it('every entry states its mocked failure and a non-empty expected copy', () => {
    for (const [name, entry] of Object.entries(ENDPOINT_FAILURES)) {
      expect(entry.mockedFailure.length, `${name} mockedFailure`).toBeGreaterThan(0);
      if (typeof entry.expectedCopyOrToast === 'string') {
        expect(entry.expectedCopyOrToast.length, `${name} expectedCopyOrToast`).toBeGreaterThan(0);
      } else {
        // The passage function names both call-site behaviors (§3.11).
        expect(name).toBe('apiPassage');
        expect(entry.expectedCopyOrToast.focusedCard.length).toBeGreaterThan(0);
        expect(entry.expectedCopyOrToast.rescuePreview.length).toBeGreaterThan(0);
      }
    }
  });
});
