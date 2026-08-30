import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { resolveStaticSnapshot } from '../src/staticSnapshot.js';

// D5 (finalized in D40): the Study page must satisfy the single-inline
// static-snapshot contract (protocol marker, inline scripts only, every
// required route literal present), keep ROUTES parity with
// REQUIRED_INLINE_ROUTES, and reference no external URL — with a negative
// fixture demonstrating the external-URL scan actually fires.

// The Study page lives at static/index.html since the flip (D41).
const studyUrl = new URL('../static/index.html', import.meta.url);

/**
 * D40 no-external-URL scan: every src=/href=/url( value must not begin with
 * `http`. A pure function so the negative fixture can demonstrate a failure.
 */
function externalUrlViolations(source: string): string[] {
  const violations: string[] = [];
  for (const match of source.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)) {
    if (match[1]!.startsWith('http')) violations.push(match[1]!);
  }
  for (const match of source.matchAll(/url\(\s*['"]?([^'")]+)/g)) {
    if (match[1]!.startsWith('http')) violations.push(match[1]!);
  }
  return violations;
}

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

  it('wires the Phase-1 updates routes through all three lists (votes-to-engine D6/F4)', () => {
    // List 1: REQUIRED_INLINE_ROUTES — the serving layer fail-closes on it.
    const snapshotSource = readFileSync(new URL('../src/staticSnapshot.ts', import.meta.url), 'utf8');
    const requiredBlock = /const REQUIRED_INLINE_ROUTES = \[([\s\S]*?)\] as const;/.exec(snapshotSource);
    const required = [...requiredBlock![1]!.matchAll(/'([^']+)'/g)].map((match) => match[1]!);
    for (const literal of ['/api/v2/updates', '/api/v2/updates/cards/', '/decide']) {
      expect(required, `REQUIRED_INLINE_ROUTES carries ${literal}`).toContain(literal);
    }
    // List 2: the page's ROUTES mirror (exact parity is asserted above; this
    // pins the three literals by name so skipping the wiring goes red here).
    const studySource = readFileSync(studyUrl, 'utf8');
    const routesBlock = /const ROUTES = \[([\s\S]*?)\];/.exec(studySource);
    const routes = [...routesBlock![1]!.matchAll(/'([^']+)'/g)].map((match) => match[1]!);
    for (const literal of ['/api/v2/updates', '/api/v2/updates/cards/', '/decide']) {
      expect(routes, `ROUTES mirrors ${literal}`).toContain(literal);
    }
    // List 3: requiresTrustedJson covers the decide POST (its runtime
    // behavior is pinned by serverPreflight.integration.test.ts; this pins
    // the literal so the three lists cannot silently drift apart).
    const serverSource = readFileSync(new URL('../src/server.ts', import.meta.url), 'utf8');
    const trustedBlock = /function requiresTrustedJson\(pathname: string\): boolean \{[\s\S]*?\n\}/.exec(serverSource);
    expect(trustedBlock, 'server.ts declares requiresTrustedJson').not.toBeNull();
    expect(trustedBlock![0]).toContain(String.raw`\/api\/v2\/updates\/cards\/[^/]+\/decide`);
  });

  it('wires the Phase-2 train routes through all three lists (votes-to-engine D8, §4.9 F4)', () => {
    // The page-side halves landed with the train panel: the seal/state
    // routes plus the borrowed admit and publish-preparation routes (§4.9's
    // prefix/suffix style for parameterized routes). All three lists must
    // carry them in the same commit — the serving layer fail-closes on
    // list 1.
    const phase2Literals = ['/api/v2/updates/train', '/api/v2/admissions/', '/admit', '/api/v2/publish/', '/prepare'];
    const snapshotSource = readFileSync(new URL('../src/staticSnapshot.ts', import.meta.url), 'utf8');
    const requiredBlock = /const REQUIRED_INLINE_ROUTES = \[([\s\S]*?)\] as const;/.exec(snapshotSource);
    const required = [...requiredBlock![1]!.matchAll(/'([^']+)'/g)].map((match) => match[1]!);
    for (const literal of phase2Literals) {
      expect(required, `REQUIRED_INLINE_ROUTES carries ${literal}`).toContain(literal);
    }
    const studySource = readFileSync(studyUrl, 'utf8');
    const routesBlock = /const ROUTES = \[([\s\S]*?)\];/.exec(studySource);
    const routes = [...routesBlock![1]!.matchAll(/'([^']+)'/g)].map((match) => match[1]!);
    for (const literal of phase2Literals) {
      expect(routes, `ROUTES mirrors ${literal}`).toContain(literal);
    }
    const serverSource = readFileSync(new URL('../src/server.ts', import.meta.url), 'utf8');
    const trustedBlock = /function requiresTrustedJson\(pathname: string\): boolean \{[\s\S]*?\n\}/.exec(serverSource);
    expect(trustedBlock, 'server.ts declares requiresTrustedJson').not.toBeNull();
    expect(trustedBlock![0]).toContain(`'/api/v2/updates/train'`);
    expect(trustedBlock![0]).toContain(String.raw`\/api\/v2\/admissions\/[^/]+\/admit`);
    expect(trustedBlock![0]).toContain(String.raw`\/api\/v2\/publish\/[^/]+\/prepare`);
  });

  it('carries the workbench-static-protocol marker in the head', () => {
    const source = readFileSync(studyUrl, 'utf8');
    expect(source).toContain('<meta name="workbench-static-protocol" content="1">');
  });

  it('references no external URL (src=/href=/url( must not begin with http)', () => {
    const source = readFileSync(studyUrl, 'utf8');
    expect(externalUrlViolations(source)).toEqual([]);
  });

  it('negative fixture: an injected fonts.googleapis.com link fails the scan', () => {
    const source = readFileSync(studyUrl, 'utf8');
    const injected = source.replace(
      '</head>',
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Literata"></head>',
    );
    expect(externalUrlViolations(injected)).toEqual(['https://fonts.googleapis.com/css2?family=Literata']);
  });
});
