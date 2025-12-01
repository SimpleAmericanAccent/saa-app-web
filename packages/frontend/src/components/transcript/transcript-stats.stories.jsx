import TranscriptStats from "./transcript-stats";

const meta = {
  component: TranscriptStats,
};

export default meta;

export const Default = {
  args: {
    annotatedTranscript: [],
    issuesData: [],
    onFilterChange: () => {},
    setHoveredWordIndices: null,
  },
};
