import { useState } from "react";
import { fetchData } from "../utils/api";

const useFetchAudio = () => {
  const [mp3url, setMp3Url] = useState("");
  const [annotatedTranscript, setAnnotatedTranscript] = useState([]);

  const fetchAudio = async (selectedAudio) => {
    if (!selectedAudio) return;

    try {
      const response = await fetchData(`/data/loadAudio/${selectedAudio}`);
      const { audio, airtableWords } = response || {};
      const { mp3url, tranurl } = audio || {};
      setMp3Url(mp3url);

      const transcriptResponse = await fetchData(tranurl);
      const transcriptWithIndices = addWordIndices(
        transcriptResponse.speech.transcripts
      );

      createAnnotatedTranscript(transcriptWithIndices, airtableWords);
    } catch (error) {
      console.error("Error fetching audio or transcript:", error);
    }
  };

  const addWordIndices = (transcripts) => {
    let wordCounter = 0;
    return transcripts.map((paragraph) => ({
      ...paragraph,
      alignment: paragraph.alignment.map((word) => ({
        ...word,
        paragraph_start_offset_conv: paragraph.start_offset / 16000,
        start_time: word.start + paragraph.start_offset / 16000,
        wordIndex: wordCounter++,
      })),
    }));
  };

  const createAnnotatedTranscript = (transcriptData, airtableWords) => {
    if (!transcriptData?.length || !airtableWords) {
      setAnnotatedTranscript([]);
      return;
    }

    const airtableMap = createAirtableMap(airtableWords);
    const annotated = annotateTranscript(transcriptData, airtableMap);
    // console.log("airtableMap", airtableMap);
    // console.log("annotated", annotated);
    setAnnotatedTranscript(annotated);
  };

  const createAirtableMap = (airtableWords) => {
    const records = Array.isArray(airtableWords)
      ? airtableWords
      : airtableWords.records || [];
    const airtableMap = {};
    records.forEach((record) => {
      if (record.fields && record.fields["word index"] !== undefined) {
        const wordIndex = record.fields["word index"];
        airtableMap[wordIndex] = {
          ...record.fields, // Spread fields to move them up one level
          id: record.id,
          createdTime: record.createdTime,
        };
      }
    });
    return airtableMap;
  };

  const annotateTranscript = (transcriptData, airtableMap) => {
    return transcriptData.map((paragraph) => {
      if (paragraph.alignment) {
        paragraph.alignment = paragraph.alignment.map((word) => {
          const airtableData = airtableMap[word.wordIndex];
          if (airtableData) {
            return {
              ...word,
              ...airtableData,
            };
          }
          return word;
        });
      }
      return paragraph;
    });
  };

  return {
    mp3url,
    annotatedTranscript,
    fetchAudio,
  };
};

export default useFetchAudio;
