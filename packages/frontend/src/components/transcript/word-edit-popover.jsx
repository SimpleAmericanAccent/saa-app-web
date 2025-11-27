/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "frontend/src/components/ui/popover";
import { Input } from "frontend/src/components/ui/input";
import { Button } from "frontend/src/components/ui/button";
import { Save, X, Clock } from "lucide-react";

/**
 * Word Edit Popover Component
 * Shows an editable popover when clicking a word in edit mode
 */
const WordEditPopover = ({
  wordObj,
  draftWord,
  children,
  onSave,
  onClose,
  audioRef,
  currentTime,
}) => {
  const [word, setWord] = useState(draftWord?.word || wordObj?.word || "");
  const [start, setStart] = useState(
    draftWord?.start ?? wordObj?.start_time ?? wordObj?.start ?? 0
  );
  const [isOpen, setIsOpen] = useState(false);

  // Update local state when draftWord changes
  useEffect(() => {
    if (draftWord) {
      setWord(draftWord.word || "");
      setStart(draftWord.start ?? 0);
    } else if (wordObj) {
      setWord(wordObj.word || "");
      setStart(wordObj.start_time ?? wordObj.start ?? 0);
    }
  }, [draftWord, wordObj]);

  const handleSave = () => {
    const numStart = parseFloat(start);
    if (!isNaN(numStart)) {
      onSave({
        word: word.trim(),
        start: numStart,
      });
    }
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleCancel = () => {
    // Reset to original values
    if (draftWord) {
      setWord(draftWord.word || "");
      setStart(draftWord.start ?? 0);
    } else if (wordObj) {
      setWord(wordObj.word || "");
      setStart(wordObj.start_time ?? wordObj.start ?? 0);
    }
    setIsOpen(false);
    if (onClose) onClose();
  };

  const setToCurrentTime = () => {
    let time = 0;
    if (audioRef?.current?.currentTime !== undefined) {
      time = audioRef.current.currentTime;
    } else if (currentTime !== undefined) {
      time = currentTime;
    }

    if (time > 0) {
      setStart(time);
    }
  };

  // Handle right-click to open popover
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverAnchor asChild>
        <span onContextMenu={handleContextMenu} style={{ display: "inline" }}>
          {children}
        </span>
      </PopoverAnchor>
      <PopoverContent className="w-80" align="center" side="top">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-3">Edit Word</h3>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Word
            </label>
            <Input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className="w-full"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  handleCancel();
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Start Time (seconds)
              </label>
              {(audioRef || currentTime !== undefined) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={setToCurrentTime}
                  className="h-6 text-xs"
                  title="Set to current audio time"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Now
                </Button>
              )}
            </div>
            <Input
              type="number"
              step="0.001"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  handleCancel();
                }
              }}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="flex items-center gap-1"
            >
              <Save className="h-3 w-3" />
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default WordEditPopover;
