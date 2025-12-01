/**
 * Clean word for API lookups (e.g. punctuation, capitalization, spaces)
 * @param {string} word - The word to clean
 * @returns {string} Cleaned word
 */
export const cleanWordForAPI = (word) => {
  if (!word) return "";

  let cleaned = word
    .trim()
    .replace(/[.,!?;:“”"—()\[\]{}]/g, "")
    .replace(/’/g, "'");

  if (cleaned === "I" || cleaned.startsWith("I'")) {
    // do nothing
  } else {
    cleaned = cleaned.toLowerCase();
  }

  return cleaned;
};
