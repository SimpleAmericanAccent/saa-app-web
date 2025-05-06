import { useState, useEffect } from "react";
import { Button } from "frontend-web-core/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "frontend-web-core/src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "frontend-web-core/src/components/ui/tabs";
import { PhonemeCard } from "./PhonemeCard";
import { X } from "lucide-react";

export const PronunciationEditor = ({
  initialPronunciation = [],
  onChange,
  className = "",
}) => {
  const [selectedPhonemes, setSelectedPhonemes] =
    useState(initialPronunciation);
  const [vowels, setVowels] = useState([]);
  const [consonants, setConsonants] = useState([]);
  const [activeTab, setActiveTab] = useState("vowels");

  useEffect(() => {
    // Fetch both vowels and consonants when component mounts
    const fetchPhonemes = async () => {
      try {
        // Fetch vowels (lexical sets)
        const vowelsResponse = await fetch("/api/dictionary/lexical-sets");
        if (!vowelsResponse.ok) throw new Error("Failed to fetch vowels");
        const vowelsData = await vowelsResponse.json();
        setVowels(
          vowelsData.map((vowel) => ({
            ...vowel,
            type: "vowel",
            spellings: [], // These would come from your data
            examples: [], // These would come from your data
          }))
        );

        // Fetch consonants
        const consonantsResponse = await fetch(
          "/api/dictionary/consonant-phonemes"
        );
        if (!consonantsResponse.ok)
          throw new Error("Failed to fetch consonants");
        const consonantsData = await consonantsResponse.json();
        setConsonants(
          consonantsData.map((consonant) => ({
            ...consonant,
            type: "consonant",
            spellings: [], // These would come from your data
            examples: [], // These would come from your data
          }))
        );
      } catch (error) {
        console.error("Error fetching phonemes:", error);
      }
    };

    fetchPhonemes();
  }, []);

  const handlePhonemeClick = (phoneme) => {
    const newSequence = [...selectedPhonemes, phoneme];
    setSelectedPhonemes(newSequence);
    onChange?.(newSequence);
  };

  const handleRemovePhoneme = (index) => {
    const newSequence = selectedPhonemes.filter((_, i) => i !== index);
    setSelectedPhonemes(newSequence);
    onChange?.(newSequence);
  };

  const renderPhonemeGrid = (phonemes, category) => {
    // Group phonemes by their category
    const groupedPhonemes = phonemes.reduce((acc, phoneme) => {
      const group = phoneme.category || "uncategorized";
      if (!acc[group]) acc[group] = [];
      acc[group].push(phoneme);
      return acc;
    }, {});

    return Object.entries(groupedPhonemes).map(([category, items]) => (
      <Card key={category} className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg capitalize">{category}</CardTitle>
          <CardDescription>
            {category === "monophthongs" && "Single vowel sounds"}
            {category === "diphthongs" && "Combined vowel sounds"}
            {category === "rColored" && "Vowels followed by 'r'"}
            {category === "unstressed" && "Vowels in unstressed syllables"}
            {category === "stops" && "Plosive consonants"}
            {category === "fricatives" && "Fricative consonants"}
            {category === "affricates" && "Affricate consonants"}
            {category === "approximants" && "Approximant consonants"}
            {category === "nasals" && "Nasal consonants"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {items.map((phoneme) => (
              <PhonemeCard
                key={phoneme.id}
                {...phoneme}
                className="hover:bg-accent transition-colors w-full"
                onClick={() => handlePhonemeClick(phoneme)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className={className}>
      {/* Selected Phonemes Sequence */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Pronunciation Sequence</CardTitle>
          <CardDescription>
            Click phonemes below to add them to the sequence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 min-h-[60px] p-4 border rounded-lg">
            {selectedPhonemes.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                No phonemes selected
              </div>
            ) : (
              selectedPhonemes.map((phoneme, index) => (
                <div
                  key={`${phoneme.id}-${index}`}
                  className="relative group w-[60px]"
                >
                  <PhonemeCard {...phoneme} className="w-[60px]" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoneme(index);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Phoneme Selection Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="vowels">Vowels</TabsTrigger>
          <TabsTrigger value="consonants">Consonants</TabsTrigger>
        </TabsList>
        <TabsContent value="vowels" className="mt-0">
          {renderPhonemeGrid(vowels, "vowels")}
        </TabsContent>
        <TabsContent value="consonants" className="mt-0">
          {renderPhonemeGrid(consonants, "consonants")}
        </TabsContent>
      </Tabs>
    </div>
  );
};
