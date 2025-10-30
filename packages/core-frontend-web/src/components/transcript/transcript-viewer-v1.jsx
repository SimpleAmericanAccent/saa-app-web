/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback, useRef } from "react";
import React from "react";
import { cn } from "core-frontend-web/src/lib/utils";
import useAuthStore from "core-frontend-web/src/stores/auth-store";
import { useWordAudio } from "core-frontend-web/src/hooks/use-word-audio";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "core-frontend-web/src/components/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "core-frontend-web/src/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Play,
  Pause,
  Volume2,
} from "lucide-react";
import KeyboardShortcutsModal from "core-frontend-web/src/components/keyboard-shortcuts-modal";
import {
  getWiktionaryAllAudio,
  cleanWordForAPI,
} from "core-frontend-web/src/utils/wiktionary-api";

const TranscriptViewerV1 = ({
  annotatedTranscript,
  activeWordIndex,
  handleWordClick,
  onAnnotationHover,
  onAnnotationUpdate,
  onPronunciationHover,
  onPronunciation2Hover,
  issuesData,
  activeFilters = [],
  hoveredWordIndices = [],
  tooltipsEnabled = true,
}) => {
  const [contextMenu, setContextMenu] = useState({
    wordIndex: null,
  });
  const [currentWordData, setCurrentWordData] = useState({
    pronunciations: [],
    pronunciations2: [],
    pronunciations3: [],
    annotations: [],
  });
  const [currentWord, setCurrentWord] = useState(null);
  const [isLoadingWordData, setIsLoadingWordData] = useState(false);
  const [pronunciationIndex, setPronunciationIndex] = useState(0);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [audioData, setAudioData] = useState([]);
  const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const currentWordRef = useRef(null);
  const { isAdmin } = useAuthStore();
  const { playWord, isLoading } = useWordAudio();

  const fetchAudioData = async (word) => {
    if (!word) return;

    setIsLoadingAudio(true);
    try {
      const audioFiles = await getWiktionaryAllAudio(word);
      // Check if this is still the most recently hovered word using ref
      if (currentWordRef.current === word) {
        setAudioData(audioFiles);
      }
    } catch (error) {
      console.error("Error fetching audio:", error);
      // Only update if this is still the current word
      if (currentWordRef.current === word) {
        setAudioData([]);
      }
    } finally {
      // Only update loading state if this is still the current word
      if (currentWordRef.current === word) {
        setIsLoadingAudio(false);
      }
    }
  };

  const getAnnotations = (wordIndex) => {
    const word = annotatedTranscript
      .flatMap((paragraph) => paragraph.alignment)
      .find((word) => word.wordIndex === wordIndex);
    return word ? word["BR issues"] || [] : [];
    // return record ? record.fields["BR issues"] : [];
  };

  // Helper function to get issue names from IDs
  const getIssueNames = (issueIds) => {
    if (!issueIds || !issuesData.length) return [];

    return issueIds.map((id) => {
      // Find the category that contains this issue
      const category = issuesData.find((cat) =>
        cat.issues.some((issue) => issue.id === id)
      );

      if (category) {
        const issue = category.issues.find((i) => i.id === id);
        return issue ? issue.name : id;
      }
      return id;
    });
  };

  const shouldHighlightWord = (wordObj) => {
    if (hoveredWordIndices.includes(wordObj.wordIndex)) {
      return "hover2"; // Return a string to indicate hover state
    }

    // Check for filter highlighting
    if (activeFilters.length) {
      return wordObj["BR issues"]?.some((issueId) =>
        activeFilters.includes(issueId)
      );
    }

    return false;
  };

  // Admin handler - sets context menu state
  const handleAdminContextMenu = useCallback((e, wordIndex) => {
    setContextMenu({
      wordIndex,
    });
  }, []);

  // Non-admin handler - just plays audio
  const handleNonAdminContextMenu = useCallback(
    (e, word) => {
      e.preventDefault();
      playWord(word);
    },
    [playWord]
  );

  // Choose the appropriate handler once based on admin status
  const handleContextMenu = useCallback(
    (e, wordIndex, word) => {
      if (!word) {
        e.preventDefault();
        return;
      }

      if (isAdmin) {
        handleAdminContextMenu(e, wordIndex);
      } else {
        handleNonAdminContextMenu(e, word);
      }
    },
    [isAdmin, handleAdminContextMenu, handleNonAdminContextMenu]
  );

  const handleIssueSelect = (wordIndex, issueId) => {
    const annotations = getAnnotations(wordIndex);
    const annotationsDesired = annotations.includes(issueId)
      ? annotations.filter((id) => id !== issueId)
      : [...annotations, issueId];

    if (onAnnotationUpdate) {
      onAnnotationUpdate(wordIndex, annotationsDesired);
    }

    // Here you would typically call a function to update the annotations in Airtable
    // For now, we'll just update the UI
    if (onAnnotationHover) {
      onAnnotationHover(annotationsDesired);
    }
  };

  const handleAnnotationHover = (wordIndex) => {
    const annotations = getAnnotations(wordIndex);
    if (onAnnotationHover) {
      onAnnotationHover(annotations);
    }
  };

  const handleWordHover = async (wordIndex, word) => {
    // Immediately update the current word and clear previous data
    setCurrentWord(word);
    currentWordRef.current = word; // Set ref for race condition checking
    setIsLoadingWordData(true);
    setPronunciationIndex(0); // Reset to first pronunciation
    setCurrentWordData({
      pronunciations: [],
      pronunciations2: [],
      pronunciations3: [],
      annotations: [],
    });
    // Clear previous audio data
    setAudioData([]);
    setIsLoadingAudio(false);

    const annotationIds = getAnnotations(wordIndex);
    const friendlyIssueNames = getIssueNames(annotationIds);
    const pronunciations = await getPronunciations(word);
    const pronunciations2 = await getPronunciations2(pronunciations);
    const pronunciations3 = await getPronunciations3(
      pronunciations,
      pronunciations2
    );

    // Fetch audio data in parallel
    fetchAudioData(word);

    // Check if this is still the most recently hovered word using ref
    // This prevents stale data from showing when user quickly hovers over different words
    if (currentWordRef.current === word) {
      // Update the data - the race condition is handled by the immediate state clearing above
      setCurrentWordData({
        pronunciations,
        pronunciations2,
        pronunciations3,
        annotations: friendlyIssueNames,
      });
      setIsLoadingWordData(false);

      // Still call parent callbacks for backward compatibility
      if (onAnnotationHover) {
        onAnnotationHover(friendlyIssueNames);
      }
      if (onPronunciationHover) {
        onPronunciationHover(pronunciations);
      }
      if (onPronunciation2Hover) {
        onPronunciation2Hover(pronunciations2);
      }
    }
  };

  const getPronunciations = async (word) => {
    const cleanWord = cleanWordForAPI(word, "cmu");
    if (!cleanWord) return;

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
    // Lexical Set to IPA mapping (for vowels)
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

    // CMU to IPA mapping (for consonants)
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

      pronunciations3.push(convertedPhonemes.join(""));
    }

    return pronunciations3;
  };

  const content = (
    <div
      className="py-4 space-y-4"
      onContextMenu={(e) => {
        // Only allow context menu on word spans
        if (e.target.tagName !== "SPAN") {
          e.preventDefault();
        }
      }}
    >
      {annotatedTranscript.map((paragraph, index) => (
        <p key={index} className="leading-relaxed">
          {paragraph.alignment.map((wordObj) => {
            const annotations = getAnnotations(wordObj.wordIndex);
            const hasAnnotations = annotations.length > 0;
            const isActive = activeWordIndex === wordObj.wordIndex;
            const highlightState = shouldHighlightWord(wordObj);

            const wordSpan = (
              <span
                className={cn(
                  "cursor-pointer rounded-[5px]",
                  {
                    "text-[hsl(var(--annotation-foreground))] bg-[hsl(var(--annotation))]":
                      highlightState === true && hasAnnotations && !isActive,
                    "text-[hsl(var(--hover2-foreground))] bg-[hsl(var(--hover2))]":
                      highlightState === "hover2" && !isActive,
                    "!bg-[#aa00aa80]": isActive,
                  },
                  "hover:bg-[hsl(var(--hover))] hover:text-[hsl(var(--hover-foreground))]"
                )}
                onClick={() => handleWordClick(wordObj.start_time)}
                onMouseOver={() => {
                  handleWordHover(wordObj.wordIndex, wordObj.word);
                }}
                onContextMenu={(e) =>
                  handleContextMenu(e, wordObj.wordIndex, wordObj.word)
                }
              >
                {wordObj.word}
              </span>
            );

            return (
              <React.Fragment key={wordObj.wordIndex}>
                {tooltipsEnabled ? (
                  <_WordTooltip
                    wordSpan={wordSpan}
                    isLoadingWordData={isLoadingWordData}
                    currentWordData={currentWordData}
                    pronunciationIndex={pronunciationIndex}
                    setPronunciationIndex={setPronunciationIndex}
                    audioData={audioData}
                    currentWord={currentWord}
                    isLoadingAudio={isLoadingAudio}
                    currentlyPlayingAudio={currentlyPlayingAudio}
                    setCurrentlyPlayingAudio={setCurrentlyPlayingAudio}
                  />
                ) : (
                  wordSpan
                )}{" "}
              </React.Fragment>
            );
          })}
        </p>
      ))}
    </div>
  );

  if (!isAdmin) {
    return (
      <>
        {content}
        {/* Audio elements */}
        {audioData.map((audio) => (
          <audio
            key={audio.id}
            id={`audio-${audio.id}`}
            src={audio.audio}
            onEnded={() => setCurrentlyPlayingAudio(null)}
            preload="none"
          />
        ))}
      </>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>{content}</ContextMenuTrigger>
      <ContextMenuContent className="w-auto z-9999 max-h-120">
        {issuesData.map((target) => (
          <ContextMenuSub key={target.id}>
            <ContextMenuSubTrigger>{target.name}</ContextMenuSubTrigger>
            <ContextMenuSubContent className="max-h-64 overflow-y-auto">
              {target.issues.map((issue) => (
                <ContextMenuItem
                  key={issue.id}
                  onSelect={() =>
                    handleIssueSelect(contextMenu.wordIndex, issue.id)
                  }
                >
                  {issue.name}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        ))}
      </ContextMenuContent>
      {/* Audio elements */}
      {audioData.map((audio) => (
        <audio
          key={audio.id}
          id={`audio-${audio.id}`}
          src={audio.audio}
          onEnded={() => setCurrentlyPlayingAudio(null)}
          preload="none"
        />
      ))}

      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </ContextMenu>
  );
};

function _WordTooltip({
  wordSpan,
  isLoadingWordData,
  currentWordData,
  pronunciationIndex,
  setPronunciationIndex,
  audioData,
  currentWord,
  isLoadingAudio,
  currentlyPlayingAudio,
  setCurrentlyPlayingAudio,
  forceOpen = undefined,
}) {
  return (
    <Tooltip open={forceOpen} onOpenChange={() => {}}>
      <TooltipTrigger asChild>{wordSpan}</TooltipTrigger>
      <TooltipContent
        className="max-w-xs p-1"
        side="top"
        align="center"
        sideOffset={-10}
        avoidCollisions={true}
      >
        <div className="space-y-1">
          {/* Annotations Section */}
          <_WordAnnotations
            isLoadingWordData={isLoadingWordData}
            currentWordData={currentWordData}
          />
          {/* Pronunciation Section - Always Show */}
          <_WordPronunciations
            currentWordData={currentWordData}
            isLoadingWordData={isLoadingWordData}
            pronunciationIndex={pronunciationIndex}
            setPronunciationIndex={setPronunciationIndex}
          />

          {/* Audio Section - Always Show */}
          <_WordAudio
            audioData={audioData}
            currentWord={currentWord}
            isLoadingAudio={isLoadingAudio}
            currentlyPlayingAudio={currentlyPlayingAudio}
            setCurrentlyPlayingAudio={setCurrentlyPlayingAudio}
          />
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function _WordAnnotations({ isLoadingWordData, currentWordData }) {
  return (
    <div className="bg-muted/20 rounded-md pb-1 mt-0">
      <div className="relative flex items-center justify-center">
        <div className="font-semibold text-xs text-center text-background/90 bg-zinc-600 py-0.5 rounded-t-md w-full">
          ANNOTATIONS
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsShortcutsModalOpen(true);
          }}
          className="absolute right-[2px] p-0 rounded-full cursor-pointer"
          title="Pronunciation Guide"
        >
          <HelpCircle className="h-3 w-3 text-background/80 hover:text-background" />
        </button>
      </div>
      <div className="text-xs text-center mt-1 px-1">
        {isLoadingWordData ? (
          <div className="text-background/80  ">Loading...</div>
        ) : currentWordData.annotations.length > 0 ? (
          currentWordData.annotations.map((annotation, index) => (
            <div key={index}>{annotation}</div>
          ))
        ) : (
          <div className="text-muted-foreground">None</div>
        )}
      </div>
    </div>
  );
}

function _WordPronunciations({
  currentWordData,
  isLoadingWordData,
  pronunciationIndex,
  setPronunciationIndex,
}) {
  const getMaxPronunciations = () => {
    return Math.max(
      currentWordData.pronunciations.length,
      currentWordData.pronunciations2.length,
      currentWordData.pronunciations3.length
    );
  };

  // Function to detect TRAP allophonic patterns
  const getTrapAllophonicNote = (pronunciations) => {
    if (!pronunciations || pronunciations.length === 0) return null;

    for (const pronunciation of pronunciations) {
      const phonemes = pronunciation.split(" ");

      for (let i = 0; i < phonemes.length - 1; i++) {
        const currentPhoneme = phonemes[i].replace(/[0-2]$/, ""); // Remove stress marker
        const nextPhoneme = phonemes[i + 1].replace(/[0-2]$/, ""); // Remove stress marker

        if (currentPhoneme === "AE") {
          // TRAP vowel
          if (nextPhoneme === "M" || nextPhoneme === "N") {
            return "TRAP before M or N becomes more like [eə̯]";
          } else if (nextPhoneme === "NG") {
            return "TRAP before NG becomes more like [eɪ̯]";
          }
        }
      }
    }

    return null;
  };

  const nextPronunciation = () => {
    const max = getMaxPronunciations();
    setPronunciationIndex((prev) => (prev + 1) % max);
  };

  const prevPronunciation = () => {
    const max = getMaxPronunciations();
    setPronunciationIndex((prev) => (prev - 1 + max) % max);
  };

  return (
    <div className="bg-muted/20 rounded-md pb-1 mt-0">
      <div className="font-semibold text-xs text-center mb-1 text-background/90 bg-emerald-600 py-0.5 rounded-t-md w-full">
        PRONUNCIATION{" "}
        {getMaxPronunciations() > 1
          ? `${pronunciationIndex + 1}/${getMaxPronunciations()}`
          : ""}
      </div>

      {getMaxPronunciations() > 0 ? (
        <>
          <div className="mb-1">
            <div className="font-semibold text-xs text-center">CMU:</div>
            <div className="text-xs text-center px-1">
              {isLoadingWordData ? (
                <div className="text-background/80">Loading...</div>
              ) : currentWordData.pronunciations.length > 0 ? (
                currentWordData.pronunciations[pronunciationIndex] || "N/A"
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
                <div className="text-background/80">Loading...</div>
              ) : currentWordData.pronunciations2.length > 0 ? (
                currentWordData.pronunciations2[pronunciationIndex] || "N/A"
              ) : (
                "N/A"
              )}
            </div>
          </div>

          <div className="mb-1">
            <div className="font-semibold text-xs text-center">IPA:</div>
            <div className="text-xs text-center px-1">
              {isLoadingWordData ? (
                <div className="text-background/80">Loading...</div>
              ) : currentWordData.pronunciations3.length > 0 ? (
                currentWordData.pronunciations3[pronunciationIndex] || "N/A"
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
                {Array.from({ length: getMaxPronunciations() }, (_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      i === pronunciationIndex ? "bg-gray-600" : "bg-gray-300"
                    }`}
                  />
                ))}
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

      {/* Allophonic note for TRAP patterns */}
      {!isLoadingWordData &&
        currentWordData.pronunciations.length > 0 &&
        (() => {
          const allophonicNote = getTrapAllophonicNote(
            currentWordData.pronunciations
          );
          return allophonicNote ? (
            <div className="text-xs text-center text-muted-background px-1 mt-1 border-t border-border/20 pt-1">
              Note: {allophonicNote}
            </div>
          ) : null;
        })()}
    </div>
  );
}

function _WordAudio({
  audioData,
  currentWord,
  isLoadingAudio,
  currentlyPlayingAudio,
  setCurrentlyPlayingAudio,
}) {
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
        audioElement.play();
        setCurrentlyPlayingAudio(audioId);
      }
    }
  };
  return (
    <div className="bg-muted/20 rounded-md pb-1 mt-0">
      <div className="font-semibold text-xs text-center mb-1 text-background/90 bg-amber-600 py-0.5 rounded-t-md w-full">
        AUDIO
      </div>
      {isLoadingAudio ? (
        <div className="text-xs text-center text-background/80  px-1">
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
                <span className="text-base leading-none">{audio.flag}</span>
                {currentlyPlayingAudio === audio.id ? (
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
              const cleanWord = cleanWordForAPI(currentWord, "wiktionary");
              return (
                <_RenderExternalPronunciationLinks cleanWord={cleanWord} />
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function _RenderExternalPronunciationLinks({ cleanWord }) {
  const links = [
    {
      name: "YouGlish",
      href: `https://youglish.com/pronounce/${encodeURIComponent(
        cleanWord
      )}/english/us`,
      title: "Hear real-world pronunciations on YouGlish",
    },
    {
      name: "PlayPhrase",
      href: `https://playphrase.me/#/search?q=${encodeURIComponent(cleanWord)}`,
      title: "Hear movie/TV pronunciations on PlayPhrase",
    },
    {
      name: "Yarn",
      href: `https://getyarn.io/yarn-find?text=${encodeURIComponent(
        cleanWord
      )}`,
      title: "Hear movie/TV pronunciations on Yarn",
    },
  ];

  return (
    <>
      {links.map((link, i) => (
        <React.Fragment key={link.name}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
            title={link.title}
          >
            {link.name}
          </a>
          {i < links.length - 1 && <span> | </span>}
        </React.Fragment>
      ))}
    </>
  );
}

export default TranscriptViewerV1;
export {
  _WordTooltip,
  _WordAnnotations,
  _WordPronunciations,
  _WordAudio,
  _RenderExternalPronunciationLinks,
};
