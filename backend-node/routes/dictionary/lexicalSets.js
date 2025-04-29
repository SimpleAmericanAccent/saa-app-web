import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Get all lexical sets
router.get("/", async (req, res) => {
  try {
    const lexicalSets = await prisma.lexicalSet.findMany({
      include: {
        usages: {
          include: {
            wordUsage: {
              include: {
                entry: true,
              },
            },
          },
        },
      },
    });
    res.json(lexicalSets);
  } catch (error) {
    console.error("Error fetching lexical sets:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get a single lexical set
router.get("/:id", async (req, res) => {
  try {
    const lexicalSet = await prisma.lexicalSet.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        usages: {
          include: {
            wordUsage: {
              include: {
                entry: true,
              },
            },
          },
        },
      },
    });
    if (!lexicalSet) {
      return res.status(404).json({ error: "Lexical set not found" });
    }
    res.json(lexicalSet);
  } catch (error) {
    console.error("Error fetching lexical set:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
