import { PrismaClient } from "../prisma/generated/index.js";
import readline from "readline";

// ✅ no globalThis here, we don’t want singleton in CLI script
const prisma = new PrismaClient();

const CMU_URL =
  "https://saa-website-public-files.s3.us-east-2.amazonaws.com/accent-data/cmudict.txt";
const SUBTLEX_URL =
  "https://saa-website-public-files.s3.us-east-2.amazonaws.com/accent-data/SUBTLEXus74286wordstextversion.txt";

async function fetchTextFile(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  return await response.text();
}

function updateProgress(current, total) {
  const percent = Math.floor((current / total) * 100);
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  process.stdout.write(`🔄 Progress: ${percent}% (${current}/${total})`);
}

export async function seedCmuAndSubtlex() {
  const env = process.env.NODE_ENV?.toLowerCase();

  if (env === "production" || env === "prod") {
    console.error("🚫 Don't run seeding in production.");
    process.exit(1);
  }

  console.log("📥 Downloading data from S3...");

  const cmuRaw = await fetchTextFile(CMU_URL);
  const subtlexRaw = await fetchTextFile(SUBTLEX_URL);

  const freqMap = new Map();
  const cmuMap = new Map();

  console.log("📊 Parsing SUBTLEX...");
  const subtlexLines = subtlexRaw.split("\n");
  for (const line of subtlexLines) {
    const cols = line.split("\t");
    const word = cols[0]?.toLowerCase();
    const freq = parseInt(cols[1]);
    if (word && !isNaN(freq)) {
      freqMap.set(word, freq);
    }
  }

  console.log("🔤 Parsing CMUdict...");
  const cmuLines = cmuRaw.split("\n");
  for (const line of cmuLines) {
    if (line.startsWith(";;;")) continue;
    const [rawWord, ...phones] = line.trim().split(/\s+/);
    const word = rawWord?.replace(/\(\d+\)$/, "").toLowerCase();
    const pron = phones.join(" ");
    if (!word || !pron) continue;

    if (!cmuMap.has(word)) cmuMap.set(word, new Set());
    cmuMap.get(word).add(pron);
  }

  console.log("⚙️ Preparing data...");

  const wordRecords = [];
  const pronRecords = [];

  for (const [word, prons] of cmuMap.entries()) {
    wordRecords.push({ word, freqSubtlexUs: freqMap.get(word) ?? null });
    for (const pron of prons) {
      pronRecords.push({ word, pronCmuDict: pron });
    }
  }

  console.log("📥 Inserting OrthoWords...");
  await prisma.orthoWord.createMany({
    data: wordRecords,
    skipDuplicates: true,
  });

  console.log("🔗 Fetching word IDs...");
  const allWords = await prisma.orthoWord.findMany({
    select: { id: true, word: true },
  });
  const wordIdMap = new Map(allWords.map(({ word, id }) => [word, id]));

  console.log("📤 Inserting PronCmuDicts...");
  const batchSize = 500;
  for (let i = 0; i < pronRecords.length; i += batchSize) {
    const batch = pronRecords
      .slice(i, i + batchSize)
      .map(({ word, pronCmuDict }) => ({
        orthoWordId: wordIdMap.get(word),
        pronCmuDict,
      }))
      .filter((r) => r.orthoWordId);

    await prisma.pronCmuDict.createMany({
      data: batch,
      skipDuplicates: true,
    });

    updateProgress(
      Math.min(i + batch.length, pronRecords.length),
      pronRecords.length
    );
  }

  console.log("\n🎉 Seeding complete. Total words:", wordRecords.length);
}

seedCmuAndSubtlex()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
