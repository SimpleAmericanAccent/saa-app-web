import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Play, Volume2 } from "lucide-react";

const VOWEL_SOUNDS_AUDIO_URL =
  "https://native-scga-audio.s3.us-east-2.amazonaws.com/2025+01+04+will+rosenberg+vowels+96+hz+h_d+b_d+b_t+frames.mp3";

// Map of vowel names to their example words in the audio file
const VOWEL_AUDIO_MAP = {
  FLEECE: "heed",
  KIT: "hid",
  DRESS: "head",
  TRAP: "had",
  STRUT: "HUD",
  LOT: "hawed",
  FOOT: "hood",
  GOOSE: "hooed",
  FACE: "hayed",
  PRICE: "hide",
  CHOICE: "hoyed",
  GOAT: "hoed",
  MOUTH: "how'd",
  TRAM: "ham", // TRAM uses "ham" for its audio
};

export function PhonemeCard({
  name,
  respelling,
  phonemic,
  phonetic,
  spellings = [],
  examples = [],
  type = "vowel", // or "consonant"
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timestampsData, setTimestampsData] = useState(null);
  const [audioCache, setAudioCache] = useState({});
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    if (type === "vowel") {
      // Load timestamps data for vowels
      fetch("/JSON/timestamps.json")
        .then((response) => response.json())
        .then((data) => setTimestampsData(data))
        .catch((error) => console.error("Error loading timestamps:", error));
    }
  }, [type]);

  // Group examples by spelling using direct index mapping
  const spellingExamples = spellings.reduce((acc, spelling, index) => {
    // Get example for this spelling at the same index
    if (examples[index]) {
      acc[spelling] = [examples[index]];
    }
    return acc;
  }, {});

  const playVowelSound = (word) => {
    if (!timestampsData || !timestampsData[word]) {
      console.error("No data for word:", word);
      return;
    }

    const audio = audioCache[0] || new Audio(VOWEL_SOUNDS_AUDIO_URL);
    if (!audioCache[0]) {
      setAudioCache({ 0: audio });
    }

    const wordData = timestampsData[word];
    console.log("Playing vowel sound for word:", word, "with data:", wordData);
    const duration = wordData.full.end - wordData.full.start;

    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Update audio position and play
    audio.currentTime = wordData.full.start;
    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
    });

    // Set new timeout and store its ID
    const newTimeoutId = setTimeout(() => {
      audio.pause();
    }, duration * 1000);

    setTimeoutId(newTimeoutId);
  };

  const speakWord = (word) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.8; // Slightly slower for clarity
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const hasAudio = type === "vowel" && VOWEL_AUDIO_MAP[name];

  return (
    <TooltipProvider delayDuration={700}>
      <Tooltip delayDuration={700}>
        <TooltipTrigger asChild>
          <Card
            className="cursor-pointer transition-all duration-200 hover:shadow-lg w-full max-w-[60px]"
            onClick={(e) => {
              e.stopPropagation();
              if (hasAudio) {
                playVowelSound(VOWEL_AUDIO_MAP[name]);
              } else if (examples.length > 0) {
                speakWord(examples[0]);
              }
            }}
          >
            <CardHeader className="p-0.5 flex items-center justify-center min-h-[32px]">
              <CardTitle className="text-sm leading-none py-0 flex items-center gap-0.5">
                {name}
                {hasAudio && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 cursor-pointer hover:bg-accent shrink-0 p-0 -mr-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      playVowelSound(VOWEL_AUDIO_MAP[name]);
                    }}
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        </TooltipTrigger>
        <TooltipContent className="max-w-[300px] p-3">
          <div className="space-y-2">
            {Object.entries(spellingExamples).map(([spelling, exs]) => (
              <div key={spelling} className="text-sm flex items-center gap-2">
                <span className="font-semibold">{spelling}:</span>
                <span className="flex-1">{exs[0]}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(exs[0]);
                  }}
                >
                  <Play className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
