import { useState } from "react";
import { fetchData } from "../utils/api";

const useFetchAudioV2 = () => {
  const [mp3url, setMp3Url] = useState("");
  const [annotatedTranscript, setAnnotatedTranscript] = useState([]);

  const fetchAudio = async (selectedAudio) => {
    if (!selectedAudio) return;

    try {
      const response = await fetchData(`/v2/api/audio/${selectedAudio}`);
      const { audio, airtableWords, annotationData } = response || {};
      const { mp3url } = audio || {};
      setMp3Url(mp3url);

      // sort airtableWords by word index
      const records = airtableWords?.records || airtableWords || [];
      const sortedAirtableWords = [...records].sort((a, b) => {
        const indexA = a?.fields?.["audio word index"] ?? Infinity;
        const indexB = b?.fields?.["audio word index"] ?? Infinity;
        return indexA - indexB;
      });

      console.log(sortedAirtableWords, "sortedAirtableWords");
      console.log(annotationData, "annotationData");

      // Create annotation lookup map
      const annotationMap = (annotationData?.records || []).reduce(
        (acc, annotation) => {
          acc[annotation.id] = annotation;
          return acc;
        },
        {}
      );

      // Merge annotations into sortedAirtableWords
      const enrichedAirtableWords = sortedAirtableWords.map((word) => {
        const annotations = word.fields?.Annotations || [];
        const enrichedAnnotations = annotations.map((annotationId) => ({
          id: annotationId,
          ...annotationMap[annotationId]?.fields,
        }));

        return {
          ...word,
          fields: {
            ...word.fields,
            Annotations: enrichedAnnotations,
          },
        };
      });

      console.log(enrichedAirtableWords, "enrichedAirtableWords");

      // put words into paragraphs

      // Group words into paragraphs
      const paragraphs = enrichedAirtableWords.reduce((acc, word) => {
        const paragraphIndex = word.fields["paragraph index"] ?? 0;
        if (!acc[paragraphIndex]) {
          acc[paragraphIndex] = { alignment: [] };
        }
        // Add wordIndex based on audio word index
        const wordWithIndex = {
          ...word,
          wordIndex: word.fields["audio word index"] ?? 0,
          word: word.fields.Name, // Also ensure word is at top level for consistency
        };
        acc[paragraphIndex].alignment.push(wordWithIndex);
        return acc;
      }, {});

      // Convert paragraphs object to array and sort by paragraph index
      const orderedParagraphs = Object.entries(paragraphs)
        .sort(([indexA], [indexB]) => Number(indexA) - Number(indexB))
        .map(([_, paragraph]) => paragraph);

      setAnnotatedTranscript(orderedParagraphs);

      // createAnnotatedTranscript(transcriptWithIndices, airtableWords);
    } catch (error) {
      console.error("Error fetching audio or transcript:", error);
    }
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

export default useFetchAudioV2;
