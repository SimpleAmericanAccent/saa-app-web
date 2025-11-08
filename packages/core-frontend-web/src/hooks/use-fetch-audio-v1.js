import { useState } from "react";
import { fetchData } from "core-frontend-web/src/utils/api";

const useFetchAudioV1 = () => {
  const [mp3url, setMp3Url] = useState("");
  const [annotatedTranscript, setAnnotatedTranscript] = useState([]);

  const fetchAudio = async (selectedAudio) => {
    if (!selectedAudio) return;

    try {
      const response = await fetchData(`/api/data/loadAudio/${selectedAudio}`);
      const { audio, airtableWords } = response || {};
      const { mp3url, tranurl } = audio || {};
      setMp3Url(mp3url);

      const transcriptResponse = await fetchData(tranurl);

      // Normalize different transcript formats to common structure
      let normalizedTranscript;

      // Format 1: Old format with speech.transcripts wrapper
      if (transcriptResponse.speech?.transcripts !== undefined) {
        normalizedTranscript = transcriptResponse.speech.transcripts;
      }
      // Format 2: New format with start_offset and alignment at root
      else if (
        transcriptResponse.start_offset !== undefined &&
        transcriptResponse.alignment !== undefined
      ) {
        normalizedTranscript = [
          {
            start_offset: transcriptResponse.start_offset || 0,
            alignment: transcriptResponse.alignment || [],
          },
        ];
      }
      // Format 3: Flat array of words (no paragraph structure)
      else if (
        Array.isArray(transcriptResponse) &&
        transcriptResponse.length > 0 &&
        transcriptResponse[0]?.word !== undefined
      ) {
        // For flat array, treat as single paragraph starting at offset 0
        // Word start times are already absolute, so start_offset should be 0
        // (start_offset gets divided by 16000 in addWordIndices to convert to seconds)
        normalizedTranscript = [
          {
            start_offset: 0,
            alignment: transcriptResponse,
          },
        ];
      }
      // Fallback: try to handle as-is or return empty
      else {
        console.warn("Unknown transcript format:", transcriptResponse);
        normalizedTranscript = [];
      }

      const transcriptWithIndices = addWordIndices(normalizedTranscript);

      const result = createAnnotatedTranscript(
        transcriptWithIndices,
        airtableWords
      );
      return result; // ✅ NEW: return result
    } catch (error) {
      console.error("Error fetching audio or transcript:", error);
      return [];
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
      return [];
    }

    const airtableMap = createAirtableMap(airtableWords);
    const annotated = annotateTranscript(transcriptData, airtableMap);
    setAnnotatedTranscript(annotated); // ✅ preserve existing state behavior
    return annotated; // ✅ return for new usage
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

export default useFetchAudioV1;
