import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { resolveStaticSnapshot } from '../src/staticSnapshot.js';

// D5: static/study.html must satisfy the single-inline static-snapshot
// contract (protocol marker, inline scripts only, every required route
// literal present) so the /study secondary route can serve it.

const studyUrl = new URL('../static/study.html', import.meta.url);

describe('study.html static snapshot contract', () => {
  it('resolves as a valid single-inline snapshot', async () => {
    const snapshot = await resolveStaticSnapshot(fileURLToPath(studyUrl));
    expect(snapshot.mode).toBe('single-inline');
    const page = snapshot.assets.get('/');
    expect(page).toBeDefined();
    expect(page!.contentType).toBe('text/html; charset=utf-8');
  });

  it('keeps the ROUTES constant in exact parity with REQUIRED_INLINE_ROUTES', () => {
    const snapshotSource = readFileSync(new URL('../src/staticSnapshot.ts', import.meta.url), 'utf8');
    const requiredBlock = /const REQUIRED_INLINE_ROUTES = \[([\s\S]*?)\] as const;/.exec(snapshotSource);
    expect(requiredBlock).not.toBeNull();
    const required = [...requiredBlock![1]!.matchAll(/'([^']+)'/g)].map((match) => match[1]!);
    expect(required.length).toBeGreaterThan(0);

    const studySource = readFileSync(studyUrl, 'utf8');
    const routesBlock = /const ROUTES = \[([\s\S]*?)\];/.exec(studySource);
    expect(routesBlock, 'study.html declares a ROUTES constant').not.toBeNull();
    const routes = [...routesBlock![1]!.matchAll(/'([^']+)'/g)].map((match) => match[1]!);
    expect(routes).toEqual(required);
  });
});
