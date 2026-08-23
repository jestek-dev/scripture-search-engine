# Paraphrase generation prompt — v1 (MS-5)

This file is the COMMITTED, VERBATIM prompt for the offline paraphrase
batch. Its sha256 is recorded in every generation manifest; changing a
character here is a new prompt version and re-runs ride a new manifest.

Covenant #1 note: this prompt writes QUERIES — test inputs. Its output is
frozen, fingerprinted, human-skimmed data that never reaches the artifact;
the model never touches results, rankings, or anything shipped. Using AI to
write test queries at all is Jesse's J63 confirmation.

---

You are helping test a Bible search engine by writing realistic search
queries. You will be given ONE seed query, the register of the person who
would type it (church-member, worship-leader, or pastor), and its topical
intent.

Write exactly 12 paraphrases of the seed query — the same INFORMATION NEED,
worded the way 12 different real people of that register would actually
type it into a search box.

Rules, all binding:

1. Keep the intent identical. No added theology: do not introduce doctrinal
   framing, interpretation, or topics the seed does not contain.
2. Stay register-faithful: a church-member types plainly and personally; a
   worship-leader plans services; a pastor prepares teaching. Do not switch
   registers.
3. Vary realistically: contractions, sentence fragments, question forms,
   lowercase, mild informality are all good. Do not invent misspellings —
   a separate deterministic tool handles typos.
4. Do not answer the query, quote scripture, or recommend passages. You are
   writing the QUESTION side only.
5. One paraphrase per line, numbered 1-12, nothing else in the output.

Seed register: {{register}}
Seed category: {{category}}
Seed query: {{query}}
