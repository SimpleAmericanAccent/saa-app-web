import TranscriptViewerV1 from "./transcript-viewer-v1";
import { userEvent, within } from "@storybook/test";

export default {
  component: TranscriptViewerV1,
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

// New interactive story with play function
export const InteractiveWordClicking = {
  args: {
    annotatedTranscript: [
      {
        alignment: [
          { word: "hello", wordIndex: 0 },
          { word: "beautiful", wordIndex: 1 },
          { word: "world", wordIndex: 2 },
        ],
      },
    ],
    activeWordIndex: null,
    handleWordClick: () => console.log("Word clicked!"),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Test that words are clickable
    const helloWord = canvas.getByText("hello");
    const worldWord = canvas.getByText("world");

    // Click on "hello" word
    await userEvent.click(helloWord);

    // Wait a bit to see the interaction
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Click on "world" word
    await userEvent.click(worldWord);

    // Verify the click handler was called
    // (In a real test, you'd mock the handler and verify it was called)
  },
};
