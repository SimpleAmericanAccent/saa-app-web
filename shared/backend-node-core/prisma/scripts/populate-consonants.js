import { prisma } from "../../backend-node/shared.js";

const consonantPhonemes = [
  {
    name: "P",
    description: "Voiceless bilabial plosive as in 'pin'",
    category: "Plosive",
    order: 1,
  },
  {
    name: "B",
    description: "Voiced bilabial plosive as in 'bin'",
    category: "Plosive",
    order: 2,
  },
  {
    name: "T",
    description: "Voiceless alveolar plosive as in 'tin'",
    category: "Plosive",
    order: 3,
  },
  {
    name: "D",
    description: "Voiced alveolar plosive as in 'din'",
    category: "Plosive",
    order: 4,
  },
  {
    name: "K",
    description: "Voiceless velar plosive as in 'kin'",
    category: "Plosive",
    order: 5,
  },
  {
    name: "G",
    description: "Voiced velar plosive as in 'give'",
    category: "Plosive",
    order: 6,
  },
  {
    name: "F",
    description: "Voiceless labiodental fricative as in 'fin'",
    category: "Fricative",
    order: 7,
  },
  {
    name: "V",
    description: "Voiced labiodental fricative as in 'van'",
    category: "Fricative",
    order: 8,
  },
  {
    name: "TH",
    description: "Voiceless dental fricative as in 'thin'",
    category: "Fricative",
    order: 9,
  },
  {
    name: "DH",
    description: "Voiced dental fricative as in 'this'",
    category: "Fricative",
    order: 10,
  },
  {
    name: "S",
    description: "Voiceless alveolar fricative as in 'sin'",
    category: "Fricative",
    order: 11,
  },
  {
    name: "Z",
    description: "Voiced alveolar fricative as in 'zip'",
    category: "Fricative",
    order: 12,
  },
  {
    name: "SH",
    description: "Voiceless postalveolar fricative as in 'ship'",
    category: "Fricative",
    order: 13,
  },
  {
    name: "ZH",
    description: "Voiced postalveolar fricative as in 'measure'",
    category: "Fricative",
    order: 14,
  },
  {
    name: "H",
    description: "Voiceless glottal fricative as in 'hat'",
    category: "Fricative",
    order: 15,
  },
  {
    name: "CH",
    description: "Voiceless postalveolar affricate as in 'chin'",
    category: "Affricate",
    order: 16,
  },
  {
    name: "J",
    description: "Voiced postalveolar affricate as in 'gin'",
    category: "Affricate",
    order: 17,
  },
  {
    name: "M",
    description: "Bilabial nasal as in 'mat'",
    category: "Nasal",
    order: 18,
  },
  {
    name: "N",
    description: "Alveolar nasal as in 'net'",
    category: "Nasal",
    order: 19,
  },
  {
    name: "NG",
    description: "Velar nasal as in 'sing'",
    category: "Nasal",
    order: 20,
  },
  {
    name: "L",
    description: "Alveolar lateral approximant as in 'let'",
    category: "Approximant",
    order: 21,
  },
  {
    name: "R",
    description: "Alveolar approximant as in 'red'",
    category: "Approximant",
    order: 22,
  },
  {
    name: "Y",
    description: "Palatal approximant as in 'yes'",
    category: "Approximant",
    order: 23,
  },
  {
    name: "W",
    description: "Labial-velar approximant as in 'wet'",
    category: "Approximant",
    order: 24,
  },
];

async function populateConsonantPhonemes() {
  try {
    console.log("Starting to populate consonant phonemes...");

    for (const phoneme of consonantPhonemes) {
      const existingPhoneme = await prisma.consonantPhoneme.findFirst({
        where: { name: phoneme.name },
      });

      if (!existingPhoneme) {
        await prisma.consonantPhoneme.create({
          data: phoneme,
        });
        console.log(`Created consonant phoneme: ${phoneme.name}`);
      } else {
        console.log(`Consonant phoneme already exists: ${phoneme.name}`);
      }
    }

    console.log("Finished populating consonant phonemes");
  } catch (error) {
    console.error("Error populating consonant phonemes:", error);
  } finally {
    await prisma.$disconnect();
  }
}

populateConsonantPhonemes();
