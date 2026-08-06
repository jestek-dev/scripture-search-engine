/**
 * Stages 1 and 2 — the viewer and the judgment log.
 *
 * Node's built-in `http`, bound to 127.0.0.1, zero dependencies beyond the
 * engine. `/api/search` returns the awaited `engine.research()` result
 * JSON-serialized VERBATIM — the three identities ride on every response
 * because `ResearchResult` is `ResearchOutcome & ResultIdentity`, and no
 * reshaping happens here: what the API returns is byte-for-byte what any
 * consumer would compute.
 *
 * The only write anywhere is `POST /api/judgment`, which appends one line to
 * `workbench/judgments.jsonl` (plan §4). The artifact stays read-only.
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
import { createJudgmentLog } from './judgments.js';
import { openCorpus } from './nodeSqlitePort.js';

const PORT = Number(process.env.WORKBENCH_PORT ?? 8787);
const STATIC_PAGE = path.join(repoRoot, 'workbench', 'static', 'index.html');
const JUDGMENTS_PATH = path.join(repoRoot, 'workbench', 'judgments.jsonl');

/** Judgment posts are small; anything bigger than this is not a judgment. */
const MAX_BODY_BYTES = 64 * 1024;

function readJsonBody(request: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let bytes = 0;
    request
      .on('data', (chunk: Buffer) => {
        bytes += chunk.length;
        if (bytes > MAX_BODY_BYTES) {
          reject(new Error('Request body too large.'));
          request.destroy();
          return;
        }
        chunks.push(chunk);
      })
      .on('error', reject)
      .on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        } catch {
          reject(new Error('Request body is not valid JSON.'));
        }
      });
  });
}

function sendJson(response: http.ServerResponse, status: number, body: string): void {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(body);
}

function sendError(response: http.ServerResponse, status: number, message: string): void {
  sendJson(response, status, JSON.stringify({ error: message }));
}

/**
 * The stored excerpt for a `missing` judgment: the passage's own words,
 * bounded so a whole-chapter reference cannot bloat a log line. 280
 * characters holds any single verse and enough of a longer passage to defend
 * the judgment.
 */
const EXCERPT_MAX_CHARS = 280;

function passageExcerpt(verses: readonly { text: string }[]): string {
  const text = verses.map((verse) => verse.text.trim()).join(' ');
  return text.length <= EXCERPT_MAX_CHARS ? text : `${text.slice(0, EXCERPT_MAX_CHARS - 1).trimEnd()}…`;
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

  // Reviewer is a static string (plan decision 5); identities are stamped
  // from the running engine, never taken from the client. A `missing`
  // reference is validated through `engine.passage()`, whose typed result
  // makes an invalid reference a value rather than an exception — and the
  // resolved passage text rides back as the excerpt, so the text itself can
  // stand in for a hand-written note (§4, v1.1).
  const reviewer = process.env.WORKBENCH_REVIEWER ?? 'jesse';
  console.log(`reviewer:          ${reviewer}`);
  const judgments = createJudgmentLog({
    logPath: JUDGMENTS_PATH,
    reviewer,
    identity: {
      engineVersion: engine.engineVersion,
      corpusFingerprint: engine.corpusFingerprint,
      layerFingerprint: engine.layerFingerprint,
    },
    resolveReference: async (reference) => {
      const outcome = await engine.passage(reference);
      return outcome.kind === 'passage' ? passageExcerpt(outcome.passage.verses) : null;
    },
  });

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

      if (request.method === 'POST' && url.pathname === '/api/judgment') {
        let body: unknown;
        try {
          body = await readJsonBody(request);
        } catch (error) {
          sendError(response, 400, error instanceof Error ? error.message : 'Bad request body.');
          return;
        }
        const result = await judgments.submit(body);
        if (!result.ok) {
          sendError(response, 400, result.reason);
          return;
        }
        sendJson(response, 201, JSON.stringify({ ok: true, record: result.record }));
        return;
      }

      if (request.method !== 'GET') {
        sendError(response, 405, 'The only write is POST /api/judgment; everything else is GET.');
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

      if (url.pathname === '/api/passage') {
        const reference = url.searchParams.get('ref');
        if (reference === null || reference.trim() === '') {
          sendError(response, 400, 'Missing reference: /api/passage?ref=...');
          return;
        }
        // Verbatim `engine.passage()` result, same discipline as /api/search.
        // The UI uses this to validate a missing-passage reference as it is
        // typed and to pre-fill the note with the verse's own words.
        sendJson(response, 200, JSON.stringify(await engine.passage(reference)));
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
