const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
    name: "DRESS",
    description: "Words with the vowel sound in 'dress', 'bed', 'head'",
    order: 3,
  },
  {
    name: "FACE",
    description: "Words with the vowel sound in 'face', 'day', 'break'",
    order: 4,
  },
  {
    name: "PALM",
    description: "Words with the vowel sound in 'palm', 'father', 'bra'",
    order: 5,
  },
  {
    name: "THOUGHT",
    description: "Words with the vowel sound in 'thought', 'north', 'force'",
    order: 6,
  },
  {
    name: "GOAT",
    description: "Words with the vowel sound in 'goat', 'show', 'no'",
    order: 7,
  },
  {
    name: "FOOT",
    description: "Words with the vowel sound in 'foot', 'good', 'put'",
    order: 8,
  },
  {
    name: "GOOSE",
    description: "Words with the vowel sound in 'goose', 'two', 'blue'",
    order: 9,
  },
  {
    name: "PRICE",
    description: "Words with the vowel sound in 'price', 'high', 'boy'",
    order: 10,
  },
  {
    name: "CHOICE",
    description: "Words with the vowel sound in 'choice', 'boy', 'oil'",
    order: 11,
  },
  {
    name: "MOUTH",
    description: "Words with the vowel sound in 'mouth', 'now', 'out'",
    order: 12,
  },
  {
    name: "NEAR",
    description: "Words with the vowel sound in 'near', 'here', 'weird'",
    order: 13,
  },
  {
    name: "SQUARE",
    description: "Words with the vowel sound in 'square', 'fair', 'various'",
    order: 14,
  },
  {
    name: "START",
    description: "Words with the vowel sound in 'start', 'arm', 'father'",
    order: 15,
  },
  {
    name: "NORTH",
    description: "Words with the vowel sound in 'north', 'force', 'horse'",
    order: 16,
  },
  {
    name: "FORCE",
    description: "Words with the vowel sound in 'force', 'horse', 'hoarse'",
    order: 17,
  },
  {
    name: "CURE",
    description: "Words with the vowel sound in 'cure', 'poor', 'jury'",
    order: 18,
  },
  {
    name: "HAPPY",
    description: "Words with the vowel sound in 'happy', 'city', 'pretty'",
    order: 19,
  },
  {
    name: "LETTER",
    description: "Words with the vowel sound in 'letter', 'about', 'comma'",
    order: 20,
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
