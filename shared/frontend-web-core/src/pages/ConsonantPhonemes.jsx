import { PhonemeCard } from "@/components/PhonemeCard";

// Consonant data organized by type
const consonantData = {
  stops: [
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
        "qu",
        "cqu",
        "que",
        "x",
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
  ],
  fricatives: [
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
        "ç",
        "zz",
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
        "xi",
        "tu",
        "si",
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
      spellings: ["z", "s", "ge", "g", "j", "x"],
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
  ],
  affricates: [
    {
      name: "CH",
      respelling: "ch",
      phonemic: "/tʃ/",
      phonetic: "[tʃ]",
      spellings: ["ch", "tch", "t", "c", "cz", "ti"],
      examples: ["choose", "itch", "future", "cello", "Czech", "question"],
    },
    {
      name: "J",
      respelling: "j",
      phonemic: "/dʒ/",
      phonetic: "[dʒ]",
      spellings: ["j", "g", "dj", "ge", "dge", "d", "d y"],
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
  ],
  approximants: [
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
      spellings: ["w", "wh", "u", "o"],
      examples: ["wet", "what", "quick", "choir"],
    },
    {
      name: "Y",
      respelling: "y",
      phonemic: "/j/",
      phonetic: "[j]",
      spellings: ["y", "i", "j"],
      examples: ["yes", "onion", "fjord"],
    },
  ],
  nasals: [
    {
      name: "M",
      respelling: "m",
      phonemic: "/m/",
      phonetic: "[m]",
      spellings: ["m", "mm", "mb", "mn", "lm", "hm", "gm"],
      examples: ["man", "common", "lamb", "solemn", "calm", "Hmong", "phlegm"],
    },
    {
      name: "N",
      respelling: "n",
      phonemic: "/n/",
      phonetic: "[n]",
      spellings: ["n", "nn", "kn", "gn", "pn", "mn", "nne", "ne"],
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
      spellings: ["ng", "ngue", "nc", "nk"],
      examples: ["long", "tongue", "uncle", "bank"],
    },
  ],
};

export default function ConsonantPhonemes() {
  return (
    <div className="w-full max-w-[2000px] mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Consonant Phonemes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Stops */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Stops</h2>
          <div className="grid grid-cols-3 gap-1">
            {consonantData.stops.map((consonant) => (
              <PhonemeCard
                key={consonant.name}
                {...consonant}
                type="consonant"
              />
            ))}
          </div>
        </div>

        {/* Fricatives */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Fricatives</h2>
          <div className="grid grid-cols-3 gap-1">
            {consonantData.fricatives.map((consonant) => (
              <PhonemeCard
                key={consonant.name}
                {...consonant}
                type="consonant"
              />
            ))}
          </div>
        </div>

        {/* Affricates */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Affricates</h2>
          <div className="grid grid-cols-2 gap-1">
            {consonantData.affricates.map((consonant) => (
              <PhonemeCard
                key={consonant.name}
                {...consonant}
                type="consonant"
              />
            ))}
          </div>
        </div>

        {/* Approximants */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Approximants</h2>
          <div className="grid grid-cols-2 gap-1">
            {consonantData.approximants.map((consonant) => (
              <PhonemeCard
                key={consonant.name}
                {...consonant}
                type="consonant"
              />
            ))}
          </div>
        </div>

        {/* Nasals */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Nasals</h2>
          <div className="grid grid-cols-3 gap-1">
            {consonantData.nasals.map((consonant) => (
              <PhonemeCard
                key={consonant.name}
                {...consonant}
                type="consonant"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
