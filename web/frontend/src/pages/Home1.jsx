import { useEffect, useState, useRef } from "react";
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
  const { mp3url, transcriptData, allWords, airtableWords, fetchAudio } =
    useFetchAudio();

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

  // Sync Active Word with Current Time
  useEffect(() => {
    if (!allWords.length) return;
    setActiveWordIndex(findActiveWordIndex(allWords, currentTime));
  }, [currentTime, allWords]);

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

  const handleAnnotationUpdate = async (wordIndex, annotations) => {
    console.log(
      "Updating annotations for word",
      wordIndex,
      annotations,
      issuesData
    );
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
        transcriptData={transcriptData}
        activeWordIndex={activeWordIndex}
        airtableWords={airtableWords}
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
