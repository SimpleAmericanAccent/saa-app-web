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
import { QUIZ_DATA, QUIZ_TYPE_IDS } from "./Quiz";
import useAuthStore from "../stores/authStore";

const QuizAudioAdmin = () => {
  const { isAdmin, isLoading: authLoading } = useAuthStore();
  const [audioLogs, setAudioLogs] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [expandedQuizzes, setExpandedQuizzes] = useState(new Set());
  const [checkingWord, setCheckingWord] = useState(null);
  const [checkingQuiz, setCheckingQuiz] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const audioRef = useRef(null);

  // Load audio logs from localStorage
  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem("quizAudioLogs") || "{}");
    setAudioLogs(logs);
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
    const quizData = QUIZ_DATA[quizType];
    if (!quizData || !quizData.pairs) return;

    try {
      const newLogs = { ...audioLogs };
      if (!newLogs[quizType]) {
        newLogs[quizType] = {};
      }

      // Check each word in the quiz
      for (let i = 0; i < quizData.pairs.length; i++) {
        const pair = quizData.pairs[i];
        const audioUrl = await getDictionaryAudio(pair.word);

        newLogs[quizType][pair.word] = {
          word: pair.word,
          quizType,
          hasAudio: !!audioUrl,
          audioUrl: audioUrl || null,
          timestamp: new Date().toISOString(),
        };

        // Add a small delay to avoid overwhelming the API
        if (i < quizData.pairs.length - 1) {
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
  const getQuizAudioCoverage = (quizData, quizType) => {
    if (!quizData || !quizData.pairs)
      return { available: 0, total: 0, percentage: 0 };

    const quizLogs = audioLogs[quizType] || {};
    let availableCount = 0;
    const totalWords = quizData.pairs.length;

    quizData.pairs.forEach((pair) => {
      if (quizLogs[pair.word] && quizLogs[pair.word].hasAudio) {
        availableCount++;
      }
    });

    return {
      available: availableCount,
      total: totalWords,
      percentage: Math.round((availableCount / totalWords) * 100),
    };
  };

  // Get overall audio coverage
  const getOverallCoverage = () => {
    const allWords = new Set();
    Object.values(QUIZ_DATA).forEach((quizData) => {
      quizData.pairs.forEach((pair) => {
        allWords.add(pair.word);
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
      percentage: Math.round((availableCount / totalWords) * 100),
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
        {Object.entries(QUIZ_DATA).map(([quizId, quizData]) => {
          const coverage = getQuizAudioCoverage(quizData, quizId);
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {quizData.pairs.map((pair, index) => {
                      const wordLog = audioLogs[quizId]?.[pair.word];
                      const isCheckingWord = checkingWord === pair.word;

                      return (
                        <div
                          key={`${quizId}-${index}`}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{pair.word}</span>
                            {pair.alternates && pair.alternates.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                ({pair.alternates.join(", ")})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {wordLog ? (
                              <>
                                {wordLog.hasAudio ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <button
                                      onClick={() =>
                                        playAudio(pair.word, quizId)
                                      }
                                      className={`p-1 rounded hover:bg-accent transition-colors ${
                                        playingAudio === pair.word
                                          ? "bg-accent"
                                          : ""
                                      }`}
                                      title="Click to play audio"
                                    >
                                      {playingAudio === pair.word ? (
                                        <Loader2 className="h-4 w-4 text-green-500 animate-spin" />
                                      ) : (
                                        <Volume2 className="h-4 w-4 text-green-500" />
                                      )}
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    <VolumeX className="h-4 w-4 text-red-500" />
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    checkWordAudio(pair.word, quizId)
                                  }
                                  disabled={isCheckingWord}
                                >
                                  {isCheckingWord ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-3 w-3" />
                                  )}
                                </Button>
                              </>
                            ) : (
                              <>
                                <div className="w-4 h-4 border-2 border-muted-foreground rounded-full" />
                                <button
                                  onClick={() => playAudio(pair.word, quizId)}
                                  className={`p-1 rounded hover:bg-accent transition-colors ${
                                    playingAudio === pair.word
                                      ? "bg-accent"
                                      : ""
                                  }`}
                                  title="Click to play audio (will check availability)"
                                >
                                  {playingAudio === pair.word ? (
                                    <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                                  ) : (
                                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    checkWordAudio(pair.word, quizId)
                                  }
                                  disabled={isCheckingWord}
                                >
                                  {isCheckingWord ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-3 w-3" />
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default QuizAudioAdmin;
