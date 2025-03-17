import { useEffect, useRef, useState, useCallback } from "react";

const VOWEL_SYMBOLS = [
  { symbol: "FLEECE", F1: 350, F2: 2030 },
  // { symbol: "o", F1: 500, F2: 800 },
  { symbol: "GOOSE", F1: 350, F2: 800 },
  { symbol: "TRAP", F1: 700, F2: 1700 },
  { symbol: "schwa", F1: 525, F2: 1200 },
  { symbol: "KIT", F1: 410, F2: 1800 },
  { symbol: "DRESS", F1: 630, F2: 1760 },
  { symbol: "STRUT", F1: 600, F2: 1200 },
  { symbol: "FOOT", F1: 430, F2: 1080 },
  { symbol: "LOT", F1: 700, F2: 1100 },
];

// ...existing VOWEL_SYMBOLS array...

// Add these display range calculations
const F1Values = VOWEL_SYMBOLS.map((v) => v.F1);
const F2Values = VOWEL_SYMBOLS.map((v) => v.F2);

const F1_MIN_DISPLAY =
  Math.min(...F1Values) -
  0.05 * (Math.max(...F1Values) - Math.min(...F1Values));
const F1_MAX_DISPLAY =
  Math.max(...F1Values) +
  0.05 * (Math.max(...F1Values) - Math.min(...F1Values));
const F2_MIN_DISPLAY =
  Math.min(...F2Values) -
  0.05 * (Math.max(...F2Values) - Math.min(...F2Values));
const F2_MAX_DISPLAY =
  Math.max(...F2Values) +
  0.05 * (Math.max(...F2Values) - Math.min(...F2Values));

export default function VowelSynthesizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [formants, setFormants] = useState({
    F1: 500,
    F2: 1500,
    F3: 2500,
  });
  const [volume, setVolume] = useState(100);
  const [pitch, setPitch] = useState(100); // Fundamental frequency
  const [isDragging, setIsDragging] = useState(false);

  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const filterF1Ref = useRef(null);
  const filterF2Ref = useRef(null);
  const filterF3Ref = useRef(null);
  const gainNodeRef = useRef(null);
  const diagramRef = useRef(null);
  const markerRef = useRef(null);

  const startSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;

      // Create source oscillator with rich harmonics
      const oscillator = audioContext.createOscillator();
      oscillator.type = "sawtooth"; // Sawtooth wave for rich harmonic content
      oscillator.frequency.setValueAtTime(pitch, audioContext.currentTime); // Fundamental frequency

      const filterF1 = audioContext.createBiquadFilter();
      filterF1.type = "bandpass";
      filterF1.frequency.setValueAtTime(formants.F1, audioContext.currentTime);
      filterF1.Q.setValueAtTime(10, audioContext.currentTime); // Increase Q for stronger resonance

      const filterF2 = audioContext.createBiquadFilter();
      filterF2.type = "bandpass";
      filterF2.frequency.setValueAtTime(formants.F2, audioContext.currentTime);
      filterF2.Q.setValueAtTime(10, audioContext.currentTime); // Increase Q for stronger resonance

      const filterF3 = audioContext.createBiquadFilter();
      filterF3.type = "bandpass";
      filterF3.frequency.setValueAtTime(formants.F3, audioContext.currentTime);
      filterF3.Q.setValueAtTime(10, audioContext.currentTime); // Increase Q for stronger resonance

      // Create main output gain
      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(volume * 0.8, audioContext.currentTime); // Master volume

      // Connect in parallel like the legacy implementation
      oscillator.connect(filterF1);
      filterF1.connect(filterF2);
      filterF2.connect(filterF3);
      filterF3.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Store refs
      oscillatorRef.current = oscillator;
      filterF1Ref.current = filterF1;
      filterF2Ref.current = filterF2;
      filterF3Ref.current = filterF3;
      gainNodeRef.current = gainNode;

      oscillator.start();
      setIsPlaying(true);

      console.log("Audio synthesis started successfully");
    } catch (error) {
      console.error("Error starting audio synthesis:", error);
    }
  };

  const stopSound = useCallback(() => {
    try {
      if (!isPlaying) return; // Add this guard

      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }

      // Disconnect all nodes but don't close context
      [filterF1Ref, filterF2Ref, filterF3Ref, gainNodeRef].forEach((ref) => {
        if (ref.current) {
          ref.current.disconnect();
          ref.current = null;
        }
      });

      setIsPlaying(false);
      console.log("Audio synthesis stopped successfully");
    } catch (error) {
      console.error("Error stopping audio synthesis:", error);
    }
  }, [isPlaying]); // Add isPlaying dependency

  const handleMouseDownOnDiagram = (e) => {
    if (!diagramRef.current) return;

    setIsDragging(true);
    updateFormantsByPosition(e);
    startSound();
  };

  const handleMouseMoveOnDiagram = (e) => {
    if (!isDragging || !diagramRef.current) return;
    updateFormantsByPosition(e);
  };

  const handleMouseUpOnDiagram = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    stopSound();
  }, [isDragging, stopSound]);

  // Shared logic for updating formants based on mouse position
  const updateFormantsByPosition = (e) => {
    const rect = diagramRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const F2 =
      F2_MAX_DISPLAY - (x / rect.width) * (F2_MAX_DISPLAY - F2_MIN_DISPLAY);
    const F1 =
      F1_MIN_DISPLAY + (y / rect.height) * (F1_MAX_DISPLAY - F1_MIN_DISPLAY);

    const roundedF1 = Math.round(F1);
    const roundedF2 = Math.round(F2);

    setFormants((prev) => ({
      ...prev,
      F1: roundedF1,
      F2: roundedF2,
    }));

    if (isPlaying) {
      filterF1Ref.current?.frequency.setValueAtTime(
        roundedF1,
        audioContextRef.current.currentTime
      );
      filterF2Ref.current?.frequency.setValueAtTime(
        roundedF2,
        audioContextRef.current.currentTime
      );
    }
  };

  // Add cleanup for mouse events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mouseup", handleMouseUpOnDiagram);
    }
    return () => {
      document.removeEventListener("mouseup", handleMouseUpOnDiagram);
    };
  }, [isDragging, handleMouseUpOnDiagram]);

  // Clean up only on component unmount
  useEffect(() => {
    return () => {
      // Only close context on unmount, don't call stopSound here
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef.current?.close();
      }
    };
  }, []); // Empty dependency array - only runs on unmount

  const handleFormantChange = (formant, value) => {
    const numValue = Number(value);
    setFormants((prev) => ({
      ...prev,
      [formant]: numValue,
    }));

    if (isPlaying) {
      const filter = {
        F1: filterF1Ref.current,
        F2: filterF2Ref.current,
        F3: filterF3Ref.current,
      }[formant];

      if (filter) {
        filter.frequency.setValueAtTime(
          numValue,
          audioContextRef.current.currentTime
        );
      }
    }
  };

  const updateMarkerPosition = (F1, F2) => {
    if (!diagramRef.current || !markerRef.current) return;

    const rect = diagramRef.current.getBoundingClientRect();
    const x =
      ((F2_MAX_DISPLAY - F2) / (F2_MAX_DISPLAY - F2_MIN_DISPLAY)) * rect.width;
    const y =
      ((F1 - F1_MIN_DISPLAY) / (F1_MAX_DISPLAY - F1_MIN_DISPLAY)) * rect.height;

    markerRef.current.style.left = `${x}px`;
    markerRef.current.style.top = `${y}px`;
  };

  useEffect(() => {
    updateMarkerPosition(formants.F1, formants.F2);
  }, [formants.F1, formants.F2]);

  return (
    <div className="vsynth-container">
      <div className="vsynth-diagram" ref={diagramRef}>
        {/* Add tick marks and values */}
        <div className="vsynth-axis-ticks">
          <div className="vsynth-axis-tick vsynth-x-min">
            {Math.round(F2_MAX_DISPLAY)}
          </div>
          <div className="vsynth-axis-tick vsynth-x-max">
            {Math.round(F2_MIN_DISPLAY)}
          </div>
          <div className="vsynth-axis-tick vsynth-y-min">
            {Math.round(F1_MIN_DISPLAY)}
          </div>
          <div className="vsynth-axis-tick vsynth-y-max">
            {Math.round(F1_MAX_DISPLAY)}
          </div>
        </div>
        <div
          className="vsynth-overlay"
          onMouseDown={handleMouseDownOnDiagram}
          onMouseMove={handleMouseMoveOnDiagram}
        >
          <div className="vsynth-triangle-overlay" />
          {VOWEL_SYMBOLS.map(({ symbol, F1, F2 }) => (
            <div
              key={symbol}
              className="vsynth-vowel-symbol"
              style={{
                left: `${
                  ((F2_MAX_DISPLAY - F2) / (F2_MAX_DISPLAY - F2_MIN_DISPLAY)) *
                  100
                }%`,
                top: `${
                  ((F1 - F1_MIN_DISPLAY) / (F1_MAX_DISPLAY - F1_MIN_DISPLAY)) *
                  100
                }%`,
              }}
            >
              {symbol}
            </div>
          ))}
          <div ref={markerRef} className="vsynth-marker" />
        </div>
        <div className="vsynth-axis-labels">
          <div className="vsynth-axis-label vsynth-x-axis">F2 (Hz)</div>
          <div className="vsynth-axis-label vsynth-y-axis">F1 (Hz)</div>
        </div>
      </div>

      <div className="vsynth-controls">
        <div className="formant-control">
          <label htmlFor="pitch">Pitch (Hz):</label>
          <input
            type="range"
            id="pitch"
            min="80"
            max="200"
            value={pitch}
            onChange={(e) => {
              const value = Number(e.target.value);
              setPitch(value);
              if (oscillatorRef.current) {
                oscillatorRef.current.frequency.setValueAtTime(
                  value,
                  audioContextRef.current.currentTime
                );
              }
            }}
          />
          <input
            type="number"
            value={pitch}
            onChange={(e) => {
              const value = Number(e.target.value);
              setPitch(value);
              if (oscillatorRef.current) {
                oscillatorRef.current.frequency.setValueAtTime(
                  value,
                  audioContextRef.current.currentTime
                );
              }
            }}
          />
        </div>

        <div className="formant-control">
          <label htmlFor="volume">Volume:</label>
          <input
            type="range"
            id="volume"
            min="0"
            max="100" // Changed from 1 to 100 for better control
            step="0.01" // Changed from 0.01 to 1
            value={volume} // Scale to 0-100 range
            onChange={(e) => {
              const value = Number(e.target.value); // Scale back to 0-1
              setVolume(value);
              if (gainNodeRef.current) {
                gainNodeRef.current.gain.setValueAtTime(
                  value, // Apply master volume scaling
                  audioContextRef.current.currentTime
                );
              }
            }}
          />
        </div>
        <div className="formant-control">
          <label htmlFor="F1">F1 (Hz):</label>
          <input
            type="range"
            id="F1"
            min="200"
            max="1000"
            value={formants.F1}
            onChange={(e) => handleFormantChange("F1", e.target.value)}
          />
          <input
            type="number"
            value={formants.F1}
            onChange={(e) => handleFormantChange("F1", e.target.value)}
          />
        </div>

        <div className="formant-control">
          <label htmlFor="F2">F2 (Hz):</label>
          <input
            type="range"
            id="F2"
            min="500"
            max="3000"
            value={formants.F2}
            onChange={(e) => handleFormantChange("F2", e.target.value)}
          />
          <input
            type="number"
            value={formants.F2}
            onChange={(e) => handleFormantChange("F2", e.target.value)}
          />
        </div>

        <div className="formant-control">
          <label htmlFor="F3">F3 (Hz):</label>
          <input
            type="range"
            id="F3"
            min="2000"
            max="3500"
            value={formants.F3}
            onChange={(e) => handleFormantChange("F3", e.target.value)}
          />
          <input
            type="number"
            value={formants.F3}
            onChange={(e) => handleFormantChange("F3", e.target.value)}
          />
        </div>

        <button onClick={isPlaying ? stopSound : startSound}>
          {isPlaying ? "Stop" : "Start"}
        </button>
      </div>
    </div>
  );
}
