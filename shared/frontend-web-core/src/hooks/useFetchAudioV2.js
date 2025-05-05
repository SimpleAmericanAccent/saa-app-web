import { useState } from "react";
import { fetchData } from "shared/frontend-web-core/src/utils/api";

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
        // Add wordIndex based on audio word index and flatten fields structure
        const wordWithIndex = {
          ...word.fields, // Spread fields at top level
          id: word.id,
          createdTime: word.createdTime,
          wordIndex: word.fields["audio word index"] ?? 0,
          word: word.fields.Name,
        };
        acc[paragraphIndex].alignment.push(wordWithIndex);
        return acc;
      }, {});

      // Convert paragraphs object to array and sort by paragraph index
      const orderedParagraphs = Object.entries(paragraphs)
        .sort(([indexA], [indexB]) => Number(indexA) - Number(indexB))
        .map(([_, paragraph]) => paragraph);

      console.log(orderedParagraphs, "orderedParagraphs");

      setAnnotatedTranscript(orderedParagraphs);

      // createAnnotatedTranscript(transcriptWithIndices, airtableWords);
    } catch (error) {
      console.error("Error fetching audio or transcript:", error);
    }
  };

  return {
    mp3url,
    annotatedTranscript,
    fetchAudio,
  };
};

export default useFetchAudioV2;
