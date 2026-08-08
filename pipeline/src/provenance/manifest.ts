/**
 * Source manifests — the foundation of guardrail G1.
 *
 * Generalized from Maskil's `content-pipeline/manifests/*.json`, with two
 * additions this engine needs: `derivedFrom`, which makes correlated sources
 * declarable (G7), and `rightsClass`, which makes the "posted publicly is not
 * a license" rule enforceable rather than remembered.
 *
 * Rule: every row in the shipped artifact traces to a manifest entry. A row
 * that cannot is a BUILD ERROR, not a warning — the build fails closed, so no
 * one has to notice a missing attribution to prevent shipping one.
 */

import { createHash } from 'node:crypto';

export type RightsClass =
  /** Public domain by age or dedication; free to ship, attribution courteous. */
  | 'public_domain'
  /** Creative Commons Attribution; attribution REQUIRED in shipped output. */
  | 'cc_by'
  /** CC BY-SA; attribution + share-alike obligations on derived distribution. */
  | 'cc_by_sa'
  /** Owned by LH outright (own sermon manuscripts). */
  | 'owned'
  /** Authored by us for this dataset (editorial ontology entries). */
  | 'editorial'
  /**
   * Text is public domain but this specific digitization carries a claim
   * (CCEL's non-commercial terms, some transcription projects). Admissible
   * only for tiers that honor the claim, and never silently.
   */
  | 'pd_text_claimed_transcription';

export type DistributionTier =
  /** Shippable in a public app build. The default; anything else is opt-in. */
  | 'public_distribution'
  /** Usable locally for evaluation only; can never enter a release artifact. */
  | 'private_local'
  /** Synthetic fixtures for tests. */
  | 'dev_fixture';

export interface SourceManifest {
  /** Stable id used by every Provenance object that cites this source. */
  readonly id: string;
  /** Human-facing attribution string, rendered in result reasons and credits. */
  readonly label: string;
  readonly rightsClass: RightsClass;
  /** Exact license/permission text or URL captured at acquisition time. */
  readonly licenseRecord: string;
  /** Authoritative retrieval location. */
  readonly sourceUrl: string;
  /**
   * True when sourceUrl is a rolling "latest" path that upstream overwrites,
   * so the pinned checksum identifies a snapshot the URL will eventually stop
   * serving. Declaring it is what lets G1 demand an archiveUrl: a rolling
   * source without an archive is a corpus that silently becomes
   * unreproducible the week upstream republishes.
   */
  readonly rollingSourceUrl?: boolean;
  /**
   * Durable fallback for the exact pinned bytes, tried when sourceUrl fails
   * or serves different content. For rolling sources this is REQUIRED (G1):
   * our checksummed copy is the only one that can rebuild the artifact, and
   * it must live somewhere that does not roll.
   */
  readonly archiveUrl?: string;
  /** SHA-256 of the exact acquired artifact. */
  readonly sha256: string;
  /**
   * SHA-256 of what the archive CONTAINS, independent of packaging.
   *
   * Present only for archive sources. Where it is present it is the identity
   * admission checks, because some publishers regenerate their archives —
   * CrossWire's module zips change checksum on a repack while every file
   * inside stays byte-identical. Gating on the archive would report an
   * unchanged source as altered, and a gate that fires on nothing teaches
   * people to update checksums without reading them.
   */
  readonly contentSha256?: string;
  /** Byte length of the acquired artifact, checked alongside the hash. */
  readonly bytes: number;
  /** Tier ceiling: a source may not be used above this. */
  readonly maxTier: DistributionTier;
  /**
   * Ids of sources this one substantially derives from. OpenBible's
   * cross-references draw heavily on TSK; Torrey overlaps Nave. Declaring it
   * lets G7 place them in one correlation budget instead of counting the same
   * scholarship twice as independent evidence.
   */
  readonly derivedFrom?: readonly string[];
  /**
   * True for a source that exists ONLY so others can declare lineage from it
   * (G7 correlation). No artifact row may cite it directly — it has no
   * imported artifact, so it has no checksum to verify, and citing it would
   * be claiming provenance we never checked.
   */
  readonly lineageOnly?: boolean;
  /** Free-text note carried into credits (trademark notices, caveats). */
  readonly attributionNote?: string;
}

export interface ManifestSet {
  readonly sources: readonly SourceManifest[];
}

export class ProvenanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProvenanceError';
  }
}

const TIER_RANK: Readonly<Record<DistributionTier, number>> = {
  dev_fixture: 0,
  private_local: 1,
  public_distribution: 2,
};

/** True when `source` may be used in a build targeting `tier`. */
/**
 * Identifies the SET of sources admitted to a build.
 *
 * The third of the three supply-chain identities Maskil established, and the
 * one the other two cannot express: databaseSha256 says which file you have,
 * corpusFingerprint says which scripture text is in it, and this says which
 * sources were allowed to contribute. Admitting a new commentator changes this
 * and nothing else, so a consumer can tell "same text, different evidence"
 * from "same everything" without diffing the artifact.
 *
 * Built from each source's id and its content identity, sorted and
 * length-delimited so it cannot collide on reordering.
 */
export function manifestFingerprint(manifests: ManifestSet): string {
  const hash = createHash('sha256');
  const entries = manifests.sources
    .map((source) => `${source.id} ${source.contentSha256 ?? source.sha256 ?? ''}`)
    .sort();
  for (const entry of entries) {
    hash.update(String(entry.length));
    hash.update(' ');
    hash.update(entry);
  }
  return hash.digest('hex');
}

export function permitsTier(source: SourceManifest, tier: DistributionTier): boolean {
  return TIER_RANK[tier] <= TIER_RANK[source.maxTier];
}

/**
 * G1: every cited source id must exist, be admissible at the build tier, and
 * carry a complete rights record. Returns the offending ids rather than
 * throwing on the first one, so a build failure names everything wrong at once.
 */
export function checkProvenance(options: {
  readonly manifests: ManifestSet;
  readonly citedSourceIds: readonly string[];
  readonly tier: DistributionTier;
}): readonly string[] {
  const bySourceId = new Map(options.manifests.sources.map((source) => [source.id, source]));
  const failures: string[] = [];

  for (const id of [...new Set(options.citedSourceIds)].sort()) {
    const source = bySourceId.get(id);
    if (!source) {
      failures.push(`${id}: cited by artifact rows but has no manifest entry`);
      continue;
    }
    if (!source.licenseRecord.trim()) {
      failures.push(`${id}: manifest has an empty licenseRecord`);
    }
    if (source.lineageOnly) {
      failures.push(
        `${id}: is a lineage-only manifest (declared for correlation budgeting) and ` +
          'must never be cited by an artifact row — it has no imported artifact to verify',
      );
      continue;
    }
    if (source.rightsClass !== 'editorial' && !source.sha256.trim()) {
      failures.push(`${id}: manifest has no source checksum`);
    }
    if (!permitsTier(source, options.tier)) {
      failures.push(
        `${id}: rights class '${source.rightsClass}' caps this source at ` +
          `'${source.maxTier}', but the build targets '${options.tier}'`,
      );
    }
  }
  return failures;
}

/**
 * G1: rolling sources must carry an archive of the pinned bytes.
 *
 * Returns the ids of manifests that declare a rolling sourceUrl but no
 * archiveUrl. For those sources the checksum names bytes that only exist in
 * our own copies — if the copy is lost before an archive exists, the build
 * can never again be reproduced from scratch.
 */
export function rollingSourcesWithoutArchive(manifests: ManifestSet): readonly string[] {
  return manifests.sources
    .filter((source) => source.rollingSourceUrl && !source.archiveUrl?.trim())
    .map((source) => source.id)
    .sort();
}

/**
 * Retrieval candidates in the order fetchers should try them: the
 * authoritative URL first, then the archive. One list so the fetch script and
 * any future mirror logic cannot disagree about precedence.
 */
export function retrievalUrls(source: SourceManifest): readonly string[] {
  const urls = [source.sourceUrl];
  if (source.archiveUrl?.trim()) urls.push(source.archiveUrl);
  return urls;
}

/**
 * Correlation groups derived from declared lineage (G7 input). Sources are
 * grouped transitively: if co-citations derive from TSK and OpenBible derives
 * from TSK, all three share one budget.
 */
export function correlationGroups(manifests: ManifestSet): readonly (readonly string[])[] {
  const parent = new Map<string, string>();
  const find = (id: string): string => {
    let current = id;
    while (parent.get(current) !== undefined && parent.get(current) !== current) {
      current = parent.get(current)!;
    }
    return current;
  };
  const union = (a: string, b: string): void => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent.set(rootA, rootB);
  };

  for (const source of manifests.sources) {
    if (parent.get(source.id) === undefined) parent.set(source.id, source.id);
    for (const ancestor of source.derivedFrom ?? []) {
      if (parent.get(ancestor) === undefined) parent.set(ancestor, ancestor);
      union(source.id, ancestor);
    }
  }

  const groups = new Map<string, string[]>();
  for (const source of manifests.sources) {
    const root = find(source.id);
    const group = groups.get(root);
    if (group) group.push(source.id);
    else groups.set(root, [source.id]);
  }

  // Sorted output keeps the derived config deterministic across runs.
  return [...groups.values()]
    .map((group) => [...group].sort())
    .filter((group) => group.length > 1)
    .sort((a, b) => (a[0]! < b[0]! ? -1 : 1));
}
