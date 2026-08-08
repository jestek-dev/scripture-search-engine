# Single-token lexicon audit — making bare-word queries reach Layer A

**Date:** 2026-08-08
**Status:** Implemented. Fixture-first; G8 baseline re-recorded as a reviewed
event (§4). Two accidental single tokens removed (§3) — that half was not in
the audit plan and is the more important finding.

---

## 1. The problem, measured

Concept matching is **containment of a lexicon phrase's normalized tokens in
the query's tokens** (`CorpusRepository.matchConcepts`). Every phrase token
must be present. The Torrey-wave lexicons are almost entirely multi-word, so:

```
query "worship"            → concept `worship` does NOT fire
                             John 4:24 surfaces on token_overlap alone,
                             Psalm 95:6 (its top anchor) is absent entirely
query "come let us worship" → concept fires correctly
```

One-word queries are the most common class a worship leader types, and they
were the class that bypassed the curated layer. The specificity discount in
`conceptAnchorEvidence` — 0.55 at one matched token, rising to 1.0 at four —
exists precisely to let single tokens in while keeping their claim humble. It
was near-dead code.

## 2. Method

Per the fixtures-first rule, the assertion came before the data:

1. `CorpusFixture` gained `additionalQueries` — further queries that must
   satisfy the **same** expectations. One claim, asked the way different users
   type it. This is what keeps the bare-word path from silently regressing.
2. Every concept's own lexicon was tokenized with the shared tokenizer to see
   which entries *already* reduced to a single significant token. That is what
   surfaced §3.
3. Bare tokens added only where the word is unambiguous for the concept.
4. Gauntlet run; G4 (collision) and G8 (noise) consulted before accepting.

## 3. The accidental single tokens — the more serious finding

Two lexicon phrases already collapsed to one token after stopword removal, so
two very broad bare queries were firing curated concepts nobody intended:

| Concept | Phrase | Reduced to | Effect |
|---|---|---|---|
| `presence-of-god` | "god with us" | `god` | the bare query **"god"** fired the concept and pulled Immanuel anchors into anything mentioning God |
| `grace-not-earned` | "not by works" | `work` | the bare query **"work"** fired the concept |

Both were invisible: nobody writes a one-word lexicon entry by accident, but
`with`, `us`, `not` and `by` are all stopwords, so a four-word phrase became
one token silently. Each was replaced with a phrasing that keeps the intended
sense and cannot collapse ("immanuel god with us", "saved not by works").

This is worth remembering as a class: **a lexicon phrase's real width is its
significant-token count, not its word count.** A curation-time check for this
would be cheap and is recommended in §6.

## 4. Decision table

Twenty concepts gained a bare token. Twelve deliberately did not.

### Admitted

| Concept | Bare token | Why it is unambiguous |
|---|---|---|
| `creation` | creation | names the doctrine, not a general word |
| `forgiveness-of-sins` | forgiveness | distinct from `forgiving-others`, which owns "forgive" |
| `gods-faithfulness` | faithfulness | attribute language, rarely generic |
| `grace-not-earned` | grace | theologically specific |
| `hope-in-god` | hope | the concept is scoped to hope itself |
| `joy-in-the-lord` | joy | as above |
| `obedience-to-the-word` | obedience | the concept's own subject |
| `peace-of-god` | peace | as above |
| `praise` | praise | previously reachable only via "hallelujah" |
| `prayer` | prayer | as above |
| `refuge-in-trouble` | refuge | strongly scriptural register |
| `repentance` | repentance | doctrinal term |
| `resurrection` | resurrection | previously only "risen" |
| `salvation` | salvation | previously only "saved" |
| `surrender-to-god` | surrender | devotional register |
| `thanksgiving` | thanksgiving | distinct from the verb "give thanks" |
| `the-cross` | the cross | the token `cross` in a scripture engine is unambiguous |
| `trust-in-god` | trust | the concept's own subject |
| `victory-in-christ` | victory | previously only "conqueror" |
| `worship` | worship | **the case that prompted the audit** |

### Deliberately skipped

| Concept | Candidate | Why not |
|---|---|---|
| `gods-love`, `loving-others` | love | Genuinely ambiguous *and* contested between two concepts. The broadest, most-typed word in the product deserves an explicit decision, not a default — **flagged for Jesse** (§5). |
| `walking-in-the-light` | light | Jesse's 2026-07-29 ruling scoped this concept to the ethical sense precisely because `light` spans both senses. Admitting the bare token would undo that decision. |
| `building-on-the-rock` | rock | Spans metaphor and terrain; "firm foundation" already carries the concept. |
| `faith-and-works` | faith / works | `faith` belongs to no single concept here, and `works` was the accidental token just removed from `grace-not-earned`. |
| `presence-of-god` | presence | Already an entry in its own right; only the accidental `god` was removed. |

### Correction (2026-08-08, after adversarial review)

An earlier draft claimed `fear-not`, `forgiving-others`, `holiness`, `prayer`
and `self-deception` "already had a deliberate single-token entry". **That was
wrong, and wrong in the same way §3 describes.** Those tokens (`fear`,
`forgive`, `holy`, `pray`, `deceiv`) are *accidental* collapses of multi-word
phrases, not entries anyone wrote as single words. Only `communion` and
`maranatha` were literal one-word entries.

Worse, §2 claimed to have tokenized every lexicon to find exactly this, and had
not done so exhaustively — it found `god` and `work` and stopped. Run properly
across the whole ontology, **twenty** phrases collapse to one token:

| Collapses to | Concept | From |
|---|---|---|
| `afraid`, `fear`, `dismay` | `fear-not` | "do not be afraid", "fear not", "be not dismayed" |
| `forgive` | `forgiving-others` | "forgive others" |
| `holy` | `holiness` | "be holy" |
| `pray` | `prayer` | "how to pray" |
| `deceiv` | `self-deception` | "deceiving yourselves" |
| `remembrance` | `lords-supper` | "do this in remembrance of me" |
| `anxiou` | `peace-of-god` | "do not be anxious" |
| `presence` | `presence-of-god` | "in your presence" |
| `risen` | `resurrection` | "he is risen" |
| `saved`, `born` | `salvation` | "how can i be saved", "you must be born again" |
| `deny` | `surrender-to-god` | "deny yourself" |
| `conqueror` | `victory-in-christ` | "more than conquerors" |
| `bow`, `exalt` | `worship` | "bow down before him", "we exalt you" |
| `abide`, `remain` | `abiding-in-christ` | "abide in me", "remain in me" |
| `cross` | `the-cross` | "the cross" |

Most are benign or actively good — `risen`, `deceiv`, `anxiou` and `conqueror`
are exactly the bare words someone would type, and they were working by accident
all along. The point is not that they are harmful; it is that **nobody knew they
existed**, which is how `god` and `work` survived. The gauntlet now reports
every collapse at build time so the class cannot be invisible again.

Two deserve a second look: `born` (from "you must be born again", added in this
pass) is broad enough to fire on "jesus was born in bethlehem", and `deny` is
broad generally. Recorded rather than silently kept.

## 4b. Off-topic triggering — a measured tradeoff, stated plainly

Adversarial review confirmed every bare token fires on queries using the word in
a non-theological sense: "grace kelly the actress", "salvation army donation",
"the cross street intersection", "trust the government". In a scripture search
box those are largely out of domain, and returning Ephesians 2:8 for a query
containing "grace" is defensible for this product.

The case that genuinely matters is the **in-domain** false positive: *"israel
makes peace with the philistines"* now surfaces Peace-of-God anchors where the
query is about a treaty. That is real, and it is the cost of the change.

Why it is bounded: a one-token match enters at `strength x 0.55`, so a bare hit
scores ~22 of a possible 40 against `exact_phrase`'s 60. It cannot outrank a
verbatim match. But it *is* filed in the authoritative `concept_anchor` family
and therefore sits outside the weak-aggregate cap, so the thinnest form of
concept evidence carries the strongest family's framing.

**Recommended follow-up (Jesse's call):** consider filing single-token concept
matches under the weak `concept_lexicon` family instead. That expresses their
thinness structurally rather than by discount alone. It changes ordering, so it
needs an ENGINE_VERSION bump and fixture updates — a deliberate change, not a
drive-by one.

## 5. Measured effect

- **G3:** all 32 corpus fixtures hold, now including a bare-word query each.
  Every fixture also names its own concept via `requiredReasonLabel`, so a
  neighbour concept cannot satisfy it.
- **G4 collision:** 32 concepts remain mutually distinct. Single tokens did
  not push any pair over the shared-phrase or shared-token thresholds.
- **G8 noise:** two probes churned past the 40% limit, both in the direction
  the change was written for. Baseline re-recorded as a reviewed event:

  | Probe | Before | After |
  |---|---|---|
  | `broad-grace` | token-overlap hits only | Eph 2:8-9, Rom 11:6, 2 Tim 1:9, Titus 3:5 carrying `concept_anchor` |
  | `ot-prophets-plans` | token noise below the target | **Jeremiah 29:11 still #1 on `exact_phrase` (70.5)**; positions 2-8 replaced by Peace-of-God anchors |

  The second is the one to check carefully, and it holds: the probe exists to
  verify Jer 29:11 is reachable in the WEB's own wording, and it is, at the top,
  by the strongest evidence family. What changed is what sits *beneath* it.
- **G11 latency:** unchanged.

## 6. Open items

1. **The `love` decision belongs to Jesse** (§4). My recommendation: give it to
   `gods-love`, whose anchors (John 3:16, Rom 8:38-39) are what someone typing
   one word almost always wants, and leave `loving-others` reachable by "love
   one another" / "love your neighbor". But it is the most-typed word in the
   product and the call should be explicit.
2. **Add a curation-time check for accidental single tokens** (§3): warn when a
   multi-word lexicon phrase reduces to one significant token, so the class
   cannot recur silently. Cheap; not built here because it belongs with the
   curation skill rather than with this data change.
