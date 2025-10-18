import { useEffect, useState, useRef } from "react";
import useFetchResources from "core-frontend-web/src/hooks/useFetchResources";
import useFetchAudioV1 from "core-frontend-web/src/hooks/useFetchAudioV1";
import useFetchAudioV2 from "core-frontend-web/src/hooks/useFetchAudioV2";
import useAudioSync from "core-frontend-web/src/hooks/useAudioSync";
import { useParams } from "react-router-dom";

import { findActiveWordIndex } from "core-frontend-web/src/utils/binarySearch";
import { fetchData } from "core-frontend-web/src/utils/api";
import { cn } from "core-frontend-web/src/lib/utils";

import useVersionStore from "core-frontend-web/src/stores/versionStore";
import { HelpCircle, Keyboard, Mic } from "lucide-react";

import TranscriptViewerV1 from "core-frontend-web/src/components/transcript-viewer-v1";
import TranscriptViewerV2 from "core-frontend-web/src/components/transcript-viewer-v2";
import TranscriptStatsV1 from "core-frontend-web/src/components/transcript-stats-v1";
import TranscriptStatsV2 from "core-frontend-web/src/components/transcript-stats-v2";
import AudioPlayer from "core-frontend-web/src/components/AudioPlayer";
import KeyboardShortcutsModal from "core-frontend-web/src/components/KeyboardShortcutsModal";
import TranscriptCTA from "core-frontend-web/src/components/TranscriptCTA";
import { Button } from "core-frontend-web/src/components/ui/button";
import { PersonAudioSelector } from "core-frontend-web/src/components/person-audio-selector";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "core-frontend-web/src/components/ui/resizable";
import { ScrollArea } from "core-frontend-web/src/components/ui/scroll-area";

export default function Transcript() {
  // #region declarations
  const { audioId } = useParams(); // Get audioId from route params

  // Fetch People and Audio Resources
  const {
    people,
    audio,
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
  const [pronunciations, setPronunciations] = useState([]);
  const [pronunciations2, setPronunciations2] = useState([]);

  // State for Airtable Issues
  const [issuesData, setIssuesData] = useState([]);

  // Add state for modal visibility
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  const [hoveredWordIndices, setHoveredWordIndices] = useState([]);
  // #endregion

  // #region do stuff

  // Add effect to handle route audio ID
  useEffect(() => {
    if (audioId && audioId !== selectedAudio) {
      // Find the audio file in the list
      const audioFile = audio.find((a) => a.id === audioId);
      if (audioFile) {
        // Set the person first (required for filtered audio)
        setSelectedPerson(audioFile.SpeakerName);
        // Then set the audio
        setSelectedAudio(audioId);
      }
    }
  }, [audioId, audio, selectedAudio, setSelectedPerson, setSelectedAudio]);

  // Fetch issues data on component mount
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setIssuesData(await fetchData("/api/data/loadIssues"));
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
    if (!transcriptFlattened.length) return;
    const idx = findActiveWordIndex(transcriptFlattened, currentTime);
    setActiveWordIndex(idx);
  }, [currentTime, annotatedTranscript]);

  // Handle Audio Selection and Fetch
  const handleAudioSelection = async () => {
    setIsAudioLoading(true);
    try {
      await fetchAudio(selectedAudio);
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
      setAnnotations(friendlyTargetNames);
    }
  };

  const handlePronunciationHover = (pronunciations) => {
    setPronunciations(pronunciations);
  };

  const handlePronunciation2Hover = (pronunciations2) => {
    setPronunciations2(pronunciations2);
  };

  const handleAnnotationUpdate = async (wordIndex, annotations) => {
    // Flatten the annotatedTranscript structure and find the word ID

    const flattenedWords = annotatedTranscript.flatMap(
      (segment) => segment.alignment
    );

    const wordId = flattenedWords[wordIndex]?.id;
    const word = flattenedWords[wordIndex]?.word;
    const timestamp = flattenedWords[wordIndex]?.start_time;

    let response = await fetchData("/api/v1/annotations/update", {
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

    // Update transcript state
    fetchAudio(selectedAudio); // Refetch to update state

    // Update tooltip
    handleAnnotationHover(annotations, wordIndex);
  };
  // #endregion

  const hasAudioLoaded = Boolean(mp3url && annotatedTranscript?.length);

  return (
    <div>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel id="transcript-main" order={0}>
          <ScrollArea className="h-[calc(100vh-var(--navbar-height))] sm:h-screen">
            <div className="p-2 bg-background">
              <header className="flex flex-col sticky top-0 z-0 bg-background">
                <div
                  className={cn(
                    "flex items-center gap-4",
                    (!hasAudioLoaded || loadError) &&
                      "h-[calc(100vh-var(--navbar-height))] sm:h-screen justify-center flex-col"
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
                    <div className="relative min-h-[40px]">
                      <div className="border border-border rounded-md p-2 absolute w-full bg-background z-10">
                        {pronunciations.join(", ") || "\u00A0"}
                      </div>
                    </div>
                    <div className="relative min-h-[40px]">
                      <div className="border border-border rounded-md p-2 absolute w-full bg-background z-10">
                        {pronunciations2.join(", ") || "\u00A0"}
                      </div>
                    </div>
                    <div className="relative min-h-[40px]">
                      <div className="border border-border rounded-md p-2 absolute w-full bg-background z-10">
                        {annotations.join(", ") || "\u00A0"}
                      </div>
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
                      onPronunciationHover={handlePronunciationHover}
                      onPronunciation2Hover={handlePronunciation2Hover}
                      issuesData={issuesData}
                      onAnnotationUpdate={handleAnnotationUpdate}
                      activeFilters={activeFilters}
                      hoveredWordIndices={hoveredWordIndices}
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
          <ResizablePanel
            id="transcript-stats"
            order={1}
            className="h-[calc(100vh-var(--navbar-height))] sm:h-screen"
          >
            <ScrollArea className="h-[calc(100vh-var(--navbar-height))] sm:h-screen">
              <div className="px-4 bg-background">
                {version === "v1" ? (
                  <TranscriptStatsV1
                    annotatedTranscript={annotatedTranscript}
                    issuesData={issuesData}
                    onFilterChange={handleFilterChange}
                    setHoveredWordIndices={setHoveredWordIndices}
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

      {/* Floating help buttons */}
      {hasAudioLoaded && (
        <div className="fixed bottom-19 right-8 z-50 flex flex-col gap-3">
          {/* Keyboard shortcuts help */}
          <Button
            onClick={() => setIsShortcutsModalOpen(true)}
            className="rounded-full w-12 h-12 bg-gray-600 hover:bg-gray-700 shadow-lg cursor-pointer"
            size="sm"
            title="Keyboard shortcuts and pronunciation guide"
          >
            <Keyboard className="!h-7 !w-7" />
          </Button>

          {/* Personal coaching CTA */}
          <TranscriptCTA
            variant="floating"
            className="fixed bottom-6 right-8"
          />
        </div>
      )}
    </div>
  );
}
