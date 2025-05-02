import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Get all dictionary entries with their usages
export const getAllEntries = async (req, res) => {
  console.log("getAllEntries controller called");
  try {
    console.log("Attempting to fetch entries from database...");
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
    console.log("Database query completed. Entries:", entries);
    // Always return an array, even if empty
    res.json(entries || []);
  } catch (error) {
    console.error("Error fetching dictionary entries:", error);
    // Return an empty array instead of an error
    res.json([]);
  }
};

// Get a single dictionary entry by ID
export const getEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await prisma.dictionaryEntry.findUnique({
      where: { id: parseInt(id) },
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
    res.status(500).json({ error: error.message });
  }
};

// Create a new dictionary entry
export const createEntry = async (req, res) => {
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
    console.error("Error creating dictionary entry:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update a dictionary entry
export const updateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { word, notes, usages } = req.body;

    // Data validation and defaults
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

    // First, delete existing related records
    await prisma.pronunciation.deleteMany({
      where: {
        wordUsage: {
          entryId: parseInt(id),
        },
      },
    });
    await prisma.example.deleteMany({
      where: {
        wordUsage: {
          entryId: parseInt(id),
        },
      },
    });
    await prisma.spellingPattern.deleteMany({
      where: {
        wordUsage: {
          entryId: parseInt(id),
        },
      },
    });
    await prisma.wordUsage.deleteMany({
      where: {
        entryId: parseInt(id),
      },
    });

    // Then update the entry with new data
    const entry = await prisma.dictionaryEntry.update({
      where: { id: parseInt(id) },
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
    res.json(entry);
  } catch (error) {
    console.error("Error updating entry:", error);
    res.status(500).json({ error: "Failed to update entry" });
  }
};

// Delete a dictionary entry
export const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to delete dictionary entry with ID: ${id}`);

    // First check if the entry exists
    const entry = await prisma.dictionaryEntry.findUnique({
      where: { id: parseInt(id) },
      include: {
        usages: {
          include: {
            pronunciations: true,
            examples: true,
            lexicalSets: true,
            spellingPatterns: true,
          },
        },
        variations: true,
      },
    });

    if (!entry) {
      console.log(`Entry with ID ${id} not found`);
      return res.status(404).json({ error: "Entry not found" });
    }

    console.log(`Found entry to delete: ${entry.word}`);

    // Delete all related records first
    // 1. Delete pronunciations
    for (const usage of entry.usages) {
      await prisma.pronunciation.deleteMany({
        where: { usageId: usage.id },
      });

      // 2. Delete examples
      await prisma.example.deleteMany({
        where: { usageId: usage.id },
      });

      // 3. Delete spelling patterns
      await prisma.spellingPattern.deleteMany({
        where: { usageId: usage.id },
      });

      // 4. Delete lexical set usages
      await prisma.lexicalSetUsage.deleteMany({
        where: { usageId: usage.id },
      });
    }

    // 5. Delete word usages
    await prisma.wordUsage.deleteMany({
      where: { entryId: parseInt(id) },
    });

    // 6. Delete word variations
    await prisma.wordVariation.deleteMany({
      where: { entryId: parseInt(id) },
    });

    // 7. Finally delete the dictionary entry
    await prisma.dictionaryEntry.delete({
      where: { id: parseInt(id) },
    });

    console.log(`Successfully deleted entry with ID: ${id}`);
    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteEntry:", error);
    res.status(500).json({
      error: error.message,
      code: error.code,
      meta: error.meta,
    });
  }
};

// Get all lexical sets
export const getLexicalSets = async (req, res) => {
  try {
    const lexicalSets = await prisma.lexicalSet.findMany({
      include: {
        usages: {
          include: {
            wordUsage: {
              include: {
                entry: true,
                pronunciations: true,
                examples: true,
                spellingPatterns: true,
              },
            },
          },
        },
      },
    });
    res.json(lexicalSets);
  } catch (error) {
    console.error("Error fetching lexical sets:", error);
    res.status(500).json({ error: "Failed to fetch lexical sets" });
  }
};

// Get a single lexical set by ID
export const getLexicalSetById = async (req, res) => {
  try {
    const { id } = req.params;
    const lexicalSet = await prisma.lexicalSet.findUnique({
      where: { id: parseInt(id) },
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
};

// Create a new lexical set
export const createLexicalSet = async (req, res) => {
  try {
    const { name, description, category, order } = req.body;

    // Data validation and defaults
    const formattedData = {
      name: name || "",
      description: description || "",
      category: category || "",
      order: order ? parseInt(order) : null,
    };

    const lexicalSet = await prisma.lexicalSet.create({
      data: formattedData,
      include: {
        usages: {
          include: {
            wordUsage: {
              include: {
                entry: true,
                pronunciations: true,
                examples: true,
                spellingPatterns: true,
              },
            },
          },
        },
      },
    });
    res.status(201).json(lexicalSet);
  } catch (error) {
    console.error("Error creating lexical set:", error);
    res.status(500).json({ error: "Failed to create lexical set" });
  }
};

// Update a lexical set
export const updateLexicalSet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, order, category } = req.body;

    const lexicalSet = await prisma.lexicalSet.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        category,
        order: order ? parseInt(order) : null,
      },
    });

    res.json(lexicalSet);
  } catch (error) {
    console.error("Error updating lexical set:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a lexical set
export const deleteLexicalSet = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to delete lexical set with ID: ${id}`);

    // First check if the lexical set exists
    const lexicalSet = await prisma.lexicalSet.findUnique({
      where: { id: parseInt(id) },
    });

    if (!lexicalSet) {
      console.log(`Lexical set with ID ${id} not found`);
      return res.status(404).json({ error: "Lexical set not found" });
    }

    console.log(`Found lexical set to delete: ${lexicalSet.name}`);

    // Delete all lexical set usages first
    await prisma.lexicalSetUsage.deleteMany({
      where: { lexicalSetId: parseInt(id) },
    });

    // Then delete the lexical set
    await prisma.lexicalSet.delete({
      where: { id: parseInt(id) },
    });

    console.log(`Successfully deleted lexical set with ID: ${id}`);
    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteLexicalSet:", error);
    res.status(500).json({
      error: error.message,
      code: error.code,
      meta: error.meta,
    });
  }
};

// Add a word usage to a lexical set
export const addUsageToLexicalSet = async (req, res) => {
  try {
    const { lexicalSetId, usageId } = req.params;
    const { order } = req.body;

    // Check if the lexical set and usage exist
    const lexicalSet = await prisma.lexicalSet.findUnique({
      where: { id: parseInt(lexicalSetId) },
    });

    if (!lexicalSet) {
      return res.status(404).json({ error: "Lexical set not found" });
    }

    const usage = await prisma.wordUsage.findUnique({
      where: { id: parseInt(usageId) },
    });

    if (!usage) {
      return res.status(404).json({ error: "Word usage not found" });
    }

    // Add the usage to the lexical set
    const lexicalSetUsage = await prisma.lexicalSetUsage.create({
      data: {
        lexicalSetId: parseInt(lexicalSetId),
        usageId: parseInt(usageId),
        order: order ? parseInt(order) : null,
      },
    });

    res.status(201).json(lexicalSetUsage);
  } catch (error) {
    console.error("Error adding usage to lexical set:", error);
    res.status(500).json({ error: error.message });
  }
};

// Remove a word usage from a lexical set
export const removeUsageFromLexicalSet = async (req, res) => {
  try {
    const { lexicalSetId, usageId } = req.params;

    // Check if the lexical set usage exists
    const lexicalSetUsage = await prisma.lexicalSetUsage.findFirst({
      where: {
        lexicalSetId: parseInt(lexicalSetId),
        usageId: parseInt(usageId),
      },
    });

    if (!lexicalSetUsage) {
      return res.status(404).json({ error: "Lexical set usage not found" });
    }

    // Remove the usage from the lexical set
    await prisma.lexicalSetUsage.delete({
      where: { id: lexicalSetUsage.id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error removing usage from lexical set:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a specific usage from a dictionary entry
export const deleteUsage = async (req, res) => {
  try {
    const { entryId, usageId } = req.params;
    console.log(`Attempting to delete usage ${usageId} from entry ${entryId}`);

    // First check if the usage exists and belongs to the entry
    const usage = await prisma.wordUsage.findFirst({
      where: {
        id: parseInt(usageId),
        entryId: parseInt(entryId),
      },
    });

    if (!usage) {
      console.log(
        `Usage ${usageId} not found or does not belong to entry ${entryId}`
      );
      return res.status(404).json({ error: "Usage not found" });
    }

    // Delete all related records for this usage
    await prisma.pronunciation.deleteMany({
      where: { usageId: parseInt(usageId) },
    });

    await prisma.example.deleteMany({
      where: { usageId: parseInt(usageId) },
    });

    await prisma.spellingPattern.deleteMany({
      where: { usageId: parseInt(usageId) },
    });

    await prisma.lexicalSetUsage.deleteMany({
      where: { usageId: parseInt(usageId) },
    });

    // Finally delete the usage itself
    await prisma.wordUsage.delete({
      where: { id: parseInt(usageId) },
    });

    console.log(`Successfully deleted usage ${usageId} from entry ${entryId}`);
    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteUsage:", error);
    res.status(500).json({
      error: error.message,
      code: error.code,
      meta: error.meta,
    });
  }
};

// Get all consonant phonemes
export const getConsonantPhonemes = async (req, res) => {
  try {
    const phonemes = await prisma.consonantPhoneme.findMany({
      include: {
        usages: {
          include: {
            wordUsage: {
              include: {
                entry: true,
                pronunciations: true,
                examples: true,
                spellingPatterns: true,
              },
            },
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });
    res.json(phonemes);
  } catch (error) {
    console.error("Error fetching consonant phonemes:", error);
    res.status(500).json({ error: "Failed to fetch consonant phonemes" });
  }
};

// Get a single consonant phoneme by ID
export const getConsonantPhonemeById = async (req, res) => {
  try {
    const { id } = req.params;
    const phoneme = await prisma.consonantPhoneme.findUnique({
      where: { id: parseInt(id) },
      include: {
        usages: {
          include: {
            wordUsage: {
              include: {
                entry: true,
                pronunciations: true,
                examples: true,
                spellingPatterns: true,
              },
            },
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });
    if (!phoneme) {
      return res.status(404).json({ error: "Consonant phoneme not found" });
    }
    res.json(phoneme);
  } catch (error) {
    console.error("Error fetching consonant phoneme:", error);
    res.status(500).json({ error: "Failed to fetch consonant phoneme" });
  }
};

// Create a new consonant phoneme
export const createConsonantPhoneme = async (req, res) => {
  try {
    const { name, description, category, order } = req.body;
    const phoneme = await prisma.consonantPhoneme.create({
      data: {
        name,
        description,
        category,
        order,
      },
    });
    res.status(201).json(phoneme);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a consonant phoneme
export const updateConsonantPhoneme = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, order } = req.body;
    const phoneme = await prisma.consonantPhoneme.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        category,
        order,
      },
    });
    res.json(phoneme);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a consonant phoneme
export const deleteConsonantPhoneme = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.consonantPhoneme.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a usage to a consonant phoneme
export const addUsageToConsonantPhoneme = async (req, res) => {
  try {
    const { phonemeId, usageId } = req.params;
    const { order } = req.body;

    const usage = await prisma.consonantPhonemeUsage.create({
      data: {
        consonantPhonemeId: parseInt(phonemeId),
        usageId: parseInt(usageId),
        order,
      },
      include: {
        consonantPhoneme: true,
        wordUsage: true,
      },
    });
    res.status(201).json(usage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
