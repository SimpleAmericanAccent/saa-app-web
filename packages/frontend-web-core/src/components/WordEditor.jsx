import { useState, useEffect } from "react";
import { Button } from "frontend-web-core/src/components/ui/button";
import { Input } from "frontend-web-core/src/components/ui/input";
import { Label } from "frontend-web-core/src/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "frontend-web-core/src/components/ui/dialog";
import { PronunciationEditor } from "frontend-web-core/src/components/PronunciationEditor";

export const WordEditor = ({ word, open, onOpenChange, onSave }) => {
  const [editWord, setEditWord] = useState({
    word: "",
    pronunciation: [],
  });

  useEffect(() => {
    if (word) {
      setEditWord({
        id: word.id,
        word: word.word,
        pronunciation: word.pronunciation || [],
      });
    } else {
      setEditWord({
        word: "",
        pronunciation: [],
      });
    }
  }, [word]);

  const handleSave = async () => {
    if (!editWord.word) return;

    const formattedData = {
      word: editWord.word,
      usages: [
        {
          partOfSpeech: "noun",
          meaning: "",
          pronunciations: editWord.pronunciation.map((p) => ({
            phonemic: p.name,
            isPrimary: true,
          })),
        },
      ],
    };

    try {
      const url = editWord.id
        ? `/api/dictionary/words/${editWord.id}`
        : `/api/dictionary/words`;

      const response = await fetch(url, {
        method: editWord.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        console.error("Failed to save word:", await response.text());
        throw new Error("Failed to save word");
      }

      const savedWord = await response.json();
      console.log("Saved word:", savedWord); // Debug log
      onSave(savedWord);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving word:", error);
    }
  };

  const handlePronunciationChange = (pronunciation) => {
    setEditWord((prev) => ({ ...prev, pronunciation }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{word ? "Edit Word" : "Add New Word"}</DialogTitle>
          <DialogDescription>
            {word
              ? "Edit the word and its pronunciation below."
              : "Enter the details for the new word."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="word">Word</Label>
            <Input
              id="word"
              value={editWord.word}
              onChange={(e) =>
                setEditWord((prev) => ({
                  ...prev,
                  word: e.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>Pronunciation</Label>
            <PronunciationEditor
              initialPronunciation={editWord.pronunciation}
              onChange={handlePronunciationChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
