import { PrismaClient } from "./prisma/generated/index.js";
import { MIGRATION_DATA } from "../../packages/core-frontend-web/src/data/minimal-pairs.js";

const prisma = new PrismaClient();

async function migrateQuizData() {
  try {
    console.log("🚀 Starting migration of all quiz data...");

    // Clear existing data
    console.log("🗑️  Clearing existing quiz data...");
    await prisma.trial.deleteMany({});
    await prisma.pair.deleteMany({});
    await prisma.contrast.deleteMany({});

    let totalPairs = 0;
    let activePairs = 0;
    let inactivePairs = 0;

    // Migrate each quiz type
    for (const [quizTypeId, metadata] of Object.entries(MIGRATION_DATA)) {
      console.log(`\n📝 Migrating ${metadata.name}...`);

      // Create the contrast record first
      const contrast = await prisma.contrast.create({
        data: {
          key: quizTypeId,
          name: metadata.name,
          title: metadata.title,
          description: metadata.description,
          category: metadata.category,
          soundAName: metadata.soundAName,
          soundBName: metadata.soundBName,
          soundASymbol: metadata.soundASymbol,
          soundBSymbol: metadata.soundBSymbol,
          active: true,
        },
      });

      console.log(`  ✅ Created contrast: ${contrast.name} (${contrast.id})`);

      // Create pairs for this quiz type
      for (const pairData of metadata.pairs) {
        const pair = await prisma.pair.create({
          data: {
            contrastId: contrast.id,
            wordA: pairData.wordA,
            wordB: pairData.wordB,
            alternateA: pairData.alternateA,
            alternateB: pairData.alternateB,
            audioAUrl: "", // Will be populated later
            audioBUrl: "", // Will be populated later
            active: pairData.active,
          },
        });

        totalPairs++;
        if (pairData.active) {
          activePairs++;
          console.log(
            `  ✅ Created active pair: ${pairData.wordA} vs ${pairData.wordB}`
          );
        } else {
          inactivePairs++;
          console.log(
            `  📝 Created inactive pair: ${pairData.wordA} vs ${pairData.wordB}`
          );
        }
      }
    }

    console.log(`\n🎉 Migration complete!`);
    console.log(`  📊 Total pairs: ${totalPairs}`);
    console.log(`  ✅ Active pairs: ${activePairs}`);
    console.log(`  📝 Inactive pairs: ${inactivePairs}`);

    // Show summary
    const contrasts = await prisma.contrast.findMany({
      include: {
        _count: {
          select: { pairs: true },
        },
      },
    });

    console.log("\n📊 Summary by contrast:");
    contrasts.forEach((contrast) => {
      console.log(`  ${contrast.name}: ${contrast._count.pairs} pairs`);
    });

    // Show active/inactive summary
    const activeCount = await prisma.pair.count({ where: { active: true } });
    const inactiveCount = await prisma.pair.count({ where: { active: false } });

    console.log("\n📊 Active/Inactive Summary:");
    console.log(`  ✅ Active pairs: ${activeCount}`);
    console.log(`  📝 Inactive pairs: ${inactiveCount}`);
  } catch (error) {
    console.error("❌ Error during migration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateQuizData();
