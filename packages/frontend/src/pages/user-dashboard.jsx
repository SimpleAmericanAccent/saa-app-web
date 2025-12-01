import useAuthStore from "frontend/src/stores/auth-store";
import { useIssuesStore } from "frontend/src/stores/issues-store";
import { useEffect, useState, useMemo } from "react";
import { fetchData } from "frontend/src/utils/api";
import { ScrollArea } from "frontend/src/components/ui/scroll-area";
import TranscriptList from "frontend/src/components/transcript-list";
import TranscriptStats from "frontend/src/components/transcript/transcript-stats";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "frontend/src/components/ui/resizable";

export default function UserDashboard() {
  const { user, people, audios } = useAuthStore();
  const { issuesData } = useIssuesStore();
  const [currentPersonId, setCurrentPersonId] = useState(null);
  const [selectedTranscripts, setSelectedTranscripts] = useState([]);

  useEffect(() => {
    if (user && people.length) {
      const person = people.find(
        (p) => p.fields && p.fields["auth0 user_id"] === user.sub
      );
      if (person) setCurrentPersonId(person.id);
    }
  }, [user, people]);

  const handleTranscriptSelect = (transcripts) => {
    setSelectedTranscripts(transcripts);
  };

  // Combine annotated transcripts from multiple selections
  const combinedTranscript = useMemo(() => {
    if (!selectedTranscripts.length) return null;

    // Combine all segments from all selected transcripts
    const allSegments = selectedTranscripts.flatMap(
      (t) => t.annotatedTranscript
    );

    // If we have segments, return them as a single transcript
    return allSegments.length > 0 ? allSegments : null;
  }, [selectedTranscripts]);

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={50}>
        <ScrollArea className="h-[calc(100vh-var(--navbar-height))]">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">
              Welcome back, {user?.name || "friend"} 👋
            </h1>
            <TranscriptList
              people={people}
              audio={audios}
              currentPersonId={currentPersonId}
              onTranscriptSelect={handleTranscriptSelect}
            />
          </div>
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <ScrollArea className="h-[calc(100vh-var(--navbar-height))]">
          <div className="p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                Selected Transcripts ({selectedTranscripts.length})
              </h2>
            </div>
            <TranscriptStatsV1
              annotatedTranscript={combinedTranscript}
              issuesData={issuesData}
              onFilterChange={() => {}}
            />
          </div>
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
