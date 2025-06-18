import { useState, useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

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
  ],
  KIT: [
    "sick",
    "women",
    "it",
    "did",
    "if",
    "this",
    "myth",
    "business",
    "fish",
    "build",
    "building",
    "bit",
    "fit",
    "hit",
    "kit",
    "lit",
    "pit",
    "sit",
    "wit",
    "bid",
    "did",
    "hid",
    "kid",
    "lid",
    "rid",
    "big",
    "dig",
    "fig",
    "pig",
    "rig",
    "wig",
    "bin",
    "din",
    "fin",
    "gin",
    "pin",
    "sin",
    "tin",
    "win",
    "dip",
    "hip",
    "lip",
    "rip",
    "sip",
    "tip",
    "zip",
    "bird",
    "dirt",
    "first",
    "girl",
    "shirt",
    "skirt",
    "third",
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

export default function Quiz() {
  const router = useRouter();
  const [mode, setMode] = useState(null);
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
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setIncorrectIndices(new Set());
    setQuizComplete(false);
  };

  if (mode === null) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>FLEECE vs KIT Quiz</Text>
          <Text style={styles.subtitle}>Choose your quiz mode:</Text>
          <View style={styles.modeContainer}>
            <Pressable
              onPress={() => handleModeSelect("fixed")}
              style={styles.modeButton}
            >
              <Text style={styles.modeButtonTitle}>10 Questions</Text>
              <Text style={styles.modeButtonSubtitle}>
                Complete 10 questions and see your score
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleModeSelect("endless")}
              style={styles.modeButton}
            >
              <Text style={styles.modeButtonTitle}>Endless Mode</Text>
              <Text style={styles.modeButtonSubtitle}>
                Practice as many questions as you want
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((correctAnswers / 10) * 100);
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Quiz Complete!</Text>
          <Text style={styles.score}>
            Your Score: {correctAnswers}/10 ({percentage}%)
          </Text>
          <Text style={styles.feedback}>
            {percentage >= 80
              ? "Great job! You've mastered these lexical sets!"
              : percentage >= 60
              ? "Good work! Keep practicing to improve."
              : "Keep practicing! You'll get better with time."}
          </Text>
          <Pressable onPress={handleRetry} style={styles.primaryButton}>
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
          <Pressable
            onPress={() => router.back()}
            style={styles.secondaryButton}
          >
            <Text style={styles.buttonText}>Back to Lesson</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  const question = questions[currentQuestion];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.questionNumber}>
          {mode === "fixed" ? (
            <>Question {currentQuestion + 1} of 10</>
          ) : (
            <>Question {currentQuestion + 1}</>
          )}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width:
                  mode === "fixed"
                    ? `${((currentQuestion + 1) / 10) * 100}%`
                    : "0%",
              },
            ]}
          />
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            Which lexical set does the word "{question.word}" belong to?
          </Text>

          <View style={styles.optionsContainer}>
            {["FLEECE", "KIT"].map((option) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === question.correctAnswer;
              const showResult = selectedAnswer !== null;

              return (
                <Pressable
                  key={option}
                  onPress={() => handleAnswerSelect(option)}
                  style={[
                    styles.optionButton,
                    showResult && isCorrect && styles.correctOption,
                    showResult &&
                      isSelected &&
                      !isCorrect &&
                      styles.incorrectOption,
                    isSelected && !showResult && styles.selectedOption,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      showResult && isCorrect && styles.correctText,
                      showResult &&
                        isSelected &&
                        !isCorrect &&
                        styles.incorrectText,
                      isSelected && !showResult && styles.selectedText,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.scoreContainer}>
          <View>
            <Text style={styles.scoreLabel}>Correct</Text>
            <Text style={styles.correctScore}>{correctAnswers}</Text>
          </View>
          <View>
            <Text style={styles.scoreLabel}>Incorrect</Text>
            <Text style={styles.incorrectScore}>{incorrectAnswers}</Text>
          </View>
        </View>

        <Pressable onPress={() => router.back()} style={styles.secondaryButton}>
          <Text style={styles.buttonText}>Back to Lesson</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  modeContainer: {
    gap: 16,
  },
  modeButton: {
    backgroundColor: "#007AFF",
    padding: 24,
    borderRadius: 8,
  },
  modeButtonTitle: {
    color: "white",
    fontWeight: "600",
    fontSize: 18,
    marginBottom: 8,
  },
  modeButtonSubtitle: {
    color: "white",
    fontSize: 14,
  },
  questionNumber: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 32,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 4,
  },
  questionCard: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 8,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionText: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  selectedOption: {
    borderColor: "#007AFF",
    backgroundColor: "#EBF5FF",
  },
  correctOption: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  incorrectOption: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  optionText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#374151",
  },
  selectedText: {
    color: "#007AFF",
  },
  correctText: {
    color: "#10B981",
  },
  incorrectText: {
    color: "#EF4444",
  },
  scoreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  scoreLabel: {
    fontSize: 14,
    color: "#666",
  },
  correctScore: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10B981",
  },
  incorrectScore: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#EF4444",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  secondaryButton: {
    backgroundColor: "#6B7280",
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18,
  },
  score: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 16,
  },
  feedback: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
});
