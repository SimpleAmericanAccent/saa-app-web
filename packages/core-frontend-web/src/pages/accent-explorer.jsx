import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIssuesStore } from "../stores/issues-store";
import { ExternalLink } from "lucide-react";
import { Button } from "../components/ui/button";
import PhonemeGridSummary from "../components/phoneme-grid-summary";

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
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Accent Issues Explorer
          </h1>
          <p className="text-sm text-muted-foreground">
            Click on a target phoneme to explore related accent issues
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Row 1: Phoneme Grid + Issues */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Phoneme Grid */}
          <div className="bg-card border border-border rounded-lg p-4 flex-shrink-0">
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
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {selectedTarget} x {selectedIssue.shortName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedIssue.resources.length} resource
                    {selectedIssue.resources.length !== 1 ? "s" : ""} available
                  </p>
                </div>

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
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Target: {selectedTarget}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {filteredIssues.length} issue
                  {filteredIssues.length !== 1 ? "s" : ""} available. Click on
                  an issue above to see details.
                </p>
                <div className="text-sm text-muted-foreground">
                  <p>
                    This target phoneme represents the /
                    {selectedTarget.toLowerCase()}/ sound in English.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
