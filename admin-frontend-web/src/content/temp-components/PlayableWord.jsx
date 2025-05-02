import { useState, useEffect } from "react";

const audioUrl =
  "https://native-scga-audio.s3.us-east-2.amazonaws.com/2025+01+04+will+rosenberg+vowels+96+hz+h_d+b_d+b_t+frames.mp3";

// Cache for dictionary API audio URLs
const dictionaryAudioCache = new Map();

export const PlayableWord = ({ word, isInline = false, onClick }) => {
  const [audioCache, setAudioCache] = useState({});
  const [timeoutId, setTimeoutId] = useState(null);
  const [timestampsData, setTimestampsData] = useState(null);
  const [voices, setVoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load timestamps data
    fetch("/JSON/timestamps.json")
      .then((response) => response.json())
      .then((data) => setTimestampsData(data))
      .catch((error) => console.error("Error loading timestamps:", error));

    // Initialize voices for fallback
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const getBestVoice = () => {
    const preferredVoices = [
      "Google US English",
      "Microsoft Steffan",
      "Microsoft David",
      "Samantha",
      "Alex",
    ];

    for (const preferredVoice of preferredVoices) {
      const voice = voices.find((v) => v.name.includes(preferredVoice));
      if (voice) return voice;
    }

    return voices.find(
      (voice) =>
        voice.lang.includes("en-US") &&
        !voice.name.toLowerCase().includes("microsoft zira")
    );
  };

  const playDictionaryAudio = async (word) => {
    try {
      // Check cache first
      if (dictionaryAudioCache.has(word)) {
        const audio = new Audio(dictionaryAudioCache.get(word));
        await audio.play();
        return true;
      }

      // Try dictionary API
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
      const data = await response.json();

      if (data[0]?.phonetics?.length > 0) {
        // Find first US English audio
        const usPhonetic = data[0].phonetics.find(
          (p) =>
            p.audio &&
            (p.audio.includes("_us_") ||
              p.audio.includes("en_us") ||
              p.audio.includes("-us.") ||
              p.audio.includes("/us/"))
        );

        if (usPhonetic?.audio) {
          dictionaryAudioCache.set(word, usPhonetic.audio);
          const audio = new Audio(usPhonetic.audio);
          await audio.play();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Dictionary API error:", error);
      return false;
    }
  };

  const playWebSpeech = (word) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";

    const bestVoice = getBestVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.text = `${word}.`;

    window.speechSynthesis.speak(utterance);
  };

  const handlePlayAudio = async (word) => {
    setIsLoading(true);
    try {
      // First try: timestamp data (original audio)
      if (timestampsData && timestampsData[word]) {
        const audio = audioCache[0] || new Audio(audioUrl);
        if (!audioCache[0]) {
          setAudioCache({ 0: audio });
        }

        const wordData = timestampsData[word];
        const duration = wordData.full.end - wordData.full.start;

        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        audio.currentTime = wordData.full.start;
        audio.play();

        const newTimeoutId = setTimeout(() => {
          audio.pause();
        }, duration * 1000);

        setTimeoutId(newTimeoutId);
      }
      // Second try: dictionary API
      else if (await playDictionaryAudio(word)) {
        // Audio played successfully from dictionary
      }
      // Last resort: speech synthesis
      else {
        playWebSpeech(word);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={(e) => {
        handlePlayAudio(word);
        onClick?.(e); // Call the passed onClick handler if it exists
      }}
      disabled={isLoading}
      className={`cursor-pointer hover:bg-accent/50 inline-flex items-center gap-2 ${
        isInline ? "p-0 hover:underline" : "p-2"
      }`}
    >
      <span className={`text-muted-foreground ${isInline ? "text-sm" : ""}`}>
        {isLoading ? "⏳" : "🔊"}
      </span>
      {word}
    </button>
  );
};

export default PlayableWord;
