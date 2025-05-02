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

// You can customize service-specific stuff here
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.info(`🛠️  Shared modules loaded in ${__dirname}`);

// Export all shared resources
export { prisma };
