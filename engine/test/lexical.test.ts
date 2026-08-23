import { describe, expect, it } from 'vitest';

import {
  EXACT_PHRASE_FULL_AUTHORITY_WORDS,
  isMeaningfulPhraseFragment,
  phraseEvidence,
  subsumeCompletePhraseRestatements,
} from '../src/intents/lexical.js';
import type { Candidate } from '../src/ranking/rank.js';
import type { Evidence } from '../src/reasons/types.js';

describe('isMeaningfulPhraseFragment', () => {
  it('rejects stopword-heavy fragments with only one meaningful word', () => {
    expect(isMeaningfulPhraseFragment('is close to', 'God is close to the brokenhearted')).toBe(false);
  });

  it('accepts fallback fragments carrying at least two meaningful words', () => {
    expect(isMeaningfulPhraseFragment('close to the brokenhearted', 'God is close to the brokenhearted')).toBe(
      true,
    );
  });

  it('uses raw words when a query contains only function words', () => {
    expect(isMeaningfulPhraseFragment('to the', 'to the and')).toBe(true);
    expect(isMeaningfulPhraseFragment('the', 'to the and')).toBe(false);
  });
});

describe('phraseEvidence significant-width taper (0.10.0 stage 3)', () => {
  it('pins the reviewed full-authority constant at 3 — mirrored in eval/budgets.json, not a tuning knob', () => {
    expect(EXACT_PHRASE_FULL_AUTHORITY_WORDS).toBe(3);
  });

  it('files a complete one-significant-word match as token_overlap at full strength, keeping the truthful label', () => {
    const evidence = phraseEvidence('the cross', 1, 1);
    expect(evidence.family).toBe('token_overlap');
    expect(evidence.label).toBe('Exact phrase');
    expect(evidence.strength).toBe(1);
  });

  it('files a complete zero-significant-word match as token_overlap, never as authority', () => {
    const evidence = phraseEvidence('do not be', 0, 0);
    expect(evidence.family).toBe('token_overlap');
    expect(evidence.strength).toBe(1);
  });

  it('gives a complete two-significant-word match 2/3 authority — the 40-point tier, level with the concept_anchor ceiling', () => {
    const evidence = phraseEvidence("lord's supper", 2, 2);
    expect(evidence.family).toBe('exact_phrase');
    expect(evidence.label).toBe('Exact phrase');
    expect(evidence.strength).toBeCloseTo(2 / 3, 10);
  });

  it('gives complete matches of three or more significant words full authority', () => {
    expect(phraseEvidence('doers word hearers', 3, 3).strength).toBe(1);
    expect(phraseEvidence('doers of the word not hearers only', 5, 5).strength).toBe(1);
    expect(phraseEvidence('doers word hearers', 3, 3).family).toBe('exact_phrase');
  });

  it('keeps the 0.8.0 fragment behavior for wide fragments: 3 of 6 significant words still earns half coverage', () => {
    const evidence = phraseEvidence('close to the brokenhearted', 3, 6);
    expect(evidence.family).toBe('exact_phrase');
    expect(evidence.label).toBe('Contains "close to the brokenhearted"');
    expect(evidence.strength).toBeCloseTo(0.5, 10);
  });

  it('tapers narrow fragments too: a 2-significant-word fragment carries the same 2/3 authority factor', () => {
    const evidence = phraseEvidence('still waters', 2, 4);
    expect(evidence.family).toBe('exact_phrase');
    expect(evidence.strength).toBeCloseTo(0.5 * (2 / 3), 10);
  });

  it('is deterministic across repeated calls', () => {
    const first = phraseEvidence("lord's supper", 2, 2);
    for (let i = 0; i < 3; i += 1) {
      expect(phraseEvidence("lord's supper", 2, 2)).toEqual(first);
    }
  });
});

describe('subsumeCompletePhraseRestatements (0.10.0 stage 3)', () => {
  const evidence = {
    phrase: { family: 'exact_phrase', label: 'Exact phrase', strength: 1 },
    overlap: { family: 'token_overlap', label: 'Shared words: lord, supper', strength: 0.7 },
    proximity: { family: 'proximity', label: 'Matched words appear close together', strength: 0.5 },
    variant: { family: 'translation_variant', label: 'Worded this way in another translation: supper', strength: 1 },
    terms: { family: 'passage_terms', label: 'Preached vocabulary: communion', strength: 0.4 },
    anchor: { family: 'concept_anchor', label: "Theme: The Lord's Supper", strength: 1 },
  } satisfies Record<string, Evidence>;

  const candidate = (targetId: string, items: readonly Evidence[]): Candidate => ({
    targetId,
    groupId: 'g',
    evidence: items,
  });

  it('drops token_overlap and proximity from a marked complete match, and nothing else', () => {
    const input = [
      candidate('marked', [
        evidence.phrase,
        evidence.overlap,
        evidence.proximity,
        evidence.variant,
        evidence.terms,
        evidence.anchor,
      ]),
    ];
    const output = subsumeCompletePhraseRestatements(input, new Set(['marked']));
    expect(output[0]!.evidence).toEqual([
      evidence.phrase,
      evidence.variant,
      evidence.terms,
      evidence.anchor,
    ]);
  });

  it('leaves unmarked candidates untouched — fragments never subsume, because the caller only marks complete whole-query exact_phrase emissions', () => {
    const input = [
      candidate('fragment-match', [evidence.phrase, evidence.overlap, evidence.proximity]),
    ];
    const output = subsumeCompletePhraseRestatements(input, new Set(['some-other-target']));
    expect(output).toEqual(input);
  });

  it('is the identity for an empty mark set', () => {
    const input = [candidate('a', [evidence.overlap])];
    expect(subsumeCompletePhraseRestatements(input, new Set())).toBe(input);
  });

  it('does not mutate its input', () => {
    const inner = candidate('marked', [evidence.phrase, evidence.overlap]);
    const input = [inner];
    subsumeCompletePhraseRestatements(input, new Set(['marked']));
    expect(inner.evidence).toEqual([evidence.phrase, evidence.overlap]);
  });

  it('is deterministic across repeated calls', () => {
    const input = [
      candidate('marked', [evidence.phrase, evidence.overlap, evidence.proximity]),
      candidate('other', [evidence.overlap]),
    ];
    const marks = new Set(['marked']);
    const first = JSON.stringify(subsumeCompletePhraseRestatements(input, marks));
    for (let i = 0; i < 3; i += 1) {
      expect(JSON.stringify(subsumeCompletePhraseRestatements(input, marks))).toBe(first);
    }
  });
});
