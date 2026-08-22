import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import type { StaticAsset } from './staticSnapshot.js';

/**
 * Font route — the second of the two additive static mechanisms
 * (implementation plan §4.2(2)). Neither static-snapshot mode can serve
 * woff2, inlining ~1MB of base64 into reviewed HTML bloats every diff, and a
 * build step breaks the no-build idiom — so exactly these two directories
 * are scanned for `*.woff2` at startup, read into memory once, and served at
 * `/fonts/{family}/{file}`. Anything else under `/fonts/` 404s. The route
 * serves in degraded startup mode: fonts are static bytes with no artifact
 * or log dependency.
 */
export const FONT_FAMILY_DIRECTORIES = ['literata', 'source-sans-3'] as const;

export async function loadFontAssets(fontsRoot: string): Promise<ReadonlyMap<string, StaticAsset>> {
  const assets = new Map<string, StaticAsset>();
  for (const family of FONT_FAMILY_DIRECTORIES) {
    let entries: readonly string[];
    try {
      entries = await readdir(path.join(fontsRoot, family));
    } catch {
      continue; // A missing family directory serves nothing; not a startup issue.
    }
    for (const name of entries) {
      if (!name.endsWith('.woff2')) continue;
      const body = await readFile(path.join(fontsRoot, family, name));
      assets.set(`/fonts/${family}/${name}`, {
        body,
        contentType: 'font/woff2',
        sha256: createHash('sha256').update(body).digest('hex'),
      });
    }
  }
  return assets;
}
