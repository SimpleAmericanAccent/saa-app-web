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
  KIT_FLEECE: "kit_fleece",
  TRAP_DRESS: "trap_dress",
  BAN_DRESS: "ban_dress",
  FOOT_GOOSE: "foot_goose",
  STRUT_LOT: "strut_lot",
};

// Minimal pairs data for KIT vs FLEECE vowels (alphabetical by KIT word)
const kitFleeceMinimalPairs = [
  // Basic minimal pairs with alternates
  [
    { word: "bitch", alternates: [] },
    { word: "beach", alternates: ["beech"] },
  ],
  [
    { word: "bid", alternates: [] },
    { word: "bead", alternates: [] },
  ],
  [
    { word: "bin", alternates: ["been"] },
    { word: "bean", alternates: [] },
  ],
  [
    { word: "biz", alternates: [] },
    { word: "bees", alternates: [] },
  ],
  [
    { word: "bit", alternates: [] },
    { word: "beat", alternates: ["beet"] },
  ],
  [
    { word: "sis", alternates: ["cis"] },
    { word: "cease", alternates: [] },
  ],
  [
    { word: "chip", alternates: [] },
    { word: "cheap", alternates: [] },
  ],
  [
    { word: "chick", alternates: [] },
    { word: "cheek", alternates: [] },
  ],
  [
    { word: "dill", alternates: [] },
    { word: "deal", alternates: [] },
  ],
  [
    { word: "dip", alternates: [] },
    { word: "deep", alternates: [] },
  ],
  [
    { word: "did", alternates: [] },
    { word: "deed", alternates: [] },
  ],
  [
    { word: "itch", alternates: [] },
    { word: "each", alternates: [] },
  ],
  [
    { word: "it", alternates: [] },
    { word: "eat", alternates: [] },
  ],
  [
    { word: "is", alternates: [] },
    { word: "ease", alternates: [] },
  ],
  [
    { word: "ill", alternates: [] },
    { word: "eel", alternates: [] },
  ],
  [
    { word: "fit", alternates: [] },
    { word: "feet", alternates: ["feat"] },
  ],
  [
    { word: "fill", alternates: ["Phil"] },
    { word: "feel", alternates: [] },
  ],
  [
    { word: "fizz", alternates: [] },
    { word: "fees", alternates: [] },
  ],
  [
    { word: "grin", alternates: [] },
    { word: "green", alternates: [] },
  ],
  [
    { word: "hip", alternates: [] },
    { word: "heap", alternates: [] },
  ],
  [
    { word: "hit", alternates: [] },
    { word: "heat", alternates: [] },
  ],
  [
    { word: "hill", alternates: [] },
    { word: "heel", alternates: ["heal"] },
  ],
  [
    { word: "his", alternates: [] },
    { word: "he's", alternates: [] },
  ],
  [
    { word: "gyp", alternates: [] },
    { word: "Jeep", alternates: [] },
  ],
  [
    { word: "kip", alternates: [] },
    { word: "keep", alternates: [] },
  ],
  [
    { word: "kid", alternates: [] },
    { word: "keyed", alternates: [] },
  ],
  [
    { word: "lick", alternates: [] },
    { word: "leak", alternates: ["leek"] },
  ],
  [
    { word: "lip", alternates: [] },
    { word: "leap", alternates: [] },
  ],
  [
    { word: "live", alternates: [] },
    { word: "leave", alternates: [] },
  ],
  [
    { word: "Liz", alternates: [] },
    { word: "Lee's", alternates: [] },
  ],
  [
    { word: "mill", alternates: ["mil"] },
    { word: "meal", alternates: [] },
  ],
  [
    { word: "min", alternates: [] },
    { word: "mean", alternates: [] },
  ],
  [
    { word: "mitt", alternates: [] },
    { word: "meet", alternates: ["meat"] },
  ],
  [
    { word: "pitch", alternates: [] },
    { word: "peach", alternates: [] },
  ],
  [
    { word: "pick", alternates: ["pic"] },
    { word: "peek", alternates: ["peak", "pique"] },
  ],
  [
    { word: "pill", alternates: [] },
    { word: "peel", alternates: [] },
  ],
  [
    { word: "pit", alternates: [] },
    { word: "Pete", alternates: ["peat"] },
  ],
  [
    { word: "piss", alternates: [] },
    { word: "piece", alternates: ["peace"] },
  ],
  [
    { word: "rich", alternates: [] },
    { word: "reach", alternates: [] },
  ],
  [
    { word: "rid", alternates: [] },
    { word: "read", alternates: ["reed"] },
  ],
  [
    { word: "riff", alternates: [] },
    { word: "reef", alternates: [] },
  ],
  [
    { word: "sill", alternates: [] },
    { word: "seal", alternates: [] },
  ],
  [
    { word: "sit", alternates: [] },
    { word: "seat", alternates: [] },
  ],
  [
    { word: "sick", alternates: [] },
    { word: "seek", alternates: [] },
  ],
  [
    { word: "sin", alternates: [] },
    { word: "seen", alternates: ["scene"] },
  ],
  [
    { word: "sim", alternates: [] },
    { word: "seem", alternates: ["seam"] },
  ],
  [
    { word: "shit", alternates: [] },
    { word: "sheet", alternates: [] },
  ],
  [
    { word: "shin", alternates: [] },
    { word: "sheen", alternates: [] },
  ],
  [
    { word: "ship", alternates: [] },
    { word: "sheep", alternates: [] },
  ],
  [
    { word: "slip", alternates: [] },
    { word: "sleep", alternates: [] },
  ],
  [
    { word: "still", alternates: [] },
    { word: "steal", alternates: ["steel"] },
  ],
  [
    { word: "Tim", alternates: [] },
    { word: "team", alternates: [] },
  ],
  [
    { word: "tin", alternates: [] },
    { word: "teen", alternates: [] },
  ],
  [
    { word: "win", alternates: [] },
    { word: "wean", alternates: [] },
  ],
  [
    { word: "wick", alternates: [] },
    { word: "week", alternates: ["weak"] },
  ],
  [
    { word: "whip", alternates: [] },
    { word: "weep", alternates: [] },
  ],
  [
    { word: "wit", alternates: [] },
    { word: "wheat", alternates: [] },
  ],
  [
    { word: "will", alternates: [] },
    { word: "wheel", alternates: [] },
  ],
  [
    { word: "wiz", alternates: [] },
    { word: "wheeze", alternates: [] },
  ],
];

// Minimal pairs data for TRAP vs DRESS vowels (alphabetical by TRAP word)
const trapDressMinimalPairs = [
  [
    { word: "ad", alternates: ["add"] },
    { word: "ed", alternates: ["Ed"] },
  ],
  [
    { word: "Al", alternates: [] },
    { word: "L", alternates: ["Elle"] },
  ],
  [
    { word: "ass", alternates: [] },
    { word: "S", alternates: [] },
  ],
  [
    { word: "bad", alternates: [] },
    { word: "bed", alternates: [] },
  ],
  [
    { word: "bag", alternates: [] },
    { word: "beg", alternates: [] },
  ],
  [
    { word: "bat", alternates: [] },
    { word: "bet", alternates: [] },
  ],
  [
    { word: "dad", alternates: ["Dad"] },
    { word: "dead", alternates: [] },
  ],
  [
    { word: "dab", alternates: [] },
    { word: "Deb", alternates: [] },
  ],
  [
    { word: "fad", alternates: [] },
    { word: "fed", alternates: [] },
  ],
  [
    { word: "had", alternates: [] },
    { word: "head", alternates: [] },
  ],
  [
    { word: "knack", alternates: [] },
    { word: "neck", alternates: [] },
  ],
  [
    { word: "lad", alternates: [] },
    { word: "led", alternates: ["lead"] },
  ],
  [
    { word: "laughed", alternates: [] },
    { word: "left", alternates: [] },
  ],
  [
    { word: "mad", alternates: [] },
    { word: "med", alternates: [] },
  ],
  [
    { word: "mag", alternates: [] },
    { word: "Meg", alternates: [] },
  ],
  [
    { word: "mat", alternates: ["Matt"] },
    { word: "met", alternates: [] },
  ],
  [
    { word: "pack", alternates: [] },
    { word: "peck", alternates: ["pec"] },
  ],
  [
    { word: "rack", alternates: [] },
    { word: "wreck", alternates: [] },
  ],
  [
    { word: "rad", alternates: [] },
    { word: "red", alternates: ["read"] },
  ],
  [
    { word: "rag", alternates: [] },
    { word: "reg", alternates: [] },
  ],
  [
    { word: "sad", alternates: [] },
    { word: "said", alternates: [] },
  ],
  [
    { word: "Sal", alternates: [] },
    { word: "sell", alternates: [] },
  ],
  [
    { word: "sat", alternates: [] },
    { word: "set", alternates: [] },
  ],
  [
    { word: "shall", alternates: [] },
    { word: "shell", alternates: [] },
  ],
  [
    { word: "tack", alternates: [] },
    { word: "tech", alternates: [] },
  ],
  [
    { word: "tad", alternates: [] },
    { word: "Ted", alternates: [] },
  ],
];

// Minimal pairs data for BAN vs DRESS vowels (alphabetical by BAN word)
const banDressMinimalPairs = [
  [
    { word: "can", alternates: [] },
    { word: "Ken", alternates: [] },
  ],
  [
    { word: "Dan", alternates: [] },
    { word: "den", alternates: [] },
  ],
  [
    { word: "Jan", alternates: [] },
    { word: "Jen", alternates: ["gen"] },
  ],
  [
    { word: "land", alternates: [] },
    { word: "lend", alternates: [] },
  ],
  [
    { word: "pan", alternates: [] },
    { word: "pen", alternates: [] },
  ],
  [
    { word: "rant", alternates: [] },
    { word: "rent", alternates: [] },
  ],
  [
    { word: "sand", alternates: [] },
    { word: "send", alternates: [] },
  ],
  [
    { word: "tan", alternates: [] },
    { word: "ten", alternates: [] },
  ],
  [
    { word: "than", alternates: [] },
    { word: "then", alternates: [] },
  ],
  [
    { word: "van", alternates: [] },
    { word: "Venn", alternates: [] },
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
  [QUIZ_TYPE_IDS.KIT_FLEECE]: {
    id: QUIZ_TYPE_IDS.KIT_FLEECE,
    name: "KIT vs FLEECE",
    title: "KIT vs FLEECE Minimal Pairs Quiz",
    description: "sick vs seek",
    pairs: processMinimalPairsData(kitFleeceMinimalPairs),
    vowel1Name: "KIT",
    vowel2Name: "FLEECE",
    vowel1Symbol: "[ɪ]",
    vowel2Symbol: "[i]",
  },
  [QUIZ_TYPE_IDS.TRAP_DRESS]: {
    id: QUIZ_TYPE_IDS.TRAP_DRESS,
    name: "TRAP vs DRESS",
    title: "TRAP vs DRESS Minimal Pairs Quiz",
    description: "bad vs bed",
    pairs: processMinimalPairsData(trapDressMinimalPairs),
    vowel1Name: "TRAP",
    vowel2Name: "DRESS",
    vowel1Symbol: "[æ]",
    vowel2Symbol: "[ɛ]",
  },
  [QUIZ_TYPE_IDS.BAN_DRESS]: {
    id: QUIZ_TYPE_IDS.BAN_DRESS,
    name: "BAN vs DRESS",
    title: "BAN vs DRESS Minimal Pairs Quiz",
    description: "tan vs ten",
    pairs: processMinimalPairsData(banDressMinimalPairs),
    vowel1Name: "BAN",
    vowel2Name: "DRESS",
    vowel1Symbol: "[eə̯]",
    vowel2Symbol: "[ɛ]",
  },
  [QUIZ_TYPE_IDS.FOOT_GOOSE]: {
    id: QUIZ_TYPE_IDS.FOOT_GOOSE,
    name: "FOOT vs GOOSE",
    title: "FOOT vs GOOSE Minimal Pairs Quiz",
    description: "look vs Luke",
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
    description: "luck vs lock",
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

  // Load previous quiz results from localStorage
  const [previousResults, setPreviousResults] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem("quizResults");
    if (stored) {
      try {
        setPreviousResults(JSON.parse(stored));
      } catch (error) {
        console.error("Error loading quiz results:", error);
      }
    }
  }, []);

  // Save quiz result to localStorage
  const saveQuizResult = (quizTypeId, score, totalQuestions) => {
    const percentage = Math.round((score / totalQuestions) * 100);
    const newResults = {
      ...previousResults,
      [quizTypeId]: {
        score,
        totalQuestions,
        percentage,
        timestamp: Date.now(),
      },
    };
    setPreviousResults(newResults);
    localStorage.setItem("quizResults", JSON.stringify(newResults));
  };

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
  const [currentStep, setCurrentStep] = useState("quizType"); // "quizType", "settings", "quiz"
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const audioRef = useRef(null);

  // Save result when quiz is completed
  useEffect(() => {
    if (showResults && selectedQuizType && shuffledQuestions.length > 0) {
      saveQuizResult(selectedQuizType, score, shuffledQuestions.length);
    }
  }, [showResults, selectedQuizType, score, shuffledQuestions.length]);

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
      quizSettings.autoPlayAudio && // Only autoplay if setting is enabled
      currentQuestion // Only autoplay if we have a current question
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
    setCurrentStep("quiz");
  };

  // Handle quiz type selection
  const handleQuizTypeSelect = (quizTypeId) => {
    setSelectedQuizType(quizTypeId);
    setCurrentStep("settings");
  };

  // Handle begin quiz (for backward compatibility)
  const handleBeginQuiz = () => {
    setHasUserInteracted(true);
  };

  const playAudio = (source) => {
    // Safety check - don't play audio if no current question
    if (!currentQuestion) {
      console.warn("Cannot play audio: no current question");
      return;
    }

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
      colorClass = "text-blue-500";
    } else if (percentage >= 60) {
      performanceLevel = "Fair";
      message = "Fair performance. More practice will help you improve.";
      colorClass = "text-yellow-500";
    } else {
      performanceLevel = "Needs Practice";
      message = "This distinction needs more practice. Don't give up!";
      colorClass = "text-red-600 dark:text-red-400";
    }

    return (
      <div className="h-[calc(100vh-var(--navbar-height))] sm:h-screen bg-background flex items-center justify-center p-2 sm:p-4 overflow-hidden">
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

  // Don't render until questions are shuffled (only for quiz step)
  if (
    currentStep === "quiz" &&
    hasUserInteracted &&
    shuffledQuestions.length === 0
  ) {
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
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg text-center">
                {currentQuizData
                  ? `${currentQuizData.name} Settings`
                  : "Quiz Settings"}
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

              {/* Start Quiz Button */}
              <Button
                onClick={() => {
                  // Force regenerate questions by temporarily clearing and resetting selectedQuizType
                  const currentQuizType = selectedQuizType;
                  setSelectedQuizType(null);
                  setTimeout(() => {
                    setSelectedQuizType(currentQuizType);
                  }, 0);
                  handleSettingsComplete();
                  setHasUserInteracted(true);
                }}
                className="w-full cursor-pointer"
                size="lg"
              >
                Start Quiz
              </Button>

              {/* Back to Quiz Types Button */}
              <Button
                onClick={() => setCurrentStep("quizType")}
                variant="ghost"
                className="w-full cursor-pointer text-sm"
              >
                ← Back to Quiz Types
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quiz Type Selection Step */}
      {currentStep === "quizType" && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 p-4 overflow-hidden">
          <Card className="w-full max-w-md max-h-[80vh] flex flex-col">
            <CardHeader className="pb-1 flex-shrink-0">
              <CardTitle className="text-center text-base">
                Choose Quiz Type
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto px-3">
              <div className="grid grid-cols-2 gap-2">
                {/* Column 1: FLEECE, DRESS, DRESS */}
                <div className="space-y-2">
                  {Object.values(QUIZ_DATA)
                    .filter(
                      (quizData) =>
                        quizData.id === QUIZ_TYPE_IDS.KIT_FLEECE ||
                        quizData.id === QUIZ_TYPE_IDS.TRAP_DRESS ||
                        quizData.id === QUIZ_TYPE_IDS.BAN_DRESS
                    )
                    .map((quizData) => {
                      const previousResult = previousResults[quizData.id];
                      return (
                        <div
                          key={quizData.id}
                          onClick={() => handleQuizTypeSelect(quizData.id)}
                          className={`relative w-full cursor-pointer rounded-lg p-3 hover:bg-accent hover:text-accent-foreground transition-colors ${
                            previousResult
                              ? `border-2 ${
                                  previousResult.percentage === 100
                                    ? "border-green-500"
                                    : previousResult.percentage >= 80
                                    ? "border-blue-500"
                                    : previousResult.percentage >= 60
                                    ? "border-yellow-500"
                                    : "border-red-500"
                                }`
                              : "border border-border"
                          } bg-card`}
                        >
                          <div className="relative z-10 flex flex-col items-center justify-center text-center">
                            <div className="font-semibold text-xs">
                              {quizData.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {quizData.description}
                            </div>
                            <div
                              className={`text-xs font-bold mt-1 ${
                                previousResult
                                  ? previousResult.percentage === 100
                                    ? "text-green-500"
                                    : previousResult.percentage >= 80
                                    ? "text-blue-500"
                                    : previousResult.percentage >= 60
                                    ? "text-yellow-500"
                                    : "text-red-500"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {previousResult
                                ? `${previousResult.percentage}%`
                                : "No Result Yet"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Column 2: FOOT, STRUT */}
                <div className="space-y-2">
                  {Object.values(QUIZ_DATA)
                    .filter(
                      (quizData) =>
                        quizData.id === QUIZ_TYPE_IDS.FOOT_GOOSE ||
                        quizData.id === QUIZ_TYPE_IDS.STRUT_LOT
                    )
                    .map((quizData) => {
                      const previousResult = previousResults[quizData.id];
                      return (
                        <div
                          key={quizData.id}
                          onClick={() => handleQuizTypeSelect(quizData.id)}
                          className={`relative w-full cursor-pointer rounded-lg p-3 hover:bg-accent hover:text-accent-foreground transition-colors ${
                            previousResult
                              ? `border-2 ${
                                  previousResult.percentage === 100
                                    ? "border-green-500"
                                    : previousResult.percentage >= 80
                                    ? "border-blue-500"
                                    : previousResult.percentage >= 60
                                    ? "border-yellow-500"
                                    : "border-red-500"
                                }`
                              : "border border-border"
                          } bg-card`}
                        >
                          <div className="relative z-10 flex flex-col items-center justify-center text-center">
                            <div className="font-semibold text-xs">
                              {quizData.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {quizData.description}
                            </div>
                            <div
                              className={`text-xs font-bold mt-1 ${
                                previousResult
                                  ? previousResult.percentage === 100
                                    ? "text-green-500"
                                    : previousResult.percentage >= 80
                                    ? "text-blue-500"
                                    : previousResult.percentage >= 60
                                    ? "text-yellow-500"
                                    : "text-red-500"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {previousResult
                                ? `${previousResult.percentage}%`
                                : "No Result Yet"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </CardContent>
            {Object.keys(previousResults).length > 0 && (
              <div className="p-3 pt-0 flex-shrink-0 space-y-2">
                <p className="text-xs text-muted-foreground text-center">
                  Note: Shows last result for each quiz type
                </p>
                <div className="flex justify-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-muted-foreground">100%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-muted-foreground">80%+</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-muted-foreground">60%+</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-muted-foreground">&lt;60%</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={() => setShowClearConfirm(true)}
                    variant="outline"
                    className="w-50 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                    size="sm"
                  >
                    Clear All Results
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Clear Results Confirmation Dialog */}
      {showClearConfirm && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-center text-base">
                Clear All Results?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                This will delete your quiz results and cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowClearConfirm(false)}
                  variant="outline"
                  className="flex-1 cursor-pointer"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setPreviousResults({});
                    localStorage.removeItem("quizResults");
                    setShowClearConfirm(false);
                  }}
                  variant="destructive"
                  className="flex-1 cursor-pointer"
                  size="sm"
                >
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quiz Interface */}
      {currentStep === "quiz" && hasUserInteracted && currentQuizData && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              Quiz: {currentQuizData.name}
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
                      className={`w-full h-12 text-lg relative cursor-pointer ${
                        selectedAnswer === option && isCorrect
                          ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                          : ""
                      }`}
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
