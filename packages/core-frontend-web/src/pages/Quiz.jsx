import React, { useState, useRef, useEffect } from "react";
import { Button } from "core-frontend-web/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "core-frontend-web/src/components/ui/card";
import { Progress } from "core-frontend-web/src/components/ui/progress";
import { Play, Volume2, Loader2 } from "lucide-react";

// Minimal pairs data for FLEECE vs KIT vowels
const minimalPairsData = [
  // Basic minimal pairs with alternates
  [
    { word: "beat", alternates: ["beet"] },
    { word: "bit", alternates: [] },
  ],
  [
    { word: "seat", alternates: [] },
    { word: "sit", alternates: [] },
  ],
  [
    { word: "feel", alternates: [] },
    { word: "fill", alternates: [] },
  ],
  [
    { word: "meet", alternates: ["meat"] },
    { word: "mitt", alternates: [] },
  ],
  [
    { word: "deep", alternates: [] },
    { word: "dip", alternates: [] },
  ],
  [
    { word: "sleep", alternates: [] },
    { word: "slip", alternates: [] },
  ],
  [
    { word: "keep", alternates: [] },
    { word: "kip", alternates: [] },
  ],
  [
    { word: "sheep", alternates: [] },
    { word: "ship", alternates: [] },
  ],
  [
    { word: "cheap", alternates: [] },
    { word: "chip", alternates: [] },
  ],
  [
    { word: "leap", alternates: [] },
    { word: "lip", alternates: [] },
  ],
  [
    { word: "peek", alternates: ["peak", "pique"] },
    { word: "pick", alternates: ["pic"] },
  ],
  [
    { word: "seek", alternates: [] },
    { word: "sick", alternates: [] },
  ],
  [
    { word: "week", alternates: ["weak"] },
    { word: "wick", alternates: [] },
  ],
  [
    { word: "green", alternates: [] },
    { word: "grin", alternates: [] },
  ],
  [
    { word: "seen", alternates: ["scene"] },
    { word: "sin", alternates: [] },
  ],
  [
    { word: "teen", alternates: [] },
    { word: "tin", alternates: [] },
  ],
  [
    { word: "bean", alternates: [] },
    { word: "bin", alternates: ["been"] },
  ],
  [
    { word: "mean", alternates: [] },
    { word: "min", alternates: [] },
  ],
  [
    { word: "steal", alternates: ["steel"] },
    { word: "still", alternates: [] },
  ],
  [
    { word: "meal", alternates: [] },
    { word: "mill", alternates: ["mil"] },
  ],
  [
    { word: "heel", alternates: ["heal"] },
    { word: "hill", alternates: [] },
  ],
  [
    { word: "deal", alternates: [] },
    { word: "dill", alternates: [] },
  ],
  [
    { word: "peel", alternates: [] },
    { word: "pill", alternates: [] },
  ],
  [
    { word: "wheel", alternates: [] },
    { word: "will", alternates: [] },
  ],
  [
    { word: "steel", alternates: [] },
    { word: "still", alternates: [] },
  ],
  [
    { word: "beach", alternates: ["beech"] },
    { word: "bitch", alternates: [] },
  ],
  [
    { word: "reach", alternates: [] },
    { word: "rich", alternates: [] },
  ],
]
  .map(([fleeceData, kitData]) => [
    {
      word: fleeceData.word,
      options: [fleeceData.word, kitData.word],
      vowelType: "FLEECE",
      alternates: fleeceData.alternates,
    },
    {
      word: kitData.word,
      options: [fleeceData.word, kitData.word],
      vowelType: "KIT",
      alternates: kitData.alternates,
    },
  ])
  .flat();

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrls, setAudioUrls] = useState({
    dictionary: null,
    browserTTS: null,
  });
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const audioRef = useRef(null);

  // Initialize shuffled questions on component mount
  useEffect(() => {
    setShuffledQuestions(shuffleArray(minimalPairsData));
  }, []);

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
      setIsPlaying(false);

      setAudioUrls({ dictionary: null, browserTTS: null });
      getAudioForWord(currentQuestion.word);
    }
  }, [currentQuestionIndex, currentQuestion]);

  const playAudio = (source) => {
    // Stop any currently playing audio first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    speechSynthesis.cancel(); // Stop any TTS

    if (source === "browserTTS") {
      // Use browser's built-in speech synthesis
      const utterance = new SpeechSynthesisUtterance(currentQuestion.word);
      utterance.lang = "en-US";
      utterance.rate = 0.8; // Slightly slower for clarity
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } else {
      // Use audio element for dictionary audio
      const url = audioUrls[source];
      if (audioRef.current && url) {
        audioRef.current.src = url;
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (isAnswered) return; // Don't respond to keys when answered

      switch (event.key) {
        case "1":
          if (audioUrls.dictionary && !isPlaying && !isLoading) {
            playAudio("dictionary");
          }
          break;
        case "2":
          if (audioUrls.browserTTS && !isPlaying && !isLoading) {
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
  }, [isAnswered, audioUrls, isPlaying, isLoading, currentQuestion]);

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    console.error("Audio playback error");
    setIsPlaying(false);
  };

  const handleAnswerSelect = (answer) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

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
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
    setShuffledQuestions(shuffleArray(minimalPairsData));
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {score}/{shuffledQuestions.length}
              </p>
              <p className="text-muted-foreground">
                {score === shuffledQuestions.length
                  ? "Perfect! 🎉"
                  : score >= shuffledQuestions.length * 0.8
                  ? "Great job! 👍"
                  : score >= shuffledQuestions.length * 0.6
                  ? "Good effort! 💪"
                  : "Keep practicing! 📚"}
              </p>
            </div>
            <Button onClick={handleRestart} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render until questions are shuffled
  if (shuffledQuestions.length === 0) {
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
    <div className="h-[calc(100vh-var(--navbar-height))] bg-background flex items-center justify-center p-4 overflow-hidden">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            FLEECE vs KIT Minimal Pairs Quiz
          </CardTitle>
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 relative">
          {/* Audio Player */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-center">
              Listen to the word:
            </p>

            {/* Hidden audio element */}
            <audio
              ref={audioRef}
              onEnded={handleAudioEnded}
              onError={handleAudioError}
              className="hidden"
            />

            <div className="flex gap-3 justify-center">
              {/* US Native Audio */}
              <Button
                onClick={() => playAudio("dictionary")}
                disabled={isPlaying || isLoading || !audioUrls.dictionary}
                variant="outline"
                className={`flex items-center gap-2 px-4 py-2 ${
                  !audioUrls.dictionary && !isLoading ? "opacity-50" : ""
                }`}
                title="Press '1' to play US Native audio"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isPlaying ? (
                  <Volume2 className="h-4 w-4 animate-pulse" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isLoading
                  ? "Loading..."
                  : isPlaying
                  ? "Playing..."
                  : "US Native (1)"}
              </Button>

              {/* Browser TTS */}
              <Button
                onClick={() => playAudio("browserTTS")}
                disabled={isPlaying || isLoading || !audioUrls.browserTTS}
                variant="outline"
                className={`flex items-center gap-2 px-4 py-2 ${
                  !audioUrls.browserTTS && !isLoading ? "opacity-50" : ""
                }`}
                title="Press '2' to play Browser TTS"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isPlaying ? (
                  <Volume2 className="h-4 w-4 animate-pulse" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isLoading
                  ? "Loading..."
                  : isPlaying
                  ? "Playing..."
                  : "Browser TTS (2)"}
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
            <p className="text-sm text-muted-foreground">
              (FLEECE vowel: /iː/ vs KIT vowel: /ɪ/)
            </p>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
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
                const otherQuestion = minimalPairsData.find(
                  (q) => q.word === otherWord
                );
                optionAlternates = otherQuestion
                  ? otherQuestion.alternates
                  : [];
              }

              return (
                <Button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  variant={
                    selectedAnswer === option
                      ? isCorrect
                        ? "default"
                        : "destructive"
                      : "outline"
                  }
                  className="w-full h-12 text-lg relative"
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
                    {isAnswered && isCorrect && selectedAnswer !== option && (
                      <span>✅</span>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
