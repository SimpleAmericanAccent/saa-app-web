import { render } from "@testing-library/react";
import TranscriptViewerV1 from "./transcript-viewer-v1";

// Mock the useWordAudio hook
jest.mock("core-frontend-web/src/hooks/use-word-audio", () => ({
  useWordAudio: () => ({
    playWord: jest.fn(),
    isPlaying: false,
  }),
}));

describe("TranscriptViewerV1", () => {
  it("should render without crashing", () => {
    const { container } = render(
      <TranscriptViewerV1
        annotatedTranscript={[]}
        activeWordIndex={null}
        handleWordClick={() => {}}
      />
    );

    expect(container).toBeTruthy();
  });
});
