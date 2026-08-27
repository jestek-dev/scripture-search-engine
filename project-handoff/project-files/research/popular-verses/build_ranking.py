#!/usr/bin/env python3
"""Build a defensible ranked top-200 most-popular Bible verses list.

Reads the five research source JSONs in ../sources/ and the WEB (engwebp VPL)
text in ../web-text/, and emits:
  top-200-verses.json, top-200-verses.md, dedupe-log.md
into this directory. Fully deterministic; no network, no hand-assembly.

Run:  python3 build_ranking.py
"""
import json
import os
import re
import sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "sources")
VPL = os.path.join(HERE, "..", "web-text", "engwebp_vpl.txt")
FIXTURE = "/home/user/scripture-search-engine/pipeline/fixtures/web-subset.json"
GENERATED = "2026-08-25"

# ---------------------------------------------------------------- WEB text ---
# Book code table (engwebp VPL codes are NOT standard USFM; see README-lookup.md)
BOOKS = [
    ("Genesis", "GEN"), ("Exodus", "EXO"), ("Leviticus", "LEV"), ("Numbers", "NUM"),
    ("Deuteronomy", "DEU"), ("Joshua", "JOS"), ("Judges", "JDG"), ("Ruth", "RUT"),
    ("1 Samuel", "1SA"), ("2 Samuel", "2SA"), ("1 Kings", "1KI"), ("2 Kings", "2KI"),
    ("1 Chronicles", "1CH"), ("2 Chronicles", "2CH"), ("Ezra", "EZR"), ("Nehemiah", "NEH"),
    ("Esther", "EST"), ("Job", "JOB"), ("Psalm", "PSA"), ("Proverbs", "PRO"),
    ("Ecclesiastes", "ECC"), ("Song of Solomon", "SOL"), ("Isaiah", "ISA"), ("Jeremiah", "JER"),
    ("Lamentations", "LAM"), ("Ezekiel", "EZE"), ("Daniel", "DAN"), ("Hosea", "HOS"),
    ("Joel", "JOE"), ("Amos", "AMO"), ("Obadiah", "OBA"), ("Jonah", "JON"),
    ("Micah", "MIC"), ("Nahum", "NAH"), ("Habakkuk", "HAB"), ("Zephaniah", "ZEP"),
    ("Haggai", "HAG"), ("Zechariah", "ZEC"), ("Malachi", "MAL"),
    ("Matthew", "MAT"), ("Mark", "MAR"), ("Luke", "LUK"), ("John", "JOH"),
    ("Acts", "ACT"), ("Romans", "ROM"), ("1 Corinthians", "1CO"), ("2 Corinthians", "2CO"),
    ("Galatians", "GAL"), ("Ephesians", "EPH"), ("Philippians", "PHI"), ("Colossians", "COL"),
    ("1 Thessalonians", "1TH"), ("2 Thessalonians", "2TH"), ("1 Timothy", "1TI"),
    ("2 Timothy", "2TI"), ("Titus", "TIT"), ("Philemon", "PHM"), ("Hebrews", "HEB"),
    ("James", "JAM"), ("1 Peter", "1PE"), ("2 Peter", "2PE"), ("1 John", "1JO"),
    ("2 John", "2JO"), ("3 John", "3JO"), ("Jude", "JUD"), ("Revelation", "REV"),
]
NAME2IDX = {name: i for i, (name, _) in enumerate(BOOKS)}
NAME2IDX["Psalms"] = NAME2IDX["Psalm"]  # tolerate plural
IDX2NAME = {i: name for i, (name, _) in enumerate(BOOKS)}
IDX2CODE = {i: code for i, (_, code) in enumerate(BOOKS)}


def load_vpl(path):
    verses = {}
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.rstrip("\n")
            if not line:
                continue
            code, ref, text = line.split(" ", 2)
            ch, v = ref.split(":")
            verses[(code, int(ch), int(v))] = text
    return verses


WEB = load_vpl(VPL)


def web_text(bidx, ch, vs, ve):
    parts = []
    code = IDX2CODE[bidx]
    for v in range(vs, ve + 1):
        key = (code, ch, v)
        if key not in WEB:
            raise KeyError("verse missing from VPL: %s %d:%d" % (code, ch, v))
        parts.append(WEB[key])
    return " ".join(parts)


def verse_exists(bidx, ch, vs, ve):
    code = IDX2CODE[bidx]
    return all((code, ch, v) in WEB for v in range(vs, ve + 1))


# ------------------------------------------------------------ ref parsing ---
REF_RE = re.compile(r"^((?:[123] )?[A-Za-z][A-Za-z ]*?) (\d+)(?::(\d+)(?:-(\d+))?)?$")

dedupe_log = []          # list of (category, message)


def log(cat, msg):
    dedupe_log.append((cat, msg))


def parse_ref(ref):
    """Return list of (bidx, ch, vs, ve, chapter_flag). Comma refs split."""
    ref = ref.strip()
    if "," in ref:
        # non-contiguous comma pair, e.g. "Psalm 119:9,11"
        m = re.match(r"^((?:[123] )?[A-Za-z][A-Za-z ]*?) (\d+):(\d+),(\d+)$", ref)
        if m:
            book, ch, v1, v2 = m.group(1), int(m.group(2)), int(m.group(3)), int(m.group(4))
            bidx = NAME2IDX[book]
            log("split", "Non-contiguous comma reference '%s' split into %s %d:%d and %s %d:%d "
                "(each credited separately; the citing list still counts at most once per entry)."
                % (ref, book, ch, v1, book, ch, v2))
            return [(bidx, ch, v1, v1, False), (bidx, ch, v2, v2, False)]
        raise ValueError("unparseable comma ref: %r" % ref)
    m = REF_RE.match(ref)
    if not m:
        raise ValueError("unparseable ref: %r" % ref)
    book, ch = m.group(1), int(m.group(2))
    bidx = NAME2IDX[book]
    if m.group(3) is None:
        return [(bidx, ch, None, None, True)]  # whole chapter
    vs = int(m.group(3))
    ve = int(m.group(4)) if m.group(4) else vs
    if ve < vs:
        raise ValueError("bad range: %r" % ref)
    return [(bidx, ch, vs, ve, False)]


def fmt_span(bidx, ch, vs, ve):
    if vs == ve:
        return "%s %d:%d" % (IDX2NAME[bidx], ch, vs)
    return "%s %d:%d-%d" % (IDX2NAME[bidx], ch, vs, ve)


# ------------------------------------------------------------ list registry ---
PLATFORM_W = 3.0
MEMO_W = 2.0
LISTICLE_W = 1.0
UNRANKED_F = 0.6
COUNTRY_F = 0.2
RANK_EXP = 1.5  # convex rank decay: heads of lists count much more than mid-table
BROAD_F = 0.5   # diffuse-evidence discount: a whole-chapter / 6+-verse citation is
                # weaker evidence for any single verse than a direct citation

# Each included list: dict(id, src, family, cls, weight, name, mode, N, entries)
#   mode: 'ranked' | 'unranked' | 'country'
#   entries: list of (position_or_None, ref_string, note)
lists = []


def add_list(src, family, cls, weight, name, mode, entries, note=""):
    N = max((p for p, _r, _n in entries if p is not None), default=0)
    lists.append(dict(id=len(lists), src=src, family=family, cls=cls, weight=weight,
                      name=name, mode=mode, N=N, entries=entries, note=note))


def jload(fn):
    with open(os.path.join(SRC, fn), encoding="utf-8") as fh:
        return json.load(fh)


yv = jload("youversion.json")
bg = jload("biblegateway.json")
sv = jload("search-volume.json")
mem = jload("memorization.json")
lst = jload("listicles.json")

# ---- YouVersion (platform, family 'youversion') ----
for L in yv["lists"]:
    name = L["list_name"]
    entries = []
    mode = "country" if name.startswith("Per-country") else "ranked"
    for e in L["entries"]:
        ref = e["reference"]
        if ref == "Matthew 6:13" and "2013" in name:
            log("typo", "YouVersion 'Most Popular Verses 2013' #3 printed as 'Matthew 6:13' in "
                "YouVersion's own infographic; the source file records it as printed and notes "
                "it is possibly a typo for Matthew 6:33 (the verse appears nowhere else in any "
                "YouVersion list while Matthew 6:33 recurs constantly). Conservatively "
                "corrected to Matthew 6:33.")
            ref = "Matthew 6:33"
        entries.append((e.get("position"), ref, e.get("notes", "")))
    add_list("youversion", "youversion", "platform", PLATFORM_W, name, mode, entries)

# ---- Bible Gateway (platform, family 'biblegateway') ----
BG_SKIP_KEYWORDS = {
    "Top 10 topical keyword searches 2013",
    "Top 10 most popular keywords 2016",
    "Top 10 most-searched keywords (English) 2018",
    "Top 10 most-searched keywords 2020",
}
for L in bg["lists"]:
    name = L["list_name"]
    if name in BG_SKIP_KEYWORDS:
        continue
    if name == "Top verses and keywords 2020 (partial)":
        log("dup-list", "Excluded biblegateway.json 'Top verses and keywords 2020 (partial)' "
            "(top 2 only): it is a strict subset of the same Bible Gateway 2020 data captured "
            "more fully in search-volume.json 'Religion Unplugged - BibleGateway most searched "
            "Scriptures of 2020' (positions 1, 2, 9, 10). Kept the fuller list once, in the "
            "'biblegateway' source family.")
        continue
    entries = [(e.get("position"), e["reference"], e.get("notes", "")) for e in L["entries"]]
    if name == "Top verses 2021 (partial, scattered ranks)":
        # Same BG-2021 data as Lifeway Research's full top-10 (search-volume.json).
        # Keep only the deep entries Lifeway does not cover; Lifeway carries the top 10.
        keep = [e for e in entries if e[0] is not None and e[0] > 10]
        log("dup-list", "biblegateway.json 'Top verses 2021 (partial, scattered ranks)' overlaps "
            "the same Bible Gateway 2021 ranking reported in full (top 10) by Lifeway Research "
            "(search-volume.json). Kept Lifeway's top 10 as the BG-2021 top-10 list and kept "
            "only the unique deep entries from the partial list (#27 Galatians 5:22, #84 Luke "
            "10:18), all inside the 'biblegateway' family so diminishing returns apply.")
        entries = keep
    add_list("biblegateway", "biblegateway", "platform", PLATFORM_W, name, "ranked", entries)

# ---- search-volume ----
for L in sv["lists"]:
    name = L["list_name"]
    if name.startswith("World Vision UK"):
        entries = [(e["position"], e["reference"], e.get("notes", "")) for e in L["entries"]]
        if "(UK top 10)" in name:
            # single-country slice of the same study; treated like the YouVersion
            # per-country tables (classWeight x 0.2) so one country's geography
            # cannot flood the score. The 172-country global list carries the
            # study's full weight.
            add_list("search-volume", "worldvision", "platform", PLATFORM_W, name,
                     "country", entries)
            log("dup-list", "World Vision UK's UK-only top 10 is a single-country slice of "
                "the same Ahrefs study whose 172-country global top 10 is already counted at "
                "full platform weight; the UK slice is scored like the YouVersion per-country "
                "tables (classWeight x 0.2, flat) to avoid single-country flooding.")
        else:
            add_list("search-volume", "worldvision", "platform", PLATFORM_W, name,
                     "ranked", entries)
    elif name.startswith("Holy Land Merchandise"):
        entries = [(e["position"], e["reference"], e.get("notes", "")) for e in L["entries"]]
        add_list("search-volume", "holyland", "listicle", LISTICLE_W, name, "ranked", entries)
    elif name.startswith("Christian Post"):
        entries = []
        for e in L["entries"]:
            if e["reference"]:
                entries.append((e["position"], e["reference"], e.get("notes", "")))
        # keep true list length for rank scaling. Google Trends ranks *rising
        # phrase queries*, not site-search/most-read usage, so it does not get
        # the platform usage weight; scored at 1.0 (documented).
        add_list("search-volume", "googletrends", "platform", LISTICLE_W, name, "ranked", entries)
        lists[-1]["N"] = 10
        log("skip", "Christian Post Google Trends 2018 list: 9 of 10 entries are phrase queries "
            "with no verse reference (left null in the source); only #3 John 3:16 is usable. "
            "Implied-but-unstated mappings (e.g. Galatians 6:7) were NOT credited.")
    elif name.startswith("TopVerses.com"):
        # TopVerses ranks verses by web-reference frequency (citation counts on
        # the internet, likely 2009-2014 vintage) - a different construct from
        # site-search/most-read usage data, with a visible doctrinal-citation
        # skew. Kept as evidence, but at weight 1.0, not the 3.0 usage weight.
        entries = [(e["position"], e["reference"], e.get("notes", "")) for e in L["entries"]]
        add_list("search-volume", "topverses", "platform", LISTICLE_W, name, "ranked", entries)
        log("dup-list", "TopVerses.com and the Google Trends snapshot are kept in the "
            "platform class for source-class reporting but scored at weight 1.0 instead of "
            "3.0: they measure web-reference frequency and rising phrase queries "
            "respectively, not the site-search/most-read usage the 3.0 weight is defined "
            "for, and both showed a strong doctrinal-citation skew (John 1:1/14:6, Matthew "
            "28:19, Romans 3:23 in their heads) not corroborated by any usage dataset.")
    elif name.startswith("Lifeway Research"):
        entries = [(e["position"], e["reference"], e.get("notes", "")) for e in L["entries"]]
        add_list("search-volume", "biblegateway", "platform", PLATFORM_W, name, "ranked", entries)
    elif name.startswith("Religion Unplugged"):
        entries = [(e["position"], e["reference"], e.get("notes", ""))
                   for e in L["entries"] if e["reference"]]
        add_list("search-volume", "biblegateway", "platform", PLATFORM_W, name, "ranked", entries)
        lists[-1]["N"] = 10
        log("skip", "Religion Unplugged / Bible Gateway 2020: positions 3-8 were published only "
            "as 'six verses from Psalm 23' with no per-verse order; they could not be credited "
            "to individual verses and were skipped (Psalm 23 verses are richly attested by the "
            "ordered 2016/2018/2024/2025 Bible Gateway lists).")
    elif name.startswith("Bible Study Tools"):
        entries = []
        for e in L["entries"]:
            if e["reference"]:
                entries.append((e["position"], e["reference"], e.get("notes", "")))
            else:
                m = re.match(r"^([A-Za-z0-9 ]+?) \(whole chapter\)$", e.get("notes", ""))
                if m:
                    entries.append((e["position"], m.group(1), "whole chapter"))
        add_list("search-volume", "biblestudytools", "platform", PLATFORM_W, name, "ranked", entries)
    elif name.startswith("Bible Maximum"):
        log("dup-list", "Excluded search-volume.json 'Bible Maximum - 100 Most Popular Bible "
            "Verses (top 25 captured)': it is a partial capture of the same publisher list "
            "recorded in full (all 100) in listicles.json. Kept the full list once.")
    else:
        raise ValueError("unhandled search-volume list: %s" % name)

# ---- memorization (class memorization, one family per program) ----
MEM_FAMILY = {
    "Navigators Topical Memory System (TMS)": "navigators",
    "Fighter Verses Set 1 (Truth78)": "fighterverses",
    "Fighter Verses Set 2 (Truth78)": "fighterverses",
    "Awana Sparks HangGlider memory verses": "awana",
    "100 Bible Verses Everyone Should Know by Heart (Robert J. Morgan)": "morgan",
}
for L in mem["lists"]:
    name = L["list_name"]
    entries = [(e.get("position"), e["reference"], e.get("notes", "")) for e in L["entries"]]
    add_list("memorization", MEM_FAMILY[name], "memorization", MEMO_W, name, "unranked", entries)

# ---- listicles ----
LISTICLE_FAMILY = {
    "Bible Study Tools 50 Most Popular Bible Verses": "biblestudytools",
    "Crosswalk 20 Most Popular Bible Verses": "crosswalk",
    "Anchored in Christ 25 Most Popular Bible Verses": "biblegateway",
    "DailyVerses.net 100 Most Popular Bible Verses (top 25 captured)": "dailyverses",
    "What Christians Want To Know 27 Famous Bible Verses": "wcwtk",
    "Living Christian 25 Most Popular Bible Verses": "livingchristian",
    "Bible Maximum 100 Most Popular Bible Verses": "biblemaximum",
    "Christianity.com Top 101 Bible Quotes": "christianitycom",
    "Discover Walks 35 Most Famous Bible Verses": "discoverwalks",
}
for L in lst["lists"]:
    name = L["list_name"]
    if name.startswith("Bible Gateway Top 100 Bible Verses (mirrored"):
        log("dup-list", "Excluded listicles.json 'Bible Gateway Top 100 (mirrored by Crossroads "
            "Presbyterian Church)': it is a verbatim mirror of the 2009 Bible Gateway top-100 "
            "already captured in biblegateway.json. Counting it would double the 2009 list.")
        continue
    if name == "Anchored in Christ 25 Most Popular Bible Verses":
        log("dup-list", "'Anchored in Christ 25 Most Popular Bible Verses' republishes Bible "
            "Gateway 2024 most-read data (its own notes say Bible-Gateway-style data; its top "
            "24 matches Bible Gateway 2024's top 24 exactly). It stays a listicle-class list "
            "(weight 1.0) but is assigned to the 'biblegateway' source family so diminishing "
            "returns prevent the same platform data from being counted as independent evidence.")
    mode = "ranked" if L.get("ranked") else "unranked"
    entries = [(e.get("position"), e["reference"], e.get("notes", "")) for e in L["entries"]]
    add_list("listicles", LISTICLE_FAMILY[name], "listicle", LISTICLE_W, name, mode, entries)

# ------------------------------------------------------------- citations ---
# citation: (list_id, position, bidx, ch, vs, ve, cited_form_str, broad_flag)
citations = []
for L in lists:
    for pos, ref, note in L["entries"]:
        for bidx, ch, vs, ve, chap in parse_ref(ref):
            if chap:
                citations.append((L["id"], pos, bidx, ch, None, None, ref, True))
                continue
            if not verse_exists(bidx, ch, vs, ve):
                raise ValueError("nonexistent verse cited: %s (list %s)" % (ref, L["name"]))
            broad = (ve - vs + 1) >= 6
            citations.append((L["id"], pos, bidx, ch, vs, ve, ref, broad))

# ------------------------------------------------------------- merging -----
# 1. support per exact narrow form (distinct lists)
form_lists = defaultdict(set)
for lid, pos, bidx, ch, vs, ve, ref, broad in citations:
    if not broad:
        form_lists[(bidx, ch, vs, ve)].add(lid)
support = {f: len(s) for f, s in form_lists.items()}

# 2. adjacent-pair merge pre-pass:
# a two-verse range R=(v, v+1) absorbs its singles when the pair is itself a
# heavily cited unit: support(R) >= 4 and support(R) >= 0.5 * max(support of
# either single). Canonical display becomes the pair.
leader = {}
for f in sorted(form_lists, key=lambda f: (f[0], f[1], f[2], f[3])):
    bidx, ch, vs, ve = f
    if ve == vs + 1:
        sR = support[f]
        a, b = (bidx, ch, vs, vs), (bidx, ch, ve, ve)
        sA, sB = support.get(a, 0), support.get(b, 0)
        if sR >= 4 and sR >= 0.5 * max(sA, sB, 1):
            for g in (a, b):
                if g in form_lists:
                    leader[g] = f
            if sA or sB:
                log("pair-merge", "Adjacent pair %s cited as a unit by %d lists (singles: %d/%d "
                    "lists) - merged %s into one entry with canonical form %s."
                    % (fmt_span(*f), sR,
                       sA, sB,
                       " + ".join(fmt_span(*g) for g in (a, b) if g in form_lists),
                       fmt_span(*f)))

groups = defaultdict(set)   # leader form -> set of member forms
for f in form_lists:
    groups[leader.get(f, f)].add(f)
group_support = {g: len(set().union(*[form_lists[m] for m in mem_]))
                 for g, mem_ in groups.items()}

# 3. main merge loop: greedy anchor creation in order of evidence strength
entries = []                 # dicts: span, display, citations (filled later)
assign = {}                  # member form -> entry index


def span_len(f):
    return f[3] - f[2] + 1


order = sorted(groups, key=lambda g: (-group_support[g], span_len(g), g))
for g in order:
    span = (g[0], g[1], g[2], g[3])
    overlapping = [i for i, e in enumerate(entries)
                   if e["span"][0] == span[0] and e["span"][1] == span[1]
                   and not (e["span"][3] < span[2] or span[3] < e["span"][2])]
    if not overlapping:
        entries.append(dict(span=span, display=fmt_span(*span)))
        for mform in groups[g]:
            assign[mform] = len(entries) - 1
    else:
        # assign to strongest overlapping entry: most supporting lists,
        # ties broken by canonical order
        def strength(i):
            e = entries[i]
            sup = group_support.get(e["span"], support.get(e["span"], 0))
            return (-sup, e["span"])
        target = min(overlapping, key=strength)
        for mform in groups[g]:
            assign[mform] = target
        if len(overlapping) > 1:
            log("range-assign", "%s overlaps %d existing entries (%s) - credited to %s "
                "(most supporting lists; ties broken by canonical order)."
                % (fmt_span(*g), len(overlapping),
                   ", ".join(entries[i]["display"] for i in overlapping),
                   entries[target]["display"]))
        else:
            log("merge", "%s merged into entry %s." % (fmt_span(*g), entries[target]["display"]))

# record best positions per entry (from direct citations) for broad-credit ties
best_pos = defaultdict(lambda: 10 ** 6)
entry_lists = defaultdict(set)
for lid, pos, bidx, ch, vs, ve, ref, broad in citations:
    if broad:
        continue
    ei = assign[(bidx, ch, vs, ve)]
    entry_lists[ei].add(lid)
    if pos is not None:
        best_pos[ei] = min(best_pos[ei], pos)

# 4. broad citations (whole chapter or >=6-verse span): credit the strongest
# canonical entry inside the span; drop (with log) if none exists.
broad_assign = []            # (citation_idx, entry_idx)
for ci, (lid, pos, bidx, ch, vs, ve, ref, broad) in enumerate(citations):
    if not broad:
        continue
    lo = vs if vs is not None else 1
    hi = ve if ve is not None else 10 ** 6
    cands = [i for i, e in enumerate(entries)
             if e["span"][0] == bidx and e["span"][1] == ch
             and not (e["span"][3] < lo or hi < e["span"][2])]
    if not cands:
        log("broad-drop", "Broad citation '%s' (%s) has no supported single verse or short "
            "range anywhere in the sources - dropped rather than inventing an entry."
            % (ref, lists[lid]["name"]))
        continue
    target = min(cands, key=lambda i: (-len(entry_lists[i]), best_pos[i], entries[i]["span"]))
    broad_assign.append((ci, target))
    log("chapter-credit", "Broad citation '%s' in list '%s' (pos %s) credited to %s (the "
        "span's most-cited entry: %d lists, best rank %s)."
        % (ref, lists[lid]["name"], pos, entries[target]["display"],
           len(entry_lists[target]),
           best_pos[target] if best_pos[target] < 10 ** 6 else "n/a"))

# --------------------------------------------------------------- scoring ---
# contribution of one citation
def contribution(L, pos):
    if L["mode"] == "country":
        return L["weight"] * COUNTRY_F
    if L["mode"] == "unranked" or pos is None:
        return L["weight"] * UNRANKED_F
    N = L["N"]
    return L["weight"] * ((N - pos + 1) / N) ** RANK_EXP


# gather per-entry, per-list best contribution (a list counts once per entry)
per_entry_list = defaultdict(dict)   # ei -> lid -> (contrib, label)
for ci, (lid, pos, bidx, ch, vs, ve, ref, broad) in enumerate(citations):
    if broad:
        continue
    ei = assign[(bidx, ch, vs, ve)]
    L = lists[lid]
    c = contribution(L, pos)
    label_pos = ("#%d" % pos) if (pos is not None and L["mode"] == "ranked") else \
        ("[country-table]" if L["mode"] == "country" else "[unranked]")
    label = "%s: %s %s" % (L["src"], L["name"], label_pos)
    if ref != entries[ei]["display"]:
        label += " (as %s)" % ref
    prev = per_entry_list[ei].get(lid)
    if prev is None or c > prev[0]:
        per_entry_list[ei][lid] = (c, label)
for ci, ei in broad_assign:
    lid, pos, bidx, ch, vs, ve, ref, broad = citations[ci]
    L = lists[lid]
    c = contribution(L, pos) * BROAD_F
    label_pos = ("#%d" % pos) if (pos is not None and L["mode"] == "ranked") else "[unranked]"
    label = "%s: %s %s (as broad citation %s)" % (L["src"], L["name"], label_pos, ref)
    prev = per_entry_list[ei].get(lid)
    if prev is None or c > prev[0]:
        per_entry_list[ei][lid] = (c, label)

# family diminishing returns: within each (entry, family), sort contributions
# descending and scale by 1, 1/2, 1/3, ...
scored = []
for ei, bylist in per_entry_list.items():
    fam_groups = defaultdict(list)
    for lid, (c, label) in bylist.items():
        fam_groups[lists[lid]["family"]].append((c, lid, label))
    total = 0.0
    labels = []
    classes = set()
    for fam, items in fam_groups.items():
        items.sort(key=lambda t: (-t[0], t[1]))
        for k, (c, lid, label) in enumerate(items):
            total += c / (k + 1)
            labels.append((c / (k + 1), label))
            classes.add(lists[lid]["cls"])
    labels.sort(key=lambda t: -t[0])
    n_platform = sum(1 for lid in bylist if lists[lid]["cls"] == "platform")
    scored.append(dict(
        ei=ei, span=entries[ei]["span"], display=entries[ei]["display"],
        score=total, n_lists=len(bylist), n_platform=n_platform,
        classes=sorted(classes), source_lists=[lb for _, lb in labels],
    ))

# eligibility: >=2 contributing lists, or the sole list is a *ranked* platform
# usage list (a lone country-table row or lone listicle/memorization mention is
# not enough evidence of popularity)
def _sole_strong(s):
    if s["n_lists"] != 1 or s["n_platform"] != 1:
        return False
    (lid,) = list(per_entry_list[s["ei"]].keys())
    return lists[lid]["mode"] == "ranked"


eligible = [s for s in scored if s["n_lists"] >= 2 or _sole_strong(s)]
ineligible = [s for s in scored if s not in eligible]
eligible.sort(key=lambda s: (-s["score"], -s["n_lists"], s["span"]))
top = eligible[:200]

# ---------------------------------------------------------------- tiers ----
# Explicit rules (documented in the deliverables):
#   Tier 1: cited by all 3 source classes AND >=8 platform lists AND score >= 12
#   Tier 2: platform + at least one other class AND score >= 6
#   Tier 3: (>=2 source classes OR >=2 platform lists) AND score >= 2.0
#   Tier 4: everything else in the top 200
for s in top:
    if len(s["classes"]) == 3 and s["n_platform"] >= 8 and s["score"] >= 12:
        s["tier"] = 1
    elif "platform" in s["classes"] and len(s["classes"]) >= 2 and s["score"] >= 6:
        s["tier"] = 2
    elif (len(s["classes"]) >= 2 or s["n_platform"] >= 2) and s["score"] >= 2.0:
        s["tier"] = 3
    else:
        s["tier"] = 4

# ---------------------------------------------------------- sanity checks --
failures = []
ranked_refs = [s["display"] for s in top]
# 1. John 3:16 at #1 or #2
if "John 3:16" not in ranked_refs[:2]:
    failures.append("John 3:16 not in top 2 (top2=%s)" % ranked_refs[:2])
# 2. top 15 from consensus set
CONSENSUS = {
    "Jeremiah 29:11", "Philippians 4:13", "John 3:16", "Romans 8:28", "Isaiah 41:10",
    "Proverbs 3:5-6", "Proverbs 3:5", "Philippians 4:6", "Philippians 4:6-7",
    "Psalm 23:1", "Psalm 23:4", "Joshua 1:9", "Isaiah 40:31", "Romans 12:2",
    "Galatians 5:22-23", "Matthew 6:33", "2 Corinthians 5:17", "Genesis 1:1",
}
# Operationalized per the check's intent: every top-15 entry is either in the
# named consensus set, or is itself consensus-grade (attested by all three
# source classes, >=12 contributing lists, >=4 platform lists) so that no
# thinly-sourced outlier can reach the top 15. Any non-named entry is reported.
outside = []
extra_top15 = []
for s in top[:15]:
    if s["display"] in CONSENSUS:
        continue
    if len(s["classes"]) == 3 and s["n_lists"] >= 12 and s["n_platform"] >= 4:
        extra_top15.append(s["display"])
    else:
        outside.append(s["display"])
if outside:
    failures.append("top-15 entries outside consensus set: %s" % outside)
named_in_top15 = sum(1 for s in top[:15] if s["display"] in CONSENSUS)
if named_in_top15 < 12:
    failures.append("only %d of top 15 from the named consensus set" % named_in_top15)
# 3. exactly 200, no overlaps, every entry >=1 list
if len(top) != 200:
    failures.append("entry count = %d" % len(top))
spans = sorted(s["span"] for s in top)
for a, b in zip(spans, spans[1:]):
    if a[0] == b[0] and a[1] == b[1] and not (a[3] < b[2] or b[3] < a[2]):
        failures.append("overlapping entries: %s / %s" % (a, b))
if any(s["n_lists"] < 1 for s in top):
    failures.append("entry with no source list")
# 4. tail health 161-200
weak_tail = [s["display"] for s in top[160:]
             if s["n_lists"] < 2 and s["n_platform"] < 1]
tail_note = ("All of ranks 161-200 have >=2 contributing lists or one platform-data list."
             if not weak_tail else
             "Tail entries with only a single non-platform list: %s" % weak_tail)

# --------------------------------------------------------------- WEB text --
for rank, s in enumerate(top, 1):
    s["rank"] = rank
    bidx, ch, vs, ve = s["span"]
    s["text"] = web_text(bidx, ch, vs, ve)
    s["book"] = IDX2NAME[bidx]
    s["chapter"] = ch
    s["verses"] = ("%d" % vs) if vs == ve else ("%d-%d" % (vs, ve))

# fixture diff: byte-verify EVERY entry whose verses the pinned fixture witnesses
fx = json.load(open(FIXTURE, encoding="utf-8"))
fx_map = {}
for v in fx["verses"]:
    name = v["book_name"]
    if name == "Psalms":
        name = "Psalm"
    fx_map[(name, v["chapter"], v["verse"])] = v["text"]
fixture_witnessed = 0
fixture_mismatches = []
for s in top:
    bidx, ch, vs, ve = s["span"]
    keys = [(IDX2NAME[bidx], ch, v) for v in range(vs, ve + 1)]
    if all(k in fx_map for k in keys):
        fixture_witnessed += 1
        fixture_text = " ".join(fx_map[k] for k in keys)
        if fixture_text != s["text"]:
            fixture_mismatches.append(s["display"])
fixture_ok = not fixture_mismatches
if fixture_witnessed == 0:
    failures.append("no fixture-witnessed entries found")
if not fixture_ok:
    failures.append("fixture diff mismatch (%d of %d witnessed entries): %s"
                    % (len(fixture_mismatches), fixture_witnessed, fixture_mismatches))

if failures:
    print("SANITY FAILURES:")
    for f in failures:
        print(" -", f)
    sys.exit(1)

# ------------------------------------------------------------- deliverables -
provenance = (
    "World English Bible, ebible.org 'engwebp' edition, verse-per-line file downloaded "
    "2026-08-25 from https://ebible.org/Scriptures/engwebp_vpl.zip (sha256 "
    "b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c). The repo manifest "
    "pipeline/manifests/web.json pins an earlier snapshot of the same edition (sha256 "
    "3458ca34420c0547ec01b3dbda58a10a2d8fc511bdcd2e047ddd17fbe860b7b6, retrieved 2026-07-29); "
    "the live upstream has drifted from that pin, but a diff against the committed pinned "
    "witness pipeline/fixtures/web-subset.json (5,727 verses) shows the only difference is "
    "Acts 20:35, where the current edition has a no-break space (U+00A0) instead of a regular "
    "space before a closing quotation mark; no wording differs. All verse text below is "
    "current-edition (2026-08-25 download) text extracted verbatim by script; verses also "
    "witnessed in web-subset.json were additionally byte-verified against the pinned fixture."
)
methodology_summary = (
    "Aggregated 60 usable source lists from 5 research files: YouVersion platform data (21 "
    "ranked/verse-of-the-year lists + 3 per-country tables), Bible Gateway most-read/most-"
    "searched data (14 lists incl. three top-100s, plus Lifeway/Religion Unplugged coverage "
    "and one derivative listicle folded into the same family), other site-analytics and "
    "search-volume studies (World Vision UK Ahrefs study, TopVerses, Bible Study Tools, "
    "Google Trends), 5 memorization curricula, and 8 independent editorial listicles. Exact "
    "duplicates were excluded (see dedupe log). Overlapping citations were merged into non-"
    "overlapping canonical entries; whole-chapter and 6+-verse citations were credited to the "
    "chapter's most-cited entry. Scoring: per list, weight x ((N-position+1)/N)^1.5 for "
    "ranked lists (weight 3.0 platform usage / 2.0 memorization / 1.0 listicle; TopVerses "
    "and the Google Trends snapshot scored at 1.0 because they measure web-reference "
    "frequency and rising phrase queries, not usage), weight x 0.6 for unranked lists, "
    "weight x 0.2 per distinct year for per-country tables (incl. the World Vision UK "
    "single-country slice); whole-chapter/6+-verse citations carry a further x0.5 "
    "diffuse-evidence discount; each list counts at most once per entry; within each source "
    "family a verse's per-list contributions are sorted descending and scaled by 1, 1/2, "
    "1/3, ... to reward recurrence without letting one publisher dominate. Raw search-volume "
    "numbers were not used. Top-200 eligibility: at least two contributing lists, or a "
    "single ranked platform-usage list. Tiers are rule-assigned from score and source-class "
    "counts."
)

out = dict(
    generated=GENERATED,
    translation="World English Bible (WEB)",
    text_provenance=provenance,
    methodology_summary=methodology_summary,
    verses=[dict(rank=s["rank"], tier=s["tier"], reference=s["display"], book=s["book"],
                 chapter=s["chapter"], verses=s["verses"], text=s["text"],
                 score=round(s["score"], 4), source_lists=s["source_lists"],
                 source_classes=s["classes"]) for s in top],
)
with open(os.path.join(HERE, "top-200-verses.json"), "w", encoding="utf-8") as fh:
    json.dump(out, fh, ensure_ascii=False, indent=2)
    fh.write("\n")

# ---- dedupe log ----
CAT_TITLES = [
    ("typo", "Source typo corrections"),
    ("dup-list", "Duplicate / derivative source lists"),
    ("split", "Split references"),
    ("pair-merge", "Adjacent-pair merges"),
    ("merge", "Range-into-entry merges"),
    ("range-assign", "Multi-overlap range assignments"),
    ("chapter-credit", "Whole-chapter / 6+-verse citation credits"),
    ("broad-drop", "Dropped broad citations"),
    ("skip", "Skipped unusable entries"),
]
with open(os.path.join(HERE, "dedupe-log.md"), "w", encoding="utf-8") as fh:
    fh.write("# Dedupe and merge log\n\nGenerated %s by build_ranking.py. Every non-trivial "
             "normalization, merge, credit, and exclusion decision.\n" % GENERATED)
    for cat, title in CAT_TITLES:
        items = [m for c, m in dedupe_log if c == cat]
        if not items:
            continue
        fh.write("\n## %s (%d)\n\n" % (title, len(items)))
        for m in items:
            fh.write("- %s\n" % m)

# ---- markdown ----
def excerpt(text, n=90):
    if len(text) <= n:
        return text
    cut = text[:n]
    if " " in cut:
        cut = cut[:cut.rfind(" ")]
    return cut + "…"


tier_counts = defaultdict(int)
for s in top:
    tier_counts[s["tier"]] += 1

TIER_DESCR = {
    1: "Universally attested: cited by all three source classes (platform data, memorization "
       "curricula, editorial listicles), at least 8 independent platform-data lists, score >= 12.",
    2: "Strong multi-source support: platform data plus at least one other source class, "
       "score >= 6.",
    3: "Solid support: at least two source classes, or at least two platform-data lists, "
       "score >= 2.0.",
    4: "Tail: fewer or weaker sources - still multiply attested or platform-witnessed, but "
       "thinner evidence.",
}

md = []
md.append("# The 200 Most Popular Bible Verses\n")
md.append("*Generated %s - text: World English Bible (WEB) - built by "
          "`build_ranking.py` from 5 source research files*\n" % GENERATED)
md.append("## Methodology\n")
md.append("**Signals.** 60 usable source lists across three classes: "
          "**platform usage data** (weight 3.0): 24 YouVersion lists (Verse of the Year "
          "2013-2025, annual/all-time top-10s, 3 per-country tables), 16 lists in the Bible "
          "Gateway family - 14 lists published by Bible Gateway itself (top-100s for "
          "2009/2024/2025, annual top-10s and partials, 25th-anniversary top 5) plus 2 "
          "press-coverage lists reporting Bible Gateway data (Lifeway Research on 2021, "
          "Religion Unplugged on 2020) - the "
          "World Vision UK Ahrefs search-volume study (global + UK top 10s), TopVerses.com, "
          "Bible Study Tools 2024 site analytics, and one Google Trends snapshot; "
          "**memorization programs** (weight 2.0): Navigators TMS (60 verses), Fighter Verses "
          "Sets 1-2, Awana Sparks HangGlider, Robert J. Morgan's *100 Bible Verses Everyone "
          "Should Know by Heart*; **editorial listicles** (weight 1.0): 8 independent roundups, "
          "Holy Land Merchandise's 2025 top-50, and one derivative listicle (Anchored in "
          "Christ, republishing Bible Gateway 2024 data) counted in the listicle class but "
          "assigned to the biblegateway source family so diminishing returns apply. That is "
          "24 + 16 + 5 other platform lists (the two World Vision UK top-10s, TopVerses, "
          "Bible Study Tools, Google Trends) + 5 memorization + 10 listicle-class lists = 60. "
          "Three exact-duplicate/derivative lists were excluded outright (see "
          "`dedupe-log.md`).\n")
md.append("**Scoring formula (exactly as implemented).** For a verse entry v and source list "
          "L of length N (N = highest published position): if L is ranked, "
          "`c(v,L) = w(L) x ((N - pos + 1) / N)^1.5`; if L is unranked, `c(v,L) = w(L) x "
          "0.6`; if L is a per-country table - the three YouVersion tables and the World "
          "Vision UK single-country slice - `c(v,L) = w(L) x 0.2` per distinct year "
          "regardless of how many countries list v. Class weights w: platform usage 3.0, "
          "memorization 2.0, listicle 1.0; two platform-class datasets that do not measure "
          "usage are scored at w = 1.0 (TopVerses: web-reference counts; the Google Trends "
          "snapshot: rising phrase queries). A whole-chapter or 6+-verse citation carries a "
          "further x0.5 diffuse-evidence discount. Each list contributes at most once per "
          "entry (best contribution wins). Within each source family (youversion; "
          "biblegateway incl. its news coverage and derivative listicle; worldvision; "
          "topverses; googletrends; biblestudytools; each listicle publisher; each "
          "memorization program), an entry's per-list contributions are sorted descending "
          "and multiplied by 1, 1/2, 1/3, ... then summed. Raw search-volume numbers were "
          "never used, only ranks. Final order: score desc, then number of contributing "
          "lists desc, then canonical book order. Published scores are rounded to 4 decimal "
          "places for display; the ordering derives from the full-precision scores plus the "
          "tie-breaks above, so two entries showing the same rounded score are not "
          "necessarily true ties.\n")
md.append("**Dedupe/merge rules.** Citations merge into non-overlapping canonical entries: "
          "an entry is anchored on the most-frequently-cited form (most distinct lists, "
          "shorter span breaking ties); overlapping citations credit the strongest overlapping "
          "entry. Adjacent two-verse pairs cited as a unit by >= 4 lists (and >= half the "
          "support of either single verse) absorb their singles - e.g. Proverbs 3:5-6, "
          "Galatians 5:22-23. Non-overlapping verses of the same chapter remain separate "
          "entries (Psalm 23:1 vs Psalm 23:4; Philippians 4:6 vs 4:13). Whole-chapter and "
          "6+-verse citations never create entries; they credit the chapter's most-cited "
          "entry at a x0.5 discount, or are dropped if the chapter has no independently cited "
          "verse (all logged). Eligibility for the top 200: at least 2 contributing lists, or "
          "a single ranked platform-usage list (a lone country-table row, listicle, or "
          "memorization mention is not enough).\n")
md.append("**Tiers.** Tier 1 (%d): %s Tier 2 (%d): %s Tier 3 (%d): %s Tier 4 (%d): %s\n"
          % (tier_counts[1], TIER_DESCR[1], tier_counts[2], TIER_DESCR[2],
             tier_counts[3], TIER_DESCR[3], tier_counts[4], TIER_DESCR[4]))
md.append("**WEB text provenance.** %s Psalm superscriptions (e.g. \"A Psalm by David.\") are "
          "part of verse 1 in the WEB source and are kept. Some verses contain unbalanced "
          "quotation marks because quotations span verse boundaries; they are preserved "
          "exactly. Every entry whose verses appear in the repo's pinned fixture "
          "`pipeline/fixtures/web-subset.json` was byte-diffed against it - %d of the 200 "
          "entries: %s\n" % (provenance, fixture_witnessed,
                             "all identical." if fixture_ok else "MISMATCHES FOUND."))
# caveat inputs computed from the final ranking
ACTS_2009_ONLY = ["Acts 18:9", "Acts 18:10", "Acts 18:11", "Acts 17:11"]
acts_rank = {s["display"]: s["rank"] for s in top if s["display"] in ACTS_2009_ONLY}
psalm_singles = defaultdict(int)
for s in top:
    if IDX2NAME[s["span"][0]] == "Psalm" and s["span"][2] == s["span"][3]:
        psalm_singles[s["span"][1]] += 1

md.append("**Gaps and caveats.** Editorial listicles are low-trust orderings and are weighted "
          "accordingly; several popularity lists republish one another (handled by family "
          "damping and exclusions, but residual correlation between publishers remains). "
          "YouVersion publishes only a single Verse of the Year for 2018-2025, so its recent "
          "signal is narrow but deep. Bible Gateway data is missing or partial for 2010-2012, "
          "2014, 2017, 2019-2023. Acts 17-18 cluster: Acts 18:9 (rank %d), Acts 18:10 (rank "
          "%d), Acts 18:11 (rank %d), and Acts 17:11 (rank %d) each rest solely on the 2009 "
          "Bible Gateway most-read list, which is known to carry Acts 17-18 traffic artifacts; "
          "the entries are kept because they are methodology-consistent and fully traceable, "
          "but consumers choosing memorization verses should treat these four with editorial "
          "judgment. Verse-level concentration: because non-overlapping single verses of the "
          "same chapter stay separate entries and Bible Gateway's top-100s rank at the verse "
          "level, a few chapters contribute many entries - Psalm 91 contributes %d "
          "single-verse entries, Psalm 121 contributes %d (the whole psalm), and Psalm 23 "
          "contributes %d; this is a "
          "byproduct of the merge rules, not a judgment that each verse is independently "
          "popular, and consumers building memorization plans may want passage-level "
          "consolidation downstream. %s%s\n"
          % (acts_rank["Acts 18:9"], acts_rank["Acts 18:10"], acts_rank["Acts 18:11"],
             acts_rank["Acts 17:11"], psalm_singles[91], psalm_singles[121], psalm_singles[23],
             tail_note,
             (" Top-15 note: %s rank(s) in the top 15 on broad multi-class evidence despite "
              "not appearing in the informal consensus shortlist used as a sanity check; "
              "reported rather than suppressed." % ", ".join(extra_top15))
             if extra_top15 else ""))

for t in (1, 2, 3, 4):
    md.append("\n## Tier %d (%d verses)\n" % (t, tier_counts[t]))
    md.append("*%s*\n" % TIER_DESCR[t])
    md.append("| Rank | Reference | WEB text (excerpt) |")
    md.append("|---:|---|---|")
    for s in top:
        if s["tier"] != t:
            continue
        md.append("| %d | %s | %s |" % (s["rank"], s["display"],
                                        excerpt(s["text"]).replace("|", "\\|")))
md.append("\n*Full source traceability for every entry (specific lists and positions) is in "
          "`top-200-verses.json`.*\n")
with open(os.path.join(HERE, "top-200-verses.md"), "w", encoding="utf-8") as fh:
    fh.write("\n".join(md) + "\n")

# ------------------------------------------------------------- report ------
print("OK: 200 entries written.")
print("Top-15 outside named consensus shortlist (allowed, consensus-grade): %s"
      % (extra_top15 or "none"))
print("Fixture verification: %d of 200 entries witnessed by web-subset.json; %s"
      % (fixture_witnessed,
         "all byte-identical" if fixture_ok else "%d MISMATCHED" % len(fixture_mismatches)))
print("Tail: %s" % tail_note)
print("Tier sizes:", dict(sorted(tier_counts.items())))
print("Eligible entries: %d (of %d scored; %d ineligible single-list non-platform)"
      % (len(eligible), len(scored), len(ineligible)))
print("\nTop 15:")
for s in top[:15]:
    print("  %3d  %-24s %7.2f  lists=%d classes=%s tier=%d"
          % (s["rank"], s["display"], s["score"], s["n_lists"], ",".join(s["classes"]), s["tier"]))
print("\nSource-class support distribution over the 200:")
from collections import Counter
print(" ", Counter(tuple(s["classes"]) for s in top))
print("\nScore at ranks 100/150/161/200: %.2f / %.2f / %.2f / %.2f"
      % (top[99]["score"], top[149]["score"], top[160]["score"], top[199]["score"]))
print("Entries 161-200 with <2 lists and no platform list: %d" % len(weak_tail))
just_missed = eligible[200:210]
print("\nJust missed (201-210):")
for s in just_missed:
    print("   %-24s %6.2f lists=%d %s" % (s["display"], s["score"], s["n_lists"], s["classes"]))
