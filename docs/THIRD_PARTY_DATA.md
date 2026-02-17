# Third-Party Data and Licenses

This project uses the following external data sources. This document describes what is used, the applicable licenses, and how they are satisfied.

---

## 1. CMU Pronouncing Dictionary (cmudict)

**Use in this project:** Word-to-pronunciation mappings (ARPAbet) are seeded from `cmudict.txt` into the database and used for pronunciation display and lexical sets.

**Source:** [cmusphinx/cmudict](https://github.com/cmusphinx/cmudict)

**License:** BSD 3-Clause. Use in proprietary software is permitted. Redistributions must retain the copyright notice and disclaimer below.

**License text (included to satisfy redistribution requirements):**

```
Copyright (C) 1993-2015 Carnegie Mellon University. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
   The contents of this file are deemed to be source code.

2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in
   the documentation and/or other materials provided with the
   distribution.

This work was supported in part by funding from the Defense Advanced
Research Projects Agency, the Office of Naval Research and the National
Science Foundation of the United States of America, and by member
companies of the Carnegie Mellon Sphinx Speech Consortium. We acknowledge
the contributions of many volunteers to the expansion and improvement of
this dictionary.

THIS SOFTWARE IS PROVIDED BY CARNEGIE MELLON UNIVERSITY ``AS IS'' AND
ANY EXPRESSED OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL CARNEGIE MELLON UNIVERSITY
NOR ITS EMPLOYEES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

---

## 2. SUBTLEX-US (word frequency)

**Use in this project:** Word frequency counts (per-million) are stored in `OrthoWord.freqSubtlexUs` and shown in the app (e.g. accent explorer, word lists). The data is used for ranking and display only; the raw dataset is not redistributed.

**Source:** SUBTLEX-US — word frequencies from American film and TV subtitles.  
**Authors:** Boris New and Marc Brysbaert (Ghent University).  
**Reference:** Brysbaert, M., & New, B. (2009). Moving beyond Kučera and Francis: A critical evaluation of current word frequency norms and the introduction of a new and improved word frequency measure for American English. *Behavior Research Methods*, 41(4), 977–990.  
**Info:** [Open Lexicon / SUBTLEX-US](https://openlexicon.fr/datasets-info/SUBTLEX-US/README-SUBTLEXus.html)

**License:** CC-BY-SA (Creative Commons Attribution-ShareAlike). Use and display within the app is permitted with attribution. Any redistribution of the dataset or a substantial derivative would need to be under CC-BY-SA with attribution.

**Attribution:** SUBTLEX-US word frequency data by Boris New and Marc Brysbaert; CC-BY-SA.

---

## 3. Wiktionary / Wikimedia Commons (pronunciation audio)

**Use in this project:** Pronunciation audio is obtained by querying the Wiktionary/MediaWiki APIs for file metadata; the app returns URLs to audio files hosted on Wikimedia Commons. Playback is streamed directly from Wikimedia — the project does not copy or re-host the files.

**License:** Wiktionary text and many Commons audio files are under CC BY-SA 4.0; individual Commons files may have other free licenses (e.g. CC BY, public domain). Each file’s license is listed on its Commons page.

**Attribution:** Pronunciation audio is from [Wiktionary](https://en.wiktionary.org) / [Wikimedia Commons](https://commons.wikimedia.org), used under their respective licenses.

---

## Summary

| Data source      | License      | Use in this project                          |
|------------------|-------------|-----------------------------------------------|
| CMU Dict         | BSD 3-Clause | Pronunciation data in DB; notice in NOTICE and this doc |
| SUBTLEX-US       | CC-BY-SA    | Word frequency in DB and UI; attribution above |
| Wiktionary audio | CC BY-SA etc. | URLs only; audio streamed from Wikimedia; attribution above |

These licenses apply to the third-party data and content. They do not change the license of the project’s own code (see [LICENSE.md](../LICENSE.md)).
