---
name: isaiah-daniel-rollout-2026-08-23
description: 2026-08-23 Isaiah–Daniel group (Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel) of the full-Bible rollout COMPLETE — all 5 books published to /mnt/project-files/research/bible-rollout/<book>.md after fresh-critic loops to zero objections (Isaiah r4, Jeremiah r3, Lamentations r5, Ezekiel r4, Daniel r5); 19 new tag-gap rows + ~80 ref-appends landed as five atomic blocks; Daniel zero-fixture provenance caveat; thread cmsg_01P3QsU2j86UJUbajEtMTYp2JhG7MNabPWd37eKvdqVnYM RESOLVED
metadata:
  type: project
  modified: 2026-08-23T07:46:46.164Z
---

# Isaiah–Daniel rollout group — COMPLETE 2026-08-23

Thread cmsg_01P3QsU2j86UJUbajEtMTYp2JhG7MNabPWd37eKvdqVnYM (session cse_01WcLWKKvVCz9Hg2DX7uK6n5). All 5 books published to /mnt/project-files/research/bible-rollout/: isaiah.md (r4 approved), jeremiah.md (r3), lamentations.md (r5), ezekiel.md (r4), daniel.md (r5) — 183 chapters total, every book closed at "APPROVED — zero objections" with per-round records, Decisions records, and delivery-time verification inside each doc (delivery sha256 recorded in each finalize; e.g. isaiah e804a9b4…, daniel d4a30c7c…, ezekiel 6f36ef0c…). Pipeline per book: prep → parallel chunk drafters → assembly with cross-chunk reconciliation → fresh-harsh-critic loop (ALL severities block) → finalize with atomic shared-log append, per [[bible-rollout-conventions-2026-08-23]].

**Provenance:** WEB text extracted from the sha-verified v0.7.1 release content.db whose descriptor sourceSha256 equals pipeline/manifests/web.json contentSha256 — avoids the upstream drift caveat. Fixture-witness verses: Isaiah 205 / Jeremiah 150 / Lamentations 66 / Ezekiel 65 byte-identical; **Daniel has ZERO fixture verses** — its provenance rests on the DB-hash chain alone, stated as a caveat wherever accuracy is claimed in daniel.md.

**Group rulings applied (consistent with Minor Prophets group):** pastoral-* personal-crisis register only (kept on Jeremiah's confessions chs 15/20 and Baruch ch 45; off national oracles); "the LORD" never "Yahweh"; contested schemes fulfillment-neutral or signposted (Daniel four kingdoms / seventy weeks / son of man / furnace figure; Ezekiel Gog, 40–48, the prince, 21:27; Isaiah servant songs signposted); Jer 29:11 framed as dated communal pledge (prosperity guardrail); WEB vocabulary held over familiar renderings (ch 38 "dungeon" not "cistern").

**Tag-gaps contributed (19 new rows across five atomic blocks):** Isaiah — god-reigns, resurrection-of-the-dead, servant-of-the-lord, no-other-god, power-of-gods-word, sovereignty-of-god, drunkenness; Jeremiah — god-relents, persecuted-for-gods-word; Daniel — spiritual-warfare, end-times; Ezekiel — glory-of-god, new-heart, watchman-and-warning, individual-responsibility, gods-holy-name, trusting-in-man, living-water, shame. Plus ~80 ref-appends incl. cross-thread routings (messianic → Zechariah messianic-prophecy; divination → 1 Samuel occult-and-divination; persecution → Jeremiah row; shepherd material → Zechariah shepherds-and-the-flock per critic ruling under CONVENTIONS §9). The atomic-append + cmp-guard protocol survived three real concurrent-write races (Isaiah, Jeremiah, Ezekiel finalizes) and one coordinator false-alarm clobber audit (nothing lost — Jeremiah refs in the Lamentations block were staged-routing prose, clarified in the Jeremiah block preamble).

Links: [[bible-rollout-2026-08-23]], [[bible-rollout-conventions-2026-08-23]], [[minor-prophets-rollout-2026-08-23]]
