# Decision record — ship forward at v0.9.0; never republish v0.7.1

**Status: recorded 2026-08-21 (plan P2.4 / RH-1). The decision itself is
recommended to Jesse with the reasoning in the open; his tag push (J47) is
the release decision.** This record exists so the next agent does not
re-litigate the choice, and so the "never mutate a published release's
assets" rule has a citable home.

## 0. The defect being cured

The committed descriptor and the published v0.7.1 asset describe two
different artifacts:

- **Committed** `artifacts/content-artifact.json` (in-tree today, verified):
  `schemaVersion "6"`, `databaseSha256 35b7a6f3…`, 137,412,608 bytes,
  `builtAt 2026-07-31T14:00:43Z`, `counts.concepts 33`, a
  14,102,528-byte `verse_translation_tokens` table in `perTableBytes`, no
  `release.tag`, and a `stale` block (`since 2026-08-08`,
  `blocksRelease: true`). No release anywhere carries these bytes — it is a
  phantom (`docs/NEEDS-JESSE.md` §1.9).
- **Published** v0.7.1 `content.db` (GitHub API asset digest + release-served
  descriptor, both verified 2026-08-20): schema 5, `sha256:b57d3676…`,
  123,310,080 bytes, 8 concepts, no `verse_translation_tokens` table. The
  byte gap (137,412,608 − 123,310,080 = 14,102,528) is exactly the
  `verse_translation_tokens` table.

Consequence, verified: `npm run fetch-artifact --workspace workbench`
resolves tag `v0.7.1` via the `releaseTagFor` fallback
(`workbench/src/descriptor.ts` — the committed descriptor has no
`release.tag`), downloads the schema-5 bytes, fails the sha256 check, and
deletes the download (audit F31). The documented fallback — build locally —
also fails while `fetch:sources` is blocked on drifted pins (cured by the
RH-3/RH-4 re-pins).

## 1. The decision

**Ship forward: mint a new artifact, review its descriptor, publish it as
v0.9.0. v0.7.1 stays byte-for-byte untouched forever.** Republishing v0.7.1
— swapping its `content.db` to match the committed descriptor — is rejected
on four verified grounds:

1. **No such bytes exist.** The committed descriptor's `35b7a6f3…` build was
   never CI-minted or attested; SQLite builds do not byte-reproduce across
   environments (`.github/workflows/release.yml` header: "NOTHING IS REBUILT
   AT TAG TIME … the defect class that produced v0.7.1"), and the tree's
   layer has since moved from the descriptor's 33 concepts to 108
   (`ontology/concepts/`, verified 2026-08-21) — no rebuild can ever produce
   that hash again.
2. **It would brick every actual v0.7.1 consumer.** The v0.7.1 tag's engine
   supports schemas 1–5 only (`git show v0.7.1:engine/src/createEngine.ts`,
   line 97: `SUPPORTED_SCHEMA_VERSIONS = new Set(['1','2','3','4','5'])`,
   verified 2026-08-21 from the local tag). npm `dist-tags.latest = 0.7.1`,
   published versions `[0.7.0, 0.7.1]` (registry, verified 2026-08-20). A
   schema-6 asset under the v0.7.1 tag is an artifact the only engine that
   resolves that tag refuses.
3. **The published pair is internally sound.** The release-served
   `content-artifact.json` (downloaded and inspected 2026-08-20) says schema
   5, `b57d3676…`, 123,310,080 B, 8 concepts — it correctly describes the
   asset beside it. A consumer pinning *(engine 0.7.1, release-served
   descriptor)* per the `docs/implementation-plan.md` §5 contract works
   today. The defect is confined to the *committed* descriptor being a
   phantom — cured forward.
4. **Swapping a published asset is the exact defect class the promote-only
   redesign exists to prevent** (release.yml header), and RH-2's immutable
   releases (J51) make such swaps impossible going forward. The repair must
   not itself be the attack it guards against.

## 2. The v0.7.1 hash history, stated precisely

The committed descriptor has held three distinct identities; conflating them
has caused miscitations before. The sequence, verified 2026-08-21 by
`git show <commit>:artifacts/content-artifact.json` at each step:

1. **At v0.7.1 release time (2026-07-31, release commit `8f708d9`):** the
   committed descriptor said `databaseSha256: 403d0fb9…` while the
   `content.db` actually attached to the release was `b57d3676…` — SQLite
   byte layout differing between a local build and CI, every other field
   byte-identical. The release verify step was a tautology then and could
   not catch it (`docs/NEEDS-JESSE.md` §7.1 — formerly the doc's second
   section numbered "2.11"; renumbered 2026-08-21).
2. **Same day, commit `7c1e53b`** ("fix(release): verify against the
   reviewed descriptor, not the one the build just wrote"): the committed
   descriptor was corrected to the CI-built `b57d3676…` and the workflow was
   fixed to verify against a pre-build snapshot of the reviewed descriptor.
3. **The phantom's braided arrival:** commit `c469ef1` (2026-07-31,
   translation-neutral search) overwrote the descriptor with a local
   schema-6 build — `35b7a6f3…` / 137,412,608 B, matching no release asset.
   Commit `f9fd586` (2026-08-06) restored the schema-5 `b57d3676…`
   descriptor; commit `0478da1` (2026-08-08) kept it and added the `stale`
   block; the 2026-08-10 merges (`51b5d59`, `9cd54ec`) brought the schema-6
   phantom back with the stale block attached — the state the tree has held
   since, and the state the v0.9.0 descriptor PR replaces verbatim with a
   minted descriptor.
4. **PR #26 (`276bdbd`, 2026-08-16)** split minting from promotion:
   `mint-artifact.yml` is now the only place release bytes are born, and
   `release.yml` rebuilds nothing at tag time — the design the four grounds
   in §1 lean on.

So the standing team-memory fact "published asset `b57d3676…` vs committed
descriptor" is correct for **today's** committed descriptor (`35b7a6f3…`,
schema 6); the *original* v0.7.1-day mismatch was `403d0fb9…` vs
`b57d3676…`. Both mismatches are cured the same way: forward.

## 3. The standing rule this record establishes

**Never mutate a published release's assets.** Fixes roll forward only —
v0.9.1, never a v0.9.0 asset swap; an `artifact/<date>` refresh tag, never a
re-upload. Enforcement is layered: the promote-only release flow (bytes are
born once, in `mint-artifact.yml`), RH-2's immutable-releases setting once
Jesse toggles it (J51 — post-toggle releases freeze at publish; v0.7.0 and
v0.7.1 remain mutable and deliberately untouched), and the scheduled
release-integrity sentinel watching the pre-immutability releases' asset
digests.

## 4. Drafted v0.7.1 notes-only annotation (J50/A3 — Jesse decides; assets unchanged)

If Jesse opts in, append this paragraph to the v0.7.1 GitHub release
*notes* — a notes edit only, no asset is touched:

> Known issue: the repository's committed descriptor moved ahead of this
> release in August 2026 (stale-marked 2026-08-08; carrying a schema-6
> identity since 2026-08-10); consumers of v0.7.1 must verify against the
> `content-artifact.json` **attached to this release**, which correctly
> describes the attached `content.db` (`b57d3676…`). See v0.9.0 for the
> current artifact.

## 5. Consumer-contract grounding (§5)

`docs/implementation-plan.md` §5: each consumer app (Maskil, LH Worship
Setlist, Versed) pins `(engine semver, artifact descriptor)` and verifies the
descriptor. Ship-forward is the only option that honors that contract in
both directions: pinned 0.7.1 consumers keep a pair that keeps verifying
(ground 3), and upgrading consumers get a pair that was actually minted,
attested, and reviewed. The negative check in the release checklist
(`docs/descriptor-pr-template.md` §4) proves the boundary: engine 0.7.1
refuses the schema-6 database with its schema-version message, so an upgrade
is always an explicit re-pin, never a silent absorption. Anyone moving
0.7.x → 0.9.0 crosses the unpublished 0.8.0 breaking change —
`engine/CHANGELOG.md` carries the warning.

## 6. What this record does NOT decide

- The release itself: **J47** (the tag push) and the mint dispatch are
  Jesse's acts.
- The counsel go/no-go on shipping `verse_translation_tokens` (**J48** —
  §0 of `docs/descriptor-pr-template.md`).
- The v0.7.1 annotation (**J50** — §4 above is a draft, not an edit).
- The immutability toggle (**J51**).
