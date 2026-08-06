/**
 * Stage 2 — the judgment log (plan §4).
 *
 * One judgment is one JSON line appended to `workbench/judgments.jsonl` — an
 * append-only file committed to git, so the judgment history is reviewable
 * data with the same lineage discipline as everything else. Corrections are
 * new lines; a later judgment on the same query + target supersedes an
 * earlier one at compile time, by `at` order. Editing or deleting lines is
 * off-limits — history is part of the record.
 *
 * Everything situational is injected (reviewer, identities, the reference
 * resolver, the clock, the log path) so validation and append logic unit-test
 * without an engine or a real artifact. The server wires in the real values.
 */

import { appendFile } from 'node:fs/promises';

export const VERDICTS = ['fits', 'doesnt-fit', 'missing'] as const;
export type Verdict = (typeof VERDICTS)[number];

export const CAUSES = ['wrong-anchor', 'concept-misfire', 'lexical-noise'] as const;
export type Cause = (typeof CAUSES)[number];

/** The causes that imply ontology work, and therefore demand a note. */
export const ANCHOR_AFFECTING_CAUSES: readonly Cause[] = ['wrong-anchor', 'concept-misfire'];

/** The three identities every judgment is stamped with, from the running engine. */
export interface JudgmentIdentity {
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
}

/** One line of `judgments.jsonl`. Field order here is the field order on disk. */
export interface JudgmentRecord {
  readonly at: string;
  readonly reviewer: string;
  readonly query: string;
  readonly verdict: Verdict;
  readonly targetId?: string;
  readonly reference?: string;
  readonly pin?: true;
  readonly reasonFamily?: string;
  readonly cause?: Cause;
  /**
   * True when the workbench classified the cause instead of the reviewer:
   * a ✗ on a result with no concept evidence is lexical-noise by
   * construction, and the UI records it in one click. Transparency only —
   * the compile step routes inferred and hand-judged causes identically.
   */
  readonly causeInferred?: true;
  readonly conceptId?: string;
  readonly note?: string;
  /**
   * Server-attached passage text for a `missing` judgment. This is what lets
   * the note be optional: the defend-it-from-the-text rule is satisfied by
   * the text itself, which the server fetched while validating the reference.
   */
  readonly excerpt?: string;
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
}

/** The fields a client may send. Everything else is stamped server-side. */
const CLIENT_FIELDS = new Set([
  'query',
  'verdict',
  'targetId',
  'reference',
  'pin',
  'reasonFamily',
  'cause',
  'causeInferred',
  'conceptId',
  'note',
]);

export interface JudgmentLogOptions {
  readonly logPath: string;
  /** Static reviewer string; the server reads WORKBENCH_REVIEWER, default "jesse". */
  readonly reviewer: string;
  /** Stamped by the server from the running engine, never from the client. */
  readonly identity: JudgmentIdentity;
  /**
   * Resolves a human-typed reference for a `missing` judgment to the passage
   * text (an excerpt), or null when the reference does not resolve. The
   * server backs this with `engine.passage()`, whose typed result makes an
   * invalid reference a value, not an exception. The excerpt is what lets a
   * `missing` note be optional: the text defends the judgment by itself.
   */
  readonly resolveReference: (reference: string) => Promise<string | null>;
  /** Injectable clock, for tests. Defaults to the real one. */
  readonly now?: () => Date;
}

export type SubmitResult =
  | { readonly ok: true; readonly record: JudgmentRecord }
  | { readonly ok: false; readonly reason: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * A target id like "WEB:59001022" must decode to a real verse location
 * (BBCCCVVV: book 1-66, chapter and verse at least 1) or the compiler could
 * never turn it back into a reference. Checked with plain arithmetic so this
 * module needs no import from the pipeline.
 */
function isDecodableTargetId(value: string): boolean {
  const match = /^[A-Z][A-Z0-9]*:(\d{7,8})$/.exec(value);
  if (!match) return false;
  const verseId = Number(match[1]);
  const bookId = Math.floor(verseId / 1_000_000);
  const chapter = Math.floor((verseId % 1_000_000) / 1_000);
  const verse = verseId % 1_000;
  return bookId >= 1 && bookId <= 66 && chapter >= 1 && verse >= 1;
}

/** Rejects with a plain-English reason; never throws for bad input. */
export async function validateJudgment(
  body: unknown,
  options: JudgmentLogOptions,
): Promise<SubmitResult> {
  if (!isPlainObject(body)) {
    return { ok: false, reason: 'A judgment must be a JSON object.' };
  }

  for (const key of Object.keys(body)) {
    if (!CLIENT_FIELDS.has(key)) {
      const stamped = ['at', 'reviewer', 'excerpt', 'engineVersion', 'corpusFingerprint', 'layerFingerprint'];
      return {
        ok: false,
        reason: stamped.includes(key)
          ? `"${key}" is stamped by the server, never sent by the client.`
          : `Unknown field "${key}".`,
      };
    }
  }

  if (!nonEmptyString(body.query)) {
    return { ok: false, reason: 'Every judgment needs the query as typed ("query").' };
  }
  const verdict = body.verdict;
  if (typeof verdict !== 'string' || !(VERDICTS as readonly string[]).includes(verdict)) {
    return { ok: false, reason: 'Verdict must be "fits", "doesnt-fit", or "missing".' };
  }

  if (body.note !== undefined && !nonEmptyString(body.note)) {
    return { ok: false, reason: 'A note, when present, must be non-empty text.' };
  }

  // Per-verdict field rules, straight from the plan's schema table (§4).
  let attachedExcerpt: string | undefined;
  if (verdict === 'missing') {
    for (const [field, hint] of [
      ['targetId', 'a "missing" judgment names a reference, not a result'],
      ['cause', 'causes belong to "doesnt-fit" judgments'],
      ['causeInferred', 'causeInferred belongs to "doesnt-fit" judgments'],
      ['conceptId', 'conceptId belongs to "doesnt-fit" judgments'],
      ['pin', 'pin belongs to "fits" judgments'],
      ['reasonFamily', 'reasonFamily belongs to pinned "fits" judgments'],
    ] as const) {
      if (body[field] !== undefined) {
        return { ok: false, reason: `"${field}" does not belong on a "missing" judgment — ${hint}.` };
      }
    }
    if (!nonEmptyString(body.reference)) {
      return {
        ok: false,
        reason: 'A "missing" judgment needs the reference that should have surfaced.',
      };
    }
    const excerpt = await options.resolveReference(body.reference);
    if (excerpt === null) {
      return {
        ok: false,
        reason: `"${body.reference}" is not a reference the engine can resolve.`,
      };
    }
    // The defend-it-from-the-text rule (§4). A note still satisfies it, but
    // so does the text itself: when the server can attach the passage
    // excerpt, that IS the defense, and no hand-written note is required.
    if (!nonEmptyString(body.note)) {
      if (!nonEmptyString(excerpt)) {
        return {
          ok: false,
          reason:
            'A "missing" judgment needs a note defending it from the text — the passage ' +
            'text could not be attached, so no bare clicks.',
        };
      }
      attachedExcerpt = excerpt.trim();
    }
  } else {
    // fits / doesnt-fit: judged against a result the engine actually returned.
    if (body.reference !== undefined) {
      return { ok: false, reason: '"reference" belongs to "missing" judgments only.' };
    }
    if (!nonEmptyString(body.targetId)) {
      return { ok: false, reason: `A "${verdict}" judgment needs the result's targetId.` };
    }
    if (!isDecodableTargetId(body.targetId)) {
      return {
        ok: false,
        reason: `"${body.targetId}" is not a target id like "WEB:59001022" (translation:verse-id).`,
      };
    }
  }

  if (verdict === 'fits') {
    for (const [field, hint] of [
      ['cause', 'causes belong to "doesnt-fit" judgments'],
      ['causeInferred', 'causeInferred belongs to "doesnt-fit" judgments'],
      ['conceptId', 'conceptId belongs to "doesnt-fit" judgments'],
    ] as const) {
      if (body[field] !== undefined) {
        return { ok: false, reason: `"${field}" does not belong on a "fits" judgment — ${hint}.` };
      }
    }
    if (body.pin !== undefined && body.pin !== true) {
      return { ok: false, reason: 'Omit "pin" for a plain ✓; send pin: true only to pin.' };
    }
    if (body.reasonFamily !== undefined) {
      if (body.pin !== true) {
        return {
          ok: false,
          reason: '"reasonFamily" only makes sense on a pinned ✓ — it compiles into the fixture.',
        };
      }
      if (!nonEmptyString(body.reasonFamily)) {
        return { ok: false, reason: 'A reasonFamily, when present, must be non-empty text.' };
      }
    }
  }

  if (verdict === 'doesnt-fit') {
    for (const [field, hint] of [
      ['pin', 'pin belongs to "fits" judgments'],
      ['reasonFamily', 'reasonFamily belongs to pinned "fits" judgments'],
    ] as const) {
      if (body[field] !== undefined) {
        return {
          ok: false,
          reason: `"${field}" does not belong on a "doesnt-fit" judgment — ${hint}.`,
        };
      }
    }
    const cause = body.cause;
    if (typeof cause !== 'string' || !(CAUSES as readonly string[]).includes(cause)) {
      return {
        ok: false,
        reason: 'A ✗ needs a cause: "wrong-anchor", "concept-misfire", or "lexical-noise".',
      };
    }
    if (body.causeInferred !== undefined && body.causeInferred !== true) {
      return {
        ok: false,
        reason:
          'Omit "causeInferred" for a reviewer-judged cause; send causeInferred: true only ' +
          'when the workbench classified it.',
      };
    }
    if (ANCHOR_AFFECTING_CAUSES.includes(cause as Cause)) {
      if (!nonEmptyString(body.conceptId)) {
        return {
          ok: false,
          reason: `A "${cause}" judgment must name the concept that produced the bad evidence.`,
        };
      }
      if (!nonEmptyString(body.note)) {
        return {
          ok: false,
          reason:
            `A "${cause}" judgment implies ontology work, so it needs a note defending it ` +
            'from the text — no bare clicks.',
        };
      }
    } else if (body.conceptId !== undefined) {
      return {
        ok: false,
        reason: '"conceptId" only belongs on "wrong-anchor" or "concept-misfire" judgments.',
      };
    }
  }

  const now = options.now ?? (() => new Date());
  const record: JudgmentRecord = {
    at: now().toISOString(),
    reviewer: options.reviewer,
    query: (body.query as string).trim(),
    verdict: verdict as Verdict,
    ...(body.targetId !== undefined ? { targetId: body.targetId as string } : {}),
    ...(body.reference !== undefined ? { reference: (body.reference as string).trim() } : {}),
    ...(body.pin === true ? { pin: true as const } : {}),
    ...(body.reasonFamily !== undefined ? { reasonFamily: body.reasonFamily as string } : {}),
    ...(body.cause !== undefined ? { cause: body.cause as Cause } : {}),
    ...(body.causeInferred === true ? { causeInferred: true as const } : {}),
    ...(body.conceptId !== undefined ? { conceptId: body.conceptId as string } : {}),
    ...(body.note !== undefined ? { note: (body.note as string).trim() } : {}),
    ...(attachedExcerpt !== undefined ? { excerpt: attachedExcerpt } : {}),
    engineVersion: options.identity.engineVersion,
    corpusFingerprint: options.identity.corpusFingerprint,
    layerFingerprint: options.identity.layerFingerprint,
  };
  return { ok: true, record };
}

export interface JudgmentLog {
  /** Validates, stamps, and appends exactly one line. Never rewrites. */
  submit(body: unknown): Promise<SubmitResult>;
}

export function createJudgmentLog(options: JudgmentLogOptions): JudgmentLog {
  return {
    async submit(body: unknown): Promise<SubmitResult> {
      const result = await validateJudgment(body, options);
      if (!result.ok) return result;
      await appendFile(options.logPath, `${JSON.stringify(result.record)}\n`, 'utf8');
      return result;
    },
  };
}
