/* eslint-disable react/prop-types */
import { useState } from "react";
import { Button } from "core-frontend-web/src/components/ui/button";
import { Textarea } from "core-frontend-web/src/components/ui/textarea";
import { Copy, Download, X } from "lucide-react";
import { cn } from "core-frontend-web/src/lib/utils";

/**
 * Text to Transcript Converter Component
 * Converts plain text to transcript JSON format
 */
const TextToTranscriptConverter = ({ onClose }) => {
  const [inputText, setInputText] = useState("");
  const [outputJson, setOutputJson] = useState(null);
  const [error, setError] = useState(null);

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

  const handleConvert = () => {
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
            Paste your text here (section markers like [intro] will be
            preserved)
          </label>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="[intro]&#10;All behind, leave it all&#10;Leave it... all behind, hear the call&#10;&#10;[verse]&#10;Lost in space, and drifting distant..."
            className="min-h-[200px] font-mono text-sm"
          />
        </div>

        <Button onClick={handleConvert} className="w-full">
          Convert to JSON
        </Button>

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
              Note: Start times are not included. You'll need to set them
              manually in the transcript editor after importing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextToTranscriptConverter;
