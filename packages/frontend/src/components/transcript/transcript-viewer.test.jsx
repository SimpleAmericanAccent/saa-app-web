import { render } from "@testing-library/react";
import TranscriptViewer from "./transcript-viewer";

// Mock the useWordAudio hook
jest.mock("frontend/src/hooks/use-word-audio", () => ({
  useWordAudio: () => ({
    playWord: jest.fn(),
    isPlaying: false,
  }),
}));

describe("TranscriptViewerV1", () => {
  it("should render without crashing", () => {
    const { container } = render(
      <TranscriptViewer
        annotatedTranscript={[]}
        activeWordIndex={null}
        handleWordClick={() => {}}
      />
    );

    expect(container).toBeTruthy();
  });
});
