import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

// OFL-provenance guard (plan D2): the committed font files must stay
// byte-identical to the pinned upstream releases recorded in
// workbench/static/fonts/README.md. A re-vendored or silently modified font
// file fails `npm test`, not review — a one-off recompute at merge time is
// not a standing guard.

const fontsRoot = new URL('../static/fonts/', import.meta.url);
const readme = readFileSync(new URL('README.md', fontsRoot), 'utf8');

const shaLines = [...readme.matchAll(/^([0-9a-f]{64}) {2}(\S+)$/gm)]
  .map((match) => ({ sha256: match[1]!, file: match[2]! }));

describe('vendored font provenance', () => {
  it('records sha256 lines for exactly the four committed woff2 files', () => {
    expect(shaLines.map((line) => line.file).sort()).toEqual([
      'literata/Literata-Italic-Variable.woff2',
      'literata/Literata-Variable.woff2',
      'source-sans-3/SourceSans3VF-Italic.ttf.woff2',
      'source-sans-3/SourceSans3VF-Upright.ttf.woff2',
    ]);
  });

  for (const { sha256, file } of shaLines) {
    it(`committed ${file} hashes to its recorded upstream sha256`, () => {
      const body = readFileSync(new URL(file, fontsRoot));
      expect(createHash('sha256').update(body).digest('hex')).toBe(sha256);
      // Sanity: the file is actually woff2, not a renamed something-else.
      expect(body.subarray(0, 4).toString('latin1')).toBe('wOF2');
    });
  }

  it('ships the OFL license text alongside each family', () => {
    for (const family of ['literata', 'source-sans-3']) {
      const licensePath = new URL(`${family}/OFL.txt`, fontsRoot);
      expect(existsSync(licensePath), `${family}/OFL.txt exists`).toBe(true);
      expect(readFileSync(licensePath, 'utf8')).toContain('SIL Open Font License, Version 1.1');
    }
  });
});
