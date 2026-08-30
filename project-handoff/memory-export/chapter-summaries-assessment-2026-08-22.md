---
name: chapter-summaries-assessment-2026-08-22
description: 2026-08-22 assessment of Jesse's chapter/section-summaries + category-tags idea (context tab) — nothing exists on main; WEB has no headings (verified upstream); BSB PD headings (3,096) = boundary/title source; Brooks 1919 + MHCC = PD summary base; Juby permission-only; build path = extend P5.6 spine + chapters-first packs; full report at /mnt/project-files/research/2026-08-22-chapter-summaries-assessment.md; GO given 2026-08-22 13:20Z (decisions locked, Genesis pilot delivered — see [[genesis-pilot-2026-08-22]], coordinator splits full rollout after pilot approval)
metadata:
  type: project
  modified: 2026-08-22T14:00:02.895Z
---

# Chapter/section summaries assessment — 2026-08-22

Jesse asked (project chat, research thread) whether every chapter/subsection could get a brief summary + category tags to accurately back the mockup's Context tab. Two-worker assessment (repo audit + license-verified source survey); full report with appendices at /mnt/project-files/research/2026-08-22-chapter-summaries-assessment.md. No code changed.

**Do we have it? No.** Main (@9542c83) has no sections/headings/summaries/tags table (schema v6, anchors are verse-range). The pinned WEB corpus has NO section headings because the WEB translation itself has none — verified by downloading upstream engwebp_usfm.zip: zero \s headings in the canon, only Psalm superscriptions (which survive folded into verse 1), \ms1 Psalter divisions, SoS speaker labels. Prototype 63bfeec's Context tab is 7 hardcoded prose strings (chapter/pericope orientation + usage note — exactly the data shape Jesse wants, zero backing). Plan relatives: P5.6·CO-3 (0.14.0 pericopes = OpenBible boundary vote counts, counts-only, no titles/summaries) and P6.6·B7/J59 (20-pericope theme-label pilot). Jesse's idea extends both; recommend sharing P5.6's section IDs.

**Copy/learn from?** License-verified: **BSB USFM headings are PD** ("officially placed into the public domain as of April 30, 2023") — 3,096 \s1 headings covering all 66 books incl. all 150 Psalms + \r parallel refs = best boundary+title source (needs BSB→WEB versification pass; optional provenance-confirmation email). **Brooks, Summarized Bible 1919 (PD)** = best chapter-summary base (1919 voice, typology needs curation); **Matthew Henry Concise (PD; CC0 structured repo lyteword/mhenry-concise)** = second witness. **Juby biblesummary.info NOT open** — bulk use needs written permission (author amenable to small non-profit scripture projects). REJECTED: sil-ai/pericopes (no license), Aland Synopsis + RCL lectionary (in-copyright), ESV/NIV/study-Bible headings (in-copyright, off table). STEPBible has NO sections dataset (TVTMS useful for versification); OpenBible CC BY attribution-only (no SA problem). Scofield 1917 PD but learn-from-only (dispensational slant). No source ships modern summaries+tags — that layer must be authored offline.

**Can we make it? Yes.** Path: BSB spine mapped to WEB versification → offline PD-derived summary drafts (AI-assist offline OK, every row human-reviewed) → tags = existing ~110 concept IDs (controlled vocab, presence-only, sourced — no new taxonomy, no theology scores) → workbench J/K batch review → new tables (sections/section_summaries/section_tags) = SCHEMA_VERSION bump + manifests + G10 rows + layerFingerprint; display-only data needs NO ENGINE_VERSION bump (P5.6's 0.14.0 governs when sections feed ranking). Scale honest: 1,189 chapters + ~3,100 sections ≈ 4,300 rows ≈ 40–70 h Jesse review; chapters-only ≈ 10–20 h; high-traffic ~600 rows ≈ 5–10 h. Recommended phasing: P5.6 spine+BSB titles → chapter pack (1,189) → high-traffic sections → full canon; subsumes the J59 pilot as first batch.

**Jesse decisions pending:** go/no-go + scope tier; summary voice (rewrite vs quote); tag vocab reuse; optional BSB/Juby outreach; batch size/second reader; sequencing vs Phases 5–7. Links: [[implementation-plan-2026-08-20]], [[prototype-audit-2026-08-21]], [[theological-guardrail-research]], [[concordance-assessment]]

**Update 2026-08-22:** Jesse approved same day with decisions (subdivide-on-divergence, modern voice, vocab tags, steering-only for Juby/BibleProject, book summaries, Genesis pilot then parallel-thread rollout) — see [[genesis-pilot-2026-08-22]].

## GO given — 2026-08-22 13:20Z

Jesse gave the GO in the thread (cmsg_01P3QsU2j86UJUbajEtMTYp2VuQwkwvsNLjjZmRSMfLHGC, session cse_01NGKrgvYCgN4zdXfucf7PVe). Decisions locked:

- **Unit:** chapters, but subdivide when themes diverge within a chapter.
- **Voice:** modern wording.
- **Tags:** reuse existing ~110-concept vocabulary.
- **NO outreach emails** — biblesummary.info (Juby) is learn-from/steering only, never word-for-word.
- **BibleProject book-overview videos** added as a primary inspiration guide (also never copied).
- **FULL BOOK summaries included** (book-level summaries in scope alongside chapter summaries).
- **Bar:** accuracy to author's intent, original context/audience, layperson clarity.

**Pilot:** Genesis first — book summary + all 50 chapters, subdivided where needed, proposed tags — delivered as a review doc for Jesse BEFORE anything enters the engine. Running now in that thread.

**Rollout:** after Jesse approves the pilot, the full-Bible rollout must be SPLIT ACROSS PARALLEL THREADS per Jesse's explicit request — the project COORDINATOR orchestrates that split (the pilot thread will ping the coordinator on delivery and on approval).
