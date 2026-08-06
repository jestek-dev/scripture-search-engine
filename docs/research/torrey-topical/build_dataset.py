#!/usr/bin/env python3
"""Build the Torrey-Miller topical dataset.

Miller's 1977 "Topical Bible Concordance" selected 313 topics verbatim from
Torrey's New Topical Textbook (1897, public domain). This script:

  1. Maps each Miller heading (OCR-curated list) to its canonical Torrey topic.
  2. Extracts each topic's full outline from the machine-readable witness
     (j86schroeder/topical-bible-search dist/torrey/*.jsonl, MIT), with
     hierarchy reconstructed from Torrey's own punctuation convention
     (group headers carry no refs; children end their phrase with "." before
     the em dash; top-level points do not).
  3. Cross-checks every point's references against the CCEL full text
     (torrey_ccel_source.txt). Disagreements are recorded in
     discrepancies.json - never silently resolved.
  4. Validates every reference against KJV versification taken from the
     repo's pipeline/src/versification/kjv.ts. Anything out of range,
     unrepresentable, or ambiguous goes to review-queue.json - never dropped,
     never guessed.

Deterministic: no timestamps, no randomness, sorted output. Same inputs give
byte-identical outputs.

Witness defects reconciled here (see SPLITS below, all verified by content +
alphabetical position + Miller's own printed headings):
  - CCEL PDF text repeats the heading "Communion With God" where Torrey's
    "Compassion and Sympathy" belongs; JSONL preserved both as duplicate
    "Communion With God" records. Second record is really Compassion and
    Sympathy.
  - Same defect: second "Early Rising" is really "Earth, The".
  - JSONL swallowed three topic headings as entries of the preceding topic:
    "Christ is God" (inside Christ, Character Of), "Herbs, & C" (inside
    Hell), "Parables of christ" (inside Parables).
"""

import json
import os
import re
import sys
import unicodedata
from collections import OrderedDict

SP = "/tmp/claude-0/-home-user-scripture-search-engine/cad5f0ae-7ed6-57be-b320-6fa9dc8b5222/scratchpad"
REPO = "/home/user/scripture-search-engine"
DIST = f"{SP}/repos/topical-bible-search/dist/torrey"
CCEL = f"{SP}/concordance/torrey-canonical/torrey_ccel_source.txt"
MILLER = f"{SP}/concordance/miller-topics.txt"
OUT = f"{SP}/concordance/dataset"

EM = "—"  # em dash


# ---------------------------------------------------------------- repo data
def load_books():
    """Parse pipeline/src/books.ts -> [(id, name, [abbrevs])]. Read-only."""
    src = open(f"{REPO}/pipeline/src/books.ts", encoding="utf-8").read()
    pat = re.compile(
        r"\{\s*id:\s*(\d+),\s*name:\s*\"([^\"]+)\",.*?abbreviations:\s*\[(.*?)\]",
        re.DOTALL,
    )
    books = []
    for m in pat.finditer(src):
        abbrevs = re.findall(r"\"([^\"]+)\"", m.group(3))
        books.append((int(m.group(1)), m.group(2), abbrevs))
    assert len(books) == 66, f"expected 66 books, got {len(books)}"
    assert books[0][1] == "Genesis" and books[65][1] == "Revelation"
    return books


def load_kjv():
    """Parse pipeline/src/versification/kjv.ts -> list of 66 verse-count rows."""
    src = open(f"{REPO}/pipeline/src/versification/kjv.ts", encoding="utf-8").read()
    rows = re.findall(r"/\*\s*\d+ [^*]+\*/\s*\[([\d,\s]+)\]", src)
    table = [[int(x) for x in row.split(",")] for row in rows]
    assert len(table) == 66, f"expected 66 rows, got {len(table)}"
    assert sum(len(r) for r in table) == 1189
    assert sum(sum(r) for r in table) == 31102
    return table


BOOKS = load_books()
KJV = load_kjv()
BOOK_NAMES = {name for _, name, _ in BOOKS}
VERSES = {name: KJV[bid - 1] for bid, name, _ in BOOKS}

# CCEL / e-Sword-style abbreviations not present in books.ts.
EXTRA_ABBREVS = {
    "Ge": "Genesis", "Le": "Leviticus", "De": "Deuteronomy", "Jdj": "Judges",
    "1Ch": "1 Chronicles", "2Ch": "2 Chronicles", "Ne": "Nehemiah",
    "Es": "Esther", "Ec": "Ecclesiastes", "Da": "Daniel", "Ho": "Hosea",
    "Joe": "Joel", "Na": "Nahum", "Mr": "Mark", "Lu": "Luke", "Joh": "John",
    "Ac": "Acts", "Ro": "Romans", "Ga": "Galatians", "Re": "Revelation",
}


def norm_book_key(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


ABBREV = {}
for _bid, _name, _abbrevs in BOOKS:
    for a in [_name] + _abbrevs:
        ABBREV[norm_book_key(a)] = _name
for a, name in EXTRA_ABBREVS.items():
    ABBREV[norm_book_key(a)] = name


# ------------------------------------------------------------- witness 3
def load_jsonl(path):
    return [json.loads(line) for line in open(path, encoding="utf-8")]


TOPICS3 = load_jsonl(f"{DIST}/topics.jsonl")
ENTRIES3 = load_jsonl(f"{DIST}/entries.jsonl")
ASSERT3 = load_jsonl(f"{DIST}/assertions.jsonl")

# File order is authoritative. For the two duplicate-heading topics the
# merged entry stream restarts entryIndex at 1 mid-list, so sorting by
# entryIndex would interleave the two sections.
entries_by_topic = OrderedDict()
for e in ENTRIES3:
    entries_by_topic.setdefault(e["topicId"], []).append(e)

asserts_by_entry = {}
for a in ASSERT3:
    asserts_by_entry.setdefault(a["entryId"], []).append(a)
for asl in asserts_by_entry.values():
    asl.sort(key=lambda a: (a["groupIndex"], a["segmentIndex"], a["id"]))

# ------------------------------------------------------------------ splits
# Each split: base topicId -> list of (canonicalName, ccelHeadingLiteral,
# predicate on entryIndex, headerEntryIndexConsumed or None, note or None).
DUP_NOTE = (
    "Both text witnesses print the heading '{lit}' here (a CCEL PDF "
    "duplicate-heading defect); content, alphabetical position, and Miller's "
    "printed heading identify the true Torrey topic as '{name}'."
)
SWALLOW_NOTE = (
    "The JSONL witness swallowed this topic into the preceding topic "
    "'{prev}'; the CCEL text carries the literal heading '{lit}' at this "
    "position."
)

SPLITS = {
    "torrey:communion-with-god": {
        # duplicate-heading topic: the merged entry stream restarts
        # entryIndex at 1 where the second section begins.
        "mode": "index-reset",
        "first_count": 18,  # entryCount of duplicateIndex 1 record
        "parts": [
            ("Communion With God", "Communion With God", None),
            ("Compassion and Sympathy", "Communion With God",
             DUP_NOTE.format(lit="Communion With God", name="Compassion and Sympathy")),
        ],
        "expect_after": "Christ set an example of",
    },
    "torrey:early-rising": {
        "mode": "index-reset",
        "first_count": 20,
        "parts": [
            ("Early Rising", "Early Rising", None),
            ("Earth, The", "Early Rising",
             DUP_NOTE.format(lit="Early Rising", name="Earth, The")),
        ],
        "expect_after": "The world in general",
    },
    "torrey:christ-character-of": {
        # swallowed-heading topic: a no-ref entry holds the literal heading.
        "mode": "header-entry",
        "expect_header": "Christ is God",
        "parts": [
            ("Christ, Character Of", "Christ, Character Of", None),
            ("Christ is God", "Christ is God",
             SWALLOW_NOTE.format(prev="Christ, Character Of", lit="Christ is God")),
        ],
        "expect_after": "As Jehovah",
    },
    "torrey:hell": {
        "mode": "header-entry",
        "expect_header": "Herbs, & C",
        "parts": [
            ("Hell", "Hell", None),
            ("Herbs, &c.", "Herbs, & C",
             SWALLOW_NOTE.format(prev="Hell", lit="Herbs, & C")),
        ],
        "expect_after": "Called the green herbs",
    },
    "torrey:parables": {
        "mode": "header-entry",
        "expect_header": "Parables of christ",
        "parts": [
            ("Parables", "Parables", None),
            ("Parables of Christ", "Parables of christ",
             SWALLOW_NOTE.format(prev="Parables", lit="Parables of christ")),
        ],
        "expect_after": "Wise and foolish builders",
    },
}


def build_topic_table():
    """Return ordered list of post-split topics:
    {key, name, ccelHeading, entries, note} in CCEL/PDF order."""
    out = []
    seen_dup2 = set()
    for t in TOPICS3:
        tid = t["id"]
        base = tid.split(":2")[0] if tid.endswith(":2") else tid
        if tid.endswith(":2"):
            # entries were merged under the base id; the :2 record only marks
            # the duplicate heading. The split below already emitted it.
            assert base in SPLITS, f"unexpected duplicate record {tid}"
            seen_dup2.add(base)
            continue
        entries = entries_by_topic.get(tid, [])
        if tid in SPLITS:
            sp = SPLITS[tid]
            if sp["mode"] == "index-reset":
                resets = [i for i in range(1, len(entries))
                          if entries[i]["entryIndex"] < entries[i - 1]["entryIndex"]]
                assert len(resets) == 1, f"expected one index reset in {tid}"
                cut = resets[0]
                assert cut == sp["first_count"], (tid, cut)
                first, rest = entries[:cut], entries[cut:]
            else:
                hdrs = [i for i, e in enumerate(entries)
                        if e["rawText"].strip() == sp["expect_header"]]
                assert len(hdrs) == 1, f"expected one header entry in {tid}"
                cut = hdrs[0]
                first, rest = entries[:cut], entries[cut + 1:]
            assert rest and rest[0]["rawText"].startswith(sp["expect_after"]), (
                f"split boundary mismatch for {tid}: {rest[0]['rawText'][:60]!r}")
            n1, h1, note1 = sp["parts"][0]
            n2, h2, note2 = sp["parts"][1]
            out.append({"key": tid, "name": n1, "ccelHeading": h1,
                        "entries": first, "note": note1})
            out.append({"key": tid + "/split", "name": n2, "ccelHeading": h2,
                        "entries": rest, "note": note2})
        else:
            out.append({"key": tid, "name": t["sourceTopic"], "ccelHeading":
                        t["sourceTopic"], "entries": entries, "note": None})
    assert seen_dup2 == {"torrey:communion-with-god", "torrey:early-rising"}
    return out


TOPIC_TABLE = build_topic_table()

# -------------------------------------------------------- miller matching
BRITISH = {
    "stedfastness": "steadfastness", "saviour": "savior", "behaviour":
    "behavior", "favour": "favor", "honour": "honor", "neighbour": "neighbor",
}


def word_bag(s):
    s = unicodedata.normalize("NFKD", s)
    s = s.replace("’", "").replace("'", "")  # apostrophes: Lord's -> Lords
    s = s.encode("ascii", "ignore").decode().lower()
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    words = [BRITISH.get(w, w) for w in s.split() if w != "the"]
    return tuple(sorted(words))


def match_miller():
    miller = [l.strip() for l in open(MILLER, encoding="utf-8") if l.strip()]
    assert len(miller) == 313, f"expected 313 Miller headings, got {len(miller)}"
    bags = {}
    for t in TOPIC_TABLE:
        bags.setdefault(word_bag(t["name"]), []).append(t)
    matched, unmatched = OrderedDict(), []
    for m in miller:
        cands = bags.get(word_bag(m), [])
        if len(cands) == 1:
            matched[m] = cands[0]
        elif len(cands) > 1:
            raise SystemExit(f"ambiguous Miller heading {m!r}: "
                             f"{[c['name'] for c in cands]}")
        else:
            unmatched.append(m)
    used = {}
    for m, t in matched.items():
        if t["key"] in used:
            raise SystemExit(f"two Miller headings map to {t['name']!r}: "
                             f"{used[t['key']]!r} and {m!r}")
        used[t["key"]] = m
    return matched, unmatched


# ------------------------------------------------- outline point building
def split_entry_text(raw):
    """Return (text, refpart or None) splitting on the first em dash."""
    if EM in raw:
        text, refpart = raw.split(EM, 1)
        return text.strip(), refpart.strip()
    return raw.strip(), None


def build_points(topic, review_queue):
    """Build ordered points with parents + refs for one post-split topic.

    Hierarchy follows Torrey's punctuation convention as printed in both
    witnesses: a no-ref line opens a group; a point whose phrase ends with
    "." before the em dash belongs to the open group; a point without the
    trailing period is top-level and closes the group. A compound header
    line ("Good — Exemplified", a PDF artifact shared by both witnesses)
    yields a nested header chain.
    """
    points = []
    group_stack = []
    for e in topic["entries"]:
        raw = e["rawText"].strip()
        is_header = not e["refGroups"]
        if is_header:
            parts = [p.strip() for p in raw.split(EM) if p.strip()]
            group_stack = []
            for p in parts:
                points.append({"text": p, "parents": list(group_stack),
                               "refs": [], "_entry": e})
                group_stack.append(p)
            continue
        text, _ = split_entry_text(raw)
        is_child = text.endswith(".") and bool(group_stack)
        if not text.endswith("."):
            group_stack = []
        parents = list(group_stack) if is_child else []
        refs = []
        for a in asserts_by_entry.get(e["id"], []):
            refs.append(normalize_assertion(topic, text, a, refs, review_queue))
        refs = [r for r in refs if r is not None]
        points.append({"text": text, "parents": parents, "refs": refs,
                       "_entry": e})
    return points


def normalize_assertion(topic, point_text, a, refs, review_queue):
    """Validate one witness-3 assertion; return ref dict or None (queued)."""
    def queue(reason, extra=None):
        item = {
            "topic": topic["name"],
            "point": point_text,
            "raw": a.get("rawSegmentOriginal") or a["rawSegment"],
            "rawRefGroup": a["rawRefGroup"],
            "source": "jsonl-witness",
            "reason": reason,
        }
        if extra:
            item.update(extra)
        review_queue.append(item)

    if a["sourceStatus"] == "corrected_by_errata":
        # The witness applied a documented errata correction. We surface it
        # for human review rather than adopting it silently, but keep the
        # corrected ref in the dataset (the original is out of range).
        queue("witness-errata-correction-applied", {
            "original": a.get("rawSegmentOriginal"),
            "corrected": a["rawSegment"],
            "errataReason": a.get("errataReason"),
        })
    if a["scope"] == "chapter":
        queue("chapter-scope-reference-needs-review", {
            "detail": "reference cites a whole chapter; schema requires "
                      "verse bounds and choosing them is an editorial act"})
        return None
    book = a["book"]
    if book not in BOOK_NAMES:
        queue(f"unknown-book:{book}")
        return None
    cs, ce = a["chapterStart"], a["chapterEnd"]
    vs, ve = a["verseStart"], a["verseEnd"]
    if cs != ce:
        queue("cross-chapter-range-not-representable")
        return None
    chapters = VERSES[book]
    if not (1 <= cs <= len(chapters)):
        queue(f"chapter-out-of-range:{book} {cs}")
        return None
    last = chapters[cs - 1]
    if not (isinstance(vs, int) and isinstance(ve, int) and 1 <= vs <= ve <= last):
        queue(f"verse-out-of-range:{book} {cs}:{vs}-{ve} (chapter has {last})")
        return None
    return {"book": book, "chapter": cs, "verseStart": vs, "verseEnd": ve}


# --------------------------------------------------------------- ccel parse
ARTIFACT = re.compile(r"^(\d+|[A-Z]|Torrey's New Topical Textbook)$")


def norm_heading(s):
    s = s.replace("’", "'")
    return " ".join(s.lower().split())


def ccel_segments():
    """Split the CCEL text into per-heading segments following the known
    heading sequence. Returns list of (headingLiteral, [physical lines])."""
    lines = open(CCEL, encoding="utf-8").read().splitlines()
    seq = []
    for t in TOPIC_TABLE:
        seq.append(t["ccelHeading"])
    expected = [norm_heading(h) for h in seq]
    segs = []
    cur = None
    idx = 0
    started = False
    for ln in lines:
        s = ln.strip()
        if not started:
            if idx < len(expected) and norm_heading(s) == expected[0]:
                started = True
                cur = [s, []]
                idx = 1
            continue
        if s == "Indexes" and idx >= len(expected):
            break
        if idx < len(expected) and norm_heading(s) == expected[idx]:
            segs.append(cur)
            cur = [s, []]
            idx += 1
            continue
        cur[1].append(ln)
    if cur is not None:
        segs.append(cur)
    if idx != len(expected):
        raise SystemExit(
            f"CCEL segmentation found {idx}/{len(expected)} headings; "
            f"next missing: {seq[idx]!r}")
    return segs


BOOKTOK = re.compile(r"^[1-3]?[A-Za-z]+$")


def logical_lines(raw_lines):
    out = []
    for ln in raw_lines:
        s = ln.strip()
        if not s or ARTIFACT.match(s):
            continue
        cont = False
        if out:
            prev = out[-1]
            if s[0].islower() and prev.endswith(".") and EM in s:
                # a complete point precedes and this line carries its own
                # em dash: it is a rare lowercase-initial point (e.g. Mercy:
                # "to those that are in distress. — Lu 10:37."), not a wrap.
                cont = False
            elif s[0].islower() or s[0].isdigit() or s.startswith(EM):
                cont = True
            elif prev.endswith((EM, "-")):
                cont = True
            elif prev.endswith((";", ",")) and EM in prev:
                # a wrapped reference list; a group header may legitimately
                # end with ";" or "," and has no em dash, so require one.
                cont = True
            else:
                # wrapped mid-reference: previous ends with a bare book token
                lastword = prev.split()[-1] if prev.split() else ""
                if EM in prev and not prev.endswith(".") and BOOKTOK.match(lastword) \
                        and norm_book_key(lastword) in ABBREV:
                    cont = True
        if cont:
            out[-1] = out[-1] + " " + s
        else:
            out.append(s)
    return out


SEE_RE = re.compile(r"^(?:See\s+[“\"]?[A-Z][^.;”\"]*[”\"]?\.?\s*)+")
SEG_RE = re.compile(
    r"^(?:(?P<book>(?:[1-3]\s?)?[A-Za-z]+\.?)\s+)?(?P<rest>\d.*)$")


def parse_ref_part(refpart):
    """Parse a CCEL reference tail into (spans, problems).
    spans: list of (book, chapter, verseStart, verseEnd) or
    ('CHAPTER', book, ch). problems: list of strings."""
    spans, problems = [], []
    refpart = refpart.strip()
    refpart = SEE_RE.sub("", refpart).strip()
    if not refpart:
        return spans, problems
    refpart = refpart.rstrip(".")
    # Torrey's comparative connectors ("Mt 5:28, with Ro 7:14, and Ac 5:9")
    # separate references just as ";" does.
    refpart = re.sub(r",?\s+(?:with|and)\s+(?=[1-3]?[A-Z])", ";", refpart)
    book = None
    for seg in refpart.split(";"):
        seg = seg.strip()
        if not seg:
            continue
        if EM in seg:
            # inline sub-label artifact, e.g. "Illustrated — Isa 9:3";
            # both witnesses attach the refs to the enclosing point.
            seg = seg.split(EM)[-1].strip()
        m = SEG_RE.match(seg)
        if not m:
            problems.append(f"unparseable-segment:{seg}")
            continue
        if m.group("book"):
            key = norm_book_key(m.group("book"))
            if key in ABBREV:
                book = ABBREV[key]
            else:
                problems.append(f"unknown-book:{seg}")
                continue
        if book is None:
            problems.append(f"no-book-context:{seg}")
            continue
        rest = m.group("rest").replace(" ", "")
        # cross-chapter form C:V-C2:V2 -> per-chapter spans (mirrors how the
        # comparison expands the JSONL witness's cross-chapter assertions)
        xc = re.fullmatch(r"(\d+):(\d+)[-–](\d+):(\d+)", rest)
        if xc:
            c1, v1, c2, v2 = (int(x) for x in xc.groups())
            if c1 == c2:
                spans.append((book, c1, v1, v2))
            elif book in VERSES and 1 <= c1 < c2 <= len(VERSES[book]):
                spans.append((book, c1, v1, VERSES[book][c1 - 1]))
                for ch in range(c1 + 1, c2):
                    spans.append((book, ch, 1, VERSES[book][ch - 1]))
                spans.append((book, c2, 1, v2))
            else:
                problems.append(f"cross-chapter:{seg}")
            continue
        cv = re.fullmatch(r"(\d+):([\d,–-]+)", rest)
        if cv:
            ch = int(cv.group(1))
            for piece in cv.group(2).split(","):
                if not piece:
                    continue
                r = re.fullmatch(r"(\d+)(?:[-–](\d+))?", piece)
                if not r:
                    problems.append(f"unparseable-verses:{seg}")
                    continue
                v1 = int(r.group(1))
                v2 = int(r.group(2)) if r.group(2) else v1
                spans.append((book, ch, v1, v2))
            continue
        if re.fullmatch(r"\d+", rest):
            spans.append(("CHAPTER", book, int(rest)))
            continue
        problems.append(f"unparseable-segment:{seg}")
    return spans, problems


def ccel_points(seg_lines):
    """Parse one topic's CCEL lines into [(text, spans, problems)]."""
    pts = []
    for ln in logical_lines(seg_lines):
        text, refpart = split_entry_text(ln)
        if refpart is None:
            pts.append((text, [], []))
        elif not re.search(r"\d", refpart):
            # PDF artifact: sibling group headers joined by an em dash
            # (e.g. "Good — Exemplified" under Families). No digits means no
            # references; emit each header.
            pts.append((text, [], []))
            for part in refpart.split(EM):
                if part.strip():
                    pts.append((part.strip(), [], []))
        else:
            spans, problems = parse_ref_part(refpart)
            pts.append((text, spans, problems))
    return pts


# ---------------------------------------------------------------- compare
def text_key(s):
    s = unicodedata.normalize("NFKD", s).replace("’", "'")
    return re.sub(r"[^a-z0-9]", "", s.lower())


def expand(spans):
    """Expand spans to a frozenset of verse coordinates for comparison.
    Chapter markers stay symbolic."""
    out = set()
    for sp in spans:
        if sp[0] == "CHAPTER":
            out.add(("CHAPTER", sp[1], sp[2]))
        else:
            book, ch, v1, v2 = sp
            for v in range(v1, min(v2, v1 + 500) + 1):
                out.add((book, ch, v))
    return frozenset(out)


def spans_from_asserts(entry):
    spans = []
    for a in asserts_by_entry.get(entry["id"], []):
        if a["scope"] == "chapter":
            spans.append(("CHAPTER", a["book"], a["chapterStart"]))
        elif a["chapterStart"] == a["chapterEnd"]:
            spans.append((a["book"], a["chapterStart"], a["verseStart"],
                          a["verseEnd"]))
        else:  # cross-chapter: split per chapter for comparison only
            spans.append((a["book"], a["chapterStart"], a["verseStart"],
                          VERSES.get(a["book"], [[999] * 200])[a["chapterStart"] - 1]
                          if a["book"] in VERSES else a["verseStart"]))
            for ch in range(a["chapterStart"] + 1, a["chapterEnd"]):
                spans.append((a["book"], ch, 1, VERSES[a["book"]][ch - 1]))
            spans.append((a["book"], a["chapterEnd"], 1, a["verseEnd"]))
    return spans


def fmt_span(sp):
    if sp[0] == "CHAPTER":
        return f"{sp[1]} {sp[2]} (whole chapter)"
    b, c, v1, v2 = sp
    return f"{b} {c}:{v1}" + ("" if v1 == v2 else f"-{v2}")


def cross_check(topic, points, seg_lines, discrepancies):
    cps = ccel_points(seg_lines)
    used = [False] * len(cps)
    by_key = {}
    for i, (t, _sp, _pr) in enumerate(cps):
        by_key.setdefault(text_key(t), []).append(i)
    counters = {}
    for p in points:
        k = text_key(p["text"])
        n = counters.get(k, 0)
        counters[k] = n + 1
        idxs = by_key.get(k, [])
        if n >= len(idxs):
            discrepancies.append({
                "topic": topic["name"], "kind": "point-only-in-jsonl",
                "point": p["text"],
                "jsonlRefs": sorted(fmt_span(s) for s in
                                    spans_from_asserts(p["_entry"])),
            })
            continue
        i = idxs[n]
        used[i] = True
        ctext, cspans, cproblems = cps[i]
        jspans = spans_from_asserts(p["_entry"])
        for pr in cproblems:
            if pr.startswith("cross-chapter"):
                continue  # jsonl side also queues these; not a witness clash
            discrepancies.append({
                "topic": topic["name"], "kind": "ccel-ref-unparsed",
                "point": p["text"], "detail": pr})
        if expand(jspans) != expand(cspans):
            only_j = expand(jspans) - expand(cspans)
            only_c = expand(cspans) - expand(jspans)
            if not only_j and not only_c:
                pass
            else:
                discrepancies.append({
                    "topic": topic["name"], "kind": "ref-mismatch",
                    "point": p["text"],
                    "jsonlRefs": sorted(fmt_span(s) for s in jspans),
                    "ccelRefs": sorted(fmt_span(s) for s in cspans),
                    "onlyJsonl": sorted(f"{b} {c}:{v}" if b != "CHAPTER"
                                        else f"{c} ch{v}" for b, c, v in only_j),
                    "onlyCcel": sorted(f"{b} {c}:{v}" if b != "CHAPTER"
                                       else f"{c} ch{v}" for b, c, v in only_c),
                })
    for i, u in enumerate(used):
        if not u:
            t, sp, _pr = cps[i]
            discrepancies.append({
                "topic": topic["name"], "kind": "point-only-in-ccel",
                "point": t, "ccelRefs": sorted(fmt_span(s) for s in sp)})


# ------------------------------------------------------------------- main
def main():
    matched, unmatched = match_miller()
    segs = ccel_segments()
    seg_by_key = {}
    for t, (heading, lines) in zip(TOPIC_TABLE, segs):
        assert norm_heading(heading) == norm_heading(t["ccelHeading"]), (
            t["name"], heading)
        seg_by_key[t["key"]] = lines

    review_queue = []
    discrepancies = []
    out_topics = []
    n_points = n_refs = 0

    for miller_heading, topic in matched.items():
        points = build_points(topic, review_queue)
        cross_check(topic, points, seg_by_key[topic["key"]], discrepancies)
        clean_points = []
        for p in points:
            clean_points.append({"text": p["text"], "parents": p["parents"],
                                 "refs": p["refs"]})
            n_points += 1
            n_refs += len(p["refs"])
        rec = {
            "torreyTopic": topic["name"],
            "millerHeading": miller_heading,
            "points": clean_points,
        }
        if topic["note"]:
            rec["witnessNote"] = topic["note"]
        out_topics.append(rec)

    out_topics.sort(key=lambda t: t["torreyTopic"])
    review_queue.sort(key=lambda r: (r["topic"], r["point"], r["raw"],
                                     r["reason"]))
    discrepancies.sort(key=lambda d: (d["topic"], d["kind"],
                                      d.get("point", "")))

    flagged_raw_refs = len([r for r in review_queue
                            if r["reason"] != "witness-errata-correction-applied"])
    stats = {
        "millerHeadings": 313,
        "millerHeadingsMatched": len(matched),
        "millerHeadingsUnmatched": sorted(unmatched),
        "torreyTopicsInDataset": len(out_topics),
        "pointsTotal": n_points,
        "refsTotal": n_refs + flagged_raw_refs,
        "refsValid": n_refs,
        "refsFlaggedToReviewQueue": flagged_raw_refs,
        "reviewQueueItems": len(review_queue),
        "discrepancies": len(discrepancies),
        "discrepancyKinds": {},
    }
    for d in discrepancies:
        stats["discrepancyKinds"][d["kind"]] = \
            stats["discrepancyKinds"].get(d["kind"], 0) + 1

    def dump(name, obj):
        with open(f"{OUT}/{name}", "w", encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False, indent=2, sort_keys=True)
            f.write("\n")

    os.makedirs(OUT, exist_ok=True)
    dump("torrey-miller-topics.json", out_topics)
    dump("stats.json", stats)
    dump("review-queue.json", review_queue)
    dump("discrepancies.json", discrepancies)
    print(json.dumps(stats, indent=2, sort_keys=True))


if __name__ == "__main__":
    sys.exit(main())
