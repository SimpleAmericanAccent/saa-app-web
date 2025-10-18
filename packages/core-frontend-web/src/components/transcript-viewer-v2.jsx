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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "core-frontend-web/src/components/ui/tooltip";

const TranscriptViewerV2 = ({
  annotatedTranscript,
  activeWordIndex,
  handleWordClick,
  onAnnotationHover,
  onAnnotationUpdate,
  issuesData,
  // activeFilters = [],
  tooltipsEnabled = true,
}) => {
  const [contextMenu, setContextMenu] = useState({
    wordIndex: null,
  });
  const [currentWordData, setCurrentWordData] = useState({
    annotations: [],
  });

  const getAnnotations = (wordIndex) => {
    const word = annotatedTranscript
      .flatMap((paragraph) => paragraph.alignment)
      .find((word) => word.wordIndex === wordIndex);
    return word.Annotations
      ? word.Annotations.map((annotation) => annotation.Target) || []
      : [];
    // return record ? record.fields["BR issues"] : [];
  };

  // Helper function to get target names from IDs
  const getTargetNames = (targetIds) => {
    if (!targetIds || !issuesData.length) return [];

    return targetIds.map((array) =>
      array.map((id) => {
        // Find the category that contains this issue
        const category = issuesData.find((cat) => cat.id === id);

        if (category) {
          return category.name;
        }
        return id;
      })
    );
  };

  // const shouldHighlightWord = (word) => {
  //   if (!activeFilters.length) return true; // Show all if no filters
  //   return word["BR issues"]?.some((issueId) =>
  //     activeFilters.includes(issueId)
  //   );
  // };

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

  const handleWordHover = (wordIndex) => {
    const annotationIds = getAnnotations(wordIndex);
    const friendlyTargetNames = getTargetNames(annotationIds);
    setCurrentWordData({ annotations: friendlyTargetNames });

    // Still call parent callback for backward compatibility
    if (onAnnotationHover) {
      onAnnotationHover(friendlyTargetNames);
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

                const wordSpan = (
                  <span
                    className={cn(
                      "cursor-pointer rounded-[5px]",
                      {
                        "text-annotation-foreground bg-[hsl(var(--annotation))]":
                          // shouldHighlightWord(wordObj) &&
                          hasAnnotations && !isActive,
                        "!bg-[#aa00aa80]": isActive,
                      },
                      "hover:bg-[hsl(var(--hover))]"
                    )}
                    onClick={() => handleWordClick(wordObj.start_time)}
                    onMouseOver={() => handleWordHover(wordObj.wordIndex)}
                    onContextMenu={(e) =>
                      handleContextMenu(e, wordObj.wordIndex)
                    }
                  >
                    {wordObj.word}
                  </span>
                );

                return (
                  <React.Fragment key={wordObj.wordIndex}>
                    {tooltipsEnabled ? (
                      <Tooltip>
                        <TooltipTrigger asChild>{wordSpan}</TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="space-y-1">
                            {currentWordData.annotations.length > 0 && (
                              <div>
                                <div className="font-semibold text-xs">
                                  Annotations:
                                </div>
                                <div className="text-xs">
                                  {currentWordData.annotations.map(
                                    (annotation, index) => (
                                      <div key={index}>{annotation}</div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                            {currentWordData.annotations.length === 0 && (
                              <div className="text-xs text-muted-foreground">
                                No annotation data available
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      wordSpan
                    )}{" "}
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
    </ContextMenu>
  );
};

export default TranscriptViewerV2;
