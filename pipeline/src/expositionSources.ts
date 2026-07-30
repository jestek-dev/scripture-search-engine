/**
 * Declarative registry of exposition sources.
 *
 * Adding a commentator is meant to be a data change, not a code change: the
 * only thing that varies between passage-keyed volumes is how they print
 * their citation marker. Keeping that in a table means the curation skill can
 * add a source without touching the distiller.
 */

export interface ExpositionSourceSpec {
  /** Must match a manifest id in pipeline/manifests/. */
  readonly id: string;
  /**
   * Who wrote it. Volumes of one work, and editions of one work, share an
   * authorId — corroboration counts THESE, so that a six-volume commentary
   * cannot corroborate itself and a reprint cannot corroborate its original.
   */
  readonly authorId: string;
  /** Filename under pipeline/sources/ (gitignored download). */
  readonly file: string;
  /**
   * Canonical book id this volume expounds. Omitted for whole-Bible sources,
   * which carry their own book keys.
   */
  readonly bookId?: number;
  /**
   * Which parser to use. `citation-suffix` handles works that END a quoted
   * passage with a citation ("...for ever.'--PSALM xxiii. 1-6."), which is
   * Maclaren's convention. Others get their own strategy as they are added,
   * rather than one regex growing warts.
   */
  readonly strategy: 'citation-suffix' | 'psalm-verse-headings' | 'sword-zcom';
  /** For citation-suffix: the book word as printed, e.g. "PSALM". */
  readonly citationWord?: string;
  /** Human note explaining why this source is here. */
  readonly note: string;
}

export const EXPOSITION_SOURCES: readonly ExpositionSourceSpec[] = [
  {
    id: 'clarke',
    authorId: 'clarke',
    // Directory of extracted SWORD module files, not a single text.
    file: 'clarke',
    strategy: 'sword-zcom',
    note:
      'First whole-Bible expositor. Verse-keyed by construction, so there is no ' +
      'heading parser and no alignment inference — the failure mode that made ' +
      'Treasury of David expensive does not exist here.',
  },
  {
    id: 'mhc',
    authorId: 'henry',
    file: 'mhc',
    strategy: 'sword-zcom',
    note:
      'Second whole-Bible expositor — the one that makes corroboration possible ' +
      'outside Psalms. Writes by section, so the loader collapses repeated bodies ' +
      'back into the spans he actually wrote.',
  },
  {
    id: 'maclaren-psalms',
    authorId: 'maclaren',
    file: 'maclaren-psalms.txt',
    bookId: 19,
    strategy: 'citation-suffix',
    citationWord: 'PSALM',
    note:
      'Alignment tier 1. Every exposition ends its quoted text with a printed ' +
      'citation, so passage attribution is parsing rather than inference.',
  },
  {
    id: 'treasury-of-david-01',
    authorId: 'spurgeon',
    file: 'thetreasuryofdav01spuruoft.txt',
    bookId: 19,
    strategy: 'psalm-verse-headings',
    note: 'Treasury of David vol. 1 (Psalms 1-26). OCR source; second voice on the same psalms as Maclaren, which is the point.',
  },
  {
    id: 'treasury-of-david-02',
    authorId: 'spurgeon',
    file: 'thetreasuryofdav02spuruoft.txt',
    bookId: 19,
    strategy: 'psalm-verse-headings',
    note: 'Treasury of David vol. 2 (Psalms 27-57). OCR source; second voice on the same psalms as Maclaren, which is the point.',
  },
  {
    id: 'treasury-of-david-03',
    authorId: 'spurgeon',
    file: 'thetreasuryofdav03spuruoft.txt',
    bookId: 19,
    strategy: 'psalm-verse-headings',
    note: 'Treasury of David vol. 3 (Psalms 55-87). Closes the single-author hole Maclaren alone could not corroborate.',
  },
  {
    id: 'treasury-of-david-04',
    authorId: 'spurgeon',
    file: 'treasuryofdavid04spuruoft.txt',
    bookId: 19,
    strategy: 'psalm-verse-headings',
    note: 'Treasury of David vol. 4 (Psalms 88-110). OCR source; second voice on the same psalms as Maclaren, which is the point.',
  },
  {
    id: 'treasury-of-david-06',
    authorId: 'spurgeon',
    file: 'treasuryofdavid06spuruoft.txt',
    bookId: 19,
    strategy: 'psalm-verse-headings',
    note: 'Treasury of David vol. 6 (Psalms 120-150). OCR source; second voice on the same psalms as Maclaren, which is the point.',
  },
];
