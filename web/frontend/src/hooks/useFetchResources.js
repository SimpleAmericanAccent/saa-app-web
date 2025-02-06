import { useState, useEffect } from "react";
import { fetchData } from "../utils/api";

const useFetchResources = () => {
  const [people, setPeople] = useState([]);
  const [audio, setAudio] = useState([]);
  const [filteredAudio, setFilteredAudio] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState("");
  const [selectedAudio, setSelectedAudio] = useState("");

  useEffect(() => {
    const fetchUserResources = async () => {
      try {
        const { people, audios } = await fetchData("/authz");
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
      setFilteredAudio(audio.filter((a) => a.SpeakerName === selectedPerson));
      setSelectedAudio(""); // Reset selection when person changes
    } else {
      setFilteredAudio([]); // Clear audio list when no person is selected
    }
  }, [selectedPerson, audio]);

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
