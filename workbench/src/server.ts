/**
 * Stage 1 — the read-only viewer.
 *
 * Node's built-in `http`, bound to 127.0.0.1, zero dependencies beyond the
 * engine. `/api/search` returns the awaited `engine.research()` result
 * JSON-serialized VERBATIM — the three identities ride on every response
 * because `ResearchResult` is `ResearchOutcome & ResultIdentity`, and no
 * reshaping happens here: what the API returns is byte-for-byte what any
 * consumer would compute.
 *
 * Startup re-verifies the artifact's sha256 against the committed descriptor
 * every time. The workbench judges the reviewed artifact or nothing.
 */

import http from 'node:http';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { createEngine, type ContentQueryPort } from '@jestek-dev/scripture-engine';

import { databasePath, readDescriptor, repoRoot, sha256OfFile, type ArtifactDescriptor } from './descriptor.js';
import { openCorpus } from './nodeSqlitePort.js';

const PORT = Number(process.env.WORKBENCH_PORT ?? 8787);
const STATIC_PAGE = path.join(repoRoot, 'workbench', 'static', 'index.html');

function sendJson(response: http.ServerResponse, status: number, body: string): void {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(body);
}

function sendError(response: http.ServerResponse, status: number, message: string): void {
  sendJson(response, status, JSON.stringify({ error: message }));
}

async function conceptList(port: ContentQueryPort): Promise<unknown> {
  const { rows } = await port.execute('SELECT id, label FROM concepts ORDER BY id');
  return rows;
}

async function conceptDetail(port: ContentQueryPort, conceptId: string): Promise<unknown | null> {
  const concept = await port.execute('SELECT id, label FROM concepts WHERE id = ?', [conceptId]);
  if (concept.rows.length === 0) return null;
  const [lexicon, anchors, related] = await Promise.all([
    port.execute(
      'SELECT phrase, normalized, token_count FROM concept_lexicon WHERE concept_id = ?',
      [conceptId],
    ),
    port.execute(
      'SELECT start_verse_id, end_verse_id, source_id, weight, locator FROM concept_anchors WHERE concept_id = ?',
      [conceptId],
    ),
    port.execute('SELECT related_id FROM concept_related WHERE concept_id = ?', [conceptId]),
  ]);
  return {
    ...concept.rows[0],
    lexicon: lexicon.rows,
    anchors: anchors.rows,
    related: related.rows.map((row) => row.related_id),
  };
}

async function main(): Promise<void> {
  const descriptor: ArtifactDescriptor = await readDescriptor();

  if (!existsSync(databasePath)) {
    console.error('No artifact. Run `npm run fetch-artifact --workspace workbench` first.');
    process.exit(1);
  }

  // The whole admission check: the full reviewed artifact or nothing. This
  // also catches a stale .artifact/ left over from a previous descriptor.
  const digest = await sha256OfFile(databasePath);
  if (digest !== descriptor.databaseSha256) {
    console.error(
      `Artifact sha256 does not match the committed descriptor — refusing to serve.\n` +
        `  expected ${descriptor.databaseSha256}\n` +
        `  found    ${digest}\n` +
        `Re-run \`npm run fetch-artifact --workspace workbench\`.`,
    );
    process.exit(1);
  }

  const port = openCorpus(databasePath);
  const engine = await createEngine(port);

  // Every judging session starts by seeing exactly what it is judging.
  console.log(`engineVersion:     ${engine.engineVersion}`);
  console.log(`corpusFingerprint: ${engine.corpusFingerprint}`);
  console.log(`layerFingerprint:  ${engine.layerFingerprint}`);

  const meta = {
    engineVersion: engine.engineVersion,
    corpusFingerprint: engine.corpusFingerprint,
    layerFingerprint: engine.layerFingerprint,
    schemaVersion: descriptor.schemaVersion,
    translations: descriptor.translations,
  };

  const server = http.createServer((request, response) => {
    void (async () => {
      const url = new URL(request.url ?? '/', `http://127.0.0.1:${PORT}`);

      if (request.method !== 'GET') {
        sendError(response, 405, 'Stage 1 is read-only: GET only.');
        return;
      }

      if (url.pathname === '/') {
        const page = await readFile(STATIC_PAGE, 'utf8');
        response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        response.end(page);
        return;
      }

      if (url.pathname === '/api/search') {
        const query = url.searchParams.get('q');
        if (query === null || query.trim() === '') {
          sendError(response, 400, 'Missing query: /api/search?q=...');
          return;
        }
        // Verbatim: no reshaping, no augmentation.
        sendJson(response, 200, JSON.stringify(await engine.research(query)));
        return;
      }

      if (url.pathname === '/api/concepts') {
        sendJson(response, 200, JSON.stringify(await conceptList(port)));
        return;
      }

      const conceptMatch = /^\/api\/concepts\/([^/]+)$/.exec(url.pathname);
      if (conceptMatch !== null) {
        const detail = await conceptDetail(port, decodeURIComponent(conceptMatch[1]!));
        if (detail === null) {
          sendError(response, 404, 'Unknown concept id.');
          return;
        }
        sendJson(response, 200, JSON.stringify(detail));
        return;
      }

      if (url.pathname === '/api/meta') {
        sendJson(response, 200, JSON.stringify(meta));
        return;
      }

      sendError(response, 404, 'Not found.');
    })().catch((error: unknown) => {
      console.error(error);
      if (!response.headersSent) {
        sendError(response, 500, error instanceof Error ? error.message : 'Internal error.');
      } else {
        response.end();
      }
    });
  });

  server.listen(PORT, '127.0.0.1', () => {
    console.log(`Workbench viewer at http://127.0.0.1:${PORT}/`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
