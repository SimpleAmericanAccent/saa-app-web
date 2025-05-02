import { PrismaClient } from "../shared/modules/prisma.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

let prisma;
try {
  // Dev-safe singleton pattern
  if (!globalThis._prisma) {
    globalThis._prisma = new PrismaClient();
    console.log("✅ Created new Prisma client instance");
  } else {
    console.log("♻️ Reusing existing Prisma client instance");
  }
  prisma = globalThis._prisma;
} catch (err) {
  console.error("❌ Failed to load Prisma client:", err.message);
  process.exit(1);
}

// Graceful shutdown of Prisma
const shutdown = async (reason) => {
  console.log(`🔌 Shutting down Prisma gracefully (${reason})...`);
  try {
    await prisma.$disconnect();
  } catch (err) {
    console.error("⚠️ Error disconnecting Prisma:", err);
  } finally {
    process.exit(0);
  }
};

// Attach graceful shutdown to termination signals
process.on("SIGINT", () => shutdown("SIGINT (ctrl + C)"));
process.on("SIGTERM", () => shutdown("SIGTERM (platform shutdown)"));
process.on("beforeExit", () => shutdown("beforeExit (Node exiting)"));

// You can customize service-specific stuff here
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.info(`🛠️  Shared modules loaded in ${__dirname}`);

// Export all shared resources
export { prisma };
