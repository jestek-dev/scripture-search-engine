/** Tiny recursive source grep for boundary lint tests. */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export function Grep(root: string, pattern: RegExp): string[] {
  const hits: string[] = [];
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      const stats = statSync(path);
      if (stats.isDirectory()) {
        if (name === 'node_modules' || name === 'dist') continue;
        walk(path);
      } else if (/\.(ts|js|mjs|mts|json|yaml)$/.test(name)) {
        if (pattern.test(readFileSync(path, 'utf8'))) hits.push(path);
      }
    }
  };
  walk(root);
  return hits;
}
