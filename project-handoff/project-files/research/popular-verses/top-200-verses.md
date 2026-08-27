# The 200 Most Popular Bible Verses

*Generated 2026-08-25 - text: World English Bible (WEB) - built by `build_ranking.py` from 5 source research files*

## Methodology

**Signals.** 60 usable source lists across three classes: **platform usage data** (weight 3.0): 24 YouVersion lists (Verse of the Year 2013-2025, annual/all-time top-10s, 3 per-country tables), 16 lists in the Bible Gateway family - 14 lists published by Bible Gateway itself (top-100s for 2009/2024/2025, annual top-10s and partials, 25th-anniversary top 5) plus 2 press-coverage lists reporting Bible Gateway data (Lifeway Research on 2021, Religion Unplugged on 2020) - the World Vision UK Ahrefs search-volume study (global + UK top 10s), TopVerses.com, Bible Study Tools 2024 site analytics, and one Google Trends snapshot; **memorization programs** (weight 2.0): Navigators TMS (60 verses), Fighter Verses Sets 1-2, Awana Sparks HangGlider, Robert J. Morgan's *100 Bible Verses Everyone Should Know by Heart*; **editorial listicles** (weight 1.0): 8 independent roundups, Holy Land Merchandise's 2025 top-50, and one derivative listicle (Anchored in Christ, republishing Bible Gateway 2024 data) counted in the listicle class but assigned to the biblegateway source family so diminishing returns apply. That is 24 + 16 + 5 other platform lists (the two World Vision UK top-10s, TopVerses, Bible Study Tools, Google Trends) + 5 memorization + 10 listicle-class lists = 60. Three exact-duplicate/derivative lists were excluded outright (see `dedupe-log.md`).

**Scoring formula (exactly as implemented).** For a verse entry v and source list L of length N (N = highest published position): if L is ranked, `c(v,L) = w(L) x ((N - pos + 1) / N)^1.5`; if L is unranked, `c(v,L) = w(L) x 0.6`; if L is a per-country table - the three YouVersion tables and the World Vision UK single-country slice - `c(v,L) = w(L) x 0.2` per distinct year regardless of how many countries list v. Class weights w: platform usage 3.0, memorization 2.0, listicle 1.0; two platform-class datasets that do not measure usage are scored at w = 1.0 (TopVerses: web-reference counts; the Google Trends snapshot: rising phrase queries). A whole-chapter or 6+-verse citation carries a further x0.5 diffuse-evidence discount. Each list contributes at most once per entry (best contribution wins). Within each source family (youversion; biblegateway incl. its news coverage and derivative listicle; worldvision; topverses; googletrends; biblestudytools; each listicle publisher; each memorization program), an entry's per-list contributions are sorted descending and multiplied by 1, 1/2, 1/3, ... then summed. Raw search-volume numbers were never used, only ranks. Final order: score desc, then number of contributing lists desc, then canonical book order. Published scores are rounded to 4 decimal places for display; the ordering derives from the full-precision scores plus the tie-breaks above, so two entries showing the same rounded score are not necessarily true ties.

**Dedupe/merge rules.** Citations merge into non-overlapping canonical entries: an entry is anchored on the most-frequently-cited form (most distinct lists, shorter span breaking ties); overlapping citations credit the strongest overlapping entry. Adjacent two-verse pairs cited as a unit by >= 4 lists (and >= half the support of either single verse) absorb their singles - e.g. Proverbs 3:5-6, Galatians 5:22-23. Non-overlapping verses of the same chapter remain separate entries (Psalm 23:1 vs Psalm 23:4; Philippians 4:6 vs 4:13). Whole-chapter and 6+-verse citations never create entries; they credit the chapter's most-cited entry at a x0.5 discount, or are dropped if the chapter has no independently cited verse (all logged). Eligibility for the top 200: at least 2 contributing lists, or a single ranked platform-usage list (a lone country-table row, listicle, or memorization mention is not enough).

**Tiers.** Tier 1 (10): Universally attested: cited by all three source classes (platform data, memorization curricula, editorial listicles), at least 8 independent platform-data lists, score >= 12. Tier 2 (20): Strong multi-source support: platform data plus at least one other source class, score >= 6. Tier 3 (73): Solid support: at least two source classes, or at least two platform-data lists, score >= 2.0. Tier 4 (97): Tail: fewer or weaker sources - still multiply attested or platform-witnessed, but thinner evidence.

**WEB text provenance.** World English Bible, ebible.org 'engwebp' edition, verse-per-line file downloaded 2026-08-25 from https://ebible.org/Scriptures/engwebp_vpl.zip (sha256 b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c). The repo manifest pipeline/manifests/web.json pins an earlier snapshot of the same edition (sha256 3458ca34420c0547ec01b3dbda58a10a2d8fc511bdcd2e047ddd17fbe860b7b6, retrieved 2026-07-29); the live upstream has drifted from that pin, but a diff against the committed pinned witness pipeline/fixtures/web-subset.json (5,727 verses) shows the only difference is Acts 20:35, where the current edition has a no-break space (U+00A0) instead of a regular space before a closing quotation mark; no wording differs. All verse text below is current-edition (2026-08-25 download) text extracted verbatim by script; verses also witnessed in web-subset.json were additionally byte-verified against the pinned fixture. Psalm superscriptions (e.g. "A Psalm by David.") are part of verse 1 in the WEB source and are kept. Some verses contain unbalanced quotation marks because quotations span verse boundaries; they are preserved exactly. Every entry whose verses appear in the repo's pinned fixture `pipeline/fixtures/web-subset.json` was byte-diffed against it - 175 of the 200 entries: all identical.

**Gaps and caveats.** Editorial listicles are low-trust orderings and are weighted accordingly; several popularity lists republish one another (handled by family damping and exclusions, but residual correlation between publishers remains). YouVersion publishes only a single Verse of the Year for 2018-2025, so its recent signal is narrow but deep. Bible Gateway data is missing or partial for 2010-2012, 2014, 2017, 2019-2023. Acts 17-18 cluster: Acts 18:9 (rank 102), Acts 18:10 (rank 100), Acts 18:11 (rank 104), and Acts 17:11 (rank 198) each rest solely on the 2009 Bible Gateway most-read list, which is known to carry Acts 17-18 traffic artifacts; the entries are kept because they are methodology-consistent and fully traceable, but consumers choosing memorization verses should treat these four with editorial judgment. Verse-level concentration: because non-overlapping single verses of the same chapter stay separate entries and Bible Gateway's top-100s rank at the verse level, a few chapters contribute many entries - Psalm 91 contributes 16 single-verse entries, Psalm 121 contributes 8 (the whole psalm), and Psalm 23 contributes 6; this is a byproduct of the merge rules, not a judgment that each verse is independently popular, and consumers building memorization plans may want passage-level consolidation downstream. All of ranks 161-200 have >=2 contributing lists or one platform-data list. Top-15 note: Matthew 28:19 rank(s) in the top 15 on broad multi-class evidence despite not appearing in the informal consensus shortlist used as a sanity check; reported rather than suppressed.


## Tier 1 (10 verses)

*Universally attested: cited by all three source classes (platform data, memorization curricula, editorial listicles), at least 8 independent platform-data lists, score >= 12.*

| Rank | Reference | WEB text (excerpt) |
|---:|---|---|
| 1 | John 3:16 | For God so loved the world, that he gave his only born Son, that whoever believes in him… |
| 2 | Jeremiah 29:11 | For I know the thoughts that I think toward you,” says the LORD, “thoughts of peace, and… |
| 3 | Philippians 4:13 | I can do all things through Christ who strengthens me. |
| 4 | Philippians 4:6 | In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let… |
| 5 | Proverbs 3:5-6 | Trust in the LORD with all your heart, and don’t lean on your own understanding. In all… |
| 6 | Isaiah 41:10 | Don’t you be afraid, for I am with you. Don’t be dismayed, for I am your God. I will… |
| 7 | Romans 12:2 | Don’t be conformed to this world, but be transformed by the renewing of your mind, so… |
| 8 | Romans 8:28 | We know that all things work together for good for those who love God, for those who are… |
| 9 | Joshua 1:9 | Haven’t I commanded you? Be strong and courageous. Don’t be afraid. Don’t be dismayed,… |
| 10 | Matthew 6:33 | But seek first God’s Kingdom and his righteousness; and all these things will be given to… |

## Tier 2 (20 verses)

*Strong multi-source support: platform data plus at least one other source class, score >= 6.*

| Rank | Reference | WEB text (excerpt) |
|---:|---|---|
| 11 | Isaiah 40:31 | but those who wait for the LORD will renew their strength. They will mount up with wings… |
| 12 | Matthew 28:19 | Go and make disciples of all nations, baptizing them in the name of the Father and of the… |
| 13 | Psalm 23:4 | Even though I walk through the valley of the shadow of death, I will fear no evil, for… |
| 14 | Genesis 1:1 | In the beginning, God created the heavens and the earth. |
| 15 | Psalm 23:1 | A Psalm by David. The LORD is my shepherd; I shall lack nothing. |
| 16 | Philippians 4:8 | Finally, brothers, whatever things are true, whatever things are honorable, whatever… |
| 17 | 1 Peter 5:7 | casting all your worries on him, because he cares for you. |
| 18 | John 14:6 | Jesus said to him, “I am the way, the truth, and the life. No one comes to the Father,… |
| 19 | Romans 3:23 | for all have sinned, and fall short of the glory of God; |
| 20 | Galatians 5:22-23 | But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faith,… |
| 21 | Psalm 91:1 | He who dwells in the secret place of the Most High will rest in the shadow of the… |
| 22 | Philippians 4:7 | And the peace of God, which surpasses all understanding, will guard your hearts and your… |
| 23 | John 10:10 | The thief only comes to steal, kill, and destroy. I came that they may have life, and may… |
| 24 | 1 Corinthians 13:4 | Love is patient and is kind. Love doesn’t envy. Love doesn’t brag, is not proud, |
| 25 | Ephesians 2:8 | for by grace you have been saved through faith, and that not of yourselves; it is the… |
| 26 | Psalm 23:6 | Surely goodness and loving kindness shall follow me all the days of my life, and I will… |
| 27 | Romans 6:23 | For the wages of sin is death, but the free gift of God is eternal life in Christ Jesus… |
| 28 | 1 John 1:9 | If we confess our sins, he is faithful and righteous to forgive us the sins and to… |
| 29 | 2 Timothy 3:16 | Every Scripture is God-breathed and profitable for teaching, for reproof, for correction,… |
| 30 | 2 Corinthians 12:9 | He has said to me, “My grace is sufficient for you, for my power is made perfect in… |

## Tier 3 (73 verses)

*Solid support: at least two source classes, or at least two platform-data lists, score >= 2.0.*

| Rank | Reference | WEB text (excerpt) |
|---:|---|---|
| 31 | Romans 5:8 | But God commends his own love toward us, in that while we were yet sinners, Christ died… |
| 32 | Galatians 2:20 | I have been crucified with Christ, and it is no longer I who live, but Christ lives in… |
| 33 | 2 Timothy 1:7 | For God didn’t give us a spirit of fear, but of power, love, and self-control. |
| 34 | Hebrews 11:6 | Without faith it is impossible to be well pleasing to him, for he who comes to God must… |
| 35 | 2 Corinthians 5:17 | Therefore if anyone is in Christ, he is a new creation. The old things have passed away.… |
| 36 | Psalm 118:24 | This is the day that the LORD has made. We will rejoice and be glad in it! |
| 37 | Psalm 91:11 | For he will put his angels in charge of you, to guard you in all your ways. |
| 38 | Matthew 11:28 | “Come to me, all you who labor and are heavily burdened, and I will give you rest. |
| 39 | Isaiah 53:5 | But he was pierced for our transgressions. He was crushed for our iniquities. The… |
| 40 | 1 Corinthians 10:13 | No temptation has taken you except what is common to man. God is faithful, who will not… |
| 41 | Colossians 3:23 | And whatever you do, work heartily, as for the Lord and not for men, |
| 42 | Psalm 91:7 | A thousand may fall at your side, and ten thousand at your right hand; but it will not… |
| 43 | John 1:1 | In the beginning was the Word, and the Word was with God, and the Word was God. |
| 44 | Psalm 23:5 | You prepare a table before me in the presence of my enemies. You anoint my head with oil.… |
| 45 | Psalm 91:14 | “Because he has set his love on me, therefore I will deliver him. I will set him on high,… |
| 46 | Psalm 91:9 | Because you have made the LORD your refuge, and the Most High your dwelling place, |
| 47 | 1 Thessalonians 5:16-18 | Always rejoice. Pray without ceasing. In everything give thanks, for this is the will of… |
| 48 | Psalm 91:5 | You shall not be afraid of the terror by night, nor of the arrow that flies by day, |
| 49 | John 16:33 | I have told you these things, that in me you may have peace. In the world you have… |
| 50 | Psalm 23:3 | He restores my soul. He guides me in the paths of righteousness for his name’s sake. |
| 51 | Acts 1:8 | But you will receive power when the Holy Spirit has come upon you. You will be witnesses… |
| 52 | Psalm 91:3 | For he will deliver you from the snare of the fowler, and from the deadly pestilence. |
| 53 | Psalm 23:2 | He makes me lie down in green pastures. He leads me beside still waters. |
| 54 | Romans 12:1 | Therefore I urge you, brothers, by the mercies of God, to present your bodies a living… |
| 55 | 2 Corinthians 9:7 | Let each man give according as he has determined in his heart, not grudgingly or under… |
| 56 | Hebrews 13:5 | Be free from the love of money, content with such things as you have, for he has said, “I… |
| 57 | 2 Chronicles 7:14 | if my people who are called by my name will humble themselves, pray, seek my face, and… |
| 58 | Psalm 91:4 | He will cover you with his feathers. Under his wings you will take refuge. His… |
| 59 | Psalm 91:2 | I will say of the LORD, “He is my refuge and my fortress; my God, in whom I trust.” |
| 60 | Psalm 91:12 | They will bear you up in their hands, so that you won’t dash your foot against a stone. |
| 61 | Deuteronomy 6:6-7 | These words, which I command you today, shall be on your heart; and you shall teach them… |
| 62 | Romans 10:9 | that if you will confess with your mouth that Jesus is Lord and believe in your heart… |
| 63 | Ephesians 6:12 | For our wrestling is not against flesh and blood, but against the principalities, against… |
| 64 | Psalm 91:15 | He will call on me, and I will answer him. I will be with him in trouble. I will deliver… |
| 65 | James 1:3 | knowing that the testing of your faith produces endurance. |
| 66 | 1 Peter 5:6 | Humble yourselves therefore under the mighty hand of God, that he may exalt you in due… |
| 67 | Psalm 91:16 | I will satisfy him with long life, and show him my salvation.” |
| 68 | Psalm 91:10 | no evil shall happen to you, neither shall any plague come near your dwelling. |
| 69 | Isaiah 53:6 | All we like sheep have gone astray. Everyone has turned to his own way; and the LORD has… |
| 71 | Psalm 91:8 | You will only look with your eyes, and see the recompense of the wicked. |
| 72 | Psalm 91:13 | You will tread on the lion and cobra. You will trample the young lion and the serpent… |
| 73 | Psalm 91:6 | nor of the pestilence that walks in darkness, nor of the destruction that wastes at… |
| 74 | Psalm 56:3 | When I am afraid, I will put my trust in you. |
| 75 | Matthew 28:20 | teaching them to observe all things that I commanded you. Behold, I am with you always,… |
| 76 | Psalm 1:1 | Blessed is the man who doesn’t walk in the counsel of the wicked, nor stand on the path… |
| 77 | Deuteronomy 31:6 | Be strong and courageous. Don’t be afraid or scared of them, for the LORD your God… |
| 78 | John 14:27 | Peace I leave with you. My peace I give to you; not as the world gives, I give to you.… |
| 79 | Hebrews 11:1 | Now faith is assurance of things hoped for, proof of things not seen. |
| 80 | Psalm 121:7 | The LORD will keep you from all evil. He will keep your soul. |
| 81 | Philippians 4:19 | My God will supply every need of yours according to his riches in glory in Christ Jesus. |
| 82 | Psalm 119:11 | I have hidden your word in my heart, that I might not sin against you. |
| 83 | Isaiah 26:3 | You will keep whoever’s mind is steadfast in perfect peace, because he trusts in you. |
| 84 | Hebrews 10:25 | not forsaking our own assembling together, as the custom of some is, but exhorting one… |
| 85 | John 1:12 | But as many as received him, to them he gave the right to become God’s children, to those… |
| 87 | Romans 15:13 | Now may the God of hope fill you with all joy and peace in believing, that you may abound… |
| 88 | Acts 16:31 | They said, “Believe in the Lord Jesus Christ, and you will be saved, you and your… |
| 89 | Matthew 7:7 | “Ask, and it will be given you. Seek, and you will find. Knock, and it will be opened for… |
| 90 | Isaiah 54:17 | No weapon that is formed against you will prevail; and you will condemn every tongue that… |
| 91 | Psalm 1:3 | He will be like a tree planted by the streams of water, that produces its fruit in its… |
| 92 | 1 John 4:19 | We love him, because he first loved us. |
| 93 | Joshua 1:8 | This book of the law shall not depart from your mouth, but you shall meditate on it day… |
| 94 | Ephesians 2:10 | For we are his workmanship, created in Christ Jesus for good works, which God prepared… |
| 95 | John 5:24 | “Most certainly I tell you, he who hears my word and believes him who sent me has eternal… |
| 96 | Titus 3:5 | not by works of righteousness which we did ourselves, but according to his mercy, he… |
| 101 | 1 Peter 3:15 | But sanctify the Lord God in your hearts. Always be ready to give an answer to everyone… |
| 103 | Ephesians 2:9 | not of works, that no one would boast. |
| 105 | Ephesians 6:11 | Put on the whole armor of God, that you may be able to stand against the wiles of the… |
| 106 | Matthew 5:16 | Even so, let your light shine before men, that they may see your good works and glorify… |
| 108 | 1 Chronicles 16:34 | Oh give thanks to the LORD, for he is good, for his loving kindness endures forever. |
| 109 | Hebrews 4:12 | For the word of God is living and active, and sharper than any two-edged sword, piercing… |
| 110 | Ephesians 4:32 | And be kind to one another, tender hearted, forgiving each other, just as God also in… |
| 111 | John 11:25-26 | Jesus said to her, “I am the resurrection and the life. He who believes in me will still… |
| 112 | Psalm 100:4 | Enter into his gates with thanksgiving, and into his courts with praise. Give thanks to… |

## Tier 4 (97 verses)

*Tail: fewer or weaker sources - still multiply attested or platform-witnessed, but thinner evidence.*

| Rank | Reference | WEB text (excerpt) |
|---:|---|---|
| 70 | Romans 1:16 | For I am not ashamed of the Good News of Christ, because it is the power of God for… |
| 86 | 1 Corinthians 16:14 | Let all that you do be done in love. |
| 97 | John 14:2-3 | In my Father’s house are many homes. If it weren’t so, I would have told you. I am going… |
| 98 | 1 Peter 1:3 | Blessed be the God and Father of our Lord Jesus Christ, who according to his great mercy… |
| 99 | 1 John 2:15-16 | Don’t love the world or the things that are in the world. If anyone loves the world, the… |
| 100 | Acts 18:10 | for I am with you, and no one will attack you to harm you, for I have many people in this… |
| 102 | Acts 18:9 | The Lord said to Paul in the night by a vision, “Don’t be afraid, but speak and don’t be… |
| 104 | Acts 18:11 | He lived there a year and six months, teaching the word of God among them. |
| 107 | Proverbs 16:3 | Commit your deeds to the LORD, and your plans shall succeed. |
| 113 | Mark 11:24 | Therefore I tell you, all things whatever you pray and ask for, believe that you have… |
| 114 | Genesis 1:26 | God said, “Let’s make man in our image, after our likeness. Let them have dominion over… |
| 115 | Romans 12:12 | rejoicing in hope, enduring in troubles, continuing steadfastly in prayer, |
| 116 | Hebrews 12:2 | looking to Jesus, the author and perfecter of faith, who for the joy that was set before… |
| 117 | Lamentations 3:22-23 | It is because of the LORD’s loving kindnesses that we are not consumed, because his… |
| 118 | Psalm 121:8 | The LORD will keep your going out and your coming in, from this time forward, and forever… |
| 119 | 1 John 5:14 | This is the boldness which we have toward him, that if we ask anything according to his… |
| 120 | Psalm 119:9 | How can a young man keep his way pure? By living according to your word. |
| 121 | Colossians 3:15 | And let the peace of God rule in your hearts, to which also you were called in one body,… |
| 122 | Deuteronomy 6:4-5 | Hear, Israel: The LORD is our God. The LORD is one. You shall love the LORD your God with… |
| 123 | Psalm 103:8 | The LORD is merciful and gracious, slow to anger, and abundant in loving kindness. |
| 124 | Romans 10:13 | For, “Whoever will call on the name of the Lord will be saved.” |
| 125 | 1 Corinthians 13:13 | But now faith, hope, and love remain—these three. The greatest of these is love. |
| 126 | Proverbs 18:10 | The LORD’s name is a strong tower: the righteous run to him, and are safe. |
| 127 | 1 Corinthians 15:58 | Therefore, my beloved brothers, be steadfast, immovable, always abounding in the Lord’s… |
| 128 | Numbers 6:24-26 | ‘The LORD bless you, and keep you. The LORD make his face to shine on you, and be… |
| 129 | Matthew 11:29 | Take my yoke upon you and learn from me, for I am gentle and humble in heart; and you… |
| 130 | Psalm 121:1 | A Song of Ascents. I will lift up my eyes to the hills. Where does my help come from? |
| 131 | Psalm 121:2 | My help comes from the LORD, who made heaven and earth. |
| 132 | Genesis 1:27 | God created man in his own image. In God’s image he created him; male and female he… |
| 133 | Galatians 6:9 | Let’s not be weary in doing good, for we will reap in due season if we don’t give up. |
| 134 | 1 Corinthians 13:7 | bears all things, believes all things, hopes all things, and endures all things. |
| 135 | 2 Corinthians 5:21 | For him who knew no sin he made to be sin on our behalf, so that in him we might become… |
| 136 | Psalm 121:3 | He will not allow your foot to be moved. He who keeps you will not slumber. |
| 137 | James 1:12 | Blessed is a person who endures temptation, for when he has been approved, he will… |
| 138 | Psalm 139:14 | I will give thanks to you, for I am fearfully and wonderfully made. Your works are… |
| 139 | 2 Corinthians 5:7 | for we walk by faith, not by sight. |
| 140 | Isaiah 53:4 | Surely he has borne our sickness and carried our suffering; yet we considered him… |
| 141 | Psalm 46:10 | “Be still, and know that I am God. I will be exalted among the nations. I will be exalted… |
| 142 | Psalm 121:4 | Behold, he who keeps Israel will neither slumber nor sleep. |
| 143 | James 1:5 | But if any of you lacks wisdom, let him ask of God, who gives to all liberally and… |
| 144 | Philippians 1:6 | being confident of this very thing, that he who began a good work in you will complete it… |
| 145 | Jeremiah 17:7-8 | “Blessed is the man who trusts in the LORD, and whose confidence is in the LORD. For he… |
| 146 | Psalm 103:12 | As far as the east is from the west, so far has he removed our transgressions from us. |
| 147 | Revelation 21:1 | I saw a new heaven and a new earth, for the first heaven and the first earth have passed… |
| 148 | Psalm 1:6 | For the LORD knows the way of the righteous, but the way of the wicked shall perish. |
| 149 | Philippians 2:3-4 | doing nothing through rivalry or through conceit, but in humility, each counting others… |
| 150 | Hebrews 4:16 | Let’s therefore draw near with boldness to the throne of grace, that we may receive mercy… |
| 151 | Psalm 121:5 | The LORD is your keeper. The LORD is your shade on your right hand. |
| 152 | Acts 4:12 | There is salvation in no one else, for there is no other name under heaven that is given… |
| 153 | Psalm 16:11 | You will show me the path of life. In your presence is fullness of joy. In your right… |
| 154 | Colossians 3:2 | Set your mind on the things that are above, not on the things that are on the earth. |
| 155 | 1 Peter 2:24 | He himself bore our sins in his body on the tree, that we, having died to sins, might… |
| 156 | Psalm 27:1 | By David. The LORD is my light and my salvation. Whom shall I fear? The LORD is the… |
| 157 | Proverbs 6:20 | My son, keep your father’s commandment, and don’t forsake your mother’s teaching. |
| 158 | Exodus 14:14 | The LORD will fight for you, and you shall be still.” |
| 159 | Psalm 143:8 | Cause me to hear your loving kindness in the morning, for I trust in you. Cause me to… |
| 160 | Psalm 121:6 | The sun will not harm you by day, nor the moon by night. |
| 161 | Psalm 46:1 | For the Chief Musician. By the sons of Korah. According to Alamoth. God is our refuge and… |
| 162 | Matthew 6:34 | Therefore don’t be anxious for tomorrow, for tomorrow will be anxious for itself. Each… |
| 163 | Romans 11:36 | For of him and through him and to him are all things. To him be the glory for ever! Amen. |
| 164 | Ephesians 3:20 | Now to him who is able to do exceedingly abundantly above all that we ask or think,… |
| 165 | Isaiah 9:6 | For a child is born to us. A son is given to us; and the government will be on his… |
| 166 | John 13:34-35 | A new commandment I give to you, that you love one another. Just as I have loved you, you… |
| 167 | Romans 8:1 | There is therefore now no condemnation to those who are in Christ Jesus, who don’t walk… |
| 168 | John 15:13 | Greater love has no one than this, that someone lay down his life for his friends. |
| 169 | Matthew 18:20 | For where two or three are gathered together in my name, there I am in the middle of… |
| 170 | Ephesians 3:16-17 | that he would grant you, according to the riches of his glory, that you may be… |
| 171 | 1 Corinthians 13:5 | doesn’t behave itself inappropriately, doesn’t seek its own way, is not provoked, takes… |
| 172 | Hebrews 4:15 | For we don’t have a high priest who can’t be touched with the feeling of our infirmities,… |
| 173 | Mark 9:23 | Jesus said to him, “If you can believe, all things are possible to him who believes.” |
| 174 | Micah 6:8 | He has shown you, O man, what is good. What does the LORD require of you, but to act… |
| 175 | Proverbs 22:6 | Train up a child in the way he should go, and when he is old he will not depart from it. |
| 176 | Psalm 42:11 | Why are you in despair, my soul? Why are you disturbed within me? Hope in God! For I… |
| 177 | Deuteronomy 31:8 | The LORD himself is who goes before you. He will be with you. He will not fail you nor… |
| 178 | Psalm 1:2 | but his delight is in the LORD’s law. On his law he meditates day and night. |
| 179 | 1 Corinthians 13:6 | doesn’t rejoice in unrighteousness, but rejoices with the truth; |
| 180 | 1 Peter 2:9 | But you are a chosen race, a royal priesthood, a holy nation, a people for God’s own… |
| 181 | Psalm 119:105 | Your word is a lamp to my feet, and a light for my path. |
| 182 | Jeremiah 29:12 | You shall call on me, and you shall go and pray to me, and I will listen to you. |
| 183 | James 1:2 | Count it all joy, my brothers, when you fall into various temptations, |
| 184 | Psalm 51:10 | Create in me a clean heart, O God. Renew a right spirit within me. |
| 185 | Acts 2:38 | Peter said to them, “Repent and be baptized, every one of you, in the name of Jesus… |
| 186 | Matthew 19:26 | Looking at them, Jesus said, “With men this is impossible, but with God all things are… |
| 187 | Ephesians 5:25-26 | Husbands, love your wives, even as Christ also loved the assembly and gave himself up for… |
| 188 | Ephesians 4:2 | with all lowliness and humility, with patience, bearing with one another in love, |
| 189 | Matthew 11:30 | For my yoke is easy, and my burden is light.” |
| 190 | Proverbs 3:3-4 | Don’t let kindness and truth forsake you. Bind them around your neck. Write them on the… |
| 191 | Psalm 37:4 | Also delight yourself in the LORD, and he will give you the desires of your heart. |
| 192 | Colossians 3:12 | Put on therefore, as God’s chosen ones, holy and beloved, a heart of compassion,… |
| 193 | 2 Corinthians 10:5 | throwing down imaginations and every high thing that is exalted against the knowledge of… |
| 194 | James 5:16 | Confess your sins to one another and pray for one another, that you may be healed. The… |
| 195 | Psalm 133:1 | A Song of Ascents. By David. See how good and how pleasant it is for brothers to live… |
| 196 | Hebrews 12:1 | Therefore let’s also, seeing we are surrounded by so great a cloud of witnesses, lay… |
| 197 | Matthew 19:14 | But Jesus said, “Allow the little children, and don’t forbid them to come to me; for the… |
| 198 | Acts 17:11 | Now these were more noble than those in Thessalonica, in that they received the word with… |
| 199 | Romans 8:38 | For I am persuaded that neither death, nor life, nor angels, nor principalities, nor… |
| 200 | Isaiah 43:2 | When you pass through the waters, I will be with you, and through the rivers, they will… |

*Full source traceability for every entry (specific lists and positions) is in `top-200-verses.json`.*

