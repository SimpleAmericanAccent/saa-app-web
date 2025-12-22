import { PrismaClient } from "../generated/index.js";
import { contrasts, pairsByContrast } from "./quiz-seed-data.js";

const prisma = new PrismaClient();

/**
 * Seed Contrast and Pair tables with quiz data
 *
 * This script:
 * 1. Creates Contrast records (upsert by key to avoid duplicates)
 * 2. Creates Pair records for each contrast (upsert by contrastId + wordA + wordB)
 *
 * Run with: pnpm run seed:quiz
 */
async function seedQuiz() {
  const env = process.env.NODE_ENV?.toLowerCase();

  if (env === "production" || env === "prod") {
    console.error("🚫 Don't run seeding in production.");
    process.exit(1);
  }

  try {
    console.log("🌱 Starting quiz data seeding...");
    console.log(`   Found ${contrasts.length} contrasts to seed`);

    const totalPairs = Object.values(pairsByContrast).reduce(
      (sum, pairs) => sum + pairs.length,
      0
    );
    console.log(`   Found ${totalPairs} pairs to seed\n`);

    // Step 1: Seed contrasts
    console.log("📝 Seeding contrasts...");
    const contrastIdMap = new Map(); // Map contrast key -> contrast id

    for (const contrastData of contrasts) {
      try {
        // Upsert contrast by key (unique constraint)
        const contrast = await prisma.contrast.upsert({
          where: { key: contrastData.key },
          update: {
            name: contrastData.name,
            title: contrastData.title,
            description: contrastData.description,
            category: contrastData.category,
            soundAName: contrastData.soundAName,
            soundBName: contrastData.soundBName,
            soundASymbol: contrastData.soundASymbol,
            soundBSymbol: contrastData.soundBSymbol,
            active: contrastData.active,
          },
          create: {
            key: contrastData.key,
            name: contrastData.name,
            title: contrastData.title,
            description: contrastData.description,
            category: contrastData.category,
            soundAName: contrastData.soundAName,
            soundBName: contrastData.soundBName,
            soundASymbol: contrastData.soundASymbol,
            soundBSymbol: contrastData.soundBSymbol,
            active: contrastData.active,
          },
        });

        contrastIdMap.set(contrastData.key, contrast.id);
        console.log(`   ✓ ${contrastData.key} (${contrastData.name})`);
      } catch (error) {
        console.error(
          `   ✗ Failed to seed contrast ${contrastData.key}:`,
          error.message
        );
      }
    }

    console.log(`\n✅ Seeded ${contrastIdMap.size} contrasts\n`);

    // Step 2: Seed pairs
    console.log("📝 Seeding pairs...");
    let pairsCreated = 0;
    let pairsUpdated = 0;
    let pairsSkipped = 0;

    for (const [contrastKey, pairs] of Object.entries(pairsByContrast)) {
      const contrastId = contrastIdMap.get(contrastKey);

      if (!contrastId) {
        console.warn(
          `   ⚠️  Skipping pairs for contrast "${contrastKey}" - contrast not found`
        );
        pairsSkipped += pairs.length;
        continue;
      }

      for (const pairData of pairs) {
        try {
          // Check if pair already exists
          const existingPair = await prisma.pair.findUnique({
            where: {
              uq_pair_in_contrast: {
                contrastId: contrastId,
                wordA: pairData.wordA,
                wordB: pairData.wordB,
              },
            },
          });

          if (existingPair) {
            // Update existing pair
            await prisma.pair.update({
              where: { pairId: existingPair.pairId },
              data: {
                alternateA: pairData.alternateA || [],
                alternateB: pairData.alternateB || [],
                audioAUrl: pairData.audioAUrl,
                audioBUrl: pairData.audioBUrl,
                active: pairData.active,
              },
            });
            pairsUpdated++;
          } else {
            // Create new pair
            await prisma.pair.create({
              data: {
                contrastId: contrastId,
                wordA: pairData.wordA,
                wordB: pairData.wordB,
                alternateA: pairData.alternateA || [],
                alternateB: pairData.alternateB || [],
                audioAUrl: pairData.audioAUrl,
                audioBUrl: pairData.audioBUrl,
                active: pairData.active,
              },
            });
            pairsCreated++;
          }
        } catch (error) {
          console.error(
            `   ✗ Failed to seed pair "${pairData.wordA}" vs "${pairData.wordB}" for contrast "${contrastKey}":`,
            error.message
          );
          pairsSkipped++;
        }
      }

      console.log(`   ✓ ${contrastKey}: ${pairs.length} pairs`);
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   Created: ${pairsCreated} pairs`);
    console.log(`   Updated: ${pairsUpdated} pairs`);
    console.log(`   Skipped: ${pairsSkipped} pairs`);
  } catch (error) {
    console.error("❌ Error seeding quiz data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedQuiz().catch((e) => {
  console.error("❌ Fatal error:", e);
  process.exit(1);
});

