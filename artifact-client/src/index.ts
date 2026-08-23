/**
 * @jestek-dev/scripture-artifact-client — descriptor verification + artifact
 * download for consumers of @jestek-dev/scripture-engine (plan P7.3 / CO-6).
 *
 * Consumers pin `(engine semver, artifact descriptor)`. This package is the
 * verifying half of that pin: validate the descriptor you committed, resolve
 * the release tag it names (`releaseTagFor` — the §5 reference
 * implementation), download the bytes, and refuse anything that does not
 * hash to the reviewed identity. See docs/CONSUMERS.md for the quickstart
 * and the display obligations that come with the data.
 *
 * `./descriptor` is portable (no Node imports — safe under Hermes/JSC);
 * the download half needs Node.
 */

export {
  artifactDownloadUrl,
  releaseTagFor,
  validateArtifactDescriptor,
  type ArtifactDescriptor,
} from './descriptor.js';

export {
  ArtifactDigestMismatchError,
  ArtifactNotPublishedError,
  downloadArtifact,
  sha256OfFile,
  type DownloadArtifactOptions,
} from './download.js';
