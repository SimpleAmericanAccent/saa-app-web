import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "frontend-web-core/src/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { Checkbox } from "frontend-web-core/src/components/ui/checkbox";
import { Button } from "frontend-web-core/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "frontend-web-core/src/components/ui/dropdown-menu";
import { Settings } from "lucide-react";

const TranscriptStatsV2 = ({
  annotatedTranscript,
  issuesData,
  onFilterChange,
}) => {
  // Initialize selectedIssues only when issuesData changes, not on every render
  const [selectedIssues, setSelectedIssues] = useState({});
  const [targetSortOrder, setTargetSortOrder] = useState("instances"); // Changed from "standard"
  const [issueSortOrder, setIssueSortOrder] = useState("instances"); // Changed from "standard"
  const [hideEmptyTargets, setHideEmptyTargets] = useState(true); // Changed from false
  const [hideEmptyIssues, setHideEmptyIssues] = useState(true); // Changed from false

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
      };
    }

    const flattenedWords = annotatedTranscript.flatMap(
      (segment) => segment.alignment
    );
    const flattenedIssues = issuesData.flatMap((category) => category.issues);

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

  return (
    <div>
      <h2 className="text-2xl">Transcript Statistics</h2>
      <p>Total Words: {stats.totalWords}</p>
      <p>Annotated Words: {stats.annotatedWords}</p>
      <p>
        % Words Annotated:{" "}
        {Math.round((stats.annotatedWords / stats.totalWords) * 100)}%
      </p>
      {/* <p>Accent Issues In Database: {stats.totalIssues}</p>
      <p>Accent Issues In Database Used: {stats.accentIssues}</p>
      <p>Accent Issue Instances: {stats.accentIssueInstances}</p> */}

      <div className="mt-4">
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
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  View Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Sorting</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem
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
                    onClick={() =>
                      setIssueSortOrder((prev) =>
                        prev === "standard" ? "instances" : "standard"
                      )
                    }
                  >
                    Sort Issues by{" "}
                    {issueSortOrder === "standard" ? "Instances" : "Standard"}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Visibility</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuCheckboxItem
                    checked={hideEmptyTargets}
                    onCheckedChange={setHideEmptyTargets}
                  >
                    Hide Empty Targets
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={hideEmptyIssues}
                    onCheckedChange={setHideEmptyIssues}
                  >
                    Hide Empty Issues
                  </DropdownMenuCheckboxItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {sortedIssuesData &&
          sortedIssuesData.map((target, targetIndex) => {
            const targetInstances = target.issues.reduce((total, issue) => {
              return total + (stats.issueWordMap[issue.id]?.length || 0);
            }, 0);

            return (
              <Collapsible key={`${target.id}-${targetIndex}`} className="mt-4">
                <div className="flex items-center gap-2 w-full text-left">
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
                        <span className="text-annotation-foreground bg-[hsl(var(--annotation))] text-sm rounded-full px-2 py-0.5">
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
                      <div className="flex items-center gap-2 w-full text-left">
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
                              <span className="text-annotation-foreground bg-[hsl(var(--annotation))] text-sm rounded-full px-2 py-0.5">
                                {stats.issueWordMap[issue.id]?.length}
                              </span>
                            )}
                          </label>
                        </div>
                      </div>
                      <CollapsibleContent className="pl-5">
                        {stats.issueWordMap[issue.id]?.map(
                          (word, wordIndex) => (
                            <div
                              key={`${word.id}-${wordIndex}`}
                              className="pl-4 py-1"
                            >
                              {word.word} ({word.timestamp}s)
                            </div>
                          )
                        )}{" "}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
      </div>
    </div>
  );
};

export default TranscriptStatsV2;
