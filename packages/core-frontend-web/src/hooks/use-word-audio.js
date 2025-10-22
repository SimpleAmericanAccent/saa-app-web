import { useState, useEffect } from "react";
import { getWiktionaryUSAudio } from "../utils/wiktionary-api.js";

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

      // Try Wiktionary API for US audio
      const audioUrl = await getWiktionaryUSAudio(word);

      if (audioUrl) {
        dictionaryAudioCache.set(word, audioUrl);
        const audio = new Audio(audioUrl);
        await audio.play();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Wiktionary API error:", error);
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
