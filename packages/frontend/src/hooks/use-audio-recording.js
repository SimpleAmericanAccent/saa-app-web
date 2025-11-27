import { useState, useRef, useCallback } from "react";

export const useAudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isInitializingRecording, setIsInitializingRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [error, setError] = useState("");

  const recordedAudioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setIsInitializingRecording(true);
      setError(""); // Clear any previous errors

      // Check if we're on HTTPS (required for microphone access on iOS)
      if (location.protocol !== "https:" && location.hostname !== "localhost") {
        throw new Error("HTTPS required for microphone access");
      }

      // Check if MediaRecorder is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("MediaDevices API not supported");
      }

      if (!window.MediaRecorder) {
        throw new Error("MediaRecorder not supported");
      }

      // Request microphone access with iOS-compatible constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      // Determine the best audio format for the browser
      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      } else if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      }

      // Create MediaRecorder with iOS-compatible options
      const options = { mimeType };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType,
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error("MediaRecorder error:", event.error);
        setError("Recording failed. Please try again.");
        setIsRecording(false);
      };

      // Start recording with time slice for better iOS compatibility
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setIsInitializingRecording(false);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      let errorMessage = "Could not access microphone. ";

      if (err.message === "HTTPS required for microphone access") {
        errorMessage =
          "Recording requires HTTPS. Please use a secure connection.";
      } else if (err.name === "NotAllowedError") {
        errorMessage += "Please allow microphone access and try again.";
      } else if (err.name === "NotFoundError") {
        errorMessage += "No microphone found.";
      } else if (err.name === "NotSupportedError") {
        errorMessage += "Recording not supported on this device.";
      } else if (err.message === "MediaDevices API not supported") {
        errorMessage = "Your browser doesn't support microphone access.";
      } else if (err.message === "MediaRecorder not supported") {
        errorMessage = "Your browser doesn't support audio recording.";
      } else {
        errorMessage += "Please check permissions and try again.";
      }

      setError(errorMessage);
      setIsInitializingRecording(false);
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Play recorded audio
  const playRecordedAudio = useCallback(() => {
    if (recordedAudio && recordedAudioRef.current) {
      if (isPlayingRecorded) {
        recordedAudioRef.current.pause();
        setIsPlayingRecorded(false);
      } else {
        recordedAudioRef.current.play();
        setIsPlayingRecorded(true);
      }
    }
  }, [recordedAudio, isPlayingRecorded]);

  // Handle audio ended events
  const handleRecordedAudioEnded = useCallback(() => {
    setIsPlayingRecorded(false);
  }, []);

  // Clear recorded audio
  const clearRecordedAudio = useCallback(() => {
    if (recordedAudio) {
      URL.revokeObjectURL(recordedAudio);
      setRecordedAudio(null);
      setIsPlayingRecorded(false);
    }
  }, [recordedAudio]);

  return {
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
  };
};
