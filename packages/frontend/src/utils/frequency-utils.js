/**
 * Frequency Data Utilities
 *
 * Utilities for working with word frequency data in the accent explorer
 */

import wordFrequencyLists from "../data/word-frequency-lists.json";

/**
 * Get frequency data for a specific phoneme
 * @param {string} phonemeName - The phoneme name (e.g., 'FLEECE', 'KIT')
 * @returns {Array} Array of word objects with frequency data
 */
export function getFrequencyData(phonemeName) {
  if (!phonemeName || !wordFrequencyLists[phonemeName]) {
    return [];
  }

  const data = wordFrequencyLists[phonemeName];

  // Handle different data structures
  if (Array.isArray(data)) {
    // Direct array format (like FLEECE, KIT)
    return data;
  } else if (data.all && data.all[100]) {
    // Nested structure with frequency ranges
    return data.all[100];
  } else if (data[0] && data[0][100]) {
    // Another nested structure
    return data[0][100];
  }

  return [];
}

/**
 * Get words for a specific frequency range
 * @param {string} phonemeName - The phoneme name
 * @param {number} count - Number of words to return (20, 50, 100, 200)
 * @returns {Array} Array of word objects
 */
export function getFrequencyWords(phonemeName, count = 100) {
  if (!phonemeName || !wordFrequencyLists[phonemeName]) {
    return [];
  }

  const data = wordFrequencyLists[phonemeName];

  // Handle different data structures
  if (Array.isArray(data)) {
    // Direct array format - return first N items
    return data.slice(0, count);
  } else if (data.all && data.all[count]) {
    // Nested structure with frequency ranges
    return data.all[count];
  } else if (data[0] && data[0][count]) {
    // Another nested structure
    return data[0][count];
  }

  return [];
}

/**
 * Get just the word strings (not full objects) for a phoneme
 * @param {string} phonemeName - The phoneme name
 * @param {number} count - Number of words to return
 * @returns {Array} Array of word strings
 */
export function getFrequencyWordStrings(phonemeName, count = 100) {
  const words = getFrequencyWords(phonemeName, count);
  return words.map((word) => word.word).filter(Boolean);
}

/**
 * Check if frequency data is available for a phoneme
 * @param {string} phonemeName - The phoneme name
 * @returns {boolean} True if frequency data exists
 */
export function hasFrequencyData(phonemeName) {
  const data = getFrequencyData(phonemeName);
  return data.length > 0;
}

/**
 * Get frequency information for a specific word
 * @param {string} word - The word to look up
 * @param {string} phonemeName - The phoneme name
 * @returns {Object|null} Frequency data for the word or null if not found
 */
export function getWordFrequency(word, phonemeName) {
  const data = getFrequencyData(phonemeName);
  return data.find((item) => item.word === word) || null;
}

/**
 * Get available frequency ranges for a phoneme
 * @param {string} phonemeName - The phoneme name
 * @returns {Array} Array of available frequency ranges
 */
export function getAvailableFrequencyRanges(phonemeName) {
  if (!phonemeName || !wordFrequencyLists[phonemeName]) {
    return [];
  }

  const data = wordFrequencyLists[phonemeName];
  const ranges = [];

  if (Array.isArray(data)) {
    // Direct array format - estimate ranges based on length
    if (data.length >= 20) ranges.push(20);
    if (data.length >= 50) ranges.push(50);
    if (data.length >= 100) ranges.push(100);
    if (data.length >= 200) ranges.push(200);
  } else if (data.all) {
    // Nested structure
    Object.keys(data.all).forEach((key) => {
      if (data.all[key] && data.all[key].length > 0) {
        ranges.push(parseInt(key));
      }
    });
  }

  return ranges.sort((a, b) => a - b);
}
