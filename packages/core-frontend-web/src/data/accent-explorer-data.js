/**
 * Accent Explorer Data
 *
 * Simplified data structure for accent targets and issues with example words
 * and direct links to external resources.
 */

import wlsData from "./wls-data.json";

// Fallback if wls-data import fails
const safeWlsData = wlsData || {};

export const accentExplorerData = {
  // Target-level content
  targets: {
    kit: {
      name: "KIT",
      category: "vowel",
      exampleWords: ["it", "this", "did", "if", "is", "pick", "live", "big"],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://ecampusontario.pressbooks.pub/lexicalsets/chapter/1-kit-lexical-set/#phrases",
        },
      ],
    },

    fleece: {
      name: "FLEECE",
      category: "vowel",
      exampleWords: ["we", "see", "he", "me", "leave", "peek", "eat", "read"],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://ecampusontario.pressbooks.pub/lexicalsets/chapter/9-fleece-lexical-set/#phrases",
        },
      ],
    },

    trap: {
      name: "TRAP",
      category: "vowel",
      exampleWords: ["cat", "hat", "bad", "sad", "cap", "map", "lap"],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://ecampusontario.pressbooks.pub/lexicalsets/chapter/3-trap-lexical-set/#phrases",
        },
      ],
    },

    dress: {
      name: "DRESS",
      category: "vowel",
      exampleWords: ["bed", "red", "head", "said", "kept"],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://ecampusontario.pressbooks.pub/lexicalsets/chapter/2-dress-lexical-set/#phrases",
        },
      ],
    },
    goose: {
      name: "GOOSE",
      category: "vowel",
      exampleWords: ["you", "who", "do", "too", "soon", "two", "to", "new"],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://ecampusontario.pressbooks.pub/lexicalsets/chapter/13-goose-lexical-set/#phrases",
        },
      ],
    },
    foot: {
      name: "FOOT",
      category: "vowel",
      exampleWords: [
        "could",
        "should",
        "would",
        "wood",
        "cook",
        "foot",
        "look",
        "good",
        "book",
        "stood",
        "cookies",
      ],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://ecampusontario.pressbooks.pub/lexicalsets/chapter/6-foot-lexical-set/#phrases",
        },
      ],
    },
    strut: {
      name: "STRUT",
      category: "vowel",
      exampleWords: [
        "what",
        "of",
        "fun",
        "done",
        "none",
        "study",
        "run",
        "one",
        "other",
        "up",
      ],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://ecampusontario.pressbooks.pub/lexicalsets/chapter/5-strut-lexical-set/#phrases",
        },
      ],
    },
    lot: {
      name: "LOT",
      category: "vowel",
      exampleWords: [
        "on",
        "off",
        "hot",
        "saw",
        "raw",
        "audio",
        "launch",
        "pot",
        "project",
      ],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://ecampusontario.pressbooks.pub/lexicalsets/chapter/4-lot-lexical-set/#phrases",
        },
      ],
    },
    face: {
      name: "FACE",
      category: "vowel",
      exampleWords: [
        "way",
        "hey",
        "hay",
        "may",
        "play",
        "day",
        "take",
        "break",
        "brake",
      ],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://ecampusontario.pressbooks.pub/lexicalsets/chapter/14-face-lexical-set/#phrases",
        },
      ],
    },
    price: {
      name: "PRICE",
      category: "vowel",
      exampleWords: ["why", "hi", "try", "pie", "high", "guy", "live"],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://ecampusontario.pressbooks.pub/lexicalsets/chapter/15-price-lexical-set/#phrases",
        },
      ],
    },
    choice: {
      name: "CHOICE",
      category: "vowel",
      exampleWords: [
        "boy",
        "joy",
        "choice",
        "noise",
        "toy",
        "join",
        "voice",
        "point",
        "invoice",
      ],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://ecampusontario.pressbooks.pub/lexicalsets/chapter/17-choice-lexical-set/#phrases",
        },
      ],
    },
    goat: {
      name: "GOAT",
      category: "vowel",
      exampleWords: [
        "no",
        "slow",
        "so",
        "throw",
        "low",
        "go",
        "show",
        "own",
        "those",
        "both",
        "most",
        "loan",
      ],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://ecampusontario.pressbooks.pub/lexicalsets/chapter/18-goat-lexical-set/#phrases",
        },
      ],
    },
    mouth: {
      name: "MOUTH",
      category: "vowel",
      exampleWords: [
        "out",
        "how",
        "now",
        "power",
        "south",
        "round",
        "found",
        "down",
      ],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://ecampusontario.pressbooks.pub/lexicalsets/chapter/16-mouth-lexical-set/#phrases",
        },
      ],
    },

    p: {
      name: "P",
      category: "consonant",
      exampleWords: ["people", "pie", "spy", "open", "top"],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/p-words.html#:~:text=Initial P Phrases and Sentences",
        },
      ],
    },
    b: {
      name: "B",
      category: "consonant",
      exampleWords: ["boy", "obey", "job", "rabbit", "hobby"],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/b-words.html#:~:text=Initial B Phrases and Sentences",
        },
      ],
    },
    t: {
      name: "T",
      category: "consonant",
      exampleWords: [
        "too",
        "two",
        "to",
        "team",
        "ten",
        "tan",
        "tell",
        "today",
        "tomorrow",
        "tonight",
        "together",
      ],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/t-words.html#:~:text=Initial T Phrases and Sentences",
        },
      ],
    },
    d: {
      name: "D",
      category: "consonant",
      exampleWords: [
        "do",
        "different",
        "difficult",
        "done",
        "deliver",
        "dinner",
        "dance",
      ],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/d-words.html#:~:text=Initial D Phrases and Sentences",
        },
      ],
    },
    k: {
      name: "K",
      category: "consonant",
      exampleWords: ["cold", "calm", "chrome", "quiz", "queue", "Kim"],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/k-words.html#:~:text=Initial K Phrases and Sentences",
        },
      ],
    },
    g: {
      name: "G",
      category: "consonant",
      exampleWords: ["go", "gone", "get", "gig", "give"],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/g-words.html#:~:text=Initial G Phrases and Sentences",
        },
      ],
    },
    ch: {
      name: "CH",
      category: "consonant",
      exampleWords: [
        "mention",
        "cheap",
        "reached",
        "try",
        "industry",
        "situation",
        "Portuguese",
        "chips",
      ],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/ch-words.html#:~:text=Initial CH Phrases and Sentences",
        },
      ],
    },
    j: {
      name: "J",
      category: "consonant",
      exampleWords: ["join", "jam", "judge", "agent", "jump", "page"],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/j-words.html#:~:text=Initial J Phrases and Sentences",
        },
      ],
    },
    f: {
      name: "F",
      category: "consonant",
      exampleWords: ["fish", "finance", "finish", "off", "offer"],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/f-words.html#:~:text=Initial F Phrases and Sentences",
        },
      ],
    },
    v: {
      name: "V",
      category: "consonant",
      exampleWords: ["very", "vote", "save", "avoid", "vision", "voice"],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/v-words.html#:~:text=Initial V Phrases and Sentences",
        },
      ],
    },
    th: {
      name: "TH",
      category: "consonant",
      exampleWords: [
        "thin",
        "think",
        "with",
        "three",
        "thing",
        "thick",
        "author",
      ],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/voiceless-th-words.html#:~:text=Initial Voiceless TH Phrases and Sentences",
        },
      ],
    },
    dh: {
      name: "DH",
      category: "consonant",
      exampleWords: ["this", "that", "the", "they", "then", "there"],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/voiced-th-words.html#:~:text=Initial Voiced TH Phrases and Sentences",
        },
      ],
    },
    s: {
      name: "S",
      category: "consonant",
      exampleWords: ["so", "basic", "small", "beside", "smile", "sleep"],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/s-words.html#:~:text=Initial S Phrases and Sentences",
        },
      ],
    },
    z: {
      name: "Z",
      category: "consonant",
      exampleWords: ["zone", "zero", "was", "Portuguese", "is", "phase"],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/z-words.html#:~:text=Initial Z Phrases and Sentences",
        },
      ],
    },
    sh: {
      name: "SH",
      category: "consonant",
      exampleWords: ["ship", "session", "shot", "shape", "wish"],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/sh-words.html#:~:text=Initial SH Phrases and Sentences",
        },
      ],
    },
    zh: {
      name: "ZH",
      category: "consonant",
      exampleWords: [
        "azure",
        "seizure",
        "vision",
        "precision",
        "Asia",
        "treasure",
        "pleasure",
      ],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/zh-words.html#:~:text=Initial ZH Phrases and Sentences",
        },
      ],
    },
    h: {
      name: "H",
      category: "consonant",
      exampleWords: ["hi", "hello", "high", "house", "hope", "horse", "hotel"],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/h-words.html#:~:text=Initial H Phrases and Sentences",
        },
      ],
    },
    m: {
      name: "M",
      category: "consonant",
      exampleWords: ["company", "them", "him", "himself", "theme", "team"],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/m-words.html#:~:text=Final M Phrases and Sentences",
        },
      ],
    },
    n: {
      name: "N",
      category: "consonant",
      exampleWords: [
        "in",
        "been",
        "nonprofit",
        "soon",
        "afternoon",
        "noon",
        "consistent",
        "attention",
        "input",
        "Austin",
      ],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/n-words.html#:~:text=Final N Phrases and Sentences",
        },
      ],
    },
    ng: {
      name: "NG",
      category: "consonant",
      exampleWords: ["being", "sing", "thing", "living", "thinking", "ringing"],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/ng-words.html#:~:text=Final NG Phrases and Sentences",
        },
      ],
    },
    r: {
      name: "R",
      category: "consonant",
      exampleWords: [
        "remember",
        "restaurant",
        "word",
        "world",
        "work",
        "order",
        "thirty",
      ],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/r-words.html#:~:text=Initial R Phrases and Sentences",
        },
      ],
    },
    l: {
      name: "L",
      category: "consonant",
      exampleWords: ["people", "all", "cold", "Brazil", "school", "small"],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/l-words.html#:~:text=Final L Phrases and Sentences",
        },
      ],
    },
    w: {
      name: "W",
      category: "consonant",
      exampleWords: [
        "one",
        "well",
        "will",
        "cuisines",
        "bilingual",
        "warm",
        "with",
        "squirrel",
      ],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/w-words.html#:~:text=Initial W Phrases and Sentences",
        },
      ],
    },
    y: {
      name: "Y",
      category: "consonant",
      exampleWords: [
        "year",
        "document",
        "value",
        "United States",
        "Europe",
        "review",
        "evaluate",
        "vocabulary",
        "senior",
        "regular",
      ],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://www.home-speech-home.com/y-words.html#:~:text=Initial Y Phrases and Sentences",
        },
      ],
    },
  },

  // Issue-level content
  issues: {
    "kit-fleece": {
      name: "Kit-Fleece Confusion",
      shortName: "fleece",
      target: "kit",
      exampleWords: [
        { word: "ship", correct: "/ʃɪp/", incorrect: "/ʃip/" },
        { word: "sheep", correct: "/ʃip/", incorrect: "/ʃɪp/" },
        { word: "bit", correct: "/bɪt/", incorrect: "/bit/" },
        { word: "beat", correct: "/bit/", incorrect: "/bɪt/" },
        { word: "sit", correct: "/sɪt/", incorrect: "/sit/" },
        { word: "seat", correct: "/sit/", incorrect: "/sɪt/" },
      ],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://ecampusontario.pressbooks.pub/lexicalsets/chapter/7-kit-fleece-lexical-set/#phrases",
        },
      ],
    },

    "trap-dress": {
      name: "Trap-Dress Confusion",
      shortName: "dress",
      target: "trap",
      exampleWords: [
        { word: "cat", correct: "/kæt/", incorrect: "/ket/" },
        { word: "bed", correct: "/bed/", incorrect: "/bæd/" },
        { word: "hat", correct: "/hæt/", incorrect: "/het/" },
        { word: "red", correct: "/red/", incorrect: "/ræd/" },
        { word: "bad", correct: "/bæd/", incorrect: "/bed/" },
        { word: "said", correct: "/sed/", incorrect: "/sæd/" },
      ],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://ecampusontario.pressbooks.pub/lexicalsets/chapter/8-trap-dress-lexical-set/#phrases",
        },
      ],
    },

    "dh-d": {
      name: "DH-D Confusion",
      shortName: "d",
      target: "dh",
      exampleWords: [
        { word: "this", correct: "/ðɪs/", incorrect: "/dɪs/" },
        { word: "that", correct: "/ðæt/", incorrect: "/dæt/" },
        { word: "the", correct: "/ðə/", incorrect: "/də/" },
        { word: "they", correct: "/ðeɪ/", incorrect: "/deɪ/" },
        { word: "then", correct: "/ðen/", incorrect: "/den/" },
        { word: "there", correct: "/ðer/", incorrect: "/der/" },
      ],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://ecampusontario.pressbooks.pub/lexicalsets/chapter/9-dh-d-lexical-set/#phrases",
        },
      ],
    },

    "dark-l-o": {
      name: "Dark L - O Confusion",
      shortName: "o",
      target: "dark-l",
      exampleWords: [
        { word: "ball", correct: "/bɔɫ/", incorrect: "/bɔo/" },
        { word: "call", correct: "/kɔɫ/", incorrect: "/kɔo/" },
        { word: "tall", correct: "/tɔɫ/", incorrect: "/tɔo/" },
        { word: "wall", correct: "/wɔɫ/", incorrect: "/wɔo/" },
        { word: "fall", correct: "/fɔɫ/", incorrect: "/fɔo/" },
        { word: "mall", correct: "/mɔɫ/", incorrect: "/mɔo/" },
      ],
      externalResources: [
        {
          name: "Practice Phrases",
          url: "https://ecampusontario.pressbooks.pub/lexicalsets/chapter/10-dark-l-o-lexical-set/#phrases",
        },
      ],
    },
  },

  // Helper functions
  getTargetData: (targetName) => {
    try {
      if (!targetName || typeof targetName !== "string") return null;
      return accentExplorerData.targets[targetName.toLowerCase()] || null;
    } catch (error) {
      console.warn("Error getting target data:", error);
      return null;
    }
  },

  getTargetDisplayName: (targetName) => {
    try {
      if (!targetName || typeof targetName !== "string") return targetName;

      const target = accentExplorerData.targets[targetName.toLowerCase()];
      if (!target) return targetName;

      const phoneticSymbol = accentExplorerData.getPhoneticSymbol(
        target.name,
        target.category
      );
      return phoneticSymbol ? `${target.name} ${phoneticSymbol}` : target.name;
    } catch (error) {
      console.warn("Error getting target display name:", error);
      return targetName;
    }
  },

  getPhoneticSymbol: (targetName, category) => {
    try {
      if (!targetName || !category || !safeWlsData) return null;

      const categoryData = safeWlsData[category.toLowerCase() + "s"];
      if (!categoryData) return null;

      // Map our target names to wls-data keys
      const keyMap = {
        // Vowels
        KIT: "KIT",
        FLEECE: "FLEECE",
        TRAP: "TRAP",
        DRESS: "DRESS",
        GOOSE: "GOOSE",
        FOOT: "FOOT",
        STRUT: "STRUT",
        LOT: "LOT",
        FACE: "FACE",
        PRICE: "PRICE",
        CHOICE: "CHOICE",
        GOAT: "GOAT",
        MOUTH: "MOUTH",

        // Consonants
        P: "P",
        B: "B",
        T: "T",
        D: "D",
        K: "K",
        G: "G",
        CH: "CH",
        J: "J",
        F: "F",
        V: "V",
        TH: "TH_voiceless",
        DH: "TH_voiced",
        S: "S",
        Z: "Z",
        SH: "SH",
        ZH: "ZH",
        H: "H",
        M: "M",
        N: "N",
        NG: "NG",
        R: "R",
        L: "L",
        W: "W",
        Y: "Y",
      };

      const wlsKey = keyMap[targetName];
      if (!wlsKey || !categoryData[wlsKey]) return null;

      const representations = categoryData[wlsKey].representations;
      return representations?.phonemic || null;
    } catch (error) {
      console.warn("Error getting phonetic symbol:", error);
      return null;
    }
  },

  getIssueData: (issueName) => {
    try {
      if (!issueName || typeof issueName !== "string") return null;
      return accentExplorerData.issues[issueName.toLowerCase()] || null;
    } catch (error) {
      console.warn("Error getting issue data:", error);
      return null;
    }
  },

  getAllTargets: () => {
    return Object.values(accentExplorerData.targets);
  },

  getAllIssues: () => {
    return Object.values(accentExplorerData.issues);
  },

  getIssuesForTarget: (targetName) => {
    return Object.values(accentExplorerData.issues).filter(
      (issue) => issue.target === targetName.toLowerCase()
    );
  },

  getTargetsForIssue: (issueName) => {
    return Object.values(accentExplorerData.issues)
      .filter((issue) => issue.shortName === issueName.toLowerCase())
      .map((issue) => issue.target);
  },

  hasTargetPage: (targetName) => {
    try {
      if (!targetName || typeof targetName !== "string") return false;
      const targetData = accentExplorerData.getTargetData(targetName);
      return targetData !== null;
    } catch (error) {
      console.warn("Error checking if target has page:", error);
      return false;
    }
  },
};

export default accentExplorerData;
