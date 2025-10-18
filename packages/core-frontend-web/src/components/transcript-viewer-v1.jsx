/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from "react";
import React from "react";
import { cn } from "core-frontend-web/src/lib/utils";
import useAuthStore from "core-frontend-web/src/stores/authStore";
import { useWordAudio } from "core-frontend-web/src/hooks/useWordAudio";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "core-frontend-web/src/components/ui/context-menu";

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
}) => {
  const [contextMenu, setContextMenu] = useState({
    wordIndex: null,
  });
  const { isAdmin } = useAuthStore();
  const { playWord, isLoading } = useWordAudio();

  const getAnnotations = (wordIndex) => {
    const word = annotatedTranscript
      .flatMap((paragraph) => paragraph.alignment)
      .find((word) => word.wordIndex === wordIndex);
    return word ? word["BR issues"] || [] : [];
    // return record ? record.fields["BR issues"] : [];
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

  const handlePronunciationHover = async (word) => {
    const pronunciations = await getPronunciations(word);
    if (onPronunciationHover) {
      onPronunciationHover(pronunciations);
    }
    const pronunciations2 = await getPronunciations2(pronunciations);
    if (onPronunciation2Hover) {
      onPronunciation2Hover(pronunciations2);
    }
  };

  const getPronunciations = async (word) => {
    // Helper function to clean word for CMU Dict lookup
    const cleanWordForLookup = (word) => {
      if (!word) return "";
      // Remove punctuation and convert to lowercase
      return word.replace(/[.,!?;:"()\[\]{}]/g, "").toLowerCase();
    };

    const cleanWord = cleanWordForLookup(word);
    if (!cleanWord) return;

    try {
      const response = await fetch(`/api/ortho/word/${cleanWord}`);
      if (response.ok) {
        const data = await response.json();

        if (data.error) {
          return ["no pronunciation found"];
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

        return lexicalSet ? lexicalSet[0] + stressMarker : phoneme;
      });

      return convertedPhonemes.join(" ");
    });

    return pronunciations2;
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

            return (
              <React.Fragment key={wordObj.wordIndex}>
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
                    handleAnnotationHover(wordObj.wordIndex);
                    handlePronunciationHover(wordObj.word);
                  }}
                  onContextMenu={(e) =>
                    handleContextMenu(e, wordObj.wordIndex, wordObj.word)
                  }
                >
                  {wordObj.word}
                </span>{" "}
              </React.Fragment>
            );
          })}
        </p>
      ))}
    </div>
  );

  if (!isAdmin) {
    return content;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>{content}</ContextMenuTrigger>
      <ContextMenuContent className="w-auto z-9999">
        {issuesData.map((target) => (
          <ContextMenuSub key={target.id}>
            <ContextMenuSubTrigger>{target.name}</ContextMenuSubTrigger>
            <ContextMenuSubContent>
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
    </ContextMenu>
  );
};

export default TranscriptViewerV1;
