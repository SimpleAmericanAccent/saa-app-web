/* eslint-disable react/prop-types */
import { useRef, useEffect } from "react";
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
      spectrogramPluginRef.current.destroy();
      spectrogramPluginRef.current = null;
    }

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

    // Cleanup on unmount
    return () => {
      if (spectrogramPluginRef.current) {
        spectrogramPluginRef.current.destroy();
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

    // Override wavesurfer's play/pause to prevent it from actually playing audio
    const originalPlay = wavesurfer.play.bind(wavesurfer);
    const originalPause = wavesurfer.pause.bind(wavesurfer);

    wavesurfer.play = () => {
      // Don't actually play wavesurfer's audio, just update visualization
      if (audioRef?.current && !audioRef.current.paused) {
        // Audio is already playing, just sync visualization
        return;
      }
      return originalPlay();
    };

    wavesurfer.pause = () => {
      // Don't actually pause wavesurfer's audio, just update visualization
      return originalPause();
    };
  }, [wavesurfer, audioRef]);

  // Sync: When user clicks/seeks on waveform → update audioRef
  useEffect(() => {
    if (!wavesurfer || !audioRef?.current) return;

    const handleSeek = () => {
      if (isSyncingRef.current) return; // Prevent feedback loop
      isSyncingRef.current = true;

      const seekTime = wavesurfer.getCurrentTime();
      if (audioRef.current) {
        audioRef.current.currentTime = seekTime;
      }

      setTimeout(() => {
        isSyncingRef.current = false;
      }, 100);
    };

    const handleInteraction = () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;

      const seekTime = wavesurfer.getCurrentTime();
      if (audioRef.current) {
        audioRef.current.currentTime = seekTime;
        if (audioRef.current.paused) {
          audioRef.current.play().catch(console.error);
        }
      }

      setTimeout(() => {
        isSyncingRef.current = false;
      }, 100);
    };

    wavesurfer.on("seek", handleSeek);
    wavesurfer.on("interaction", handleInteraction);

    return () => {
      wavesurfer.un("seek", handleSeek);
      wavesurfer.un("interaction", handleInteraction);
    };
  }, [wavesurfer, audioRef]);

  // Sync: When audioRef plays/updates → update wavesurfer visualization
  useEffect(() => {
    if (!wavesurfer || !audioRef?.current) return;

    const audio = audioRef.current;

    const handleAudioTimeUpdate = () => {
      if (isSyncingRef.current || !audio.duration) return;

      const seekTime = audio.currentTime / audio.duration;
      const currentSeek =
        wavesurfer.getCurrentTime() / wavesurfer.getDuration();

      // Only update if difference is significant to avoid feedback loop
      if (Math.abs(seekTime - currentSeek) > 0.02) {
        isSyncingRef.current = true;
        wavesurfer.seekTo(seekTime);

        setTimeout(() => {
          isSyncingRef.current = false;
        }, 50);
      }
    };

    // Update visualization when audio plays/pauses (but don't actually play wavesurfer)
    const handleAudioPlay = () => {
      if (isSyncingRef.current) return;
      const seekTime = audio.currentTime / audio.duration;
      wavesurfer.seekTo(seekTime);
    };

    const handleAudioPause = () => {
      // Just update visualization position
      if (isSyncingRef.current) return;
      const seekTime = audio.currentTime / audio.duration;
      wavesurfer.seekTo(seekTime);
    };

    audio.addEventListener("play", handleAudioPlay);
    audio.addEventListener("pause", handleAudioPause);
    audio.addEventListener("timeupdate", handleAudioTimeUpdate);

    return () => {
      audio.removeEventListener("play", handleAudioPlay);
      audio.removeEventListener("pause", handleAudioPause);
      audio.removeEventListener("timeupdate", handleAudioTimeUpdate);
    };
  }, [wavesurfer, audioRef]);

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
        <div
          ref={containerRef}
          className="w-full"
          style={{ height: "300px" }}
        />
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
