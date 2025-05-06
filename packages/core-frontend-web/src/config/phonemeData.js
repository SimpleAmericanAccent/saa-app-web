// Core phoneme data definitions
export const vowelPhonemes = {
  monophthongs: {
    FLEECE: { type: "monophthong", description: "Long high front vowel" },
    GOOSE: { type: "monophthong", description: "Long high back vowel" },
    KIT: { type: "monophthong", description: "Short high front vowel" },
    FOOT: { type: "monophthong", description: "Short high back vowel" },
    DRESS: { type: "monophthong", description: "Short mid front vowel" },
    STRUT: { type: "monophthong", description: "Short mid back vowel" },
    TRAP: { type: "monophthong", description: "Short low front vowel" },
    LOT: { type: "monophthong", description: "Short low back vowel" },
    TRAM: { type: "monophthong", description: "Short low front vowel" },
  },
  diphthongs: {
    FACE: { type: "diphthong", description: "Long mid front closing" },
    PRICE: { type: "diphthong", description: "Long low front closing" },
    CHOICE: { type: "diphthong", description: "Long low back closing" },
    GOAT: { type: "diphthong", description: "Long mid back closing" },
    MOUTH: { type: "diphthong", description: "Long low back closing" },
  },
  rColored: {
    NEAR: { type: "r-colored", description: "R-colored high front vowel" },
    SQUARE: { type: "r-colored", description: "R-colored mid front vowel" },
    START: { type: "r-colored", description: "R-colored low front vowel" },
    NORTH: { type: "r-colored", description: "R-colored mid back vowel" },
    FORCE: { type: "r-colored", description: "R-colored mid back vowel" },
  },
  unstressed: {
    happY: { type: "unstressed", description: "Unstressed high front vowel" },
    commA: { type: "unstressed", description: "Unstressed mid central vowel" },
    lettER: { type: "unstressed", description: "Unstressed r-colored vowel" },
  },
};

export const consonantPhonemes = {
  stops: {
    P: { type: "stop", description: "Voiceless bilabial stop" },
    B: { type: "stop", description: "Voiced bilabial stop" },
    T: { type: "stop", description: "Voiceless alveolar stop" },
    D: { type: "stop", description: "Voiced alveolar stop" },
    K: { type: "stop", description: "Voiceless velar stop" },
    G: { type: "stop", description: "Voiced velar stop" },
  },
  fricatives: {
    F: { type: "fricative", description: "Voiceless labiodental fricative" },
    V: { type: "fricative", description: "Voiced labiodental fricative" },
    TH: { type: "fricative", description: "Voiceless dental fricative" },
    DH: { type: "fricative", description: "Voiced dental fricative" },
    S: { type: "fricative", description: "Voiceless alveolar fricative" },
    Z: { type: "fricative", description: "Voiced alveolar fricative" },
    SH: { type: "fricative", description: "Voiceless postalveolar fricative" },
    ZH: { type: "fricative", description: "Voiced postalveolar fricative" },
    H: { type: "fricative", description: "Voiceless glottal fricative" },
  },
  affricates: {
    CH: { type: "affricate", description: "Voiceless postalveolar affricate" },
    J: { type: "affricate", description: "Voiced postalveolar affricate" },
  },
  approximants: {
    L: { type: "approximant", description: "Lateral approximant" },
    R: { type: "approximant", description: "Alveolar approximant" },
    W: { type: "approximant", description: "Labial-velar approximant" },
    Y: { type: "approximant", description: "Palatal approximant" },
  },
  nasals: {
    M: { type: "nasal", description: "Bilabial nasal" },
    N: { type: "nasal", description: "Alveolar nasal" },
    NG: { type: "nasal", description: "Velar nasal" },
  },
};
