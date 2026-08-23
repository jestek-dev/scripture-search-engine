import type http from 'node:http';
import path from 'node:path';

import { resolveStaticSnapshot, type StaticAsset } from './staticSnapshot.js';

/**
 * Secondary static pages / redirects — the first of the two additive static
 * mechanisms (implementation plan §4.2(1)). The snapshot machinery serves
 * only `/`; during the transition the new Study page lives at `/study` and
 * the preserved old console will live at `/advanced`, so this fixed table
 * maps extra routes to either a file (validated with the same
 * `resolveStaticSnapshot` machinery, read once at startup, held in memory)
 * or a redirect. A missing or invalid secondary file 404s its route and is
 * deliberately NOT a startup issue — only `/` participates in preflight.
 */
export type SecondaryPageEntry = string | { readonly redirect: string };

export const SECONDARY_PAGES: Readonly<Record<string, SecondaryPageEntry>> = {
  '/study': 'static/study.html',
  '/advanced': 'static/advanced.html',
};

export type SecondaryResolution =
  | { readonly kind: 'page'; readonly asset: StaticAsset }
  | { readonly kind: 'redirect'; readonly location: string };

/**
 * Reads every file entry once. Entries whose file is missing or fails the
 * single-inline snapshot contract are simply absent from the returned map
 * (their route 404s); redirect entries always resolve.
 */
export async function loadSecondaryPages(
  rootDirectory: string,
  table: Readonly<Record<string, SecondaryPageEntry>>,
): Promise<ReadonlyMap<string, SecondaryResolution>> {
  const resolved = new Map<string, SecondaryResolution>();
  for (const [route, entry] of Object.entries(table)) {
    if (typeof entry !== 'string') {
      resolved.set(route, { kind: 'redirect', location: entry.redirect });
      continue;
    }
    try {
      const snapshot = await resolveStaticSnapshot(path.join(rootDirectory, ...entry.split('/')));
      const asset = snapshot.assets.get('/');
      if (snapshot.mode === 'single-inline' && asset !== undefined) {
        resolved.set(route, { kind: 'page', asset });
      }
    } catch {
      // Missing/invalid secondary file: the route 404s; startup is unaffected.
    }
  }
  return resolved;
}

/** One response shape for both entry kinds: 302 + Location, or 200 + etag + nosniff. */
export function writeSecondaryResponse(response: http.ServerResponse, resolution: SecondaryResolution): void {
  if (resolution.kind === 'redirect') {
    response.writeHead(302, { location: resolution.location });
    response.end();
    return;
  }
  response.writeHead(200, {
    'content-type': resolution.asset.contentType,
    etag: `"${resolution.asset.sha256}"`,
    'x-content-type-options': 'nosniff',
  });
  response.end(resolution.asset.body);
}
