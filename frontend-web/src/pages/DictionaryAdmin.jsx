import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash, Link } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhonemeCard } from "@/components/PhonemeCard";
import { PhonemeManager } from "@/components/PhonemeManager";
import { PronunciationEditor } from "@/components/PronunciationEditor";
import { WordEditor } from "@/components/WordEditor";

const DictionaryAdmin = () => {
  const [words, setWords] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [activeTab, setActiveTab] = useState("entries");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/dictionary/words");
      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Failed to fetch words. Status:",
          response.status,
          "Error:",
          errorText
        );
        throw new Error(`Failed to fetch words: ${response.status}`);
      }
      const data = await response.json();
      console.log("Raw API response:", data); // Debug log for raw response

      // Handle both array and object responses
      const wordsArray = Array.isArray(data)
        ? data
        : data.words || data.items || [];
      console.log("Processed words array:", wordsArray); // Debug log for processed array
      setWords(wordsArray);
    } catch (error) {
      console.error("Error fetching words:", error);
      setWords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (word) => {
    // Transform the word data to match the editor's expected format
    const transformedWord = {
      id: word.id,
      word: word.word,
      pronunciation:
        word.usages?.[0]?.pronunciations?.map((p) => ({
          id: p.id,
          name: p.phonemic,
        })) || [],
    };
    setSelectedWord(transformedWord);
    setOpenDialog(true);
  };

  const handleDelete = async (wordId) => {
    if (!window.confirm("Are you sure you want to delete this word?")) return;

    try {
      const response = await fetch(`/api/dictionary/words/${wordId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete word");
      await fetchWords();
    } catch (error) {
      console.error("Error deleting word:", error);
    }
  };

  const handleSave = async (savedWord) => {
    await fetchWords();
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Dictionary Administration</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entries">Dictionary Entries</TabsTrigger>
          <TabsTrigger value="vowels">Vowel Phonemes</TabsTrigger>
          <TabsTrigger value="consonants">Consonant Phonemes</TabsTrigger>
        </TabsList>

        <TabsContent value="entries">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Dictionary Entries</h2>
              <Button onClick={() => setOpenDialog(true)}>Add New Word</Button>
            </div>

            {isLoading ? (
              <div className="text-center py-4">Loading words...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Word</TableHead>
                      <TableHead>Pronunciation</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {words.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No words found in dictionary
                        </TableCell>
                      </TableRow>
                    ) : (
                      words.map((word) => {
                        console.log("Rendering word:", word); // Debug log for each word
                        return (
                          <TableRow key={word.id}>
                            <TableCell>{word.word}</TableCell>
                            <TableCell>
                              {word.usages?.[0]?.pronunciations
                                ?.map((p) => p.phonemic)
                                .join(" ") || "No pronunciation"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleEdit(word)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDelete(word.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            <WordEditor
              word={selectedWord}
              open={openDialog}
              onOpenChange={setOpenDialog}
              onSave={handleSave}
            />
          </div>
        </TabsContent>

        <TabsContent value="vowels">
          <div className="w-full max-w-[2000px] mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Vowel Phonemes</h2>
              <Button onClick={() => handleOpenVowelPhonemeForm()}>
                Add Vowel Phoneme
              </Button>
            </div>

            <PhonemeManager type="vowel" />
          </div>
        </TabsContent>

        <TabsContent value="consonants">
          <div className="w-full max-w-[2000px] mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Consonant Phonemes</h2>
              <Button onClick={() => handleOpenConsonantPhonemeForm()}>
                Add Consonant
              </Button>
            </div>

            <PhonemeManager type="consonant" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DictionaryAdmin;
