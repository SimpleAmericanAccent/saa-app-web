/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "frontend/src/components/ui/popover";
import { Input } from "frontend/src/components/ui/input";
import { Button } from "frontend/src/components/ui/button";
import { Checkbox } from "frontend/src/components/ui/checkbox";
import { Save, X, Clock, Plus, Trash2 } from "lucide-react";

/**
 * Word Edit Popover Component
 * Shows an editable popover when clicking a word in edit mode
 */
const WordEditPopover = ({
  wordObj,
  draftWord,
  children,
  onSave,
  onInsertWord,
  onDeleteWord,
  shouldOpen,
  onOpenChange,
  onClose,
  audioRef,
  currentTime,
}) => {
  const [word, setWord] = useState(draftWord?.word || wordObj?.word || "");
  const [start, setStart] = useState(
    draftWord?.start ?? wordObj?.start_time ?? wordObj?.start ?? 0
  );
  const [lineBreakAfter, setLineBreakAfter] = useState(
    draftWord?.lineBreakAfter || false
  );
  const [newParagraphAfter, setNewParagraphAfter] = useState(
    draftWord?.newParagraphAfter || false
  );
  const [isOpen, setIsOpen] = useState(false);

  // Sync isOpen with shouldOpen prop
  useEffect(() => {
    if (shouldOpen !== undefined && shouldOpen !== isOpen) {
      setIsOpen(shouldOpen);
      if (onOpenChange) {
        onOpenChange(shouldOpen);
      }
    }
  }, [shouldOpen]); // Only depend on shouldOpen to avoid loops

  // Update local state when draftWord changes
  useEffect(() => {
    if (draftWord) {
      setWord(draftWord.word || "");
      setStart(draftWord.start ?? 0);
      setLineBreakAfter(draftWord.lineBreakAfter || false);
      setNewParagraphAfter(draftWord.newParagraphAfter || false);
    } else if (wordObj) {
      setWord(wordObj.word || "");
      setStart(wordObj.start_time ?? wordObj.start ?? 0);
      setLineBreakAfter(wordObj.lineBreakAfter || false);
      setNewParagraphAfter(wordObj.newParagraphAfter || false);
    }
  }, [draftWord, wordObj]);

  const handleSave = () => {
    const numStart = parseFloat(start);
    if (!isNaN(numStart)) {
      onSave({
        word: word.trim(),
        start: numStart,
        lineBreakAfter,
        newParagraphAfter,
      });
    }
    setIsOpen(false);
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  const handleInsertWord = () => {
    if (onInsertWord && wordObj?.wordIndex !== undefined) {
      const numStart = parseFloat(start);
      const nextStart = !isNaN(numStart) ? numStart + 0.1 : start + 0.1;
      onInsertWord(wordObj.wordIndex, {
        word: "",
        start: nextStart,
        lineBreakAfter: false,
        newParagraphAfter: false,
      });
    }
    setIsOpen(false);
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  const handleDelete = () => {
    if (onDeleteWord && wordObj?.wordIndex !== undefined) {
      if (confirm("Are you sure you want to delete this word?")) {
        onDeleteWord();
        setIsOpen(false);
        if (onOpenChange) onOpenChange(false);
        if (onClose) onClose();
      }
    }
  };

  const handleCancel = () => {
    // Reset to original values
    if (draftWord) {
      setWord(draftWord.word || "");
      setStart(draftWord.start ?? 0);
      setLineBreakAfter(draftWord.lineBreakAfter || false);
      setNewParagraphAfter(draftWord.newParagraphAfter || false);
    } else if (wordObj) {
      setWord(wordObj.word || "");
      setStart(wordObj.start_time ?? wordObj.start ?? 0);
      setLineBreakAfter(wordObj.lineBreakAfter || false);
      setNewParagraphAfter(wordObj.newParagraphAfter || false);
    }
    setIsOpen(false);
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (onOpenChange) onOpenChange(open);
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
    if (onOpenChange) onOpenChange(true);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
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

          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lineBreakAfter"
                checked={lineBreakAfter}
                onCheckedChange={(checked) => {
                  setLineBreakAfter(checked);
                  // Update immediately for visual feedback
                  const numStart = parseFloat(start);
                  if (!isNaN(numStart) && onSave && wordObj?.wordIndex !== undefined) {
                    onSave({
                      word: word.trim() || draftWord?.word || wordObj?.word || "",
                      start: numStart,
                      lineBreakAfter: checked,
                      newParagraphAfter,
                    });
                  }
                }}
              />
              <label
                htmlFor="lineBreakAfter"
                className="text-xs font-medium cursor-pointer"
              >
                New line after
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="newParagraphAfter"
                checked={newParagraphAfter}
                onCheckedChange={(checked) => {
                  setNewParagraphAfter(checked);
                  // Update immediately for visual feedback
                  const numStart = parseFloat(start);
                  if (!isNaN(numStart) && onSave && wordObj?.wordIndex !== undefined) {
                    onSave({
                      word: word.trim() || draftWord?.word || wordObj?.word || "",
                      start: numStart,
                      lineBreakAfter,
                      newParagraphAfter: checked,
                    });
                  }
                }}
              />
              <label
                htmlFor="newParagraphAfter"
                className="text-xs font-medium cursor-pointer"
              >
                New paragraph after
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              {onInsertWord && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInsertWord}
                  className="flex items-center gap-1"
                  title="Insert new word after this one"
                >
                  <Plus className="h-3 w-3" />
                  Add Word
                </Button>
              )}
              {onDeleteWord && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="flex items-center gap-1 text-destructive hover:text-destructive"
                  title="Delete this word"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 ml-auto">
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
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default WordEditPopover;
