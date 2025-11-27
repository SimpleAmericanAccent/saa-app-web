/**
 * Wiktionary API utility functions
 * Replaces api.dictionaryapi.dev with direct Wiktionary API access
 */

/**
 * Clean word for API lookups by removing punctuation and converting to lowercase
 * @param {string} word - The word to clean
 * @param {string} type - Type of cleaning: 'cmu' for CMU dictionary, 'wiktionary' for Wiktionary
 * @returns {string} Cleaned word
 */
export const cleanWordForAPI = (word, type = "wiktionary") => {
  if (!word) return "";

  let cleaned = word.trim();

  if (type === "cmu") {
    // Remove punctuation for CMU dictionary: period, comma, exclamation, question mark, semicolon, colon, quotes, parentheses, brackets, braces
    cleaned = cleaned.replace(/[.,!?;:“”"—()\[\]{}]/g, "").replace(/’/g, "'");
  } else if (type === "wiktionary") {
    // Remove punctuation for Wiktionary: period, comma, exclamation, question mark, semicolon, colon, hyphen, dash
    cleaned = cleaned.replace(/[.,!?;:“”"—]/g, "").replace(/’/g, "'");
  }

  if (cleaned === "I" || cleaned.startsWith("I'")) {
  } else {
    cleaned = cleaned.toLowerCase();
  }

  return cleaned;
};

/**
 * Clean word for Wiktionary lookup by removing punctuation and converting to lowercase
 * @param {string} word - The word to clean
 * @returns {string} Cleaned word
 */
const cleanWordForWiktionary = (word) => {
  return cleanWordForAPI(word, "wiktionary");
};

/**
 * Get pronunciation audio files from Wiktionary for a given word
 * @param {string} word - The word to look up
 * @returns {Promise<Array>} Array of audio pronunciation objects
 */
export const getWiktionaryAudio = async (word) => {
  if (!word) return [];

  const cleanedWord = cleanWordForWiktionary(word);
  if (!cleanedWord) return [];

  try {
    // Use backend proxy to avoid CORS issues
    const response = await fetch(
      `/api/wiktionary/audio/${encodeURIComponent(cleanedWord)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error(
      `Error fetching Wiktionary audio for "${cleanedWord}":`,
      error
    );
    return [];
  }
};

/**
 * Get flag emoji for accent
 * @param {string} accent - The accent code
 * @returns {string} The flag emoji
 */
export const getFlagForAccent = (accent) => {
  const flagMap = {
    us: "🇺🇸",
    uk: "🇬🇧",
    au: "🇦🇺",
    ca: "🇨🇦",
    nz: "🇳🇿",
    ie: "🇮🇪",
    za: "🇿🇦",
    unknown: "🌍",
  };
  return flagMap[accent] || "🌍";
};

/**
 * Get US audio specifically (for backward compatibility with existing code)
 * @param {string} word - The word to look up
 * @returns {Promise<string|null>} US audio URL or null
 */
export const getWiktionaryUSAudio = async (word) => {
  if (!word) return null;

  const cleanedWord = cleanWordForWiktionary(word);
  if (!cleanedWord) return null;

  try {
    // Use backend proxy to avoid CORS issues
    const response = await fetch(
      `/api/wiktionary/audio/${encodeURIComponent(cleanedWord)}/us`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Return the first US audio URL (for backward compatibility with Quiz)
    if (Array.isArray(data) && data.length > 0) {
      return data[0].url || null;
    }

    return null;
  } catch (error) {
    console.error(
      `Error fetching Wiktionary US audio for "${cleanedWord}":`,
      error
    );
    return null;
  }
};

/**
 * Get all available audio files with metadata
 * @param {string} word - The word to look up
 * @returns {Promise<Array>} Array of audio objects with metadata
 */
export const getWiktionaryAllAudio = async (word) => {
  const audioFiles = await getWiktionaryAudio(word);

  return audioFiles.map((audio, index) => ({
    id: index,
    audio: audio.url,
    text: "", // Wiktionary doesn't provide IPA text in the same way
    accent: audio.accent,
    region: audio.region,
    flag: getFlagForAccent(audio.accent),
    source: "wiktionary",
    fileName: audio.fileName,
  }));
};
