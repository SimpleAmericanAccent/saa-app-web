import { useState, useEffect } from "react";

const useAudioSync = (audioRef) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let animationFrameId;

    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        animationFrameId = requestAnimationFrame(updateTime);
      }
    };

    if (audioRef.current) {
      animationFrameId = requestAnimationFrame(updateTime);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [audioRef]);

  return currentTime;
};

export default useAudioSync;
