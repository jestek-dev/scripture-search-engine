# Sign the baselines in the workbench (J39)

The Study serves a guided signing page at **`/sign`** (linked from the
header). It replaces the terminal walkthrough for steps 1–4 of
[docs/governance/probe-baseline-review.md](governance/probe-baseline-review.md)
with a point-and-click flow. It changes **none** of the governance: the same
files are written, bound by the same digests, checked by the same gates, and
the independence policy is quoted on the page rather than restated.

## What the page does, step by step

1. **What you're signing** — shows the identity triple this checkout
   produces (derived the same way the gauntlet derives it: a fresh fixture
   build), the identity the committed approvals bind, and a plain verdict
   ("Approvals are stale — they bind engine 0.9.0; signing will bind
   0.14.0", or "Approvals are current"). Git branch, HEAD, and cleanliness
   are shown so the signer knows exactly what tree they are signing.
2. **What changed** — one button renders the probe review packet with the
   same code `npm run review-packet --workspace eval` runs, with `--before`
   extracted from git history: the server finds the historical blob of
   `eval/baselines/probes.json` whose canonical-JSON SHA-256 equals the
   digest the *committed* approval binds. Nothing is hardcoded, so the flow
   survives every future signing cycle. The packet and an ordering diff
   render inline; the extracted prior and the saved packet live in the
   gitignored `eval/.runs/`.
3. **Who reviewed it** — reviewer name, contact, independence attestation,
   per-file rationale, and the review-record markdown. Every field is typed
   by the human; the workbench never prefills, suggests, or completes
   reviewer prose. The one default is the review date (today) — a date is a
   fact, not prose.
4. **Make it official** — the server builds the exact three files a write
   would produce, validates the two approvals with the gauntlet's **own**
   validators (`validateProbeBaselineApproval`,
   `validateOrderingSnapshotApproval`), and shows them for reading. An
   explicit confirm click writes:
   - `docs/reviews/<date>-j39-baseline-signing.md` — the reviewer's text,
     byte-for-byte (absolute local paths are refused before writing, the
     same patterns the docs-governance guard enforces after);
   - `eval/baselines/probes.approval.json` — schema v2, including
     `reviewPacketSha256`;
   - `eval/baselines/ordering.snapshot.approval.json` — schema v2,
     exact-keys, deliberately **without** `reviewPacketSha256`.
   All digests (`canonicalJsonSha256`, `probeListsSha256`,
   `reviewPacketSha256`, evidence bytes) are computed by importing eval's
   functions — no reimplementation that could drift. `priorProvenance` is
   chained automatically from the committed approvals' own bindings.
5. **Prove it** — runs the existing allowlisted `gauntlet` job and streams
   its output. Expected after a sound signing: **ADMIT WITH WARNINGS** with
   G2 and G8 passing. On REJECT the page names the failing gate and says to
   stop.
6. **Commit it yourself** — the flow never runs `git commit`. The final
   screen lists exactly the three files written and a short copyable
   branch/commit/push block. The PR and Jesse's merge remain the human gate.

## What the flow refuses, by design

- Writing anywhere except the two approval paths and one
  `docs/reviews/*.md` record matching the gates' evidence-path pattern
  (realpath-canonicalized; symlinked parents refuse).
- Signing when the approvals are already current (the page says so and
  disables the write), or when the committed baselines do not describe this
  checkout's identity (regenerate first — the page tells you the command).
- Any empty reviewer prose, and any review record carrying an absolute
  local path.
- Committing, pushing, or approving anything on its own. There is no AI
  anywhere in the flow — deterministic digests, git lookups, and forms.

## Server surface

| Route | Method | Effect |
|---|---|---|
| `/sign` | GET | The guided page |
| `/api/v2/signing/status` | GET | Identity triple, bound approvals, verdict, git state |
| `/api/v2/signing/review-packet` | POST | Renders the packet + ordering diff into `eval/.runs/` (gitignored) |
| `/api/v2/signing/preview` | POST | The exact three files a write would produce, validated, with a confirm digest |
| `/api/v2/signing/write` | POST | Writes the three files after digest confirmation |

The POST routes require same-origin localhost JSON like every other
workbench write, are disabled in degraded-read-only startup, and the write
takes the single repository-mutation slot (no overlap with checks,
promotions, or admissions).

Implementation: `workbench/src/signingOperations.ts`; tests:
`workbench/test/signingOperations.test.ts`.
