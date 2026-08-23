import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

// D41 stale-path sweep: `static/study.html` was deleted at the flip (the
// Study page now lives at static/index.html; /study answers 302 → /), so the
// literal string must appear nowhere under workbench/test/** or
// workbench/e2e/** — a test still naming it would be validating a deleted or
// stale file (the CLAUDE.md "guardrail becomes decoration" failure). This
// file is excluded from its own sweep: it must name the string to search
// for it.

const STALE = 'static/study.html'; // this file is excluded from its own sweep

function walk(directory: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(directory)) {
    const full = path.join(directory, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules') continue;
      found.push(...walk(full));
    } else {
      found.push(full);
    }
  }
  return found;
}

describe('stale-path sweep (D41)', () => {
  it('no test or e2e file still names the deleted study.html path', () => {
    const self = fileURLToPath(import.meta.url);
    const roots = [
      fileURLToPath(new URL('.', import.meta.url)),
      fileURLToPath(new URL('../e2e/', import.meta.url)),
    ];
    const offenders: string[] = [];
    for (const root of roots) {
      for (const file of walk(root)) {
        if (path.resolve(file) === path.resolve(self)) continue;
        const content = readFileSync(file, 'utf8');
        if (content.includes(STALE)) offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('the deleted file is really gone from static/', () => {
    const staticDir = fileURLToPath(new URL('../static/', import.meta.url));
    expect(readdirSync(staticDir)).not.toContain('study.html');
  });
});
