import { useState, useEffect } from "react";

const useAudioSync = (audioRef) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);

    audio.addEventListener("timeupdate", handleTimeUpdate);

    // Set initial time in case audio is already playing
    setCurrentTime(audio.currentTime);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [audioRef.current]);

  return currentTime;
};

export default useAudioSync;
