import { useWavesurfer } from "@wavesurfer/react";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Button } from "core-frontend-web/src/components/ui/button";
import SpectrogramPlugin from "wavesurfer.js/dist/plugins/spectrogram.esm.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js";
import ZoomPlugin from "wavesurfer.js/dist/plugins/zoom.esm.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";

const WSTest = () => {
  const containerRef = useRef(null);
  const regionsRef = useRef(null);

  // Initialize the Regions plugin separately (following reference pattern)
  const regions = useMemo(() => RegionsPlugin.create(), []);

  const { wavesurfer, isPlaying, isReady, currentTime } = useWavesurfer({
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

  // Store regions reference for use in effects
  useEffect(() => {
    if (regions) {
      regionsRef.current = regions;
    }
  }, [regions]);

  const onPlayPause = useCallback(() => {
    wavesurfer?.playPause();
  }, [wavesurfer]);

  // Helper function for random colors
  const random = (min, max) => Math.random() * (max - min) + min;
  const randomColor = () =>
    `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;

  useEffect(() => {
    console.log("useEffect triggered:", { wavesurfer: !!wavesurfer, isReady });

    if (!wavesurfer || !isReady) {
      console.log("Wavesurfer not ready, skipping setup");
      return;
    }

    console.log("Setting up plugins and regions...");

    wavesurfer.registerPlugin(
      SpectrogramPlugin.create({
        labels: true,
        splitChannels: false,
        height: 100,
        colorScheme: "classic",
        frequencyMin: 0,
      })
    );

    // Get regions plugin instance (try both ref and from wavesurfer.plugins)
    const getRegions = () => {
      if (regionsRef.current) {
        console.log("Found regions via ref");
        return regionsRef.current;
      }
      // Fallback: find in wavesurfer plugins
      const found = wavesurfer.plugins.find(
        (p) => p.constructor.name === "Regions"
      );
      if (found) {
        console.log("Found regions via wavesurfer.plugins");
      } else {
        console.log(
          "Regions plugin not found. Available plugins:",
          wavesurfer.plugins.map((p) => p.constructor.name)
        );
      }
      return found;
    };

    // Enable drag selection (following reference pattern)
    const regionsInstance = getRegions();
    if (regionsInstance) {
      console.log("Enabling drag selection");
      regionsInstance.enableDragSelection({
        color: "rgba(255, 0, 0, 0.1)",
      });
    } else {
      console.warn("Regions instance not available for enableDragSelection");
    }

    // Add regions when audio is decoded (following reference pattern)
    const handleDecode = () => {
      console.log("handleDecode called");
      const regions = getRegions();
      if (!regions) {
        console.log("Regions plugin not available in handleDecode");
        return;
      }

      const duration = wavesurfer.getDuration();
      console.log("Decode/Ready event - duration:", duration);

      if (!duration || duration === 0) {
        console.log("No duration available yet");
        return;
      }

      // Create some example regions
      try {
        console.log("Adding example regions...");
        regions.addRegion({
          start: duration * 0.1,
          end: duration * 0.2,
          content: "Resize me",
          color: randomColor(),
          drag: false,
          resize: true,
        });

        regions.addRegion({
          start: duration * 0.25,
          end: duration * 0.3,
          content: "Drag me",
          color: randomColor(),
          resize: false,
        });

        // Add a marker (zero-length region)
        regions.addRegion({
          start: duration * 0.5,
          content: "Marker",
          color: randomColor(),
        });

        console.log("Example regions added successfully");
      } catch (error) {
        console.error("Error adding regions:", error);
      }
    };

    // Try multiple events - decode, ready, and loaded
    console.log("Attaching event listeners...");
    wavesurfer.on("decode", () => {
      console.log("decode event fired");
      handleDecode();
    });
    wavesurfer.on("ready", () => {
      console.log("ready event fired");
      handleDecode();
    });
    wavesurfer.on("loaded", () => {
      console.log("loaded event fired");
      handleDecode();
    });

    // Also try calling directly after a delay
    const timeoutId = setTimeout(() => {
      console.log("Timeout - trying to add regions directly");
      const duration = wavesurfer.getDuration();
      console.log("Duration in timeout:", duration);
      if (duration && duration > 0) {
        handleDecode();
      } else {
        console.log("Duration still not available after timeout");
      }
    }, 2000);

    // Region event listeners (following reference pattern)
    const regionsForEvents = getRegions();
    if (regionsForEvents) {
      regionsForEvents.on("region-updated", (region) => {
        console.log("Updated region", region);
      });

      regionsForEvents.on("region-clicked", (region, e) => {
        e.stopPropagation(); // prevent triggering a click on the waveform
        region.play(true);
        region.setOptions({ color: randomColor() });
      });

      regionsForEvents.on("region-in", (region) => {
        console.log("region-in", region);
      });

      regionsForEvents.on("region-out", (region) => {
        console.log("region-out", region);
      });
    }

    return () => {
      clearTimeout(timeoutId);
      wavesurfer.un("decode", handleDecode);
      wavesurfer.un("ready", handleDecode);
      wavesurfer.un("loaded", handleDecode);
    };
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
      <Button onClick={onPlayPause} className="cursor-pointer">
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
