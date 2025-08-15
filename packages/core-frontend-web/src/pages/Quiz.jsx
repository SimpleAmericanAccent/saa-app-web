import React, { useState, useRef, useEffect } from "react";
import { Button } from "core-frontend-web/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "core-frontend-web/src/components/ui/card";
import { Progress } from "core-frontend-web/src/components/ui/progress";
import { Checkbox } from "core-frontend-web/src/components/ui/checkbox";
import { Play, Volume2, Loader2 } from "lucide-react";

// Quiz type IDs for easy reference
const QUIZ_TYPE_IDS = {
  FLEECE_KIT: "fleece_kit",
  DRESS_TRAP: "dress_trap",
  DRESS_BAN: "dress_ban",
  FOOT_GOOSE: "foot_goose",
  STRUT_LOT: "strut_lot",
};

// Minimal pairs data for FLEECE vs KIT vowels (alphabetical by FLEECE word)
const fleeceKitMinimalPairs = [
  // Basic minimal pairs with alternates
  [
    { word: "beach", alternates: ["beech"] },
    { word: "bitch", alternates: [] },
  ],
  [
    { word: "bead", alternates: [] },
    { word: "bid", alternates: [] },
  ],
  [
    { word: "bean", alternates: [] },
    { word: "bin", alternates: ["been"] },
  ],
  [
    { word: "bees", alternates: [] },
    { word: "biz", alternates: [] },
  ],
  [
    { word: "beat", alternates: ["beet"] },
    { word: "bit", alternates: [] },
  ],
  [
    { word: "cease", alternates: [] },
    { word: "sis", alternates: ["cis"] },
  ],
  [
    { word: "cheap", alternates: [] },
    { word: "chip", alternates: [] },
  ],
  [
    { word: "cheek", alternates: [] },
    { word: "chick", alternates: [] },
  ],
  [
    { word: "deal", alternates: [] },
    { word: "dill", alternates: [] },
  ],
  [
    { word: "deep", alternates: [] },
    { word: "dip", alternates: [] },
  ],
  [
    { word: "deed", alternates: [] },
    { word: "did", alternates: [] },
  ],
  [
    { word: "each", alternates: [] },
    { word: "itch", alternates: [] },
  ],
  [
    { word: "eat", alternates: [] },
    { word: "it", alternates: [] },
  ],
  [
    { word: "ease", alternates: [] },
    { word: "is", alternates: [] },
  ],
  [
    { word: "eel", alternates: [] },
    { word: "ill", alternates: [] },
  ],
  [
    { word: "feet", alternates: ["feat"] },
    { word: "fit", alternates: [] },
  ],
  [
    { word: "feel", alternates: [] },
    { word: "fill", alternates: ["Phil"] },
  ],
  [
    { word: "fees", alternates: [] },
    { word: "fizz", alternates: [] },
  ],
  [
    { word: "green", alternates: [] },
    { word: "grin", alternates: [] },
  ],
  [
    { word: "heap", alternates: [] },
    { word: "hip", alternates: [] },
  ],
  [
    { word: "heat", alternates: [] },
    { word: "hit", alternates: [] },
  ],
  [
    { word: "heel", alternates: ["heal"] },
    { word: "hill", alternates: [] },
  ],
  [
    { word: "he's", alternates: [] },
    { word: "his", alternates: [] },
  ],
  [
    { word: "Jeep", alternates: [] },
    { word: "gyp", alternates: [] },
  ],
  [
    { word: "keep", alternates: [] },
    { word: "kip", alternates: [] },
  ],
  [
    { word: "keyed", alternates: [] },
    { word: "kid", alternates: [] },
  ],
  [
    { word: "leak", alternates: ["leek"] },
    { word: "lick", alternates: [] },
  ],
  [
    { word: "lead", alternates: [] },
    { word: "lid", alternates: [] },
  ],
  [
    { word: "leap", alternates: [] },
    { word: "lip", alternates: [] },
  ],
  [
    { word: "leave", alternates: [] },
    { word: "live", alternates: [] },
  ],
  [
    { word: "Lee's", alternates: [] },
    { word: "Liz", alternates: [] },
  ],
  [
    { word: "meal", alternates: [] },
    { word: "mill", alternates: ["mil"] },
  ],
  [
    { word: "mean", alternates: [] },
    { word: "min", alternates: [] },
  ],
  [
    { word: "meet", alternates: ["meat"] },
    { word: "mitt", alternates: [] },
  ],
  [
    { word: "peach", alternates: [] },
    { word: "pitch", alternates: [] },
  ],
  [
    { word: "peek", alternates: ["peak", "pique"] },
    { word: "pick", alternates: ["pic"] },
  ],
  [
    { word: "peel", alternates: [] },
    { word: "pill", alternates: [] },
  ],
  [
    { word: "Pete", alternates: ["peat"] },
    { word: "pit", alternates: [] },
  ],
  [
    { word: "piece", alternates: ["peace"] },
    { word: "piss", alternates: [] },
  ],
  [
    { word: "reach", alternates: [] },
    { word: "rich", alternates: [] },
  ],
  [
    { word: "read", alternates: ["reed"] },
    { word: "rid", alternates: [] },
  ],
  [
    { word: "reef", alternates: [] },
    { word: "riff", alternates: [] },
  ],
  [
    { word: "seal", alternates: [] },
    { word: "sill", alternates: [] },
  ],
  [
    { word: "seat", alternates: [] },
    { word: "sit", alternates: [] },
  ],
  [
    { word: "seek", alternates: [] },
    { word: "sick", alternates: [] },
  ],
  [
    { word: "seen", alternates: ["scene"] },
    { word: "sin", alternates: [] },
  ],
  [
    { word: "seem", alternates: ["seam"] },
    { word: "sim", alternates: [] },
  ],
  [
    { word: "sheet", alternates: [] },
    { word: "shit", alternates: [] },
  ],
  [
    { word: "sheen", alternates: [] },
    { word: "shin", alternates: [] },
  ],
  [
    { word: "sheep", alternates: [] },
    { word: "ship", alternates: [] },
  ],
  [
    { word: "sleep", alternates: [] },
    { word: "slip", alternates: [] },
  ],
  [
    { word: "steal", alternates: ["steel"] },
    { word: "still", alternates: [] },
  ],
  [
    { word: "team", alternates: [] },
    { word: "Tim", alternates: [] },
  ],
  [
    { word: "teen", alternates: [] },
    { word: "tin", alternates: [] },
  ],
  [
    { word: "wean", alternates: [] },
    { word: "win", alternates: [] },
  ],
  [
    { word: "week", alternates: ["weak"] },
    { word: "wick", alternates: [] },
  ],
  [
    { word: "weep", alternates: [] },
    { word: "whip", alternates: [] },
  ],
  [
    { word: "wheat", alternates: [] },
    { word: "wit", alternates: [] },
  ],
  [
    { word: "wheel", alternates: [] },
    { word: "will", alternates: [] },
  ],
  [
    { word: "wheeze", alternates: [] },
    { word: "wiz", alternates: [] },
  ],
];

// Minimal pairs data for DRESS vs TRAP vowels (alphabetical by DRESS word)
const dressTrapMinimalPairs = [
  [
    { word: "bed", alternates: [] },
    { word: "bad", alternates: [] },
  ],
  [
    { word: "bet", alternates: [] },
    { word: "bat", alternates: [] },
  ],
  [
    { word: "dead", alternates: [] },
    { word: "dad", alternates: ["Dad"] },
  ],
  [
    { word: "fed", alternates: [] },
    { word: "fad", alternates: [] },
  ],
  [
    { word: "head", alternates: [] },
    { word: "had", alternates: [] },
  ],
  [
    { word: "led", alternates: ["lead"] },
    { word: "lad", alternates: [] },
  ],
  [
    { word: "met", alternates: [] },
    { word: "mat", alternates: ["Matt"] },
  ],
  [
    { word: "red", alternates: ["read"] },
    { word: "rad", alternates: [] },
  ],
  [
    { word: "said", alternates: [] },
    { word: "sad", alternates: [] },
  ],
  [
    { word: "set", alternates: [] },
    { word: "sat", alternates: [] },
  ],

  [
    { word: "ed", alternates: ["Ed"] },
    { word: "ad", alternates: ["add"] },
  ],
  [
    { word: "L", alternates: ["Elle"] },
    { word: "Al", alternates: [] },
  ],
  [
    { word: "S", alternates: [] },
    { word: "ass", alternates: [] },
  ],
  [
    { word: "Deb", alternates: [] },
    { word: "dab", alternates: [] },
  ],
  [
    { word: "neck", alternates: [] },
    { word: "knack", alternates: [] },
  ],
  [
    { word: "peck", alternates: ["pec"] },
    { word: "pack", alternates: [] },
  ],
  [
    { word: "wreck", alternates: [] },
    { word: "rack", alternates: [] },
  ],
  [
    { word: "tech", alternates: [] },
    { word: "tack", alternates: [] },
  ],
  [
    { word: "med", alternates: [] },
    { word: "mad", alternates: [] },
  ],
  [
    { word: "Ted", alternates: [] },
    { word: "tad", alternates: [] },
  ],
  [
    { word: "left", alternates: [] },
    { word: "laughed", alternates: [] },
  ],
  [
    { word: "left", alternates: [] },
    { word: "laughed", alternates: [] },
  ],
  [
    { word: "left", alternates: [] },
    { word: "laughed", alternates: [] },
  ],
  [
    { word: "beg", alternates: [] },
    { word: "bag", alternates: [] },
  ],
  [
    { word: "Meg", alternates: [] },
    { word: "mag", alternates: [] },
  ],
  [
    { word: "reg", alternates: [] },
    { word: "rag", alternates: [] },
  ],
  [
    { word: "sell", alternates: [] },
    { word: "Sal", alternates: [] },
  ],
  [
    { word: "shell", alternates: [] },
    { word: "shall", alternates: [] },
  ],
  [
    { word: "reg", alternates: [] },
    { word: "rag", alternates: [] },
  ],
  [
    { word: "reg", alternates: [] },
    { word: "rag", alternates: [] },
  ],
];

// Minimal pairs data for DRESS vs BAN vowels (alphabetical by DRESS word)
const dressBanMinimalPairs = [
  [
    { word: "ten", alternates: [] },
    { word: "tan", alternates: [] },
  ],
  [
    { word: "send", alternates: [] },
    { word: "sand", alternates: [] },
  ],
  [
    { word: "Ken", alternates: [] },
    { word: "can", alternates: [] },
  ],
  [
    { word: "den", alternates: [] },
    { word: "Dan", alternates: [] },
  ],
  [
    { word: "den", alternates: [] },
    { word: "Dan", alternates: [] },
  ],
  [
    { word: "Jen", alternates: ["gen"] },
    { word: "Jan", alternates: [] },
  ],
  [
    { word: "lend", alternates: [] },
    { word: "land", alternates: [] },
  ],

  [
    { word: "pen", alternates: [] },
    { word: "pan", alternates: [] },
  ],
  [
    { word: "rent", alternates: [] },
    { word: "rant", alternates: [] },
  ],

  [
    { word: "Venn", alternates: [] },
    { word: "van", alternates: [] },
  ],
  [
    { word: "then", alternates: [] },
    { word: "than", alternates: [] },
  ],
];

// Minimal pairs data for FOOT vs GOOSE vowels (alphabetical by FOOT word)
const footGooseMinimalPairs = [
  [
    { word: "nook", alternates: [] },
    { word: "nuke", alternates: [] },
  ],
  [
    { word: "would", alternates: ["wood"] },
    { word: "wooed", alternates: [] },
  ],
  [
    { word: "could", alternates: [] },
    { word: "cooed", alternates: [] },
  ],
  [
    { word: "should", alternates: [] },
    { word: "shooed", alternates: [] },
  ],
  [
    { word: "look", alternates: [] },
    { word: "Luke", alternates: [] },
  ],
];

// Minimal pairs data for STRUT vs LOT vowels (alphabetical by STRUT word)
const strutLotMinimalPairs = [
  [
    { word: "bud", alternates: [] },
    { word: "bod", alternates: [] },
  ],
  [
    { word: "bus", alternates: [] },
    { word: "boss", alternates: [] },
  ],
  [
    { word: "but", alternates: ["butt"] },
    { word: "bot", alternates: [] },
  ],
  [
    { word: "cup", alternates: [] },
    { word: "cop", alternates: [] },
  ],
  [
    { word: "cut", alternates: [] },
    { word: "cot", alternates: ["caught"] },
  ],
  [
    { word: "duck", alternates: [] },
    { word: "dock", alternates: [] },
  ],

  [
    { word: "fun", alternates: [] },
    { word: "fawn", alternates: [] },
  ],
  [
    { word: "hut", alternates: [] },
    { word: "hot", alternates: [] },
  ],
  [
    { word: "luck", alternates: [] },
    { word: "lock", alternates: [] },
  ],
  [
    { word: "mud", alternates: [] },
    { word: "mod", alternates: [] },
  ],
  [
    { word: "nut", alternates: [] },
    { word: "not", alternates: [] },
  ],
  [
    { word: "run", alternates: [] },
    { word: "Ron", alternates: [] },
  ],
  [
    { word: "shut", alternates: [] },
    { word: "shot", alternates: [] },
  ],
  [
    { word: "lunch", alternates: [] },
    { word: "launch", alternates: [] },
  ],
  [
    { word: "done", alternates: [] },
    { word: "dawn", alternates: ["dawn"] },
  ],
  [
    { word: "gun", alternates: [] },
    { word: "gone", alternates: [] },
  ],
  [
    { word: "none", alternates: ["nun"] },
    { word: "non", alternates: [] },
  ],
  [
    { word: "pun", alternates: [] },
    { word: "pawn", alternates: [] },
  ],
  [
    { word: "rung", alternates: [] },
    { word: "wrong", alternates: [] },
  ],
  [
    { word: "sung", alternates: [] },
    { word: "song", alternates: [] },
  ],
  [
    { word: "son", alternates: ["sun"] },
    { word: "sawn", alternates: [] },
  ],
];

// Function to process minimal pairs data into quiz format
const processMinimalPairsData = (pairsData) => {
  return pairsData
    .map(([vowel1Data, vowel2Data]) => [
      {
        word: vowel1Data.word,
        options: [vowel1Data.word, vowel2Data.word],
        vowelType: "VOWEL1",
        alternates: vowel1Data.alternates,
      },
      {
        word: vowel2Data.word,
        options: [vowel1Data.word, vowel2Data.word],
        vowelType: "VOWEL2",
        alternates: vowel2Data.alternates,
      },
    ])
    .flat();
};

// Quiz data mapping
const QUIZ_DATA = {
  [QUIZ_TYPE_IDS.FLEECE_KIT]: {
    id: QUIZ_TYPE_IDS.FLEECE_KIT,
    name: "FLEECE vs KIT",
    title: "FLEECE vs KIT Minimal Pairs Quiz",
    description: "sick vs seek, it vs eat",
    pairs: processMinimalPairsData(fleeceKitMinimalPairs),
    vowel1Name: "FLEECE",
    vowel2Name: "KIT",
    vowel1Symbol: "[i]",
    vowel2Symbol: "[ɪ]",
  },
  [QUIZ_TYPE_IDS.DRESS_TRAP]: {
    id: QUIZ_TYPE_IDS.DRESS_TRAP,
    name: "DRESS vs TRAP",
    title: "DRESS vs TRAP Minimal Pairs Quiz",
    description: "bed vs bad, dead vs dad",
    pairs: processMinimalPairsData(dressTrapMinimalPairs),
    vowel1Name: "DRESS",
    vowel2Name: "TRAP",
    vowel1Symbol: "[ɛ]",
    vowel2Symbol: "[æ]",
  },
  [QUIZ_TYPE_IDS.DRESS_BAN]: {
    id: QUIZ_TYPE_IDS.DRESS_BAN,
    name: "DRESS vs BAN",
    title: "DRESS vs BAN Minimal Pairs Quiz",
    description: "ten vs tan, send vs sand",
    pairs: processMinimalPairsData(dressBanMinimalPairs),
    vowel1Name: "DRESS",
    vowel2Name: "BAN",
    vowel1Symbol: "[ɛ]",
    vowel2Symbol: "[eə̯]",
  },
  [QUIZ_TYPE_IDS.FOOT_GOOSE]: {
    id: QUIZ_TYPE_IDS.FOOT_GOOSE,
    name: "FOOT vs GOOSE",
    title: "FOOT vs GOOSE Minimal Pairs Quiz",
    description: "book vs boo, foot vs food",
    pairs: processMinimalPairsData(footGooseMinimalPairs),
    vowel1Name: "FOOT",
    vowel2Name: "GOOSE",
    vowel1Symbol: "[ʊ]",
    vowel2Symbol: "[ɨ̯u]",
  },
  [QUIZ_TYPE_IDS.STRUT_LOT]: {
    id: QUIZ_TYPE_IDS.STRUT_LOT,
    name: "STRUT vs LOT",
    title: "STRUT vs LOT Minimal Pairs Quiz",
    description: "cut vs cot, hut vs hot",
    pairs: processMinimalPairsData(strutLotMinimalPairs),
    vowel1Name: "STRUT",
    vowel2Name: "LOT",
    vowel1Symbol: "[ʌ̟]",
    vowel2Symbol: "[ɑ]",
  },
};

// Word metadata dictionary
const wordMetadata = {
  // FLEECE words
  beat: {
    frequency: 0.0001, // Relative frequency (0-1)
    syllables: 1,
    offensive: false,
    phonemes: ["b", "iː", "t"],
    neighboringPhonemes: ["b", "t"],
    difficulty: "easy",
  },
  meet: {
    frequency: 0.0002,
    syllables: 1,
    offensive: false,
    phonemes: ["m", "iː", "t"],
    neighboringPhonemes: ["m", "t"],
    difficulty: "easy",
  },
  feel: {
    frequency: 0.0003,
    syllables: 1,
    offensive: false,
    phonemes: ["f", "iː", "l"],
    neighboringPhonemes: ["f", "l"],
    difficulty: "easy",
  },

  // KIT words
  bit: {
    frequency: 0.0001,
    syllables: 1,
    offensive: false,
    phonemes: ["b", "ɪ", "t"],
    neighboringPhonemes: ["b", "t"],
    difficulty: "easy",
  },
  mitt: {
    frequency: 0.00005,
    syllables: 1,
    offensive: false,
    phonemes: ["m", "ɪ", "t"],
    neighboringPhonemes: ["m", "t"],
    difficulty: "medium",
  },
  fill: {
    frequency: 0.0002,
    syllables: 1,
    offensive: false,
    phonemes: ["f", "ɪ", "l"],
    neighboringPhonemes: ["f", "l"],
    difficulty: "easy",
  },

  // Add more words as needed...
};

// Helper function to get word metadata
const getWordMetadata = (word) => {
  return (
    wordMetadata[word] || {
      frequency: 0,
      syllables: 1,
      offensive: false,
      phonemes: [],
      neighboringPhonemes: [],
      difficulty: "unknown",
    }
  );
};

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function Quiz() {
  const [quizSettings, setQuizSettings] = useState({
    numberOfQuestions: 10,
    autoPlayAudio: true,
    showVowelSymbols: true,
  });
  const [selectedQuizType, setSelectedQuizType] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [playingSource, setPlayingSource] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrls, setAudioUrls] = useState({
    dictionary: null,
    browserTTS: null,
  });
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState("settings"); // "settings", "quizType", "quiz"
  const audioRef = useRef(null);

  // Get current quiz data
  const currentQuizData = selectedQuizType ? QUIZ_DATA[selectedQuizType] : null;

  // Initialize shuffled questions when quiz type is selected
  useEffect(() => {
    if (selectedQuizType && currentQuizData) {
      const allQuestions = shuffleArray(currentQuizData.pairs);
      // Limit questions based on settings
      const limitedQuestions =
        quizSettings.numberOfQuestions === "all"
          ? allQuestions
          : allQuestions.slice(0, quizSettings.numberOfQuestions);
      setShuffledQuestions(limitedQuestions);
    }
  }, [selectedQuizType, currentQuizData, quizSettings.numberOfQuestions]);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const progress =
    ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;

  // Function to get US audio from Free Dictionary API
  const getDictionaryAudio = async (word) => {
    if (!word) return null;

    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
      const data = await response.json();

      if (
        data &&
        data[0] &&
        data[0].phonetics &&
        data[0].phonetics.length > 0
      ) {
        // Look for US audio specifically
        const usPhonetic = data[0].phonetics.find(
          (p) => p.audio && p.audio.includes("-us.")
        );

        // Only return US audio, no fallback
        if (usPhonetic && usPhonetic.audio) {
          return usPhonetic.audio;
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching dictionary audio:", error);
      return null;
    }
  };

  // Function to check if browser TTS is available
  const getBrowserTTSAudio = async (word) => {
    if (!word) return null;

    try {
      // Check if browser supports speech synthesis
      if ("speechSynthesis" in window) {
        // iOS Safari specific check
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari =
          /Safari/.test(navigator.userAgent) &&
          !/Chrome/.test(navigator.userAgent);

        if (isIOS && isSafari) {
          // For iOS Safari, we'll still return browserTTS but handle it differently
          return "browserTTS";
        }

        return "browserTTS"; // Special identifier for browser TTS
      }
      return null;
    } catch (error) {
      console.error("Error checking browser TTS:", error);
      return null;
    }
  };

  // Function to get all audio sources for a word
  const getAudioForWord = async (word) => {
    if (!word) return;

    setIsLoading(true);
    try {
      const [dictionaryAudio, browserTTSAudio] = await Promise.all([
        getDictionaryAudio(word),
        getBrowserTTSAudio(word),
      ]);

      setAudioUrls({
        dictionary: dictionaryAudio,
        browserTTS: browserTTSAudio,
      });
    } catch (error) {
      console.error("Error fetching audio:", error);
      setAudioUrls({ dictionary: null, browserTTS: null });
    } finally {
      setIsLoading(false);
    }
  };

  // Load audio when question changes
  useEffect(() => {
    if (currentQuestion) {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      speechSynthesis.cancel();
      setPlayingSource(null);
      setHasAutoPlayed(false); // Reset auto-play flag

      setAudioUrls({ dictionary: null, browserTTS: null });
      getAudioForWord(currentQuestion.word);
    }
  }, [currentQuestionIndex, currentQuestion]);

  // Auto-play audio when URLs are loaded
  useEffect(() => {
    if (
      (audioUrls.dictionary || audioUrls.browserTTS) &&
      !playingSource &&
      !isLoading &&
      !hasAutoPlayed &&
      hasUserInteracted && // Only autoplay after user has interacted
      quizSettings.autoPlayAudio // Only autoplay if setting is enabled
    ) {
      const timer = setTimeout(() => {
        // Check if we're on iOS Safari
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari =
          /Safari/.test(navigator.userAgent) &&
          !/Chrome/.test(navigator.userAgent);

        if (audioUrls.dictionary) {
          // Always prefer dictionary audio if available
          setHasAutoPlayed(true);
          playAudio("dictionary");
        } else if (audioUrls.browserTTS && !(isIOS && isSafari)) {
          // Only auto-play browser TTS on non-iOS Safari
          setHasAutoPlayed(true);
          playAudio("browserTTS");
        }
      }, 800); // Slight delay to ensure audio is ready

      return () => clearTimeout(timer);
    }
  }, [
    audioUrls.dictionary,
    audioUrls.browserTTS,
    playingSource,
    isLoading,
    hasAutoPlayed,
    hasUserInteracted,
    quizSettings.autoPlayAudio,
  ]);

  // Handle settings changes
  const handleSettingsChange = (setting, value) => {
    setQuizSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  // Handle settings completion
  const handleSettingsComplete = () => {
    setCurrentStep("quizType");
  };

  // Handle quiz type selection
  const handleQuizTypeSelect = (quizTypeId) => {
    setSelectedQuizType(quizTypeId);
    setCurrentStep("quiz");
    setHasUserInteracted(true);
  };

  // Handle begin quiz (for backward compatibility)
  const handleBeginQuiz = () => {
    setHasUserInteracted(true);
  };

  const playAudio = (source) => {
    // Mark that user has interacted
    setHasUserInteracted(true);

    // Stop any currently playing audio first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    speechSynthesis.cancel(); // Stop any TTS

    if (source === "browserTTS") {
      // iOS Safari specific handling
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari =
        /Safari/.test(navigator.userAgent) &&
        !/Chrome/.test(navigator.userAgent);

      if (isIOS && isSafari) {
        // iOS Safari requires special handling
        try {
          // Cancel any existing speech
          speechSynthesis.cancel();

          // Create utterance with iOS-friendly settings
          const utterance = new SpeechSynthesisUtterance(currentQuestion.word);
          utterance.lang = "en-US";
          utterance.rate = 0.7; // Slightly slower for iOS
          utterance.pitch = 1.0;
          utterance.volume = 1.0;

          // iOS Safari specific event handlers
          utterance.onstart = () => {
            setPlayingSource(source);
          };

          utterance.onend = () => {
            setPlayingSource(null);
          };

          utterance.onerror = (event) => {
            console.error("iOS Safari TTS error:", event);
            setPlayingSource(null);

            // If it's a not-allowed error, show user-friendly message
            if (event.error === "not-allowed") {
              alert(
                "Please enable speech synthesis in your iOS settings or try the US Native audio option."
              );
            }
          };

          // Add a small delay for iOS Safari
          setTimeout(() => {
            speechSynthesis.speak(utterance);
          }, 100);
        } catch (error) {
          console.error("iOS Safari TTS setup error:", error);
          setPlayingSource(null);
        }
      } else {
        // Standard browser TTS for other browsers
        const utterance = new SpeechSynthesisUtterance(currentQuestion.word);
        utterance.lang = "en-US";
        utterance.rate = 0.8; // Slightly slower for clarity
        utterance.onend = () => setPlayingSource(null);
        utterance.onerror = () => setPlayingSource(null);
        speechSynthesis.speak(utterance);
        setPlayingSource(source);
      }
    } else {
      // Use audio element for dictionary audio
      const url = audioUrls[source];
      if (audioRef.current && url) {
        audioRef.current.src = url;
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
          setPlayingSource(null);
        });
        setPlayingSource(source);
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (isAnswered) return; // Don't respond to keys when answered

      switch (event.key) {
        case "1":
          if (audioUrls.dictionary && !playingSource && !isLoading) {
            playAudio("dictionary");
          }
          break;
        case "2":
          if (audioUrls.browserTTS && !playingSource && !isLoading) {
            playAudio("browserTTS");
          }
          break;
        case "ArrowLeft":
        case "a":
          if (currentQuestion.options[0]) {
            handleAnswerSelect(currentQuestion.options[0]);
          }
          break;
        case "ArrowRight":
        case "d":
          if (currentQuestion.options[1]) {
            handleAnswerSelect(currentQuestion.options[1]);
          }
          break;
        case "Enter":
        case " ":
          // Auto-advance if answered
          if (isAnswered) {
            handleNext();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isAnswered, audioUrls, playingSource, isLoading, currentQuestion]);

  const handleAudioEnded = () => {
    setPlayingSource(null);
  };

  const handleAudioError = () => {
    console.error("Audio playback error");
    setPlayingSource(null);
  };

  const handleAnswerSelect = (answer) => {
    if (isAnswered) return;

    // Mark that user has interacted
    setHasUserInteracted(true);

    setSelectedAnswer(answer);
    setIsAnswered(true);
    setQuestionsAnswered(questionsAnswered + 1);

    // Check if answer matches the word or any of its alternates
    const isCorrect =
      answer === currentQuestion.word ||
      currentQuestion.alternates.includes(answer);

    if (isCorrect) {
      setScore(score + 1);
    }

    // Auto-advance after a short delay for better flow
    setTimeout(() => {
      if (currentQuestionIndex < shuffledQuestions.length - 1) {
        handleNext();
      } else {
        // This is the last question, show results
        setShowResults(true);
      }
    }, 1000); // 1 second delay
  };

  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setSelectedQuizType(null);
    setCurrentQuestionIndex(0);
    setQuestionsAnswered(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
    setHasAutoPlayed(false);
    setPlayingSource(null);
    setHasUserInteracted(false);
    setCurrentStep("settings");
    setShuffledQuestions([]);
  };

  if (showResults) {
    const percentage = Math.round((score / shuffledQuestions.length) * 100);

    // Determine performance level and message
    let performanceLevel, message, colorClass;
    if (percentage === 100) {
      performanceLevel = "Perfect";
      message = "Perfect! You've mastered this vowel distinction!";
      colorClass = "text-green-600 dark:text-green-400";
    } else if (percentage >= 80) {
      performanceLevel = "Good";
      message = "Good work! You have a solid grasp of this distinction.";
      colorClass = "text-blue-600 dark:text-blue-400";
    } else if (percentage >= 60) {
      performanceLevel = "Fair";
      message = "Fair performance. More practice will help you improve.";
      colorClass = "text-yellow-600 dark:text-yellow-400";
    } else {
      performanceLevel = "Needs Practice";
      message = "This distinction needs more practice. Don't give up!";
      colorClass = "text-red-600 dark:text-red-400";
    }

    return (
      <div className="h-[100vh] bg-background flex items-center justify-center p-2 sm:p-4 max-h-screen">
        <Card className="w-full max-w-lg ">
          <CardHeader className="text-center pb-0">
            <CardTitle className="text-base sm:text-xl">
              Quiz Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-0">
            {/* 2x2 Grid Layout */}
            <div className="grid grid-cols-2 gap-3 max-w-full">
              {/* Progress Ring */}
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="30"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-muted/20"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="30"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 30}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 30 * (1 - percentage / 100)
                        }`}
                        className={`${colorClass} transition-all duration-1000`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-base font-bold ${colorClass}`}>
                          {percentage}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {score}/{shuffledQuestions.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vowel Distinction Info */}
              {currentQuizData && (
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="font-semibold mb-1 text-xs">
                      Distinction Practiced
                    </h3>
                    <div className="flex justify-center items-center gap-1 text-xs">
                      <div className="text-center">
                        <div className="font-mono text-xs">
                          {currentQuizData.vowel1Symbol}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {currentQuizData.vowel1Name}
                        </div>
                      </div>
                      <div className="text-muted-foreground text-xs">vs</div>
                      <div className="text-center">
                        <div className="font-mono text-xs">
                          {currentQuizData.vowel2Symbol}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {currentQuizData.vowel2Name}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Again Button */}
              <div className="flex items-center justify-center">
                <Button
                  onClick={handleRestart}
                  className="w-full h-8 text-xs cursor-pointer"
                  size="sm"
                >
                  Again
                </Button>
              </div>

              {/* Change Button */}
              <div className="flex items-center justify-center">
                <Button
                  onClick={() => {
                    setSelectedQuizType(null);
                    setCurrentQuestionIndex(0);
                    setQuestionsAnswered(0);
                    setSelectedAnswer(null);
                    setIsAnswered(false);
                    setScore(0);
                    setShowResults(false);
                    setHasAutoPlayed(false);
                    setPlayingSource(null);
                    setHasUserInteracted(false);
                    setCurrentStep("quizType");
                    setShuffledQuestions([]);
                  }}
                  variant="outline"
                  className="w-full h-8 text-xs cursor-pointer"
                  size="sm"
                >
                  Change
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render until questions are shuffled
  if (hasUserInteracted && shuffledQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-var(--navbar-height))] bg-background flex items-center justify-center p-4 overflow-hidden relative">
      {/* Settings Step */}
      {currentStep === "settings" && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg text-center">
                Quiz Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Number of Questions */}
              <div className="space-y-2 text-center">
                <label className="text-md font-medium">
                  Number of Questions
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 30, "all"].map((num) => (
                    <Button
                      key={num}
                      variant={
                        quizSettings.numberOfQuestions === num
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        handleSettingsChange("numberOfQuestions", num)
                      }
                      className="w-full cursor-pointer mt-2"
                    >
                      {num === "all" ? "All" : num}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Auto-play Audio */}
              {/* <div className="space-y-2">
                <label className="text-sm font-medium">Audio Settings</label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoPlayAudio"
                    checked={quizSettings.autoPlayAudio}
                    onCheckedChange={(checked) =>
                      handleSettingsChange("autoPlayAudio", checked)
                    }
                  />
                  <label
                    htmlFor="autoPlayAudio"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Auto-play audio for each question
                  </label>
                </div>
              </div> */}

              {/* Show Vowel Symbols */}
              {/* <div className="space-y-2">
                <label className="text-sm font-medium">Display Options</label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showVowelSymbols"
                    checked={quizSettings.showVowelSymbols}
                    onCheckedChange={(checked) =>
                      handleSettingsChange("showVowelSymbols", checked)
                    }
                  />
                  <label
                    htmlFor="showVowelSymbols"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Show vowel symbols (IPA)
                  </label>
                </div>
              </div> */}

              {/* Continue Button */}
              <Button
                onClick={handleSettingsComplete}
                className="w-full cursor-pointer"
                size="lg"
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quiz Type Selection Step */}
      {currentStep === "quizType" && (
        <div className="absolute inset-0 bg-background/80 flex items-start justify-center z-10 p-4 overflow-y-auto pt-[var(--navbar-height)]">
          <Card className="w-full max-w-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-lg">
                Choose Quiz Type
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.values(QUIZ_DATA).map((quizData) => (
                <Button
                  key={quizData.id}
                  onClick={() => handleQuizTypeSelect(quizData.id)}
                  variant="outline"
                  className="w-full h-auto p-2 flex flex-col items-start space-y-1 cursor-pointer text-wrap"
                >
                  <div className="font-semibold text-sm">{quizData.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {quizData.description}
                  </div>
                </Button>
              ))}
              <Button
                onClick={() => setCurrentStep("settings")}
                variant="ghost"
                className="w-full cursor-pointer text-sm"
              >
                ← Back to Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quiz Interface */}
      {currentStep === "quiz" && hasUserInteracted && currentQuizData && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              {currentQuizData.title}
            </CardTitle>
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>
                  Question {currentQuestionIndex + 1} of{" "}
                  {shuffledQuestions.length}
                </span>
                <span className="text-right">
                  {score}/{questionsAnswered} (
                  {questionsAnswered > 0
                    ? Math.round((score / questionsAnswered) * 100)
                    : 0}
                  %)
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            {/* Audio Player */}
            <div className="space-y-4">
              <p className="text-lg font-medium text-center">
                Listen to the audio for the word:
              </p>

              {/* Hidden audio element */}
              <audio
                ref={audioRef}
                onEnded={handleAudioEnded}
                onError={handleAudioError}
                className="hidden"
              />

              <div className="flex flex-col gap-2 justify-center">
                {/* US Native Audio */}
                <Button
                  onClick={() => playAudio("dictionary")}
                  disabled={playingSource || isLoading || !audioUrls.dictionary}
                  variant="outline"
                  className={`flex items-center gap-2 px-4 py-2 cursor-pointer ${
                    !audioUrls.dictionary && !isLoading ? "opacity-50" : ""
                  }`}
                  title="Press '1' to play US Native audio"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : playingSource === "dictionary" ? (
                    <Volume2 className="h-4 w-4 animate-pulse" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isLoading
                    ? "Loading..."
                    : playingSource === "dictionary"
                    ? "Playing..."
                    : "US Native"}
                </Button>

                {/* Browser TTS */}
                <Button
                  onClick={() => playAudio("browserTTS")}
                  disabled={playingSource || isLoading || !audioUrls.browserTTS}
                  variant="outline"
                  className={`flex items-center gap-2 px-4 py-2 cursor-pointer ${
                    !audioUrls.browserTTS && !isLoading ? "opacity-50" : ""
                  }`}
                  title={
                    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
                    /Safari/.test(navigator.userAgent) &&
                    !/Chrome/.test(navigator.userAgent)
                      ? "iOS Safari: May require settings permission"
                      : "Press '2' to play Browser TTS"
                  }
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : playingSource === "browserTTS" ? (
                    <Volume2 className="h-4 w-4 animate-pulse" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isLoading
                    ? "Loading..."
                    : playingSource === "browserTTS"
                    ? "Playing..."
                    : /iPad|iPhone|iPod/.test(navigator.userAgent) &&
                      /Safari/.test(navigator.userAgent) &&
                      !/Chrome/.test(navigator.userAgent)
                    ? "iOS TTS"
                    : "Browser TTS"}
                </Button>
              </div>

              {!audioUrls.dictionary && !audioUrls.browserTTS && !isLoading && (
                <div className="space-y-3">
                  <p className="text-xs text-orange-600 dark:text-orange-400 text-center">
                    ⚠️ No audio available for this word.
                  </p>
                  <Button
                    onClick={handleNext}
                    variant="secondary"
                    className="w-full"
                  >
                    Skip This Word
                  </Button>
                </div>
              )}
            </div>

            {/* Question */}
            <div className="text-center">
              <p className="text-lg font-medium">Which word did you hear?</p>
              {quizSettings.showVowelSymbols}
            </div>

            {/* Answer Options */}
            <div className="flex gap-3">
              {currentQuestion.options.map((option, index) => {
                // Get all possible correct answers (main word + alternates)
                const correctAnswers = [
                  currentQuestion.word,
                  ...currentQuestion.alternates,
                ];
                const isCorrect = correctAnswers.includes(option);

                // Get alternates for this specific option
                // For the current question word, show its alternates
                // For the other option, we need to find its alternates from the data
                let optionAlternates = [];
                if (option === currentQuestion.word) {
                  optionAlternates = currentQuestion.alternates;
                } else {
                  // Find the other word's alternates from the minimal pairs data
                  const otherWord = currentQuestion.options.find(
                    (o) => o !== currentQuestion.word
                  );
                  const otherQuestion = currentQuizData.pairs.find(
                    (q) => q.word === otherWord
                  );
                  optionAlternates = otherQuestion
                    ? otherQuestion.alternates
                    : [];
                }

                // Determine which vowel symbol to show for this option
                const vowelSymbol =
                  index === 0
                    ? `${currentQuizData.vowel1Name} ${currentQuizData.vowel1Symbol}`
                    : `${currentQuizData.vowel2Name} ${currentQuizData.vowel2Symbol}`;

                return (
                  <div
                    key={option}
                    className="flex-1 flex flex-col items-center space-y-1"
                  >
                    <Button
                      onClick={() => handleAnswerSelect(option)}
                      variant={
                        selectedAnswer === option
                          ? isCorrect
                            ? "default"
                            : "destructive"
                          : "outline"
                      }
                      className="w-full h-12 text-lg relative cursor-pointer"
                      disabled={isAnswered}
                    >
                      <div className="flex flex-col items-center">
                        {optionAlternates.length > 0 ? (
                          <span>
                            {option} / {optionAlternates.join(" / ")}
                          </span>
                        ) : (
                          <span>{option}</span>
                        )}
                      </div>
                      {/* Reserve space for checkmarks to prevent layout shift */}
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center">
                        {isAnswered && selectedAnswer === option && (
                          <span>{isCorrect ? "✅" : "❌"}</span>
                        )}
                        {isAnswered &&
                          isCorrect &&
                          selectedAnswer !== option && <span>✅</span>}
                      </div>
                    </Button>
                    {quizSettings.showVowelSymbols && (
                      <div className="text-xs text-muted-foreground">
                        {vowelSymbol}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
