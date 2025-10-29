import TranscriptViewerV1 from "./transcript-viewer-v1";
import { userEvent, within } from "@storybook/test";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "core-frontend-web/src/components/ui/tooltip";
import {
  HelpCircle,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default {
  component: TranscriptViewerV1,
  parameters: {
    layout: "padded",
  },
};

// Story showing tooltip content permanently visible
export const TooltipContentOnly = {
  render: () => {
    // Mock data for the tooltip
    const mockWordData = {
      pronunciations: ["S AO1 F T W EH2 R", "S AO1 F W EH2 R"],
      pronunciations2: ["S LOT1 F T W DRESS2 R", "S LOT1 F W DRESS2 R"],
      pronunciations3: ["sˈɑftwˌɛr", "sˈɑfwˌɛr"],
      annotations: ["R x null"],
    };

    const mockAudioData = [
      { id: "us-1", flag: "🇺🇸", region: "US", accent: "us" },
      { id: "uk-1", flag: "🇬🇧", region: "UK", accent: "uk" },
    ];

    const mockCurrentWord = "software";
    const mockIsLoadingWordData = false;
    const mockIsLoadingAudio = false;

    const getMaxPronunciations = () => {
      return Math.max(
        mockWordData.pronunciations.length,
        mockWordData.pronunciations2.length,
        mockWordData.pronunciations3.length
      );
    };

    const playAudio = (audioId) => {
      console.log("Playing audio:", audioId);
    };

    const setIsShortcutsModalOpen = (open) => {
      console.log("Shortcuts modal:", open);
    };

    // Use a functional component to access React state
    const TooltipContentWithState = () => {
      const [pronunciationIndex, setPronunciationIndex] = useState(0);
      const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState(null);

      const nextPronunciation = () => {
        const max = getMaxPronunciations();
        setPronunciationIndex((prev) => (prev + 1) % max);
      };

      const prevPronunciation = () => {
        const max = getMaxPronunciations();
        setPronunciationIndex((prev) => (prev - 1 + max) % max);
      };

      return (
        <div className="p-8 bg-background">
          <div className="max-w-xs mx-auto">
            <Tooltip open={true}>
              <TooltipTrigger asChild>
                <div className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded cursor-pointer">
                  software
                </div>
              </TooltipTrigger>
              <TooltipContent
                className="max-w-xs p-1"
                side="top"
                align="center"
                sideOffset={-10}
                avoidCollisions={true}
              >
                <div className="space-y-1">
                  {/* Annotations Section */}
                  <div className="bg-muted/20 rounded-md pb-1 mt-0">
                    <div className="relative flex items-center justify-center">
                      <div className="font-semibold text-xs text-center text-background/90 bg-zinc-600 py-0.5 rounded-t-md w-full">
                        ANNOTATIONS
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsShortcutsModalOpen(true);
                        }}
                        className="absolute right-[2px] p-0 rounded-full cursor-pointer"
                        title="Pronunciation Guide"
                      >
                        <HelpCircle className="h-3 w-3 text-background/80 hover:text-background" />
                      </button>
                    </div>
                    <div className="text-xs text-center mt-1 px-1">
                      {mockIsLoadingWordData ? (
                        <div className="text-background/80">Loading...</div>
                      ) : mockWordData.annotations.length > 0 ? (
                        mockWordData.annotations.map((annotation, index) => (
                          <div key={index}>{annotation}</div>
                        ))
                      ) : (
                        <div className="text-muted-foreground">None</div>
                      )}
                    </div>
                  </div>

                  {/* Pronunciation Section */}
                  <div className="bg-muted/20 rounded-md pb-1 mt-0">
                    <div className="font-semibold text-xs text-center mb-1 text-background/90 bg-emerald-600 py-0.5 rounded-t-md w-full">
                      PRONUNCIATION{" "}
                      {getMaxPronunciations() > 1
                        ? `${pronunciationIndex + 1}/${getMaxPronunciations()}`
                        : ""}
                    </div>

                    {getMaxPronunciations() > 0 ? (
                      <>
                        <div className="mb-1">
                          <div className="font-semibold text-xs text-center">
                            CMU:
                          </div>
                          <div className="text-xs text-center px-1">
                            {mockIsLoadingWordData ? (
                              <div className="text-background/80">
                                Loading...
                              </div>
                            ) : mockWordData.pronunciations.length > 0 ? (
                              mockWordData.pronunciations[pronunciationIndex] ||
                              "N/A"
                            ) : (
                              "N/A"
                            )}
                          </div>
                        </div>

                        <div className="mb-1">
                          <div className="font-semibold text-xs text-center">
                            Lexical Sets:
                          </div>
                          <div className="text-xs text-center px-1">
                            {mockIsLoadingWordData ? (
                              <div className="text-background/80">
                                Loading...
                              </div>
                            ) : mockWordData.pronunciations2.length > 0 ? (
                              mockWordData.pronunciations2[
                                pronunciationIndex
                              ] || "N/A"
                            ) : (
                              "N/A"
                            )}
                          </div>
                        </div>

                        <div className="mb-1">
                          <div className="font-semibold text-xs text-center">
                            IPA:
                          </div>
                          <div className="text-xs text-center px-1">
                            {mockIsLoadingWordData ? (
                              <div className="text-background/80">
                                Loading...
                              </div>
                            ) : mockWordData.pronunciations3.length > 0 ? (
                              mockWordData.pronunciations3[
                                pronunciationIndex
                              ] || "N/A"
                            ) : (
                              "N/A"
                            )}
                          </div>
                        </div>

                        {getMaxPronunciations() > 1 && (
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                prevPronunciation();
                              }}
                              className="p-1 hover:bg-accent/10 rounded cursor-pointer"
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </button>
                            <div className="flex gap-1">
                              {Array.from(
                                { length: getMaxPronunciations() },
                                (_, i) => (
                                  <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      i === pronunciationIndex
                                        ? "bg-gray-600"
                                        : "bg-gray-300"
                                    }`}
                                  />
                                )
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                nextPronunciation();
                              }}
                              className="p-1 hover:bg-accent/10 rounded cursor-pointer"
                            >
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-center text-muted-foreground px-1">
                        None found
                      </div>
                    )}
                  </div>

                  {/* Audio Section */}
                  <div className="bg-muted/20 rounded-md pb-1 mt-0">
                    <div className="font-semibold text-xs text-center mb-1 text-background/90 bg-amber-600 py-0.5 rounded-t-md w-full">
                      AUDIO
                    </div>
                    {mockIsLoadingAudio ? (
                      <div className="text-xs text-center text-background/80 px-1">
                        Loading...
                      </div>
                    ) : mockAudioData.length > 0 ? (
                      <div className="flex flex-wrap justify-center gap-1">
                        {mockAudioData.map((audio) => (
                          <button
                            key={audio.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              playAudio(audio.id);
                            }}
                            className="flex items-center gap-1.5 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors border border-border/50 cursor-pointer"
                            title={`${audio.region} pronunciation`}
                          >
                            <span className="text-base leading-none">
                              {audio.flag}
                            </span>
                            {currentlyPlayingAudio === audio.id ? (
                              <Pause className="h-3 w-3 text-foreground/70" />
                            ) : (
                              <Play className="h-3 w-3 text-foreground/70" />
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-center text-muted-foreground px-1">
                        None found
                      </div>
                    )}

                    {/* External pronunciation links */}
                    {mockCurrentWord && (
                      <div className="text-center mt-1 space-y-1">
                        <div className="flex justify-center items-center gap-1 text-xs text-muted-foreground">
                          <a
                            href={`https://youglish.com/pronounce/${encodeURIComponent(
                              mockCurrentWord
                            )}/english/us`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                            title="Hear real-world pronunciations on YouGlish"
                          >
                            YouGlish
                          </a>
                          <span>|</span>
                          <a
                            href={`https://playphrase.me/#/search?q=${encodeURIComponent(
                              mockCurrentWord
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-green-600 hover:text-green-800 underline cursor-pointer"
                            title="Hear movie/TV pronunciations on PlayPhrase"
                          >
                            PlayPhrase
                          </a>
                          <span>|</span>
                          <a
                            href={`https://getyarn.io/yarn-find?text=${encodeURIComponent(
                              mockCurrentWord
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-purple-600 hover:text-purple-800 underline cursor-pointer"
                            title="Hear movie/TV pronunciations on Yarn"
                          >
                            Yarn
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      );
    };

    return <TooltipContentWithState />;
  },
  parameters: {
    docs: {
      description: {
        story:
          "This story shows the tooltip content permanently visible, allowing you to see all the tooltip sections (annotations, pronunciation, audio) without needing to hover over a word.",
      },
    },
  },
};

export const WithContent = {
  args: {
    annotatedTranscript: [
      {
        alignment: [
          { word: "hello", wordIndex: 0, start_time: 0 },
          { word: "world", wordIndex: 1, start_time: 0.5 },
        ],
      },
    ],
    activeWordIndex: 0,
    handleWordClick: () => {},
    tooltipsEnabled: true,
  },
};

// New interactive story with play function
export const InteractiveWordClicking = {
  args: {
    annotatedTranscript: [
      {
        alignment: [
          { word: "hello", wordIndex: 0, start_time: 0 },
          { word: "beautiful", wordIndex: 1, start_time: 0.5 },
          { word: "world", wordIndex: 2, start_time: 1.0 },
        ],
      },
    ],
    activeWordIndex: null,
    handleWordClick: () => {},
    tooltipsEnabled: true,
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

// Story to demonstrate tooltip functionality
export const TooltipDemo = {
  args: {
    annotatedTranscript: [
      {
        alignment: [
          {
            word: "pronunciation",
            wordIndex: 0,
            start_time: 0,
            "BR issues": ["vowel-1", "consonant-2"],
          },
          {
            word: "example",
            wordIndex: 1,
            start_time: 0.5,
            "BR issues": [],
          },
          {
            word: "difficult",
            wordIndex: 2,
            start_time: 1.0,
            "BR issues": ["vowel-3"],
          },
        ],
      },
    ],
    activeWordIndex: null,
    handleWordClick: () => {},
    tooltipsEnabled: true,
    issuesData: [
      {
        id: "vowel-1",
        name: "Vowel Issues",
        issues: [
          { id: "vowel-1", name: "TRAP vowel" },
          { id: "vowel-2", name: "LOT vowel" },
          { id: "vowel-3", name: "STRUT vowel" },
        ],
      },
      {
        id: "consonant-1",
        name: "Consonant Issues",
        issues: [
          { id: "consonant-1", name: "TH sound" },
          { id: "consonant-2", name: "R sound" },
        ],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Hover over words to see tooltips
    const pronunciationWord = canvas.getByText("pronunciation");
    const exampleWord = canvas.getByText("example");
    const difficultWord = canvas.getByText("difficult");

    // Hover over "pronunciation" to see tooltip with annotations
    await userEvent.hover(pronunciationWord);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Hover over "example" to see tooltip without annotations
    await userEvent.hover(exampleWord);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Hover over "difficult" to see tooltip with different annotations
    await userEvent.hover(difficultWord);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  },
};

// Story to demonstrate tooltips disabled
export const TooltipsDisabled = {
  args: {
    annotatedTranscript: [
      {
        alignment: [
          { word: "hello", wordIndex: 0, start_time: 0 },
          { word: "world", wordIndex: 1, start_time: 0.5 },
        ],
      },
    ],
    activeWordIndex: null,
    handleWordClick: () => {},
    tooltipsEnabled: false,
  },
};

// Story with words that have complex pronunciation data
export const ComplexPronunciationTooltips = {
  args: {
    annotatedTranscript: [
      {
        alignment: [
          {
            word: "schedule",
            wordIndex: 0,
            start_time: 0,
            "BR issues": ["vowel-1"],
          },
          {
            word: "either",
            wordIndex: 1,
            start_time: 0.5,
            "BR issues": ["vowel-2"],
          },
          {
            word: "data",
            wordIndex: 2,
            start_time: 1.0,
            "BR issues": ["vowel-3"],
          },
        ],
      },
    ],
    activeWordIndex: null,
    handleWordClick: () => {},
    tooltipsEnabled: true,
    issuesData: [
      {
        id: "vowel-1",
        name: "Vowel Issues",
        issues: [
          { id: "vowel-1", name: "TRAP vowel" },
          { id: "vowel-2", name: "FLEECE vowel" },
          { id: "vowel-3", name: "FACE vowel" },
        ],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "This story demonstrates tooltips with words that have multiple pronunciations and complex phonetic data. Hover over words to see pronunciation details, audio controls, and external links.",
      },
    },
  },
};

// Story for admin context menu functionality
export const AdminContextMenu = {
  args: {
    annotatedTranscript: [
      {
        alignment: [
          {
            word: "admin",
            wordIndex: 0,
            start_time: 0,
            "BR issues": [],
          },
          {
            word: "word",
            wordIndex: 1,
            start_time: 0.5,
            "BR issues": [],
          },
        ],
      },
    ],
    activeWordIndex: null,
    handleWordClick: () => {},
    tooltipsEnabled: true,
    issuesData: [
      {
        id: "vowel-1",
        name: "Vowel Issues",
        issues: [
          { id: "vowel-1", name: "TRAP vowel" },
          { id: "vowel-2", name: "LOT vowel" },
        ],
      },
      {
        id: "consonant-1",
        name: "Consonant Issues",
        issues: [
          { id: "consonant-1", name: "TH sound" },
          { id: "consonant-2", name: "R sound" },
        ],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "This story shows admin functionality with context menus. Right-click on words to see the annotation context menu (admin only).",
      },
    },
  },
};
