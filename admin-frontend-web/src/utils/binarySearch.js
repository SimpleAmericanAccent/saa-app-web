export const findActiveWordIndex = (words, currentTime) => {
  let left = 0,
    right = words.length - 1;
  let bestMatch = -1;

  while (left <= right) {
    let mid = Math.floor((left + right) / 2);

    if (words[mid].start_time <= currentTime + 0.05) {
      bestMatch = mid; // Store the latest valid word
      left = mid + 1; // Search in the right half
    } else {
      right = mid - 1; // Search in the left half
    }
  }
  return bestMatch !== -1 ? words[bestMatch].wordIndex : null;
};
