import { useEffect, useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
      if (!audioRef.current) return;

      switch (e.code) {
        case "ArrowLeft":
          e.preventDefault();
          audioRef.current.currentTime = audioRef.current.currentTime - 1;
          break;
        case "ArrowRight":
          e.preventDefault();
          audioRef.current.currentTime = audioRef.current.currentTime + 1;
          break;
        case "Space":
          e.preventDefault();
          if (audioRef.current.paused) {
            audioRef.current.play();
          } else {
            audioRef.current.pause();
          }
          break;
        case "Comma": {
          e.preventDefault();
          const newSpeedDown = Math.max(
            0.1,
            audioRef.current.playbackRate - 0.1
          );
          audioRef.current.playbackRate = newSpeedDown;
          setPlaybackSpeed(newSpeedDown);
          break;
        }
        case "Period": {
          e.preventDefault();
          const newSpeedUp = Math.min(4.0, audioRef.current.playbackRate + 0.1);
          audioRef.current.playbackRate = newSpeedUp;
          setPlaybackSpeed(newSpeedUp);
          break;
        }
        case "Slash": {
          e.preventDefault();
          setIsShortcutsModalOpen((prev) => !prev);
          break;
        }
        default:
          break;
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

  // Get QueryClient from the context
  const queryClient = useQueryClient();

  // Create mutation function
  const updateAnnotationMutation = useMutation({
    mutationFn: async ({ wordId, annotations }) => {
      // Assuming you have an API endpoint for updating annotations
      console.log("in the mutation thingy");
      const response = await fetchData("/v1/api/annotations/update", {
        method: "POST",
        body: JSON.stringify({ wordId, annotations }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("response", response);
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch any queries that depend on this data
      queryClient.invalidateQueries({
        queryKey: ["transcriptData", selectedAudio],
      });
    },
    onError: (error) => {
      console.error("Error updating annotation:", error);
      // Handle error state here
    },
  });

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

    // Update Airtable via mutation
    // updateAnnotationMutation.mutate({ wordId, annotations });

    // Optimistically update local state
    // const updatedWords = [...annotatedTranscript];
    // updatedWords[wordIndex] = {
    //   ...updatedWords[wordIndex],
    //   annotations: annotations,
    // };

    // You may need to update your state management here
    // depending on how your data is structured

    // Update Airtable
    // Update local state
    // Refresh UI
  };

  return (
    <div>
      <div>
        <div className="masthead-top">
          <div className="columnleftmastheadtop">
            <h1>Transcript Viewer</h1>
            <Dropdown
              className="block"
              label="Select person: "
              options={people}
              selectedValue={selectedPerson}
              onChange={setSelectedPerson}
            />
            <Dropdown
              className="block"
              label="Select audio: &nbsp; "
              options={filteredAudio}
              selectedValue={selectedAudio}
              onChange={setSelectedAudio}
            />
            <button onClick={handleAudioSelection}>Open From Airtable</button>
            <button onClick={() => setIsShortcutsModalOpen(true)}>
              Keyboard Shortcuts (?)
            </button>
            <AudioPlayer mp3url={mp3url} ref={audioRef} />
            <div>Playback speed: {playbackSpeed.toFixed(1)}x</div>
            <div></div>
          </div>
        </div>

        <p>Welcome to the home page!</p>
      </div>
      <div className="masthead-bottom">
        <div className="toolTip">{annotations.join(", ")}</div>
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

      <ul className="list"></ul>
    </div>
  );
}
