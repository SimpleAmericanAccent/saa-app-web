import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve the generated Prisma client
const clientPath = resolve(__dirname, "..", "prisma", "generated", "index.js");
const { PrismaClient } = await import(clientPath);

export { PrismaClient };
