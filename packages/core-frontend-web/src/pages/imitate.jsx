import React, { useState, useRef, useEffect } from "react";
import { Button } from "core-frontend-web/src/components/ui/button";
import { Input } from "core-frontend-web/src/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "core-frontend-web/src/components/ui/card";
import {
  Play,
  Pause,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Search,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { getWiktionaryAllAudio } from "../utils/wiktionary-api";

const Imitate = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [nativeAudios, setNativeAudios] = useState([]);
  const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isInitializingRecording, setIsInitializingRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [error, setError] = useState("");

  const nativeAudioRef = useRef(null);

  // Helper function to get flag and region info from audio data
  const getRegionInfo = (audioData) => {
    return { flag: audioData.flag, region: audioData.region };
  };
  const recordedAudioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (nativeAudioRef.current) {
        nativeAudioRef.current.pause();
        nativeAudioRef.current = null;
      }
      if (recordedAudioRef.current) {
        recordedAudioRef.current.pause();
        recordedAudioRef.current = null;
      }
    };
  }, []);

  // Search for pronunciation using Wiktionary API
  const searchPronunciation = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a word to search");
      return;
    }

    setIsLoading(true);
    setError("");
    setNativeAudios([]);
    setCurrentlyPlayingAudio(null);

    try {
      // Using Wiktionary API
      const audioPronunciations = await getWiktionaryAllAudio(searchTerm);

      if (audioPronunciations.length > 0) {
        // Sort pronunciations: American first, then others
        const sortedPronunciations = audioPronunciations.sort((a, b) => {
          const aIsAmerican = a.accent === "us";
          const bIsAmerican = b.accent === "us";

          if (aIsAmerican && !bIsAmerican) return -1; // American first
          if (!aIsAmerican && bIsAmerican) return 1; // American first
          return 0; // Keep original order for same type
        });

        setNativeAudios(sortedPronunciations);
      } else {
        throw new Error("No audio available for this word");
      }
    } catch (err) {
      console.error("Error fetching pronunciation:", err);
      setError(
        err.message || "Failed to find pronunciation. Please try another word."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Play native speaker audio
  const playNativeAudio = (audioId) => {
    if (currentlyPlayingAudio === audioId && nativeAudioRef.current) {
      // If this audio is currently playing, pause it
      nativeAudioRef.current.pause();
      setCurrentlyPlayingAudio(null);
    } else {
      // Play the selected audio
      const selectedAudio = nativeAudios.find((audio) => audio.id === audioId);
      if (selectedAudio && nativeAudioRef.current) {
        nativeAudioRef.current.src = selectedAudio.audio;
        nativeAudioRef.current.play();
        setCurrentlyPlayingAudio(audioId);
      }
    }
  };

  // Start recording
  const startRecording = async () => {
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
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Play recorded audio
  const playRecordedAudio = () => {
    if (recordedAudio && recordedAudioRef.current) {
      if (isPlayingRecorded) {
        recordedAudioRef.current.pause();
        setIsPlayingRecorded(false);
      } else {
        recordedAudioRef.current.play();
        setIsPlayingRecorded(true);
      }
    }
  };

  // Handle audio ended events
  const handleNativeAudioEnded = () => {
    setCurrentlyPlayingAudio(null);
  };

  const handleRecordedAudioEnded = () => {
    setIsPlayingRecorded(false);
  };

  return (
    <div className="container mx-auto p-2 sm:p-4 max-w-2xl">
      <div className="mb-2 sm:mb-4">
        <h1 className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1 text-center">
          Imitate
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block text-center">
          Search a word and try to imitate the native audio exactly.
        </p>
      </div>

      {/* Search Section */}
      <Card className="mb-2 p-0 sm:mb-3">
        <CardContent className="p-3 sm:p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter a word..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchPronunciation()}
              className="flex-1 text-lg"
            />
            <Button
              onClick={searchPronunciation}
              disabled={isLoading}
              size="md"
              className="min-w-[60px] sm:min-w-[120px] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                  <span className="hidden sm:inline">Searching...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Search</span>
                  <span className="sm:hidden">Go</span>
                </>
              )}
            </Button>
          </div>
          {error && (
            <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Native Speaker Audio */}
      {nativeAudios.length > 0 && (
        <Card className="mb-2 p-0 sm:mb-3">
          <CardContent className="p-3 sm:p-4">
            <div className="text-center mb-2 sm:mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Native Pronunciation
              </h3>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              {nativeAudios.map((audioData, index) => {
                const isAmerican = audioData.accent === "us";

                return (
                  <Button
                    key={audioData.id}
                    onClick={() => playNativeAudio(audioData.id)}
                    variant={
                      currentlyPlayingAudio === audioData.id
                        ? "destructive"
                        : isAmerican
                        ? "secondary"
                        : "outline"
                    }
                    size="sm"
                    className={`w-full font-semibold h-10 sm:h-8 cursor-pointer ${
                      isAmerican
                        ? "font-semibold border-2 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/40 shadow-md"
                        : "opacity-75"
                    } ${
                      currentlyPlayingAudio === audioData.id
                        ? "border-blue-600 dark:border-blue-300 bg-blue-100 dark:bg-blue-800/50"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-center w-full gap-2 sm:gap-3">
                      {/* Flag and nationality */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs sm:text-sm ${
                            isAmerican
                              ? "text-blue-700 dark:text-blue-200 font-medium"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {(() => {
                            const regionInfo = getRegionInfo(audioData);
                            return `${regionInfo.flag} ${audioData.region}`;
                          })()}
                        </span>
                      </div>

                      {/* Play/Pause button */}
                      <div className="flex items-center justify-center">
                        {currentlyPlayingAudio === audioData.id ? (
                          <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : (
                          <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                        )}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
            <audio
              ref={nativeAudioRef}
              onEnded={handleNativeAudioEnded}
              preload="auto"
            />
          </CardContent>
        </Card>
      )}

      {/* Recording Section */}
      <Card className="mb-2 p-0 sm:mb-3">
        <CardContent className="p-3 sm:p-4">
          <div className="text-center mb-2 sm:mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Your Pronunciation
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            {/* Left half - Record controls */}
            <div className="flex flex-col gap-1.5">
              {!isRecording && !isInitializingRecording ? (
                <Button
                  onClick={startRecording}
                  variant="default"
                  size="sm"
                  className="h-20 cursor-pointer"
                >
                  <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline ml-2">Record</span>
                  <span className="sm:hidden ml-1">Record</span>
                </Button>
              ) : isInitializingRecording ? (
                <Button
                  disabled
                  variant="default"
                  size="sm"
                  className="h-20 cursor-not-allowed opacity-75"
                >
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  <span className="hidden sm:inline ml-2">Starting...</span>
                  <span className="sm:hidden ml-1">Starting...</span>
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  size="sm"
                  className="h-20 cursor-pointer"
                >
                  <MicOff className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline ml-2">Stop Recording</span>
                  <span className="sm:hidden ml-1">Stop</span>
                </Button>
              )}
              {(isRecording || isInitializingRecording) && (
                <div className="flex items-center justify-center gap-1.5 text-red-500 dark:text-red-400">
                  <div className="w-1.5 h-1.5 bg-red-500 dark:bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-xs">
                    {isInitializingRecording ? "Starting..." : "Recording..."}
                  </span>
                </div>
              )}
            </div>

            {/* Right half - Play controls */}
            <div className="flex flex-col gap-1.5">
              {recordedAudio ? (
                <Button
                  onClick={playRecordedAudio}
                  variant={isPlayingRecorded ? "destructive" : "outline"}
                  size="sm"
                  className="h-20 cursor-pointer"
                >
                  {isPlayingRecorded ? (
                    <>
                      <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline ml-2">Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline ml-2">
                        Play Recording
                      </span>
                      <span className="sm:hidden ml-1">Play</span>
                    </>
                  )}
                </Button>
              ) : (
                <div className="h-20 sm:h-20 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-600 rounded">
                  <span className="text-xs text-muted-foreground">
                    No recording yet
                  </span>
                </div>
              )}
            </div>
          </div>

          <audio
            ref={recordedAudioRef}
            src={recordedAudio}
            onEnded={handleRecordedAudioEnded}
            preload="auto"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Imitate;
