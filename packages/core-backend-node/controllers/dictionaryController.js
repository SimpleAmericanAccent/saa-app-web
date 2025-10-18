import { prisma } from "../prisma/services/prismaClient.js";

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

/**
 * Extract audio files from Wiktionary page content
 */
const extractAudioFiles = (content, word) => {
  const audioFiles = [];
  const seenFiles = new Set();

  // Priority patterns for better quality audio files (focus on main patterns)
  const patterns = [
    /data-mwtitle="([^"]*\.(ogg|mp3|wav|oga))"/gi,
    /href="\/wiki\/File:([^"]*\.(ogg|mp3|wav|oga))"/gi,
  ];

  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      let fileName;

      // Extract filename based on pattern type
      if (pattern.source.includes("data-mwtitle=")) {
        fileName = match[1]; // data-mwtitle="filename.ogg"
      } else if (pattern.source.includes("href=")) {
        fileName = match[1]; // href="/wiki/File:filename.ogg"
      }

      if (fileName) {
        // Clean up the filename
        fileName = fileName.split("/").pop(); // Get just the filename

        // Only include English audio files and avoid duplicates
        if (
          fileName &&
          !seenFiles.has(fileName) &&
          fileName.includes(".") &&
          (fileName.includes("en-") ||
            fileName.includes("En-") ||
            fileName.includes("LL-Q1860"))
        ) {
          audioFiles.push(fileName);
          seenFiles.add(fileName);
        }
      }
    }
  });

  // Also search for specific word-related audio files (but be more selective)
  const wordPatterns = [
    new RegExp(
      `en-us-${word.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      )}\\.(ogg|mp3|wav|oga)`,
      "gi"
    ),
    new RegExp(
      `en-uk-${word.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      )}\\.(ogg|mp3|wav|oga)`,
      "gi"
    ),
    new RegExp(
      `En-us-${word.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      )}-[a-z]+\\.(ogg|mp3|wav|oga)`,
      "gi"
    ),
  ];

  wordPatterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (!seenFiles.has(match[0])) {
        audioFiles.push(match[0]);
        seenFiles.add(match[0]);
      }
    }
  });

  return audioFiles;
};

/**
 * Extract accent from filename
 */
const getAccent = (fileName) => {
  // Only set specific accents when explicitly mentioned
  const patterns = [
    /en-([a-z]{2})-/, // en-us-, en-uk-, etc.
    /en-([a-z]{2})-([a-z]+)-/, // en-us-inlandnorth-, etc.
    /En-([a-z]{2})-/, // En-us-, En-uk-, etc. (capitalized)
    /En-([a-z]{2})-([a-z]+)-/, // En-us-inlandnorth-, etc. (capitalized)
    /En-([a-z]{2})-([a-z]+)-([a-z]+)-/, // En-us-lead-metal-, etc. (pronunciation variants)
  ];

  for (const pattern of patterns) {
    const match = fileName.match(pattern);
    if (match) {
      return match[1]; // Return the accent code (us, uk, etc.)
    }
  }

  // Check for specific accent indicators in the filename
  if (fileName.includes("us-") || fileName.includes("US-")) return "us";
  if (fileName.includes("uk-") || fileName.includes("UK-")) return "uk";
  if (fileName.includes("au-") || fileName.includes("AU-")) return "au";

  // Default to unknown for all other cases (including LL-Q1860 files)
  return "unknown";
};

/**
 * Get region name from accent
 */
const getRegion = (accent) => {
  const regions = {
    us: "American English",
    uk: "British English",
    au: "Australian English",
  };
  return regions[accent] || "Unknown";
};

/**
 * Get pronunciation audio files from Wiktionary
 */
export const getWiktionaryAudio = async (req, res) => {
  try {
    const { word } = req.params;

    // Fetch page content
    const response = await fetch(
      `https://en.wiktionary.org/w/api.php?action=parse&format=json&page=${encodeURIComponent(
        word
      )}&prop=text`
    );

    if (!response.ok) {
      return res.status(404).json({ error: "Word not found" });
    }

    const data = await response.json();
    const content = data.parse.text["*"];

    // Extract audio files
    const audioFiles = extractAudioFiles(content, word);

    // Remove duplicates first, then get URLs from MediaWiki API
    const uniqueFiles = [...new Set(audioFiles)];
    const audioUrls = await Promise.all(
      uniqueFiles.map(async (fileName) => {
        try {
          const fileResponse = await fetch(
            `https://en.wiktionary.org/w/api.php?action=query&format=json&titles=File:${encodeURIComponent(
              fileName
            )}&prop=imageinfo&iiprop=url`
          );

          if (!fileResponse.ok) return null;

          const fileData = await fileResponse.json();
          const filePageId = Object.keys(fileData.query.pages)[0];
          const filePage = fileData.query.pages[filePageId];

          if (
            filePage.imageinfo &&
            filePage.imageinfo[0] &&
            filePage.imageinfo[0].url
          ) {
            return {
              fileName,
              url: filePage.imageinfo[0].url,
              accent: getAccent(fileName),
              region: getRegion(getAccent(fileName)),
            };
          }
        } catch (error) {
          console.error(`Error fetching file ${fileName}:`, error);
        }
        return null;
      })
    );

    // Filter out null results, remove duplicates, and only include English files
    const seenUrls = new Set();
    const validAudioFiles = audioUrls.filter((audio) => {
      if (!audio) return false;

      // Only include English audio files
      const isEnglish =
        audio.fileName.includes("en-") ||
        audio.fileName.includes("En-") ||
        audio.fileName.includes("LL-Q1860") ||
        audio.fileName.includes("(eng)") ||
        // Handle pronunciation variants with hyphens (e.g., En-us-lead-metal.oga.mp3)
        audio.fileName.match(/^En-[a-z]{2}-[a-z]+-[a-z]+\./);

      if (!isEnglish) return false;

      // Remove duplicates based on URL (same file, different formatting)
      if (seenUrls.has(audio.url)) return false;

      seenUrls.add(audio.url);
      return true;
    });

    res.json(validAudioFiles);
  } catch (error) {
    console.error("Error fetching Wiktionary audio:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get US pronunciation audio files from Wiktionary
 */
export const getWiktionaryUSAudio = async (req, res) => {
  try {
    const { word } = req.params;

    // Fetch page content
    const response = await fetch(
      `https://en.wiktionary.org/w/api.php?action=parse&format=json&page=${encodeURIComponent(
        word
      )}&prop=text`
    );

    if (!response.ok) {
      return res.status(404).json({ error: "Word not found" });
    }

    const data = await response.json();
    const content = data.parse.text["*"];

    // Extract audio files
    const audioFiles = extractAudioFiles(content, word);

    // Remove duplicates first, then get URLs from MediaWiki API
    const uniqueFiles = [...new Set(audioFiles)];
    const audioUrls = await Promise.all(
      uniqueFiles.map(async (fileName) => {
        try {
          const fileResponse = await fetch(
            `https://en.wiktionary.org/w/api.php?action=query&format=json&titles=File:${encodeURIComponent(
              fileName
            )}&prop=imageinfo&iiprop=url`
          );

          if (!fileResponse.ok) return null;

          const fileData = await fileResponse.json();
          const filePageId = Object.keys(fileData.query.pages)[0];
          const filePage = fileData.query.pages[filePageId];

          if (
            filePage.imageinfo &&
            filePage.imageinfo[0] &&
            filePage.imageinfo[0].url
          ) {
            return {
              fileName,
              url: filePage.imageinfo[0].url,
              accent: getAccent(fileName),
              region: getRegion(getAccent(fileName)),
            };
          }
        } catch (error) {
          console.error(`Error fetching file ${fileName}:`, error);
        }
        return null;
      })
    );

    // Filter for US audio files only
    const usAudioFiles = audioUrls.filter((audio) => {
      if (!audio) return false;

      // Only include US English audio files
      const isUS =
        audio.fileName.includes("en-us-") ||
        audio.fileName.includes("En-us-") ||
        audio.fileName.includes("LL-Q1860") ||
        (audio.fileName.includes("(eng)") &&
          audio.fileName.includes("LL-Q1860"));

      return isUS;
    });

    res.json(usAudioFiles);
  } catch (error) {
    console.error("Error fetching Wiktionary US audio:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
