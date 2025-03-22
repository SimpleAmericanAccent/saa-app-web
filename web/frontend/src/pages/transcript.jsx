import { useEffect, useState, useRef } from "react";
import { findActiveWordIndex } from "../utils/binarySearch";
import { fetchData } from "../utils/api";
import { setCookie, getCookie } from "../utils/cookies";
import useFetchAudio from "../hooks/useFetchAudio";
import useAudioSync from "../hooks/useAudioSync";
import useFetchResources from "../hooks/useFetchResources";
import Dropdown from "../components/Dropdown";
import AudioPlayer from "../components/AudioPlayer";
import TranscriptViewer from "../components/transcript-viewer";
import TranscriptStats from "../components/transcript-stats";
import KeyboardShortcutsModal from "../components/KeyboardShortcutsModal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  const handleFilterChange = (activeIssues) => {
    setActiveFilters(activeIssues);
  };

  // Fetch Audio & Transcript Data
  const { mp3url, annotatedTranscript, fetchAudio } = useFetchAudio();

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
    await fetchAudio(selectedAudio);
    if (audioRef.current) {
      audioRef.current.load();
    }
  };

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
    const friendlyNames = getIssueNames(annotations);
    setAnnotations(friendlyNames);
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
        "Content-Type": "text/plain",
      },
    });

    console.log("server response", response);

    // Update transcript state
    fetchAudio(selectedAudio); // Refetch to update state

    // Update tooltip
    handleAnnotationHover(annotations, wordIndex);
  };
  // #endregion

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel>
        <ScrollArea className="h-[calc(100vh-var(--navbar-height))]">
          <div className="px-4 bg-background">
            <header className="flex flex-col sticky top-0 z-0 bg-background">
              <div className="">
                <Select
                  value={selectedPerson}
                  onValueChange={setSelectedPerson}
                >
                  <SelectTrigger className="w-[300px] cursor-pointer" size="sm">
                    <SelectValue placeholder="Select a person" />
                  </SelectTrigger>
                  <SelectContent>
                    {people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedAudio} onValueChange={setSelectedAudio}>
                  <SelectTrigger className="w-[300px] cursor-pointer" size="sm">
                    <SelectValue placeholder="Select an audio file" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredAudio.map((audio) => (
                      <SelectItem key={audio.id} value={audio.id}>
                        {audio.Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAudioSelection}
                  className="cursor-pointer"
                  size="sm"
                >
                  Open Transcript
                </Button>
                <Button
                  onClick={() => setIsShortcutsModalOpen(true)}
                  className="cursor-pointer"
                  variant="secondary"
                  size="sm"
                >
                  Keyboard Shortcuts (?)
                </Button>
              </div>
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
            </header>
            <section>
              <TranscriptViewer
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
      <ResizablePanel className="h-[calc(100vh-var(--navbar-height))]">
        <ScrollArea className="h-[calc(100vh-var(--navbar-height))]">
          <div className="px-4 bg-background">
            <TranscriptStats
              annotatedTranscript={annotatedTranscript}
              issuesData={issuesData}
              onFilterChange={handleFilterChange}
            />
          </div>
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
