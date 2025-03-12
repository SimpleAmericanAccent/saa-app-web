import { useEffect, useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { findActiveWordIndex } from "../utils/binarySearch";
import { fetchData } from "../utils/api";
import useFetchAudio from "../hooks/useFetchAudio";
import useAudioSync from "../hooks/useAudioSync";
import useFetchResources from "../hooks/useFetchResources";
import Dropdown from "../components/Dropdown";
import AudioPlayer from "../components/AudioPlayer";
import TranscriptViewer from "../components/TranscriptViewer";

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

  // Reference for Audio Player
  const audioRef = useRef(null);

  // Track Current Time for Word Highlighting
  const currentTime = useAudioSync(audioRef);
  const [activeWordIndex, setActiveWordIndex] = useState(null);
  const [annotations, setAnnotations] = useState([]);

  // State for Airtable Issues
  const [issuesData, setIssuesData] = useState([]);

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
    const flattenedWords = annotatedTranscript.flatMap(
      (segment) => segment.alignment
    );
    const wordId = flattenedWords[wordIndex]?.id;

    console.log(
      "Attempting to update annotations for wordIndex",
      wordIndex,
      "\n annotations target state: ",
      annotations
    );

    let test123 = await fetchData("/v1/api/annotations/update", {
      method: "POST",
      body: JSON.stringify({ wordIndex, annotations }),
      headers: {
        "Content-Type": "text/plain",
      },
    });

    console.log("test123", test123);

    // Update Airtable via mutation
    // updateAnnotationMutation.mutate({ wordId, annotations });

    // Optimistically update local state
    const updatedWords = [...annotatedTranscript];
    updatedWords[wordIndex] = {
      ...updatedWords[wordIndex],
      annotations: annotations,
    };

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
            <button className="block" onClick={handleAudioSelection}>
              Open From Airtable
            </button>
            <AudioPlayer mp3url={mp3url} ref={audioRef} />
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

      <ul className="list"></ul>
    </div>
  );
}
