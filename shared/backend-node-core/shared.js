import { createPrismaClient } from "./prisma/services/initPrisma.js";
import { logModuleInfo } from "./prisma/utils/logModuleInfo.js";

let prisma;
try {
  prisma = await createPrismaClient();
  logModuleInfo(import.meta.url, "Shared modules loaded"); // ✅ Only log if setup succeeded
} catch (err) {
  console.error("❌ Failed to initialize shared modules:", err);
  process.exit(1);
}

// Export all shared resources
export { prisma };
