---
name: books-2026-08-15-assessment
description: 2026-08-15 assessment of 5 book PDFs Jesse added (commit c3ff4ba on claude/hearth-thread-vvwdi2) — all in-copyright, all blocked for ingestion, none PD-derivative; value = gap checklist + ~40 fixture-query ideas; harvest landed as PR #31; 2026-08-20 Jesse says do NOT delete the branch — he may want the Books files brought onto main, decision pending with him; copyright caveat (in-copyright scans on main = redistribution risk) flagged to him 2026-08-20
metadata:
  type: project
  modified: 2026-08-20T16:36:02.388Z
---

# Books assessment — 2026-08-15

## Where they sit
5 Internet Archive PDF scans in a top-level `Books/` dir, commit `c3ff4ba` ("Added books", Aug 14, jestek-dev), on branch `claude/hearth-thread-vvwdi2` ONLY — never on main (main confirmed clean; PR #13/#14 scan removals merged). That branch's session was warned not to carry Books/ into its PRs.

## The five books, one-line verdicts
1. **A Topical Bible Guide** — Bob Phillips, Harvest House, 2004. 99 topics, ~730 NIV refs. Blocked (in-copyright, NIV text); most valuable as fixture-query source (~16 uncovered queries) + gap confirmation.
2. **Growing by Heart** — Scharlotte Rich, NavPress, 2004. 52-week women's devotional, 103 memory verses. Blocked and nearly redundant: **96/103 verses already held** (41 concept-anchored, 55 in Torrey); value = women's-life themes (worry, friendship, self-worth, rest, people-pleasing, fresh start).
3+4. **Scriptural Prayers for the Praying Mother / Praying Man** — White Stone Books, ©2003 Word and Spirit Resources. One gender-swapped text: 90/99 topics shared, prayers word-for-word identical (median similarity 0.997), 80/90 identical ref sets. Blocked; **86% of verses already in Torrey**. Treat as ONE source. Direct audit-gap hits: Holy Spirit/Comforter (John 14:16, 14:26 paired with grief), new creation (2 Cor 5:17), comfort.
5. **31 Scriptures Every Achiever Should Memorize** — Mike Murdock, Wisdom International, undated. 31 word→verse pairs; 23/31 verses already in Torrey. Blocked AND theologically contested: prosperity-gospel proof-texting (Achievement→John 14:12, Prosperity→Job 36:11, Ability→Phil 4:13, Assignment→Jer 1:4-5, Criticism→Matt 12:37, Delegation→Luke 16:12). **Never cite Murdock as a source**; ~12 modern query words (stress, focus, debt, rest, teamwork...) are fine as ideas routed through Torrey/editorial.

## Provenance probes (all failed the Miller-precedent PD test)
- Phillips: 9-topic verse-level probe vs Torrey — 63% ref overlap but Phillips-only refs throughout, small fraction of each Torrey list drawn. Independent modern 2004 selection, NOT a PD subset. Ingestion door closed.
- Rich, prayer books, Murdock: original arrangements, no PD ancestor; Murdock's topic frame is his proprietary self-help vocabulary.

## Key harvest (non-copying)
- **Comfort** and **Holy Spirit/Comforter** gaps confirmed by multiple books; both exist as un-mined topics in the ingested Torrey-311 ("AFFLICTION, CONSOLATION UNDER"; "HOLY SPIRIT, THE COMFORTER, THE").
- "Fresh start" phrasings (Ps 51:10, Acts 3:19) fix the sense-inverted "new beginnings" query; John 14:26+grief fixes "comforter".
- Combined missing-query list (~40-45), felt-need words absent from all lexicons/fixtures: worry, stress, guidance, loneliness, guilt, finances, friendship, self-worth, rest/burnout, fresh start, people-pleasing, fatigue, discouragement, rejection, favor, discernment, assurance of salvation, rapture, unpardonable sin, lord's prayer, golden rule, provision, new job, prayer for my teenager, protection, teamwork, debt, tithing, contentment, gossip/tongue, time management, self-image/identity.
- Alias ideas: worry↔anxiety, communion↔lord's supper, bereavement↔grief, second coming↔return of Christ with **rapture kept distinct**. Trap: **"doubtful things" ≠ "doubt"** (Rom 14 adiaphora vs wavering faith).
- Path in: fixtures (golden test queries) first, then wire to Torrey/editorial verses; never copy any book's verse lists; Jesse merges everything.

## Open item
Jesse instructed in-thread (2026-08-18): strengthen from the books, then remove the resources. The harvest landed as PR #31. Removal = deleting branch `claude/hearth-thread-vvwdi2` (tip still c3ff4ba; its only other unique commit, 23a4e4f, is the plan doc which landed on main separately — safe to delete). A 2026-08-18 deletion attempt failed: `git push origin --delete` returned HTTP 403 three times — the session's minted push credential refuses branch deletion (not a proxy/egress block; fetch and normal pushes work, no gh CLI, no MCP delete-ref tool). ~~Still pending: Jesse (or any fully-credentialed session) deletes it via GitHub UI branches page or `git push origin --delete claude/hearth-thread-vvwdi2`.~~ **SUPERSEDED — see Update 2026-08-20 below: do NOT delete.** Safety checks (tip unchanged, no open PR from that branch, plan doc on main) all passed 2026-08-18.

## Update 2026-08-20 — do NOT delete the branch

Per Jesse (project chat, 2026-08-20 ~12:31Z, relayed by the coordinator): do NOT delete `claude/hearth-thread-vvwdi2`, reversing the 2026-08-18 removal plan — he may want the Books files brought onto main; decision pending with him. He said he wants "those sermons brought into main in the main folder" — ambiguous: the branch holds the five in-copyright book PDF scans (not sermons), and Spurgeon's sermons were never in the repo. Coordinator asked him to clarify (books PR to main vs Spurgeon sermon ingestion vs both) and awaits his answer. Branch deletion is OFF the pending list. Copyright caveat stands: putting the in-copyright scans on main = redistribution risk, flagged to Jesse 2026-08-20.

See [[concordance-assessment]] and [[audit-2026-08-13-full]].
