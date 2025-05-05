import { useState, useMemo, useEffect } from "react";
import wlsData from "shared/frontend-web-core/src/data/wls-data.json";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Download,
  BarChart,
  Table,
  BookOpen,
  Filter,
  Star,
  Volume2,
  VolumeX,
  Info,
  HelpCircle,
  Bookmark,
  BookmarkCheck,
  Share2,
  Copy,
  Check,
  FolderPlus,
  Folder,
  Play,
  Pause,
  RotateCcw,
  Printer,
  FileText,
  PenTool,
  Brain,
  Lightbulb,
  Zap,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function WLSDataExplorer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("vowels");
  const [expandedPhonemes, setExpandedPhonemes] = useState({});
  const [searchField, setSearchField] = useState("all"); // all, name, examples, pattern
  const [viewMode, setViewMode] = useState("cards"); // cards, table, stats
  const [selectedPhonemes, setSelectedPhonemes] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [filterPattern, setFilterPattern] = useState("all");
  const [availablePatterns, setAvailablePatterns] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    // Load favorites from localStorage if available
    const savedFavorites = localStorage.getItem("wls-favorites");
    return savedFavorites
      ? JSON.parse(savedFavorites)
      : { vowels: [], consonants: [] };
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showPronunciation, setShowPronunciation] = useState(true);
  const [copiedPhoneme, setCopiedPhoneme] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [sortBy, setSortBy] = useState("name"); // name, patternCount, exampleCount

  // New state variables for enhanced features
  const [collections, setCollections] = useState(() => {
    const savedCollections = localStorage.getItem("wls-collections");
    return savedCollections ? JSON.parse(savedCollections) : [];
  });
  const [activeCollection, setActiveCollection] = useState(null);
  const [showQuizMode, setShowQuizMode] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [quizHistory, setQuizHistory] = useState([]);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem("wls-notes");
    return savedNotes ? JSON.parse(savedNotes) : {};
  });
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [visualizerMode, setVisualizerMode] = useState("tree"); // tree, network, matrix
  const [learningProgress, setLearningProgress] = useState(() => {
    const savedProgress = localStorage.getItem("wls-learning-progress");
    return savedProgress ? JSON.parse(savedProgress) : {};
  });
  const [showPrintView, setShowPrintView] = useState(false);
  const [customTags, setCustomTags] = useState(() => {
    const savedTags = localStorage.getItem("wls-custom-tags");
    return savedTags ? JSON.parse(savedTags) : {};
  });
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState(null);
  const [studySession, setStudySession] = useState({
    active: false,
    startTime: null,
    phonemesStudied: [],
  });

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem("wls-favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Save collections to localStorage
  useEffect(() => {
    localStorage.setItem("wls-collections", JSON.stringify(collections));
  }, [collections]);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem("wls-notes", JSON.stringify(notes));
  }, [notes]);

  // Save learning progress to localStorage
  useEffect(() => {
    localStorage.setItem(
      "wls-learning-progress",
      JSON.stringify(learningProgress)
    );
  }, [learningProgress]);

  // Save custom tags to localStorage
  useEffect(() => {
    localStorage.setItem("wls-custom-tags", JSON.stringify(customTags));
  }, [customTags]);

  // Toggle expanded state for a phoneme
  const togglePhoneme = (phonemeName) => {
    setExpandedPhonemes((prev) => ({
      ...prev,
      [phonemeName]: !prev[phonemeName],
    }));
  };

  // Toggle selection of a phoneme for comparison
  const togglePhonemeSelection = (phonemeName) => {
    setSelectedPhonemes((prev) => {
      if (prev.includes(phonemeName)) {
        return prev.filter((p) => p !== phonemeName);
      } else {
        return [...prev, phonemeName].slice(0, 3); // Limit to 3 selections
      }
    });
  };

  // Toggle favorite status for a phoneme
  const toggleFavorite = (phonemeName) => {
    setFavorites((prev) => {
      const categoryFavorites = [...prev[selectedCategory]];
      const index = categoryFavorites.indexOf(phonemeName);

      if (index === -1) {
        // Add to favorites
        return {
          ...prev,
          [selectedCategory]: [...categoryFavorites, phonemeName],
        };
      } else {
        // Remove from favorites
        return {
          ...prev,
          [selectedCategory]: categoryFavorites.filter(
            (p) => p !== phonemeName
          ),
        };
      }
    });
  };

  // Copy phoneme data to clipboard
  const copyPhonemeData = (phonemeName) => {
    const phoneme = wlsData[selectedCategory][phonemeName];
    const dataToCopy = JSON.stringify(phoneme, null, 2);
    navigator.clipboard.writeText(dataToCopy);

    setCopiedPhoneme(phonemeName);
    setTimeout(() => setCopiedPhoneme(null), 2000);
  };

  // Extract available patterns for filtering
  useEffect(() => {
    const patterns = new Set();
    Object.values(wlsData[selectedCategory]).forEach((phoneme) => {
      if (phoneme.spellings) {
        phoneme.spellings.forEach((spelling) => {
          if (spelling.pattern) {
            patterns.add(spelling.pattern);
          }
        });
      }
    });
    setAvailablePatterns(Array.from(patterns).sort());
  }, [selectedCategory]);

  // Filter data based on search term, selected field, pattern filter, and favorites
  const filteredData = useMemo(() => {
    return Object.entries(wlsData[selectedCategory])
      .filter(([key, value]) => {
        // Apply favorites filter
        if (showFavoritesOnly && !favorites[selectedCategory].includes(key)) {
          return false;
        }

        // Apply search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();

          if (searchField === "all") {
            if (
              !(
                key.toLowerCase().includes(searchLower) ||
                JSON.stringify(value).toLowerCase().includes(searchLower)
              )
            ) {
              return false;
            }
          } else if (searchField === "name") {
            if (!key.toLowerCase().includes(searchLower)) {
              return false;
            }
          } else if (searchField === "examples") {
            const examples =
              value.spellings?.flatMap((s) => s.examples || []) || [];
            if (
              !examples.some((ex) => ex.toLowerCase().includes(searchLower))
            ) {
              return false;
            }
          } else if (searchField === "pattern") {
            const patterns = value.spellings?.map((s) => s.pattern) || [];
            if (!patterns.some((p) => p.toLowerCase().includes(searchLower))) {
              return false;
            }
          }
        }

        // Apply pattern filter
        if (filterPattern !== "all") {
          const hasPattern = value.spellings?.some(
            (s) => s.pattern === filterPattern
          );
          if (!hasPattern) {
            return false;
          }
        }

        return true;
      })
      .sort(([keyA], [keyB]) => {
        if (sortBy === "name") {
          return keyA.localeCompare(keyB);
        } else if (sortBy === "patternCount") {
          const countA = wlsData[selectedCategory][keyA].spellings?.length || 0;
          const countB = wlsData[selectedCategory][keyB].spellings?.length || 0;
          return countB - countA;
        } else if (sortBy === "exampleCount") {
          const countA =
            wlsData[selectedCategory][keyA].spellings?.reduce(
              (sum, s) => sum + (s.examples?.length || 0),
              0
            ) || 0;
          const countB =
            wlsData[selectedCategory][keyB].spellings?.reduce(
              (sum, s) => sum + (s.examples?.length || 0),
              0
            ) || 0;
          return countB - countA;
        }
        return 0;
      })
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
  }, [
    wlsData,
    selectedCategory,
    searchTerm,
    searchField,
    filterPattern,
    showFavoritesOnly,
    favorites,
    sortBy,
  ]);

  // Calculate statistics
  const stats = useMemo(() => {
    const data = wlsData[selectedCategory];
    const totalPhonemes = Object.keys(data).length;
    const totalSpellings = Object.values(data).reduce(
      (sum, phoneme) => sum + (phoneme.spellings?.length || 0),
      0
    );
    const totalExamples = Object.values(data).reduce(
      (sum, phoneme) =>
        sum +
        (phoneme.spellings?.reduce(
          (s, spelling) => s + (spelling.examples?.length || 0),
          0
        ) || 0),
      0
    );

    // Pattern distribution
    const patternCounts = {};
    Object.values(data).forEach((phoneme) => {
      if (phoneme.spellings) {
        phoneme.spellings.forEach((spelling) => {
          if (spelling.pattern) {
            patternCounts[spelling.pattern] =
              (patternCounts[spelling.pattern] || 0) + 1;
          }
        });
      }
    });

    // Example distribution
    const exampleCounts = {};
    Object.values(data).forEach((phoneme) => {
      if (phoneme.spellings) {
        phoneme.spellings.forEach((spelling) => {
          if (spelling.examples) {
            spelling.examples.forEach((example) => {
              exampleCounts[example] = (exampleCounts[example] || 0) + 1;
            });
          }
        });
      }
    });

    return {
      totalPhonemes,
      totalSpellings,
      totalExamples,
      patternCounts,
      exampleCounts,
    };
  }, [selectedCategory]);

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Export data as JSON
  const exportData = () => {
    const dataStr = JSON.stringify(wlsData[selectedCategory], null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `wls-${selectedCategory}-data.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Get pronunciation guide for a phoneme
  const getPronunciationGuide = (phonemeName) => {
    const phoneme = wlsData[selectedCategory][phonemeName];
    if (!phoneme || !phoneme.representations) return null;

    const phonetic = phoneme.representations.phonetic;
    if (!phonetic) return null;

    // Simple pronunciation guide based on the phonetic representation
    let guide = "";

    if (selectedCategory === "vowels") {
      if (phonemeName === "FLEECE") guide = "Like 'ee' in 'see'";
      else if (phonemeName === "happY") guide = "Like 'y' in 'happy'";
      else if (phonemeName === "KIT") guide = "Like 'i' in 'kit'";
      else if (phonemeName === "DRESS") guide = "Like 'e' in 'bed'";
      else if (phonemeName === "TRAP") guide = "Like 'a' in 'cat'";
      else if (phonemeName === "STRUT") guide = "Like 'u' in 'strut'";
      else if (phonemeName === "LOT") guide = "Like 'o' in 'lot'";
      else if (phonemeName === "FOOT") guide = "Like 'oo' in 'foot'";
      else if (phonemeName === "GOOSE") guide = "Like 'oo' in 'goose'";
      else if (phonemeName === "FACE") guide = "Like 'ay' in 'face'";
      else if (phonemeName === "PRICE") guide = "Like 'i' in 'price'";
      else if (phonemeName === "CHOICE") guide = "Like 'oy' in 'boy'";
      else if (phonemeName === "GOAT") guide = "Like 'o' in 'goat'";
      else if (phonemeName === "MOUTH") guide = "Like 'ou' in 'mouth'";
      else if (phonemeName === "commA") guide = "Like 'a' in 'about'";
    } else if (selectedCategory === "consonants") {
      if (phonemeName === "P") guide = "Like 'p' in 'pie'";
      else if (phonemeName === "B") guide = "Like 'b' in 'boy'";
      else if (phonemeName === "T") guide = "Like 't' in 'to'";
      else if (phonemeName === "D") guide = "Like 'd' in 'do'";
      else if (phonemeName === "K") guide = "Like 'k' in 'key'";
      else if (phonemeName === "G") guide = "Like 'g' in 'go'";
      else if (phonemeName === "M") guide = "Like 'm' in 'man'";
      else if (phonemeName === "N") guide = "Like 'n' in 'no'";
      else if (phonemeName === "NG") guide = "Like 'ng' in 'sing'";
      else if (phonemeName === "F") guide = "Like 'f' in 'friend'";
      else if (phonemeName === "V") guide = "Like 'v' in 'very'";
      else if (phonemeName === "TH_voiceless") guide = "Like 'th' in 'thin'";
      else if (phonemeName === "TH_voiced") guide = "Like 'th' in 'this'";
      else if (phonemeName === "S") guide = "Like 's' in 'see'";
      else if (phonemeName === "Z") guide = "Like 'z' in 'zoo'";
      else if (phonemeName === "SH") guide = "Like 'sh' in 'ship'";
      else if (phonemeName === "ZH") guide = "Like 's' in 'vision'";
      else if (phonemeName === "H") guide = "Like 'h' in 'hat'";
      else if (phonemeName === "L") guide = "Like 'l' in 'like'";
      else if (phonemeName === "R") guide = "Like 'r' in 'red'";
      else if (phonemeName === "W") guide = "Like 'w' in 'water'";
      else if (phonemeName === "Y") guide = "Like 'y' in 'yes'";
    }

    return guide;
  };

  // Add this helper function before the renderPhonemeCard function
  const formatRepresentationValue = (value) => {
    if (Array.isArray(value)) {
      return value.map((v, i) => (
        <div key={i} className="flex items-center gap-1">
          <span className="text-muted-foreground">Option {i + 1}:</span>
          <span>{v}</span>
        </div>
      ));
    }
    return value;
  };

  // Render phoneme card
  const renderPhonemeCard = (key, value) => {
    const isFavorite = favorites[selectedCategory].includes(key);
    const pronunciationGuide = getPronunciationGuide(key);
    const progress = learningProgress[key];
    const phonemeNotes = notes[key];
    const phonemeTags = customTags[key] || [];

    return (
      <Card
        key={key}
        className={`
          ${selectedPhonemes.includes(key) ? "border-primary" : ""}
          ${progress?.status === "mastered" ? "bg-green-50" : ""}
          ${progress?.status === "learning" ? "bg-yellow-50" : ""}
          ${progress?.status === "difficult" ? "bg-red-50" : ""}
        `}
      >
        <Collapsible
          open={expandedPhonemes[key]}
          onOpenChange={() => togglePhoneme(key)}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePhonemeSelection(key);
                    }}
                  >
                    {selectedPhonemes.includes(key) ? "✓" : ""}
                  </Button>
                  <CardTitle className="text-lg">{key}</CardTitle>
                  {isFavorite && <Star className="h-4 w-4 text-yellow-500" />}
                  {progress && (
                    <Badge
                      variant={
                        progress.status === "mastered"
                          ? "success"
                          : progress.status === "learning"
                          ? "warning"
                          : "destructive"
                      }
                    >
                      {progress.status}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {showPronunciation && pronunciationGuide && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{pronunciationGuide}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(key);
                    }}
                  >
                    {isFavorite ? (
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    ) : (
                      <Star className="h-4 w-4" />
                    )}
                  </Button>
                  {expandedPhonemes[key] ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </div>
              </div>
              {phonemeTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {phonemeTags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="mb-4">
                <h3 className="text-md font-medium mb-2">Representations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {value.representations &&
                    Object.entries(value.representations).map(
                      ([repType, repValue]) => (
                        <div key={repType} className="bg-muted p-2 rounded">
                          <span className="font-medium">{repType}:</span>{" "}
                          {formatRepresentationValue(repValue)}
                        </div>
                      )
                    )}
                </div>
                {pronunciationGuide && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <span className="font-medium">Pronunciation:</span>{" "}
                    {pronunciationGuide}
                  </div>
                )}
              </div>

              <h3 className="text-md font-medium mb-2">Spellings</h3>
              <div className="grid gap-4">
                {value.spellings &&
                  value.spellings.map((spelling, index) => (
                    <div key={index} className="border rounded p-3">
                      <div className="font-medium mb-1">
                        Pattern: {spelling.pattern}
                      </div>
                      {spelling.examples && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            Examples:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {spelling.examples.map((example, i) => (
                              <span
                                key={i}
                                className="bg-muted px-2 py-1 rounded text-sm"
                              >
                                {example}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
              {phonemeNotes && (
                <div className="mt-4 p-2 bg-muted rounded">
                  <div className="font-medium mb-1">Notes:</div>
                  <p className="text-sm">{phonemeNotes.text}</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    Last updated:{" "}
                    {new Date(phonemeNotes.lastModified).toLocaleDateString()}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyPhonemeData(key)}
              >
                {copiedPhoneme === key ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Data
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleFavorite(key)}
              >
                {isFavorite ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 mr-1" />
                    Remove from Favorites
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4 mr-1" />
                    Add to Favorites
                  </>
                )}
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <PenTool className="h-4 w-4 mr-1" />
                    Add Note
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">Add Note</h4>
                    <Textarea
                      placeholder="Enter your notes..."
                      value={notes[key]?.text || ""}
                      onChange={(e) => updateNote(key, e.target.value)}
                    />
                    <Button
                      className="w-full"
                      onClick={() => {
                        // Save note
                      }}
                    >
                      Save Note
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Brain className="h-4 w-4 mr-1" />
                    Learning Status
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">Update Learning Status</h4>
                    <RadioGroup
                      value={learningProgress[key]?.status || "new"}
                      onValueChange={(value) =>
                        updateLearningProgress(key, value)
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new" id={`${key}-new`} />
                        <Label htmlFor={`${key}-new`}>New</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="learning"
                          id={`${key}-learning`}
                        />
                        <Label htmlFor={`${key}-learning`}>Learning</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="mastered"
                          id={`${key}-mastered`}
                        />
                        <Label htmlFor={`${key}-mastered`}>Mastered</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="difficult"
                          id={`${key}-difficult`}
                        />
                        <Label htmlFor={`${key}-difficult`}>Difficult</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </PopoverContent>
              </Popover>
            </CardFooter>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  // Render comparison view
  const renderComparisonView = () => {
    if (selectedPhonemes.length === 0) {
      return (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-muted-foreground">
            Select up to 3 phonemes to compare
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedPhonemes.map((phonemeName) => {
            const phoneme = wlsData[selectedCategory][phonemeName];
            const pronunciationGuide = getPronunciationGuide(phonemeName);

            return (
              <Card key={phonemeName}>
                <CardHeader>
                  <CardTitle>{phonemeName}</CardTitle>
                  {pronunciationGuide && (
                    <CardDescription>{pronunciationGuide}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">
                      Representations
                    </h3>
                    <div className="grid gap-2">
                      {phoneme.representations &&
                        Object.entries(phoneme.representations).map(
                          ([repType, repValue]) => (
                            <div
                              key={repType}
                              className="bg-muted p-2 rounded text-sm"
                            >
                              <span className="font-medium">{repType}:</span>{" "}
                              {formatRepresentationValue(repValue)}
                            </div>
                          )
                        )}
                    </div>
                  </div>

                  <h3 className="text-sm font-medium mb-2">Spellings</h3>
                  <div className="grid gap-2">
                    {phoneme.spellings &&
                      phoneme.spellings.map((spelling, index) => (
                        <div key={index} className="border rounded p-2 text-sm">
                          <div className="font-medium">
                            Pattern: {spelling.pattern}
                          </div>
                          {spelling.examples && (
                            <div className="mt-1">
                              <div className="text-xs text-muted-foreground">
                                Examples:
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {spelling.examples
                                  .slice(0, 5)
                                  .map((example, i) => (
                                    <span
                                      key={i}
                                      className="bg-muted px-1 py-0.5 rounded text-xs"
                                    >
                                      {example}
                                    </span>
                                  ))}
                                {spelling.examples.length > 5 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{spelling.examples.length - 5} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // Render statistics view
  const renderStatsView = () => (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total {selectedCategory}:</span>
                <span className="font-medium">{stats.totalPhonemes}</span>
              </div>
              <div className="flex justify-between">
                <span>Total spellings:</span>
                <span className="font-medium">{stats.totalSpellings}</span>
              </div>
              <div className="flex justify-between">
                <span>Total examples:</span>
                <span className="font-medium">{stats.totalExamples}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg. examples per spelling:</span>
                <span className="font-medium">
                  {stats.totalSpellings > 0
                    ? (stats.totalExamples / stats.totalSpellings).toFixed(1)
                    : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Favorites:</span>
                <span className="font-medium">
                  {favorites[selectedCategory].length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Pattern Distribution</CardTitle>
            <CardDescription>
              Number of phonemes using each spelling pattern
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.patternCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([pattern, count]) => (
                  <div key={pattern} className="flex items-center gap-2">
                    <div className="w-24 text-sm">{pattern}</div>
                    <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${(count / stats.totalPhonemes) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="w-8 text-right text-sm">{count}</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Common Examples</CardTitle>
          <CardDescription>
            Examples that appear in multiple phonemes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.exampleCounts)
              .filter(([_, count]) => count > 1)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 12)
              .map(([example, count]) => (
                <div key={example} className="border rounded p-3">
                  <div className="font-medium">{example}</div>
                  <div className="text-sm text-muted-foreground">
                    Appears in {count} phoneme{count > 1 ? "s" : ""}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Create a new collection
  const createCollection = (name, description) => {
    setCollections((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        description,
        phonemes: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    ]);
  };

  // Add/remove phoneme to/from collection
  const togglePhonemeInCollection = (collectionId, phonemeName) => {
    setCollections((prev) =>
      prev.map((collection) => {
        if (collection.id === collectionId) {
          const phonemes = collection.phonemes.includes(phonemeName)
            ? collection.phonemes.filter((p) => p !== phonemeName)
            : [...collection.phonemes, phonemeName];
          return {
            ...collection,
            phonemes,
            lastModified: new Date().toISOString(),
          };
        }
        return collection;
      })
    );
  };

  // Start a quiz session
  const startQuiz = () => {
    setShowQuizMode(true);
    setQuizScore({ correct: 0, total: 0 });
    // Initialize quiz questions based on current filtered data
  };

  // Add or update a note for a phoneme
  const updateNote = (phonemeName, noteText) => {
    setNotes((prev) => ({
      ...prev,
      [phonemeName]: {
        text: noteText,
        lastModified: new Date().toISOString(),
      },
    }));
  };

  // Update learning progress for a phoneme
  const updateLearningProgress = (phonemeName, status) => {
    setLearningProgress((prev) => ({
      ...prev,
      [phonemeName]: {
        status,
        lastUpdated: new Date().toISOString(),
      },
    }));
  };

  // Add or update custom tags for a phoneme
  const updateCustomTags = (phonemeName, tags) => {
    setCustomTags((prev) => ({
      ...prev,
      [phonemeName]: tags,
    }));
  };

  // Start/end a study session
  const toggleStudySession = () => {
    if (!studySession.active) {
      setStudySession({
        active: true,
        startTime: new Date().toISOString(),
        phonemesStudied: [],
      });
    } else {
      // Save study session statistics
      const endTime = new Date().toISOString();
      // Process and save study session data
      setStudySession({
        active: false,
        startTime: null,
        phonemesStudied: [],
      });
    }
  };

  // Generate a print-friendly view
  const generatePrintView = () => {
    setShowPrintView(true);
    // Format current data for printing
  };

  // Export study data
  const exportStudyData = () => {
    const data = {
      learningProgress,
      notes,
      customTags,
      collections,
      quizHistory,
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileName = `wls-study-data-${new Date().toISOString()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileName);
    linkElement.click();
  };

  // Render collection management dialog
  const renderCollectionDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FolderPlus className="h-4 w-4 mr-1" />
          Manage Collections
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Collections</DialogTitle>
          <DialogDescription>
            Create and manage your phoneme collections
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {collections.map((collection) => (
            <Card key={collection.id}>
              <CardHeader>
                <CardTitle>{collection.name}</CardTitle>
                <CardDescription>{collection.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {collection.phonemes.map((phoneme) => (
                    <Badge key={phoneme} variant="secondary">
                      {phoneme}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveCollection(collection.id)}
                >
                  View
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setCollections((prev) =>
                      prev.filter((c) => c.id !== collection.id)
                    );
                  }}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              // Open create collection form
            }}
          >
            Create New Collection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Render study progress dialog
  const renderStudyProgressDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Brain className="h-4 w-4 mr-1" />
          Study Progress
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Study Progress</DialogTitle>
          <DialogDescription>
            Track your learning progress and study statistics
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Overall Progress</h3>
            <Progress
              value={
                (Object.keys(learningProgress).length /
                  Object.keys(wlsData[selectedCategory]).length) *
                100
              }
            />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Recent Activity</h3>
            <div className="space-y-2">
              {Object.entries(learningProgress)
                .sort(
                  (a, b) =>
                    new Date(b[1].lastUpdated) - new Date(a[1].lastUpdated)
                )
                .slice(0, 5)
                .map(([phoneme, progress]) => (
                  <div
                    key={phoneme}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <span>{phoneme}</span>
                    <Badge>{progress.status}</Badge>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Quiz Performance</h3>
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {quizHistory.length > 0
                      ? Math.round(
                          (quizHistory.reduce(
                            (sum, quiz) => sum + quiz.accuracy,
                            0
                          ) /
                            quizHistory.length) *
                            100
                        )
                      : 0}
                    %
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Quizzes Taken</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{quizHistory.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Study Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {/* Calculate total study time */}
                    0h
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Render flashcard interface
  const renderFlashcardMode = () => {
    if (!flashcardMode) return null;

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Flashcards</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFlashcardMode(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {currentFlashcard ? (
            <div className="space-y-4">
              <div className="text-center text-2xl font-bold">
                {currentFlashcard.phoneme}
              </div>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => {
                    // Show next flashcard
                  }}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Mark as known
                  }}
                >
                  I Know This
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p>No more flashcards</p>
              <Button
                className="mt-4"
                onClick={() => {
                  // Reset flashcards
                }}
              >
                Start Over
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="w-full">
            <Progress
              value={
                (studySession.phonemesStudied.length /
                  Object.keys(filteredData).length) *
                100
              }
            />
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CardTitle>WLS Data Explorer</CardTitle>
              <Dialog open={showHelp} onOpenChange={setShowHelp}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>How to Use the WLS Data Explorer</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <h3 className="font-medium">Searching</h3>
                      <p className="text-sm text-muted-foreground">
                        Use the search bar to find phonemes by name, examples,
                        or patterns. You can also filter by specific spelling
                        patterns.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Comparing Phonemes</h3>
                      <p className="text-sm text-muted-foreground">
                        Select up to 3 phonemes using the checkboxes to compare
                        them side by side.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Favorites</h3>
                      <p className="text-sm text-muted-foreground">
                        Mark phonemes as favorites to quickly access them later.
                        Toggle "Show Favorites Only" to see only your favorite
                        phonemes.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Statistics</h3>
                      <p className="text-sm text-muted-foreground">
                        View statistics about the data to understand patterns
                        and distributions.
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowStats(!showStats)}
                    >
                      <BarChart className="h-4 w-4 mr-1" />
                      Stats
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View statistics about the data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={exportData}>
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export data as JSON</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex gap-4">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vowels">Vowels</SelectItem>
                  <SelectItem value="consonants">Consonants</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-8"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1.5 h-7 w-7 p-0"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={searchField === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchField("all")}
              >
                All
              </Button>
              <Button
                variant={searchField === "name" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchField("name")}
              >
                Phoneme Name
              </Button>
              <Button
                variant={searchField === "examples" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchField("examples")}
              >
                Examples
              </Button>
              <Button
                variant={searchField === "pattern" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchField("pattern")}
              >
                Pattern
              </Button>

              <div className="ml-auto flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="favorites"
                    checked={showFavoritesOnly}
                    onCheckedChange={setShowFavoritesOnly}
                  />
                  <Label htmlFor="favorites">Show Favorites Only</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="pronunciation"
                    checked={showPronunciation}
                    onCheckedChange={setShowPronunciation}
                  />
                  <Label htmlFor="pronunciation">Show Pronunciation</Label>
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="patternCount">Pattern Count</SelectItem>
                    <SelectItem value="exampleCount">Example Count</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPattern} onValueChange={setFilterPattern}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All patterns</SelectItem>
                    {availablePatterns.map((pattern) => (
                      <SelectItem key={pattern} value={pattern}>
                        {pattern}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showStats && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>{renderStatsView()}</CardContent>
        </Card>
      )}

      {selectedPhonemes.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Comparison</CardTitle>
            <CardDescription>
              Comparing {selectedPhonemes.length} phonemes
            </CardDescription>
          </CardHeader>
          <CardContent>{renderComparisonView()}</CardContent>
        </Card>
      )}

      <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="cards">
            <BookOpen className="h-4 w-4 mr-1" />
            Cards
          </TabsTrigger>
          <TabsTrigger value="table">
            <Table className="h-4 w-4 mr-1" />
            Table
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cards">
          <div className="grid gap-4">
            {Object.entries(filteredData).map(([key, value]) =>
              renderPhonemeCard(key, value)
            )}
          </div>
        </TabsContent>

        <TabsContent value="table">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">Phoneme</th>
                      <th className="p-2 text-left">Patterns</th>
                      <th className="p-2 text-left">Examples</th>
                      <th className="p-2 text-left">Representations</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(filteredData).map(([key, value], index) => (
                      <tr
                        key={key}
                        className={
                          index % 2 === 0 ? "bg-background" : "bg-muted/50"
                        }
                      >
                        <td className="p-2 border-t">
                          <div className="flex items-center gap-1">
                            {key}
                            {favorites[selectedCategory].includes(key) && (
                              <Star className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                        </td>
                        <td className="p-2 border-t">
                          {value.spellings?.map((s) => s.pattern).join(", ")}
                        </td>
                        <td className="p-2 border-t">
                          {value.spellings
                            ?.flatMap((s) => s.examples || [])
                            .slice(0, 5)
                            .join(", ")}
                          {value.spellings?.flatMap((s) => s.examples || [])
                            .length > 5 && "..."}
                        </td>
                        <td className="p-2 border-t">
                          {value.representations &&
                            Object.entries(value.representations).map(
                              ([repType, repValue]) => (
                                <div key={repType} className="text-sm">
                                  <span className="font-medium">
                                    {repType}:
                                  </span>{" "}
                                  {formatRepresentationValue(repValue)}
                                </div>
                              )
                            )}
                        </td>
                        <td className="p-2 border-t">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => toggleFavorite(key)}
                            >
                              {favorites[selectedCategory].includes(key) ? (
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              ) : (
                                <Star className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyPhonemeData(key)}
                            >
                              {copiedPhoneme === key ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 mb-4">
        <Button
          variant={studySession.active ? "destructive" : "default"}
          onClick={toggleStudySession}
        >
          {studySession.active ? (
            <>
              <Pause className="h-4 w-4 mr-1" />
              End Study Session
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1" />
              Start Study Session
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => setFlashcardMode(!flashcardMode)}
        >
          <Brain className="h-4 w-4 mr-1" />
          Flashcards
        </Button>
        <Button variant="outline" onClick={startQuiz}>
          <Lightbulb className="h-4 w-4 mr-1" />
          Quiz Mode
        </Button>
        <Button variant="outline" onClick={generatePrintView}>
          <Printer className="h-4 w-4 mr-1" />
          Print View
        </Button>
        <Button variant="outline" onClick={exportStudyData}>
          <FileText className="h-4 w-4 mr-1" />
          Export Study Data
        </Button>
      </div>

      {studySession.active && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Study Session</CardTitle>
            <CardDescription>
              Started {new Date(studySession.startTime).toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress
              value={
                (studySession.phonemesStudied.length /
                  Object.keys(filteredData).length) *
                100
              }
            />
          </CardContent>
        </Card>
      )}

      {flashcardMode && renderFlashcardMode()}

      {showPrintView && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Print View</CardTitle>
          </CardHeader>
          <CardContent>{/* Render print view content */}</CardContent>
        </Card>
      )}

      {renderCollectionDialog()}
      {renderStudyProgressDialog()}
    </div>
  );
}
