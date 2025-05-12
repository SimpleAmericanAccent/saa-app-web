import { useState, useEffect } from "react";

// Cache for dictionary API audio URLs
const dictionaryAudioCache = new Map();

export const useWordAudio = () => {
  const [voices, setVoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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

  const playWord = async (word) => {
    setIsLoading(true);
    try {
      // Try dictionary API first
      if (await playDictionaryAudio(word)) {
        // Audio played successfully from dictionary
      }
      // Fallback to speech synthesis
      else {
        playWebSpeech(word);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { playWord, isLoading };
};
