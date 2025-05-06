export async function createPrismaClient() {
  const { PrismaClient } = await import("../generated/index.js");

  if (!globalThis._prisma) {
    globalThis._prisma = new PrismaClient();
    console.log("✅ Created new Prisma client instance");
  } else {
    console.log("♻️ Reusing existing Prisma client instance");
  }

  const client = globalThis._prisma;

  // Graceful shutdown
  const shutdown = async (reason) => {
    console.log(`🔌 Shutting down Prisma gracefully (${reason})...`);
    try {
      await client.$disconnect();
    } catch (err) {
      console.error("⚠️ Error disconnecting Prisma:", err);
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT (ctrl + C)"));
  process.on("SIGTERM", () => shutdown("SIGTERM (platform shutdown)"));
  process.on("beforeExit", () => shutdown("beforeExit (Node exiting)"));

  return client;
}
