import { PhonemeCard } from "@/components/PhonemeCard";

// Vowel data organized by lexical sets
const vowelData = {
  fleece: [
    {
      name: "FLEECE",
      respelling: "ee",
      phonemic: "/iː/",
      phonetic: "[iː], [i]",
      spellings: ["ee", "ea", "e", "ie", "ei", "i", "ey", "y", "eo", "ay"],
      examples: [
        "fleece",
        "sea",
        "me",
        "field",
        "receive",
        "ski",
        "key",
        "happy",
        "people",
        "quay",
      ],
    },
  ],
  kit: [
    {
      name: "KIT",
      respelling: "i",
      phonemic: "/ɪ/",
      phonetic: "[ɪ], [i]",
      spellings: ["i", "y", "ui", "e", "ee", "o", "u"],
      examples: ["kit", "myth", "build", "pretty", "been", "women", "busy"],
    },
  ],
  dress: [
    {
      name: "DRESS",
      respelling: "e",
      phonemic: "/e/",
      phonetic: "[e], [ɛ]",
      spellings: ["e", "ea", "ai", "a", "ie", "eo", "ay"],
      examples: ["dress", "head", "said", "any", "friend", "leopard", "says"],
    },
  ],
  trap: [
    {
      name: "TRAP",
      respelling: "a",
      phonemic: "/æ/",
      phonetic: "[æ], [a]",
      spellings: ["a", "ai", "au", "al"],
      examples: ["trap", "plaid", "laugh", "half"],
    },
  ],
  strut: [
    {
      name: "STRUT",
      respelling: "u",
      phonemic: "/ʌ/",
      phonetic: "[ʌ], [ɐ]",
      spellings: ["u", "o", "ou", "oo", "oe"],
      examples: ["strut", "love", "young", "blood", "does"],
    },
  ],
  lot: [
    {
      name: "LOT",
      respelling: "o",
      phonemic: "/ɒ/",
      phonetic: "[ɒ], [ɑ]",
      spellings: ["o", "a", "au", "ou", "ow"],
      examples: ["lot", "watch", "because", "cough", "knowledge"],
    },
  ],
  foot: [
    {
      name: "FOOT",
      respelling: "oo",
      phonemic: "/ʊ/",
      phonetic: "[ʊ], [u]",
      spellings: ["oo", "u", "o", "ou", "w"],
      examples: ["foot", "put", "wolf", "could", "woman"],
    },
  ],
  goose: [
    {
      name: "GOOSE",
      respelling: "oo",
      phonemic: "/uː/",
      phonetic: "[uː], [u]",
      spellings: ["oo", "ue", "u", "ew", "ui", "o", "oe", "ou", "ough", "wo"],
      examples: [
        "goose",
        "blue",
        "tune",
        "few",
        "fruit",
        "do",
        "shoe",
        "soup",
        "through",
        "two",
      ],
    },
  ],
  face: [
    {
      name: "FACE",
      respelling: "ay",
      phonemic: "/eɪ/",
      phonetic: "[eɪ], [eː]",
      spellings: ["a", "ai", "ay", "ea", "ei", "eigh", "ey", "a_e"],
      examples: [
        "face",
        "rain",
        "day",
        "break",
        "vein",
        "eight",
        "they",
        "make",
      ],
    },
  ],
  price: [
    {
      name: "PRICE",
      respelling: "y",
      phonemic: "/aɪ/",
      phonetic: "[aɪ], [ʌɪ]",
      spellings: ["i", "y", "ie", "igh", "ei", "uy", "ye", "i_e", "y_e"],
      examples: [
        "price",
        "my",
        "die",
        "high",
        "either",
        "buy",
        "bye",
        "like",
        "type",
      ],
    },
  ],
  choice: [
    {
      name: "CHOICE",
      respelling: "oy",
      phonemic: "/ɔɪ/",
      phonetic: "[ɔɪ]",
      spellings: ["oi", "oy", "uoy"],
      examples: ["choice", "boy", "buoy"],
    },
  ],
  goat: [
    {
      name: "GOAT",
      respelling: "oh",
      phonemic: "/əʊ/, /oʊ/",
      phonetic: "[əʊ], [oʊ]",
      spellings: ["o", "oa", "ow", "oe", "ou", "ough", "ew", "o_e"],
      examples: [
        "goat",
        "boat",
        "show",
        "toe",
        "soul",
        "though",
        "sew",
        "home",
      ],
    },
  ],
  mouth: [
    {
      name: "MOUTH",
      respelling: "ow",
      phonemic: "/aʊ/",
      phonetic: "[aʊ], [æʊ]",
      spellings: ["ou", "ow", "ough"],
      examples: ["mouth", "now", "bough"],
    },
  ],
  nurse: [
    {
      name: "NURSE",
      respelling: "er",
      phonemic: "/ɜː/",
      phonetic: "[ɜː], [ɝ]",
      spellings: ["er", "ir", "ur", "ear", "or", "our", "yr", "ere", "eur"],
      examples: [
        "nurse",
        "bird",
        "hurt",
        "learn",
        "word",
        "journey",
        "myrrh",
        "were",
        "amateur",
      ],
    },
  ],
  near: [
    {
      name: "NEAR",
      respelling: "eer",
      phonemic: "/ɪə/",
      phonetic: "[ɪə], [ir]",
      spellings: ["eer", "ear", "ere", "ier", "ir", "ea"],
      examples: ["near", "beer", "here", "serious", "spirit", "idea"],
    },
  ],
  square: [
    {
      name: "SQUARE",
      respelling: "air",
      phonemic: "/eə/",
      phonetic: "[eə], [er]",
      spellings: ["are", "air", "ear", "eir", "aer", "ayer"],
      examples: ["square", "fair", "bear", "their", "aerial", "prayer"],
    },
  ],
  start: [
    {
      name: "START",
      respelling: "ar",
      phonemic: "/ɑː/",
      phonetic: "[ɑː], [ɑr]",
      spellings: ["ar", "ear", "uar", "aar"],
      examples: ["start", "heart", "guard", "bazaar"],
    },
  ],
  north: [
    {
      name: "NORTH",
      respelling: "or",
      phonemic: "/ɔː/",
      phonetic: "[ɔː], [or]",
      spellings: ["or", "ore", "oar", "oor", "our", "ar", "aur", "aw"],
      examples: [
        "north",
        "more",
        "board",
        "door",
        "four",
        "war",
        "dinosaur",
        "saw",
      ],
    },
  ],
  force: [
    {
      name: "FORCE",
      respelling: "or",
      phonemic: "/ɔː/",
      phonetic: "[ɔː], [or]",
      spellings: ["or", "ore", "oar", "oor", "our", "ar"],
      examples: ["force", "more", "board", "door", "four", "war"],
    },
  ],
  happy: [
    {
      name: "happY",
      respelling: "y",
      phonemic: "/i/",
      phonetic: "[i]",
      spellings: ["y", "ie", "ee", "i", "ey"],
      examples: ["happy", "movie", "coffee", "spaghetti", "hockey"],
    },
  ],
  letter: [
    {
      name: "lettER",
      respelling: "er",
      phonemic: "/ə/",
      phonetic: "[ə], [ɚ]",
      spellings: ["er", "or", "ar", "re", "our", "eur", "ure", "yr"],
      examples: [
        "letter",
        "doctor",
        "dollar",
        "centre",
        "colour",
        "amateur",
        "figure",
        "martyr",
      ],
    },
  ],
  comma: [
    {
      name: "commA",
      respelling: "a",
      phonemic: "/ə/",
      phonetic: "[ə]",
      spellings: ["a", "e", "o", "u", "i"],
      examples: ["about", "the", "bottom", "supply", "pencil"],
    },
  ],
};

export default function VowelPhonemes() {
  return (
    <div className="w-full max-w-[2000px] mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Vowel Phonemes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Monophthongs */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Monophthongs</h2>
          <div className="grid grid-cols-1 gap-1">
            {Object.entries(vowelData)
              .filter(([key]) =>
                [
                  "fleece",
                  "kit",
                  "dress",
                  "trap",
                  "strut",
                  "lot",
                  "foot",
                  "goose",
                  "nurse",
                  "happy",
                  "letter",
                  "comma",
                ].includes(key)
              )
              .map(([key, vowels]) => (
                <div key={key}>
                  {vowels.map((vowel) => (
                    <PhonemeCard key={vowel.name} {...vowel} type="vowel" />
                  ))}
                </div>
              ))}
          </div>
        </div>

        {/* Diphthongs */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Diphthongs</h2>
          <div className="grid grid-cols-1 gap-1">
            {Object.entries(vowelData)
              .filter(([key]) =>
                ["face", "price", "choice", "goat", "mouth"].includes(key)
              )
              .map(([key, vowels]) => (
                <div key={key}>
                  {vowels.map((vowel) => (
                    <PhonemeCard key={vowel.name} {...vowel} type="vowel" />
                  ))}
                </div>
              ))}
          </div>
        </div>

        {/* R-colored vowels */}
        <div>
          <h2 className="text-xl font-semibold mb-4">R-colored vowels</h2>
          <div className="grid grid-cols-1 gap-1">
            {Object.entries(vowelData)
              .filter(([key]) =>
                ["near", "square", "start", "north", "force"].includes(key)
              )
              .map(([key, vowels]) => (
                <div key={key}>
                  {vowels.map((vowel) => (
                    <PhonemeCard key={vowel.name} {...vowel} type="vowel" />
                  ))}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
