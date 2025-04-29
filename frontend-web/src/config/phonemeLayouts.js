// Layout configurations for different views
export const compactVowelLayout = {
  sections: [
    {
      title: "Monophthongs",
      description: "Single vowel sounds",
      grid: {
        columns: 4,
        width: 320,
        items: [
          ["FLEECE", "GOOSE", "", ""],
          ["KIT", "FOOT", "STRUT", "TRAM"],
          ["DRESS", "LOT", "", ""],
          ["TRAP", "", "", ""],
        ],
      },
    },
    {
      title: "Diphthongs",
      description: "Combined vowel sounds",
      grid: {
        columns: 3,
        width: 240,
        items: [
          ["FACE", "PRICE", "CHOICE"],
          ["GOAT", "MOUTH", ""],
        ],
      },
    },
    {
      title: "R-colored vowels",
      description: "Vowels followed by 'r'",
      grid: {
        columns: 3,
        width: 240,
        items: [
          ["NEAR", "SQUARE", "START"],
          ["NORTH", "FORCE", ""],
        ],
      },
    },
    {
      title: "Unstressed vowels",
      description: "Vowels in unstressed syllables",
      grid: {
        columns: 3,
        width: 240,
        items: [["happY", "commA", "lettER"]],
      },
    },
  ],
};

export const listVowelLayout = {
  sections: [
    {
      title: "All Vowels",
      description: "Complete list of vowel phonemes",
      grid: {
        columns: 1,
        width: 400,
        items: [
          ["FLEECE"],
          ["GOOSE"],
          ["KIT"],
          ["FOOT"],
          ["DRESS"],
          ["STRUT"],
          ["TRAP"],
          ["LOT"],
          ["TRAM"],
          ["FACE"],
          ["PRICE"],
          ["CHOICE"],
          ["GOAT"],
          ["MOUTH"],
          ["NEAR"],
          ["SQUARE"],
          ["START"],
          ["NORTH"],
          ["FORCE"],
          ["happY"],
          ["commA"],
          ["lettER"],
        ],
      },
    },
  ],
};

export const compactConsonantLayout = {
  sections: [
    {
      title: "Stops & Fricatives",
      description: "Plosive and fricative consonants",
      grid: {
        columns: 4,
        width: 320,
        items: [
          ["P", "T", "K", "CH"],
          ["B", "D", "G", "J"],
          ["F", "TH", "S", "SH"],
          ["V", "DH", "Z", "ZH"],
          ["", "", "", "H"],
        ],
      },
    },
    {
      title: "Approximants & Nasals",
      description: "Liquid, glide, and nasal consonants",
      grid: {
        columns: 3,
        width: 240,
        items: [
          ["L", "R", ""],
          ["W", "Y", ""],
          ["M", "N", "NG"],
        ],
      },
    },
  ],
};

export const listConsonantLayout = {
  sections: [
    {
      title: "All Consonants",
      description: "Complete list of consonant phonemes",
      grid: {
        columns: 1,
        width: 400,
        items: [
          ["P"],
          ["B"],
          ["T"],
          ["D"],
          ["K"],
          ["G"],
          ["F"],
          ["V"],
          ["TH"],
          ["DH"],
          ["S"],
          ["Z"],
          ["SH"],
          ["ZH"],
          ["H"],
          ["CH"],
          ["J"],
          ["L"],
          ["R"],
          ["W"],
          ["Y"],
          ["M"],
          ["N"],
          ["NG"],
        ],
      },
    },
  ],
};

// Helper functions
export const getAllPhonemeNames = (layout) => {
  return layout.sections.flatMap((section) =>
    section.grid.items.flat().filter((name) => name !== "")
  );
};

export const findPhonemePosition = (layout, phonemeName) => {
  for (const [sectionIndex, section] of layout.sections.entries()) {
    for (const [rowIndex, row] of section.grid.items.entries()) {
      const colIndex = row.indexOf(phonemeName);
      if (colIndex !== -1) {
        return {
          sectionIndex,
          rowIndex,
          colIndex,
          section: section.title,
        };
      }
    }
  }
  return null;
};
