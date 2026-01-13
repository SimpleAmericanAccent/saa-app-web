import express from "express";
const wiktionaryRouter = express.Router();
import { cleanWordForAPI } from "shared/clean-word.js";

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
const getWiktionaryAudio = async (req, res) => {
  try {
    const { word } = req.params;
    const normalizedWord = cleanWordForAPI(word);

    // Fetch page content
    const response = await fetch(
      `https://en.wiktionary.org/w/api.php?action=parse&format=json&page=${encodeURIComponent(
        normalizedWord
      )}&prop=text`
    );

    if (!response.ok) {
      return res.status(404).json({ error: "Word not found" });
    }

    const data = await response.json();
    const content = data.parse.text["*"];

    // Extract audio files
    const audioFiles = extractAudioFiles(content, normalizedWord);

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
const getWiktionaryUSAudio = async (req, res) => {
  try {
    const { word } = req.params;
    const normalizedWord = cleanWordForAPI(word);

    console.log(
      "Attempting to fetch Wiktionary US audio for word:",
      normalizedWord,
      "at URL:",
      `https://en.wiktionary.org/w/api.php?action=parse&format=json&page=${encodeURIComponent(
        normalizedWord
      )}&prop=text`
    );

    // Fetch page content
    const response = await fetch(
      `https://en.wiktionary.org/w/api.php?action=parse&format=json&page=${encodeURIComponent(
        normalizedWord
      )}&prop=text`
    );

    // console.log("Response:", response);
    console.log("Response status:", response.status);
    // console.log("Response text:", await response.text());
    console.log("Response headers:", response.headers);
    // console.log("Response body:", await response.json());
    console.log("Response error:", response.error);

    if (!response.ok) {
      return res.status(404).json({ error: "Word not found" });
    }

    const data = await response.json();
    const content = data.parse.text["*"];

    // Extract audio files
    const audioFiles = extractAudioFiles(content, normalizedWord);

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
        audio.fileName.includes("en-us-") || audio.fileName.includes("En-us-");

      return isUS;
    });

    res.json(usAudioFiles);
  } catch (error) {
    console.error("Error fetching Wiktionary US audio:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Wiktionary proxy routes (to avoid CORS issues)
wiktionaryRouter.get("/audio/:word", getWiktionaryAudio);
wiktionaryRouter.get("/audio/:word/us", getWiktionaryUSAudio);

export default wiktionaryRouter;
