/**
 * Every source id that can reach a provenance chip must render as a human
 * label, never as a raw database identifier.
 *
 * This gap shipped once: `torrey`, `barnes`, `jfb`, `mhc` and others fell
 * through sourceLabel()'s default case and appeared verbatim in result chips
 * ("passage_terms: barnes + jfb + mhc"). The engine cannot read manifests at
 * runtime (it does no I/O), so completeness is enforced here — the one place
 * that can see both the engine's label table and the pipeline's source
 * registry. A new admission without a label fails this test instead of
 * leaking an id to users.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { sourceLabel } from '@jestek-dev/scripture-engine/internal';

import { EXPOSITION_SOURCES } from '../../pipeline/src/expositionSources.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const MANIFEST_DIR = join(HERE, '..', '..', 'pipeline', 'manifests');

function manifestIds(): string[] {
  return readdirSync(MANIFEST_DIR)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => {
      const manifest = JSON.parse(readFileSync(join(MANIFEST_DIR, name), 'utf8')) as {
        id: string;
      };
      return manifest.id;
    });
}

describe('source labels', () => {
  it('labels every manifest id', () => {
    const unlabeled = manifestIds().filter((id) => sourceLabel(id) === id);
    expect(unlabeled, `add a sourceLabel() case for: ${unlabeled.join(', ')}`).toEqual([]);
  });

  it('labels every exposition source id', () => {
    const unlabeled = EXPOSITION_SOURCES.map((source) => source.id).filter(
      (id) => sourceLabel(id) === id,
    );
    expect(unlabeled, `add a sourceLabel() case for: ${unlabeled.join(', ')}`).toEqual([]);
  });

  it('labels are non-empty prose, not identifiers', () => {
    for (const id of manifestIds()) {
      const label = sourceLabel(id);
      expect(label.length).toBeGreaterThan(0);
      // A kebab-case string with no spaces is an identifier wearing a label's
      // clothes; every real label in the table contains at least one space.
      expect(label, `label for "${id}" looks like an identifier: "${label}"`).toMatch(/\s/);
    }
  });
});
