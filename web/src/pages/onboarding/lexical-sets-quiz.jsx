// web/src/pages/onboarding/lexical-sets-quiz.jsx
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const WORD_SETS = {
  FLEECE: [
    "eat",
    "these",
    "seek",
    "heat",
    "keyed",
    "teen",
    "seen",
    "ski",
    "feet",
    "seat",
    "peek",
    "peak",
  ],
  KIT: ["it", "this", "sick", "hit", "kid", "tin", "sin", "fit", "sit", "pick"],
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
  const questions = useMemo(() => {
    const allWords = [...WORD_SETS.FLEECE, ...WORD_SETS.KIT];
    const shuffled = shuffleArray(allWords);
    return shuffled.slice(0, 10).map((word) => ({
      word,
      correctAnswer: WORD_SETS.FLEECE.includes(word) ? "FLEECE" : "KIT",
    }));
  }, []);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [incorrectIndices, setIncorrectIndices] = useState(new Set());
  const [quizComplete, setQuizComplete] = useState(false);

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
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setQuizComplete(true);
      }
    }, 1000);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (quizComplete) {
    const percentage = Math.round((correctAnswers / questions.length) * 100);

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
              Try Again
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
        <h1 className="text-3xl font-bold mb-4">FLEECE vs KIT Quiz</h1>

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
          Question {currentQuestion + 1} of {questions.length}
        </p>
        <Progress
          value={((currentQuestion + 1) / questions.length) * 100}
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
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-emerald-600 dark:text-emerald-500">
            Correct Answers
          </h3>
          <ul className="space-y-2">
            {currentQuestion > 0 &&
              questions.map((q, index) => {
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
            {currentQuestion > 0 &&
              questions.map((q, index) => {
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
    </div>
  );
}
