import React from "react";
import { Button } from "./ui/button";
import {
  Play,
  Pause,
  Mic,
  MicOff,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import { useAudioRecording } from "../hooks/use-audio-recording";

export const AudioRecorder = ({
  className = "",
  size = "default",
  showClearButton = true,
  onRecordingComplete = null,
}) => {
  const {
    isRecording,
    isInitializingRecording,
    recordedAudio,
    isPlayingRecorded,
    error,
    recordedAudioRef,
    startRecording,
    stopRecording,
    playRecordedAudio,
    handleRecordedAudioEnded,
    clearRecordedAudio,
  } = useAudioRecording();

  const handleStartRecording = async () => {
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
    if (onRecordingComplete) {
      // Call the callback after a short delay to ensure recording is processed
      setTimeout(() => {
        onRecordingComplete(recordedAudio);
      }, 100);
    }
  };

  const handleClearRecording = () => {
    clearRecordedAudio();
  };

  const buttonSize = size === "small" ? "sm" : size === "lg" ? "lg" : "default";
  const iconSize = size === "small" ? 14 : size === "lg" ? 20 : 16;

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {error && (
        <div className="flex items-center gap-1 text-destructive text-xs">
          <AlertTriangle size={12} />
          <span>{error}</span>
        </div>
      )}

      {!recordedAudio ? (
        // Recording controls
        <div className="flex flex-col gap-2 w-full">
          {!isRecording ? (
            <Button
              onClick={handleStartRecording}
              disabled={isInitializingRecording}
              size={buttonSize}
              variant="outline"
              className="flex items-center justify-center gap-1 cursor-pointer w-full"
            >
              {isInitializingRecording ? (
                <Loader2 size={iconSize} className="animate-spin" />
              ) : (
                <Mic size={iconSize} />
              )}
              <span>{isInitializingRecording ? "Starting..." : "Record"}</span>
            </Button>
          ) : (
            <Button
              onClick={handleStopRecording}
              size={buttonSize}
              variant="destructive"
              className="flex items-center justify-center gap-1 cursor-pointer w-full"
            >
              <MicOff size={iconSize} />
              <span>Stop</span>
            </Button>
          )}
        </div>
      ) : (
        // Playback controls
        <div className="flex flex-col gap-2 w-full">
          <Button
            onClick={playRecordedAudio}
            size={buttonSize}
            variant="outline"
            className="flex items-center justify-center gap-1 cursor-pointer w-full"
          >
            {isPlayingRecorded ? (
              <Pause size={iconSize} />
            ) : (
              <Play size={iconSize} />
            )}
            <span>{isPlayingRecorded ? "Pause" : "Play"}</span>
          </Button>

          {showClearButton && (
            <Button
              onClick={handleClearRecording}
              size={buttonSize}
              variant="ghost"
              className="flex items-center justify-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer w-full"
            >
              <X size={iconSize} />
              <span>Clear</span>
            </Button>
          )}
        </div>
      )}

      {/* Hidden audio element for playback */}
      <audio
        ref={recordedAudioRef}
        src={recordedAudio}
        onEnded={handleRecordedAudioEnded}
        preload="auto"
      />
    </div>
  );
};

export default AudioRecorder;
