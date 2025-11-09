/* eslint-disable react/prop-types */
import { useRef, useEffect, useCallback, useMemo } from "react";
import { useWavesurfer } from "@wavesurfer/react";
import Spectrogram from "wavesurfer.js/dist/plugins/spectrogram.esm.js";
import { cn } from "core-frontend-web/src/lib/utils";
import { Button } from "core-frontend-web/src/components/ui/button";
import { X } from "lucide-react";

/**
 * Waveform Editor Component - Spectrogram Version
 * Displays audio spectrogram with word markers
 */
const WaveformEditor = ({
  mp3url,
  annotatedTranscript,
  draftTranscript,
  onDraftUpdate,
  onClose,
  audioRef,
}) => {
  const containerRef = useRef(null);
  const isSyncingRef = useRef(false); // Prevent feedback loops
  const spectrogramPluginRef = useRef(null);
  const isMountedRef = useRef(true); // Track mount status for requestAnimationFrame

  // Use wavesurfer hook - visualization only
  const { wavesurfer, isReady, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    url: mp3url,
    height: 100,
    // Hide waveform, show spectrogram instead
    waveColor: "red",
    progressColor: "rgb(59, 130, 246)", // blue-500 - visible in both modes
    cursorColor: "rgb(239, 68, 68)", // red-500 - visible in both modes
    normalize: true,
    interact: true, // Enable click-to-seek
  });

  // Register spectrogram plugin after wavesurfer is ready
  useEffect(() => {
    if (!wavesurfer || !isReady) return;

    // Destroy existing plugin if it exists
    if (spectrogramPluginRef.current) {
      try {
        spectrogramPluginRef.current.destroy();
      } catch (error) {
        console.warn("Error destroying existing spectrogram:", error);
      }
      spectrogramPluginRef.current = null;
    }

    try {
      // Create and register spectrogram plugin
      const spectrogram = Spectrogram.create({
        labels: true,
        splitChannels: false,
        height: 100,
        colorScheme: "classic", // Classic color scheme works well in both light/dark
        //   frequencyMax: 1000,
        frequencyMin: 0,
      });

      wavesurfer.registerPlugin(spectrogram);
      spectrogramPluginRef.current = spectrogram;
    } catch (error) {
      console.error("Error creating spectrogram plugin:", error);
      // Optionally show user-friendly error message
    }

    // Cleanup on unmount
    return () => {
      if (spectrogramPluginRef.current) {
        try {
          spectrogramPluginRef.current.destroy();
        } catch (error) {
          console.warn("Error cleaning up spectrogram:", error);
        }
        spectrogramPluginRef.current = null;
      }
    };
  }, [wavesurfer, isReady]);

  // Disable wavesurfer's built-in audio playback - we only want visualization
  useEffect(() => {
    if (!wavesurfer) return;

    // Mute wavesurfer's audio element so it doesn't play sound
    const media = wavesurfer.getMediaElement();
    if (media) {
      media.muted = true;
      media.volume = 0;
    }

    // Intercept play/pause events instead of overriding methods
    const handleWavesurferPlay = () => {
      // If external audio is already playing, don't let wavesurfer play
      if (audioRef?.current && !audioRef.current.paused) {
        wavesurfer.pause(); // Immediately pause if audio is playing
      }
    };

    const handleWavesurferPause = () => {
      // Allow pause, just sync visualization
      if (audioRef?.current && !audioRef.current.paused) {
        // Don't pause external audio, just update visualization
      }
    };

    wavesurfer.on("play", handleWavesurferPlay);
    wavesurfer.on("pause", handleWavesurferPause);

    return () => {
      wavesurfer.un("play", handleWavesurferPlay);
      wavesurfer.un("pause", handleWavesurferPause);
    };
  }, [wavesurfer, audioRef]);

  // Memoized event handlers using useCallback
  const handleSeek = useCallback(() => {
    if (isSyncingRef.current || !wavesurfer || !audioRef?.current) return;

    try {
      isSyncingRef.current = true;
      const seekTime = wavesurfer.getCurrentTime();

      if (seekTime !== undefined && !isNaN(seekTime) && audioRef.current) {
        audioRef.current.currentTime = seekTime;
      }

      // Use requestAnimationFrame with mount check
      requestAnimationFrame(() => {
        if (isMountedRef.current) {
          isSyncingRef.current = false;
        }
      });
    } catch (error) {
      console.warn("Error in handleSeek:", error);
      isSyncingRef.current = false;
    }
  }, [wavesurfer, audioRef]);

  const handleInteraction = useCallback(() => {
    if (isSyncingRef.current || !wavesurfer || !audioRef?.current) return;

    try {
      isSyncingRef.current = true;
      const seekTime = wavesurfer.getCurrentTime();

      if (seekTime !== undefined && !isNaN(seekTime) && audioRef.current) {
        audioRef.current.currentTime = seekTime;
        if (audioRef.current.paused) {
          audioRef.current.play().catch(console.error);
        }
      }

      // Use requestAnimationFrame with mount check
      requestAnimationFrame(() => {
        if (isMountedRef.current) {
          isSyncingRef.current = false;
        }
      });
    } catch (error) {
      console.warn("Error in handleInteraction:", error);
      isSyncingRef.current = false;
    }
  }, [wavesurfer, audioRef]);

  // Register wavesurfer event listeners
  useEffect(() => {
    if (!wavesurfer || !audioRef?.current) return;

    wavesurfer.on("seek", handleSeek);
    wavesurfer.on("interaction", handleInteraction);

    return () => {
      wavesurfer.un("seek", handleSeek);
      wavesurfer.un("interaction", handleInteraction);
    };
  }, [wavesurfer, audioRef, handleSeek, handleInteraction]);

  // Memoized audio event handlers
  const handleAudioTimeUpdate = useCallback(() => {
    if (isSyncingRef.current || !wavesurfer || !audioRef?.current) return;

    const audio = audioRef.current;

    // Validate duration before division
    if (!audio.duration || audio.duration === 0 || isNaN(audio.duration))
      return;

    try {
      const seekTime = audio.currentTime / audio.duration;
      const currentTime = wavesurfer.getCurrentTime();
      const duration = wavesurfer.getDuration();

      // Validate wavesurfer duration
      if (!duration || duration === 0 || isNaN(duration)) return;

      const currentSeek = currentTime / duration;

      // Only update if difference is significant to avoid feedback loop
      if (Math.abs(seekTime - currentSeek) > 0.02) {
        isSyncingRef.current = true;
        wavesurfer.seekTo(seekTime);

        // Use requestAnimationFrame with mount check
        requestAnimationFrame(() => {
          if (isMountedRef.current) {
            isSyncingRef.current = false;
          }
        });
      }
    } catch (error) {
      console.warn("Error in handleAudioTimeUpdate:", error);
      isSyncingRef.current = false;
    }
  }, [wavesurfer, audioRef]);

  const handleAudioPlay = useCallback(() => {
    if (isSyncingRef.current || !wavesurfer || !audioRef?.current) return;

    const audio = audioRef.current;

    // Validate duration before division
    if (!audio.duration || audio.duration === 0 || isNaN(audio.duration))
      return;

    try {
      const seekTime = audio.currentTime / audio.duration;
      wavesurfer.seekTo(seekTime);
    } catch (error) {
      console.warn("Error in handleAudioPlay:", error);
    }
  }, [wavesurfer, audioRef]);

  const handleAudioPause = useCallback(() => {
    if (isSyncingRef.current || !wavesurfer || !audioRef?.current) return;

    const audio = audioRef.current;

    // Validate duration before division
    if (!audio.duration || audio.duration === 0 || isNaN(audio.duration))
      return;

    try {
      const seekTime = audio.currentTime / audio.duration;
      wavesurfer.seekTo(seekTime);
    } catch (error) {
      console.warn("Error in handleAudioPause:", error);
    }
  }, [wavesurfer, audioRef]);

  // Register audio event listeners
  useEffect(() => {
    if (!wavesurfer || !audioRef?.current) return;

    const audio = audioRef.current;

    audio.addEventListener("play", handleAudioPlay);
    audio.addEventListener("pause", handleAudioPause);
    audio.addEventListener("timeupdate", handleAudioTimeUpdate);

    return () => {
      audio.removeEventListener("play", handleAudioPlay);
      audio.removeEventListener("pause", handleAudioPause);
      audio.removeEventListener("timeupdate", handleAudioTimeUpdate);
    };
  }, [
    wavesurfer,
    audioRef,
    handleAudioPlay,
    handleAudioPause,
    handleAudioTimeUpdate,
  ]);

  // Track mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Memoize style object to prevent recreation on every render
  const containerStyle = useMemo(() => ({ height: "300px" }), []);

  // TODO: Add word markers overlay when ready
  // TODO: Add zoom/pan controls when ready
  // TODO: Add playback position indicator when ready

  return (
    <div className={cn("border rounded-lg bg-background overflow-hidden")}>
      <div className="flex items-center justify-between p-2 border-b bg-muted/30">
        <h3 className="text-sm font-semibold">Spectrogram Editor</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-2">
        <div ref={containerRef} className="w-full" style={containerStyle} />
        <div className="text-xs text-muted-foreground mt-2 px-2">
          {!isReady
            ? "Loading spectrogram..."
            : "Spectrogram view. Click to seek, drag word markers to adjust timing."}
        </div>
      </div>
    </div>
  );
};

export default WaveformEditor;
