import { useEffect, useState, useRef } from "react";
import { findActiveWordIndex } from "../utils/binarySearch";
import { fetchData } from "../utils/api";
import { setCookie, getCookie } from "../utils/cookies";
import useFetchAudio from "../hooks/useFetchAudio";
import useAudioSync from "../hooks/useAudioSync";
import useFetchResources from "../hooks/useFetchResources";
import Dropdown from "../components/Dropdown";
import AudioPlayer from "../components/AudioPlayer";
import TranscriptViewer from "../components/TranscriptViewer";
import KeyboardShortcutsModal from "../components/KeyboardShortcutsModal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home1() {
  // Fetch People and Audio Resources
  const {
    people,
    filteredAudio,
    selectedPerson,
    setSelectedPerson,
    selectedAudio,
    setSelectedAudio,
  } = useFetchResources();

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

      e.preventDefault();

      switch (e.code) {
        case "ArrowLeft": {
          audioRef.current.currentTime -= 1;
          break;
        }
        case "ArrowRight": {
          audioRef.current.currentTime += 1;
          break;
        }
        case "Space": {
          const action = audioRef.current.paused ? "play" : "pause";
          audioRef.current[action]();
          break;
        }
        case "Comma":
        case "Minus":
        case "NumpadSubtract": {
          const newSpeed = Math.max(0.1, audioRef.current.playbackRate - 0.1);
          audioRef.current.playbackRate = newSpeed;
          setPlaybackSpeed(newSpeed);
          break;
        }
        case "Period":
        case "Equal":
        case "NumpadAdd": {
          const newSpeed = Math.min(4.0, audioRef.current.playbackRate + 0.1);
          audioRef.current.playbackRate = newSpeed;
          setPlaybackSpeed(newSpeed);
          break;
        }
        case "Slash": {
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

  return (
    <div className="bg-background">
      <div>
        <div className="fixed top-0 left-0 w-full h-[230px] min-h-[100px] bg-background p-4 z-10">
          <div className="max-w-[450px]">
            <h1 className="text-2xl font-semibold mb-2 mt-6">
              Transcript Viewer
            </h1>
            <div className="flex items-center gap-2 mb-2">
              <Select value={selectedPerson} onValueChange={setSelectedPerson}>
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
            </div>
            <div className="flex items-center gap-2 mb-2">
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
            </div>
            <div className="flex gap-2 m-2">
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
            <AudioPlayer
              mp3url={mp3url}
              ref={audioRef}
              playbackSpeed={playbackSpeed}
              onPlaybackSpeedChange={setPlaybackSpeed}
            />
          </div>
        </div>
      </div>
      <div className="fixed top-[230px] left-0 w-full h-[5vh] min-h-[0px] bg-background p-4 z-0">
        <div className="max-w-[875px] border border-border rounded-md p-2 mb-4 bg-background min-h-[2rem] flex items-center">
          {annotations.join(", ") || "\u00A0"}{" "}
          {/* Added non-breaking space as fallback */}
        </div>
      </div>
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
      />
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
}
