import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Get all consonant phonemes
router.get("/", async (req, res) => {
  try {
    const phonemes = await prisma.consonantPhoneme.findMany({
      include: {
        usages: {
          include: {
            wordUsage: true,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });
    res.json(phonemes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single consonant phoneme
router.get("/:id", async (req, res) => {
  try {
    const phoneme = await prisma.consonantPhoneme.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        usages: {
          include: {
            wordUsage: true,
          },
        },
      },
    });
    if (!phoneme) {
      return res.status(404).json({ error: "Consonant phoneme not found" });
    }
    res.json(phoneme);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
