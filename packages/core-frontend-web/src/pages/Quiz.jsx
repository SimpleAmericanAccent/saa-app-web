import React, { useState, useRef, useEffect } from "react";
import { useQuizStatsStore } from "../stores/quizStatsStore";
import {
  fetchQuizSettings,
  saveQuizSettings,
  fetchQuizResults,
} from "../utils/quizApi";
import useAuthStore from "../stores/authStore";
import {
  fetchContrasts,
  fetchPairs,
  saveTrial,
  getAllQuizMetadata,
} from "../utils/quizApi";
import {
  getPerformanceLevel,
  getTextColorClass,
  getBorderColorClass,
  getPerformanceMessage,
  getPerformanceLevelName,
  getGradientNumberLineLegend,
  getGradientColorStyle,
  getGradientBorderStyle,
  getSubduedGradientBorderStyle,
  getSubduedGradientColorStyle,
  getQuizCardTextProps,
} from "../utils/performanceColors";
import { Button } from "core-frontend-web/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "core-frontend-web/src/components/ui/card";
import { Progress } from "core-frontend-web/src/components/ui/progress";
import { Checkbox } from "core-frontend-web/src/components/ui/checkbox";
import {
  Play,
  Volume2,
  Loader2,
  X,
  BarChart3,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Award,
} from "lucide-react";
import { Link } from "react-router-dom";
import ProgressModal from "../components/ProgressModal";

// ScoreBar component for visual progress display
const ScoreBar = ({
  correct,
  total,
  target = 30,
  hasData = true,
  isQuiz = false,
  hideText = false,
}) => {
  const wrong = Math.max(0, total - correct);
  const missing = Math.max(0, target - total);
  const attempted = Math.min(total, target); // cap within target for the bar
  const pct = (n) =>
    `${((100 * Math.max(0, Math.min(n, target))) / target).toFixed(3)}%`;

  const overflow = Math.max(0, total - target);
  const percentageCorrect = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Use subdued colors if less than target trials
  const useSubduedColors = total < target;

  if (!hasData) {
    return (
      <div className="">
        {/* Stacked bar - grayed out */}
        <div
          className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-800"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={target}
          aria-valuenow={0}
          aria-label="No attempts yet"
          title="No attempts yet"
        >
          {/* Full gray bar for no data */}
          <div
            className="absolute left- top-0 h-full bg-neutral-800"
            style={{ width: "100%" }}
          />
        </div>

        {/* Numbers below bar - grayed out */}
        <div className="text-[9px] sm:text-[11px] text-muted-foreground mt-1 text-center">
          <span>⚠️ Not started</span>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Stacked bar */}
      <div
        className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-800"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={Math.min(total, target)}
        aria-label={`Attempts ${Math.min(
          total,
          target
        )} of ${target}. Correct ${correct}, wrong ${wrong}, missing ${missing}.`}
        title={`Correct ${correct} • Wrong ${wrong} • Missing ${missing} • ${total}/${target} attempted`}
      >
        {/* Correct segment */}
        <div
          className="absolute left-0 top-0 h-full"
          style={{
            width: pct(correct),
            backgroundColor: useSubduedColors
              ? getSubduedGradientColorStyle(percentageCorrect).color
              : getGradientColorStyle(percentageCorrect).color,
          }}
        />
        {/* Wrong segment (starts after correct) */}
        <div
          className="absolute top-0 h-full"
          style={{
            left: pct(correct),
            width: pct(wrong),
            backgroundColor: useSubduedColors
              ? "#7f1d1d" // more subdued red-900 for <30 trials
              : "#b91c1c", // less subdued red-700 for >=30 trials
          }}
        />
        {/* Missing segment fills the rest up to target */}
        <div
          className="absolute top-0 h-full bg-neutral-800"
          style={{ left: pct(attempted), width: pct(missing) }}
        />
        {/* Optional overflow tick if attempts > target */}
        {overflow > 0 && (
          <div
            className="absolute -right-0.5 top-1/2 h-3 w-0.5 -translate-y-1/2 rotate-0 bg-neutral-700"
            title={`Over target by ${overflow}`}
          />
        )}
      </div>

      {/* Numbers below bar */}
      {!hideText && (
        <div
          className={`${
            isQuiz ? "text-sm" : "text-[9px] sm:text-[11px]"
          } text-muted-foreground mt-1 text-center`}
        >
          <span>
            {total >= target
              ? isQuiz
                ? "✅ Baseline set! (showing last 30)"
                : "✅ 30 done"
              : `⚠️ ${target - total} left to ${target}`}
          </span>
        </div>
      )}
    </div>
  );
};

// Quiz type IDs for easy reference
export const QUIZ_TYPE_IDS = {
  KIT_FLEECE: "kit_fleece",
  TRAP_DRESS: "trap_dress",
  BAN_DRESS: "ban_dress",
  FOOT_GOOSE: "foot_goose",
  STRUT_LOT: "strut_lot",
  DH_D: "dh_d",
  DARK_L_O: "dark_l_o",
  DARK_L_U: "dark_l_u",
  T_CH: "t_ch",
  S_Z: "s_z",
  M_N: "m_n",
  N_NG: "n_ng",
  M_NG: "m_ng",
  TH_T: "th_t",
  TH_F: "th_f",
  R_NULL: "r_null",
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
    showSoundSymbols: true,
    soundEffects: true,
  });

  // Load previous quiz results from API
  const [previousResults, setPreviousResults] = useState({});

  // Get auth state
  const { isAdmin } = useAuthStore();

  // Save quiz result to API
  const saveQuizResult = async (quizTypeId, score, totalQuestions) => {
    // Note: Quiz results are now automatically saved via trials in the database
    // This function is kept for compatibility but doesn't need to do anything
    // The results are calculated from the trials data
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
  });
  const [nextAudioUrls, setNextAudioUrls] = useState({
    dictionary: null,
  });
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [preloadedAudioCache, setPreloadedAudioCache] = useState(new Map()); // Cache for preloaded audios

  const [hasStartedQuiz, setHasStartedQuiz] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState("category"); // "category", "quizType", "settings", "quiz"
  const [selectedCategory, setSelectedCategory] = useState(null); // "vowels", "consonants"

  const [showProgressModal, setShowProgressModal] = useState(false); // Control progress modal

  const audioRef = useRef(null);

  // Ref to store current question data to prevent race conditions
  const currentQuestionRef = useRef(null);
  // Ref to track the previous question index to detect actual question changes
  const previousQuestionIndexRef = useRef(-1);

  // API state variables
  const [quizDataFromApi, setQuizDataFromApi] = useState({});
  const [isLoadingQuizData, setIsLoadingQuizData] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Add state for endless mode
  const [allAvailableQuestions, setAllAvailableQuestions] = useState([]);
  const [currentQuestionPool, setCurrentQuestionPool] = useState([]);
  const [questionsUsed, setQuestionsUsed] = useState(new Set());
  const [questionsPresented, setQuestionsPresented] = useState(0); // Track actual questions presented
  const [currentSessionTrials, setCurrentSessionTrials] = useState([]); // Track current session trial results

  // View mode for quiz type cards: "first30", "last30", "delta"
  const [quizCardViewMode, setQuizCardViewMode] = useState("last30");

  // Helper functions for quiz card view modes
  const getQuizCardData = (previousResult, viewMode) => {
    if (!previousResult) {
      return {
        percentage: "N/A",
        correct: 0,
        total: 0,
        hasData: false,
        percentageColor: null,
        borderStyle: null,
      };
    }

    switch (viewMode) {
      case "first30":
        const first30Percentage = previousResult.first30Percentage || 0;
        const first30Correct = previousResult.first30CorrectTrials || 0;
        const first30Total = previousResult.first30TotalTrials || 0;
        return {
          percentage: first30Percentage,
          correct: first30Correct,
          total: first30Total,
          hasData: first30Total > 0,
          percentageColor:
            first30Total >= 30
              ? getGradientColorStyle(first30Percentage)
              : getSubduedGradientColorStyle(first30Percentage),
          borderStyle:
            first30Total >= 30
              ? getBorderStyleForQuiz({
                  recentTotalTrials: first30Total,
                  recentCorrectTrials: first30Correct,
                  recentPercentage: first30Percentage,
                })
              : {},
        };

      case "last30":
        const last30Percentage =
          previousResult.recentPercentage || previousResult.percentage || 0;
        const last30Correct =
          previousResult.recentCorrectTrials ||
          previousResult.correctTrials ||
          0;
        const last30Total =
          previousResult.recentTotalTrials || previousResult.totalTrials || 0;
        return {
          percentage: last30Percentage,
          correct: last30Correct,
          total: last30Total,
          hasData: last30Total > 0,
          percentageColor:
            last30Total >= 30
              ? getGradientColorStyle(last30Percentage)
              : getSubduedGradientColorStyle(last30Percentage),
          borderStyle: getBorderStyleForQuiz(previousResult),
        };

      case "delta":
        const first30Pct = previousResult.first30Percentage || 0;
        const first30Cor = previousResult.first30CorrectTrials || 0;
        const first30Tot = previousResult.first30TotalTrials || 0;
        const last30Pct =
          previousResult.recentPercentage || previousResult.percentage || 0;
        const last30Cor =
          previousResult.recentCorrectTrials ||
          previousResult.correctTrials ||
          0;
        const last30Tot =
          previousResult.recentTotalTrials || previousResult.totalTrials || 0;
        const deltaPercentage = last30Pct - first30Pct;

        return {
          first30Percentage: first30Pct,
          last30Percentage: last30Pct,
          deltaPercentage: deltaPercentage,
          correct: last30Cor,
          total: last30Tot,
          hasData: last30Tot > 0,
          percentageColor:
            last30Tot >= 30
              ? getGradientColorStyle(last30Pct)
              : getSubduedGradientColorStyle(last30Pct),
          borderStyle: getBorderStyleForQuiz(previousResult),
          first30Color:
            first30Tot >= 30
              ? getGradientColorStyle(first30Pct)
              : getSubduedGradientColorStyle(first30Pct),
        };

      default:
        return {
          percentage: "N/A",
          correct: 0,
          total: 0,
          hasData: false,
          percentageColor: null,
          borderStyle: {},
        };
    }
  };

  // Utility functions for quiz history
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return "Just now";
  };

  const getPerformanceTrend = (results) => {
    if (!results || Object.keys(results).length === 0) return "neutral";

    // Get the most recent results and calculate trend
    const recentResults = Object.values(results)
      .filter((result) => result.lastAttempt)
      .sort((a, b) => new Date(b.lastAttempt) - new Date(a.lastAttempt))
      .slice(0, 5); // Last 5 attempts

    if (recentResults.length < 2) return "neutral";

    const recentAvg =
      recentResults.reduce((sum, r) => sum + r.percentage, 0) /
      recentResults.length;
    const olderResults = Object.values(results)
      .filter((result) => result.lastAttempt)
      .sort((a, b) => new Date(b.lastAttempt) - new Date(a.lastAttempt))
      .slice(5, 10); // Previous 5 attempts

    if (olderResults.length === 0) return "neutral";

    const olderAvg =
      olderResults.reduce((sum, r) => sum + r.percentage, 0) /
      olderResults.length;

    if (recentAvg > olderAvg + 5) return "improving";
    if (recentAvg < olderAvg - 5) return "declining";
    return "stable";
  };

  // Load quiz data from API on component mount
  useEffect(() => {
    const loadQuizData = async () => {
      setIsLoadingQuizData(true);
      setApiError(null);
      try {
        const data = await fetchContrasts();
        setQuizDataFromApi(data);
      } catch (error) {
        console.error("Failed to load quiz data from API:", error);
        setApiError(error.message);
        setQuizDataFromApi({});
      } finally {
        setIsLoadingQuizData(false);
      }
    };

    loadQuizData();
  }, []);

  // Load quiz settings from API on component mount
  useEffect(() => {
    const loadQuizSettings = async () => {
      try {
        const apiSettings = await fetchQuizSettings();
        // Merge API settings with defaults
        setQuizSettings((prevSettings) => ({
          ...prevSettings,
          ...apiSettings,
        }));
      } catch (error) {
        console.error("Failed to load quiz settings from API:", error);
        // Keep default settings if API fails
      }
    };

    loadQuizSettings();
  }, []);

  // Load quiz results from API on component mount
  useEffect(() => {
    const loadQuizResults = async () => {
      try {
        const results = await fetchQuizResults();
        setPreviousResults(results);
      } catch (error) {
        console.error("Failed to load quiz results from API:", error);
        setPreviousResults({});
      }
    };

    loadQuizResults();
  }, []);

  // Function to refresh quiz results
  const refreshQuizResults = async () => {
    try {
      const results = await fetchQuizResults();
      setPreviousResults(results);
    } catch (error) {
      console.error("Failed to refresh quiz results:", error);
    }
  };

  // Load user profile on component mount
  useEffect(() => {
    useAuthStore.getState().fetchUserProfile();
  }, []);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Save result when quiz is completed
  useEffect(() => {
    if (showResults && selectedQuizType && shuffledQuestions.length > 0) {
      // Refresh quiz results after quiz completion to update stats
      refreshQuizResults();
    }
  }, [showResults, selectedQuizType, score, shuffledQuestions.length]);

  // Get current quiz data - always use API data
  const currentQuizData = selectedQuizType
    ? quizDataFromApi[selectedQuizType]
    : null;

  // Get quiz statistics using centralized store
  const {
    stats: quizStats,
    isLoading: isLoadingStats,
    loadStats,
    refreshStats,
  } = useQuizStatsStore();

  // Load quiz stats and refresh when results change
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Refresh stats when previousResults change
  useEffect(() => {
    if (Object.keys(previousResults).length > 0) {
      refreshStats();
    }
  }, [previousResults, refreshStats]);

  const vowelsAverage = quizStats?.vowels?.average;
  const consonantsAverage = quizStats?.consonants?.average;
  const vowelsCompletion = quizStats?.vowels?.completion;
  const consonantsCompletion = quizStats?.consonants?.completion;

  // Count quizzes with at least 30 trials for each category
  const getQuizzesWithMinTrials = (category) => {
    if (!previousResults || !quizDataFromApi) return { completed: 0, total: 0 };

    const categoryQuizzes = Object.values(quizDataFromApi).filter(
      (quizData) => quizData.category === category
    );

    const quizzesWithMinTrials = categoryQuizzes.filter((quizData) => {
      const result = previousResults[quizData.id];
      return result && (result.recentTotalTrials || result.totalTrials) >= 30;
    });

    return {
      completed: quizzesWithMinTrials.length,
      total: categoryQuizzes.length,
    };
  };

  const vowelsWithMinTrials = getQuizzesWithMinTrials("vowels");
  const consonantsWithMinTrials = getQuizzesWithMinTrials("consonants");

  // Helper function to get appropriate border style based on trial count
  const getBorderStyleForQuiz = (previousResult) => {
    if (!previousResult) return {};

    const totalTrials =
      previousResult.recentTotalTrials || previousResult.totalTrials || 0;
    const percentage =
      previousResult.recentPercentage || previousResult.percentage;

    if (totalTrials >= 30) {
      return getGradientBorderStyle(percentage);
    } else {
      return getSubduedGradientBorderStyle(percentage);
    }
  };

  // Initialize shuffled questions when quiz type is selected
  useEffect(() => {
    const initializeQuiz = async () => {
      if (selectedQuizType && currentQuizData) {
        try {
          // Always fetch pairs from API
          const pairsFromApi = await fetchPairs(selectedQuizType);

          // Always use endless mode behavior - store all questions and create initial pool
          setAllAvailableQuestions(pairsFromApi);
          const initialPool = shuffleArray(pairsFromApi);
          setCurrentQuestionPool(initialPool);
          setQuestionsUsed(new Set());
          setQuestionsPresented(0); // Reset counter for new quiz

          // Start with first few questions
          const initialQuestions = initialPool.slice(0, 10);
          setShuffledQuestions(initialQuestions);

          // Preload audio for the second question if available
          if (initialQuestions.length > 1) {
            const secondQuestion = initialQuestions[1];
            preloadNextAudio(secondQuestion.word);
          }
        } catch (error) {
          console.error("Failed to fetch pairs from API:", error);
          setShuffledQuestions([]);
        }
      }
    };

    initializeQuiz();
  }, [selectedQuizType, currentQuizData]);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const progress =
    ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;

  // Set presentedAt timestamp when question is shown
  useEffect(() => {
    if (currentQuestion) {
      // Add presentedAt timestamp if it doesn't exist (but don't update the array)
      if (!currentQuestion.presentedAt) {
        currentQuestionRef.current = {
          ...currentQuestion,
          presentedAt: new Date(), // Store as Date object
        };
      } else {
        // Store in ref to prevent race conditions (without updating timestamp)
        currentQuestionRef.current = currentQuestion;
      }
    }
  }, [currentQuestionIndex, currentQuestion]);

  // Load audio for current question
  useEffect(() => {
    if (currentQuestion) {
      let isCancelled = false;

      const loadAudio = async () => {
        setIsLoading(true);
        try {
          const audioSources = await getAudioForWord(currentQuestion.word);
          // Only update if this effect hasn't been cancelled (question hasn't changed)
          if (!isCancelled) {
            setAudioUrls(audioSources);
          }
        } catch (error) {
          console.error("Error fetching audio:", error);
          if (!isCancelled) {
            setAudioUrls({ dictionary: null });
          }
        } finally {
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
      };

      loadAudio();

      // Cleanup function to cancel the audio loading if the question changes
      return () => {
        isCancelled = true;
      };
    }
  }, [currentQuestion]);

  // Function to play a simple tone
  const playTone = (frequency, duration, type = "sine", volume = 0.3) => {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;

      // Fade in and out for smooth sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        volume,
        audioContext.currentTime + 0.01
      );
      gainNode.gain.linearRampToValueAtTime(
        0,
        audioContext.currentTime + duration
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.log("Sound effect not supported:", error);
    }
  };

  // Function to play correct answer sound
  const playCorrectSound = () => {
    playTone(800, 0.2, "sine", 0.04); // Higher pitch, short duration, normal volume
  };

  // Function to play incorrect answer sound
  const playIncorrectSound = () => {
    playTone(600, 0.25, "sine", 0.04); // Lower pitch, longer duration, gentler volume
  };

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
        // Look for US audio specifically - check for various US audio patterns
        const usPhonetic = data[0].phonetics.find(
          (p) =>
            p.audio &&
            (p.audio.includes("-us.") ||
              p.audio.includes("-us-") ||
              p.audio.includes("/us/"))
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

  // Helper function to get the appropriate audio URL for a word from a question
  const getAudioUrlFromQuestion = (word, question) => {
    if (!question) return null;

    // Determine which audio URL to use based on which word is being presented
    if (word === question.wordA && question.audioAUrl) {
      return question.audioAUrl;
    } else if (word === question.wordB && question.audioBUrl) {
      return question.audioBUrl;
    }

    return null;
  };

  // Function to get all audio sources for a word
  const getAudioForWord = async (word) => {
    const audioSources = {};

    // Check cache first
    if (preloadedAudioCache.has(word)) {
      const cachedAudio = preloadedAudioCache.get(word);
      audioSources.dictionary = cachedAudio;
      return audioSources;
    }

    // First, check if we have a database audio URL for this word
    const databaseAudioUrl = getAudioUrlFromQuestion(word, currentQuestion);

    // If we have a valid database audio URL, use it
    if (databaseAudioUrl && databaseAudioUrl.trim() !== "") {
      // Cache the database audio for future use
      setPreloadedAudioCache((prev) =>
        new Map(prev).set(word, databaseAudioUrl)
      );
      audioSources.dictionary = databaseAudioUrl;
      return audioSources;
    }

    // Fallback to dictionary API if no database URL exists or is empty
    const dictionaryAudio = await getDictionaryAudio(word);
    if (dictionaryAudio) {
      // Cache the audio for future use
      setPreloadedAudioCache((prev) =>
        new Map(prev).set(word, dictionaryAudio)
      );
      audioSources.dictionary = dictionaryAudio;
    }

    return audioSources;
  };

  // Function to preload audio for the next question
  const preloadNextAudio = async (word) => {
    if (!word) return;

    // Check if already cached
    if (preloadedAudioCache.has(word)) {
      const cachedAudio = preloadedAudioCache.get(word);
      setNextAudioUrls({ dictionary: cachedAudio });
      return;
    }

    try {
      // Find the next question to get its database audio URLs
      const nextQuestionIndex = currentQuestionIndex + 1;
      const nextQuestion = shuffledQuestions[nextQuestionIndex];

      // Check for database audio URL first
      const databaseAudioUrl = getAudioUrlFromQuestion(word, nextQuestion);

      // If we have a valid database audio URL, use it
      if (databaseAudioUrl && databaseAudioUrl.trim() !== "") {
        // Cache the database audio for future use
        setPreloadedAudioCache((prev) =>
          new Map(prev).set(word, databaseAudioUrl)
        );
        setNextAudioUrls({ dictionary: databaseAudioUrl });
        return;
      }

      // Fallback to dictionary API if no database URL exists or is empty
      const dictionaryAudio = await getDictionaryAudio(word);
      if (dictionaryAudio) {
        // Cache the audio
        setPreloadedAudioCache((prev) =>
          new Map(prev).set(word, dictionaryAudio)
        );
        setNextAudioUrls({ dictionary: dictionaryAudio });
      }
    } catch (error) {
      console.log("Failed to preload audio for:", word, error);
    }
  };

  // Auto-play audio when URLs are loaded
  useEffect(() => {
    if (
      audioUrls.dictionary &&
      !playingSource &&
      !isLoading &&
      !hasAutoPlayed &&
      hasStartedQuiz && // Only autoplay after quiz has started
      quizSettings.autoPlayAudio && // Only autoplay if setting is enabled
      currentQuestion && // Only autoplay if we have a current question
      audioRef.current // Only autoplay if audio element is available
    ) {
      // Use a small delay to ensure the audio element is ready
      const timeoutId = setTimeout(() => {
        setHasAutoPlayed(true);
        playAudio("dictionary", true); // Pass isAutoPlay = true
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [
    audioUrls.dictionary,
    playingSource,
    isLoading,
    hasAutoPlayed,
    hasStartedQuiz,
    quizSettings.autoPlayAudio,
    currentQuestion,
  ]);

  // Handle settings changes
  const handleSettingsChange = async (setting, value) => {
    const newSettings = {
      ...quizSettings,
      [setting]: value,
    };

    setQuizSettings(newSettings);

    // Save to API
    try {
      await saveQuizSettings(newSettings);
    } catch (error) {
      console.error("Failed to save quiz settings:", error);
    }
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
    setHasStartedQuiz(true);
  };

  const playAudio = (source, isAutoPlay = false) => {
    // Safety check - don't play audio if no current question
    if (!currentQuestion) {
      console.warn("Cannot play audio: no current question");
      return;
    }

    // Mark that quiz has started (but not for auto-play)
    if (!isAutoPlay) {
      setHasStartedQuiz(true);
    }

    // Stop any currently playing audio first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Use audio element for dictionary audio
    const url = audioUrls[source];

    if (audioRef.current && url) {
      audioRef.current.src = url;
      audioRef.current
        .play()
        .then(() => {
          // Audio started successfully
        })
        .catch((error) => {
          // Only log errors that aren't aborted requests (which are normal)
          if (
            error.name !== "AbortError" &&
            !error.message.includes("aborted")
          ) {
            console.error("Error playing audio:", error);
          }
          setPlayingSource(null);
        });
      setPlayingSource(source);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (isAnswered) return; // Don't respond to keys when answered

      switch (event.key) {
        case "1":
          if (audioUrls.dictionary && !playingSource && !isLoading) {
            playAudio("dictionary", false); // User-initiated play
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

  const handleAnswerSelect = async (answer) => {
    if (isAnswered) return;

    // Mark that quiz has started
    setHasStartedQuiz(true);

    // Capture response time immediately when user answers
    const respondedAt = new Date();

    setSelectedAnswer(answer);
    setIsAnswered(true);
    setQuestionsAnswered(questionsAnswered + 1);

    // Increment questions presented counter
    setQuestionsPresented(questionsPresented + 1);

    // Check if answer matches the word or any of its alternates
    const isCorrect =
      answer === currentQuestion.word ||
      currentQuestion.alternates.includes(answer);

    if (isCorrect) {
      setScore(score + 1);
      if (quizSettings.soundEffects) {
        playCorrectSound();
      }
    } else {
      if (quizSettings.soundEffects) {
        playIncorrectSound();
      }
    }

    // Track trial result in current session
    setCurrentSessionTrials((prev) => [
      ...prev,
      { isCorrect, timestamp: new Date() },
    ]);

    // Always save trial to database
    try {
      // Check if user is logged in (for UI feedback)
      const user = useAuthStore.getState().user;
      if (!user?.id) {
        console.error("Cannot save trial: user not logged in");
        // You could show a toast/alert here to inform the user
        return;
      }

      // Use ref data to prevent race conditions
      const questionData = currentQuestionRef.current;
      if (!questionData) {
        console.error("No question data available for trial saving");
        return;
      }

      // Calculate latency with safety checks
      const latencyMs = questionData.presentedAt
        ? Math.max(
            0,
            respondedAt.getTime() - questionData.presentedAt.getTime()
          )
        : 0;

      // Cap latency at 5 minutes (300,000 ms) to prevent unreasonable values
      const cappedLatencyMs = Math.min(latencyMs, 300000);

      const trialData = {
        trialId: crypto.randomUUID(), // Generate client-side UUID for idempotency
        // userId is now provided by server middleware - don't send it
        pairId: questionData.pairId, // From API data
        presentedSide: questionData.presentedSide, // "A" or "B"
        choiceSide: answer === questionData.wordA ? "A" : "B", // Which word they chose
        isCorrect: isCorrect,
        presentedAt: questionData.presentedAt, // When question was shown (from questionData)
        respondedAt: respondedAt, // When they answered (captured in this function)
        latencyMs: cappedLatencyMs, // Response time in ms (capped at 5 minutes)
      };

      // Debug: Log the trial data being sent
      console.log("Sending trial data:", trialData);
      console.log("Question data:", questionData);
      console.log("Latency calculation:", {
        presentedAt: questionData.presentedAt,
        respondedAt: respondedAt,
        rawLatency: latencyMs,
        cappedLatency: cappedLatencyMs,
      });

      await saveTrial(trialData);

      // Refresh stats after saving trial
      refreshStats();
    } catch (error) {
      console.error("Failed to save trial to database:", error);
      // Continue with quiz even if saving fails
    }

    // Auto-advance after a short delay for better flow
    setTimeout(() => {
      // Always continue to next question (endless mode behavior)
      handleNext();
    }, 1000); // 1 second delay
  };

  const handleNext = () => {
    // Always use endless mode logic
    const nextQuestionIndex = currentQuestionIndex + 1;

    // If we're running out of questions in the current pool, add more
    if (nextQuestionIndex >= shuffledQuestions.length - 2) {
      addMoreQuestionsToPool();
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlayingSource(null);

    // Update the previous question index ref
    previousQuestionIndexRef.current = currentQuestionIndex;

    // Load audio for the next question
    const nextQuestion = shuffledQuestions[nextQuestionIndex];
    if (nextAudioUrls.dictionary) {
      // Use preloaded audio
      setAudioUrls(nextAudioUrls);
      setNextAudioUrls({ dictionary: null });
    } else {
      // Load audio normally (non-blocking)
      setAudioUrls({ dictionary: null });
      getAudioForWord(nextQuestion.word).then((audioSources) => {
        if (audioSources.dictionary) {
          setAudioUrls({ dictionary: audioSources.dictionary });
        }
      });
    }

    setCurrentQuestionIndex(nextQuestionIndex);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setHasAutoPlayed(false); // Reset auto-play flag for next question

    // Start preloading the next question's audio immediately
    const nextNextQuestionIndex = nextQuestionIndex + 1;
    if (nextNextQuestionIndex < shuffledQuestions.length) {
      const nextNextQuestion = shuffledQuestions[nextNextQuestionIndex];
      preloadNextAudio(nextNextQuestion.word);
    }
  };

  // Function to add more questions to the pool for endless mode
  const addMoreQuestionsToPool = () => {
    if (allAvailableQuestions.length === 0) return;

    // Get questions that haven't been used recently
    const unusedQuestions = allAvailableQuestions.filter(
      (q) => !questionsUsed.has(q.pairId)
    );

    // If we've used all questions, reset the used set and start over
    if (unusedQuestions.length === 0) {
      setQuestionsUsed(new Set());
      const newPool = shuffleArray(allAvailableQuestions);
      setCurrentQuestionPool(newPool);

      // Add 10 more questions to the shuffled questions
      const currentQuestions = [...shuffledQuestions];
      const additionalQuestions = newPool.slice(0, 10);
      setShuffledQuestions([...currentQuestions, ...additionalQuestions]);
    } else {
      // Add unused questions to the pool
      const newQuestions = shuffleArray(unusedQuestions).slice(0, 10);
      const currentQuestions = [...shuffledQuestions];
      setShuffledQuestions([...currentQuestions, ...newQuestions]);

      // Mark these questions as used
      const newUsedSet = new Set(questionsUsed);
      newQuestions.forEach((q) => newUsedSet.add(q.pairId));
      setQuestionsUsed(newUsedSet);
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
    setHasStartedQuiz(false);
    setCurrentStep("settings");
    setShuffledQuestions([]);
    currentQuestionRef.current = null; // Clear ref to prevent stale data

    // Reset endless mode state
    setAllAvailableQuestions([]);
    setCurrentQuestionPool([]);
    setQuestionsUsed(new Set());
    setQuestionsPresented(0);
    setCurrentSessionTrials([]);
  };

  if (showResults) {
    // Use questionsAnswered for percentage calculation to not penalize skipped questions
    const totalQuestions = questionsAnswered;
    const percentage = Math.round((score / totalQuestions) * 100);

    // Determine performance level and message using centralized functions
    const performanceLevel = getPerformanceLevelName(percentage);
    const message = getPerformanceMessage(percentage);
    const colorClass = getTextColorClass(percentage);

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
                        style={getGradientColorStyle(percentage)}
                        className="transition-all duration-1000"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div
                          className="text-base font-bold"
                          style={getGradientColorStyle(percentage)}
                        >
                          {percentage}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {score}/{totalQuestions}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sound Distinction Info */}
              {currentQuizData && (
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="font-semibold mb-1 text-xs">
                      Distinction Practiced
                    </h3>
                    <div className="flex justify-center items-center gap-1 text-xs">
                      <div className="text-center">
                        <div className="font-mono text-xs">
                          {currentQuizData.sound1Symbol}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {currentQuizData.sound1Name}
                        </div>
                      </div>
                      <div className="text-muted-foreground text-xs">vs</div>
                      <div className="text-center">
                        <div className="font-mono text-xs">
                          {currentQuizData.sound2Symbol}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {currentQuizData.sound2Name}
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
                    setHasStartedQuiz(false);
                    setCurrentStep("quizType");
                    setShuffledQuestions([]);

                    // Reset endless mode state
                    setAllAvailableQuestions([]);
                    setCurrentQuestionPool([]);
                    setQuestionsUsed(new Set());
                    setQuestionsPresented(0);
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
    hasStartedQuiz &&
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
              {/* Quiz Mode Info */}
              <div className="space-y-2 text-center">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Complete 30 trials to establish your baseline</li>
                    <li>• Continue practicing to improve</li>
                    <li>• Stats show most recent 30 trials</li>
                  </ul>
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

              {/* Show Sound Symbols */}
              {/* <div className="space-y-2">
                <label className="text-sm font-medium">Display Options</label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showSoundSymbols"
                    checked={quizSettings.showSoundSymbols}
                    onCheckedChange={(checked) =>
                      handleSettingsChange("showSoundSymbols", checked)
                    }
                  />
                  <label
                    htmlFor="showSoundSymbols"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Show sound symbols (IPA)
                  </label>
                </div>
              </div> */}

              {/* Sound Effects */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sound Effects</label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="soundEffects"
                    checked={quizSettings.soundEffects}
                    onCheckedChange={(checked) =>
                      handleSettingsChange("soundEffects", checked)
                    }
                  />
                  <label
                    htmlFor="soundEffects"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Play sound effects for correct/incorrect answers
                  </label>
                </div>
              </div>

              {/* Start Quiz Button */}
              <Button
                onClick={() => {
                  handleSettingsComplete();
                  setHasStartedQuiz(true);
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

      {/* Category Selection Step */}
      {currentStep === "category" && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 p-4 overflow-hidden">
          <Card className="w-full max-w-md max-h-[80vh] flex flex-col gap-3 pb-3">
            <CardHeader className="pb-1 flex-shrink-0">
              <CardTitle className="text-center text-xl">
                Choose Category
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto px-3">
              <div className="grid grid-cols-2 gap-4">
                {/* Vowels Category */}
                <div
                  onClick={() => {
                    setSelectedCategory("vowels");
                    setCurrentStep("quizType");
                  }}
                  className={`relative w-full cursor-pointer rounded-lg p-6 hover:bg-accent hover:text-accent-foreground transition-colors border-2 bg-card ${
                    vowelsAverage ? "" : "border-gray"
                  }`}
                  style={
                    vowelsAverage ? getGradientBorderStyle(vowelsAverage) : {}
                  }
                >
                  <div className="relative z-10 flex flex-col items-center justify-center text-center">
                    <div className="font-semibold text-lg mb-2">Vowels</div>

                    <div className="flex flex-col gap-1">
                      {isLoadingStats ? (
                        <div className="text-[10px] sm:text-xs text-muted-foreground">
                          Loading...
                        </div>
                      ) : (
                        <>
                          <div className="text-[10px] sm:text-xs text-muted-foreground">
                            {vowelsWithMinTrials.completed}/
                            {vowelsWithMinTrials.total} quizzes
                          </div>
                          {vowelsAverage && (
                            <div
                              className="text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1"
                              style={getGradientColorStyle(vowelsAverage)}
                            >
                              <span>{vowelsAverage}%</span>
                              {quizStats?.vowels?.totalTrials > 0 && (
                                <span className="text-muted-foreground font-normal">
                                  ({quizStats.vowels.correctTrials}/
                                  {quizStats.vowels.totalTrials})
                                </span>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Consonants Category */}
                <div
                  onClick={() => {
                    setSelectedCategory("consonants");
                    setCurrentStep("quizType");
                  }}
                  className={`relative w-full cursor-pointer rounded-lg p-6 hover:bg-accent hover:text-accent-foreground transition-colors border-2 bg-card ${
                    consonantsAverage ? "" : "border-gray"
                  }`}
                  style={
                    consonantsAverage
                      ? getGradientBorderStyle(consonantsAverage)
                      : {}
                  }
                >
                  <div className="relative z-10 flex flex-col items-center justify-center text-center">
                    <div className="font-semibold text-lg mb-2">Consonants</div>

                    <div className="flex flex-col gap-1">
                      {isLoadingStats ? (
                        <div className="text-[10px] sm:text-xs text-muted-foreground">
                          Loading...
                        </div>
                      ) : (
                        <>
                          <div className="text-[10px] sm:text-xs text-muted-foreground">
                            {consonantsWithMinTrials.completed}/
                            {consonantsWithMinTrials.total} quizzes
                          </div>
                          {consonantsAverage && (
                            <div
                              className="text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1"
                              style={getGradientColorStyle(consonantsAverage)}
                            >
                              <span>{consonantsAverage}%</span>
                              {quizStats?.consonants?.totalTrials > 0 && (
                                <span className="text-muted-foreground font-normal">
                                  ({quizStats.consonants.correctTrials}/
                                  {quizStats.consonants.totalTrials})
                                </span>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Legend - Show when there are quiz results */}
              {!isLoadingStats &&
                (vowelsAverage !== null || consonantsAverage !== null) && (
                  <div className="mt-4 p-3 pt-0 space-y-2">
                    {/* Overall Quiz Stats */}
                    <p className="text-xs text-muted-foreground text-center">
                      Performance Legend
                    </p>
                    <div className="flex flex-col items-center gap-2 text-xs">
                      {(() => {
                        const legend = getGradientNumberLineLegend();
                        return (
                          <>
                            <div className="w-full max-w-xs relative">
                              <div style={legend.gradientStyle}></div>
                              <div className="relative mt-1 h-4">
                                {legend.markers.map((marker, index) => (
                                  <div
                                    key={index}
                                    className="absolute flex flex-col items-center transform -translate-x-1/2"
                                    style={{ left: marker.left }}
                                  >
                                    <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                                    <span className="text-muted-foreground text-[10px] mt-1 whitespace-nowrap">
                                      {marker.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
            </CardContent>

            {/* Progress Tracking Button */}
            <div className="px-2 pt-0 flex-shrink-0">
              <Button
                onClick={() => setShowProgressModal(true)}
                variant="outline"
                className="w-full cursor-pointer text-sm"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Progress Tracking
              </Button>
            </div>
            <div className="flex items-center justify-center gap-0 p-0 m-0 text-sm text-muted-foreground">
              <div className="flex flex-col gap-0 items-center">
                <div className="text-sm text-muted-foreground">
                  {vowelsWithMinTrials.completed +
                    consonantsWithMinTrials.completed}
                  /{vowelsWithMinTrials.total + consonantsWithMinTrials.total}{" "}
                  quizzes
                </div>
                {quizStats?.overall?.average && (
                  <div
                    className="text-sm font-bold flex items-center gap-1"
                    style={getGradientColorStyle(quizStats.overall.average)}
                  >
                    <span>{quizStats.overall.average}%</span>
                    {quizStats?.overall?.totalTrials > 0 && (
                      <span className="text-xs text-muted-foreground font-normal">
                        ({quizStats.overall.correctTrials}/
                        {quizStats.overall.totalTrials})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Quiz Type Selection Step */}
      {currentStep === "quizType" && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 p-2 sm:p-4 overflow-hidden">
          <Card className="w-full gap-0 py-3 max-w-md max-h-[95vh] sm:max-h-[80vh] flex flex-col">
            <CardHeader className="pb-1 flex-shrink-0 relative">
              <CardTitle className="text-center text-sm sm:text-base">
                Choose Quiz Type
              </CardTitle>
              {/* View Mode Toggle */}
              <Button
                onClick={() => {
                  const modes = ["first30", "last30", "delta"];
                  const currentIndex = modes.indexOf(quizCardViewMode);
                  const nextIndex = (currentIndex + 1) % modes.length;
                  setQuizCardViewMode(modes[nextIndex]);
                }}
                variant="outline"
                size="sm"
                className="text-xs px-3 py-1 h-6 absolute right-2 top-0 w-16 cursor-pointer"
              >
                {quizCardViewMode === "last30" && "Last 30"}
                {quizCardViewMode === "first30" && "First 30"}
                {quizCardViewMode === "delta" && "Delta"}
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto px-2 sm:px-3">
              {isLoadingQuizData ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading quiz types...</span>
                </div>
              ) : apiError ? (
                <div className="text-center p-4 text-red-500">
                  <p>Failed to load quiz types from API</p>
                  <p className="text-sm text-muted-foreground">
                    Using fallback data
                  </p>
                </div>
              ) : null}

              {selectedCategory === "vowels" && (
                <div className="grid grid-cols-2 gap-1 sm:gap-2">
                  {/* Column 1: KIT_FLEECE, TRAP_DRESS, BAN_DRESS */}
                  <div className="space-y-1 sm:space-y-2">
                    {Object.values(quizDataFromApi)
                      .filter(
                        (quizData) =>
                          quizData.category === "vowels" &&
                          (quizData.id === QUIZ_TYPE_IDS.KIT_FLEECE ||
                            quizData.id === QUIZ_TYPE_IDS.TRAP_DRESS ||
                            quizData.id === QUIZ_TYPE_IDS.BAN_DRESS)
                      )
                      .map((quizData) => {
                        const previousResult = previousResults[quizData.id];
                        const cardData = getQuizCardData(
                          previousResult,
                          quizCardViewMode
                        );
                        return (
                          <div
                            key={quizData.id}
                            onClick={() => handleQuizTypeSelect(quizData.id)}
                            className={`relative w-full cursor-pointer rounded-lg p-2 sm:p-3 hover:bg-accent hover:text-accent-foreground transition-colors border-2 bg-card ${
                              cardData.hasData ? "" : "border-gray"
                            }`}
                            style={cardData.borderStyle}
                          >
                            <div className="relative z-10 flex flex-col">
                              <div className="font-semibold text-xs mx-auto">
                                {quizData.name}
                              </div>
                              <div className="text-xs text-muted-foreground mx-auto">
                                {quizData.description}
                              </div>
                              <div {...getQuizCardTextProps(previousResult)}>
                                <div className="flex flex-col gap-1">
                                  {quizCardViewMode === "delta" ? (
                                    // Delta view: delta above, first/last below
                                    <>
                                      {/* Delta percentage above the bar */}
                                      <div className="flex justify-center">
                                        <span
                                          className={`text-xs font-bold ${
                                            cardData.deltaPercentage >= 0
                                              ? "text-green-600"
                                              : "text-red-600"
                                          }`}
                                        >
                                          {cardData.deltaPercentage >= 0
                                            ? "+"
                                            : ""}
                                          {cardData.deltaPercentage}%
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    // Single view: show just the percentage
                                    <div className="flex gap-1 mx-auto">
                                      <span style={cardData.percentageColor}>
                                        {cardData.percentage}%
                                      </span>
                                    </div>
                                  )}
                                  <ScoreBar
                                    correct={cardData.correct}
                                    total={cardData.total}
                                    target={30}
                                    hasData={cardData.hasData}
                                    hideText={quizCardViewMode === "delta"}
                                  />
                                  {/* First and last percentages below the bar */}
                                  {quizCardViewMode === "delta" && (
                                    <div className="flex justify-between items-center gap-0">
                                      <div className="flex flex-col items-center">
                                        <span
                                          className="text-[9px] sm:text-xs"
                                          style={cardData.first30Color}
                                        >
                                          {cardData.first30Percentage}%
                                        </span>
                                      </div>
                                      <div className="flex flex-col items-center">
                                        <span
                                          className="text-[9px] sm:text-xs"
                                          style={cardData.percentageColor}
                                        >
                                          {cardData.last30Percentage}%
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Column 2: FOOT_GOOSE, STRUT_LOT */}
                  <div className="space-y-1 sm:space-y-2">
                    {Object.values(quizDataFromApi)
                      .filter(
                        (quizData) =>
                          quizData.category === "vowels" &&
                          (quizData.id === QUIZ_TYPE_IDS.FOOT_GOOSE ||
                            quizData.id === QUIZ_TYPE_IDS.STRUT_LOT)
                      )
                      .map((quizData) => {
                        const previousResult = previousResults[quizData.id];
                        const cardData = getQuizCardData(
                          previousResult,
                          quizCardViewMode
                        );
                        return (
                          <div
                            key={quizData.id}
                            onClick={() => handleQuizTypeSelect(quizData.id)}
                            className={`relative w-full cursor-pointer rounded-lg p-2 sm:p-3 hover:bg-accent hover:text-accent-foreground transition-colors border-2 bg-card ${
                              cardData.hasData ? "" : "border-gray"
                            }`}
                            style={cardData.borderStyle}
                          >
                            <div className="relative z-10 flex flex-col">
                              <div className="font-semibold text-xs mx-auto">
                                {quizData.name}
                              </div>
                              <div className="text-xs text-muted-foreground mx-auto">
                                {quizData.description}
                              </div>
                              <div {...getQuizCardTextProps(previousResult)}>
                                <div className="flex flex-col gap-1">
                                  {quizCardViewMode === "delta" ? (
                                    // Delta view: delta above, first/last below
                                    <>
                                      {/* Delta percentage above the bar */}
                                      <div className="flex justify-center">
                                        <span
                                          className={`text-xs font-bold ${
                                            cardData.deltaPercentage >= 0
                                              ? "text-green-600"
                                              : "text-red-600"
                                          }`}
                                        >
                                          {cardData.deltaPercentage >= 0
                                            ? "+"
                                            : ""}
                                          {cardData.deltaPercentage}%
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    // Single view: show just the percentage
                                    <div className="flex gap-1 mx-auto">
                                      <span style={cardData.percentageColor}>
                                        {cardData.percentage}%
                                      </span>
                                    </div>
                                  )}
                                  <ScoreBar
                                    correct={cardData.correct}
                                    total={cardData.total}
                                    target={30}
                                    hasData={cardData.hasData}
                                    hideText={quizCardViewMode === "delta"}
                                  />
                                  {/* First and last percentages below the bar */}
                                  {quizCardViewMode === "delta" && (
                                    <div className="flex justify-between items-center gap-0">
                                      <div className="flex flex-col items-center">
                                        <span
                                          className="text-[9px] sm:text-xs"
                                          style={cardData.first30Color}
                                        >
                                          {cardData.first30Percentage}%
                                        </span>
                                      </div>
                                      <div className="flex flex-col items-center">
                                        <span
                                          className="text-[9px] sm:text-xs"
                                          style={cardData.percentageColor}
                                        >
                                          {cardData.last30Percentage}%
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {selectedCategory === "consonants" && (
                <div className="grid grid-cols-3 gap-1 sm:gap-2">
                  {/* Column 1: T_CH, DH_D, TH_T, TH_F */}
                  <div className="space-y-1 sm:space-y-2">
                    {Object.values(quizDataFromApi)
                      .filter(
                        (quizData) =>
                          quizData.category === "consonants" &&
                          (quizData.id === QUIZ_TYPE_IDS.T_CH ||
                            quizData.id === QUIZ_TYPE_IDS.DH_D ||
                            quizData.id === QUIZ_TYPE_IDS.TH_T ||
                            quizData.id === QUIZ_TYPE_IDS.TH_F)
                      )
                      .map((quizData) => {
                        const previousResult = previousResults[quizData.id];
                        const cardData = getQuizCardData(
                          previousResult,
                          quizCardViewMode
                        );
                        return (
                          <div
                            key={quizData.id}
                            onClick={() => handleQuizTypeSelect(quizData.id)}
                            className={`relative w-full cursor-pointer rounded-lg p-2 sm:p-3 hover:bg-accent hover:text-accent-foreground transition-colors border-2 bg-card ${
                              cardData.hasData ? "" : "border-gray"
                            }`}
                            style={cardData.borderStyle}
                          >
                            <div className="relative z-10 flex flex-col">
                              <div className="font-semibold text-xs mx-auto">
                                {quizData.name}
                              </div>
                              <div className="text-xs text-muted-foreground mx-auto">
                                {quizData.description}
                              </div>
                              <div
                                {...getQuizCardTextProps(previousResult, true)}
                              >
                                <div className="flex flex-col gap-1">
                                  {quizCardViewMode === "delta" ? (
                                    // Delta view: delta above, first/last below
                                    <>
                                      {/* Delta percentage above the bar */}
                                      <div className="flex justify-center">
                                        <span
                                          className={`text-xs font-bold ${
                                            cardData.deltaPercentage >= 0
                                              ? "text-green-600"
                                              : "text-red-600"
                                          }`}
                                        >
                                          {cardData.deltaPercentage >= 0
                                            ? "+"
                                            : ""}
                                          {cardData.deltaPercentage}%
                                        </span>
                                      </div>
                                      <ScoreBar
                                        correct={cardData.correct}
                                        total={cardData.total}
                                        target={30}
                                        hasData={cardData.hasData}
                                        hideText={quizCardViewMode === "delta"}
                                      />
                                      {/* First and last percentages below the bar */}
                                      <div className="flex justify-between items-center gap-0">
                                        <div className="flex flex-col items-center">
                                          <span
                                            className="text-[9px] sm:text-xs"
                                            style={cardData.first30Color}
                                          >
                                            {cardData.first30Percentage}%
                                          </span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                          <span
                                            className="text-[9px] sm:text-xs"
                                            style={cardData.percentageColor}
                                          >
                                            {cardData.last30Percentage}%
                                          </span>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    // Single view: show just the percentage
                                    <>
                                      <div className="flex gap-1 mx-auto">
                                        <span style={cardData.percentageColor}>
                                          {cardData.percentage}%
                                        </span>
                                      </div>
                                      <ScoreBar
                                        correct={cardData.correct}
                                        total={cardData.total}
                                        target={30}
                                        hasData={cardData.hasData}
                                      />
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Column 2: DARK_L_O, DARK_L_U, R_NULL, S_Z */}
                  <div className="space-y-1 sm:space-y-2">
                    {Object.values(quizDataFromApi)
                      .filter(
                        (quizData) =>
                          quizData.category === "consonants" &&
                          (quizData.id === QUIZ_TYPE_IDS.DARK_L_O ||
                            quizData.id === QUIZ_TYPE_IDS.DARK_L_U ||
                            quizData.id === QUIZ_TYPE_IDS.R_NULL ||
                            quizData.id === QUIZ_TYPE_IDS.S_Z)
                      )
                      .map((quizData) => {
                        const previousResult = previousResults[quizData.id];
                        const cardData = getQuizCardData(
                          previousResult,
                          quizCardViewMode
                        );
                        return (
                          <div
                            key={quizData.id}
                            onClick={() => handleQuizTypeSelect(quizData.id)}
                            className={`relative w-full cursor-pointer rounded-lg p-2 sm:p-3 hover:bg-accent hover:text-accent-foreground transition-colors border-2 bg-card ${
                              cardData.hasData ? "" : "border-gray"
                            }`}
                            style={cardData.borderStyle}
                          >
                            <div className="relative z-10 flex flex-col">
                              <div className="font-semibold text-xs mx-auto">
                                {quizData.name}
                              </div>
                              <div className="text-xs text-muted-foreground mx-auto">
                                {quizData.description}
                              </div>
                              <div
                                {...getQuizCardTextProps(previousResult, true)}
                              >
                                <div className="flex flex-col gap-1">
                                  {quizCardViewMode === "delta" ? (
                                    // Delta view: delta above, first/last below
                                    <>
                                      {/* Delta percentage above the bar */}
                                      <div className="flex justify-center">
                                        <span
                                          className={`text-xs font-bold ${
                                            cardData.deltaPercentage >= 0
                                              ? "text-green-600"
                                              : "text-red-600"
                                          }`}
                                        >
                                          {cardData.deltaPercentage >= 0
                                            ? "+"
                                            : ""}
                                          {cardData.deltaPercentage}%
                                        </span>
                                      </div>
                                      <ScoreBar
                                        correct={cardData.correct}
                                        total={cardData.total}
                                        target={30}
                                        hasData={cardData.hasData}
                                        hideText={quizCardViewMode === "delta"}
                                      />
                                      {/* First and last percentages below the bar */}
                                      <div className="flex justify-between items-center gap-0">
                                        <div className="flex flex-col items-center">
                                          <span
                                            className="text-[9px] sm:text-xs"
                                            style={cardData.first30Color}
                                          >
                                            {cardData.first30Percentage}%
                                          </span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                          <span
                                            className="text-[9px] sm:text-xs"
                                            style={cardData.percentageColor}
                                          >
                                            {cardData.last30Percentage}%
                                          </span>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    // Single view: show just the percentage
                                    <>
                                      <div className="flex gap-1 mx-auto">
                                        <span style={cardData.percentageColor}>
                                          {cardData.percentage}%
                                        </span>
                                      </div>
                                      <ScoreBar
                                        correct={cardData.correct}
                                        total={cardData.total}
                                        target={30}
                                        hasData={cardData.hasData}
                                      />
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Column 3: M_N, N_NG, M_NG */}
                  <div className="space-y-1 sm:space-y-2">
                    {Object.values(quizDataFromApi)
                      .filter(
                        (quizData) =>
                          quizData.category === "consonants" &&
                          (quizData.id === QUIZ_TYPE_IDS.M_N ||
                            quizData.id === QUIZ_TYPE_IDS.N_NG ||
                            quizData.id === QUIZ_TYPE_IDS.M_NG)
                      )
                      .map((quizData) => {
                        const previousResult = previousResults[quizData.id];
                        const cardData = getQuizCardData(
                          previousResult,
                          quizCardViewMode
                        );
                        return (
                          <div
                            key={quizData.id}
                            onClick={() => handleQuizTypeSelect(quizData.id)}
                            className={`relative w-full cursor-pointer rounded-lg p-2 sm:p-3 hover:bg-accent hover:text-accent-foreground transition-colors border-2 bg-card ${
                              cardData.hasData ? "" : "border-gray"
                            }`}
                            style={cardData.borderStyle}
                          >
                            <div className="relative z-10 flex flex-col">
                              <div className="font-semibold text-xs mx-auto">
                                {quizData.name}
                              </div>
                              <div className="text-xs text-muted-foreground mx-auto">
                                {quizData.description}
                              </div>
                              <div
                                {...getQuizCardTextProps(previousResult, true)}
                              >
                                <div className="flex flex-col gap-1">
                                  {quizCardViewMode === "delta" ? (
                                    // Delta view: delta above, first/last below
                                    <>
                                      {/* Delta percentage above the bar */}
                                      <div className="flex justify-center">
                                        <span
                                          className={`text-xs font-bold ${
                                            cardData.deltaPercentage >= 0
                                              ? "text-green-600"
                                              : "text-red-600"
                                          }`}
                                        >
                                          {cardData.deltaPercentage >= 0
                                            ? "+"
                                            : ""}
                                          {cardData.deltaPercentage}%
                                        </span>
                                      </div>
                                      <ScoreBar
                                        correct={cardData.correct}
                                        total={cardData.total}
                                        target={30}
                                        hasData={cardData.hasData}
                                        hideText={quizCardViewMode === "delta"}
                                      />
                                      {/* First and last percentages below the bar */}
                                      <div className="flex justify-between items-center gap-0">
                                        <div className="flex flex-col items-center">
                                          <span
                                            className="text-[9px] sm:text-xs"
                                            style={cardData.first30Color}
                                          >
                                            {cardData.first30Percentage}%
                                          </span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                          <span
                                            className="text-[9px] sm:text-xs"
                                            style={cardData.percentageColor}
                                          >
                                            {cardData.last30Percentage}%
                                          </span>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    // Single view: show just the percentage
                                    <>
                                      <div className="flex gap-1 mx-auto">
                                        <span style={cardData.percentageColor}>
                                          {cardData.percentage}%
                                        </span>
                                      </div>
                                      <ScoreBar
                                        correct={cardData.correct}
                                        total={cardData.total}
                                        target={30}
                                        hasData={cardData.hasData}
                                      />
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </CardContent>
            {Object.keys(previousResults).length > 0 && (
              <div className="p-3 pt-4 flex-shrink-0 space-y-2">
                <p className="text-xs text-muted-foreground text-center">
                  Performance Legend
                </p>
                <div className="flex flex-col items-center gap-2 text-xs">
                  {(() => {
                    const legend = getGradientNumberLineLegend();
                    return (
                      <>
                        <div className="w-full max-w-xs relative">
                          <div style={legend.gradientStyle}></div>
                          <div className="relative mt-1 h-4">
                            {legend.markers.map((marker, index) => (
                              <div
                                key={index}
                                className="absolute flex flex-col items-center transform -translate-x-1/2"
                                style={{ left: marker.left }}
                              >
                                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                                <span className="text-muted-foreground text-[10px] mt-1 whitespace-nowrap">
                                  {marker.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
            <div className="p-3 pt-0 flex-shrink-0">
              <Button
                onClick={() => setCurrentStep("category")}
                variant="ghost"
                className="w-full cursor-pointer text-sm"
              >
                ← Back to Categories
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Quiz Interface */}
      {currentStep === "quiz" &&
        currentQuizData &&
        shuffledQuestions.length > 0 && (
          <div className="h-[calc(100vh-var(--navbar-height))] sm:h-screen bg-background flex items-center justify-center p-2 sm:p-4 overflow-hidden">
            <Card className="w-full max-w-lg gap-0">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg">
                    {currentQuizData?.name || "Quiz"}
                  </CardTitle>
                  <Button
                    onClick={() => {
                      setShowResults(true);
                      refreshStats(); // Refresh results when ending quiz early
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
                    title="End Quiz"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {/* Baseline stats - only show when baseline is established */}
                {(() => {
                  const previousResult = previousResults[selectedQuizType];
                  const previousTotal = previousResult?.totalTrials || 0;
                  const combinedTotal = previousTotal + questionsAnswered;

                  if (combinedTotal >= 30) {
                    // Use first 30 trials stats from API
                    const first30Total =
                      previousResult?.first30TotalTrials || 0;
                    const first30Correct =
                      previousResult?.first30CorrectTrials || 0;
                    const first30Percentage =
                      previousResult?.first30Percentage || 0;

                    return (
                      <div className="flex flex-col gap-0.5">
                        {(() => {
                          // Calculate current last 30 stats (same logic as the main display)
                          const recentCorrect =
                            previousResult?.recentCorrectTrials || 0;
                          const recentTotal =
                            previousResult?.recentTotalTrials || 0;

                          let last30Correct, last30Total;

                          if (questionsAnswered >= 30) {
                            const currentSessionInLast30 = Math.min(
                              questionsAnswered,
                              30
                            );
                            const historicalInLast30 = Math.max(
                              0,
                              30 - currentSessionInLast30
                            );
                            const historicalCorrect =
                              historicalInLast30 > 0 && recentTotal > 0
                                ? Math.round(
                                    (recentCorrect / recentTotal) *
                                      historicalInLast30
                                  )
                                : 0;
                            const currentSessionTrialsInLast30 =
                              currentSessionTrials.slice(
                                -currentSessionInLast30
                              );
                            const currentSessionCorrect =
                              currentSessionTrialsInLast30.filter(
                                (trial) => trial.isCorrect
                              ).length;
                            last30Correct =
                              historicalCorrect + currentSessionCorrect;
                            last30Total = 30;
                          } else {
                            const availableRecentSlots = 30 - questionsAnswered;
                            const usedRecentCorrect = Math.min(
                              recentCorrect,
                              availableRecentSlots
                            );
                            const usedRecentTotal = Math.min(
                              recentTotal,
                              availableRecentSlots
                            );
                            last30Correct = usedRecentCorrect + score;
                            last30Total = usedRecentTotal + questionsAnswered;
                          }

                          const last30Percentage =
                            last30Total > 0
                              ? Math.round((last30Correct / last30Total) * 100)
                              : 0;

                          // Calculate deltas
                          const percentageDelta =
                            last30Percentage - first30Percentage;
                          const correctDelta = last30Correct - first30Correct;

                          return (
                            <div className="flex justify-center">
                              {/* Label column */}
                              <div className="flex flex-col items-end pr-3">
                                <div className="text-xs text-muted-foreground">
                                  First 30:
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Change:
                                </div>
                              </div>
                              {/* Percentage column */}
                              <div className="flex flex-col items-end pr-2">
                                <div className="text-xs text-muted-foreground">
                                  {first30Percentage}%
                                </div>
                                <div
                                  className={`text-xs ${
                                    percentageDelta >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {percentageDelta >= 0 ? "+" : ""}
                                  {percentageDelta}%
                                </div>
                              </div>

                              {/* Correct count column */}
                              <div className="flex flex-col items-end">
                                <div className="text-xs text-muted-foreground">
                                  ({first30Correct}
                                </div>
                                <div
                                  className={`text-xs ${
                                    correctDelta >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {correctDelta >= 0 ? "+" : ""}
                                  {correctDelta}
                                </div>
                              </div>
                              {/* Correct count column */}
                              <div className="flex flex-col items-end">
                                <div className="text-xs text-muted-foreground">
                                  /{first30Total})
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  }
                  return null;
                })()}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress - Show progress toward 30 trials using ScoreBar */}
                <div className="space-y-2">
                  {/* Colored percentage and x/y display */}
                  <div className="flex flex-col gap-1">
                    {(() => {
                      const previousResult = previousResults[selectedQuizType];
                      const previousCorrect =
                        previousResult?.correctTrials ||
                        previousResult?.recentCorrectTrials ||
                        0;
                      const previousTotal =
                        previousResult?.totalTrials ||
                        previousResult?.recentTotalTrials ||
                        0;
                      const combinedCorrect = previousCorrect + score;
                      const combinedTotal = previousTotal + questionsAnswered;

                      // Use most recent 30 trials if above 30, otherwise use combined total
                      const recentCorrect =
                        previousResult?.recentCorrectTrials || 0;
                      const recentTotal =
                        previousResult?.recentTotalTrials || 0;

                      // Calculate the actual last 30 trials (recent + current, capped at 30)
                      let last30Correct, last30Total;

                      if (questionsAnswered >= 30) {
                        // If current session has 30+ trials, calculate from actual last 30 trials
                        const recentCorrect =
                          previousResult?.recentCorrectTrials || 0;
                        const recentTotal =
                          previousResult?.recentTotalTrials || 0;

                        // Calculate how many of the current session trials are in the last 30
                        const currentSessionInLast30 = Math.min(
                          questionsAnswered,
                          30
                        );
                        const historicalInLast30 = Math.max(
                          0,
                          30 - currentSessionInLast30
                        );

                        // Get correct count from historical trials (proportional to how many we're using)
                        const historicalCorrect =
                          historicalInLast30 > 0 && recentTotal > 0
                            ? Math.round(
                                (recentCorrect / recentTotal) *
                                  historicalInLast30
                              )
                            : 0;

                        // Get correct count from current session (last 30 trials)
                        const currentSessionTrialsInLast30 =
                          currentSessionTrials.slice(-currentSessionInLast30);
                        const currentSessionCorrect =
                          currentSessionTrialsInLast30.filter(
                            (trial) => trial.isCorrect
                          ).length;

                        last30Correct =
                          historicalCorrect + currentSessionCorrect;
                        last30Total = 30;
                      } else {
                        // Combine recent trials with current session, but cap at 30 total
                        const availableRecentSlots = 30 - questionsAnswered;
                        const usedRecentCorrect = Math.min(
                          recentCorrect,
                          availableRecentSlots
                        );
                        const usedRecentTotal = Math.min(
                          recentTotal,
                          availableRecentSlots
                        );
                        last30Correct = usedRecentCorrect + score;
                        last30Total = usedRecentTotal + questionsAnswered;
                      }

                      // Determine which stats to show
                      const showRecent = combinedTotal >= 30;
                      const displayCorrect = showRecent
                        ? last30Correct
                        : combinedCorrect;
                      const displayTotal = showRecent
                        ? last30Total
                        : combinedTotal;
                      const displayPercentage =
                        displayTotal > 0
                          ? Math.round((displayCorrect / displayTotal) * 100)
                          : 0;
                      const hasData = displayTotal > 0;

                      return (
                        <div className="flex gap-1 mx-auto">
                          <span
                            className="text-sm font-bold"
                            style={
                              hasData
                                ? displayTotal >= 30
                                  ? getGradientColorStyle(displayPercentage)
                                  : getSubduedGradientColorStyle(
                                      displayPercentage
                                    )
                                : {}
                            }
                          >
                            Last 30: {hasData ? displayPercentage : "N/A"}% (
                            {displayCorrect}/{displayTotal}){showRecent}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  <ScoreBar
                    correct={(() => {
                      const previousResult = previousResults[selectedQuizType];
                      const previousCorrect =
                        previousResult?.correctTrials ||
                        previousResult?.recentCorrectTrials ||
                        0;
                      const previousTotal =
                        previousResult?.totalTrials ||
                        previousResult?.recentTotalTrials ||
                        0;
                      const combinedTotal = previousTotal + questionsAnswered;

                      // Use same logic as percentage display
                      if (combinedTotal >= 30) {
                        // Use most recent 30 trials
                        if (questionsAnswered >= 30) {
                          // If current session has 30+ trials, calculate from actual last 30 trials
                          const recentCorrect =
                            previousResult?.recentCorrectTrials || 0;
                          const recentTotal =
                            previousResult?.recentTotalTrials || 0;

                          const currentSessionInLast30 = Math.min(
                            questionsAnswered,
                            30
                          );
                          const historicalInLast30 = Math.max(
                            0,
                            30 - currentSessionInLast30
                          );

                          const historicalCorrect =
                            historicalInLast30 > 0 && recentTotal > 0
                              ? Math.round(
                                  (recentCorrect / recentTotal) *
                                    historicalInLast30
                                )
                              : 0;

                          const currentSessionTrialsInLast30 =
                            currentSessionTrials.slice(-currentSessionInLast30);
                          const currentSessionCorrect =
                            currentSessionTrialsInLast30.filter(
                              (trial) => trial.isCorrect
                            ).length;

                          return historicalCorrect + currentSessionCorrect;
                        } else {
                          // Combine recent trials with current session, but cap at 30 total
                          const recentCorrect =
                            previousResult?.recentCorrectTrials || 0;
                          const availableRecentSlots = 30 - questionsAnswered;
                          const usedRecentCorrect = Math.min(
                            recentCorrect,
                            availableRecentSlots
                          );
                          return usedRecentCorrect + score;
                        }
                      } else {
                        // Use combined total
                        return previousCorrect + score;
                      }
                    })()}
                    total={(() => {
                      const previousResult = previousResults[selectedQuizType];
                      const previousTotal =
                        previousResult?.totalTrials ||
                        previousResult?.recentTotalTrials ||
                        0;
                      const combinedTotal = previousTotal + questionsAnswered;

                      // Use same logic as percentage display
                      if (combinedTotal >= 30) {
                        // Use most recent 30 trials
                        if (questionsAnswered >= 30) {
                          // If current session has 30+ trials, only use the most recent 30 from current session
                          return 30;
                        } else {
                          // Otherwise, combine recent trials with current session, capped at 30
                          const recentTotal =
                            previousResult?.recentTotalTrials || 0;
                          const availableRecentSlots = 30 - questionsAnswered;
                          const usedRecentTotal = Math.min(
                            recentTotal,
                            availableRecentSlots
                          );
                          return usedRecentTotal + questionsAnswered;
                        }
                      } else {
                        // Use combined total
                        return previousTotal + questionsAnswered;
                      }
                    })()}
                    target={30}
                    hasData={(() => {
                      const previousResult = previousResults[selectedQuizType];
                      const previousTotal =
                        previousResult?.totalTrials ||
                        previousResult?.recentTotalTrials ||
                        0;
                      const combinedTotal = previousTotal + questionsAnswered;

                      // Use same logic as percentage display
                      if (combinedTotal >= 30) {
                        // Use most recent 30 trials
                        if (questionsAnswered >= 30) {
                          // If current session has 30+ trials, only use the most recent 30 from current session
                          return true;
                        } else {
                          // Otherwise, combine recent trials with current session, capped at 30
                          const recentTotal =
                            previousResult?.recentTotalTrials || 0;
                          const availableRecentSlots = 30 - questionsAnswered;
                          const usedRecentTotal = Math.min(
                            recentTotal,
                            availableRecentSlots
                          );
                          return usedRecentTotal + questionsAnswered > 0;
                        }
                      } else {
                        // Use combined total
                        return combinedTotal > 0;
                      }
                    })()}
                    isQuiz={true}
                  />
                </div>

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
                      onClick={() => playAudio("dictionary", false)}
                      disabled={
                        playingSource || isLoading || !audioUrls.dictionary
                      }
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
                  </div>

                  {!audioUrls.dictionary && !isLoading && (
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
                  <p className="text-lg font-medium">
                    Which word did you hear?
                  </p>
                  {quizSettings.showSoundSymbols}
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

                      // Handle both API data and hardcoded data structures
                      let otherQuestion = null;
                      if (currentQuizData && currentQuizData.pairs) {
                        // Hardcoded data structure
                        otherQuestion = currentQuizData.pairs.find(
                          (q) => q.word === otherWord
                        );
                      } else if (currentQuizData) {
                        // API data structure - find in shuffled questions
                        otherQuestion = shuffledQuestions.find(
                          (q) => q.word === otherWord
                        );
                      }

                      optionAlternates = otherQuestion
                        ? otherQuestion.alternates
                        : [];
                    }

                    // Determine which sound symbol to show for this option
                    let soundSymbol = "";
                    if (
                      currentQuizData &&
                      currentQuizData.sound1Name &&
                      currentQuizData.sound2Name
                    ) {
                      // Hardcoded data structure
                      soundSymbol =
                        index === 0
                          ? `${currentQuizData.sound1Name} ${currentQuizData.sound1Symbol}`
                          : `${currentQuizData.sound2Name} ${currentQuizData.sound2Symbol}`;
                    } else if (currentQuizData && currentQuizData.contrastKey) {
                      // API data structure - use contrast key for sound symbols
                      const contrastKey = currentQuizData.contrastKey;
                      if (contrastKey) {
                        const [sound1, sound2] = contrastKey.split("~");
                        soundSymbol = index === 0 ? `${sound1}` : `${sound2}`;
                      }
                    }

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
                                {option}, {optionAlternates.join(", ")}
                              </span>
                            ) : (
                              <span>{option}</span>
                            )}
                          </div>
                        </Button>
                        {quizSettings.showSoundSymbols && (
                          <div className="text-xs text-muted-foreground">
                            {soundSymbol}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      {/* Progress Modal */}
      <ProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        contrastKey={currentQuizData?.contrastKey || "kit_fleece"}
      />
    </div>
  );
}
