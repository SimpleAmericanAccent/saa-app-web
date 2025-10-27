import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIssuesStore } from "../stores/issues-store";
import { ExternalLink, Brain } from "lucide-react";
import { Button } from "../components/ui/button";
import PhonemeGridSummary from "../components/phoneme-grid-summary";
import accentExplorerData from "../data/accent-explorer-data";
import { hasQuizForTargetIssue } from "./quiz";

export default function AccentExplorer() {
  const { targetSlug } = useParams();
  const navigate = useNavigate();
  const { issuesData, loading, error, fetchIssues, findTargetBySlug } =
    useIssuesStore();
  const [selectedTarget, setSelectedTarget] = useState(null);

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
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Target:
            </h3>
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
                                <span
                                  key={index}
                                  className="bg-background/50 border border-border/50 rounded px-2 py-1 text-sm"
                                >
                                  {word || "N/A"}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* All Resources in Compact Layout */}
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Left Column: Quizzes and Resources Stacked */}
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

                        {/* Right Column: Reels */}
                        {allReels.length > 0 && (
                          <div className="lg:col-span-3">
                            <h4 className="font-medium text-foreground mb-2 text-sm">
                              Practice Reels
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
    </div>
  );
}
