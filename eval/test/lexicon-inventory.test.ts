/**
 * The single-token-collapse acknowledgment mechanism (plan P3.2 gate half).
 *
 * Three behaviours matter: the deny-list FIRES on an unacknowledged or stale
 * collapse (synthetic data), the committed repository state passes it (every
 * live collapse carries a current acknowledgment in
 * ontology/lexicon-inventory.yaml — this is the test that rings when someone
 * adds a collapsing phrase without a decision, or deletes the inventory),
 * and the parser never guesses: malformed rows surface as errors, because an
 * acknowledgment record that silently skips rows is decoration.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { compileOntology } from '../../pipeline/src/importers/ontologyImporter.js';
import { parseLexiconInventory } from '../../pipeline/src/importers/lexiconInventory.js';
import {
  lexiconInventoryCheck,
  LEXICON_INVENTORY_PATH,
  singleTokenCollapses,
  type ConceptRecord,
} from '../src/gates/collision.js';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function inventoryYaml(
  entries: readonly Record<string, unknown>[],
  { raw }: { raw?: string } = {},
): string {
  if (raw !== undefined) return raw;
  const lines = ['collapses:'];
  for (const entry of entries) {
    lines.push(`  - conceptId: ${JSON.stringify(entry['conceptId'])}`);
    for (const key of ['phrase', 'token', 'intended', 'reviewedBy', 'date', 'note']) {
      if (entry[key] !== undefined) lines.push(`    ${key}: ${JSON.stringify(entry[key])}`);
    }
  }
  return `${lines.join('\n')}\n`;
}

const forgiving: ConceptRecord = {
  id: 'forgiving-others',
  label: 'Forgiving others',
  lexicon: ['forgive others', 'forgive one another'],
};

const ack = {
  conceptId: 'forgiving-others',
  phrase: 'forgive others',
  token: 'forgiv',
  intended: true,
  reviewedBy: 'jesse',
  date: '2026-08-21',
  note: 'bare forgive reaching this concept is a deliberate trigger',
};

// The real collapsed token for "forgive others" per the shared tokenizer.
const realToken = singleTokenCollapses([forgiving])[0]!.token;
const validAck = { ...ack, token: realToken };

describe('parseLexiconInventory', () => {
  it('parses a valid acknowledgment', () => {
    const { collapses, errors } = parseLexiconInventory(inventoryYaml([validAck]));
    expect(errors).toEqual([]);
    expect(collapses).toHaveLength(1);
    expect(collapses[0]).toMatchObject({
      conceptId: 'forgiving-others',
      phrase: 'forgive others',
      token: realToken,
      intended: true,
      reviewedBy: 'jesse',
    });
  });

  it('rejects a file without a top-level collapses list', () => {
    const { collapses, errors } = parseLexiconInventory('reviews: []\n');
    expect(collapses).toEqual([]);
    expect(errors.join(' ')).toContain('top-level `collapses` list');
  });

  it('rejects invalid YAML with a parse error, never a throw', () => {
    const { errors } = parseLexiconInventory('collapses: [unclosed');
    expect(errors.join(' ')).toContain('not valid YAML');
  });

  it('rejects rows whose intended is not literally true', () => {
    const { collapses, errors } = parseLexiconInventory(
      inventoryYaml([{ ...validAck, intended: false }]),
    );
    expect(collapses).toEqual([]);
    expect(errors.join(' ')).toContain('intended must be literally true');
  });

  it('rejects empty reviewer, malformed date, and empty note', () => {
    const { errors } = parseLexiconInventory(
      inventoryYaml([
        { ...validAck, reviewedBy: ' ' },
        { ...validAck, phrase: 'p2', date: 'yesterday' },
        { ...validAck, phrase: 'p3', note: '' },
      ]),
    );
    expect(errors).toHaveLength(3);
    expect(errors.join(' ')).toContain('reviewedBy');
    expect(errors.join(' ')).toContain('YYYY-MM-DD');
    expect(errors.join(' ')).toContain('note');
  });

  it('rejects duplicate acknowledgments for one (conceptId, phrase)', () => {
    const { collapses, errors } = parseLexiconInventory(inventoryYaml([validAck, validAck]));
    expect(collapses).toHaveLength(1);
    expect(errors.join(' ')).toContain('duplicate acknowledgment');
  });

  it('tolerates unknown top-level keys (room for future bare-word inventory sections)', () => {
    const { collapses, errors } = parseLexiconInventory(
      `concepts: []\n${inventoryYaml([validAck])}`,
    );
    expect(errors).toEqual([]);
    expect(collapses).toHaveLength(1);
  });
});

describe('lexiconInventoryCheck', () => {
  it('passes when every collapse is acknowledged, keeping the listing visible', () => {
    const result = lexiconInventoryCheck([forgiving], inventoryYaml([validAck]));
    expect(result.status).toBe('pass');
    expect(result.summary).toContain('all acknowledged');
    // The diagnostic never disappears — it stops being undecided.
    expect(result.findings).toHaveLength(1);
    expect(result.findings?.[0]?.message).toContain('"forgive others"');
    expect(result.findings?.[0]?.message).toContain('acknowledged by jesse');
    expect(result.metrics).toMatchObject({ singleTokenCollapses: 1, acknowledgedCollapses: 1 });
  });

  it('fails on an unacknowledged collapse, naming concept, phrase, and token with the remedy', () => {
    const result = lexiconInventoryCheck([forgiving], inventoryYaml([]));
    expect(result.status).toBe('fail');
    const message = result.findings?.map((finding) => finding.message).join(' ') ?? '';
    expect(message).toContain('forgiving-others');
    expect(message).toContain('"forgive others"');
    expect(message).toContain(`"${realToken}"`);
    expect(message).toContain('rephrase/remove');
  });

  it('fails on a stale acknowledgment for a collapse that no longer exists', () => {
    const result = lexiconInventoryCheck(
      [forgiving],
      inventoryYaml([validAck, { ...validAck, phrase: 'formerly collapsing phrase' }]),
    );
    expect(result.status).toBe('fail');
    expect(result.findings?.map((finding) => finding.message).join(' ')).toContain(
      'stale acknowledgment',
    );
  });

  it('fails when the acknowledged token no longer matches the tokenizer output', () => {
    const result = lexiconInventoryCheck(
      [forgiving],
      inventoryYaml([{ ...validAck, token: 'pardon' }]),
    );
    expect(result.status).toBe('fail');
    const message = result.findings?.map((finding) => finding.message).join(' ') ?? '';
    expect(message).toContain('now collapses to');
    // The mismatched entry does not count as acknowledging the live collapse.
    expect(message).toContain('rephrase/remove');
  });

  it('fails on a malformed inventory instead of skipping rows', () => {
    const result = lexiconInventoryCheck([forgiving], 'collapses: [unclosed');
    expect(result.status).toBe('fail');
    expect(result.findings?.map((finding) => finding.message).join(' ')).toContain(
      'not valid YAML',
    );
  });

  it('fails when collapses exist but the inventory file is missing', () => {
    const result = lexiconInventoryCheck([forgiving], null);
    expect(result.status).toBe('fail');
    expect(result.findings?.map((finding) => finding.message).join(' ')).toContain('is missing');
  });

  it('passes with no collapses and no inventory file', () => {
    const wide: ConceptRecord = {
      id: 'still-waters',
      label: 'Still waters',
      lexicon: ['still waters'],
    };
    const result = lexiconInventoryCheck([wide], null);
    expect(result.status).toBe('pass');
    expect(result.metrics).toMatchObject({ singleTokenCollapses: 0 });
  });
});

describe('committed repository state', () => {
  const directory = join(REPO_ROOT, 'ontology', 'concepts');
  const files = readdirSync(directory)
    .filter((name) => name.endsWith('.yaml'))
    .sort()
    .map((name) => ({ name, contents: readFileSync(join(directory, name), 'utf8') }));
  const { ontology, errors } = compileOntology(files);
  const lexiconByConcept = new Map<string, string[]>();
  for (const entry of ontology.lexicon) {
    const bucket = lexiconByConcept.get(entry.conceptId);
    if (bucket) bucket.push(entry.phrase);
    else lexiconByConcept.set(entry.conceptId, [entry.phrase]);
  }
  const concepts: ConceptRecord[] = ontology.concepts.map((concept) => ({
    id: concept.id,
    label: concept.label,
    lexicon: lexiconByConcept.get(concept.id) ?? [],
  }));
  const inventoryPath = join(REPO_ROOT, ...LEXICON_INVENTORY_PATH.split('/'));

  it('every live collapse carries a current acknowledgment in the committed inventory', () => {
    expect(errors).toEqual([]);
    expect(existsSync(inventoryPath)).toBe(true);
    const result = lexiconInventoryCheck(concepts, readFileSync(inventoryPath, 'utf8'));
    expect(result.status).toBe('pass');
    const collapseCount = singleTokenCollapses(concepts).length;
    expect(result.metrics).toMatchObject({
      singleTokenCollapses: collapseCount,
      acknowledgedCollapses: collapseCount,
    });
    expect(collapseCount).toBeGreaterThan(0);
  });

  it('deleting the committed inventory would ring, not silently pass', () => {
    const result = lexiconInventoryCheck(concepts, null);
    expect(result.status).toBe('fail');
  });
});
