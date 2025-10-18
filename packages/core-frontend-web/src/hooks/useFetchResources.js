import { useState, useEffect } from "react";
import { fetchData } from "core-frontend-web/src/utils/api";

const STORAGE_KEY = "transcript-selection";

const useFetchResources = () => {
  const [people, setPeople] = useState([]);
  const [audio, setAudio] = useState([]);
  const [filteredAudio, setFilteredAudio] = useState([]);

  // Initialize from localStorage or empty string
  const [selectedPerson, setSelectedPerson] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { person } = JSON.parse(saved);
      return person || "";
    }
    return "";
  });

  const [selectedAudio, setSelectedAudio] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { audio } = JSON.parse(saved);
      return audio || "";
    }
    return "";
  });

  // Save to localStorage when selections change
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        person: selectedPerson,
        audio: selectedAudio,
      })
    );
  }, [selectedPerson, selectedAudio]);

  useEffect(() => {
    const fetchUserResources = async () => {
      try {
        const { people, audios } = await fetchData("/api/authz");
        setPeople(people);
        setAudio(audios);
      } catch (error) {
        console.error("Error fetching people and audio:", error);
      }
    };
    fetchUserResources();
  }, []);

  useEffect(() => {
    if (selectedPerson) {
      // Only filter audio, don't reset selection
      setFilteredAudio(audio.filter((a) => a.SpeakerName === selectedPerson));

      // Check if current selectedAudio belongs to selectedPerson
      // Only reset if it doesn't
      const audioBelongsToPerson = audio.some(
        (a) => a.id === selectedAudio && a.SpeakerName === selectedPerson
      );
      if (!audioBelongsToPerson) {
      }
    } else {
      setFilteredAudio([]);
      setSelectedAudio("");
    }
  }, [selectedPerson, audio, selectedAudio]);

  return {
    people,
    audio,
    filteredAudio,
    selectedPerson,
    setSelectedPerson,
    selectedAudio,
    setSelectedAudio,
  };
};

export default useFetchResources;
