import { createHash } from 'node:crypto';

import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';

import { previewStructuredYamlEdit, StructuredYamlError } from '../src/structuredYaml.js';
import type { StructuredConceptOperation } from '../src/structuredYaml.js';

const SOURCE = `# file-level explanation
id: hope-in-god
label: Hope
# lexicon rationale survives
lexicon:
  - hope in god
anchors:
  # editorial anchor note survives
  - ref: Jeremiah 29:11
    sources: [editorial]
    weight: 1.0
  # importer-owned anchor
  - ref: Romans 15:13
    sources: [torrey]
    weight: 0.8
openbibleTopics:
  - hope
related:
  - second-coming
customField:
  nested: untouched
`;

const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const provenance = { source: 'editorial', confirmed: true, reviewer: 'Jesse', evidence: 'The passage text directly supports this change.' } as const;
const common = { operationId: 'op-yaml', sourcePaths: ['ontology/concepts/hope-in-god.yaml'], provenance, reason: 'The reviewed text directly supports this constrained source edit.' } as const;

function preview(operation: StructuredConceptOperation, source = SOURCE) {
  return previewStructuredYamlEdit('ontology/concepts/hope-in-god.yaml', source, hash(source), operation);
}

describe('structured YAML previews', () => {
  it('uses full normalized files while preserving comments and unrelated fields', () => {
    const result = preview({ ...common, type: 'lexicon-phrase-add', conceptId: 'hope-in-god', phrase: 'steadfast hope' });
    expect(result.changed).toBe(true);
    expect(result.before.text).toContain('# lexicon rationale survives');
    expect(result.after.text).toContain('# editorial anchor note survives');
    expect(result.after.text).toContain('# importer-owned anchor');
    expect(result.after.text).toContain('customField:');
    expect(parse(result.after.text)).toMatchObject({
      lexicon: ['hope in god', 'steadfast hope'],
      openbibleTopics: ['hope'],
      customField: { nested: 'untouched' },
    });
    expect(result.before.sha256).toBe(hash(result.before.text));
    expect(result.after.sha256).toBe(hash(result.after.text));
  });

  it('removes only the selected editorial phrase and preserves document structure', () => {
    const result = preview({ ...common, type: 'lexicon-phrase-remove', conceptId: 'hope-in-god', phrase: 'hope in god', currentOwner: 'editorial' });
    expect(parse(result.after.text)).toMatchObject({ lexicon: [], openbibleTopics: ['hope'], customField: { nested: 'untouched' } });
  });

  it('uses engine-normalized phrase identity during YAML application', () => {
    expect(() => preview({ ...common, type: 'lexicon-phrase-add', conceptId: 'hope-in-god', phrase: 'HOPE-IN-GOD' })).toThrow(/already exists/);
    const removed = preview({ ...common, type: 'lexicon-phrase-remove', conceptId: 'hope-in-god', phrase: 'HOPE-IN-GOD', currentOwner: 'editorial' });
    expect(parse(removed.after.text)).toMatchObject({ lexicon: [] });
  });

  it('adds and adjusts editorial anchors through YAML map and sequence nodes', () => {
    const added = preview({ ...common, type: 'editorial-anchor-add', conceptId: 'hope-in-god', anchor: { locator: 'Romans 8:24-25', sources: ['editorial'], weight: 0.85 } });
    const adjusted = previewStructuredYamlEdit(
      'ontology/concepts/hope-in-god.yaml', added.after.text, hash(added.after.text),
      { ...common, operationId: 'op-adjust', type: 'editorial-anchor-adjust', conceptId: 'hope-in-god', current: { locator: 'Romans 8:24-25', sources: ['editorial'], weight: 0.85 }, next: { locator: 'Romans 8:24-25', weight: 0.9 } },
    );
    const parsed = parse(adjusted.after.text) as { anchors: { ref: string; sources: string[]; weight: number }[] };
    expect(parsed.anchors.find((anchor) => anchor.ref === 'Romans 8:24-25')).toEqual({ ref: 'Romans 8:24-25', sources: ['editorial'], weight: 0.9 });
    expect(adjusted.after.text).toContain('# importer-owned anchor');
  });

  it('applies remove and adjust operations by canonical anchor identity', () => {
    const aliasSource = `id: hope-in-god\nlabel: Hope\nlexicon: [hope]\nanchors:\n  - ref: John 1:1\n    sources: [editorial]\n    weight: 1\n`;
    const removed = preview({
      ...common, type: 'editorial-anchor-remove', conceptId: 'hope-in-god', locator: 'john 01:001', currentSources: ['editorial'],
    }, aliasSource);
    expect(parse(removed.after.text)).toMatchObject({ anchors: [] });

    const adjusted = preview({
      ...common, type: 'editorial-anchor-adjust', conceptId: 'hope-in-god',
      current: { locator: 'john 01:001', sources: ['editorial'], weight: 1 },
      next: { locator: 'Jn 1:1', weight: 0.9 },
    }, aliasSource);
    expect(parse(adjusted.after.text)).toMatchObject({ anchors: [{ ref: 'Jn 1:1', sources: ['editorial'], weight: 0.9 }] });
  });

  it('uses the production default weight for omitted editorial anchor weights', () => {
    const omittedWeightSource = `id: hope-in-god\nlabel: Hope\nlexicon: [hope]\nanchors:\n  - ref: John 1:1\n    sources: [editorial]\n`;
    const adjusted = preview({
      ...common, type: 'editorial-anchor-adjust', conceptId: 'hope-in-god',
      current: { locator: 'John 1:1', sources: ['editorial'], weight: 1 }, next: { locator: 'John 1:1', weight: 0.9 },
    }, omittedWeightSource);
    expect(parse(adjusted.after.text)).toMatchObject({ anchors: [{ ref: 'John 1:1', sources: ['editorial'], weight: 0.9 }] });
    const removed = preview({
      ...common, type: 'editorial-anchor-remove', conceptId: 'hope-in-god', locator: 'John 1:1', currentSources: ['editorial'],
    }, omittedWeightSource);
    expect(parse(removed.after.text)).toMatchObject({ anchors: [] });
    expect(() => preview({
      ...common, type: 'editorial-anchor-adjust', conceptId: 'hope-in-god',
      current: { locator: 'John 1:1', sources: ['editorial'], weight: 0.8 }, next: { locator: 'John 1:1', weight: 0.9 },
    }, omittedWeightSource)).toThrow(/weight changed/);
  });

  it('refuses to remove or adjust source-derived anchors based on actual YAML ownership', () => {
    expect(() => preview({ ...common, type: 'editorial-anchor-remove', conceptId: 'hope-in-god', locator: 'Romans 15:13', currentSources: ['editorial'] })).toThrow(/source-derived \(torrey\)/);
    expect(() => preview({ ...common, type: 'editorial-anchor-adjust', conceptId: 'hope-in-god', current: { locator: 'Romans 15:13', sources: ['editorial'], weight: 0.8 }, next: { locator: 'Romans 15:13', weight: 0.7 } })).toThrow(/source-derived \(torrey\)/);
  });

  it('edits related edges without disturbing comments or unrelated fields', () => {
    const result = preview({ ...common, type: 'related-concept-add', conceptId: 'hope-in-god', relatedConceptId: 'refuge-in-trouble' });
    expect(parse(result.after.text)).toMatchObject({ related: ['second-coming', 'refuge-in-trouble'], customField: { nested: 'untouched' } });
    expect(result.after.text).toContain('# file-level explanation');
  });

  it('renders a complete deterministic concept draft through the Document API', () => {
    const operation: StructuredConceptOperation = {
      ...common,
      type: 'concept-draft-create',
      draft: {
        id: 'patient-hope', label: 'Patient hope', lexicon: ['waiting with hope'],
        anchors: [{ locator: 'Romans 8:25', sources: ['editorial'], weight: 1 }], related: ['hope-in-god'],
      },
    };
    const first = previewStructuredYamlEdit('ontology/concepts/patient-hope.yaml', '', hash(''), operation);
    const second = previewStructuredYamlEdit('ontology/concepts/patient-hope.yaml', '', hash(''), operation);
    expect(second).toEqual(first);
    expect(parse(first.after.text)).toEqual({
      id: 'patient-hope', label: 'Patient hope', lexicon: ['waiting with hope'],
      anchors: [{ ref: 'Romans 8:25', sources: ['editorial'], weight: 1 }], related: ['hope-in-god'],
    });
  });

  it('fails closed on stale source hashes, wrong concept files, duplicate rows, and invalid YAML', () => {
    const add = { ...common, type: 'lexicon-phrase-add', conceptId: 'hope-in-god', phrase: 'steadfast hope' } as const;
    expect(() => previewStructuredYamlEdit('ontology/concepts/hope-in-god.yaml', SOURCE, '0'.repeat(64), add)).toThrow(/precondition failed/);
    expect(() => preview({ ...add, conceptId: 'refuge-in-trouble' })).toThrow(/this file contains/);
    expect(() => preview({ ...add, phrase: 'HOPE   IN GOD' })).toThrow(/already exists/);
    expect(() => previewStructuredYamlEdit('ontology/concepts/hope-in-god.yaml', 'id: [', hash('id: ['), add)).toThrow(StructuredYamlError);
    const tagged = SOURCE.replace('id: hope-in-god', 'id: !untrusted hope-in-god');
    expect(() => previewStructuredYamlEdit('ontology/concepts/hope-in-god.yaml', tagged, hash(tagged), add)).toThrow(StructuredYamlError);
    const aliased = `${SOURCE}\nshared: &shared [one]\naliasCopy: *shared\n`;
    expect(() => previewStructuredYamlEdit('ontology/concepts/hope-in-god.yaml', aliased, hash(aliased), add)).toThrow(/aliases are not accepted/);
  });
});
