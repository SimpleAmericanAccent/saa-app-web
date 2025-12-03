/* eslint-disable react/prop-types */
import { useState } from "react";
import { fetchData } from "frontend/src/utils/api";
import { Button } from "frontend/src/components/ui/button";
import { Textarea } from "frontend/src/components/ui/textarea";
import { Input } from "frontend/src/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "frontend/src/components/ui/tabs";
import {
  Copy,
  Download,
  X,
  Loader2,
  AlignLeft,
  ExternalLink,
  Info,
} from "lucide-react";
import { cn } from "frontend/src/lib/utils";

/**
 * Text to Transcript Converter Component
 * Converts plain text to transcript JSON format
 * Optionally performs forced alignment with audio to get word-level timestamps
 * Can also accept JSON input for alignment
 */
const TextToTranscriptConverter = ({ onClose, mp3url: initialMp3Url }) => {
  const [inputText, setInputText] = useState("");
  const [inputJson, setInputJson] = useState("");
  const [inputMode, setInputMode] = useState("text"); // "text" or "json"
  const [audioUrl, setAudioUrl] = useState(initialMp3Url || "");
  const [audioFile, setAudioFile] = useState(null); // For file upload
  const [modelPath, setModelPath] = useState(""); // Local model path (optional)
  const [useLocalModel, setUseLocalModel] = useState(false); // Toggle for local vs CDN
  const [outputJson, setOutputJson] = useState(null);
  const [error, setError] = useState(null);
  const [isAligning, setIsAligning] = useState(false);

  const parseTextToTranscript = (text) => {
    const lines = text.split("\n");
    const words = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";
      const isNextLineEmpty = nextLine === "";
      const isNextLineSectionMarker =
        nextLine.startsWith("[") && nextLine.endsWith("]");
      const isLastLine = i === lines.length - 1;

      // Skip empty lines (they indicate paragraph breaks)
      if (line === "") {
        continue;
      }

      // Check if line is a section marker (starts with [ and ends with ])
      if (line.startsWith("[") && line.endsWith("]")) {
        // Add the section marker as a word with lineBreakAfter
        words.push({
          word: line,
          // start is excluded - will need to be set manually
          lineBreakAfter: true,
        });
        continue;
      }

      // Regular text line - split into words
      const lineWords = line.split(/\s+/).filter((w) => w.length > 0);

      for (let j = 0; j < lineWords.length; j++) {
        const word = lineWords[j];
        const isLastWordInLine = j === lineWords.length - 1;

        // Determine if this is the last word before a paragraph break
        const isLastWordBeforeParagraphBreak =
          isLastWordInLine &&
          (isLastLine || isNextLineEmpty || isNextLineSectionMarker);

        const wordObj = {
          word: word,
          // start is excluded - will need to be set manually
        };

        // Add newParagraphAfter if it's the last word before an empty line or section marker
        // (This takes priority over lineBreakAfter - they're mutually exclusive)
        if (isLastWordBeforeParagraphBreak) {
          wordObj.newParagraphAfter = true;
        } else if (isLastWordInLine) {
          // Only add lineBreakAfter if it's not a paragraph break
          wordObj.lineBreakAfter = true;
        }

        words.push(wordObj);
      }
    }

    return words;
  };

  // Perform forced alignment using transformers.js with Whisper or Wav2Vec2
  // This uses the model's word-level timestamps and matches them to our transcript
  const performForcedAlignment = async (transcript, audioInput) => {
    try {
      // audioInput can be a URL string, File object, or Blob
      let audioData = audioInput;

      // If it's a URL string, try to fetch it
      if (typeof audioInput === "string") {
        try {
          const audioResponse = await fetchData(audioInput);
          audioData = await audioResponse.blob();
        } catch (fetchErr) {
          if (fetchErr.message.includes("Audio URL returned")) {
            throw fetchErr;
          }
          // If fetch fails due to CORS, we can't proceed with URL
          // User will need to upload the file instead
          throw new Error(
            `Cannot access audio URL due to CORS restrictions: ${fetchErr.message}. Please upload the audio file directly instead.`
          );
        }
      }

      // Dynamically import transformers.js (only when needed to reduce initial bundle size)
      let pipeline;
      try {
        const transformers = await import("@huggingface/transformers");
        pipeline = transformers.pipeline;

        // Configure transformers environment if available
        // Note: @huggingface/transformers may have different env API
        if (transformers.env) {
          if (useLocalModel && modelPath) {
            // Use local model files
            transformers.env.allowLocalModels = true;
            transformers.env.allowRemoteModels = false;
            // Set the local model path
            // The path should be relative to the public directory or absolute URL
            console.log(`Using local model from: ${modelPath}`);
          } else {
            // Use CDN (default)
            transformers.env.allowLocalModels = false;
            transformers.env.allowRemoteModels = true;
          }
        }
      } catch (importErr) {
        throw new Error(
          `Failed to load transformers library: ${importErr.message}. Please refresh the page and try again.`
        );
      }

      // Use Whisper for better accuracy with word timestamps
      // Whisper provides word-level timestamps which we can use for alignment
      let transcriber;
      try {
        // Determine model identifier - use local path if specified, otherwise use CDN model
        const modelIdentifier =
          useLocalModel && modelPath ? modelPath : "Xenova/whisper-tiny.en"; // Default to CDN model

        const pipelineOptions = {
          quantized: true, // Use quantized model for smaller size
          // Add progress callback to help debug
          progress_callback: (progress) => {
            if (progress.status === "progress") {
              console.log(
                `Loading model: ${progress.name} - ${Math.round(
                  progress.progress * 100
                )}%`
              );
            }
          },
        };

        // If using local model, we might need to specify additional options
        if (useLocalModel && modelPath) {
          // For local models, the path should point to the model directory
          // containing model.json and the weight files
          console.log(`Loading local model from: ${modelPath}`);
        }

        transcriber = await pipeline(
          "automatic-speech-recognition",
          modelIdentifier,
          pipelineOptions
        );
      } catch (modelErr) {
        console.error("Model loading error:", modelErr);
        // Check if it's a network/CDN error
        if (
          modelErr.message?.includes("JSON.parse") ||
          modelErr.message?.includes("unexpected character") ||
          modelErr.message?.includes("Failed to fetch") ||
          modelErr.message?.includes("NetworkError") ||
          modelErr.message?.includes("network") ||
          modelErr.message?.includes("CDN")
        ) {
          throw new Error(
            `Failed to load Whisper model from CDN. This could be due to:\n` +
              `1. Network connectivity issues\n` +
              `2. CDN being blocked by firewall/proxy\n` +
              `3. Model files temporarily unavailable\n\n` +
              `Please check your internet connection and try again. If the problem persists, the model may need to be downloaded manually or the CDN may be blocked.`
          );
        }
        throw new Error(
          `Failed to load Whisper model: ${modelErr.message}. This might be a network issue. Please try again.`
        );
      }

      // Convert blob to File object if needed (transformers.js prefers File)
      let fileInput = audioData;
      if (audioData instanceof Blob && !(audioData instanceof File)) {
        const fileName =
          typeof audioInput === "string"
            ? audioInput.split("/").pop() || "audio.mp3"
            : "audio.mp3";
        fileInput = new File([audioData], fileName, {
          type: audioData.type || "audio/mpeg",
        });
      }

      // Transcribe with word-level timestamps
      let result;
      try {
        result = await transcriber(fileInput, {
          return_timestamps: "word",
          chunk_length_s: 30, // Process in 30-second chunks
        });
      } catch (transcribeErr) {
        console.error("Transcription error:", transcribeErr);
        // Check if it's a JSON parse error (likely from model loading)
        if (
          transcribeErr.message?.includes("JSON.parse") ||
          transcribeErr.message?.includes("unexpected character")
        ) {
          throw new Error(
            `Failed to process audio. The model may have failed to load, or the audio format is not supported. Please try uploading a different audio file or refresh the page. Original error: ${transcribeErr.message}`
          );
        }
        throw new Error(
          `Transcription failed: ${transcribeErr.message}. Please check that the audio file is valid and try again.`
        );
      }

      // Extract words with timestamps from Whisper output
      const whisperWords = result.chunks || [];

      // Create a map of normalized words to timestamps
      const wordMap = new Map();
      whisperWords.forEach((chunk) => {
        const normalized = chunk.text.toLowerCase().trim();
        if (!wordMap.has(normalized)) {
          wordMap.set(normalized, []);
        }
        wordMap.get(normalized).push({
          start: chunk.timestamp[0],
          end: chunk.timestamp[1],
        });
      });

      // Align transcript words to Whisper timestamps
      // Skip section markers (words in brackets) during alignment
      // Preserve existing timestamps if they exist
      let whisperIndex = 0;
      const alignedTranscript = transcript.map((wordObj) => {
        // Skip alignment for section markers (words in brackets)
        const isSectionMarker =
          wordObj.word.startsWith("[") && wordObj.word.endsWith("]");
        if (isSectionMarker) {
          // Return section marker without timestamp
          return wordObj;
        }

        // If word already has a timestamp, preserve it
        if (wordObj.start !== undefined && wordObj.start !== null) {
          return wordObj;
        }

        const normalizedWord = wordObj.word.toLowerCase().trim();

        // Try to find matching word in Whisper output
        // We'll use a simple sequential matching approach
        let matched = false;
        let startTime = null;

        // Look for exact match first
        const timestamps = wordMap.get(normalizedWord);
        if (timestamps && timestamps.length > 0) {
          // Use the first available timestamp for this word
          startTime = timestamps.shift().start;
          matched = true;
        } else {
          // Try sequential matching - find next word in Whisper output that matches
          while (whisperIndex < whisperWords.length) {
            const whisperWord = whisperWords[whisperIndex];
            if (whisperWord.text.toLowerCase().trim() === normalizedWord) {
              startTime = whisperWord.timestamp[0];
              whisperIndex++;
              matched = true;
              break;
            }
            whisperIndex++;
          }
        }

        if (matched && startTime !== null) {
          return {
            ...wordObj,
            start: startTime,
          };
        }

        // No match found - return word without timestamp
        return wordObj;
      });

      return alignedTranscript;
    } catch (err) {
      console.error("Alignment error:", err);

      // Provide more specific error messages
      if (err.message.includes("Audio URL") || err.message.includes("CORS")) {
        throw err; // Already has a good message
      } else if (err.message.includes("JSON.parse")) {
        throw new Error(
          `Failed to process audio. The audio URL may not be accessible or may not be a valid audio file. Error: ${err.message}`
        );
      } else if (
        err.message.includes("fetch") ||
        err.message.includes("network")
      ) {
        throw new Error(
          `Network error: ${err.message}. Make sure the audio URL is accessible and CORS-enabled.`
        );
      } else {
        throw new Error(
          `Alignment failed: ${err.message}. Make sure the audio URL is accessible and CORS-enabled.`
        );
      }
    }
  };

  const handleConvert = async () => {
    try {
      setError(null);
      if (!inputText.trim()) {
        setError("Please enter some text to convert");
        return;
      }

      const transcript = parseTextToTranscript(inputText);
      setOutputJson(transcript);
    } catch (err) {
      setError(err.message);
      setOutputJson(null);
    }
  };

  const handleAlign = async () => {
    // Check if we have audio input (either URL or file)
    if (!audioUrl.trim() && !audioFile) {
      setError("Please provide an audio URL or upload an audio file");
      return;
    }

    setIsAligning(true);
    setError(null);

    try {
      let transcript;

      if (inputMode === "json") {
        // Parse JSON input
        if (!inputJson.trim()) {
          setError("Please enter JSON transcript");
          return;
        }
        try {
          transcript = JSON.parse(inputJson);
          if (!Array.isArray(transcript)) {
            throw new Error("JSON must be an array of word objects");
          }
        } catch (parseErr) {
          setError(`Invalid JSON: ${parseErr.message}`);
          return;
        }
      } else {
        // Convert text to transcript format
        if (!inputText.trim()) {
          setError("Please enter some text to convert");
          return;
        }
        transcript = parseTextToTranscript(inputText);
      }

      // Use file upload if available (avoids CORS), otherwise use URL
      const audioInput = audioFile || audioUrl;

      // Perform forced alignment
      const alignedTranscript = await performForcedAlignment(
        transcript,
        audioInput
      );
      setOutputJson(alignedTranscript);
    } catch (err) {
      // Use the error message directly (it's already formatted)
      setError(
        err.message ||
          "Failed to align audio. Please check the audio URL and try again."
      );
      console.error("Alignment error:", err);
    } finally {
      setIsAligning(false);
    }
  };

  const handleCopy = async () => {
    if (!outputJson) return;
    try {
      const jsonString = JSON.stringify(outputJson, null, 2);
      await navigator.clipboard.writeText(jsonString);
      alert("JSON copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy to clipboard");
    }
  };

  const handleDownload = () => {
    if (!outputJson) return;
    const jsonString = JSON.stringify(outputJson, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("border rounded-lg bg-background overflow-hidden")}>
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <h3 className="text-sm font-semibold">Text to Transcript Converter</h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Model Configuration (optional - for troubleshooting CDN issues)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useLocalModel"
              checked={useLocalModel}
              onChange={(e) => setUseLocalModel(e.target.checked)}
              className="h-4 w-4"
            />
            <label
              htmlFor="useLocalModel"
              className="text-xs text-muted-foreground"
            >
              Use local model (download model files separately)
            </label>
          </div>
          {useLocalModel && (
            <Input
              type="text"
              value={modelPath}
              onChange={(e) => setModelPath(e.target.value)}
              placeholder="C:\\ml-models\\whisper-tiny.en or /models/whisper-tiny.en or http://localhost:8080/models/whisper-tiny.en"
              className="font-mono text-sm"
            />
          )}
          {useLocalModel && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Place model files in your public directory or serve them via a
                local server. Model should include model.json and weight files.
              </p>
              <div className="bg-muted/30 p-2 rounded text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <Info className="h-3 w-3 mt-0.5 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium mb-1">Download Model Files:</p>
                    <div className="space-y-1">
                      <a
                        href="https://huggingface.co/Xenova/whisper-tiny.en"
                        target="_blank"
                        rel="noopener"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        HuggingFace Model Page
                      </a>
                      <p className="text-muted-foreground">
                        Download the ONNX model files (model.json and .onnx
                        weight files)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-2 mt-2">
                  <p className="font-medium mb-1">Quick Setup:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Download model files from HuggingFace</li>
                    <li>
                      Place in a dedicated models folder (e.g.,{" "}
                      <code className="bg-background px-1 rounded">
                        C:\ml-models\whisper-tiny.en\
                      </code>{" "}
                      or{" "}
                      <code className="bg-background px-1 rounded">
                        ~/ml-models/whisper-tiny.en/
                      </code>
                      )
                    </li>
                    <li>
                      Enter the full path (e.g.,{" "}
                      <code className="bg-background px-1 rounded">
                        C:\ml-models\whisper-tiny.en
                      </code>{" "}
                      or serve via HTTP and use URL)
                    </li>
                  </ol>
                  <p className="text-muted-foreground mt-2 text-xs">
                    <strong>Tip:</strong> Use a dedicated folder like{" "}
                    <code className="bg-background px-1 rounded">
                      ml-models
                    </code>{" "}
                    or{" "}
                    <code className="bg-background px-1 rounded">
                      transformers-models
                    </code>{" "}
                    for easy reuse with multiple models.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Audio (optional - for automatic timestamp alignment)
          </label>
          <div className="space-y-2">
            <Input
              type="url"
              value={audioUrl}
              onChange={(e) => {
                setAudioUrl(e.target.value);
                setAudioFile(null); // Clear file when URL is entered
              }}
              placeholder="https://example.com/audio.mp3"
              className="font-mono text-sm"
              disabled={!!audioFile}
            />
            <div className="text-xs text-muted-foreground text-center">or</div>
            <Input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setAudioFile(file || null);
                setAudioUrl(""); // Clear URL when file is selected
              }}
              className="text-sm"
              disabled={!!audioUrl}
            />
            {audioFile && (
              <p className="text-xs text-muted-foreground">
                Selected: {audioFile.name} (
                {(audioFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {audioFile
              ? "Using uploaded file (avoids CORS issues)"
              : "If URL fails due to CORS, upload the file directly"}
          </p>
        </div>

        <Tabs value={inputMode} onValueChange={setInputMode} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Text Input</TabsTrigger>
            <TabsTrigger value="json">JSON Input</TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Paste your text here (section markers like [intro] will be
              preserved)
            </label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="[intro]&#10;All behind, leave it all&#10;Leave it... all behind, hear the call&#10;&#10;[verse]&#10;Lost in space, and drifting distant..."
              className="min-h-[200px] font-mono text-sm"
            />
            <Button
              onClick={handleConvert}
              className="w-full"
              variant="outline"
            >
              Convert to JSON
            </Button>
          </TabsContent>
          <TabsContent value="json" className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Paste your transcript JSON here (existing timestamps will be
              preserved)
            </label>
            <Textarea
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              placeholder='[{"word":"hello","start":0.5},{"word":"world","lineBreakAfter":true}]'
              className="min-h-[200px] font-mono text-sm"
            />
          </TabsContent>
        </Tabs>

        {(audioUrl || audioFile) && (
          <Button
            onClick={handleAlign}
            className="w-full"
            disabled={isAligning}
          >
            {isAligning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Aligning...
              </>
            ) : (
              <>
                <AlignLeft className="h-4 w-4 mr-2" />
                Align with Audio
              </>
            )}
          </Button>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {outputJson && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">
                  Total words: {outputJson.length}
                </span>
                {" | "}
                <span>
                  lineBreakAfter:{" "}
                  {outputJson.filter((w) => w.lineBreakAfter).length}
                </span>
                {" | "}
                <span>
                  newParagraphAfter:{" "}
                  {outputJson.filter((w) => w.newParagraphAfter).length}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            <div className="border rounded p-2 bg-muted/30 max-h-[300px] overflow-auto">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {JSON.stringify(outputJson, null, 2)}
              </pre>
            </div>
            <p className="text-xs text-muted-foreground">
              {outputJson.some((w) => w.start !== undefined)
                ? "Start times have been automatically aligned from audio."
                : "Note: Start times are not included. You'll need to set them manually in the transcript editor after importing, or use 'Align with Audio' to get timestamps."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextToTranscriptConverter;
