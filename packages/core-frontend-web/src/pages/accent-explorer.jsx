import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIssuesStore } from "../stores/issues-store";
import {
  ExternalLink,
  Brain,
  Play,
  Mic,
  Pause,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import PhonemeGridSummary from "../components/phoneme-grid-summary";
import accentExplorerData from "../data/accent-explorer-data";
import { hasQuizForTargetIssue } from "./quiz";
import { useWordAudio } from "../hooks/use-word-audio";
import AudioRecorder from "../components/audio-recorder";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  getWiktionaryAllAudio,
  cleanWordForAPI,
} from "../utils/wiktionary-api";

export default function AccentExplorer() {
  const { targetSlug } = useParams();
  const navigate = useNavigate();
  const { issuesData, loading, error, fetchIssues, findTargetBySlug } =
    useIssuesStore();
  const [selectedTarget, setSelectedTarget] = useState(null);
  const { playWord, isLoading: isAudioLoading } = useWordAudio();

  // Word tooltip state
  const [currentWord, setCurrentWord] = useState(null);
  const [currentWordData, setCurrentWordData] = useState({
    pronunciations: [],
    pronunciations2: [],
    pronunciations3: [],
    annotations: [],
  });
  const [audioData, setAudioData] = useState([]);
  const [isLoadingWordData, setIsLoadingWordData] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [pronunciationIndex, setPronunciationIndex] = useState(0);
  const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState(null);

  // Create mock data for phoneme grid (since it expects specific format)
  const mockStats = useMemo(() => {
    const totalIssues = issuesData.reduce(
      (sum, target) => sum + target.issues.length,
      0
    );
    return {
      annotatedWords: totalIssues,
      issueWordMap: {},
    };
  }, [issuesData]);

  const targetCounts = useMemo(() => {
    const counts = {};
    issuesData.forEach((target) => {
      counts[target.name] = target.issues.length;
    });
    return counts;
  }, [issuesData]);

  // Get issues for selected target
  const filteredIssues = useMemo(() => {
    if (!selectedTarget) return [];

    let target = issuesData.find((t) => t.name === selectedTarget);
    if (!target) return [];

    return target.issues;
  }, [selectedTarget, issuesData]);

  // Collect and dedupe reels from all issues for this target
  const allReels = useMemo(() => {
    const reels = new Set();
    filteredIssues.forEach((issue) => {
      if (issue.resources && Array.isArray(issue.resources)) {
        issue.resources.forEach((resource) => {
          if (resource && typeof resource === "string") {
            reels.add(resource);
          }
        });
      }
    });
    return Array.from(reels);
  }, [filteredIssues]);

  // Create selectedIssues state that highlights the selected target
  const selectedIssuesForHighlighting = useMemo(() => {
    if (!selectedTarget) return {};

    const target = issuesData.find((t) => t.name === selectedTarget);
    if (!target) return {};

    // Select all issues for the selected target to highlight it
    const selected = {};
    target.issues.forEach((issue) => {
      selected[issue.id] = true;
    });
    return selected;
  }, [selectedTarget, issuesData]);

  // Get available quizzes for the selected target
  const availableQuizzes = useMemo(() => {
    if (!selectedTarget) return [];

    const target = issuesData.find((t) => t.name === selectedTarget);
    if (!target) return [];

    return target.issues
      .filter((issue) => hasQuizForTargetIssue(target.name, issue.shortName))
      .map((issue) => ({
        issueName: issue.name,
        shortName: issue.shortName,
        url: `/quiz/${target.name.toLowerCase()}/${issue.shortName.toLowerCase()}`,
      }));
  }, [selectedTarget, issuesData]);

  // Word tooltip helper functions (adapted from transcript viewer)
  const getPronunciations = async (word) => {
    const cleanWord = cleanWordForAPI(word, "cmu");
    if (!cleanWord) return [];

    try {
      const response = await fetch(`/api/ortho/word/${cleanWord}`);
      if (response.ok) {
        const data = await response.json();
        if (data.error) {
          return ["None found"];
        }
        return data.pronsCmuDict.map((p) => p.pronCmuDict);
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching pronunciation:", error);
      return [];
    }
  };

  const getPronunciations2 = async (pronunciations) => {
    if (!pronunciations || pronunciations.length === 0) return [];

    // Lexical set mapping (same as transcript viewer)
    const LexicalSetMap2 = {
      FLEECE: { arpabets: ["IY"], type: "vowel" },
      KIT: { arpabets: ["IH"], type: "vowel" },
      DRESS: { arpabets: ["EH"], type: "vowel" },
      TRAP: { arpabets: ["AE"], type: "vowel" },
      GOOSE: { arpabets: ["UW"], type: "vowel" },
      FOOT: { arpabets: ["UH"], type: "vowel" },
      STRUT: { arpabets: ["AH"], type: "vowel" },
      LOT: { arpabets: ["AA", "AO"], type: "vowel" },
      FACE: { arpabets: ["EY"], type: "vowel" },
      PRICE: { arpabets: ["AY"], type: "vowel" },
      CHOICE: { arpabets: ["OY"], type: "vowel" },
      GOAT: { arpabets: ["OW"], type: "vowel" },
      MOUTH: { arpabets: ["AW"], type: "vowel" },
      NURSE: { arpabets: ["ER"], type: "vowel" },
      H: { arpabets: ["HH"], type: "consonant" },
      J: { arpabets: ["JH"], type: "consonant" },
    };

    const pronunciations2 = pronunciations.map((pronunciation) => {
      const phonemes = pronunciation.split(" ");

      const convertedPhonemes = phonemes.map((phoneme) => {
        // Extract the base phoneme and stress marker
        const basePhoneme = phoneme.replace(/[0-2]$/, "");
        const stressMarker = phoneme.match(/[0-2]$/)?.[0] || "";

        const lexicalSet = Object.entries(LexicalSetMap2).find(([_, data]) =>
          data.arpabets.includes(basePhoneme)
        );

        // Special handling for AH phoneme based on stress
        if (basePhoneme === "AH") {
          if (stressMarker === "0") {
            return "commA" + stressMarker; // commA for unstressed AH
          } else {
            return "STRUT" + stressMarker; // STRUT for stressed AH
          }
        }

        return lexicalSet ? lexicalSet[0] + stressMarker : phoneme;
      });

      return convertedPhonemes.join(" ");
    });

    return pronunciations2;
  };

  const getPronunciations3 = async (cmuPronunciations, lexicalSets) => {
    if (!cmuPronunciations || cmuPronunciations.length === 0) return [];

    // Lexical Set to IPA mapping (for vowels) - same as transcript viewer
    const lexicalSetToIpaMap = {
      FLEECE: "i",
      KIT: "ɪ",
      DRESS: "ɛ",
      TRAP: "æ",
      GOOSE: "u",
      FOOT: "ʊ",
      STRUT: "ʌ", // STRUT vowel (stressed AH)
      commA: "ə", // commA vowel (unstressed AH)
      LOT: "ɑ",
      FACE: "eɪ",
      PRICE: "aɪ",
      CHOICE: "ɔɪ",
      GOAT: "oʊ",
      MOUTH: "aʊ",
      NURSE: "ər",
    };

    // CMU to IPA mapping (for consonants) - same as transcript viewer
    const cmuToIpaMap = {
      B: "b",
      CH: "tʃ",
      D: "d",
      DH: "ð",
      F: "f",
      G: "ɡ",
      HH: "h",
      JH: "dʒ",
      K: "k",
      L: "l",
      M: "m",
      N: "n",
      NG: "ŋ",
      P: "p",
      R: "r",
      S: "s",
      SH: "ʃ",
      T: "t",
      TH: "θ",
      V: "v",
      W: "w",
      Y: "j",
      Z: "z",
      ZH: "ʒ",
    };

    const pronunciations3 = [];

    for (let i = 0; i < cmuPronunciations.length; i++) {
      const cmuPhonemes = cmuPronunciations[i].split(" ");
      const lexicalPhonemes = lexicalSets[i].split(" ");
      const convertedPhonemes = [];

      for (let j = 0; j < cmuPhonemes.length; j++) {
        const cmuPhoneme = cmuPhonemes[j];
        const lexicalPhoneme = lexicalPhonemes[j];

        // Extract the base phoneme and stress marker
        const baseCmu = cmuPhoneme.replace(/[0-2]$/, "");
        const baseLexical = lexicalPhoneme.replace(/[0-2]$/, "");
        const stressMarker = cmuPhoneme.match(/[0-2]$/)?.[0] || "";

        // Use lexical set for vowels, CMU for consonants
        let ipaSymbol;
        if (lexicalSetToIpaMap[baseLexical]) {
          // It's a vowel - use lexical set mapping
          ipaSymbol = lexicalSetToIpaMap[baseLexical];
        } else if (cmuToIpaMap[baseCmu]) {
          // It's a consonant - use CMU mapping
          ipaSymbol = cmuToIpaMap[baseCmu];
        } else {
          // Fallback to original phoneme
          ipaSymbol = baseCmu;
        }

        // Add stress markers for vowels (primary stress: ˈ, secondary stress: ˌ)
        if (stressMarker === "1") {
          convertedPhonemes.push("ˈ" + ipaSymbol);
        } else if (stressMarker === "2") {
          convertedPhonemes.push("ˌ" + ipaSymbol);
        } else {
          convertedPhonemes.push(ipaSymbol);
        }
      }

      const result = convertedPhonemes.join("");
      pronunciations3.push(result);
    }

    return pronunciations3;
  };

  const fetchAudioData = async (word) => {
    if (!word) return;

    setIsLoadingAudio(true);
    try {
      const audioFiles = await getWiktionaryAllAudio(word);
      setAudioData(audioFiles);
    } catch (error) {
      console.error("Error fetching audio:", error);
      setAudioData([]);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const playAudio = (audioId) => {
    if (currentlyPlayingAudio === audioId) {
      // Stop current audio
      const audioElement = document.getElementById(`audio-${audioId}`);
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      setCurrentlyPlayingAudio(null);
    } else {
      // Stop any currently playing audio
      if (currentlyPlayingAudio) {
        const currentAudio = document.getElementById(
          `audio-${currentlyPlayingAudio}`
        );
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
      }

      // Play new audio
      const audioElement = document.getElementById(`audio-${audioId}`);
      if (audioElement) {
        audioElement.play().catch((error) => {
          console.error("Error playing audio:", error);
          setCurrentlyPlayingAudio(null);
        });
        setCurrentlyPlayingAudio(audioId);
      } else {
        console.error(`Audio element not found: audio-${audioId}`);
      }
    }
  };

  const getMaxPronunciations = () => {
    return Math.max(
      currentWordData.pronunciations.length,
      currentWordData.pronunciations2.length,
      currentWordData.pronunciations3.length
    );
  };

  const nextPronunciation = () => {
    const max = getMaxPronunciations();
    setPronunciationIndex((prev) => (prev + 1) % max);
  };

  const prevPronunciation = () => {
    const max = getMaxPronunciations();
    setPronunciationIndex((prev) => (prev - 1 + max) % max);
  };

  const handleWordHover = async (word) => {
    setCurrentWord(word);
    setIsLoadingWordData(true);
    setPronunciationIndex(0);
    setCurrentWordData({
      pronunciations: [],
      pronunciations2: [],
      pronunciations3: [],
      annotations: [],
    });
    setAudioData([]);
    setIsLoadingAudio(false);

    try {
      const pronunciations = await getPronunciations(word);
      const pronunciations2 = await getPronunciations2(pronunciations);
      const pronunciations3 = await getPronunciations3(
        pronunciations,
        pronunciations2
      );

      setCurrentWordData({
        pronunciations,
        pronunciations2,
        pronunciations3,
        annotations: [], // No annotations for example words
      });
      setIsLoadingWordData(false);

      // Fetch audio data
      fetchAudioData(word);
    } catch (error) {
      console.error("Error fetching word data:", error);
      setIsLoadingWordData(false);
    }
  };

  // Handle phoneme grid click
  const handlePhonemeClick = (label) => {
    const target = issuesData.find((t) => t.name === label);

    if (target) {
      // Toggle selection: if clicking the same target, clear it; otherwise select it
      if (selectedTarget === label) {
        setSelectedTarget(null);
        navigate("/accent-explorer");
      } else {
        setSelectedTarget(label);
        navigate(`/${label.toLowerCase()}`);
      }
    }
  };

  // Handle URL parameters on component mount and when they change
  useEffect(() => {
    if (targetSlug && issuesData.length > 0) {
      const target = findTargetBySlug(targetSlug);
      if (target) {
        setSelectedTarget(target.name);
      }
    } else if (!targetSlug) {
      // Reset to no selection when on /accent-explorer
      setSelectedTarget(null);
    }
  }, [targetSlug, issuesData, findTargetBySlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading accent issues...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading issues: {error}</p>
          <Button onClick={() => fetchIssues(true)}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="max-w-6xl mx-auto py-1">
        <h1 className="text-2xl font-bold text-foreground text-center">
          Accent Targets
        </h1>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-2 px-4">
        {/* Row 1: Phoneme Grid + Issues */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Phoneme Grid */}
          <div className="bg-card border border-border rounded-lg p-2 lg:p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-foreground">
                Select Target:
              </h3>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span>🧠</span>
                  <span>Quizzes</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📹</span>
                  <span>Reels</span>
                </div>
              </div>
            </div>
            {/* Mobile: Horizontal scroll container */}
            <div className="lg:hidden overflow-x-auto pb-2">
              <div className="min-w-max">
                <PhonemeGridSummary
                  issueWordMap={mockStats.issueWordMap}
                  issues={[]}
                  targetCounts={targetCounts}
                  stats={mockStats}
                  selectedIssues={selectedIssuesForHighlighting}
                  setSelectedIssues={() => {}} // Disable selection changes
                  issuesData={issuesData}
                  onHover={() => {}}
                  onPhonemeClick={handlePhonemeClick}
                  hideSettings={true}
                  hideMisc={true}
                  hideNumbers={true}
                  customBottomLeft={(label, count, percent) => {
                    // Show quiz icon if quizzes available
                    const targetSlug = label?.toLowerCase();
                    const target = issuesData.find((t) => t.name === label);
                    if (target) {
                      const hasQuizzes = target.issues.some((issue) =>
                        hasQuizForTargetIssue(target.name, issue.shortName)
                      );
                      return hasQuizzes ? "🧠" : "";
                    }
                    return "";
                  }}
                  customBottomRight={(label, count, percent) => {
                    // Show reel icon if reels available
                    const target = issuesData.find((t) => t.name === label);
                    if (target) {
                      const hasReels = target.issues.some(
                        (issue) =>
                          issue.resources &&
                          Array.isArray(issue.resources) &&
                          issue.resources.length > 0
                      );
                      return hasReels ? "📹" : "";
                    }
                    return "";
                  }}
                  customTooltip={(label, count, percent) => {
                    // Show quiz and reel info in tooltip
                    const target = issuesData.find((t) => t.name === label);
                    if (target) {
                      const hasQuizzes = target.issues.some((issue) =>
                        hasQuizForTargetIssue(target.name, issue.shortName)
                      );
                      const hasReels = target.issues.some(
                        (issue) =>
                          issue.resources &&
                          Array.isArray(issue.resources) &&
                          issue.resources.length > 0
                      );

                      let tooltipText = `${label}`;
                      if (hasQuizzes && hasReels) {
                        tooltipText += ` - 🧠 Quizzes & 📹 Reels available`;
                      } else if (hasQuizzes) {
                        tooltipText += ` - 🧠 Quizzes available`;
                      } else if (hasReels) {
                        tooltipText += ` - 📹 Reels available`;
                      } else {
                        tooltipText += ``;
                      }
                      return tooltipText;
                    }
                    return `${label}: ${count} (${percent}%)`;
                  }}
                  showHeaders={true}
                />
              </div>
            </div>
            {/* Desktop: Normal layout */}
            <div className="hidden lg:block">
              <PhonemeGridSummary
                issueWordMap={mockStats.issueWordMap}
                issues={[]}
                targetCounts={targetCounts}
                stats={mockStats}
                selectedIssues={selectedIssuesForHighlighting}
                setSelectedIssues={() => {}} // Disable selection changes
                issuesData={issuesData}
                onHover={() => {}}
                onPhonemeClick={handlePhonemeClick}
                hideSettings={true}
                hideMisc={true}
                hideNumbers={true}
                customBottomLeft={(label, count, percent) => {
                  // Show quiz icon if quizzes available
                  const targetSlug = label?.toLowerCase();
                  const target = issuesData.find((t) => t.name === label);
                  if (target) {
                    const hasQuizzes = target.issues.some((issue) =>
                      hasQuizForTargetIssue(target.name, issue.shortName)
                    );
                    return hasQuizzes ? "🧠" : "";
                  }
                  return "";
                }}
                customBottomRight={(label, count, percent) => {
                  // Show reel icon if reels available
                  const target = issuesData.find((t) => t.name === label);
                  if (target) {
                    const hasReels = target.issues.some(
                      (issue) =>
                        issue.resources &&
                        Array.isArray(issue.resources) &&
                        issue.resources.length > 0
                    );
                    return hasReels ? "📹" : "";
                  }
                  return "";
                }}
                customTooltip={(label, count, percent) => {
                  // Show quiz and reel info in tooltip
                  const target = issuesData.find((t) => t.name === label);
                  if (target) {
                    const hasQuizzes = target.issues.some((issue) =>
                      hasQuizForTargetIssue(target.name, issue.shortName)
                    );
                    const hasReels = target.issues.some(
                      (issue) =>
                        issue.resources &&
                        Array.isArray(issue.resources) &&
                        issue.resources.length > 0
                    );

                    let tooltipText = `${label}`;
                    if (hasQuizzes && hasReels) {
                      tooltipText += ` - 🧠 Quizzes & 📹 Reels available`;
                    } else if (hasQuizzes) {
                      tooltipText += ` - 🧠 Quizzes available`;
                    } else if (hasReels) {
                      tooltipText += ` - 📹 Reels available`;
                    } else {
                      tooltipText += ``;
                    }
                    return tooltipText;
                  }
                  return `${label}: ${count} (${percent}%)`;
                }}
                showHeaders={true}
              />
            </div>
          </div>
        </div>

        {/* Row 2: Target Info or Issue Details */}
        {selectedTarget && (
          <div className="bg-card border border-border rounded-lg p-4">
            {/* Target Info */}
            <div>
              {(() => {
                let targetData;
                try {
                  targetData = accentExplorerData.getTargetData(selectedTarget);
                } catch (error) {
                  console.warn("Error getting target data:", error);
                  targetData = null;
                }

                return targetData ? (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {(() => {
                          try {
                            return (
                              accentExplorerData.getTargetDisplayName(
                                selectedTarget
                              ) || selectedTarget
                            );
                          } catch (error) {
                            console.warn(
                              "Error getting target display name:",
                              error
                            );
                            return selectedTarget;
                          }
                        })()}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* Example Words */}
                      {targetData.exampleWords &&
                        Array.isArray(targetData.exampleWords) && (
                          <div>
                            <h4 className="font-medium text-foreground mb-2">
                              Example Words
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {targetData.exampleWords.map((word, index) => (
                                <Tooltip key={index}>
                                  <TooltipTrigger asChild>
                                    <div
                                      className="bg-background/50 border border-border/50 rounded px-2 py-1 text-sm flex items-center gap-1 cursor-pointer hover:bg-background/70 transition-colors"
                                      onMouseEnter={() => handleWordHover(word)}
                                    >
                                      <span>{word || "N/A"}</span>
                                      <div className="flex items-center gap-1 ml-1">
                                        {/* Audio Playback Button */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            playWord(word);
                                          }}
                                          disabled={isAudioLoading}
                                          className="text-muted-foreground hover:text-foreground p-0.5 rounded hover:bg-accent/50 transition-colors"
                                          title={`Listen to "${word}" pronunciation`}
                                        >
                                          {isAudioLoading ? (
                                            <span className="text-xs">⏳</span>
                                          ) : (
                                            <Play size={12} />
                                          )}
                                        </button>

                                        {/* Imitation Link */}
                                        {/* <a
                                          href={`/imitate/${encodeURIComponent(
                                            word
                                          )}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-muted-foreground hover:text-foreground p-0.5 rounded hover:bg-accent/50 transition-colors"
                                          title={`Practice pronunciation of "${word}" in Imitate`}
                                        >
                                          <Mic size={12} />
                                        </a> */}
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    className="max-w-xs p-1"
                                    side="top"
                                    align="center"
                                    sideOffset={-10}
                                    avoidCollisions={true}
                                  >
                                    <div className="space-y-1">
                                      {/* Pronunciation Section */}
                                      <div className="bg-muted/20 rounded-md pb-1 mt-0">
                                        <div className="font-semibold text-xs text-center mb-1 text-background/90 bg-emerald-600 py-0.5 rounded-t-md w-full">
                                          PRONUNCIATION{" "}
                                          {getMaxPronunciations() > 1
                                            ? `${
                                                pronunciationIndex + 1
                                              }/${getMaxPronunciations()}`
                                            : ""}
                                        </div>

                                        {getMaxPronunciations() > 0 ? (
                                          <>
                                            <div className="mb-1">
                                              <div className="font-semibold text-xs text-center">
                                                CMU:
                                              </div>
                                              <div className="text-xs text-center px-1">
                                                {isLoadingWordData ? (
                                                  <div className="text-background/80">
                                                    Loading...
                                                  </div>
                                                ) : currentWordData
                                                    .pronunciations.length >
                                                  0 ? (
                                                  currentWordData
                                                    .pronunciations[
                                                    pronunciationIndex
                                                  ] || "N/A"
                                                ) : (
                                                  "N/A"
                                                )}
                                              </div>
                                            </div>

                                            <div className="mb-1">
                                              <div className="font-semibold text-xs text-center">
                                                Lexical Sets:
                                              </div>
                                              <div className="text-xs text-center px-1">
                                                {isLoadingWordData ? (
                                                  <div className="text-background/80">
                                                    Loading...
                                                  </div>
                                                ) : currentWordData
                                                    .pronunciations2.length >
                                                  0 ? (
                                                  currentWordData
                                                    .pronunciations2[
                                                    pronunciationIndex
                                                  ] || "N/A"
                                                ) : (
                                                  "N/A"
                                                )}
                                              </div>
                                            </div>

                                            <div className="mb-1">
                                              <div className="font-semibold text-xs text-center">
                                                IPA:
                                              </div>
                                              <div className="text-xs text-center px-1">
                                                {isLoadingWordData ? (
                                                  <div className="text-background/80">
                                                    Loading...
                                                  </div>
                                                ) : currentWordData
                                                    .pronunciations3.length >
                                                  0 ? (
                                                  currentWordData
                                                    .pronunciations3[
                                                    pronunciationIndex
                                                  ] || "N/A"
                                                ) : (
                                                  "N/A"
                                                )}
                                              </div>
                                            </div>

                                            {getMaxPronunciations() > 1 && (
                                              <div className="flex items-center justify-center gap-2 mt-2">
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    prevPronunciation();
                                                  }}
                                                  className="p-1 hover:bg-accent/10 rounded cursor-pointer"
                                                >
                                                  <ChevronLeft className="h-3 w-3" />
                                                </button>
                                                <div className="flex gap-1">
                                                  {Array.from(
                                                    {
                                                      length:
                                                        getMaxPronunciations(),
                                                    },
                                                    (_, i) => (
                                                      <div
                                                        key={i}
                                                        className={`w-1.5 h-1.5 rounded-full ${
                                                          i ===
                                                          pronunciationIndex
                                                            ? "bg-gray-600"
                                                            : "bg-gray-300"
                                                        }`}
                                                      />
                                                    )
                                                  )}
                                                </div>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    nextPronunciation();
                                                  }}
                                                  className="p-1 hover:bg-accent/10 rounded cursor-pointer"
                                                >
                                                  <ChevronRight className="h-3 w-3" />
                                                </button>
                                              </div>
                                            )}
                                          </>
                                        ) : (
                                          <div className="text-xs text-center text-muted-foreground px-1">
                                            None found
                                          </div>
                                        )}
                                      </div>

                                      {/* Audio Section */}
                                      <div className="bg-muted/20 rounded-md pb-1 mt-0">
                                        <div className="font-semibold text-xs text-center mb-1 text-background/90 bg-amber-600 py-0.5 rounded-t-md w-full">
                                          AUDIO
                                        </div>
                                        {isLoadingAudio ? (
                                          <div className="text-xs text-center text-background/80 px-1">
                                            Loading...
                                          </div>
                                        ) : audioData.length > 0 ? (
                                          <div className="flex flex-wrap justify-center gap-1">
                                            {audioData
                                              .sort((a, b) => {
                                                // Sort US audio first, then others
                                                const aIsUS = a.accent === "us";
                                                const bIsUS = b.accent === "us";
                                                if (aIsUS && !bIsUS) return -1;
                                                if (!aIsUS && bIsUS) return 1;
                                                return 0;
                                              })
                                              .slice(0, 3)
                                              .map((audio) => (
                                                <button
                                                  key={audio.id}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    playAudio(audio.id);
                                                  }}
                                                  className="flex items-center gap-1.5 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors border border-border/50 cursor-pointer"
                                                  title={`${audio.region} pronunciation`}
                                                >
                                                  <span className="text-base leading-none">
                                                    {audio.flag}
                                                  </span>
                                                  {currentlyPlayingAudio ===
                                                  audio.id ? (
                                                    <Pause className="h-3 w-3 text-foreground/70" />
                                                  ) : (
                                                    <Play className="h-3 w-3 text-foreground/70" />
                                                  )}
                                                </button>
                                              ))}
                                          </div>
                                        ) : (
                                          <div className="text-xs text-center text-muted-foreground px-1">
                                            None found
                                          </div>
                                        )}

                                        {/* External pronunciation links */}
                                        {currentWord && (
                                          <div className="text-center mt-1 space-y-1">
                                            <div className="flex justify-center items-center gap-1 text-xs text-muted-foreground">
                                              {(() => {
                                                const cleanWord =
                                                  cleanWordForAPI(
                                                    currentWord,
                                                    "wiktionary"
                                                  );
                                                return (
                                                  <>
                                                    <a
                                                      href={`https://youglish.com/pronounce/${encodeURIComponent(
                                                        cleanWord
                                                      )}/english/us`}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      onClick={(e) =>
                                                        e.stopPropagation()
                                                      }
                                                      className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                                      title="Hear real-world pronunciations on YouGlish"
                                                    >
                                                      YouGlish
                                                    </a>
                                                    <span>|</span>
                                                    <a
                                                      href={`https://playphrase.me/#/search?q=${encodeURIComponent(
                                                        cleanWord
                                                      )}`}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      onClick={(e) =>
                                                        e.stopPropagation()
                                                      }
                                                      className="text-green-600 hover:text-green-800 underline cursor-pointer"
                                                      title="Hear movie/TV pronunciations on PlayPhrase"
                                                    >
                                                      PlayPhrase
                                                    </a>
                                                    <span>|</span>
                                                    <a
                                                      href={`https://getyarn.io/yarn-find?text=${encodeURIComponent(
                                                        cleanWord
                                                      )}`}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      onClick={(e) =>
                                                        e.stopPropagation()
                                                      }
                                                      className="text-purple-600 hover:text-purple-800 underline cursor-pointer"
                                                      title="Hear movie/TV pronunciations on Yarn"
                                                    >
                                                      Yarn
                                                    </a>
                                                  </>
                                                );
                                              })()}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* All Resources in Compact Layout */}
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Column 1: Practice Recording + Contrasts (25%) */}
                        <div className="lg:col-span-1 space-y-3">
                          {/* Practice Recording */}
                          <div>
                            <h4 className="font-medium text-foreground mb-2 text-sm">
                              Practice Recording
                            </h4>
                            <div className="bg-background/50 border border-border/50 rounded p-4 flex flex-col items-center justify-center">
                              <div className="w-full max-w-sm">
                                <AudioRecorder
                                  size="lg"
                                  showClearButton={true}
                                  className="w-full"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Contrasts Section */}
                          {targetData.contrasts &&
                            Array.isArray(targetData.contrasts) &&
                            targetData.contrasts.length > 0 && (
                              <div>
                                <h4 className="font-medium text-foreground mb-2 text-sm">
                                  Be careful of these contrasts:
                                </h4>
                                <div className="space-y-2">
                                  {targetData.contrasts.map(
                                    (contrast, index) => (
                                      <div
                                        key={index}
                                        className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-2"
                                      >
                                        <div className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">
                                          {targetData.name} vs{" "}
                                          {contrast.targetName}
                                        </div>
                                        <div className="text-xs text-amber-700 dark:text-amber-300">
                                          {contrast.examples.join(" • ")}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>

                        {/* Column 2: Quizzes and Resources Stacked (25%) */}
                        <div className="lg:col-span-1 space-y-3">
                          {/* Quizzes */}
                          {availableQuizzes.length > 0 && (
                            <div>
                              <h4 className="font-medium text-foreground mb-2 text-sm">
                                Available Quizzes
                              </h4>
                              <div className="space-y-1">
                                {availableQuizzes.map((quiz, index) => (
                                  <a
                                    key={index}
                                    href={quiz.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <Brain
                                        size={12}
                                        className="text-blue-600 dark:text-blue-400"
                                      />
                                      <div className="flex-1">
                                        <div className="font-medium text-foreground text-xs">
                                          {quiz.issueName}
                                        </div>
                                      </div>
                                      <ExternalLink
                                        size={10}
                                        className="text-blue-600 dark:text-blue-400"
                                      />
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* External Resources */}
                          {targetData.externalResources &&
                            Array.isArray(targetData.externalResources) && (
                              <div>
                                <h4 className="font-medium text-foreground mb-2 text-sm">
                                  Practice Resources
                                </h4>
                                <div className="space-y-1">
                                  {targetData.externalResources.map(
                                    (resource, index) => {
                                      if (!resource || !resource.url)
                                        return null;
                                      return (
                                        <a
                                          key={index}
                                          href={resource.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block p-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                        >
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-green-600 dark:text-green-400 text-xs">
                                              📚
                                            </span>
                                            <div className="flex-1">
                                              <div className="font-medium text-foreground text-xs">
                                                {resource.name || "Resource"}
                                              </div>
                                            </div>
                                            <ExternalLink
                                              size={10}
                                              className="text-green-600 dark:text-green-400"
                                            />
                                          </div>
                                        </a>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            )}
                        </div>

                        {/* Column 3: Practice Reels (50%) */}
                        {allReels.length > 0 && (
                          <div className="lg:col-span-2">
                            <h4 className="font-medium text-foreground mb-2 text-sm">
                              Relevant Instagram Reels
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                              {allReels.map((resource, index) => (
                                <a
                                  key={index}
                                  href={resource}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                >
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="text-lg">🎬</span>
                                    <div className="text-center">
                                      <div className="font-medium text-foreground text-xs">
                                        Reel {index + 1}
                                      </div>
                                    </div>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Target: {selectedTarget}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {filteredIssues.length} issue
                      {filteredIssues.length !== 1 ? "s" : ""} available. Click
                      on an issue above to see details.
                    </p>
                    <div className="text-sm text-muted-foreground">
                      <p>
                        This target phoneme represents the /
                        {selectedTarget.toLowerCase()}/ sound in English.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Hidden audio elements for playback */}
      {audioData.map((audio) => {
        return (
          <audio
            key={audio.id}
            id={`audio-${audio.id}`}
            src={audio.audio || audio.url}
            preload="none"
            onEnded={() => setCurrentlyPlayingAudio(null)}
            onError={(e) => {
              console.error("Audio error:", e);
              setCurrentlyPlayingAudio(null);
            }}
          />
        );
      })}
    </div>
  );
}
