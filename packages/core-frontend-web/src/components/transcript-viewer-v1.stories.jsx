import TranscriptViewerV1 from "./transcript-viewer-v1";

export default {
  title: "Components/TranscriptViewerV1",
  component: TranscriptViewerV1,
};

export const Empty = {
  args: {
    annotatedTranscript: [],
    activeWordIndex: null,
    handleWordClick: () => console.log("clicked"),
  },
};

export const WithContent = {
  args: {
    annotatedTranscript: [
      {
        alignment: [
          { word: "hello", wordIndex: 0 },
          { word: "world", wordIndex: 1 },
        ],
      },
    ],
    activeWordIndex: 0,
    handleWordClick: () => console.log("clicked"),
  },
};
