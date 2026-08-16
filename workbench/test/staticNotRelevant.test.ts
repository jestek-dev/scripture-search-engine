import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const page = readFileSync(new URL('../static/index.html', import.meta.url), 'utf8');

// The evidence-based "Not relevant" flow is a UI contract: these string pins
// keep the plain-language interview wired to the engine's actual evidence
// vocabulary. If an assertion here fails after an engine label change, the
// page's prefix-stripping must be updated in the same commit — the runtime
// fallback only degrades to a hand-typed concept id, it cannot re-learn a
// renamed prefix on its own.
describe('evidence-based not-relevant flow', () => {
  it('wires concept ids from the artifact concept table, not hand-typed ids', () => {
    expect(page).toContain("requestJson('/api/concepts')");
    expect(page).toContain('conceptIdsByLabel');
    expect(page).toContain('conceptEvidence(result)');
  });

  it('records the auto-classified diagnosis when no theme evidence exists', () => {
    expect(page).toContain('diagnosisInferred: true');
    expect(page).toContain("diagnosis: 'lexical-noise'");
    expect(page).toContain('matched words, not meaning');
  });

  it('tells the truth about what an irrelevant judgment compiles to', () => {
    expect(page).toContain('demoted out of the top results for this query only');
    expect(page).toContain('the verse stays in the corpus and every other search');
  });

  it('strips all three current evidence label prefixes', () => {
    expect(page).toContain('/^Theme: /');
    expect(page).toContain('/^Theme cue: /');
    expect(page).toContain('/^Related theme: /');
    expect(page).toContain("family !== 'concept_anchor' && reason.family !== 'concept_lexicon'");
  });

  it('asks both plain yes/no questions in the reviewer vocabulary', () => {
    expect(page).toContain('” fit this verse?');
    expect(page).toContain('” have brought up “');
  });

  it('drops the jargon diagnosis gate from the primary path', () => {
    expect(page).not.toContain('Choose the plain-language reason this result is not relevant.');
    expect(page).not.toContain('Choose what went wrong');
    expect(page).not.toContain('That technical diagnosis needs both a concept id and a note.');
    expect(page).not.toContain('Concept id, if you need one');
  });

  it('keeps a hand-written sentence required only where theme files change', () => {
    expect(page).toContain('queues a change to reviewed theme files');
    expect(page).toContain('say why, from the verse itself');
  });

  it('keeps the interview and typed note alive across a rejected submit', () => {
    // The interview draft (with the required hand-typed note) is cleared only
    // in submitJudgment's success branch, alongside the missing/prefer draft
    // clears. A rejected judgment — stale snapshot token, CSRF, network —
    // must leave the interview open for retry, matching v1.1 (4cb805c).
    expect(page).toContain(
      "if (clean.action === 'irrelevant' && typeof clean.targetId === 'string')",
    );
    expect(page).toContain('resultDraft.interview = null');
    // submitIrrelevant must not pre-clear the draft before the async submit
    // resolves; the only clear inside the interview panel is the explicit
    // "Never mind" cancel.
    const interviewSubmit = page.slice(
      page.indexOf('const submitIrrelevant'),
      page.indexOf('const question ='),
    );
    expect(interviewSubmit).not.toContain('draft.interview = null');
  });

  it('keeps the technical disclosure and history chips', () => {
    expect(page).toContain('Why this result misses or notes');
    expect(page).toContain('DIAGNOSIS_LABELS[record.diagnosis]');
  });
});
