# Mining search telemetry without online learning — established practice and failure modes

**Date:** 2026-07-31
**Status:** Research note. No code or data changed.
**Question:** Consumer apps will log search telemetry (queries, zero-result
events, which result the user actually used) and we will mine it **offline**
into a human-readable gap report that feeds human-curated concept packs
through the admission gauntlet. Nothing updates ranking automatically. Is
this grounded in established practice, and are its failure modes known and
handled?

Verification discipline: claims marked **verified** were read in the primary
source (paper full text or first-party page) during this session. Claims
marked **secondhand** rest on abstracts, contemporaneous reporting, or
search summaries — flagged honestly, with the best source found.

---

## 1. Query-log mining is established IR practice, and what we plan to mine is the reliable part

### 1a. Reformulation mining (verified in both primary papers)

Radlinski & Joachims, *Query Chains: Learning to Rank from Implicit
Feedback* (KDD 2005, https://www.cs.cornell.edu/people/tj/publications/radlinski_joachims_05a.pdf)
— full text read. Users searching with one information need issue a
*chain* of reformulated queries (mean chain length 2.2 queries in their
logs). Preferences extracted **across** queries in a chain reached
**84.5% ± 6.1** agreement with explicit human judgments — against an
inter-judge agreement ceiling of 86.4%. The strategy the authors single
out as "particularly informative" is exactly the one we care about: "it
associates documents with query words that may not occur in the document"
— i.e. reformulation chains are where vocabulary mismatch becomes
visible. Their learned examples are the canonical gap types:

- "lexus" → the Lexis-Nexis homepage ("clearly a spelling correction,
  with a search for 'lexus' originally returning no results")
- "oed" → the Oxford English Dictionary page (acronym expansion)
- "ndlf" chains → users repeatedly failing to find the National Digital
  Library Foundation page, which turned out **not to be indexed at all** —
  log mining surfaced a genuine content gap, not a ranking bug.

Their flagged open problems: noise tolerance, "words with two meanings,
and click-spam" — ambiguity and adversarial input are the known failure
modes of chain mining.

Huang & Efthimiadis, *Analyzing and Evaluating Query Reformulation
Strategies in Web Search Logs* (CIKM 2009,
https://jeffhuang.com/papers/Reformulation_CIKM09.pdf) — full text read.
On the AOL logs (36,389,567 query events), their classifier found
3,411,706 reformulations; on a hand-labeled sample, 27.3% of non-identical
consecutive query pairs were reformulations, consistent with the ~28%
previously reported for the dataset. Their conclusion on which strategies
work: "Certain reformulations like add/remove words, word substitution,
acronym expansion, and spelling correction seem most effective. On the
other hand, acronym formation and reordering words may be less beneficial."
Their rule classifier hit **98.2% precision at 61.3% recall** — the
field's accepted trade: mine reformulations conservatively, precision over
recall, exactly the Treasury parser's "reject rather than guess" posture.

Caveat both papers document: chain/session boundaries are themselves
inferred. Time-only session detection managed 73% precision in prior work
(He et al., cited in Huang §2); everything downstream of a wrong session
boundary is noise. Verified in the Huang text.

### 1b. Zero-result mining is standard commercial practice (verified in first-party docs)

- **Elastic** (App Search analytics blog,
  https://www.elastic.co/blog/what-your-elastic-app-search-analytics-are-telling-you
  — fetched): the "top queries with no results" report feeds exactly three
  remedies — create synonyms, create missing content, or curate results.
  Elastic's synonyms guide
  (https://www.elastic.co/guide/en/app-search/current/synonyms-guide.html)
  points users to the analytics endpoints to learn "the precise terms that
  they are searching for" before writing synonyms.
- **Algolia** (search analytics metrics docs,
  https://www.algolia.com/doc/guides/search-analytics/concepts/metrics —
  fetched): documents No Results Rate, Click-Through Rate, Conversion Rate,
  and Click Position as the core metrics; for zero-result searches the
  documented remedies are "expanding your catalog if there's a genuine
  gap," adding keywords to attributes, or synonyms/Rules.

Both vendors treat log mining as producing **input to a human decision**
(add a synonym, write content, curate) — not as training signal. That is
precisely our design: telemetry → gap report → human-authored concept pack
→ gauntlet.

### 1c. What has proven reliable vs unreliable

Reliable (per the sources above): zero-result queries as gap indicators;
high-precision reformulation classes (spelling, add/remove words,
substitution, acronym expansion) as vocabulary-mismatch evidence;
cross-query preferences within a well-detected chain.

Unreliable: raw click counts as relevance labels (§2); session boundaries
from time gaps alone; semantic rephrasings (Huang's largest undetected
class — 108 of 200 missed reformulations were semantic rephrasings their
lexical rules cannot see, verified in their error table). For us that last
one matters: **the reformulations most characteristic of concept-level
vocabulary gaps are the hardest to mine automatically** — which is an
argument for a human reading the gap report rather than a script
clustering it.

---

## 2. Why a raw click is not a relevance label (verified in the primary paper)

Joachims, Granka, Pan, Hembrooke & Gay, *Accurately Interpreting
Clickthrough Data as Implicit Feedback* (SIGIR 2005,
https://www.cs.cornell.edu/people/tj/publications/joachims_etal_05a.pdf)
— full text read. Eye-tracking study over Google results with three
conditions (normal / top-two swapped / fully reversed), plus explicit
judgments from independent judges. What it established:

- **Presentation bias**: ranks 1 and 2 are *viewed* almost equally, but
  rank 1 is clicked far more; attention decays with rank and drops sharply
  at the scroll fold (ranks 6–7).
- **Trust bias**: users click rank 1 even when the judges rated abstract 2
  more relevant — and the effect survives when the top two are secretly
  swapped. The paper's test: the fraction of clicks going to the more
  relevant abstract differs decisively by position (19/20 vs 2/7). "Users
  have substantial trust in the search engine's ability to estimate the
  relevance of a page, which influences their clicking behavior."
- **Quality bias**: what a click means depends on how good the whole
  ranking is. In the reversed condition the average judged relevance-rank
  of clicked results degraded from 2.67 to 3.27; the average clicked
  position moved from 2.66 to 4.03 and clicks per query *fell* from 0.80
  to 0.64. A click is relative to the alternatives shown.
- The paper's resolution: interpret clicks as **relative preferences**
  ("Click > Skip Above" etc.), which agreed with explicit judgments 80.8%
  ± 3.6 of the time against an inter-judge ceiling of 89.5% (78.2–80.9%
  when scored against judgments of the landing pages, ceiling 86.4%).
  Absolute click counts were never validated as labels; relative
  preferences were.

On clicks vs stronger signals: Fox, Karnawat, Mydland, Dumais & White,
*Evaluating Implicit Measures to Improve Web Search* (ACM TOIS 2005,
https://dl.acm.org/doi/10.1145/1059981.1059982) found the best predictors
of user satisfaction **combined** clickthrough with dwell time and how the
user exited the session — a click alone was a materially weaker signal.
**Secondhand** — read at abstract/summary level
(https://www.microsoft.com/en-us/research/publication/evaluating-implicit-measures-improve-web-search/),
not the full text; the direction of the finding is consistently reported.

Implication for our schema: logging "which result the user actually
**used**" (copied a verse, added it to a setlist, opened the passage and
stayed) is the strong end of the signal spectrum; logging raw taps on a
result list is the weak, position-confounded end. If position is not
recorded alongside every interaction, the data cannot even be
bias-corrected later — position must be a first-class field. The
established correction technique when people *do* train on clicks is
inverse-propensity weighting against an explicit position-bias model
(Joachims, Swaminathan & Schnabel, *Unbiased Learning-to-Rank with Biased
Feedback*, WSDM 2017,
https://www.cs.cornell.edu/~tj/publications/joachims_etal_17a.pdf —
**secondhand**, cited for existence of the mitigation, not read in full).
We do not train, so we need only the cheap half of the lesson: record
position, and read usage-counts as "evidence someone found this useful,"
never as a ranking of usefulness.

---

## 3. Feedback loops: the documented failure of closing the loop automatically (verified in the primary paper)

Jiang, Chiappa, Lattimore, György & Kohli (DeepMind), *Degenerate
Feedback Loops in Recommender Systems* (AIES 2019,
https://arxiv.org/abs/1902.10730) — full text read. The system's outputs
shape the interests/behavior that generate its future training data;
under mild assumptions the coupled system provably degenerates (echo
chamber / filter bubble). Two findings matter for us:

- **The better the model, the faster the collapse.** "An oracle model
  often leads to quick degeneracy of the system" — accurate greedy
  exploitation of engagement is the *worst* case, and even random
  exploration "may in fact accelerate degeneration" by surfacing the most
  degenerative items faster.
- **Their best remedies** (their words, from the conclusion): "continuous
  random exploration and growing the candidate pool at least linearly."
  With any finite candidate pool, by pigeonhole some item is served
  infinitely often and degenerates in the worst case.

Chaney, Stewart & Engelhardt, *How Algorithmic Confounding in
Recommendation Systems Increases Homogeneity and Decreases Utility*
(RecSys 2018, https://arxiv.org/abs/1710.11214 — **secondhand**, abstract
read): training on data confounded by your own past recommendations
"homogenizes user behavior without increasing utility" — the rich-get-
richer loop shows up even in simulation, without adversaries.

How this maps onto our design:

- **The loop is broken structurally**, not procedurally. Ranking changes
  only via a human-authored pack through the gauntlet; telemetry cannot
  touch weights, caps, or ordering. This is the strongest possible form of
  the "slow the loop down" remedy — the loop has a human in series, and
  G6's by-construction caps bound the blast radius of any admission.
- **The loop is not gone.** It re-enters through curator attention: if gap
  reports are ranked by frequency, curators fix what popular queries miss,
  popular content gets richer, and the long tail never generates enough
  telemetry to appear in a report. That is Jiang et al.'s degeneracy
  operating at editorial speed. The mitigations translate directly:
  zero-result and *low-evidence* queries deserve standing placement in the
  report regardless of frequency (exploration), and the corpus keeps
  growing from curated sources independent of telemetry (growing candidate
  pool — which the concept-curation skill already does).
- The "NO MEASURABLE EFFECT" verdict is the other half of the guard: a
  pack motivated by telemetry still has to move a fixture, so popularity
  alone cannot justify weight.

---

## 4. Search-log privacy: what the AOL release established

The canonical event, and the reason "we'll anonymize the user IDs" is not
a plan. On August 4, 2006 AOL Research publicly posted ~20 million search
queries from roughly 650,000 users covering March–May 2006, with
usernames replaced by numeric IDs (the release itself is no longer
hosted; figures per the New York Times report and the Wikipedia record of
the release, https://en.wikipedia.org/wiki/AOL_search_log_release —
**secondhand** on the exact counts; the Huang & Efthimiadis paper, which
used the corpus, confirms 36,389,567 query lines first-hand).

Within five days the New York Times had re-identified user **4417749** as
Thelma Arnold of Lilburn, Georgia, from query content alone — searches
for landscapers in her town, people with her surname, and her dogs'
ailments (Barbaro & Zeller, *A Face Is Exposed for AOL Searcher No.
4417749*, NYT, Aug 9 2006,
https://www.nytimes.com/2006/08/09/technology/09aol.html — read via an
archived copy,
https://www2.hawaii.edu/~strev/ICS614/materials/NYT%20-%20confidentiality%20-%20A%20Face%20is%20Exposed%20for%20AOL%20Searcher%20%202006-08-24.pdf).
Her reaction, in the Times: "My goodness, it's my whole personal life."

Consequences (contemporaneous reporting, **secondhand**): AOL's CTO
Maureen Govern resigned and two employees were fired
(https://www.nbcnews.com/id/wbna14455344); a class action under the
Electronic Communications Privacy Act followed in the N.D. Cal.
(https://www.nbcnews.com/news/amp/wbna15004643).

The two durable lessons, both directly load-bearing for us:

1. **Query text is itself a quasi-identifier.** Pseudonymizing the user ID
   does nothing when the queries carry names, places, and life details.
   Per-user query *histories* are the dangerous object; individual query
   strings detached from any user identity are far less so.
2. The dataset never died — it became the field's standard reformulation
   corpus (Huang & Efthimiadis built on it, verified). Released data is
   permanent. Our equivalent rule: the raw event log never leaves the
   device/app boundary; only the aggregated, thresholded gap report does.

### Published anonymization and threshold practice at major engines

- **Retention/anonymization timelines.** Google announced in September
  2008 that it would "anonymize IP addresses on our server logs after 9
  months" (down from 18) — original post *Another step to protect user
  privacy*,
  https://googleblog.blogspot.com/2008/09/another-step-to-protect-user-privacy.html
  (the post exists but would not render in this session; wording quoted
  via EFF's contemporaneous coverage,
  https://www.eff.org/id/deeplinks/2008/09/google-cuts-server-log-retention-nine-months
  — **secondhand for the exact quote, verified that the post exists**).
  The regulatory driver is primary and verified: EU Article 29 Working
  Party, Opinion 1/2008 on data protection issues related to search
  engines (WP148,
  https://ec.europa.eu/justice/article-29/documentation/opinion-recommendation/files/2008/wp148_en.pdf)
  — the Working Party "does not see a basis for a retention period beyond
  6 months" for personal search data.
- **Aggregation thresholds.** Google's Trends FAQ (fetched, first-party:
  https://support.google.com/trends/answer/4365533) states data is
  "anonymized (no one is personally identified), categorized... and
  aggregated," and that "Trends only shows data for popular terms, so
  search terms with low volume appear as '0'." The threshold's existence
  is published; **no public k value is disclosed** for Trends or
  autocomplete — I found none in any first-party source, and claims of
  specific k values in secondary blogs should be treated as folklore.
- **A published parameter does exist** where Google formalized the
  practice: the COVID-19 Search Trends Symptoms Dataset ships with
  ε-differential privacy, **ε = 1.68** per user per day (Google's own
  anonymization process description, https://arxiv.org/abs/2009.01265 —
  **secondhand**, abstract-level). Google's general anonymization page
  (fetched, first-party: https://policies.google.com/technologies/anonymization)
  names its toolbox: generalization to k-anonymity, l-diversity, and
  differential privacy.
- **Sensitive-category exclusions.** Google's autocomplete policy page
  (fetched, first-party: https://support.google.com/websearch/answer/7368877)
  says predictions "reflect real searches" but are filtered: policies
  remove predictions that are "violent, sexually explicit, hateful,
  disparaging, or dangerous," predictions promoting "medically hazardous
  health claims," and predictions "associating disparaging or sensitive
  terms with named individuals." The precedent: even at web scale, mined
  query data is policy-filtered before any human-visible reuse, with
  health and named-person categories explicitly called out.

For a scripture app the sensitive categories are concrete: queries are
prayers in disguise. "verses about suicide," "does God forgive divorce,"
"my husband drinks" — a gap report is read by humans at the church, and a
raw query column can out a congregant as surely as AOL's release did.
This is not hypothetical transfer; it is the same mechanism (query text as
quasi-identifier) in a population thousands of times smaller.

---

## 5. The small-population caveat: k-style thresholds weaken as the population shrinks

- Sweeney, *Simple Demographics Often Identify People Uniquely* (2000,
  https://dataprivacylab.org/projects/identifiability/paper1.pdf —
  **secondhand**, figures consistently reported from the paper): 87% of
  the US population is uniquely identified by {5-digit ZIP, gender, date
  of birth}; the finer the geographic unit, the more identifying the same
  attributes become. The general principle: uniqueness of attribute
  combinations rises as the anonymity set shrinks.
- Rocher, Hendrickx & de Montjoye, *Estimating the success of
  re-identifications in incomplete datasets using generative models*
  (Nature Communications, 2019,
  https://www.nature.com/articles/s41467-019-10933-3 — fetched,
  first-party): 99.98% of Americans would be correctly re-identified in
  any dataset using 15 demographic attributes; sampling/incompleteness
  does **not** confer deniability ("few attributes are often sufficient to
  re-identify with high confidence individuals in heavily incomplete
  datasets"); "even heavily sampled anonymized datasets are unlikely to
  satisfy the modern standards for anonymization set forth by GDPR"; the
  authors reject the "de-identification release-and-forget model."
- Design inference (ours, not a citation): in a congregation of a few
  hundred, every threshold argument degrades three ways at once. (1) The
  anonymity set behind any count is tiny, so k-anonymity requires
  suppressing almost everything rare — and rare queries are exactly what
  a gap report wants. (2) The report's readers *know the population
  personally* — a pastor reading "searched: does God forgive divorce,
  Tuesday 11pm" can often name the person, which is a stronger adversary
  than any web-scale attacker. (3) Differencing is easy: week-over-week
  count deltas in a small population leak individuals even when every
  published count clears the threshold. Web-scale k values, whatever they
  are, do not transfer; thresholds must be set against the actual
  population size, and the safest fields simply never leave the device.

---

## 6. Implications for this repo's telemetry design

**Supported by evidence — keep:**

1. **Offline mining → human-curated fix → gauntlet** is the shape of both
   the academic lineage (Radlinski & Joachims; Huang & Efthimiadis) and
   commercial practice (Elastic, Algolia): logs identify the gap, a human
   authors the synonym/content/curation. No source found treats automatic
   ranking updates as necessary for log mining to pay.
2. **Zero-result events are the highest-value, lowest-risk signal** — the
   industry-standard gap detector, and they carry no relevance-labeling
   bias at all (there was nothing to be biased about).
3. **Reformulation pairs are the vocabulary-mismatch detector**, with a
   precision-over-recall mining posture (Huang's 98.2%/61.3% is the
   benchmark attitude) and the caveat that semantic rephrasings — our most
   important class — largely evade lexical rules, so the gap report must
   be *read*, not just clustered.
4. **"Which result was actually used" is the right signal to prefer** over
   raw clicks (Joachims 2005; Fox 2005). Fixture-first curation then
   converts a mined gap into a golden fixture — which is exactly the
   "human converts weak signal into strong label" step the click-bias
   literature says is required.

**Known failure modes the design must explicitly handle:**

1. **Position bias** (Joachims 2005, verified): log the displayed position
   and the evidence class of every surfaced/used result, or usage data is
   uninterpretable later. Never read usage counts as a relevance ranking —
   at most as relative preferences within one displayed list.
2. **Editorial feedback loop** (Jiang 2019; Chaney 2018, verified/abstract):
   frequency-ranked gap reports curate the head and starve the tail.
   Standing sections for zero-result and low-evidence queries regardless
   of volume; corpus growth independent of telemetry; and the
   NO MEASURABLE EFFECT verdict as the backstop against popularity-driven
   weight.
3. **Query text is PII** (AOL 2006): no per-user query histories ever
   leave the device; the artifact of the pipeline is an aggregated,
   thresholded report, and the raw log is retention-limited (the WP148
   six-month ceiling is a defensible default for a system with far less
   need than a web engine).
4. **Small-population re-identification** (Sweeney; Rocher 2019): web
   k-thresholds don't transfer to congregation scale. Suppress
   below-threshold rows *and* accept that thresholds alone are
   insufficient against readers who know the population — sensitive-
   category queries (the pastoral-crisis categories; cf. Google's
   autocomplete exclusions of health and named-person predictions) should
   be excluded from human-readable reports by category, not by count.
5. **Session inference is noise-prone** (He et al. via Huang, verified):
   if reformulation mining is implemented, treat session boundaries as
   low-confidence and prefer explicit in-app signals (same search box
   interaction, seconds apart) over time-gap heuristics.

## Sources

Primary papers (full text read this session):
- Joachims, Granka, Pan, Hembrooke, Gay. *Accurately Interpreting Clickthrough Data as Implicit Feedback.* SIGIR 2005. https://www.cs.cornell.edu/people/tj/publications/joachims_etal_05a.pdf
- Radlinski, Joachims. *Query Chains: Learning to Rank from Implicit Feedback.* KDD 2005. https://www.cs.cornell.edu/people/tj/publications/radlinski_joachims_05a.pdf
- Huang, Efthimiadis. *Analyzing and Evaluating Query Reformulation Strategies in Web Search Logs.* CIKM 2009. https://jeffhuang.com/papers/Reformulation_CIKM09.pdf
- Jiang, Chiappa, Lattimore, György, Kohli. *Degenerate Feedback Loops in Recommender Systems.* AIES 2019. https://arxiv.org/abs/1902.10730

First-party pages (fetched this session):
- Elastic, *What your Elastic App Search analytics are telling you.* https://www.elastic.co/blog/what-your-elastic-app-search-analytics-are-telling-you
- Elastic, *Synonyms Guide* (App Search). https://www.elastic.co/guide/en/app-search/current/synonyms-guide.html
- Algolia, *Search analytics metrics.* https://www.algolia.com/doc/guides/search-analytics/concepts/metrics
- Google, *FAQ about Google Trends data.* https://support.google.com/trends/answer/4365533
- Google, *How Google autocomplete predictions work.* https://support.google.com/websearch/answer/7368877
- Google, *How Google anonymizes data.* https://policies.google.com/technologies/anonymization
- Rocher, Hendrickx, de Montjoye. *Estimating the success of re-identifications in incomplete datasets using generative models.* Nature Communications 2019. https://www.nature.com/articles/s41467-019-10933-3
- Article 29 Data Protection Working Party, *Opinion 1/2008 on data protection issues related to search engines* (WP148). https://ec.europa.eu/justice/article-29/documentation/opinion-recommendation/files/2008/wp148_en.pdf

Secondhand / abstract-level (flagged inline where used):
- Fox, Karnawat, Mydland, Dumais, White. *Evaluating Implicit Measures to Improve Web Search.* ACM TOIS 2005. https://dl.acm.org/doi/10.1145/1059981.1059982
- Joachims, Swaminathan, Schnabel. *Unbiased Learning-to-Rank with Biased Feedback.* WSDM 2017. https://www.cs.cornell.edu/~tj/publications/joachims_etal_17a.pdf
- Chaney, Stewart, Engelhardt. *How Algorithmic Confounding in Recommendation Systems Increases Homogeneity and Decreases Utility.* RecSys 2018. https://arxiv.org/abs/1710.11214
- Barbaro, Zeller. *A Face Is Exposed for AOL Searcher No. 4417749.* New York Times, 2006-08-09. https://www.nytimes.com/2006/08/09/technology/09aol.html (archived copy read: https://www2.hawaii.edu/~strev/ICS614/materials/NYT%20-%20confidentiality%20-%20A%20Face%20is%20Exposed%20for%20AOL%20Searcher%20%202006-08-24.pdf)
- Wikipedia, *AOL search log release* (for release counts/dates). https://en.wikipedia.org/wiki/AOL_search_log_release
- NBC News, AOL resignations and class action (2006). https://www.nbcnews.com/id/wbna14455344 ; https://www.nbcnews.com/news/amp/wbna15004643
- Google, *Another step to protect user privacy* (2008-09; post exists, wording quoted via EFF). https://googleblog.blogspot.com/2008/09/another-step-to-protect-user-privacy.html ; https://www.eff.org/id/deeplinks/2008/09/google-cuts-server-log-retention-nine-months
- Sweeney. *Simple Demographics Often Identify People Uniquely.* 2000. https://dataprivacylab.org/projects/identifiability/paper1.pdf
- Bavadekar et al. (Google). *Google COVID-19 Search Trends Symptoms Dataset: Anonymization Process Description.* 2020. https://arxiv.org/abs/2009.01265
