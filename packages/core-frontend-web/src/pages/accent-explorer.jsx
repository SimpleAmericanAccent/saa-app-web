import { useState, useMemo, useEffect } from "react";
import { useIssuesStore } from "../stores/issues-store";
import { ExternalLink } from "lucide-react";
import { Button } from "../components/ui/button";
import PhonemeGridSummary from "../components/phoneme-grid-summary";

export default function AccentExplorer() {
  const { issuesData, loading, error, fetchIssues } = useIssuesStore();
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedIssues, setSelectedIssues] = useState({});

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
      } else {
        setSelectedTarget(label);
      }
    }
  };

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
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Phoneme Grid */}
        <div className="bg-card border border-border rounded-lg p-4 mb-4">
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

        {/* Selected Target Issues */}
        {selectedTarget && (
          <div className="bg-card border border-border rounded-lg p-4">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                {filteredIssues.map((issue) => {
                  const hasResources = issue.resources.length > 0;
                  return (
                    <div
                      key={issue.id}
                      className={`flex flex-col p-3 rounded-md border transition-colors cursor-pointer ${
                        hasResources
                          ? "bg-background/50 border-border/50 hover:bg-muted/50"
                          : "bg-muted/30 border-border/30 text-muted-foreground hover:bg-muted/50"
                      }`}
                      onClick={() =>
                        (window.location.href = `/${selectedTarget.toLowerCase()}/${
                          issue.shortName
                        }`)
                      }
                    >
                      <div className="text-center">
                        <div className="font-mono text-sm font-medium">
                          {issue.shortName}
                        </div>
                        <div className="text-xs mt-1">
                          {issue.resources.length} resource
                          {issue.resources.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Instructions when no target selected */}
        {!selectedTarget && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Click on any phoneme above to explore its accent issues
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Click the same phoneme again to deselect
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
