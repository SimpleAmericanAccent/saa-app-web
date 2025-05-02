import { createPrismaClient } from "../shared/services/initPrisma.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const prisma = await createPrismaClient();

// You can customize service-specific stuff here
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.info(`🛠️  Shared modules loaded in ${__dirname}`);

// Export all shared resources
export { prisma };
