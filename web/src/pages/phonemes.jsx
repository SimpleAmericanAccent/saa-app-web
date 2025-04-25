import { PhonemeCard } from "@/components/PhonemeCard";

// Vowel data
const vowels = [
  {
    name: "FLEECE",
    respelling: "ee",
    phonemic: "/i/",
    phonetic: "[i]",
    spellings: ["e", "ee", "ea", "i", "ei", "ie", "oe", "ae"],
    examples: ["he", "bee", "sea", "ski", "seize", "chief", "Phoebe", "aeon"],
  },
  {
    name: "happY",
    respelling: "ee",
    phonemic: "/i/",
    phonetic: "[i]",
    spellings: ["y", "ey", "ie", "i"],
    examples: ["happy", "monkey", "movie", "taxi"],
  },
  {
    name: "KIT",
    respelling: "i",
    phonemic: "/ɪ/",
    phonetic: "[ɪ]",
    spellings: ["i", "y", "ui", "ie", "e", "ee", "a", "o", "u"],
    examples: [
      "sit",
      "gym",
      "build",
      "sieve",
      "pretty",
      "been",
      "damage",
      "women",
      "busy",
    ],
  },
  {
    name: "DRESS",
    respelling: "e",
    phonemic: "/e/",
    phonetic: "[ɛ]",
    spellings: ["e", "ea", "a", "ai", "ie", "eo", "ei"],
    examples: ["bed", "head", "many", "said", "friend", "leopard", "heifer"],
  },
  {
    name: "TRAP",
    respelling: "a",
    phonemic: "/æ/",
    phonetic: "[æ]",
    spellings: ["a", "ai", "au", "plaid"],
    examples: ["cat", "plait", "laugh", "plaid"],
  },
  {
    name: "LOT",
    respelling: "o",
    phonemic: "/ɒ/",
    phonetic: "[ɑ]",
    spellings: ["o", "a", "au", "ow", "ou", "ach"],
    examples: ["hot", "want", "because", "knowledge", "cough", "yacht"],
  },
  {
    name: "STRUT",
    respelling: "uh",
    phonemic: "/ʌ/",
    phonetic: "[ʌ]",
    spellings: ["u", "o", "oo", "ou", "oe"],
    examples: ["cut", "son", "blood", "young", "does"],
  },
  {
    name: "FOOT",
    respelling: "u",
    phonemic: "/ʊ/",
    phonetic: "[ʊ]",
    spellings: ["oo", "u", "o", "ou"],
    examples: ["wood", "put", "woman", "could"],
  },
  {
    name: "GOOSE",
    respelling: "oo",
    phonemic: "/u/",
    phonetic: "[u]",
    spellings: [
      "o",
      "oo",
      "ou",
      "u",
      "ue",
      "ew",
      "wo",
      "eu",
      "ui",
      "ieu",
      "oe",
    ],
    examples: [
      "do",
      "too",
      "you",
      "tutor",
      "blue",
      "new",
      "two",
      "deuce",
      "bruise",
      "lieu",
      "shoe",
    ],
  },
  {
    name: "FACE",
    respelling: "ay",
    phonemic: "/eɪ/",
    phonetic: "[e̞ɪ̯]",
    spellings: [
      "a",
      "ai",
      "ay",
      "ei",
      "ey",
      "aig(h)",
      "eig(h)",
      "ea",
      "e",
      "ee",
      "et",
      "ae",
    ],
    examples: [
      "cake",
      "wait",
      "say",
      "vein",
      "they",
      "straight",
      "eight",
      "break",
      "café",
      "matinee",
      "ballet",
      "reggae",
    ],
  },
  {
    name: "PRICE",
    respelling: "iy",
    phonemic: "/aɪ/",
    phonetic: "[aɪ]",
    spellings: ["i", "ie", "y", "ye", "uy", "eye", "ai", "ei", "ui", "igh"],
    examples: [
      "time",
      "die",
      "try",
      "bye",
      "buy",
      "eye",
      "aisle",
      "height",
      "guide",
      "high",
    ],
  },
  {
    name: "CHOICE",
    respelling: "oy",
    phonemic: "/ɔɪ/",
    phonetic: "[ɔɪ]",
    spellings: ["oi", "oy", "uoy"],
    examples: ["coin", "boy", "buoy"],
  },
  {
    name: "GOAT",
    respelling: "oh",
    phonemic: "/əʊ/",
    phonetic: "[oʊ]",
    spellings: ["o", "oh", "oe", "ow", "ew", "oo", "oa", "aoh", "eau", "ough"],
    examples: [
      "go",
      "oh",
      "doe",
      "own",
      "sew",
      "brooch",
      "oak",
      "pharaoh",
      "beau",
      "though",
    ],
  },
  {
    name: "TRAM",
    respelling: "a",
    phonemic: "/æ/",
    phonetic: "[eə]",
    spellings: ["am", "an"],
    examples: ["ham", "ban"],
  },
  {
    name: "MOUTH",
    respelling: "ow",
    phonemic: "/aʊ/",
    phonetic: "[aʊ]",
    spellings: ["ou", "ow", "ough", "ao", "au"],
    examples: ["mouth", "how", "bough", "Tao", "tau"],
  },
  {
    name: "commA",
    respelling: "uh",
    phonemic: "/ə/",
    phonetic: "[ə]",
    spellings: ["a", "u"],
    examples: ["about", "upon"],
  },
];

// Consonant data
const consonants = [
  {
    name: "P",
    respelling: "p",
    phonemic: "/p/",
    phonetic: "[pʰ], [p], [p̚]",
    spellings: ["p", "pp", "pe", "ppe"],
    examples: ["pie", "hippo", "hope", "steppe"],
  },
  {
    name: "B",
    respelling: "b",
    phonemic: "/b/",
    phonetic: "[b], [b̚]",
    spellings: ["b", "bb", "be", "bh"],
    examples: ["boy", "rabbit", "tube", "Bhutan"],
  },
  {
    name: "T",
    respelling: "t",
    phonemic: "/t/",
    phonetic: "[tʰ], [t], [ɾ], [ʔ], [tˀ], [t̚]",
    spellings: ["t", "tt", "th", "ed", "bt", "pt", "te"],
    examples: ["to", "pretty", "Thames", "liked", "doubt", "receipt", "bite"],
  },
  {
    name: "D",
    respelling: "d",
    phonemic: "/d/",
    phonetic: "[d], [d̚], [ɾ]",
    spellings: ["d", "dd", "ed", "de", "ld", "dh", "ddh"],
    examples: ["do", "add", "loved", "made", "could", "dharma", "Buddha"],
  },
  {
    name: "K",
    respelling: "k",
    phonemic: "/k/",
    phonetic: "[kʰ], [k], [k̚]",
    spellings: [
      "k",
      "kk",
      "kh",
      "ck",
      "c",
      "cc",
      "ch",
      "q",
      "qu (becomes kw)",
      "cqu (becomes kw)",
      "que",
      "x (becomes ks)",
    ],
    examples: [
      "key",
      "trekking",
      "khaki",
      "back",
      "can",
      "account",
      "chaos",
      "Qatar",
      "quick",
      "acquire",
      "unique",
      "excite",
    ],
  },
  {
    name: "G",
    respelling: "g",
    phonemic: "/g/",
    phonetic: "[g], [g̚]",
    spellings: ["g", "gg", "gh", "gu", "gue"],
    examples: ["go", "beggar", "ghost", "guest", "league"],
  },
  {
    name: "F",
    respelling: "f",
    phonemic: "/f/",
    phonetic: "[f]",
    spellings: ["f", "ph", "gh", "ff", "lf", "pf", "ft", "fe"],
    examples: [
      "friend",
      "phone",
      "tough",
      "stuff",
      "calf",
      "Pfizer",
      "often",
      "wife",
    ],
  },
  {
    name: "V",
    respelling: "v",
    phonemic: "/v/",
    phonetic: "[v]",
    spellings: ["v", "vv", "ve", "f", "ph"],
    examples: ["very", "savvy", "save", "of", "Stephen"],
  },
  {
    name: "TH (voiceless)",
    respelling: "th",
    phonemic: "/θ/",
    phonetic: "[θ]",
    spellings: ["th"],
    examples: ["thin", "think", "with", "three", "breath"],
  },
  {
    name: "TH (voiced)",
    respelling: "th",
    phonemic: "/ð/",
    phonetic: "[ð]",
    spellings: ["th"],
    examples: ["this", "that", "the", "they", "smooth"],
  },
  {
    name: "S",
    respelling: "s",
    phonemic: "/s/",
    phonetic: "[s]",
    spellings: [
      "s",
      "ss",
      "ce",
      "se",
      "sc",
      "st",
      "ps",
      "ts",
      "c",
      "ç (or c)",
      "zz (becomes t+s)",
    ],
    examples: [
      "sun",
      "pass",
      "nice",
      "house",
      "science",
      "listen",
      "psychology",
      "tsunami",
      "city",
      "façade",
      "pizza",
    ],
  },
  {
    name: "Z",
    respelling: "z",
    phonemic: "/z/",
    phonetic: "[z]",
    spellings: ["z", "ze", "zz", "se", "s", "x"],
    examples: ["zone", "bronze", "jazz", "rose", "his", "xylophone"],
  },
  {
    name: "SH",
    respelling: "sh",
    phonemic: "/ʃ/",
    phonetic: "[ʃ]",
    spellings: [
      "sh",
      "ch",
      "s",
      "ss",
      "sci",
      "sch",
      "ti",
      "ci",
      "xi (becomes k+sh)",
      "tu",
      "si",
      "ci",
      "ssi",
      "shi",
    ],
    examples: [
      "shoe",
      "chef",
      "sugar",
      "issue",
      "omniscient",
      "schmooze",
      "nation",
      "social",
      "anxious",
      "actual",
      "tension",
      "suspicion",
      "mission",
      "fashion",
    ],
  },
  {
    name: "ZH",
    respelling: "zh",
    phonemic: "/ʒ/",
    phonetic: "[ʒ]",
    spellings: ["z", "s", "ge", "g", "j", "x (becomes g+zh)"],
    examples: ["azure", "vision", "beige", "genre", "Jacques", "luxury"],
  },
  {
    name: "H",
    respelling: "h",
    phonemic: "/h/",
    phonetic: "[h]",
    spellings: ["h", "wh", "j"],
    examples: ["hi", "who", "jalapeño"],
  },
  {
    name: "L",
    respelling: "l",
    phonemic: "/l/",
    phonetic: "[ɫ]",
    spellings: ["l", "ll", "le", "al", "el", "il", "ol", "ul", "yl", "ile"],
    examples: [
      "like",
      "hello",
      "table",
      "cymbal",
      "tunnel",
      "pupil",
      "symbol",
      "useful",
      "pterodactyl",
      "mobile",
    ],
  },
  {
    name: "R",
    respelling: "r",
    phonemic: "/r/",
    phonetic: "[ɹ̈], [ɹ̠]",
    spellings: ["r", "rr", "re", "wr", "rh", "rrh"],
    examples: ["red", "arrest", "bore", "write", "rhyme", "diarrhea"],
  },
  {
    name: "W",
    respelling: "w",
    phonemic: "/w/",
    phonetic: "[w]",
    spellings: ["w", "wh", "u (becomes w)", "o (becomes w)"],
    examples: ["wet", "what", "quick", "choir"],
  },
  {
    name: "Y",
    respelling: "y",
    phonemic: "/j/",
    phonetic: "[j]",
    spellings: ["y", "i (becomes y)", "j"],
    examples: ["yes", "onion", "fjord"],
  },
  {
    name: "M",
    respelling: "m",
    phonemic: "/m/",
    phonetic: "[m]",
    spellings: [
      "m",
      "mm",
      "mb (silent b)",
      "mn (silent n)",
      "lm (silent l)",
      "hm",
      "gm (silent g)",
    ],
    examples: ["man", "common", "lamb", "solemn", "calm", "Hmong", "phlegm"],
  },
  {
    name: "N",
    respelling: "n",
    phonemic: "/n/",
    phonetic: "[n]",
    spellings: [
      "n",
      "nn",
      "kn (silent k)",
      "gn (silent g)",
      "pn (silent p)",
      "mn (silent m)",
      "nne",
      "ne",
    ],
    examples: [
      "no",
      "innovate",
      "know",
      "gnat",
      "pneumonia",
      "mnemonic",
      "Anne",
      "phone",
    ],
  },
  {
    name: "NG",
    respelling: "ng",
    phonemic: "/ŋ/",
    phonetic: "[ŋ], [ŋg]",
    spellings: [
      "ng (may or may not include g sound)",
      "ngue",
      "nc (becomes ng+k)",
      "nk (becomes ng+k)",
    ],
    examples: ["long", "tongue", "uncle", "bank"],
  },
  {
    name: "CH",
    respelling: "ch",
    phonemic: "/tʃ/",
    phonetic: "[tʃ]",
    spellings: ["ch", "tch", "t", "c", "cz", "ti (may become ch or sh)"],
    examples: ["choose", "itch", "future", "cello", "Czech", "question"],
  },
  {
    name: "J",
    respelling: "j",
    phonemic: "/dʒ/",
    phonetic: "[dʒ]",
    spellings: [
      "j",
      "g",
      "dj",
      "ge",
      "dge",
      "d",
      "d y (across word boundary, can be reduced)",
    ],
    examples: [
      "joy",
      "giraffe",
      "adjust",
      "rage",
      "edge",
      "soldier",
      "did you",
    ],
  },
];

const VOWEL_ORDER = [
  "FLEECE",
  "GOOSE",
  "FACE",
  "happY",
  "KIT",
  "FOOT",
  "PRICE",
  "commA",
  "DRESS",
  "STRUT",
  "CHOICE",
  "TRAP",
  "LOT",
  "GOAT",
  "TRAM",
  "",
  "",
  "MOUTH",
  "",
];

export default function Phonemes() {
  // Create a grid layout for vowels
  const vowelGrid = [
    ["FLEECE", "GOOSE", "FACE", "happY"],
    ["KIT", "FOOT", "PRICE", "commA"],
    ["DRESS", "STRUT", "CHOICE", ""],
    ["TRAP", "LOT", "GOAT", "TRAM"],
    ["", "", "MOUTH", ""],
  ];

  // Create a grid layout for consonants - stops and fricatives
  const consonantGrid1 = [
    ["P", "T", "K", "CH", ""],
    ["B", "D", "G", "J", ""],
    ["F", "TH (voiceless)", "S", "SH", "H"],
    ["V", "TH (voiced)", "Z", "ZH", ""],
  ];

  // Create a grid layout for consonants - approximants and nasals
  const consonantGrid2 = [
    ["L", "R", "", "", ""],
    ["W", "Y", "", "", ""],
    ["M", "N", "NG", "", ""],
  ];

  // Create maps of data for easy lookup
  const vowelMap = vowels.reduce((acc, vowel) => {
    acc[vowel.name] = vowel;
    return acc;
  }, {});

  const consonantMap = consonants.reduce((acc, consonant) => {
    acc[consonant.name] = consonant;
    return acc;
  }, {});

  return (
    <div className="w-full max-w-[2000px] mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Phonemes</h1>
      <div className="md:flex md:gap-16 md:items-start">
        <div className="flex-none">
          <h2 className="text-xl font-semibold mb-4">Vowels</h2>
          <div className="grid grid-cols-4 gap-1 w-[280px]">
            {vowelGrid.flat().map((vowelName, index) => (
              <div key={index} className={vowelName ? "" : "invisible"}>
                {vowelName && (
                  <PhonemeCard {...vowelMap[vowelName]} type="vowel" />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 md:mt-0 flex-none">
          <h2 className="text-xl font-semibold mb-4">
            Consonants (Stops & Fricatives)
          </h2>
          <div className="grid grid-cols-5 gap-1 w-[350px]">
            {consonantGrid1.flat().map((consonantName, index) => (
              <div key={index} className={consonantName ? "" : "invisible"}>
                {consonantName && (
                  <PhonemeCard
                    {...consonantMap[consonantName]}
                    type="consonant"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 md:mt-0 flex-none">
          <h2 className="text-xl font-semibold mb-4">
            Consonants (Approximants & Nasals)
          </h2>
          <div className="grid grid-cols-5 gap-1 w-[350px]">
            {consonantGrid2.flat().map((consonantName, index) => (
              <div key={index} className={consonantName ? "" : "invisible"}>
                {consonantName && (
                  <PhonemeCard
                    {...consonantMap[consonantName]}
                    type="consonant"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
