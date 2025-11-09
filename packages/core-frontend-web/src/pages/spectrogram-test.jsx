import { useWavesurfer } from "@wavesurfer/react";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Button } from "core-frontend-web/src/components/ui/button";
import SpectrogramPlugin from "wavesurfer.js/dist/plugins/spectrogram.esm.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js";
import ZoomPlugin from "wavesurfer.js/dist/plugins/zoom.esm.js";

const WSTest = () => {
  const containerRef = useRef(null);

  const { wavesurfer, isPlaying, isReady, currentTime } = useWavesurfer({
    container: containerRef,
    height: 100,
    waveColor: "rgb(200, 0, 200)",
    progressColor: "rgb(100, 0, 100)",
    url: "https://saaclientaudio.s3.us-east-2.amazonaws.com/test.mp3",
    plugins: useMemo(
      () => [
        TimelinePlugin.create(),
        ZoomPlugin.create(),
        // SpectrogramPlugin.create({
        //   labels: true,
        //   splitChannels: false,
        //   height: 100,
        //   colorScheme: "classic",
        //   frequencyMin: 0,
        // }),
      ],
      []
    ),
  });

  const onPlayPause = useCallback(() => {
    wavesurfer?.playPause();
  }, [wavesurfer]);

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

  return (
    <>
      <div ref={containerRef} />
      <Button onClick={onPlayPause} className="cursor-pointer">
        {isPlaying ? "Pause" : "Play"}
      </Button>
    </>
  );
};

export default WSTest;
