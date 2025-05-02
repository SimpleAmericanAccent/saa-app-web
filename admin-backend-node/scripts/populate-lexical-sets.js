import { prisma } from "../shared.js";

const lexicalSets = [
  {
    name: "KIT",
    description: "Words with the vowel sound in 'kit', 'fish', 'build'",
    order: 1,
  },
  {
    name: "FLEECE",
    description: "Words with the vowel sound in 'fleece', 'sea', 'machine'",
    order: 2,
  },
  {
    name: "TRAP",
    description: "Words with the vowel sound in 'trap', 'cat', 'bad'",
    order: 3,
  },
  {
    name: "DRESS",
    description: "Words with the vowel sound in 'dress', 'bed', 'head'",
    order: 4,
  },
  {
    name: "STRUT",
    description: "Words with the vowel sound in 'strut', 'cup', 'love'",
    order: 5,
  },
  {
    name: "LOT",
    description: "Words with the vowel sound in 'lot', 'odd', 'wash'",
    order: 6,
  },
  {
    name: "FACE",
    description: "Words with the vowel sound in 'face', 'day', 'break'",
    order: 7,
  },
  {
    name: "GOAT",
    description: "Words with the vowel sound in 'goat', 'show', 'no'",
    order: 10,
  },
  {
    name: "FOOT",
    description: "Words with the vowel sound in 'foot', 'good', 'put'",
    order: 11,
  },
  {
    name: "GOOSE",
    description: "Words with the vowel sound in 'goose', 'two', 'blue'",
    order: 12,
  },
  {
    name: "PRICE",
    description: "Words with the vowel sound in 'price', 'high', 'try'",
    order: 13,
  },
  {
    name: "CHOICE",
    description: "Words with the vowel sound in 'choice', 'boy', 'oil'",
    order: 14,
  },
  {
    name: "MOUTH",
    description: "Words with the vowel sound in 'mouth', 'now', 'out'",
    order: 15,
  },
  {
    name: "HAPPY",
    description: "Words with the vowel sound in 'happy', 'city', 'pretty'",
    order: 22,
  },
  {
    name: "COMMA",
    description:
      "Words with the reduced vowel sound in 'comma', 'about', 'the'",
    order: 24,
  },
];

async function populateLexicalSets() {
  try {
    console.log("Starting to populate lexical sets...");

    for (const set of lexicalSets) {
      const existingSet = await prisma.lexicalSet.findFirst({
        where: { name: set.name },
      });

      if (!existingSet) {
        await prisma.lexicalSet.create({
          data: set,
        });
        console.log(`Created lexical set: ${set.name}`);
      } else {
        console.log(`Lexical set already exists: ${set.name}`);
      }
    }

    console.log("Finished populating lexical sets");
  } catch (error) {
    console.error("Error populating lexical sets:", error);
  } finally {
    await prisma.$disconnect();
  }
}

populateLexicalSets();
