import { useWavesurfer } from "@wavesurfer/react";
import { useMemo, useRef, useEffect } from "react";
import { Button } from "core-frontend-web/src/components/ui/button";
import SpectrogramPlugin from "wavesurfer.js/dist/plugins/spectrogram.esm.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js";
import ZoomPlugin from "wavesurfer.js/dist/plugins/zoom.esm.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";

// Sample transcript JSON for testing
const SAMPLE_TRANSCRIPT = [
  { word: "Hello", start: 0.5 },
  { word: "world", start: 1.0, end: 1.4 },
  { word: "[Section 1]", start: 2.0 },
  { word: "This", start: 2.5, end: 2.7 },
  { word: "is", start: 2.8, end: 3.0 },
  { word: "a", start: 3.1, end: 3.2 },
  { word: "test", start: 3.3, end: 3.7 },
  { word: "[Marker]", start: 4.0 },
  { word: "Another", start: 4.5, end: 4.9 },
  { word: "word", start: 5.0, end: 5.3 },
];

const WSTest = () => {
  const containerRef = useRef(null);
  const regions = useMemo(() => RegionsPlugin.create(), []);

  const { wavesurfer, isPlaying, isReady } = useWavesurfer({
    container: containerRef,
    height: 100,
    waveColor: "rgb(200, 0, 200)",
    progressColor: "rgb(100, 0, 100)",
    url: "https://saaclientaudio.s3.us-east-2.amazonaws.com/test.mp3",
    plugins: useMemo(
      () => [TimelinePlugin.create(), ZoomPlugin.create(), regions],
      [regions]
    ),
  });

  useEffect(() => {
    if (!wavesurfer || !isReady || !regions) return;

    wavesurfer.registerPlugin(
      SpectrogramPlugin.create({
        labels: true,
        splitChannels: false,
        height: 100,
        colorScheme: "classic",
        frequencyMin: 0,
      })
    );

    regions.enableDragSelection({ color: "rgba(255, 0, 0, 0.2)" });

    // Create regions from sample transcript
    const createRegionsFromTranscript = () => {
      if (!regions) return;

      // Clear existing regions
      regions.clearRegions();

      // Create regions/markers for each word with a start time
      SAMPLE_TRANSCRIPT.forEach((wordObj) => {
        const start = wordObj.start;
        if (start === undefined || start === null) return;

        const word = wordObj.word || "";
        const end = wordObj.end;

        // If end time is present, create a region; otherwise create a marker
        if (end !== undefined && end !== null) {
          regions.addRegion({
            start: start,
            end: end,
            content: word,
            color: "rgba(0, 123, 255, 0.2)", // Blue for regions
            drag: false,
            resize: false,
          });
        } else {
          regions.addRegion({
            start: start,
            content: word,
            color: "rgba(255, 165, 0, 0.5)", // Orange for markers
          });
        }
      });
    };

    regions.on("region-clicked", (region, e) => {
      e.stopPropagation();
      region.play(true);
    });

    const duration = wavesurfer.getDuration();
    if (duration) {
      createRegionsFromTranscript();
    } else {
      const timeoutId = setTimeout(() => {
        createRegionsFromTranscript();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [wavesurfer, isReady, regions]);

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
      const delta = (e.deltaX || e.deltaY) * 5;
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

  return (
    <>
      <div ref={containerRef} />
      <Button
        onClick={() => wavesurfer?.playPause()}
        className="cursor-pointer"
      >
        {isPlaying ? "Pause" : "Play"}
      </Button>
      <div className="text-xs text-muted-foreground mt-2 space-y-1">
        <div>Shift + Scroll to pan left/right</div>
        <div>Click and drag to create regions</div>
      </div>
    </>
  );
};

export default WSTest;
