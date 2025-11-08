/* eslint-disable react/prop-types */
import { useRef, useEffect } from "react";
import { useWavesurfer } from "@wavesurfer/react";
import Spectrogram from "wavesurfer.js/dist/plugins/spectrogram.esm.js";

/**
 * Simple test page for spectrogram functionality
 */
const SpectrogramTest = () => {
  const containerRef = useRef(null);
  const spectrogramPluginRef = useRef(null);

  // Test audio URL - you can change this to any audio file
  const testAudioUrl =
    "https://saaclientaudio.s3.us-east-2.amazonaws.com/test.mp3";
  // Use wavesurfer hook
  const { wavesurfer, isReady } = useWavesurfer({
    container: containerRef,
    url: testAudioUrl,
    height: 300,
    waveColor: "rgb(148, 163, 184)",
    progressColor: "rgb(59, 130, 246)",
    cursorColor: "rgb(239, 68, 68)",
    normalize: true,
    interact: true,
  });

  // Register spectrogram plugin after wavesurfer is ready
  useEffect(() => {
    if (!wavesurfer || !isReady) return;
    // Destroy existing plugin if it exists
    if (spectrogramPluginRef.current) {
      spectrogramPluginRef.current.destroy();
      spectrogramPluginRef.current = null;
    }

    try {
      const spectrogram = Spectrogram.create({
        labels: true,
        splitChannels: false,
        height: 300,
        colorScheme: "classic",
        // frequencyMax: 8000,
        frequencyMin: 0,
      });

      wavesurfer.registerPlugin(spectrogram);
      spectrogramPluginRef.current = spectrogram;
    } catch (error) {
      console.error("Error creating spectrogram plugin:", error);
    }

    // Cleanup on unmount
    return () => {
      if (spectrogramPluginRef.current) {
        console.log("Cleaning up spectrogram plugin");
        spectrogramPluginRef.current.destroy();
        spectrogramPluginRef.current = null;
      }
    };
  }, [wavesurfer, isReady]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "300px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        backgroundColor: "#000",
      }}
      onClick={() => wavesurfer.playPause()}
    />
  );
};

export default SpectrogramTest;
