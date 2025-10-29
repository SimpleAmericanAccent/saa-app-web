import TranscriptStatsV from "./transcript-stats-v1";

const meta = {
  component: TranscriptStatsV,
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
