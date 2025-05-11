/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from "react";
import React from "react";
import { cn } from "core-frontend-web/src/lib/utils";
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
  issuesData,
  activeFilters = [],
}) => {
  const [contextMenu, setContextMenu] = useState({
    wordIndex: null,
  });

  const getAnnotations = (wordIndex) => {
    const word = annotatedTranscript
      .flatMap((paragraph) => paragraph.alignment)
      .find((word) => word.wordIndex === wordIndex);
    return word ? word["BR issues"] || [] : [];
    // return record ? record.fields["BR issues"] : [];
  };

  const shouldHighlightWord = (word) => {
    if (!activeFilters.length) return true; // Show all if no filters
    return word["BR issues"]?.some((issueId) =>
      activeFilters.includes(issueId)
    );
  };

  const handleContextMenu = (e, wordIndex) => {
    setContextMenu({
      wordIndex,
    });
  };

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

        // console.log("data", data);
        return data.pronsCmuDict.map((p) => p.pronCmuDict);
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching pronunciation:", error);
      return [];
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="py-4 space-y-4">
          {annotatedTranscript.map((paragraph, index) => (
            <p key={index} className="leading-relaxed">
              {paragraph.alignment.map((wordObj) => {
                const annotations = getAnnotations(wordObj.wordIndex);
                const hasAnnotations = annotations.length > 0;
                const isActive = activeWordIndex === wordObj.wordIndex;

                return (
                  <React.Fragment key={wordObj.wordIndex}>
                    <span
                      className={cn(
                        "cursor-pointer rounded-[5px]",
                        {
                          "text-annotation-foreground bg-[hsl(var(--annotation))]":
                            shouldHighlightWord(wordObj) &&
                            hasAnnotations &&
                            !isActive,
                          "!bg-[#aa00aa80]": isActive,
                        },
                        "hover:bg-[hsl(var(--hover))]"
                      )}
                      onClick={() => handleWordClick(wordObj.start_time)}
                      onMouseOver={() => {
                        handleAnnotationHover(wordObj.wordIndex);
                        handlePronunciationHover(wordObj.word);
                      }}
                      onContextMenu={(e) =>
                        handleContextMenu(e, wordObj.wordIndex)
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
      </ContextMenuTrigger>
      <ContextMenuContent className="w-auto">
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
