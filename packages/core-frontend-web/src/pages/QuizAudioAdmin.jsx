import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "core-frontend-web/src/components/ui/card";
import { Button } from "core-frontend-web/src/components/ui/button";
import { Badge } from "core-frontend-web/src/components/ui/badge";
import {
  Loader2,
  Volume2,
  VolumeX,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { QUIZ_TYPE_IDS } from "./Quiz";
import useAuthStore from "../stores/authStore";
import { fetchContrasts, fetchPairs } from "../utils/quizApi";

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
  const audioRef = useRef(null);

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

  // Check audio for a single word
  const checkWordAudio = async (word, quizType) => {
    setCheckingWord(word);
    try {
      const audioUrl = await getDictionaryAudio(word);
      const audioStatus = {
        word,
        quizType,
        hasAudio: !!audioUrl,
        audioUrl: audioUrl || null,
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

  // Check audio for all words in a quiz
  const checkQuizAudio = async (quizType) => {
    setCheckingQuiz(quizType);

    try {
      // Fetch pairs from API
      const pairs = await fetchPairs(quizType);
      if (!pairs || pairs.length === 0) return;

      const newLogs = { ...audioLogs };
      if (!newLogs[quizType]) {
        newLogs[quizType] = {};
      }

      // Check each word in the quiz
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        const audioUrl = await getDictionaryAudio(pair.word);

        newLogs[quizType][pair.word] = {
          word: pair.word,
          quizType,
          hasAudio: !!audioUrl,
          audioUrl: audioUrl || null,
          timestamp: new Date().toISOString(),
        };

        // Add a small delay to avoid overwhelming the API
        if (i < pairs.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      setAudioLogs(newLogs);
      localStorage.setItem("quizAudioLogs", JSON.stringify(newLogs));
    } catch (error) {
      console.error("Error checking quiz audio:", error);
    } finally {
      setCheckingQuiz(null);
    }
  };

  // Clear all audio logs
  const clearAllLogs = () => {
    localStorage.removeItem("quizAudioLogs");
    setAudioLogs({});
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
      const audioUrl = await getDictionaryAudio(word);
      if (audioUrl) {
        // Update the log with the audio URL
        const newLogs = { ...audioLogs };
        if (!newLogs[quizType]) {
          newLogs[quizType] = {};
        }
        newLogs[quizType][word] = {
          ...wordLog,
          hasAudio: true,
          audioUrl: audioUrl,
          timestamp: new Date().toISOString(),
        };
        setAudioLogs(newLogs);
        localStorage.setItem("quizAudioLogs", JSON.stringify(newLogs));

        // Play the audio
        playAudioUrl(audioUrl, word);
      }
      return;
    }

    // If we have audio URL in the log, play it
    if (wordLog.audioUrl) {
      playAudioUrl(wordLog.audioUrl, word);
    } else {
      // Fallback: try to get audio again
      const audioUrl = await getDictionaryAudio(word);
      if (audioUrl) {
        playAudioUrl(audioUrl, word);
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
    }
    setExpandedQuizzes(newExpanded);
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
                    <div className="text-center p-4 text-muted-foreground">
                      <p>
                        Word pairs are loaded dynamically from the database when
                        needed.
                      </p>
                      <p className="text-sm mt-2">
                        Use "Check All" to load and check audio for all words in
                        this quiz.
                      </p>
                    </div>
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
