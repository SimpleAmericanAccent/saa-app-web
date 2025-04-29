import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Get all words
router.get("/", async (req, res) => {
  try {
    const entries = await prisma.dictionaryEntry.findMany({
      include: {
        usages: {
          include: {
            pronunciations: true,
            examples: true,
            lexicalSets: {
              include: {
                lexicalSet: true,
              },
            },
            spellingPatterns: true,
          },
        },
        variations: true,
      },
    });
    res.json(entries);
  } catch (error) {
    console.error("Error fetching dictionary entries:", error);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

// Get a single word
router.get("/:id", async (req, res) => {
  try {
    const entry = await prisma.dictionaryEntry.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        usages: {
          include: {
            pronunciations: true,
            examples: true,
            lexicalSets: {
              include: {
                lexicalSet: true,
              },
            },
            spellingPatterns: true,
          },
        },
        variations: true,
      },
    });
    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }
    res.json(entry);
  } catch (error) {
    console.error("Error fetching entry:", error);
    res.status(500).json({ error: "Failed to fetch entry" });
  }
});

// Create a new word
router.post("/", async (req, res) => {
  try {
    const { word, notes, usages } = req.body;

    const entry = await prisma.dictionaryEntry.create({
      data: {
        word,
        notes,
        usages: {
          create: usages.map((usage) => ({
            partOfSpeech: usage.partOfSpeech,
            meaning: usage.meaning,
            pronunciations: {
              create: usage.pronunciations,
            },
            examples: {
              create: usage.examples,
            },
            spellingPatterns: {
              create: usage.spellingPatterns,
            },
          })),
        },
      },
      include: {
        usages: {
          include: {
            pronunciations: true,
            examples: true,
            spellingPatterns: true,
          },
        },
      },
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error("Error creating entry:", error);
    res.status(500).json({ error: "Failed to create entry" });
  }
});

// Update a word
router.put("/:id", async (req, res) => {
  try {
    const { word, usages } = req.body;

    // First, delete existing related records
    await prisma.pronunciation.deleteMany({
      where: {
        wordUsage: {
          entryId: parseInt(req.params.id),
        },
      },
    });
    await prisma.example.deleteMany({
      where: {
        wordUsage: {
          entryId: parseInt(req.params.id),
        },
      },
    });
    await prisma.spellingPattern.deleteMany({
      where: {
        wordUsage: {
          entryId: parseInt(req.params.id),
        },
      },
    });
    await prisma.wordUsage.deleteMany({
      where: {
        entryId: parseInt(req.params.id),
      },
    });

    // Ensure usages is an array and has required fields
    const formattedUsages = (usages || []).map((usage) => ({
      partOfSpeech: usage.partOfSpeech || "noun",
      meaning: usage.meaning || "",
      pronunciations: {
        create: (usage.pronunciations || []).map((p) => ({
          phonemic: p.phonemic || "",
          isPrimary: true,
        })),
      },
      examples: {
        create: (usage.examples || []).map((e) => ({
          text: e.text || "",
        })),
      },
      spellingPatterns: {
        create: (usage.spellingPatterns || []).map((s) => ({
          pattern: s.pattern || "",
        })),
      },
    }));

    // Then update the entry with new data
    const entry = await prisma.dictionaryEntry.update({
      where: { id: parseInt(req.params.id) },
      data: {
        word,
        usages: {
          create: formattedUsages,
        },
      },
      include: {
        usages: {
          include: {
            pronunciations: true,
            examples: true,
            spellingPatterns: true,
          },
        },
      },
    });

    res.json(entry);
  } catch (error) {
    console.error("Error updating entry:", error);
    res.status(500).json({ error: "Failed to update entry" });
  }
});

// Delete a word
router.delete("/:id", async (req, res) => {
  try {
    await prisma.dictionaryEntry.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting entry:", error);
    res.status(500).json({ error: "Failed to delete entry" });
  }
});

export default router;
