import { useState, useMemo } from "react";
import { Button } from "core-frontend-web/src/components/ui/button";
import { Card } from "core-frontend-web/src/components/ui/card";
import { Progress } from "core-frontend-web/src/components/ui/progress";
import { cn } from "core-frontend-web/src/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "core-frontend-web/src/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useQuizStore } from "core-frontend-web/src/stores/quiz-store";

const WORD_SETS = {
  FLEECE: [
    "beak",
    "geek",
    "leak",
    "meek",
    "peak",
    "peek",
    "reek",
    "seek",
    "week",
    "weak",
    "cheek",
    "bead",
    "keyed",
    "deed",
    "feed",
    "heed",
    "he'd",
    "lead",
    "mead",
    "need",
    "knead",
    "kneed",
    "peed",
    "read",
    "reed",
    "seed",
    "teed",
    "weed",
    "she'd",
    "beef",
    "leaf",
    "reef",
    "thief",
    "chief",
    "siege",
    "eel",
    "keel",
    "deal",
    "feel",
    "heal",
    "heel",
    "meal",
    "kneel",
    "Neal",
    "peel",
    "real",
    "reel",
    "seal",
    "teal",
    "veal",
    "wheel",
    "zeal",
    "beam",
    "deem",
    "ream",
    "seem",
    "seam",
    "teem",
    "team",
    "bean",
    "keen",
    "dean",
    "jeans",
    "gene",
    "lean",
    "lien",
    "mean",
    "seen",
    "scene",
    "teen",
    "wean",
    "sheen",
    "beep",
    "keep",
    "deep",
    "heap",
    "Jeep",
    "leap",
    "reap",
    "seep",
    "weep",
    "sheep",
    "cheap",
    "ear",
    "beer",
    "deer",
    "dear",
    "fear",
    "gear",
    "here",
    "hear",
    "jeer",
    "leer",
    "mere",
    "near",
    "pier",
    "peer",
    "rear",
    "sear",
    "tier",
    "tear",
    "year",
    "sheer",
    "shear",
    "cheer",
    "geese",
    "lease",
    "niece",
    "piece",
    "peace",
    "Reese",
    "cease",
    "eat",
    "beat",
    "beet",
    "feet",
    "feat",
    "heat",
    "meat",
    "meet",
    "neat",
    "Pete",
    "seat",
    "wheat",
    "sheet",
    "cheat",
    "eve",
    "leave",
    "peeve",
    "weave",
    "thieve",
    "ease",
    "bees",
    "keys",
    "fees",
    "he's",
    "Lee's",
    "knees",
    "peas",
    "pees",
    "sieze",
    "tease",
    "wheeze",
    "these",
    "she's",
    "cheese",
    "Keith",
    "teeth",
    "sheath",
    "seethe",
    "teethe",
    "sheathe",
    "quiche",
    "leash",
    "sheesh",
    "each",
    "beach",
    "beech",
    "peach",
    "reach",
    "teach",
  ],
  KIT: [
    "bib",
    "dibs",
    "fib",
    "jib",
    "nib",
    "rib",
    "ick",
    "kick",
    "hick",
    "lick",
    "Mick",
    "Nick",
    "pick",
    "Rick",
    "sick",
    "tick",
    "Vick",
    "wick",
    "thick",
    "chick",
    "bid",
    "kid",
    "did",
    "hid",
    "lid",
    "rid",
    "Sid",
    "if",
    "diff",
    "GIF",
    "riff",
    "whiff",
    "big",
    "dig",
    "fig",
    "gig",
    "jig",
    "pig",
    "rig",
    "cig",
    "ridge",
    "wig",
    "ill",
    "bill",
    "kill",
    "dill",
    "fill",
    "Phil",
    "gill",
    "hill",
    "Jill",
    "mill",
    "pill",
    "sill",
    "till",
    "will",
    "shill",
    "chill",
    "Kim",
    "dim",
    "him",
    "Jim",
    "gym",
    "limb",
    "rim",
    "sim",
    "Tim",
    "whim",
    "shim",
    "in",
    "bin",
    "been",
    "kin",
    "din",
    "fin",
    "gin",
    "Lynn",
    "min",
    "pin",
    "sin",
    "tin",
    "win",
    "thin",
    "shin",
    "chin",
    "Bing",
    "king",
    "ding",
    "ping",
    "ring",
    "sing",
    "wing",
    "zing",
    "thing",
    "kip",
    "dip",
    "hip",
    "gyp",
    "lip",
    "nip",
    "rip",
    "sip",
    "tip",
    "whip",
    "zip",
    "ship",
    "chip",
    "kiss",
    "diss",
    "hiss",
    "miss",
    "piss",
    "sis",
    "this",
    "it",
    "bit",
    "kit",
    "fit",
    "Git",
    "hit",
    "lit",
    "mitt",
    "pit",
    "writ",
    "sit",
    "Witt",
    "zit",
    "shit",
    "div",
    "give",
    "live",
    "sieve",
    "shiv",
    "is",
    "biz",
    "fizz",
    "his",
    "Lizz",
    "rizz",
    "whiz",
    "myth",
    "Sith",
    "with",
    "dish",
    "fish",
    "wish",
    "itch",
    "bitch",
    "ditch",
    "Fitch",
    "hitch",
    "Mitch",
    "pitch",
    "rich",
    "which",
    "witch",
  ],
};

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function LexicalSetsQuiz() {
  const { mode: storedMode, setMode: setStoredMode } = useQuizStore();
  const [mode, setMode] = useState(storedMode);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [incorrectIndices, setIncorrectIndices] = useState(new Set());
  const [quizComplete, setQuizComplete] = useState(false);

  const questions = useMemo(() => {
    const allWords = [...WORD_SETS.FLEECE, ...WORD_SETS.KIT];
    const shuffled = shuffleArray(allWords);
    return shuffled.map((word) => ({
      word,
      correctAnswer: WORD_SETS.FLEECE.includes(word) ? "FLEECE" : "KIT",
    }));
  }, []);

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);

    if (answer === questions[currentQuestion].correctAnswer) {
      setCorrectAnswers((prev) => prev + 1);
    } else {
      setIncorrectAnswers((prev) => prev + 1);
      setIncorrectIndices((prev) => new Set([...prev, currentQuestion]));
    }

    setTimeout(() => {
      if (mode === "fixed" && currentQuestion >= 9) {
        setQuizComplete(true);
      } else {
        // For endless mode or before question 10 in fixed mode
        setCurrentQuestion((prev) => (prev + 1) % questions.length);
        setSelectedAnswer(null);
      }
    }, 1000);
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setIncorrectIndices(new Set());
    setQuizComplete(false);
  };

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    setStoredMode(selectedMode);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setIncorrectIndices(new Set());
    setQuizComplete(false);
  };

  if (mode === null) {
    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-6 text-center">
            FLEECE vs KIT Quiz
          </h1>
          <p className="text-muted-foreground mb-8 text-center">
            Choose your quiz mode:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleModeSelect("fixed")}
              className="p-8 h-auto text-lg"
            >
              <div>
                <div className="font-semibold mb-2">10 Questions</div>
                <div className="text-sm text-muted-foreground">
                  Complete 10 questions and see your score
                </div>
              </div>
            </Button>
            <Button
              onClick={() => handleModeSelect("endless")}
              className="p-8 h-auto text-lg"
            >
              <div>
                <div className="font-semibold mb-2">Endless Mode</div>
                <div className="text-sm text-muted-foreground">
                  Practice as many questions as you want
                </div>
              </div>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((correctAnswers / 10) * 100);

    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <Card className="p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
            <div className="text-xl space-x-4">
              <span className="text-emerald-600 dark:text-emerald-500">
                ✓ {correctAnswers}
              </span>
              <span className="text-red-600 dark:text-red-500">
                ✗ {incorrectAnswers}
              </span>
              <span className="text-muted-foreground border-l pl-4">
                {percentage}% correct
              </span>
            </div>
            <Progress value={percentage} className="mt-4" />
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-emerald-600 dark:text-emerald-500">
                Correct Answers
              </h3>
              <ul className="space-y-2">
                {questions.map((q, index) => {
                  const isCorrect =
                    index < currentQuestion && !incorrectIndices.has(index);
                  if (!isCorrect) return null;
                  return (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-emerald-600 dark:text-emerald-500">
                        ✓
                      </span>
                      <span className="font-medium">{q.word}</span>
                      <span className="text-muted-foreground">→</span>
                      <span>{q.correctAnswer}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-500">
                Incorrect Answers
              </h3>
              <ul className="space-y-2">
                {questions.map((q, index) => {
                  const isIncorrect = incorrectIndices.has(index);
                  if (!isIncorrect) return null;
                  return (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-red-600 dark:text-red-500">✗</span>
                      <span className="font-medium">{q.word}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="line-through mr-2">
                        {q.correctAnswer === "FLEECE" ? "KIT" : "FLEECE"}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-500">
                        {q.correctAnswer}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="text-center">
            <Button onClick={handleRetry} size="lg">
              Play Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const totalAnswered = correctAnswers + incorrectAnswers;

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">FLEECE vs KIT Quiz</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                {mode === "fixed" ? "10 Questions" : "Endless Mode"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  if (mode !== "fixed") {
                    handleModeSelect("fixed");
                  }
                }}
              >
                10 Questions
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (mode !== "endless") {
                    handleModeSelect("endless");
                  }
                }}
              >
                Endless Mode
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Score display */}
        <div className="mb-4 text-lg">
          <div className="flex items-center gap-4">
            <span className="text-emerald-600 dark:text-emerald-500">
              ✓ {correctAnswers}
            </span>
            <span className="text-red-600 dark:text-red-500">
              ✗ {incorrectAnswers}
            </span>
            <span className="text-muted-foreground border-l pl-4">
              {totalAnswered > 0
                ? `${Math.round(
                    (correctAnswers / totalAnswered) * 100
                  )}% correct`
                : "0% correct"}
            </span>
          </div>
        </div>

        <p className="text-muted-foreground">
          {mode === "fixed" ? (
            <>Question {currentQuestion + 1} of 10</>
          ) : (
            <>Question {currentQuestion + 1}</>
          )}
        </p>
        <Progress
          value={mode === "fixed" ? ((currentQuestion + 1) / 10) * 100 : 0}
          className="mt-2"
        />
      </div>

      <Card className="p-6 mb-8">
        <h2 className="text-xl mb-6 text-center">
          Which lexical set does the word "{question.word}" belong to?
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {["FLEECE", "KIT"].map((option) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === question.correctAnswer;

            return (
              <Button
                key={option}
                onClick={() => handleAnswerSelect(option)}
                disabled={selectedAnswer !== null}
                data-state={
                  selectedAnswer === null
                    ? "default"
                    : (isSelected && isCorrect) || (!isSelected && isCorrect)
                    ? "correct"
                    : isSelected
                    ? "incorrect"
                    : "default"
                }
                className={cn(
                  "p-4 h-auto text-lg transition-all duration-200 cursor-pointer",
                  "data-[state=default]:border-2 data-[state=default]:hover:scale-105 data-[state=default]:hover:border-primary",
                  "data-[state=default]:hover:shadow-[0_0_20px_rgba(var(--primary),0.5)]",
                  "data-[state=correct]:bg-emerald-600 dark:data-[state=correct]:bg-emerald-600 data-[state=correct]:text-white",
                  "data-[state=incorrect]:bg-red-600 dark:data-[state=incorrect]:bg-red-600 data-[state=incorrect]:text-white"
                )}
              >
                {option}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Running list of answers */}
      {totalAnswered > 0 && (
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-emerald-600 dark:text-emerald-500">
              Correct Answers
            </h3>
            <ul className="space-y-2">
              {questions.map((q, index) => {
                const isCorrect =
                  index < currentQuestion && !incorrectIndices.has(index);
                if (!isCorrect) return null;
                return (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-emerald-600 dark:text-emerald-500">
                      ✓
                    </span>
                    <span className="font-medium">{q.word}</span>
                    <span className="text-muted-foreground">→</span>
                    <span>{q.correctAnswer}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-500">
              Incorrect Answers
            </h3>
            <ul className="space-y-2">
              {questions.map((q, index) => {
                const isIncorrect = incorrectIndices.has(index);
                if (!isIncorrect) return null;
                return (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-red-600 dark:text-red-500">✗</span>
                    <span className="font-medium">{q.word}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="line-through mr-2">
                      {q.correctAnswer === "FLEECE" ? "KIT" : "FLEECE"}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-500">
                      {q.correctAnswer}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
