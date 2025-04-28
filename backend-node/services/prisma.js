import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Graceful shutdown of Prisma
const shutdown = async () => {
  console.log("Shutting down Prisma gracefully...");
  await prisma.$disconnect();
  process.exit(0);
};

// Attach graceful shutdown to process signals
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("beforeExit", shutdown);

// Export Prisma client only
export default prisma;
