/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo } from "react";
import { Button } from "frontend/src/components/ui/button";
import { Input } from "frontend/src/components/ui/input";
import { Copy, Download, Edit2, X } from "lucide-react";
import { cn } from "frontend/src/lib/utils";

/**
 * Transcript Editor Component
 * Allows admins to edit the start time for each word in the transcript
 * Maintains a draft version separate from the original
 * Provides copy/paste and download functionality
 */
const TranscriptEditor = ({ annotatedTranscript, onClose }) => {
  // Flatten the transcript structure to a simple array of words
  const originalWords = useMemo(() => {
    if (!annotatedTranscript || !Array.isArray(annotatedTranscript)) {
      return [];
    }

    return annotatedTranscript.flatMap((paragraph) => {
      if (!paragraph.alignment || !Array.isArray(paragraph.alignment)) {
        return [];
      }
      return paragraph.alignment.map((wordObj) => ({
        word: wordObj.word || "",
        start: wordObj.start_time || wordObj.start || 0,
        lineBreakAfter: wordObj.lineBreakAfter || false,
        newParagraphAfter: wordObj.newParagraphAfter || false,
        wordIndex: wordObj.wordIndex,
      }));
    });
  }, [annotatedTranscript]);

  // Draft state - initialize with original words
  const [draftWords, setDraftWords] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize draft when original words change
  useEffect(() => {
    setDraftWords(JSON.parse(JSON.stringify(originalWords)));
    setHasChanges(false);
  }, [originalWords]);

  // Check if there are changes
  useEffect(() => {
    const changed =
      JSON.stringify(draftWords) !== JSON.stringify(originalWords);
    setHasChanges(changed);
  }, [draftWords, originalWords]);

  // Update a word's start time
  const updateWordStart = (index, newStart) => {
    const numValue = parseFloat(newStart);
    if (isNaN(numValue)) return;

    setDraftWords((prev) =>
      prev.map((word, i) => (i === index ? { ...word, start: numValue } : word))
    );
  };

  // Reset to original
  const resetToOriginal = () => {
    setDraftWords(JSON.parse(JSON.stringify(originalWords)));
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(draftWords, null, 2);
      await navigator.clipboard.writeText(jsonString);
      alert("Transcript copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy to clipboard");
    }
  };

  // Download as JSON file
  const downloadFile = () => {
    const jsonString = JSON.stringify(draftWords, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-draft-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (originalWords.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No transcript data available
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Edit2 className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Edit Transcript Start Times</h2>
          {hasChanges && (
            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
              Unsaved changes
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between p-4 border-b gap-2 bg-muted/30">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToOriginal}
            disabled={!hasChanges}
          >
            Reset
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-1" />
            Copy JSON
          </Button>
          <Button variant="outline" size="sm" onClick={downloadFile}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>

      {/* Editor Table */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left p-2 text-xs font-semibold w-12">
                    #
                  </th>
                  <th className="text-left p-2 text-xs font-semibold">Word</th>
                  <th className="text-left p-2 text-xs font-semibold w-32">
                    Start (seconds)
                  </th>
                  <th className="text-left p-2 text-xs font-semibold w-24">
                    Original
                  </th>
                  <th className="text-left p-2 text-xs font-semibold w-32">
                    Flags
                  </th>
                </tr>
              </thead>
              <tbody>
                {draftWords.map((word, index) => {
                  const originalWord = originalWords[index];
                  const isChanged =
                    originalWord && word.start !== originalWord.start;

                  return (
                    <tr
                      key={index}
                      className={cn(
                        "border-b hover:bg-muted/30",
                        isChanged && "bg-orange-50 dark:bg-orange-950/20"
                      )}
                    >
                      <td className="p-2 text-xs text-muted-foreground">
                        {index}
                      </td>
                      <td className="p-2 font-medium">{word.word}</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.001"
                          value={word.start}
                          onChange={(e) =>
                            updateWordStart(index, e.target.value)
                          }
                          className={cn(
                            "w-full h-8 text-sm",
                            isChanged && "border-orange-500"
                          )}
                        />
                      </td>
                      <td className="p-2 text-xs text-muted-foreground">
                        {originalWord?.start?.toFixed(3) || "—"}
                      </td>
                      <td className="p-2 text-xs text-muted-foreground">
                        {word.lineBreakAfter && (
                          <span className="mr-1">[LB]</span>
                        )}
                        {word.newParagraphAfter && <span>[NP]</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t bg-muted/30 text-xs text-muted-foreground">
        <p>
          Total words: {draftWords.length} | Modified:{" "}
          {
            draftWords.filter(
              (word, i) => word.start !== originalWords[i]?.start
            ).length
          }
        </p>
        <p className="mt-1">
          After editing, copy the JSON or download the file, then manually
          upload to S3.
        </p>
      </div>
    </div>
  );
};

export default TranscriptEditor;
