// Quiz API service for fetching data from backend
const API_BASE_URL = "/api/quiz"; // Use relative URL to work with Vite proxy

// Fetch all available contrasts from the API
export async function fetchContrasts() {
  try {
    const response = await fetch(`${API_BASE_URL}/contrasts`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Convert contrasts to quiz data format
    const quizData = {};
    for (const contrast of data.contrasts) {
      quizData[contrast.key] = {
        id: contrast.key,
        contrastKey: contrast.key,
        pairCount: contrast.pairCount,
        name: contrast.name,
        title: contrast.title,
        description: contrast.description,
        category: contrast.category,
        sound1Name: contrast.soundAName,
        sound2Name: contrast.soundBName,
        sound1Symbol: contrast.soundASymbol,
        sound2Symbol: contrast.soundBSymbol,
      };
    }

    return quizData;
  } catch (error) {
    console.error("Error fetching contrasts:", error);
    throw error;
  }
}

// Fetch pairs for a specific quiz type
export async function fetchPairs(quizTypeId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/pairs?contrastKey=${encodeURIComponent(quizTypeId)}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Convert database pairs to quiz format
    const pairs = data.pairs
      .map((pair) => [
        {
          word: pair.wordA,
          options: [pair.wordA, pair.wordB],
          soundType: "SOUND1",
          alternates: pair.alternateA || [], // Use alternates from database
          pairId: pair.pairId,
          presentedSide: "A", // This question presents wordA
          wordA: pair.wordA,
          wordB: pair.wordB,
          audioAUrl: pair.audioAUrl,
          audioBUrl: pair.audioBUrl,
        },
        {
          word: pair.wordB,
          options: [pair.wordA, pair.wordB],
          soundType: "SOUND2",
          alternates: pair.alternateB || [], // Use alternates from database
          pairId: pair.pairId,
          presentedSide: "B", // This question presents wordB
          wordA: pair.wordA,
          wordB: pair.wordB,
          audioAUrl: pair.audioAUrl,
          audioBUrl: pair.audioBUrl,
        },
      ])
      .flat();

    return pairs;
  } catch (error) {
    console.error("Error fetching pairs:", error);
    throw error;
  }
}

// Save a trial to the API
export async function saveTrial(trialData) {
  try {
    const response = await fetch(`${API_BASE_URL}/trials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(trialData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving trial:", error);
    throw error;
  }
}

// Get quiz metadata for a specific quiz type (now fetches from API)
export async function getQuizMetadata(quizTypeId) {
  try {
    const contrasts = await fetchContrasts();
    return contrasts[quizTypeId] || null;
  } catch (error) {
    console.error("Error fetching quiz metadata:", error);
    return null;
  }
}

// Get all quiz metadata (now fetches from API)
export async function getAllQuizMetadata() {
  try {
    return await fetchContrasts();
  } catch (error) {
    console.error("Error fetching all quiz metadata:", error);
    return {};
  }
}

// Fetch quiz results from API
export async function fetchQuizResults(recentTrials = 30) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/results?recentTrials=${recentTrials}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    throw error;
  }
}

// Save quiz settings to API
export async function saveQuizSettings(settings) {
  try {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ settings }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.settings;
  } catch (error) {
    console.error("Error saving quiz settings:", error);
    throw error;
  }
}

// Fetch quiz settings from API
export async function fetchQuizSettings() {
  try {
    const response = await fetch(`${API_BASE_URL}/settings`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.settings;
  } catch (error) {
    console.error("Error fetching quiz settings:", error);
    throw error;
  }
}

// Fetch progress data for a specific contrast
export async function fetchProgressData(contrastKey, windowSize = 30) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/progress/${encodeURIComponent(
        contrastKey
      )}?windowSize=${windowSize}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching progress data:", error);
    throw error;
  }
}
