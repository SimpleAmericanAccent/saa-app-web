/**
 * Single source of truth for all phoneme definitions
 * This file consolidates all lexical sets, vowels, consonants, and their mappings
 */

// Main phoneme definitions
export const PHONEMES = {
  // Vowels (Lexical Sets)
  FLEECE: {
    arpabets: ["IY"],
    type: "vowel",
    ipa: "i",
    description: "Words with the vowel sound in 'fleece', 'sea', 'machine'",
    order: 1,
    formants: { F1: 350, F2: 2030 },
  },
  KIT: {
    arpabets: ["IH"],
    type: "vowel",
    ipa: "ɪ",
    description: "Words with the vowel sound in 'kit', 'fish', 'build'",
    order: 2,
    formants: { F1: 410, F2: 1800 },
  },
  TRAP: {
    arpabets: ["AE"],
    type: "vowel",
    ipa: "æ",
    description: "Words with the vowel sound in 'trap', 'cat', 'bad'",
    order: 3,
    formants: { F1: 700, F2: 1700 },
  },
  DRESS: {
    arpabets: ["EH"],
    type: "vowel",
    ipa: "ɛ",
    description: "Words with the vowel sound in 'dress', 'bed', 'head'",
    order: 4,
    formants: { F1: 630, F2: 1760 },
  },
  STRUT: {
    arpabets: ["AH"],
    type: "vowel",
    ipa: "ʌ",
    description: "Words with the vowel sound in 'strut', 'cup', 'love'",
    order: 5,
    formants: { F1: 600, F2: 1200 },
    note: "Stressed AH",
  },
  LOT: {
    arpabets: ["AA", "AO"],
    type: "vowel",
    ipa: "ɑ",
    description: "Words with the vowel sound in 'lot', 'odd', 'wash'",
    order: 6,
    formants: { F1: 700, F2: 1100 },
  },
  FACE: {
    arpabets: ["EY"],
    type: "vowel",
    ipa: "eɪ",
    description: "Words with the vowel sound in 'face', 'day', 'break'",
    order: 7,
  },
  GOAT: {
    arpabets: ["OW"],
    type: "vowel",
    ipa: "oʊ",
    description: "Words with the vowel sound in 'goat', 'show', 'no'",
    order: 10,
  },
  FOOT: {
    arpabets: ["UH"],
    type: "vowel",
    ipa: "ʊ",
    description: "Words with the vowel sound in 'foot', 'good', 'put'",
    order: 11,
    formants: { F1: 430, F2: 1080 },
  },
  GOOSE: {
    arpabets: ["UW"],
    type: "vowel",
    ipa: "u",
    description: "Words with the vowel sound in 'goose', 'two', 'blue'",
    order: 12,
    formants: { F1: 350, F2: 800 },
  },
  PRICE: {
    arpabets: ["AY"],
    type: "vowel",
    ipa: "aɪ",
    description: "Words with the vowel sound in 'price', 'high', 'try'",
    order: 13,
  },
  CHOICE: {
    arpabets: ["OY"],
    type: "vowel",
    ipa: "ɔɪ",
    description: "Words with the vowel sound in 'choice', 'boy', 'oil'",
    order: 14,
  },
  MOUTH: {
    arpabets: ["AW"],
    type: "vowel",
    ipa: "aʊ",
    description: "Words with the vowel sound in 'mouth', 'now', 'out'",
    order: 15,
  },
  NURSE: {
    arpabets: ["ER"],
    type: "vowel",
    ipa: "ər",
    description: "Words with the vowel sound in 'nurse', 'bird', 'word'",
    order: null,
  },
  HAPPY: {
    arpabets: ["IY"], // Same as FLEECE but in unstressed position
    type: "vowel",
    ipa: "i",
    description: "Words with the vowel sound in 'happy', 'city', 'pretty'",
    order: 22,
  },
  commA: {
    arpabets: ["AH"], // unstressed AH
    altNames: ["schwa"],
    type: "vowel",
    ipa: "ə",
    description:
      "Words with the reduced vowel sound in 'comma', 'about', 'the'",
    order: 24,
    formants: { F1: 525, F2: 1200 },
    note: "Unstressed AH (commA)",
  },

  // Consonants
  P: {
    arpabets: ["P"],
    type: "consonant",
    ipa: "p",
    description: "Voiceless bilabial plosive as in 'pin'",
    category: "Plosive",
    order: 1,
  },
  B: {
    arpabets: ["B"],
    type: "consonant",
    ipa: "b",
    description: "Voiced bilabial plosive as in 'bin'",
    category: "Plosive",
    order: 2,
  },
  T: {
    arpabets: ["T"],
    type: "consonant",
    ipa: "t",
    description: "Voiceless alveolar plosive as in 'tin'",
    category: "Plosive",
    order: 3,
  },
  D: {
    arpabets: ["D"],
    type: "consonant",
    ipa: "d",
    description: "Voiced alveolar plosive as in 'din'",
    category: "Plosive",
    order: 4,
  },
  K: {
    arpabets: ["K"],
    type: "consonant",
    ipa: "k",
    description: "Voiceless velar plosive as in 'kin'",
    category: "Plosive",
    order: 5,
  },
  G: {
    arpabets: ["G"],
    type: "consonant",
    ipa: "ɡ",
    description: "Voiced velar plosive as in 'give'",
    category: "Plosive",
    order: 6,
  },
  F: {
    arpabets: ["F"],
    type: "consonant",
    ipa: "f",
    description: "Voiceless labiodental fricative as in 'fin'",
    category: "Fricative",
    order: 7,
  },
  V: {
    arpabets: ["V"],
    type: "consonant",
    ipa: "v",
    description: "Voiced labiodental fricative as in 'van'",
    category: "Fricative",
    order: 8,
  },
  TH: {
    arpabets: ["TH"],
    type: "consonant",
    ipa: "θ",
    description: "Voiceless dental fricative as in 'thin'",
    category: "Fricative",
    order: 9,
  },
  DH: {
    arpabets: ["DH"],
    type: "consonant",
    ipa: "ð",
    description: "Voiced dental fricative as in 'this'",
    category: "Fricative",
    order: 10,
  },
  S: {
    arpabets: ["S"],
    type: "consonant",
    ipa: "s",
    description: "Voiceless alveolar fricative as in 'sin'",
    category: "Fricative",
    order: 11,
  },
  Z: {
    arpabets: ["Z"],
    type: "consonant",
    ipa: "z",
    description: "Voiced alveolar fricative as in 'zip'",
    category: "Fricative",
    order: 12,
  },
  SH: {
    arpabets: ["SH"],
    type: "consonant",
    ipa: "ʃ",
    description: "Voiceless postalveolar fricative as in 'ship'",
    category: "Fricative",
    order: 13,
  },
  ZH: {
    arpabets: ["ZH"],
    type: "consonant",
    ipa: "ʒ",
    description: "Voiced postalveolar fricative as in 'measure'",
    category: "Fricative",
    order: 14,
  },
  H: {
    arpabets: ["HH"],
    type: "consonant",
    ipa: "h",
    description: "Voiceless glottal fricative as in 'hat'",
    category: "Fricative",
    order: 15,
  },
  CH: {
    arpabets: ["CH"],
    type: "consonant",
    ipa: "tʃ",
    description: "Voiceless postalveolar affricate as in 'chin'",
    category: "Affricate",
    order: 16,
  },
  J: {
    arpabets: ["JH"],
    type: "consonant",
    ipa: "dʒ",
    description: "Voiced postalveolar affricate as in 'gin'",
    category: "Affricate",
    order: 17,
  },
  M: {
    arpabets: ["M"],
    type: "consonant",
    ipa: "m",
    description: "Bilabial nasal as in 'mat'",
    category: "Nasal",
    order: 18,
  },
  N: {
    arpabets: ["N"],
    type: "consonant",
    ipa: "n",
    description: "Alveolar nasal as in 'net'",
    category: "Nasal",
    order: 19,
  },
  NG: {
    arpabets: ["NG"],
    type: "consonant",
    ipa: "ŋ",
    description: "Velar nasal as in 'sing'",
    category: "Nasal",
    order: 20,
  },
  L: {
    arpabets: ["L"],
    type: "consonant",
    ipa: "l",
    description: "Alveolar lateral approximant as in 'let'",
    category: "Approximant",
    order: 21,
  },
  R: {
    arpabets: ["R"],
    type: "consonant",
    ipa: "r",
    description: "Alveolar approximant as in 'red'",
    category: "Approximant",
    order: 22,
  },
  Y: {
    arpabets: ["Y"],
    type: "consonant",
    ipa: "j",
    description: "Palatal approximant as in 'yes'",
    category: "Approximant",
    order: 23,
  },
  W: {
    arpabets: ["W"],
    type: "consonant",
    ipa: "w",
    description: "Labial-velar approximant as in 'wet'",
    category: "Approximant",
    order: 24,
  },
};

// Derived mappings (computed from PHONEMES)
export const LEXICAL_SET_MAP = Object.fromEntries(
  Object.entries(PHONEMES).map(([name, data]) => [
    name,
    { arpabets: data.arpabets, type: data.type },
  ])
);

// Lexical Set to IPA mapping (for vowels only)
export const LEXICAL_SET_TO_IPA = Object.fromEntries(
  Object.entries(PHONEMES)
    .filter(([_, data]) => data.type === "vowel")
    .map(([name, data]) => [name, data.ipa])
);

// CMU/ARPAbet to IPA mapping (for consonants)
// Maps ARPAbet codes to IPA symbols
export const CMU_TO_IPA = Object.fromEntries(
  Object.entries(PHONEMES)
    .filter(([_, data]) => data.type === "consonant")
    .flatMap(([name, data]) =>
      data.arpabets.map((arpabet) => [arpabet, data.ipa])
    )
);

// Vowel groupings for UI (phoneme grid)
export const VOWEL_GROUPS = [
  ["FLEECE", "GOOSE", "FACE"],
  ["KIT", "FOOT", "PRICE"],
  ["DRESS", "STRUT", "CHOICE"],
  ["TRAP", "LOT", "GOAT"],
  [null, null, "MOUTH"],
];

// Consonant groupings for UI (phoneme grid)
export const CONSONANT_GROUPS = [
  ["P", "T", "CH", "K"],
  ["B", "D", "J", "G"],
  ["F", "TH", "S", "SH", "H"],
  ["V", "DH", "Z", "ZH"],
  ["Y", "R", "W", "L"],
  ["M", "N", "NG", null, "misc"],
];

// Vowel symbols with formant frequencies (for vowel synth)
export const VOWEL_SYMBOLS = Object.entries(PHONEMES)
  .filter(([_, data]) => data.type === "vowel" && data.formants)
  .map(([name, data]) => ({
    symbol: data.altNames ? data.altNames[0] : name,
    F1: data.formants.F1,
    F2: data.formants.F2,
  }));

// Database seed data helpers
export const getLexicalSetsForDB = () =>
  Object.entries(PHONEMES)
    .filter(([name, data]) => data.type === "vowel" && name !== "commA")
    .map(([name, data]) => ({
      name,
      description: data.description,
      order: data.order,
    }))
    .sort((a, b) => (a.order || 999) - (b.order || 999));

export const getConsonantsForDB = () =>
  Object.entries(PHONEMES)
    .filter(([_, data]) => data.type === "consonant")
    .map(([name, data]) => ({
      name,
      description: data.description,
      category: data.category,
      order: data.order,
    }))
    .sort((a, b) => a.order - b.order);
