import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "frontend/src/components/ui/card";
import { Button } from "frontend/src/components/ui/button";
import { Badge } from "frontend/src/components/ui/badge";
import {
  Loader2,
  Volume2,
  VolumeX,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import useAuthStore from "../stores/auth-store";
import { fetchContrasts, fetchPairs } from "../utils/quiz-api";
import { getWiktionaryUSAudio } from "../utils/wiktionary-api";

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 120, // Conservative limit
  baseDelayMs: 500, // 2 seconds between requests
  maxDelayMs: 10000, // Max 10 seconds delay
  retryAttempts: 3,
};

// Rate limiter class
class RateLimiter {
  constructor() {
    this.requestTimes = [];
    this.currentDelay = RATE_LIMIT_CONFIG.baseDelayMs;
    this.consecutiveFailures = 0;
  }

  async waitForNextRequest() {
    const now = Date.now();

    // Remove requests older than 1 minute
    this.requestTimes = this.requestTimes.filter((time) => now - time < 60000);

    // Check if we're at the rate limit
    if (this.requestTimes.length >= RATE_LIMIT_CONFIG.maxRequestsPerMinute) {
      const oldestRequest = this.requestTimes[0];
      const waitTime = 60000 - (now - oldestRequest);
      console.log(`Rate limit reached. Waiting ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    // Add current request time
    this.requestTimes.push(now);

    // Apply current delay
    if (this.currentDelay > 0) {
      console.log(`Waiting ${this.currentDelay}ms before next request...`);
      await new Promise((resolve) => setTimeout(resolve, this.currentDelay));
    }
  }

  onSuccess() {
    // Reduce delay on success
    this.currentDelay = Math.max(
      RATE_LIMIT_CONFIG.baseDelayMs,
      this.currentDelay * 0.8
    );
    this.consecutiveFailures = 0;
  }

  onFailure() {
    // Increase delay on failure (exponential backoff)
    this.consecutiveFailures++;
    this.currentDelay = Math.min(
      RATE_LIMIT_CONFIG.maxDelayMs,
      this.currentDelay * Math.pow(2, this.consecutiveFailures)
    );
    console.log(`Request failed. Increased delay to ${this.currentDelay}ms`);
  }

  reset() {
    this.currentDelay = RATE_LIMIT_CONFIG.baseDelayMs;
    this.consecutiveFailures = 0;
  }
}

const QuizAudioAdmin = () => {
  const { isAdmin, isLoading: authLoading } = useAuthStore();
  const [audioLogs, setAudioLogs] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [expandedQuizzes, setExpandedQuizzes] = useState(new Set());
  const [checkingWord, setCheckingWord] = useState(null);
  const [checkingQuiz, setCheckingQuiz] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [quizDataFromApi, setQuizDataFromApi] = useState({});
  const [isLoadingQuizData, setIsLoadingQuizData] = useState(false);
  const [quizWords, setQuizWords] = useState({}); // Store word pairs for each quiz
  const [loadingWords, setLoadingWords] = useState(new Set()); // Track which quizzes are loading words
  const [rateLimitStatus, setRateLimitStatus] = useState({
    isLimited: false,
    message: "",
    remainingRequests: RATE_LIMIT_CONFIG.maxRequestsPerMinute,
  });
  const audioRef = useRef(null);
  const rateLimiter = useRef(new RateLimiter());

  // Load audio logs from localStorage
  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem("quizAudioLogs") || "{}");
    setAudioLogs(logs);
  }, []);

  // Load quiz data from API
  useEffect(() => {
    const loadQuizData = async () => {
      setIsLoadingQuizData(true);
      try {
        const data = await fetchContrasts();
        setQuizDataFromApi(data);
      } catch (error) {
        console.error("Failed to load quiz data from API:", error);
        setQuizDataFromApi({});
      } finally {
        setIsLoadingQuizData(false);
      }
    };

    loadQuizData();
  }, []);

  // Helper function to get the appropriate audio URL for a word from a question (same as quiz)
  const getAudioUrlFromQuestion = (word, question) => {
    if (!question) {
      console.log(`❌ No question data provided for word: "${word}"`);
      return null;
    }

    console.log(`🔍 Looking for audio URL for word: "${word}"`);
    console.log(
      `📋 Question wordA: "${question.wordA}", wordB: "${question.wordB}"`
    );
    console.log(`🔗 audioAUrl: "${question.audioAUrl}"`);
    console.log(`🔗 audioBUrl: "${question.audioBUrl}"`);

    // Determine which audio URL to use based on which word is being presented
    if (word === question.wordA && question.audioAUrl) {
      console.log(`✅ Found audioAUrl for wordA: "${question.audioAUrl}"`);
      return question.audioAUrl;
    } else if (word === question.wordB && question.audioBUrl) {
      console.log(`✅ Found audioBUrl for wordB: "${question.audioBUrl}"`);
      return question.audioBUrl;
    }

    console.log(`❌ No matching audio URL found for word: "${word}"`);
    return null;
  };

  // Function to get US audio from Wiktionary API with rate limiting
  const getDictionaryAudio = async (word, retryCount = 0) => {
    if (!word) return null;

    try {
      // Wait for rate limiter
      await rateLimiter.current.waitForNextRequest();

      const audioUrl = await getWiktionaryUSAudio(word);

      if (audioUrl) {
        rateLimiter.current.onSuccess();
        return audioUrl;
      } else {
        console.log(`No audio found for word: ${word}`);
        rateLimiter.current.onSuccess();
        return null;
      }
    } catch (error) {
      console.error(`Error fetching Wiktionary audio for "${word}":`, error);
      rateLimiter.current.onFailure();

      // Retry on network errors
      if (
        retryCount < RATE_LIMIT_CONFIG.retryAttempts &&
        (error.name === "TypeError" || error.message.includes("fetch"))
      ) {
        console.log(
          `Network error. Retrying in ${rateLimiter.current.currentDelay}ms...`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, rateLimiter.current.currentDelay)
        );
        return getDictionaryAudio(word, retryCount + 1);
      }

      return null;
    }
  };

  // Function to get all audio sources for a word (check both sources)
  const getAudioForWord = async (word, question) => {
    const result = {
      sources: [],
      primaryUrl: null,
      primarySource: null,
    };

    console.log(`🔍 Checking audio for word: "${word}"`);
    console.log(`📋 Question data:`, question);

    // Check database audio URL first
    const databaseAudioUrl = getAudioUrlFromQuestion(word, question);
    console.log(`🗄️ Database audio URL:`, databaseAudioUrl);

    if (databaseAudioUrl && databaseAudioUrl.trim() !== "") {
      result.sources.push("database");
      result.primaryUrl = databaseAudioUrl;
      result.primarySource = "database";
      console.log(`✅ Database audio found:`, databaseAudioUrl);
    } else {
      console.log(`❌ No database audio URL found`);
    }

    // Always check Wiktionary API (for comparison)
    const wiktionaryAudio = await getDictionaryAudio(word);
    console.log(`🌐 Wiktionary API audio:`, wiktionaryAudio);

    if (wiktionaryAudio) {
      result.sources.push("wiktionary");
      // Only use API as primary if no database URL exists
      if (!result.primaryUrl) {
        result.primaryUrl = wiktionaryAudio;
        result.primarySource = "wiktionary";
      }
      console.log(`✅ Wiktionary API audio found:`, wiktionaryAudio);
    } else {
      console.log(`❌ No Wiktionary API audio found`);
    }

    console.log(`📊 Final result:`, result);
    return result.sources.length > 0 ? result : null;
  };

  // Check audio for a single word
  const checkWordAudio = async (word, quizType) => {
    setCheckingWord(word);
    try {
      // Find the question that contains this word to get database audio URLs
      const question = quizWords[quizType]?.find((pair) => pair.word === word);

      const audioResult = await getAudioForWord(word, question);
      const audioStatus = {
        word,
        quizType,
        hasAudio: !!audioResult,
        audioUrl: audioResult?.primaryUrl || null,
        audioSource: audioResult?.primarySource || null,
        audioSources: audioResult?.sources || [],
        timestamp: new Date().toISOString(),
      };

      // Update logs
      const newLogs = { ...audioLogs };
      if (!newLogs[quizType]) {
        newLogs[quizType] = {};
      }
      newLogs[quizType][word] = audioStatus;

      setAudioLogs(newLogs);
      localStorage.setItem("quizAudioLogs", JSON.stringify(newLogs));
    } catch (error) {
      console.error("Error checking word audio:", error);
    } finally {
      setCheckingWord(null);
    }
  };

  // Check audio for all words in a quiz with better progress tracking
  const checkQuizAudio = async (quizType) => {
    setCheckingQuiz(quizType);
    setRateLimitStatus({
      isLimited: false,
      message: "",
      remainingRequests: RATE_LIMIT_CONFIG.maxRequestsPerMinute,
    });

    try {
      // Fetch pairs from API (or use cached words if available)
      let pairs = quizWords[quizType];
      if (!pairs) {
        pairs = await fetchPairs(quizType);
        // Cache the words for future use
        setQuizWords((prev) => ({
          ...prev,
          [quizType]: pairs,
        }));
      }

      if (!pairs || pairs.length === 0) return;

      const newLogs = { ...audioLogs };
      if (!newLogs[quizType]) {
        newLogs[quizType] = {};
      }

      // Check each word in the quiz with progress updates
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];

        // Update progress message
        setRateLimitStatus((prev) => ({
          ...prev,
          message: `Checking ${i + 1}/${pairs.length}: ${pair.word}`,
        }));

        const audioResult = await getAudioForWord(pair.word, pair);

        newLogs[quizType][pair.word] = {
          word: pair.word,
          quizType,
          hasAudio: !!audioResult,
          audioUrl: audioResult?.primaryUrl || null,
          audioSource: audioResult?.primarySource || null,
          audioSources: audioResult?.sources || [],
          timestamp: new Date().toISOString(),
        };

        // Update logs after each word
        setAudioLogs({ ...newLogs });
        localStorage.setItem("quizAudioLogs", JSON.stringify(newLogs));

        // No additional delay needed - rate limiter handles timing
      }

      setRateLimitStatus({
        isLimited: false,
        message: `Completed checking ${pairs.length} words`,
        remainingRequests: RATE_LIMIT_CONFIG.maxRequestsPerMinute,
      });
    } catch (error) {
      console.error("Error checking quiz audio:", error);
      setRateLimitStatus({
        isLimited: false,
        message: `Error: ${error.message}`,
        remainingRequests: RATE_LIMIT_CONFIG.maxRequestsPerMinute,
      });
    } finally {
      setCheckingQuiz(null);
    }
  };

  // Clear all audio logs
  const clearAllLogs = () => {
    localStorage.removeItem("quizAudioLogs");
    setAudioLogs({});
    rateLimiter.current.reset();
    setRateLimitStatus({
      isLimited: false,
      message: "",
      remainingRequests: RATE_LIMIT_CONFIG.maxRequestsPerMinute,
    });
  };

  // Play audio for a word
  const playAudio = async (word, quizType) => {
    if (playingAudio === word) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingAudio(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const wordLog = audioLogs[quizType]?.[word];
    if (!wordLog || !wordLog.hasAudio) {
      // Try to get audio if not logged or no audio available
      const question = quizWords[quizType]?.find((pair) => pair.word === word);
      const audioResult = await getAudioForWord(word, question);
      if (audioResult) {
        // Update the log with the audio URL
        const newLogs = { ...audioLogs };
        if (!newLogs[quizType]) {
          newLogs[quizType] = {};
        }
        newLogs[quizType][word] = {
          ...wordLog,
          hasAudio: true,
          audioUrl: audioResult.primaryUrl,
          audioSource: audioResult.primarySource,
          audioSources: audioResult.sources,
          timestamp: new Date().toISOString(),
        };
        setAudioLogs(newLogs);
        localStorage.setItem("quizAudioLogs", JSON.stringify(newLogs));

        // Play the audio
        playAudioUrl(audioResult.primaryUrl, word);
      }
      return;
    }

    // If we have audio URL in the log, play it
    if (wordLog.audioUrl) {
      playAudioUrl(wordLog.audioUrl, word);
    } else {
      // Fallback: try to get audio again
      const question = quizWords[quizType]?.find((pair) => pair.word === word);
      const audioResult = await getAudioForWord(word, question);
      if (audioResult) {
        playAudioUrl(audioResult.primaryUrl, word);
      }
    }
  };

  // Play audio from URL
  const playAudioUrl = (audioUrl, word) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
        setPlayingAudio(null);
      });
      setPlayingAudio(word);
    }
  };

  // Handle audio ended
  const handleAudioEnded = () => {
    setPlayingAudio(null);
  };

  // Toggle quiz expansion
  const toggleQuiz = (quizId) => {
    const newExpanded = new Set(expandedQuizzes);
    if (newExpanded.has(quizId)) {
      newExpanded.delete(quizId);
    } else {
      newExpanded.add(quizId);
      // Load words if not already loaded
      if (!quizWords[quizId]) {
        loadQuizWords(quizId);
      }
    }
    setExpandedQuizzes(newExpanded);
  };

  // Load word pairs for a specific quiz
  const loadQuizWords = async (quizId) => {
    setLoadingWords((prev) => new Set(prev).add(quizId));
    try {
      const pairs = await fetchPairs(quizId);
      setQuizWords((prev) => ({
        ...prev,
        [quizId]: pairs,
      }));
    } catch (error) {
      console.error("Error loading quiz words:", error);
    } finally {
      setLoadingWords((prev) => {
        const newSet = new Set(prev);
        newSet.delete(quizId);
        return newSet;
      });
    }
  };

  // Get audio coverage for a quiz
  const getQuizAudioCoverage = (quizType) => {
    const quizLogs = audioLogs[quizType] || {};
    let availableCount = 0;
    let totalWords = 0;

    // Count words that have audio logs
    Object.values(quizLogs).forEach((log) => {
      totalWords++;
      if (log.hasAudio) {
        availableCount++;
      }
    });

    return {
      available: availableCount,
      total: totalWords,
      percentage:
        totalWords > 0 ? Math.round((availableCount / totalWords) * 100) : 0,
    };
  };

  // Get overall audio coverage
  const getOverallCoverage = () => {
    const allWords = new Set();

    // Collect all words from audio logs
    Object.values(audioLogs).forEach((quizLogs) => {
      Object.keys(quizLogs).forEach((word) => {
        allWords.add(word);
      });
    });

    let availableCount = 0;
    const totalWords = allWords.size;

    allWords.forEach((word) => {
      // Check if word has audio in any quiz
      const hasAudio = Object.values(audioLogs).some(
        (quizLogs) => quizLogs[word] && quizLogs[word].hasAudio
      );
      if (hasAudio) {
        availableCount++;
      }
    });

    return {
      available: availableCount,
      total: totalWords,
      percentage:
        totalWords > 0 ? Math.round((availableCount / totalWords) * 100) : 0,
    };
  };

  const overallCoverage = getOverallCoverage();

  // Show loading state while checking admin status
  if (authLoading) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  // Show access denied for non-admins
  if (!isAdmin) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              This page is only available to administrators.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Hidden audio element for playback */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onError={() => setPlayingAudio(null)}
      />
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Quiz Audio Coverage Admin</h1>
        <p className="text-muted-foreground mb-4">
          View and check audio availability for all quiz words. Data is
          automatically collected when admin users take quizzes.
        </p>

        {/* Rate Limit Status */}
        {rateLimitStatus.message && (
          <Card className="mb-4 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-800 dark:text-orange-200">
                  {rateLimitStatus.message}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overall Stats */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Overall Audio Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {overallCoverage.available}
                </div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {overallCoverage.total - overallCoverage.available}
                </div>
                <div className="text-sm text-muted-foreground">Missing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {overallCoverage.percentage}%
                </div>
                <div className="text-sm text-muted-foreground">Coverage</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <Button
            onClick={clearAllLogs}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear All Logs
          </Button>
        </div>

        {/* Audio Source Legend */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium">Audio Sources:</span>
              <div className="flex items-center gap-2">
                <Badge className="text-xs bg-green-500 hover:bg-green-600 text-white border-green-500">
                  DB
                </Badge>
                <span className="text-muted-foreground">
                  PostgreSQL Database
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="text-xs bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500">
                  API
                </Badge>
                <span className="text-muted-foreground">Wiktionary API</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-xs">
                  Missing
                </Badge>
                <span className="text-muted-foreground">
                  No Audio Available
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz List */}
      <div className="space-y-4">
        {isLoadingQuizData ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading quiz data...</span>
          </div>
        ) : (
          Object.entries(quizDataFromApi).map(([quizId, quizData]) => {
            const coverage = getQuizAudioCoverage(quizId);
            const isExpanded = expandedQuizzes.has(quizId);
            const isChecking = checkingQuiz === quizId;

            return (
              <Card key={quizId}>
                <CardHeader
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => toggleQuiz(quizId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{quizData.name}</CardTitle>
                      <Badge
                        variant={
                          coverage.percentage === 100
                            ? "default"
                            : coverage.percentage >= 80
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {coverage.percentage}% ({coverage.available}/
                        {coverage.total})
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          checkQuizAudio(quizId);
                        }}
                        disabled={isChecking}
                      >
                        {isChecking ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Check All
                          </>
                        )}
                      </Button>
                      <Button variant="ghost" size="sm">
                        {isExpanded ? "Collapse" : "Expand"}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {quizData.description}
                  </p>
                </CardHeader>

                {isExpanded && (
                  <CardContent>
                    {loadingWords.has(quizId) ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading words...
                      </div>
                    ) : quizWords[quizId] ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {quizWords[quizId].map((pair, index) => {
                            const wordLog = audioLogs[quizId]?.[pair.word];
                            const isChecking = checkingWord === pair.word;

                            return (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex-1">
                                  <div className="font-medium">{pair.word}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {pair.wordA} vs {pair.wordB}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {wordLog ? (
                                    <>
                                      {wordLog.hasAudio ? (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            playAudio(pair.word, quizId)
                                          }
                                          disabled={playingAudio === pair.word}
                                        >
                                          {playingAudio === pair.word ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <Volume2 className="h-4 w-4" />
                                          )}
                                        </Button>
                                      ) : (
                                        <VolumeX className="h-4 w-4 text-red-500" />
                                      )}
                                      <div className="flex gap-1">
                                        {wordLog.hasAudio ? (
                                          <>
                                            {/* Handle both new format (audioSources array) and legacy format (audioSource string) */}
                                            {(wordLog.audioSources?.includes(
                                              "database"
                                            ) ||
                                              wordLog.audioSource ===
                                                "database") && (
                                              <Badge
                                                className="text-xs bg-green-500 hover:bg-green-600 text-white border-green-500"
                                                title="Audio from PostgreSQL database"
                                              >
                                                DB
                                              </Badge>
                                            )}
                                            {(wordLog.audioSources?.includes(
                                              "wiktionary"
                                            ) ||
                                              wordLog.audioSource ===
                                                "wiktionary") && (
                                              <Badge
                                                className="text-xs bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500"
                                                title="Audio from Wiktionary API"
                                              >
                                                API
                                              </Badge>
                                            )}
                                          </>
                                        ) : (
                                          <Badge
                                            variant="destructive"
                                            className="text-xs"
                                            title="No audio available"
                                          >
                                            Missing
                                          </Badge>
                                        )}
                                      </div>
                                      {/* Recheck button for individual words */}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          checkWordAudio(pair.word, quizId)
                                        }
                                        disabled={checkingWord === pair.word}
                                        title="Recheck audio for this word"
                                      >
                                        {checkingWord === pair.word ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <RefreshCw className="h-4 w-4" />
                                        )}
                                      </Button>
                                      {/* Debug button to show raw data */}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          console.log(
                                            `🔍 Debug data for word: "${pair.word}"`
                                          );
                                          console.log(
                                            `📋 Raw pair data:`,
                                            pair
                                          );
                                          console.log(
                                            `🗄️ Current audio log:`,
                                            wordLog
                                          );
                                        }}
                                        title="Show debug info in console"
                                      >
                                        🐛
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          checkWordAudio(pair.word, quizId)
                                        }
                                        disabled={isChecking}
                                      >
                                        {isChecking ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <RefreshCw className="h-4 w-4" />
                                        )}
                                      </Button>
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        Not Checked
                                      </Badge>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4 text-muted-foreground">
                        <p>No words loaded yet.</p>
                        <p className="text-sm mt-2">
                          Click "Check All" to load and check audio for all
                          words in this quiz.
                        </p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QuizAudioAdmin;
