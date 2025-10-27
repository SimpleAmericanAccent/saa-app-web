import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIssuesStore } from "../stores/issues-store";
import { ExternalLink, BookOpen, Play, Brain } from "lucide-react";
import { Button } from "../components/ui/button";
import PhonemeGridSummary from "../components/phoneme-grid-summary";
import { hasQuizForTargetIssue } from "./quiz";
import accentExplorerData from "../data/accent-explorer-data";

export default function AccentExplorer() {
  const { targetSlug, issueSlug } = useParams();
  const navigate = useNavigate();
  const {
    issuesData,
    loading,
    error,
    fetchIssues,
    findTargetBySlug,
    findIssueBySlug,
  } = useIssuesStore();
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedIssues, setSelectedIssues] = useState({});
  const [selectedIssue, setSelectedIssue] = useState(null);

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

  // Get issues for selected target
  const filteredIssues = useMemo(() => {
    if (!selectedTarget) return [];

    let target = issuesData.find((t) => t.name === selectedTarget);
    if (!target) return [];

    return target.issues;
  }, [selectedTarget, issuesData]);

  // Check if a quiz exists for the current target/issue combination
  const hasQuiz = useMemo(() => {
    return hasQuizForTargetIssue(selectedTarget, selectedIssue?.shortName);
  }, [selectedTarget, selectedIssue]);

  // Handle phoneme grid click
  const handlePhonemeClick = (label) => {
    const target = issuesData.find((t) => t.name === label);

    if (target) {
      // Toggle selection: if clicking the same target, clear it; otherwise select it
      if (selectedTarget === label) {
        setSelectedTarget(null);
        setSelectedIssue(null);
        navigate("/accent-explorer");
      } else {
        setSelectedTarget(label);
        setSelectedIssue(null);
        navigate(`/${label.toLowerCase()}`);
      }
    }
  };

  // Handle issue click
  const handleIssueClick = (issue) => {
    if (selectedIssue && selectedIssue.id === issue.id) {
      // Deselect if clicking the same issue
      setSelectedIssue(null);
      navigate(`/${selectedTarget.toLowerCase()}`);
    } else {
      // Select new issue
      setSelectedIssue(issue);
      navigate(`/${selectedTarget.toLowerCase()}/${issue.shortName}`);
    }
  };

  // Handle URL parameters on component mount and when they change
  useEffect(() => {
    if (targetSlug && issuesData.length > 0) {
      const target = findTargetBySlug(targetSlug);
      if (target) {
        setSelectedTarget(target.name);

        if (issueSlug) {
          const issue = findIssueBySlug(targetSlug, issueSlug);
          if (issue) {
            setSelectedIssue(issue);
          }
        } else {
          setSelectedIssue(null);
        }
      }
    } else if (!targetSlug) {
      // Reset to no selection when on /accent-explorer
      setSelectedTarget(null);
      setSelectedIssue(null);
    }
  }, [targetSlug, issueSlug, issuesData, findTargetBySlug, findIssueBySlug]);

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
          Accent Targets & Issues
        </h1>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-2 px-4">
        {/* Row 1: Phoneme Grid + Issues */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Phoneme Grid */}
          <div className="bg-card border border-border rounded-lg p-4 flex-shrink-0">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Target:
            </h3>
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
          {/* Issues Area */}
          <div className="flex-1 min-w-0">
            {selectedTarget ? (
              <div className="bg-card border border-border rounded-lg p-4 h-full">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Issue:
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    Target was {selectedTarget}, but it sounded more like...
                  </p>
                </div>

                {filteredIssues.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No issues available for this target
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
                    {filteredIssues.map((issue) => {
                      const hasResources = issue.resources.length > 0;
                      return (
                        <div
                          key={issue.id}
                          className={`flex flex-col items-center justify-center rounded border transition-colors cursor-pointer ${
                            selectedIssue && selectedIssue.id === issue.id
                              ? "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700"
                              : hasResources
                              ? "bg-background/50 border-border/50 hover:bg-muted/50"
                              : "bg-muted/30 border-border/30 text-muted-foreground hover:bg-muted/50"
                          }`}
                          style={{
                            minWidth: 60,
                            maxWidth: 60,
                            width: 60,
                            minHeight: 28,
                            fontSize: 12,
                            fontWeight: "bold",
                            margin: 1,
                          }}
                          onClick={() => handleIssueClick(issue)}
                        >
                          <div className="text-center">
                            <div className="font-mono text-xs font-medium">
                              {issue.shortName}
                            </div>
                            <div className="text-xs opacity-75">
                              {issue.resources.length}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-4 h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground text-lg">
                    Click on any phoneme to explore its accent issues
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Click the same phoneme again to deselect
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Target Info or Issue Details */}
        {selectedTarget && (
          <div className="bg-card border border-border rounded-lg p-4">
            {selectedIssue ? (
              /* Issue Details */
              <div>
                {(() => {
                  let issueData;
                  try {
                    issueData = accentExplorerData.getIssueData(
                      selectedIssue.name
                    );
                  } catch (error) {
                    console.warn("Error getting issue data:", error);
                    issueData = null;
                  }

                  return (
                    <div>
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {issueData?.name || selectedIssue.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {selectedIssue.resources.length} resource
                          {selectedIssue.resources.length !== 1 ? "s" : ""}{" "}
                          available
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {hasQuiz && (
                            <Button
                              onClick={() =>
                                navigate(
                                  `/quiz/${selectedTarget.toLowerCase()}/${selectedIssue.shortName.toLowerCase()}`
                                )
                              }
                              className="cursor-pointer"
                            >
                              <Brain className="mr-2 h-4 w-4" />
                              Start Quiz
                            </Button>
                          )}
                          {issueData?.audioResources && (
                            <Button
                              variant="outline"
                              className="cursor-pointer"
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Audio Guide
                            </Button>
                          )}
                          {issueData && (
                            <Button
                              variant="outline"
                              className="cursor-pointer"
                            >
                              <BookOpen className="mr-2 h-4 w-4" />
                              Learn More
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Rich Content */}
                      {issueData && (
                        <div className="space-y-6">
                          {/* Description */}
                          {issueData?.description && (
                            <div>
                              <h4 className="font-medium text-foreground mb-2">
                                Description
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {issueData.description}
                              </p>
                            </div>
                          )}

                          {/* Example Words */}
                          {issueData?.exampleWords &&
                            Array.isArray(issueData.exampleWords) && (
                              <div>
                                <h4 className="font-medium text-foreground mb-2">
                                  Example Words
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {issueData.exampleWords.map(
                                    (example, index) => {
                                      if (!example || !example.word)
                                        return null;
                                      return (
                                        <div
                                          key={index}
                                          className="bg-background/50 border border-border/50 rounded p-2"
                                        >
                                          <div className="font-medium text-foreground">
                                            {example.word}
                                          </div>
                                          {example.correct && (
                                            <div className="text-sm text-green-600">
                                              ✓ {example.correct}
                                            </div>
                                          )}
                                          {example.incorrect && (
                                            <div className="text-sm text-red-600">
                                              ✗ {example.incorrect}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            )}

                          {/* External Resources */}
                          {issueData?.externalResources &&
                            Array.isArray(issueData.externalResources) && (
                              <div>
                                <h4 className="font-medium text-foreground mb-2">
                                  External Resources
                                </h4>
                                <div className="space-y-2">
                                  {issueData.externalResources.map(
                                    (resource, index) => {
                                      if (!resource || !resource.url)
                                        return null;
                                      return (
                                        <a
                                          key={index}
                                          href={resource.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block p-2 bg-background/50 border border-border/50 rounded hover:bg-background/70 transition-colors"
                                        >
                                          <div className="font-medium text-foreground">
                                            {resource.name || "Resource"}
                                          </div>
                                          {resource.description && (
                                            <div className="text-sm text-muted-foreground">
                                              {resource.description}
                                            </div>
                                          )}
                                        </a>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Difficulty */}
                          {issueData?.difficulty && (
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <div>
                                <span className="font-medium">Difficulty:</span>{" "}
                                {issueData.difficulty}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {selectedIssue.resources.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                    {selectedIssue.resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 bg-background/50 border border-border/50 rounded hover:bg-background/70 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                              <span className="text-lg">🎬</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">
                                Reel {index + 1}
                              </h4>
                              <p className="text-sm text-muted-foreground"></p>
                            </div>
                          </div>
                          <ExternalLink
                            size={16}
                            className="text-muted-foreground"
                          />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No resources available for this issue
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Target Info */
              <div>
                {(() => {
                  let targetData;
                  try {
                    targetData =
                      accentExplorerData.getTargetData(selectedTarget);
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
                        <p className="text-sm text-muted-foreground mb-3">
                          {filteredIssues.length} issue
                          {filteredIssues.length !== 1 ? "s" : ""} available.
                          Click on an issue above to see details.
                        </p>
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

                        {/* External Resources */}
                        {targetData.externalResources &&
                          Array.isArray(targetData.externalResources) && (
                            <div>
                              <h4 className="font-medium text-foreground mb-2">
                                External Resources
                              </h4>
                              <div className="space-y-2">
                                {targetData.externalResources.map(
                                  (resource, index) => {
                                    if (!resource || !resource.url) return null;
                                    return (
                                      <a
                                        key={index}
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-2 bg-background/50 border border-border/50 rounded hover:bg-background/70 transition-colors"
                                      >
                                        <div className="font-medium text-foreground">
                                          {resource.name || "Resource"}
                                        </div>
                                        {resource.description && (
                                          <div className="text-sm text-muted-foreground">
                                            {resource.description}
                                          </div>
                                        )}
                                      </a>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Target: {selectedTarget}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {filteredIssues.length} issue
                        {filteredIssues.length !== 1 ? "s" : ""} available.
                        Click on an issue above to see details.
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
