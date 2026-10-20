/**
 * Corpus/concept repository behavior that does not need a database: the
 * capability probes' error discipline, the per-instance caches, and the
 * fragment search's statement budget. Each test drives a scripted
 * ContentQueryPort and asserts on the statements the repository issued.
 */

import { describe, expect, it } from 'vitest';

import type { ContentQueryPort, ContentQueryResult, ContentScalar } from '../src/types.js';
import {
  ConceptRepository,
  CorpusRepository,
  searchLongestFragment,
} from '../src/corpus/repository.js';

type Row = Record<string, ContentScalar>;
type Script = (sql: string, params: readonly ContentScalar[]) => Row[];

/** A port that answers from a script and remembers every statement it ran. */
function scriptedPort(script: Script): ContentQueryPort & { readonly statements: string[] } {
  const statements: string[] = [];
  return {
    statements,
    async execute(sql: string, params: readonly ContentScalar[] = []): Promise<ContentQueryResult> {
      statements.push(sql.replace(/\s+/g, ' ').trim());
      return { rows: script(sql, params) };
    },
    async close(): Promise<void> {},
  };
}

const probes = {
  corpus: {
    hasSpellingIndex: (port: ContentQueryPort) => new CorpusRepository(port).hasSpellingIndex(),
    hasPericopes: (port: ContentQueryPort) => new CorpusRepository(port).hasPericopes(),
    hasCrossReferencePhrases: (port: ContentQueryPort) =>
      new CorpusRepository(port).hasCrossReferencePhrases(),
  },
  concept: {
    hasConceptLayer: (port: ContentQueryPort) => new ConceptRepository(port).hasConceptLayer(),
    hasPassageTerms: (port: ContentQueryPort) => new ConceptRepository(port).hasPassageTerms(),
    hasTranslationTokens: (port: ContentQueryPort) =>
      new ConceptRepository(port).hasTranslationTokens(),
    hasCuratedAliases: (port: ContentQueryPort) => new ConceptRepository(port).hasCuratedAliases(),
  },
};
const allProbes = Object.entries({ ...probes.corpus, ...probes.concept });

describe('capability probes', () => {
  it.each(allProbes)('%s: table absent in sqlite_master → false (legitimate older artifact)', async (_name, probe) => {
    const port = scriptedPort(() => []);
    await expect(probe(port)).resolves.toBe(false);
    expect(port.statements).toHaveLength(1);
    expect(port.statements[0]).toContain('sqlite_master');
  });

  it.each(allProbes)('%s: table present (with rows when required) → true', async (_name, probe) => {
    const port = scriptedPort((sql) =>
      sql.includes('sqlite_master') ? [{ name: 'whatever' }] : [{ present: 1 }],
    );
    await expect(probe(port)).resolves.toBe(true);
  });

  it.each(Object.entries({
    hasPericopes: probes.corpus.hasPericopes,
    hasCrossReferencePhrases: probes.corpus.hasCrossReferencePhrases,
    hasCuratedAliases: probes.concept.hasCuratedAliases,
  }))('%s is presence-AND-rows: an emptied table → false (the rollback story)', async (_name, probe) => {
    const port = scriptedPort((sql) => (sql.includes('sqlite_master') ? [{ name: 'x' }] : []));
    await expect(probe(port)).resolves.toBe(false);
    expect(port.statements).toHaveLength(2);
    expect(port.statements[1]).toMatch(/^SELECT 1 AS present FROM \w+ LIMIT 1$/);
  });

  it.each(allProbes)('%s: a transport failure on the catalog read PROPAGATES — it is not "absent"', async (_name, probe) => {
    const port = scriptedPort(() => {
      throw new Error('D1_ERROR: network connection lost');
    });
    await expect(probe(port)).rejects.toThrow(/network connection lost/);
  });

  it('a transport failure on the rows read propagates too', async () => {
    const port = scriptedPort((sql) => {
      if (sql.includes('sqlite_master')) return [{ name: 'pericopes' }];
      throw new Error('SQLITE_BUSY: database is locked');
    });
    await expect(new CorpusRepository(port).hasPericopes()).rejects.toThrow(/SQLITE_BUSY/);
  });

  it('only "no such table" on the rows read is a legitimate false', async () => {
    const port = scriptedPort((sql) => {
      if (sql.includes('sqlite_master')) return [{ name: 'curated_aliases' }];
      throw new Error('SQLITE_ERROR: no such table: curated_aliases');
    });
    await expect(new ConceptRepository(port).hasCuratedAliases()).resolves.toBe(false);
  });

  it('every probe statement is parameterless and names its own constant table', async () => {
    // Parameterless so a per-request consumer can serve the probes from a
    // cache keyed by the artifact fingerprint; bound parameters defeat that.
    const expected: Record<string, string> = {
      hasSpellingIndex: 'spelling_terms',
      hasPericopes: 'pericopes',
      hasCrossReferencePhrases: 'cross_reference_phrases',
      hasConceptLayer: 'concepts',
      hasPassageTerms: 'verse_terms',
      hasTranslationTokens: 'verse_translation_tokens',
      hasCuratedAliases: 'curated_aliases',
    };
    for (const [name, probe] of allProbes) {
      const seen: { sql: string; params: ContentScalar[] }[] = [];
      const port = scriptedPort((sql, params) => {
        seen.push({ sql: sql.replace(/\s+/g, ' ').trim(), params: [...params] });
        return sql.includes('sqlite_master') ? [{ name: 'x' }] : [{ present: 1 }];
      });
      await expect(probe(port)).resolves.toBe(true);
      const table = expected[name]!;
      expect(seen[0]).toEqual({
        sql: `SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${table}'`,
        params: [],
      });
      for (const statement of seen.slice(1)) {
        expect(statement).toEqual({ sql: `SELECT 1 AS present FROM ${table} LIMIT 1`, params: [] });
      }
    }
  });
});

describe('ConceptRepository per-instance caches', () => {
  const lexiconRows: Row[] = [
    { conceptId: 'good-shepherd', label: 'Good Shepherd', phrase: 'good shepherd', normalized: 'good shepherd', tokenCount: 2 },
    { conceptId: 'good-shepherd', label: 'Good Shepherd', phrase: 'shepherd', normalized: 'shepherd', tokenCount: 1 },
    { conceptId: 'love', label: 'Love', phrase: 'love', normalized: 'love', tokenCount: 1 },
  ];

  it('matchConcepts reads concept_lexicon ONCE per instance and matches identically afterwards', async () => {
    const port = scriptedPort((sql) => (sql.includes('concept_lexicon') ? lexiconRows : []));
    const repository = new ConceptRepository(port);
    const first = await repository.matchConcepts(['good', 'shepherd']);
    const second = await repository.matchConcepts(['good', 'shepherd']);
    const third = await repository.matchConcepts(['shepherd', 'love']);
    expect(first).toEqual([
      { conceptId: 'good-shepherd', label: 'Good Shepherd', matchedPhrase: 'good shepherd', matchedTokenCount: 2 },
    ]);
    expect(second).toEqual(first);
    expect(third).toEqual([
      { conceptId: 'good-shepherd', label: 'Good Shepherd', matchedPhrase: 'shepherd', matchedTokenCount: 1 },
      { conceptId: 'love', label: 'Love', matchedPhrase: 'love', matchedTokenCount: 1 },
    ]);
    expect(port.statements.filter((sql) => sql.includes('concept_lexicon'))).toHaveLength(1);
  });

  it('a second instance reads again — the cache is per engine, never per process', async () => {
    const port = scriptedPort((sql) => (sql.includes('concept_lexicon') ? lexiconRows : []));
    await new ConceptRepository(port).matchConcepts(['love']);
    await new ConceptRepository(port).matchConcepts(['love']);
    expect(port.statements.filter((sql) => sql.includes('concept_lexicon'))).toHaveLength(2);
  });

  it('maxCrossReferenceVotes is read once per instance; concurrent first calls share one statement', async () => {
    const port = scriptedPort(() => [{ maxVotes: 713 }]);
    const repository = new ConceptRepository(port);
    const [a, b] = await Promise.all([
      repository.maxCrossReferenceVotes(),
      repository.maxCrossReferenceVotes(),
    ]);
    const c = await repository.maxCrossReferenceVotes();
    expect([a, b, c]).toEqual([713, 713, 713]);
    expect(port.statements).toHaveLength(1);
  });

  it('a failed cached read is not remembered: the next call retries', async () => {
    let calls = 0;
    const port = scriptedPort(() => {
      calls += 1;
      if (calls === 1) throw new Error('transient');
      return [{ maxVotes: 5 }];
    });
    const repository = new ConceptRepository(port);
    await expect(repository.maxCrossReferenceVotes()).rejects.toThrow('transient');
    await expect(repository.maxCrossReferenceVotes()).resolves.toBe(5);
    expect(calls).toBe(2);
  });
});

describe('searchLongestFragment statement budget', () => {
  const fourteen = 'alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima mike november';

  it('an unmatched 14-word query costs one existence probe per fragment LENGTH (11), not per fragment (77)', async () => {
    const port = scriptedPort(() => []);
    const repository = new CorpusRepository(port);
    await expect(searchLongestFragment(repository, fourteen, 200, false)).resolves.toBeNull();
    expect(port.statements).toHaveLength(11);
    for (const sql of port.statements) expect(sql).toContain('EXISTS (SELECT 1 FROM verses_fts WHERE verses_fts MATCH ?)');
  });

  it('with includeWholeQuery=false the whole query is never re-tried (the caller already did)', async () => {
    const probed: ContentScalar[][] = [];
    const port = scriptedPort((_sql, params) => {
      probed.push([...params]);
      return [];
    });
    await searchLongestFragment(new CorpusRepository(port), 'be doers of the word', 200, false);
    const literals = probed.flat().filter((value): value is string => typeof value === 'string');
    expect(literals).not.toContain('"be doers of the word"');
    expect(literals[0]).toBe('"be doers of the"'); // longest first ...
    expect(literals[1]).toBe('"doers of the word"'); // ... leftmost first within a length
  });

  it('picks the longest, then leftmost, matching fragment and fetches only that one', async () => {
    const present = new Set(['"of the word"', '"doers of the"', '"the word not"']);
    const port = scriptedPort((sql, params) => {
      if (sql.includes('EXISTS')) {
        const rows: Row[] = [];
        for (let i = 0; i + 1 < params.length; i += 2) {
          rows.push({ idx: params[i]!, hit: present.has(params[i + 1] as string) ? 1 : 0 });
        }
        return rows;
      }
      // The full fetch for the chosen fragment.
      return [{
        id: 1, verseId: 59001022, translationId: 1, translationCode: 'WEB', bookId: 59,
        bookName: 'James', chapter: 1, verse: 22, text: 'But be doers of the word...', bm25: -4.2,
      }];
    });
    const result = await searchLongestFragment(new CorpusRepository(port), 'be doers of the word not hearers', 200, false);
    // No 4+-word fragment is present, so length 3 decides; its leftmost hit wins.
    expect(result?.fragment).toBe('doers of the');
    expect(result?.fragmentWords).toBe(3);
    expect(result?.queryWords).toBe(7);
    expect(result?.matches).toHaveLength(1);
    // Lengths 6, 5, 4 probed and missed; length 3 probed, leftmost hit ("doers of the") fetched: 4 probes + 1 fetch.
    expect(port.statements.filter((sql) => sql.includes('EXISTS'))).toHaveLength(4);
    expect(port.statements.filter((sql) => sql.includes('bm25'))).toHaveLength(1);
  });

  it('an existence hit whose fetch returns nothing falls through to the next-leftmost fragment, as the old loop did', async () => {
    const present = new Set(['"doers of the"', '"of the word"']);
    const port = scriptedPort((sql, params) => {
      if (sql.includes('EXISTS')) {
        const rows: Row[] = [];
        for (let i = 0; i + 1 < params.length; i += 2) {
          rows.push({ idx: params[i]!, hit: present.has(params[i + 1] as string) ? 1 : 0 });
        }
        return rows;
      }
      // The leftmost hit has no joinable row; the next one does.
      if (params[0] === '"doers of the"') return [];
      return [{
        id: 1, verseId: 59001022, translationId: 1, translationCode: 'WEB', bookId: 59,
        bookName: 'James', chapter: 1, verse: 22, text: 'But be doers of the word...', bm25: -4.2,
      }];
    });
    const result = await searchLongestFragment(new CorpusRepository(port), 'be doers of the word not hearers', 200, false);
    expect(result?.fragment).toBe('of the word');
    expect(result?.fragmentWords).toBe(3);
    expect(port.statements.filter((sql) => sql.includes('bm25'))).toHaveLength(2);
  });
});
