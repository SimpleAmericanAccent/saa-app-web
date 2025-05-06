import { useEffect, useState, useRef } from "react";
import useFetchResources from "frontend-web-core/src/hooks/useFetchResources";
import useFetchAudioV1 from "frontend-web-core/src/hooks/useFetchAudioV1";
import useFetchAudioV2 from "frontend-web-core/src/hooks/useFetchAudioV2";
import useAudioSync from "frontend-web-core/src/hooks/useAudioSync";

import { findActiveWordIndex } from "frontend-web-core/src/utils/binarySearch";
import { fetchData } from "frontend-web-core/src/utils/api";
import { setCookie, getCookie } from "frontend-web-core/src/utils/cookies";
import { cn } from "frontend-web-core/src/lib/utils";

import useVersionStore from "frontend-web-core/src/stores/versionStore";
import { HelpCircle } from "lucide-react";

import TranscriptViewerV1 from "frontend-web-core/src/components/transcript-viewer-v1";
import TranscriptViewerV2 from "frontend-web-core/src/components/transcript-viewer-v2";
import TranscriptStatsV1 from "frontend-web-core/src/components/transcript-stats-v1";
import TranscriptStatsV2 from "frontend-web-core/src/components/transcript-stats-v2";
import AudioPlayer from "frontend-web-core/src/components/AudioPlayer";
import KeyboardShortcutsModal from "frontend-web-core/src/components/KeyboardShortcutsModal";
import { Button } from "frontend-web-core/src/components/ui/button";
import { PersonAudioSelector } from "frontend-web-core/src/components/person-audio-selector";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "frontend-web-core/src/components/ui/resizable";
import { ScrollArea } from "frontend-web-core/src/components/ui/scroll-area";

export default function Transcript() {
  // #region declarations
  // Fetch People and Audio Resources
  const {
    people,
    filteredAudio,
    selectedPerson,
    setSelectedPerson,
    selectedAudio,
    setSelectedAudio,
  } = useFetchResources();

  const [activeFilters, setActiveFilters] = useState([]);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const { version } = useVersionStore();

  const handleFilterChange = (activeIssues) => {
    setActiveFilters(activeIssues);
  };

  // Fetch Audio & Transcript Data
  const { mp3url, annotatedTranscript, fetchAudio } =
    version === "v1" ? useFetchAudioV1() : useFetchAudioV2();

  // Reference for Audio Player & State for Playback Speed
  const audioRef = useRef(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // Track Current Time for Word Highlighting
  const currentTime = useAudioSync(audioRef);
  const [activeWordIndex, setActiveWordIndex] = useState(null);
  const [annotations, setAnnotations] = useState([]);

  // State for Airtable Issues
  const [issuesData, setIssuesData] = useState([]);

  // Add state for modal visibility
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  // #endregion

  // #region do stuff
  // Fetch issues data on component mount
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setIssuesData(await fetchData("/data/loadIssues"));
      } catch (error) {
        console.error("Error fetching issues:", error);
      }
    };
    fetchIssues();
  }, []);

  // Helper function to get issue names from IDs
  const getIssueNames = (issueIds) => {
    if (!issueIds || !issuesData.length) return [];

    return issueIds.map((id) => {
      // Find the category that contains this issue
      const category = issuesData.find((cat) =>
        cat.issues.some((issue) => issue.id === id)
      );

      if (category) {
        const issue = category.issues.find((i) => i.id === id);
        return issue ? issue.name : id;
      }
      return id;
    });
  };

  // Helper function to get target names from IDs
  const getTargetNames = (targetIds) => {
    if (!targetIds || !issuesData.length) return [];

    console.log("issuesData", issuesData);

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

  const flattenTranscript = (transcripts) => {
    return transcripts.flatMap((paragraph) => paragraph.alignment);
  };

  // Sync Active Word with Current Time
  useEffect(() => {
    let transcriptFlattened = flattenTranscript(annotatedTranscript);
    // console.log("transcriptFlattened", transcriptFlattened);

    if (!transcriptFlattened.length) return;
    setActiveWordIndex(findActiveWordIndex(transcriptFlattened, currentTime));
  }, [currentTime, annotatedTranscript]);

  // Handle Audio Selection and Fetch
  const handleAudioSelection = async () => {
    setIsAudioLoading(true);
    try {
      await fetchAudio(selectedAudio);
      // console.log("annotatedTranscript", annotatedTranscript);
      if (audioRef.current) {
        audioRef.current.load();
      }
    } catch (error) {
      setError("Failed to load audio or transcript data");
      console.error("Error loading audio:", error);
    } finally {
      setIsAudioLoading(false);
    }
  };

  // Move audio selection logic into useEffect
  useEffect(() => {
    if (selectedAudio) {
      handleAudioSelection();
    }
  }, [selectedAudio]); // Run when selectedAudio changes

  // Add keyboard controls
  useEffect(() => {
    const handleKeydown = (e) => {
      // Only handle shortcuts if we have audio or it's the help shortcut
      if (!audioRef.current && e.code !== "Slash") return;

      switch (e.code) {
        case "ArrowLeft": {
          e.preventDefault();
          audioRef.current.currentTime -= 1;
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          audioRef.current.currentTime += 1;
          break;
        }
        case "Space": {
          e.preventDefault();
          const action = audioRef.current.paused ? "play" : "pause";
          audioRef.current[action]();
          break;
        }
        case "Comma":
        case "Minus":
        case "NumpadSubtract": {
          e.preventDefault();
          const newSpeed = Math.max(0.1, audioRef.current.playbackRate - 0.1);
          audioRef.current.playbackRate = newSpeed;
          setPlaybackSpeed(newSpeed);
          break;
        }
        case "Period":
        case "Equal":
        case "NumpadAdd": {
          e.preventDefault();
          const newSpeed = Math.min(4.0, audioRef.current.playbackRate + 0.1);
          audioRef.current.playbackRate = newSpeed;
          setPlaybackSpeed(newSpeed);
          break;
        }
        case "Slash": {
          e.preventDefault();
          setIsShortcutsModalOpen((prev) => !prev);
          break;
        }
      }
    };

    document.addEventListener("keydown", handleKeydown);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []); // Empty dependency array since we only want to set this up once

  const handleAnnotationHover = (annotations) => {
    if (version === "v1") {
      const friendlyIssueNames = getIssueNames(annotations);
      setAnnotations(friendlyIssueNames);
    } else if (version === "v2") {
      const friendlyTargetNames = getTargetNames(annotations);
      console.log("friendlyTargetNames", friendlyTargetNames);
      console.log("annotations", annotations);
      console.log("issuesData", issuesData);
      setAnnotations(friendlyTargetNames);
    }
  };

  const handleAnnotationUpdate = async (wordIndex, annotations) => {
    // Flatten the annotatedTranscript structure and find the word ID

    console.log(
      "Attempting to update annotations for wordIndex",
      wordIndex,
      "\n annotations target state: ",
      annotations
    );

    const flattenedWords = annotatedTranscript.flatMap(
      (segment) => segment.alignment
    );

    const wordId = flattenedWords[wordIndex]?.id;
    const word = flattenedWords[wordIndex]?.word;
    const timestamp = flattenedWords[wordIndex]?.start_time;

    let response = await fetchData("/v1/api/annotations/update", {
      method: "POST",
      body: JSON.stringify({
        wordIndex,
        annotations,
        audioId: [selectedAudio],
        word,
        timestamp,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("server response", response);

    // Update transcript state
    fetchAudio(selectedAudio); // Refetch to update state

    // Update tooltip
    handleAnnotationHover(annotations, wordIndex);
  };
  // #endregion

  const hasAudioLoaded = Boolean(mp3url && annotatedTranscript?.length);

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel>
        <ScrollArea className="h-[calc(100vh-var(--navbar-height))]">
          <div className="px-4 bg-background">
            <header className="flex flex-col sticky top-0 z-0 bg-background">
              <div
                className={cn(
                  "flex items-center gap-4",
                  (!hasAudioLoaded || loadError) &&
                    "h-[calc(100vh-var(--navbar-height))] justify-center flex-col"
                )}
              >
                <PersonAudioSelector
                  people={people}
                  filteredAudio={filteredAudio}
                  selectedPerson={selectedPerson}
                  selectedAudio={selectedAudio}
                  onPersonSelect={setSelectedPerson}
                  onAudioSelect={setSelectedAudio}
                  size={!hasAudioLoaded || loadError ? "large" : "default"}
                />

                {(isAudioLoading || (selectedAudio && !hasAudioLoaded)) && (
                  <div className={cn("text-muted-foreground text-center")}>
                    {isAudioLoading
                      ? "Loading..."
                      : "Selected audio file appears to be empty"}
                  </div>
                )}
              </div>

              <Button
                onClick={() => setIsShortcutsModalOpen(true)}
                className="fixed left-4 bottom-4 rounded-full shadow-md cursor-pointer hover:bg-secondary hover:scale-105 active:scale-100"
                variant="secondary"
                size="icon"
              >
                <HelpCircle className="h-5 w-5" />
                <span className="sr-only">Keyboard Shortcuts</span>
              </Button>

              {/* Only show these once audio is loaded */}
              {hasAudioLoaded && (
                <>
                  <div>
                    <AudioPlayer
                      mp3url={mp3url}
                      ref={audioRef}
                      playbackSpeed={playbackSpeed}
                      onPlaybackSpeedChange={setPlaybackSpeed}
                    />
                  </div>
                  <div className="border border-border rounded-md p-2  ">
                    {annotations.join(", ") || "\u00A0"}{" "}
                    {/* Added non-breaking space as fallback */}
                  </div>
                </>
              )}
            </header>
            <section>
              {/* Only show transcript viewer when audio is loaded */}
              {hasAudioLoaded &&
                (version === "v1" ? (
                  <TranscriptViewerV1
                    annotatedTranscript={annotatedTranscript}
                    activeWordIndex={activeWordIndex}
                    handleWordClick={(start_time) => {
                      audioRef.current.currentTime = start_time;
                      audioRef.current.play();
                    }}
                    onAnnotationHover={handleAnnotationHover}
                    issuesData={issuesData}
                    onAnnotationUpdate={handleAnnotationUpdate}
                    activeFilters={activeFilters}
                  />
                ) : (
                  <TranscriptViewerV2
                    // Same props as v1
                    annotatedTranscript={annotatedTranscript}
                    activeWordIndex={activeWordIndex}
                    handleWordClick={(start_time) => {
                      audioRef.current.currentTime = start_time;
                      audioRef.current.play();
                    }}
                    onAnnotationHover={handleAnnotationHover}
                    issuesData={issuesData}
                    onAnnotationUpdate={handleAnnotationUpdate}
                    activeFilters={activeFilters}
                  />
                ))}
            </section>
            <aside>
              <KeyboardShortcutsModal
                isOpen={isShortcutsModalOpen}
                onClose={() => setIsShortcutsModalOpen(false)}
              />
            </aside>
          </div>
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle withHandle />
      {/* Only show right panel when audio is loaded */}
      {hasAudioLoaded && (
        <ResizablePanel className="h-[calc(100vh-var(--navbar-height))]">
          <ScrollArea className="h-[calc(100vh-var(--navbar-height))]">
            <div className="px-4 bg-background">
              {version === "v1" ? (
                <TranscriptStatsV1
                  annotatedTranscript={annotatedTranscript}
                  issuesData={issuesData}
                  onFilterChange={handleFilterChange}
                />
              ) : (
                <TranscriptStatsV2
                  annotatedTranscript={annotatedTranscript}
                  issuesData={issuesData}
                  onFilterChange={handleFilterChange}
                />
              )}
            </div>
          </ScrollArea>
        </ResizablePanel>
      )}
    </ResizablePanelGroup>
  );
}
