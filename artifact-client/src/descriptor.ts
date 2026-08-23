/**
 * Artifact-descriptor verification — the pure half of the client (plan
 * P7.3 / CO-6), extracted verbatim from the workbench's reference
 * implementation so every consumer runs the SAME validation and the same
 * release-tag resolution instead of re-implementing them.
 *
 * This module is portable on purpose: zero Node imports, so it runs
 * unchanged under Hermes/JSC in the consumer apps. The Node-flavored
 * download/verify half lives in `download.ts`.
 *
 * The committed descriptor a consumer pins (`content-artifact.json`) is the
 * single source of truth for what the app may open: it names the release tag
 * to download from, the sha256 the database must hash to, and the identities
 * the running engine must report. Everything here is a lookup against that
 * reviewed file — nothing is inferred from the database itself.
 */

/**
 * What a release tag may look like — mirrors the pipeline's build-time rule.
 * The tag lands in the download URL, so a malformed one is refused here
 * rather than becoming a request path.
 */
const RELEASE_TAG_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;

/** The descriptor fields consumers read. The file carries more; these are the load-bearing ones. */
export interface ArtifactDescriptor {
  readonly schemaVersion: string;
  readonly engineVersion: string;
  readonly corpusFingerprint: string;
  readonly layerFingerprint: string;
  readonly databaseSha256: string;
  readonly databaseBytes: number;
  /**
   * The GitHub Release tag the artifact's bytes are published at. Optional:
   * descriptors minted before the field existed live at `v{engineVersion}` —
   * `releaseTagFor` owns that fallback.
   */
  readonly release?: {
    readonly tag: string;
  };
  readonly translations: readonly {
    readonly code: string;
    readonly name: string;
    readonly verseCount: number;
  }[];
  readonly stale?: {
    readonly since: string;
    readonly reason: string;
    readonly blocksRelease?: boolean;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isSha256(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
}

/**
 * Reject malformed release metadata before it can authorize a local artifact.
 * The descriptor has additional release fields, so validation is intentionally
 * strict for every field consumers read while remaining forward-compatible.
 */
export function validateArtifactDescriptor(value: unknown): ArtifactDescriptor {
  if (!isRecord(value)) {
    throw new Error('Artifact descriptor must be a JSON object.');
  }

  const errors: string[] = [];
  const requireString = (field: string): string | null => {
    const candidate = value[field];
    if (!isNonEmptyString(candidate)) {
      errors.push(`${field} must be a non-empty string`);
      return null;
    }
    return candidate;
  };

  const schemaVersion = requireString('schemaVersion');
  const engineVersion = requireString('engineVersion');
  const corpusFingerprint = value['corpusFingerprint'];
  if (!isSha256(corpusFingerprint)) errors.push('corpusFingerprint must be a lowercase SHA-256 digest');
  const layerFingerprint = value['layerFingerprint'];
  if (!isSha256(layerFingerprint)) errors.push('layerFingerprint must be a lowercase SHA-256 digest');
  const databaseSha256 = value['databaseSha256'];
  if (!isSha256(databaseSha256)) errors.push('databaseSha256 must be a lowercase SHA-256 digest');
  const databaseBytes = value['databaseBytes'];
  if (typeof databaseBytes !== 'number' || !Number.isSafeInteger(databaseBytes) || databaseBytes <= 0) {
    errors.push('databaseBytes must be a positive safe integer');
  }

  const translations = value['translations'];
  if (!Array.isArray(translations)) {
    errors.push('translations must be an array');
  } else {
    for (const [index, translation] of translations.entries()) {
      if (!isRecord(translation)) {
        errors.push(`translations[${index}] must be an object`);
        continue;
      }
      if (!isNonEmptyString(translation['code'])) errors.push(`translations[${index}].code must be a non-empty string`);
      if (!isNonEmptyString(translation['name'])) errors.push(`translations[${index}].name must be a non-empty string`);
      const verseCount = translation['verseCount'];
      if (typeof verseCount !== 'number' || !Number.isSafeInteger(verseCount) || verseCount < 0) {
        errors.push(`translations[${index}].verseCount must be a non-negative safe integer`);
      }
    }
  }

  const release = value['release'];
  if (release !== undefined) {
    if (!isRecord(release)) {
      errors.push('release must be an object when present');
    } else {
      const tag = release['tag'];
      if (!isNonEmptyString(tag) || !RELEASE_TAG_PATTERN.test(tag)) {
        errors.push(
          'release.tag must start with a letter or digit and contain only letters, digits, ".", "_", "/" and "-"',
        );
      }
    }
  }

  const stale = value['stale'];
  if (stale !== undefined) {
    if (!isRecord(stale)) {
      errors.push('stale must be an object when present');
    } else {
      if (!isNonEmptyString(stale['since'])) errors.push('stale.since must be a non-empty string');
      if (!isNonEmptyString(stale['reason'])) errors.push('stale.reason must be a non-empty string');
      if (stale['blocksRelease'] !== undefined && typeof stale['blocksRelease'] !== 'boolean') {
        errors.push('stale.blocksRelease must be a boolean when present');
      }
    }
  }

  if (errors.length > 0 || schemaVersion === null || engineVersion === null || !Array.isArray(translations)) {
    throw new Error(`Invalid artifact descriptor: ${errors.join('; ')}.`);
  }

  return {
    schemaVersion,
    engineVersion,
    corpusFingerprint: corpusFingerprint as string,
    layerFingerprint: layerFingerprint as string,
    databaseSha256: databaseSha256 as string,
    databaseBytes: databaseBytes as number,
    translations: translations as ArtifactDescriptor['translations'],
    ...(release === undefined
      ? {}
      : { release: { tag: (release as { tag: string }).tag } }),
    ...(stale === undefined ? {} : { stale: stale as NonNullable<ArtifactDescriptor['stale']> }),
  };
}

/**
 * The GitHub Release tag the artifact downloads from — the reference
 * implementation the §5 contract names.
 *
 * `release.tag` decouples artifact identity from engineVersion — an
 * artifact-only refresh ships at its own tag with no engine bump. Descriptors
 * minted before the field existed were always published at the engine's own
 * version tag, so the fallback keeps every old descriptor downloadable.
 */
export function releaseTagFor(descriptor: ArtifactDescriptor): string {
  return descriptor.release?.tag ?? `v${descriptor.engineVersion}`;
}

/**
 * The URL the descriptor's bytes are published at, for consumers that bring
 * their own downloader (React Native apps): resolve the URL here, download
 * however the platform likes, then verify the sha256 against
 * `descriptor.databaseSha256` BEFORE opening the file. Node consumers get
 * download + verification in one step from `download.ts`.
 */
export function artifactDownloadUrl(
  descriptor: ArtifactDescriptor,
  repository = 'jestek-dev/scripture-search-engine',
): string {
  return `https://github.com/${repository}/releases/download/${releaseTagFor(descriptor)}/content.db`;
}
