/* eslint-disable react/prop-types */
import { useRef, useEffect, useCallback, useMemo, memo } from "react";
import { useWavesurfer } from "@wavesurfer/react";
import SpectrogramPlugin from "wavesurfer.js/dist/plugins/spectrogram.esm.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js";
import ZoomPlugin from "wavesurfer.js/dist/plugins/zoom.esm.js";
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
  const isSyncingRef = useRef(false);

  const { wavesurfer, isReady, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    url: mp3url,
    height: 20,
    waveColor: "red",
    progressColor: "rgb(59, 130, 246)",
    cursorColor: "rgb(239, 68, 68)",
    interact: true,
    normalize: true,
    plugins: useMemo(() => [TimelinePlugin.create(), ZoomPlugin.create()], []),
  });

  useEffect(() => {
    if (wavesurfer && isReady) {
      wavesurfer.registerPlugin(
        SpectrogramPlugin.create({
          labels: true,
          splitChannels: false,
          height: 100,
          colorScheme: "classic",
          frequencyMin: 0,
        })
      );
    }
  }, [wavesurfer, isReady]);

  // Shift+scroll to pan left/right
  useEffect(() => {
    if (!wavesurfer || !isReady) return;

    const scrollContainer = wavesurfer.getWrapper()?.parentElement;
    if (!scrollContainer) return;

    const handleWheel = (e) => {
      if (!e.shiftKey) return;

      e.preventDefault();
      e.stopPropagation();

      // Use deltaX (horizontal) or deltaY (vertical) for panning
      const delta = (e.deltaX || e.deltaY) * 2;
      scrollContainer.scrollLeft = Math.max(
        0,
        Math.min(
          scrollContainer.scrollWidth - scrollContainer.clientWidth,
          scrollContainer.scrollLeft + delta
        )
      );
    };

    scrollContainer.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    });

    return () => {
      scrollContainer.removeEventListener("wheel", handleWheel, {
        capture: true,
      });
    };
  }, [wavesurfer, isReady]);

  // Single sync function - wavesurfer to audio
  const syncWavesurferToAudio = useCallback(() => {
    if (isSyncingRef.current || !wavesurfer || !audioRef?.current) return;

    isSyncingRef.current = true;
    const seekTime = wavesurfer.getCurrentTime();

    if (seekTime !== undefined && !isNaN(seekTime)) {
      audioRef.current.currentTime = seekTime;
    }

    // Simple timeout instead of requestAnimationFrame
    setTimeout(() => {
      isSyncingRef.current = false;
    }, 0);
  }, [wavesurfer, audioRef]);

  // Single sync function - audio to wavesurfer
  const syncAudioToWavesurfer = useCallback(() => {
    if (isSyncingRef.current || !wavesurfer || !audioRef?.current) return;

    const audio = audioRef.current;
    if (!audio.duration || audio.duration === 0) return;

    isSyncingRef.current = true;
    wavesurfer.seekTo(audio.currentTime / audio.duration);
    isSyncingRef.current = false;
  }, [wavesurfer, audioRef]);

  // Single useEffect for wavesurfer events
  useEffect(() => {
    if (!wavesurfer) return;

    wavesurfer.on("seek", syncWavesurferToAudio);
    wavesurfer.on("interaction", syncWavesurferToAudio);

    return () => {
      wavesurfer.un("seek", syncWavesurferToAudio);
      wavesurfer.un("interaction", syncWavesurferToAudio);
    };
  }, [wavesurfer, syncWavesurferToAudio]);

  // Single useEffect for audio events
  useEffect(() => {
    if (!audioRef?.current) return;

    const audio = audioRef.current;
    audio.addEventListener("timeupdate", syncAudioToWavesurfer);
    audio.addEventListener("play", syncAudioToWavesurfer);
    audio.addEventListener("pause", syncAudioToWavesurfer);

    return () => {
      audio.removeEventListener("timeupdate", syncAudioToWavesurfer);
      audio.removeEventListener("play", syncAudioToWavesurfer);
      audio.removeEventListener("pause", syncAudioToWavesurfer);
    };
  }, [audioRef, syncAudioToWavesurfer]);

  // TODO: Add word markers overlay when ready
  // TODO: Add playback position indicator when ready

  return (
    <div className={cn("border rounded-lg bg-background overflow-hidden")}>
      <div className="flex items-center justify-between p-2 border-b bg-muted/30">
        <h3 className="text-sm font-semibold">Spectrogram Editor</h3>
      </div>
      <div className="p-2">
        <div ref={containerRef} />
        <div className="text-xs text-muted-foreground mt-2 px-2">
          {!isReady
            ? "Loading spectrogram..."
            : "Spectrogram view. Click to seek, scroll to zoom, Shift+scroll to pan."}
        </div>
      </div>
    </div>
  );
};

// Memoize component to prevent re-renders from parent state changes
// Only re-render when props that actually affect the component change
export default memo(WaveformEditor, (prevProps, nextProps) => {
  // Re-render if these props change
  if (prevProps.mp3url !== nextProps.mp3url) return false;
  if (prevProps.annotatedTranscript !== nextProps.annotatedTranscript)
    return false;
  if (prevProps.draftTranscript !== nextProps.draftTranscript) return false;
  if (prevProps.audioRef !== nextProps.audioRef) return false;

  // Functions are usually stable, but compare them anyway
  if (prevProps.onDraftUpdate !== nextProps.onDraftUpdate) return false;
  if (prevProps.onClose !== nextProps.onClose) return false;

  // Return true to skip re-render (props are equal)
  return true;
});
