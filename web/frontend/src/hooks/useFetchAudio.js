import { useState } from "react";
import { fetchData } from "../utils/api";

const useFetchAudio = () => {
  const [mp3url, setMp3Url] = useState("");
  const [transcriptData, setTranscriptData] = useState([]);
  const [allWords, setAllWords] = useState([]);
  const [airtableWords, setAirtableWords] = useState([]);

  const fetchAudio = async (selectedAudio) => {
    if (!selectedAudio) return;

    try {
      const response = await fetchData(`/data/loadAudio/${selectedAudio}`);
      const { audio, airtableWords } = response || {};
      const { mp3url, tranurl } = audio || {};
      setMp3Url(mp3url);
      setAirtableWords(airtableWords);

      const transcriptResponse = await fetchData(tranurl);
      let wordCounter = 0;

      const transcriptWithIndices = transcriptResponse.speech.transcripts.map(
        (paragraph) => ({
          ...paragraph,
          alignment: paragraph.alignment.map((word) => ({
            ...word,
            paragraph_start_offset_conv: paragraph.start_offset / 16000,
            start_time: word.start + paragraph.start_offset / 16000,
            wordIndex: wordCounter++,
          })),
        })
      );

      setTranscriptData(transcriptWithIndices);
      setAllWords(
        transcriptWithIndices.flatMap((paragraph) => paragraph.alignment)
      );
    } catch (error) {
      console.error("Error fetching audio or transcript:", error);
    }
  };

  return { mp3url, transcriptData, allWords, airtableWords, fetchAudio };
};

export default useFetchAudio;
