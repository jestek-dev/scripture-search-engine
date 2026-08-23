// Builds RegisterDefinitions from the committed tree (P4.16 / B4).
//
// A register is everything the ontology says about a concept — label,
// lexicon phrases, and the WEB text of its anchor passages resolved from
// the committed fixture corpus. Read-only; anchors whose passages are not
// in the corpus subset simply contribute no floor text.
import type { CompiledOntology } from '../../pipeline/src/importers/ontologyImporter.js';

import type { RegisterDefinition } from './inversions.js';
import type { CorpusVerse } from './repo.js';

export function buildRegister(
  ontology: CompiledOntology,
  corpus: readonly CorpusVerse[],
  conceptId: string,
): RegisterDefinition {
  const concept = ontology.concepts.find((entry) => entry.id === conceptId);
  if (!concept) throw new Error(`unknown concept id "${conceptId}"`);
  const byVerseId = new Map(corpus.map((verse) => [verse.verseId, verse]));
  const floorTexts = ontology.anchors
    .filter((anchor) => anchor.conceptId === conceptId)
    .map((anchor) => {
      const parts: string[] = [];
      for (let verseId = anchor.startVerseId; verseId <= anchor.endVerseId; verseId += 1) {
        const verse = byVerseId.get(verseId);
        if (verse) parts.push(verse.text);
      }
      return parts.join(' ');
    })
    .filter((text) => text.length > 0);
  const phrases = ontology.lexicon
    .filter((entry) => entry.conceptId === conceptId)
    .map((entry) => entry.phrase);
  return {
    id: conceptId,
    texts: [concept.label, ...phrases, ...floorTexts],
    floorTexts,
  };
}

export function buildAllRegisters(
  ontology: CompiledOntology,
  corpus: readonly CorpusVerse[],
): RegisterDefinition[] {
  return ontology.concepts.map((concept) => buildRegister(ontology, corpus, concept.id));
}
