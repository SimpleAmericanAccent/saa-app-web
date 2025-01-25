import React, { useState, useEffect, useRef } from "react";
// import styles from "./Home4.module.css";

function Home4() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [pitch, setPitch] = useState(100);
  const [F1, setF1] = useState(500);
  const [F2, setF2] = useState(1500);
  const [F3, setF3] = useState(2500);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const filterF1Ref = useRef(null);
  const filterF2Ref = useRef(null);
  const filterF3Ref = useRef(null);

  const vowelDiagramRef = useRef(null);
  const F1F2MarkerRef = useRef(null);

  useEffect(() => {
    const vowelDiagram = vowelDiagramRef.current;
    const F1F2Marker = F1F2MarkerRef.current;

    const handleMouseMove = (event) => {
      if (isPlaying) {
        const rect = vowelDiagram.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const F1 = 300 + (y / rect.height) * (700 - 300);
        const F2 = 2500 - (x / rect.width) * (2500 - 500);
        setF1(F1);
        setF2(F2);
        F1F2Marker.style.left = `${x - 5}px`;
        F1F2Marker.style.top = `${y - 5}px`;
        if (filterF1Ref.current && filterF2Ref.current) {
          filterF1Ref.current.frequency.setValueAtTime(
            F1,
            audioContextRef.current.currentTime
          );
          filterF2Ref.current.frequency.setValueAtTime(
            F2,
            audioContextRef.current.currentTime
          );
        }
      }
    };

    vowelDiagram.addEventListener("mousemove", handleMouseMove);

    return () => {
      vowelDiagram.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isPlaying]);

  const startSound = () => {
    if (isPlaying) return;

    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filterF1 = audioContext.createBiquadFilter();
    const filterF2 = audioContext.createBiquadFilter();
    const filterF3 = audioContext.createBiquadFilter();

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(pitch, audioContext.currentTime);

    filterF1.type = "bandpass";
    filterF1.frequency.setValueAtTime(F1, audioContext.currentTime);
    filterF1.Q.setValueAtTime(10, audioContext.currentTime);

    filterF2.type = "bandpass";
    filterF2.frequency.setValueAtTime(F2, audioContext.currentTime);
    filterF2.Q.setValueAtTime(10, audioContext.currentTime);

    filterF3.type = "bandpass";
    filterF3.frequency.setValueAtTime(F3, audioContext.currentTime);
    filterF3.Q.setValueAtTime(10, audioContext.currentTime);

    gainNode.gain.setValueAtTime(volume / 100, audioContext.currentTime);

    oscillator.connect(filterF1);
    filterF1.connect(filterF2);
    filterF2.connect(filterF3);
    filterF3.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    setIsPlaying(true);

    audioContextRef.current = audioContext;
    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
    filterF1Ref.current = filterF1;
    filterF2Ref.current = filterF2;
    filterF3Ref.current = filterF3;
  };

  const stopSound = () => {
    if (!isPlaying) return;

    oscillatorRef.current.stop();
    audioContextRef.current.close();
    setIsPlaying(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Vowel Sound Synthesizer</h1>
      <div className={styles.container}>
        <div className={styles.column}>
          <div
            id="vowelDiagram"
            ref={vowelDiagramRef}
            className={styles.vowelDiagram}
          >
            <div id="triangleOverlay" className={styles.triangleOverlay}></div>
            <div className={`${styles.axisLabel} ${styles.xAxisLabel}`}>
              F2 (Hz)
            </div>
            <div className={`${styles.axisLabel} ${styles.yAxisLabel}`}>
              F1 (Hz)
            </div>
            <div
              className={`${styles.axisValues} ${styles.xAxisValues}`}
              id="xAxisMin"
              style={{ left: "0" }}
            ></div>
            <div
              className={`${styles.axisValues} ${styles.xAxisValues}`}
              id="xAxisMax"
              style={{ left: "100%" }}
            ></div>
            <div
              className={`${styles.axisValues} ${styles.yAxisValues}`}
              id="yAxisMin"
              style={{ top: "0" }}
            ></div>
            <div
              className={`${styles.axisValues} ${styles.yAxisValues}`}
              id="yAxisMax"
              style={{ top: "100%" }}
            ></div>
            <div
              id="F1F2Marker"
              ref={F1F2MarkerRef}
              className={styles.F1F2Marker}
            ></div>
          </div>
        </div>
        <div className={styles.column}>
          <div className={styles.controls}>
            <div className={styles.sliderContainer}>
              <label htmlFor="volume">
                Volume: <span id="volumeValue">{volume}</span>
              </label>
              <input
                type="range"
                id="volume"
                name="volume"
                min="0"
                max="100"
                value={volume}
                step="0.01"
                onChange={(e) => setVolume(e.target.value)}
              />
            </div>
            <div className={styles.sliderContainer}>
              <label htmlFor="pitch">
                Pitch (Hz): <span id="pitchValue">{pitch}</span>
              </label>
              <input
                type="range"
                id="pitch"
                name="pitch"
                min="50"
                max="300"
                value={pitch}
                step="1"
                onChange={(e) => setPitch(e.target.value)}
              />
            </div>
            <div className={styles.frequencyDisplay}>
              F1: <span id="F1Value">{F1}</span> Hz, F2:{" "}
              <span id="F2Value">{F2}</span> Hz, F3:{" "}
              <span id="F3Value">{F3}</span> Hz
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="F1">F1 (Hz)</label>
              <input
                type="range"
                id="F1"
                min="100"
                max="1000"
                value={F1}
                step="1"
                onChange={(e) => setF1(e.target.value)}
              />
              <input
                type="number"
                id="F1Input"
                value={F1}
                min="100"
                max="1000"
                onChange={(e) => setF1(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="F2">F2 (Hz)</label>
              <input
                type="range"
                id="F2"
                min="500"
                max="3000"
                value={F2}
                step="1"
                onChange={(e) => setF2(e.target.value)}
              />
              <input
                type="number"
                id="F2Input"
                value={F2}
                min="500"
                max="3000"
                onChange={(e) => setF2(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="F3">F3 (Hz)</label>
              <input
                type="range"
                id="F3"
                min="2000"
                max="3500"
                value={F3}
                step="1"
                onChange={(e) => setF3(e.target.value)}
              />
              <input
                type="number"
                id="F3Input"
                value={F3}
                min="2000"
                max="3500"
                onChange={(e) => setF3(e.target.value)}
              />
            </div>
            <button
              id="startStopButton"
              onClick={isPlaying ? stopSound : startSound}
              className={styles.button}
            >
              {isPlaying ? "Stop" : "Start"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home4;
