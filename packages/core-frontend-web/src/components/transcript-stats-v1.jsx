import React, { useMemo, useState, useEffect, useRef } from "react";
import { ChevronRight, Settings, Link } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "core-frontend-web/src/components/ui/collapsible";
import { Checkbox } from "core-frontend-web/src/components/ui/checkbox";
import { Button } from "core-frontend-web/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "core-frontend-web/src/components/ui/dropdown-menu";
import PhonemeGridSummary from "core-frontend-web/src/components/PhonemeGridSummary";
import { ScrollArea } from "core-frontend-web/src/components/ui/scroll-area";
import { useWordAudio } from "core-frontend-web/src/hooks/useWordAudio";

// Define WordFrequencyList component first
const WordFrequencyList = ({ words }) => {
  const [sortColumn, setSortColumn] = useState("priority"); // Add "priority" as default sort
  const [sortDirection, setSortDirection] = useState("desc");

  const sortedWords = useMemo(() => {
    const wordArray = Object.entries(words).map(([word, data]) => {
      const percentage = Math.round((data.annotated / data.total) * 100);
      // New priority formula:
      // If no annotations, priority is 0
      // Otherwise: (total * percentage) / 100
      // This means:
      // - 0% annotated = 0 priority
      // - Same annotation rate: higher total = higher priority
      // - Same total: higher annotation rate = higher priority
      const priorityScore =
        data.annotated === 0
          ? 0
          : percentage === 100
          ? data.total * 2 // Double weight for fully annotated words
          : (data.total * percentage) / 100;

      return {
        word,
        total: data.total,
        annotated: data.annotated,
        percentage,
        priorityScore,
      };
    });

    return wordArray.sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case "word":
          comparison = a.word.localeCompare(b.word);
          break;
        case "total":
          comparison = a.total - b.total;
          break;
        case "annotated":
          comparison = a.annotated - b.annotated;
          break;
        case "percentage":
          comparison = a.percentage - b.percentage;
          break;
        case "priority":
          comparison = a.priorityScore - b.priorityScore;
          break;
      }
      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [words, sortColumn, sortDirection]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const SortButton = ({ column, label }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center justify-center gap-1 hover:text-accent-foreground w-full cursor-pointer"
    >
      {label}
      {sortColumn === column && (
        <span className="text-xs">{sortDirection === "desc" ? "↓" : "↑"}</span>
      )}
    </button>
  );

  return (
    <div className="">
      <div className="flex items-center justify-between mb-2 sticky top-0 bg-background z-10">
        <h3 className="text-lg font-semibold">Word Frequency</h3>
      </div>
      <div className="space-y-1">
        {/* Header row */}
        <div className="grid grid-cols-5 gap-2 px-2 py-1 text-sm font-medium text-muted-foreground border-b">
          <SortButton column="word" label="Word" />
          <SortButton column="total" label="Total" />
          <SortButton column="annotated" label="Annotated" />
          <SortButton column="percentage" label="%" />
          <SortButton column="priority" label="Priority" />
        </div>
        {/* Data rows */}
        {sortedWords.map(
          ({ word, total, annotated, percentage, priorityScore }) => (
            <div
              key={word}
              className="grid grid-cols-5 gap-2 px-2 py-1 hover:bg-accent/50 rounded"
            >
              <span className="truncate">{word}</span>
              <span className="text-right">{total}</span>
              <span className="text-right">{annotated}</span>
              <span
                className={`text-right ${
                  percentage <= 25
                    ? "text-green-500"
                    : percentage <= 50
                    ? "text-yellow-500"
                    : percentage <= 75
                    ? "text-orange-500"
                    : "text-red-500"
                }`}
              >
                {percentage}%
              </span>
              <span className="text-right text-muted-foreground">
                {Math.round(priorityScore)}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const TranscriptStatsV1 = ({
  annotatedTranscript,
  issuesData,
  onFilterChange,
  setHoveredWordIndices,
}) => {
  // Initialize selectedIssues only when issuesData changes, not on every render
  const [selectedIssues, setSelectedIssues] = useState({});
  const [targetSortOrder, setTargetSortOrder] = useState("instances"); // Changed from "standard"
  const [issueSortOrder, setIssueSortOrder] = useState("instances"); // Changed from "standard"
  const [wordSortOrder, setWordSortOrder] = useState("instances"); // "time", "alphabetical", or "instances"
  const [hideEmptyTargets, setHideEmptyTargets] = useState(true); // Changed from false
  const [hideEmptyIssues, setHideEmptyIssues] = useState(true); // Changed from false
  const { playWord, isLoading } = useWordAudio();

  // Initialize issues once when issuesData is first available
  useEffect(() => {
    if (issuesData) {
      const initialIssues = issuesData.reduce((acc, target) => {
        target.issues.forEach((issue) => {
          acc[issue.id] = true;
        });
        return acc;
      }, {});
      setSelectedIssues(initialIssues);
      onFilterChange(Object.keys(initialIssues)); // Initial filter with all issues
    }
  }, [issuesData]); // Only run when issuesData changes

  // Separate effect for filter changes to avoid loops
  useEffect(() => {
    if (issuesData && Object.keys(selectedIssues).length > 0) {
      const activeIssues = Object.entries(selectedIssues)
        .filter(([_, checked]) => checked)
        .map(([issueId]) => issueId);
      onFilterChange(activeIssues);
    }
  }, [selectedIssues]); // Only run when selectedIssues changes

  // Add this function to get the global check state
  const getAllCheckState = () => {
    if (!issuesData || !Object.keys(selectedIssues).length) return false;

    const allIssues = issuesData.flatMap((target) => target.issues);
    const checkedCount = allIssues.reduce(
      (count, issue) => (selectedIssues[issue.id] ? count + 1 : count),
      0
    );

    if (checkedCount === 0) return false;
    if (checkedCount === allIssues.length) return true;
    return "indeterminate";
  };

  // Add this function to handle the global checkbox
  const handleAllChange = (checked) => {
    const allIssues = issuesData.flatMap((target) => target.issues);
    const issueUpdates = allIssues.reduce((acc, issue) => {
      acc[issue.id] = checked;
      return acc;
    }, {});

    setSelectedIssues(issueUpdates);
  };

  const stats = useMemo(() => {
    if (!annotatedTranscript || !issuesData) {
      return {
        totalWords: 0,
        annotatedWords: 0,
        totalIssues: 0,
        accentIssueInstances: 0,
        issueWordMap: {},
        flattenedIssues: [],
        wordFrequency: {},
      };
    }

    const flattenedWords = annotatedTranscript.flatMap(
      (segment) => segment.alignment
    );
    const flattenedIssues = issuesData.flatMap((category) => category.issues);

    // Modify word frequency calculation to include annotation info
    const wordFrequency = flattenedWords.reduce((acc, word) => {
      const cleanWord = word.word
        .replace(/[.,!?;:"()\[\]{}]/g, "")
        .toLowerCase()
        .trim();
      if (cleanWord) {
        if (!acc[cleanWord]) {
          acc[cleanWord] = {
            total: 0,
            annotated: 0,
          };
        }
        acc[cleanWord].total += 1;
        if (word["BR issues"] && word["BR issues"].length > 0) {
          acc[cleanWord].annotated += 1;
        }
      }
      return acc;
    }, {});

    // Create a mapping of issues to words
    const issueWordMap = flattenedIssues.reduce((acc, issue) => {
      acc[issue.id] = flattenedWords
        .filter(
          (word) => word["BR issues"] && word["BR issues"].includes(issue.id)
        )
        .map((word) => ({
          word: word.word,
          id: word.id,
          timestamp: word.start_time,
          wordIndex: word.wordIndex,
        }));
      return acc;
    }, {});

    const totalWords = flattenedWords.length;
    const totalIssues = flattenedIssues.length;

    const annotatedWords = flattenedWords.filter(
      (word) => word["BR issues"] && word["BR issues"].length > 0
    ).length;

    const accentIssues = issuesData.find(
      (category) => category.name === "Accent Issues"
    );
    const accentIssueIds = accentIssues
      ? accentIssues.issues.map((issue) => issue.id)
      : [];
    const accentIssueInstances = flattenedWords.filter(
      (word) =>
        word["BR issues"] &&
        word["BR issues"].some((annotation) =>
          accentIssueIds.includes(annotation)
        )
    ).length;

    return {
      totalWords,
      annotatedWords,
      totalIssues,
      accentIssueInstances,
      issueWordMap,
      flattenedIssues,
      wordFrequency,
    };
  }, [annotatedTranscript, issuesData]);

  // Enhanced check state logic
  const getTargetCheckState = (targetId) => {
    const targetIssues =
      issuesData.find((t) => t.id === targetId)?.issues || [];
    const checkedCount = targetIssues.reduce(
      (count, issue) => (selectedIssues[issue.id] ? count + 1 : count),
      0
    );

    if (checkedCount === 0) return false;
    if (checkedCount === targetIssues.length) return true;
    return "indeterminate";
  };

  const handleTargetChange = (targetId, checked) => {
    const targetIssues =
      issuesData.find((t) => t.id === targetId)?.issues || [];
    const issueUpdates = targetIssues.reduce((acc, issue) => {
      acc[issue.id] = checked;
      return acc;
    }, {});

    setSelectedIssues((prev) => ({ ...prev, ...issueUpdates }));
  };

  const handleIssueChange = (issueId, checked) => {
    setSelectedIssues((prev) => ({ ...prev, [issueId]: checked }));
  };

  // Modify the sortedIssuesData memo to filter empty targets and issues
  const sortedIssuesData = useMemo(() => {
    if (!issuesData) return [];

    let sortedData = [...issuesData];

    // Filter out empty targets if hideEmptyTargets is true
    if (hideEmptyTargets) {
      sortedData = sortedData.filter((target) => {
        const targetInstances = target.issues.reduce(
          (total, issue) => total + (stats.issueWordMap[issue.id]?.length || 0),
          0
        );
        return targetInstances > 0;
      });
    }

    // Sort targets if needed
    if (targetSortOrder === "instances") {
      sortedData = sortedData.sort((targetA, targetB) => {
        const targetAInstances = targetA.issues.reduce(
          (total, issue) => total + (stats.issueWordMap[issue.id]?.length || 0),
          0
        );

        const targetBInstances = targetB.issues.reduce(
          (total, issue) => total + (stats.issueWordMap[issue.id]?.length || 0),
          0
        );

        return targetBInstances - targetAInstances;
      });
    }

    // Filter and sort issues within targets
    sortedData = sortedData.map((target) => ({
      ...target,
      issues: [...target.issues]
        // Filter out empty issues if hideEmptyIssues is true
        .filter(
          (issue) =>
            !hideEmptyIssues || (stats.issueWordMap[issue.id]?.length || 0) > 0
        )
        // Sort issues if needed
        .sort((a, b) => {
          if (issueSortOrder === "instances") {
            return (
              (stats.issueWordMap[b.id]?.length || 0) -
              (stats.issueWordMap[a.id]?.length || 0)
            );
          }
          return 0;
        }),
    }));

    return sortedData;
  }, [
    targetSortOrder,
    issueSortOrder,
    hideEmptyTargets,
    hideEmptyIssues,
    issuesData,
    stats.issueWordMap,
  ]);

  const targetCounts = useMemo(() => {
    if (!issuesData) return {};
    const counts = {};
    issuesData.forEach((target) => {
      const count = target.issues.reduce(
        (sum, issue) => sum + (stats.issueWordMap[issue.id]?.length || 0),
        0
      );
      counts[target.name] = count;
    });
    return counts;
  }, [issuesData, stats.issueWordMap]);

  // Add this new function to generate the ChatGPT URL
  const generateChatGPTUrl = () => {
    const selectedIssuesList = Object.entries(selectedIssues)
      .filter(([_, checked]) => checked)
      .map(([issueId]) => {
        const issue = stats.flattenedIssues.find((i) => i.id === issueId);
        const words = stats.issueWordMap[issueId] || [];
        // Clean up punctuation, convert to lowercase, and remove duplicates
        const uniqueWords = [
          ...new Set(
            words.map(
              (w) =>
                w.word
                  .replace(/[.,!?;:"()\[\]{}]/g, "") // Remove punctuation
                  .trim() // Remove whitespace
                  .toLowerCase() // Convert to lowercase
            )
          ),
        ].filter((word) => word.length > 0); // Remove empty strings after cleaning

        // Count instances for each unique word
        const wordCounts = uniqueWords.map((word) => {
          const count = words.filter(
            (w) =>
              w.word
                .replace(/[.,!?;:"()\[\]{}]/g, "")
                .trim()
                .toLowerCase() === word
          ).length;
          return { word, count };
        });

        // Sort words by count (highest first)
        const sortedWords = wordCounts
          .sort((a, b) => b.count - a.count)
          .map(({ word }) => word);

        return {
          issue: issue?.name || "Unknown Issue",
          words: sortedWords,
          totalInstances: words.length,
        };
      })
      // Filter out issues with no words
      .filter(({ words }) => words.length > 0)
      // Sort issues by total instances (highest first)
      .sort((a, b) => b.totalInstances - a.totalInstances);

    // If no issues with words are selected, return early
    if (selectedIssuesList.length === 0) {
      return;
    }

    // Construct the prompt with clear instructions and organized content
    const prompt = `I need practice phrases for the following pronunciation issues. 
For each issue, please provide 3-5 practice phrases that naturally incorporate the target words. 
The phrases should be:
- Natural and conversational
- Varied in length and complexity
- Suitable for pronunciation practice
- Include the target words in different positions

${selectedIssuesList
  .map(({ issue, words }) => {
    return `Issue: ${issue}
Target Words: ${words.join(", ")}`;
  })
  .join("\n\n")}

Please provide the practice phrases for each issue separately. 
Please provide in the chat, not in code or canvas.
Please maintain the order of issues as they are provided.
Please make each target word bold and italicized, with a single 🌟 emoji immediately before the target word.
Before each response, please double-check each included issue, target word list, and practice phrase to make sure you have not added any words that are not in the provided target words for that issue.`;

    // Encode the prompt for URL
    const encodedPrompt = encodeURIComponent(prompt);

    // Construct the ChatGPT URL
    const chatGPTUrl = `https://chat.openai.com/?prompt=${encodedPrompt}`;

    // Open in new tab
    window.open(chatGPTUrl, "_blank");
  };

  return (
    <div>
      <div className="fixed top-[calc(var(--navbar-height))] bg-background">
        <div className="flex items-start justify-between gap-4">
          {/* Left column: existing header content */}
          <div>
            <h2 className="text-2xl">Transcript Statistics</h2>
            <p>Total Words: {stats.totalWords}</p>
            <p>Annotated Words: {stats.annotatedWords}</p>
            <p>
              % Words Annotated:{" "}
              {Math.round((stats.annotatedWords / stats.totalWords) * 100)}%
            </p>
          </div>
          {/* Right column: PhonemeGridSummary */}
          <div>
            <PhonemeGridSummary
              issueWordMap={stats.issueWordMap}
              issues={stats.flattenedIssues}
              targetCounts={targetCounts}
              stats={stats}
              selectedIssues={selectedIssues}
              setSelectedIssues={setSelectedIssues}
              issuesData={issuesData}
              onHover={setHoveredWordIndices}
            />
          </div>
        </div>
      </div>

      <div className="fixed top-[calc(var(--navbar-height)+192px)] bg-background">
        <h3 className="text-xl">Targets, Issues, & Associated Words</h3>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <Checkbox
            id="select-all"
            checked={getAllCheckState()}
            onCheckedChange={handleAllChange}
            aria-label="Select all issues"
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium cursor-pointer"
          >
            Select/Unselect All
          </label>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  View Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Sorting</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() =>
                      setTargetSortOrder((prev) =>
                        prev === "standard" ? "instances" : "standard"
                      )
                    }
                  >
                    Sort Targets by{" "}
                    {targetSortOrder === "standard" ? "Instances" : "Standard"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() =>
                      setIssueSortOrder((prev) =>
                        prev === "standard" ? "instances" : "standard"
                      )
                    }
                  >
                    Sort Issues by{" "}
                    {issueSortOrder === "standard" ? "Instances" : "Standard"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() =>
                      setWordSortOrder((prev) =>
                        prev === "time"
                          ? "alphabetical"
                          : prev === "alphabetical"
                          ? "instances"
                          : "time"
                      )
                    }
                  >
                    Sort Words by{" "}
                    {wordSortOrder === "time"
                      ? "Alphabetical"
                      : wordSortOrder === "alphabetical"
                      ? "instances"
                      : "Time"}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Visibility</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuCheckboxItem
                    className="cursor-pointer"
                    checked={hideEmptyTargets}
                    onCheckedChange={setHideEmptyTargets}
                  >
                    Hide Empty Targets
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    className="cursor-pointer"
                    checked={hideEmptyIssues}
                    onCheckedChange={setHideEmptyIssues}
                  >
                    Hide Empty Issues
                  </DropdownMenuCheckboxItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Add the new ChatGPT button */}
          <Button
            className="cursor-pointer"
            variant="outline"
            size="sm"
            onClick={generateChatGPTUrl}
            disabled={Object.values(selectedIssues).every((v) => !v)}
          >
            Get Practice Phrases for Selected Issues & Words
          </Button>
        </div>
      </div>

      <div className="mt-[calc(var(--navbar-height)+235px)] flex gap-4">
        <div className="flex-1">
          <ScrollArea className="h-[calc(100vh-var(--navbar-height)-235px)]">
            {sortedIssuesData &&
              sortedIssuesData.map((target, targetIndex) => {
                const targetInstances = target.issues.reduce((total, issue) => {
                  return total + (stats.issueWordMap[issue.id]?.length || 0);
                }, 0);
                return (
                  <Collapsible
                    key={`${target.id}-${targetIndex}`}
                    className="mt-4"
                  >
                    <div
                      className="flex items-center gap-2 w-full text-left"
                      onMouseEnter={() => {
                        // Get all word indices from this target's issues
                        const indices = target.issues.flatMap(
                          (issue) =>
                            stats.issueWordMap[issue.id]?.map(
                              (word) => word.wordIndex
                            ) || []
                        );
                        setHoveredWordIndices(indices);
                      }}
                      onMouseLeave={() => {
                        setHoveredWordIndices([]);
                      }}
                    >
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </CollapsibleTrigger>
                      <div className="flex items-center gap-2 flex-1">
                        <Checkbox
                          id={`target-${target.id}`}
                          checked={getTargetCheckState(target.id)}
                          onCheckedChange={(checked) =>
                            handleTargetChange(target.id, checked)
                          }
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Select ${target.name} target`}
                        />
                        <label
                          htmlFor={`target-${target.id}`}
                          className="text-lg font-bold flex items-center gap-2 cursor-pointer"
                        >
                          {target.name}
                          {targetInstances > 0 && (
                            <span className="text-[hsl(var(--annotation-foreground))] bg-[hsl(var(--annotation))] text-sm rounded-full px-2 py-0.5">
                              {targetInstances}
                            </span>
                          )}
                        </label>
                      </div>
                    </div>
                    <CollapsibleContent className="pl-6">
                      {target.issues.map((issue, issueIndex) => (
                        <Collapsible
                          key={`${issue.id}-${issueIndex}`}
                          className="mt-2"
                        >
                          <div
                            className="flex items-center gap-2 w-full text-left"
                            onMouseEnter={() => {
                              // Get all word indices from this issue
                              const indices =
                                stats.issueWordMap[issue.id]?.map(
                                  (word) => word.wordIndex
                                ) || [];
                              setHoveredWordIndices(indices);
                            }}
                            onMouseLeave={() => {
                              setHoveredWordIndices([]);
                            }}
                          >
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center gap-2 cursor-pointer">
                                <ChevronRight className="h-3 w-3" />
                              </div>
                            </CollapsibleTrigger>
                            <div className="flex items-center gap-2 flex-1">
                              <Checkbox
                                id={`issue-${issue.id}`}
                                checked={selectedIssues[issue.id] || false}
                                onCheckedChange={(checked) =>
                                  handleIssueChange(issue.id, checked)
                                }
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Select ${issue.name} issue`}
                              />
                              <label
                                htmlFor={`issue-${issue.id}`}
                                className="font-medium flex items-center gap-2 cursor-pointer"
                              >
                                {issue.name}
                                {(stats.issueWordMap[issue.id]?.length || 0) >
                                  0 && (
                                  <span className="text-[hsl(var(--annotation-foreground))] bg-[hsl(var(--annotation))] text-sm rounded-full px-2 py-0.5">
                                    {stats.issueWordMap[issue.id]?.length}
                                  </span>
                                )}
                                {/* Add individual link icons for each resource */}
                                {issue.resources &&
                                  issue.resources.map((resource, idx) => (
                                    <a
                                      key={idx}
                                      href={resource}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-muted-foreground hover:text-foreground"
                                      title={resource}
                                    >
                                      <Link className="h-4 w-4" />
                                    </a>
                                  ))}
                              </label>
                            </div>
                          </div>
                          <CollapsibleContent className="pl-5">
                            {Object.entries(
                              // Group words by their cleaned text
                              stats.issueWordMap[issue.id]?.reduce(
                                (groups, word) => {
                                  const cleanWord = word.word.replace(
                                    /[.,!?;:"()\[\]{}]/g,
                                    ""
                                  );
                                  if (!groups[cleanWord]) {
                                    groups[cleanWord] = [];
                                  }
                                  groups[cleanWord].push(word);
                                  return groups;
                                },
                                {}
                              ) || {}
                            )
                              .sort(
                                ([wordA, instancesA], [wordB, instancesB]) => {
                                  if (wordSortOrder === "time") {
                                    // Sort by earliest instance
                                    return (
                                      instancesA[0].timestamp -
                                      instancesB[0].timestamp
                                    );
                                  } else if (wordSortOrder === "alphabetical") {
                                    return wordA.localeCompare(wordB);
                                  } else {
                                    // Sort by count (most frequent first)
                                    return (
                                      instancesB.length - instancesA.length
                                    );
                                  }
                                }
                              )
                              .map(([word, instances]) => (
                                <Collapsible key={word} className="mt-1">
                                  <div
                                    className="flex items-center gap-2 w-full text-left"
                                    onMouseEnter={() => {
                                      // Get all word indices from the instances
                                      const indices = instances.map(
                                        (instance) => instance.wordIndex
                                      );
                                      setHoveredWordIndices(indices);
                                    }}
                                    onMouseLeave={() => {
                                      setHoveredWordIndices([]);
                                    }}
                                  >
                                    <CollapsibleTrigger asChild>
                                      <div className="flex items-center gap-2 cursor-pointer">
                                        <ChevronRight className="h-3 w-3" />
                                      </div>
                                    </CollapsibleTrigger>
                                    <div className="flex items-center gap-2 flex-1">
                                      <label className="font-medium flex items-center gap-2 cursor-pointer">
                                        {word}
                                        <span className="text-[hsl(var(--annotation-foreground))] bg-[hsl(var(--annotation))] text-sm rounded-full px-2 py-0.5">
                                          {instances.length}
                                        </span>
                                        <button
                                          onClick={() => playWord(word)}
                                          disabled={isLoading}
                                          className="cursor-pointer hover:bg-accent/50 inline-flex items-center"
                                          title="Play reference audio"
                                        >
                                          <span className="text-muted-foreground">
                                            {isLoading ? "⏳" : "🔊"}
                                          </span>
                                        </button>
                                        <a
                                          href={`https://youglish.com/pronounce/${encodeURIComponent(
                                            word
                                          )}/english/us`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-muted-foreground hover:text-foreground text-xs font-medium"
                                          title="Listen on YouGlish"
                                        >
                                          YG
                                        </a>
                                      </label>
                                    </div>
                                  </div>
                                  <CollapsibleContent className="pl-4">
                                    {instances
                                      .sort((a, b) => a.timestamp - b.timestamp)
                                      .map((instance, index) => (
                                        <div
                                          key={index}
                                          className="pl-4 py-1"
                                          onMouseEnter={() => {
                                            // Just highlight this specific instance
                                            setHoveredWordIndices([
                                              instance.wordIndex,
                                            ]);
                                          }}
                                          onMouseLeave={() => {
                                            setHoveredWordIndices([]);
                                          }}
                                        >
                                          {instance.word} (
                                          {instance.timestamp.toFixed(1)}s)
                                        </div>
                                      ))}
                                  </CollapsibleContent>
                                </Collapsible>
                              ))}
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
          </ScrollArea>
        </div>
        {/* Right column: Word Frequency List */}
        <div className="flex-1">
          <ScrollArea className="h-[calc(100vh-var(--navbar-height)-235px)]">
            <WordFrequencyList words={stats.wordFrequency} />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default TranscriptStatsV1;
