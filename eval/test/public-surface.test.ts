/**
 * The public/internal export split (plan P7.2 / CO-5).
 *
 * Consumers pin the PUBLIC entry (`@jestek-dev/scripture-engine`): the five
 * methods, the result types, and the `corrections`/`suggestion` fields.
 * Everything else lives behind `@jestek-dev/scripture-engine/internal` with
 * no stability promise. This suite makes the split load-bearing:
 *
 *   1. The public entry's runtime surface is asserted EXACTLY — a new value
 *      export cannot appear (or vanish) without editing this list, and
 *      editing this list is a §5 consumer-contract change (CLAUDE.md: check
 *      the consumer contract before changing a public type).
 *   2. Internals are NOT reachable from the public entry, at compile time:
 *      each `@ts-expect-error` below is itself fail-closed — if the import
 *      stopped erroring (an internal leaked back into the public entry),
 *      `tsc --noEmit` fails with "unused @ts-expect-error". The unmarked
 *      control imports prove the mechanism is not vacuous.
 *   3. The internal entry still reaches the moved internals (the repo's own
 *      pipeline/eval/workbench imports keep working), and is a strict
 *      superset of the public entry.
 */

import { describe, expect, it } from 'vitest';

import * as publicEntry from '@jestek-dev/scripture-engine';
import * as internalEntry from '@jestek-dev/scripture-engine/internal';

// ---- Compile-time: internals are not reachable from the public entry ----
// (type-only imports: erased at runtime, checked by `tsc --noEmit`, which
// covers eval/test/. Each line MUST keep erroring or the typecheck fails.)

// @ts-expect-error mergeCandidates is internal — not reachable from the public entry
import type { mergeCandidates } from '@jestek-dev/scripture-engine';
// @ts-expect-error the ranker is internal — not reachable from the public entry
import type { rank } from '@jestek-dev/scripture-engine';
// @ts-expect-error the tokenizer is internal — not reachable from the public entry
import type { tokenStream } from '@jestek-dev/scripture-engine';
// @ts-expect-error CorpusRepository is internal — not reachable from the public entry
import type { CorpusRepository } from '@jestek-dev/scripture-engine';
// @ts-expect-error reviewed constants are internal — not reachable from the public entry
import type { PASSAGE_TERM_PMI_HALF_SATURATION } from '@jestek-dev/scripture-engine';
// @ts-expect-error Candidate is an internal ranker type — not reachable from the public entry
import type { Candidate } from '@jestek-dev/scripture-engine';

// Controls (no @ts-expect-error): the public tier IS reachable — proving the
// mechanism above fails for reachability reasons, not for import mechanics.
import type { ScriptureEngine, DiscoveryResult, ReferenceSuggestion } from '@jestek-dev/scripture-engine';
type _PublicReachable = [ScriptureEngine, DiscoveryResult, ReferenceSuggestion];

/**
 * The exact runtime (value) surface of the public entry. Types are erased and
 * asserted separately above; these are the only VALUES a consumer can import.
 * Changing this list is a §5 consumer-contract change — never a drive-by.
 */
const PUBLIC_VALUE_EXPORTS = ['ENGINE_VERSION', 'TOKENIZER_VERSION', 'createEngine'] as const;

describe('public entry surface (exact)', () => {
  it('exports exactly the public value tier, nothing else', () => {
    expect(Object.keys(publicEntry).sort()).toEqual([...PUBLIC_VALUE_EXPORTS].sort());
  });

  it('createEngine and the version constants are what they claim', () => {
    expect(typeof publicEntry.createEngine).toBe('function');
    expect(publicEntry.ENGINE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    expect(publicEntry.TOKENIZER_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe('internal entry', () => {
  it('is a strict superset of the public entry', () => {
    for (const name of PUBLIC_VALUE_EXPORTS) {
      expect(internalEntry[name], `internal entry must re-export public ${name}`).toBe(
        publicEntry[name],
      );
    }
    expect(Object.keys(internalEntry).length).toBeGreaterThan(PUBLIC_VALUE_EXPORTS.length);
  });

  it('reaches the moved internals (repo tooling keeps working)', () => {
    // One representative per internal module family — an accidental drop of a
    // whole re-export block fails here with the missing family named.
    for (const name of [
      'mergeCandidates', // intents/lexical
      'dedupeConceptAnchors', // intents/concept
      'pickCorrection', // intents/spelling
      'tokenStream', // tokenizer
      'resolveReference', // reference
      'parseVerseId', // reference/verseId
      'isAuthoritative', // reasons/types
      'polishChipsForDisplay', // reasons/display
      'applyBudgets', // ranking/budgets
      'rank', // ranking/rank
      'CorpusRepository', // corpus/repository
      'collapseRuns', // createEngine grouping seam
    ]) {
      expect(
        (internalEntry as Record<string, unknown>)[name],
        `internal entry lost ${name}`,
      ).toBeDefined();
    }
  });
});
