import { useEffect, useState, useRef, useMemo } from "react";
import useFetchAudioV1 from "core-frontend-web/src/hooks/use-fetch-audio-v1";
import useAudioSync from "core-frontend-web/src/hooks/use-audio-sync";
import { useParams, useNavigate } from "react-router-dom";

import { findActiveWordIndex } from "core-frontend-web/src/utils/binary-search";
import { fetchData } from "core-frontend-web/src/utils/api";
import { cn } from "core-frontend-web/src/lib/utils";

import useVersionStore from "core-frontend-web/src/stores/version-store";
import { useIssuesStore } from "core-frontend-web/src/stores/issues-store";
import useAuthStore from "core-frontend-web/src/stores/auth-store";
import {
  HelpCircle,
  Keyboard,
  Mic,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Copy,
  Download,
  Activity,
} from "lucide-react";

import TranscriptViewerV1 from "core-frontend-web/src/components/transcript/transcript-viewer-v1";
import TranscriptStatsV1 from "core-frontend-web/src/components/transcript/transcript-stats-v1";
import WaveformEditor from "core-frontend-web/src/components/transcript/waveform-editor";
import TextToTranscriptConverter from "core-frontend-web/src/components/transcript/text-to-transcript-converter";
import AudioPlayer from "core-frontend-web/src/components/audio-player";
import KeyboardShortcutsModal from "core-frontend-web/src/components/keyboard-shortcuts-modal";
import TranscriptCTA from "core-frontend-web/src/components/transcript/transcript-cta";
import { Button } from "core-frontend-web/src/components/ui/button";
import { PersonAudioSelector } from "core-frontend-web/src/components/person-audio-selector";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "core-frontend-web/src/components/ui/resizable";
import { ScrollArea } from "core-frontend-web/src/components/ui/scroll-area";
import { SidebarRight } from "core-frontend-web/src/components/sidebar-right";

export default function Transcript() {
  // #region declarations
  const { audioId } = useParams(); // Get audioId from route params
  const navigate = useNavigate();

  // Get People and Audio Resources from auth store
  const {
    people,
    audios: audio,
    filteredAudios: filteredAudio,
    selectedPerson,
    setSelectedPerson,
    selectedAudio,
    setSelectedAudio,
    isAdmin,
  } = useAuthStore();

  const [activeFilters, setActiveFilters] = useState([]);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const rightPanelRef = useRef(null);
  const { version } = useVersionStore();

  const handleFilterChange = (activeIssues) => {
    setActiveFilters(activeIssues);
  };

  // Fetch Audio & Transcript Data
  const { mp3url, annotatedTranscript, fetchAudio } = useFetchAudioV1();

  // Reference for Audio Player & State for Playback Speed
  const audioRef = useRef(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // Track Current Time for Word Highlighting
  const currentTime = useAudioSync(audioRef);
  const [activeWordIndex, setActiveWordIndex] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [pronunciations, setPronunciations] = useState([]);
  const [pronunciations2, setPronunciations2] = useState([]);

  // Get issues data from store
  const { issuesData } = useIssuesStore();

  // Add state for modal visibility
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  const [hoveredWordIndices, setHoveredWordIndices] = useState([]);
  const [tooltipsEnabled, setTooltipsEnabled] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draftTranscript, setDraftTranscript] = useState(null);
  const [showWaveform, setShowWaveform] = useState(false);
  const [showTextConverter, setShowTextConverter] = useState(false);
  const hasInitialized = useRef(false);
  const prevSelectedAudio = useRef(selectedAudio);
  // #endregion

  // #region do stuff

  // Add effect to handle route audio ID
  useEffect(() => {
    if (audioId && audioId !== selectedAudio) {
      // Find the audio file in the list
      const audioFile = audio.find((a) => a.id === audioId);
      if (audioFile) {
        // Set the person first (required for filtered audio)
        setSelectedPerson(audioFile.SpeakerName);
        // Then set the audio
        setSelectedAudio(audioId);
      }
    }
    // Mark as initialized after audio list is loaded
    if (audio.length > 0) {
      hasInitialized.current = true;
    }
  }, [audioId, audio, selectedAudio, setSelectedPerson, setSelectedAudio]);

  // Update URL when audio selection changes (but not during initialization)
  useEffect(() => {
    // Only update URL after initialization is complete
    if (!hasInitialized.current) {
      prevSelectedAudio.current = selectedAudio;
      return;
    }

    // Track if this is a user-initiated change (not from URL initialization)
    const isUserAction = selectedAudio !== prevSelectedAudio.current;

    // Only update URL if selectedAudio actually changed (user action)
    // and is different from current URL param
    if (selectedAudio && selectedAudio !== audioId && isUserAction) {
      navigate(`/transcript/${selectedAudio}`, { replace: true });
    } else if (
      !selectedAudio &&
      audioId &&
      isUserAction &&
      prevSelectedAudio.current
    ) {
      // Clear URL param only if audio was previously selected (user deselected it)
      navigate("/transcript", { replace: true });
    }

    // Always update the previous value
    prevSelectedAudio.current = selectedAudio;
  }, [selectedAudio, audioId, navigate]);

  // Helper function to get issue names from IDs
  const getIssueNames = (issueIds) => {
    if (!issueIds || !issuesData.length) return [];

    return issueIds.map((id) => {
      // Find the category that contains this issue
      const category = issuesData.find((cat) =>
        cat.issues.some((issue) => issue.id === id)
      );

      if (category) {
        const issue = category.issues.find((i) => i.id === id);
        return issue ? issue.name : id;
      }
      return id;
    });
  };

  // Helper function to get target names from IDs
  const getTargetNames = (targetIds) => {
    if (!targetIds || !issuesData.length) return [];

    return targetIds.map((array) =>
      array.map((id) => {
        // Find the category that contains this issue
        const category = issuesData.find((cat) => cat.id === id);

        if (category) {
          return category.name;
        }
        return id;
      })
    );
  };

  const flattenTranscript = (transcripts, useDraft = false) => {
    const flattened = transcripts.flatMap((paragraph) => paragraph.alignment);

    // If in edit mode and we have draft transcript, merge draft start times
    if (useDraft && isEditMode && draftTranscript) {
      return flattened.map((wordObj) => {
        const draftWord = draftTranscript.find(
          (w) => w.wordIndex === wordObj.wordIndex
        );
        if (draftWord) {
          return {
            ...wordObj,
            start_time: draftWord.start,
          };
        }
        return wordObj;
      });
    }

    return flattened;
  };

  // Sync Active Word with Current Time
  useEffect(() => {
    // Use draft start times if in edit mode
    let transcriptFlattened = flattenTranscript(annotatedTranscript, true);
    if (!transcriptFlattened.length) return;
    const idx = findActiveWordIndex(transcriptFlattened, currentTime);
    setActiveWordIndex(idx);
  }, [currentTime, annotatedTranscript, isEditMode, draftTranscript]);

  // Automatically open waveform when edit mode is enabled
  useEffect(() => {
    const hasAudioLoaded = Boolean(mp3url && annotatedTranscript?.length);
    if (isEditMode && hasAudioLoaded) {
      setShowWaveform(true);
    } else if (!isEditMode) {
      // Close waveform when exiting edit mode
      setShowWaveform(false);
    }
  }, [isEditMode, mp3url, annotatedTranscript]);

  // Handle Audio Selection and Fetch
  const handleAudioSelection = async () => {
    setIsAudioLoading(true);
    try {
      await fetchAudio(selectedAudio);
      if (audioRef.current) {
        audioRef.current.load();
      }
    } catch (error) {
      setError("Failed to load audio or transcript data");
      console.error("Error loading audio:", error);
    } finally {
      setIsAudioLoading(false);
    }
  };

  // Move audio selection logic into useEffect
  useEffect(() => {
    if (selectedAudio) {
      handleAudioSelection();
    }
  }, [selectedAudio]); // Run when selectedAudio changes

  // Add keyboard controls
  useEffect(() => {
    const handleKeydown = (e) => {
      // Only handle shortcuts if we have audio or it's the help shortcut
      if (!audioRef.current && e.code !== "Slash") return;

      switch (e.code) {
        case "ArrowLeft": {
          e.preventDefault();
          audioRef.current.currentTime -= 1;
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          audioRef.current.currentTime += 1;
          break;
        }
        case "Space": {
          e.preventDefault();
          const action = audioRef.current.paused ? "play" : "pause";
          audioRef.current[action]();
          break;
        }
        case "Comma":
        case "Minus":
        case "NumpadSubtract": {
          e.preventDefault();
          const newSpeed = Math.max(0.1, audioRef.current.playbackRate - 0.1);
          audioRef.current.playbackRate = newSpeed;
          setPlaybackSpeed(newSpeed);
          break;
        }
        case "Period":
        case "Equal":
        case "NumpadAdd": {
          e.preventDefault();
          const newSpeed = Math.min(4.0, audioRef.current.playbackRate + 0.1);
          audioRef.current.playbackRate = newSpeed;
          setPlaybackSpeed(newSpeed);
          break;
        }
        case "Slash": {
          e.preventDefault();
          setIsShortcutsModalOpen((prev) => !prev);
          break;
        }
      }
    };

    document.addEventListener("keydown", handleKeydown);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []); // Empty dependency array since we only want to set this up once

  const handleAnnotationHover = (annotations) => {
    const friendlyIssueNames = getIssueNames(annotations);
    setAnnotations(friendlyIssueNames);
  };

  const handlePronunciationHover = (pronunciations) => {
    setPronunciations(pronunciations);
  };

  const handlePronunciation2Hover = (pronunciations2) => {
    setPronunciations2(pronunciations2);
  };

  const handleAnnotationUpdate = async (wordIndex, annotations) => {
    // Flatten the annotatedTranscript structure and find the word ID

    const flattenedWords = annotatedTranscript.flatMap(
      (segment) => segment.alignment
    );

    const wordId = flattenedWords[wordIndex]?.id;
    const word = flattenedWords[wordIndex]?.word;
    const timestamp = flattenedWords[wordIndex]?.start_time;

    let response = await fetchData("/api/v1/annotations/update", {
      method: "POST",
      body: JSON.stringify({
        wordIndex,
        annotations,
        audioId: [selectedAudio],
        word,
        timestamp,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Update transcript state
    fetchAudio(selectedAudio); // Refetch to update state

    // Update tooltip
    handleAnnotationHover(annotations, wordIndex);
  };

  // Initialize draft when entering edit mode or transcript changes
  useEffect(() => {
    if (isEditMode && annotatedTranscript?.length) {
      // Create a flat draft structure
      const draft = annotatedTranscript.flatMap((paragraph) => {
        if (!paragraph.alignment) return [];
        return paragraph.alignment.map((wordObj) => ({
          word: wordObj.word || "",
          start: wordObj.start_time || wordObj.start || 0,
          lineBreakAfter: wordObj.lineBreakAfter || false,
          newParagraphAfter: wordObj.newParagraphAfter || false,
          wordIndex: wordObj.wordIndex,
        }));
      });
      setDraftTranscript(draft);
    }
  }, [isEditMode, annotatedTranscript]);

  // Update word in draft
  const updateDraftWord = (wordIndex, updates) => {
    setDraftTranscript((prev) => {
      if (!prev) return prev;
      return prev.map((word) =>
        word.wordIndex === wordIndex ? { ...word, ...updates } : word
      );
    });
  };

  // Clean draft transcript for export: remove wordIndex, and only include lineBreakAfter/newParagraphAfter if true
  const cleanDraftForExport = (draft) => {
    if (!draft) return draft;
    return draft.map((word) => {
      const cleaned = {
        word: word.word,
        start: word.start,
      };
      if (word.lineBreakAfter) cleaned.lineBreakAfter = true;
      if (word.newParagraphAfter) cleaned.newParagraphAfter = true;
      return cleaned;
    });
  };

  // Copy draft to clipboard
  const copyDraftToClipboard = async () => {
    if (!draftTranscript) return;
    try {
      const cleaned = cleanDraftForExport(draftTranscript);
      const jsonString = JSON.stringify(cleaned, null, 2);
      await navigator.clipboard.writeText(jsonString);
      alert("Draft transcript copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy to clipboard");
    }
  };

  // Download draft as JSON file
  const downloadDraft = () => {
    if (!draftTranscript) return;
    const cleaned = cleanDraftForExport(draftTranscript);
    const jsonString = JSON.stringify(cleaned, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-draft-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Check if draft has changes
  const hasDraftChanges = useMemo(() => {
    if (!draftTranscript || !annotatedTranscript?.length) return false;
    const original = annotatedTranscript.flatMap((paragraph) => {
      if (!paragraph.alignment) return [];
      return paragraph.alignment.map((wordObj) => ({
        word: wordObj.word || "",
        start: wordObj.start_time || wordObj.start || 0,
        wordIndex: wordObj.wordIndex,
      }));
    });
    return JSON.stringify(draftTranscript) !== JSON.stringify(original);
  }, [draftTranscript, annotatedTranscript]);
  // #endregion

  const hasAudioLoaded = Boolean(mp3url && annotatedTranscript?.length);

  return (
    <div className="flex">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel id="transcript-main" order={0}>
          <div className="flex flex-col h-[calc(100vh-var(--navbar-height))] sm:h-screen">
            {/* Waveform Editor - OUTSIDE ScrollArea to prevent flickering */}
            {hasAudioLoaded && isEditMode && showWaveform && (
              <div className="border-b bg-background">
                <div className="p-2">
                  <WaveformEditor
                    mp3url={mp3url}
                    annotatedTranscript={annotatedTranscript}
                    draftTranscript={draftTranscript}
                    onDraftUpdate={updateDraftWord}
                    onClose={() => setShowWaveform(false)}
                    audioRef={audioRef}
                  />
                </div>
              </div>
            )}
            {/* Text to Transcript Converter - OUTSIDE ScrollArea */}
            {isAdmin && showTextConverter && (
              <div className="border-b bg-background">
                <div className="p-2">
                  <TextToTranscriptConverter
                    onClose={() => setShowTextConverter(false)}
                    mp3url={mp3url}
                  />
                </div>
              </div>
            )}
            {/* ScrollArea with header and transcript content */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-2 bg-background">
                <header className="flex flex-col sticky top-0 z-10 bg-background">
                  <div
                    className={cn(
                      "flex items-center gap-4",
                      (!hasAudioLoaded || loadError) &&
                        "h-[calc(100vh-var(--navbar-height))] sm:h-screen justify-center flex-col"
                    )}
                  >
                    {hasAudioLoaded ? (
                      <div className="flex items-center justify-between w-full">
                        <PersonAudioSelector
                          people={people}
                          filteredAudio={filteredAudio}
                          selectedPerson={selectedPerson}
                          selectedAudio={selectedAudio}
                          onPersonSelect={setSelectedPerson}
                          onAudioSelect={setSelectedAudio}
                          size="default"
                        />

                        <div className="flex items-center gap-2">
                          {isAdmin && (
                            <>
                              <Button
                                variant={isEditMode ? "default" : "outline"}
                                size="sm"
                                onClick={() => setIsEditMode(!isEditMode)}
                                className="flex items-center gap-2 cursor-pointer"
                                title="Toggle edit mode (Admin only)"
                              >
                                <Edit2 className="h-4 w-4" />
                                {isEditMode ? "Exit Edit" : "Edit"}
                              </Button>
                              {isEditMode && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setShowWaveform(!showWaveform)
                                    }
                                    className="flex items-center gap-2 cursor-pointer"
                                    disabled={!draftTranscript}
                                    title="Show waveform editor"
                                  >
                                    <Activity className="h-4 w-4" />
                                    Waveform
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyDraftToClipboard}
                                    className="flex items-center gap-2 cursor-pointer"
                                    disabled={!draftTranscript}
                                    title="Copy draft transcript to clipboard"
                                  >
                                    <Copy className="h-4 w-4" />
                                    Copy
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={downloadDraft}
                                    className="flex items-center gap-2 cursor-pointer"
                                    disabled={!draftTranscript}
                                    title="Download draft transcript as JSON"
                                  >
                                    <Download className="h-4 w-4" />
                                    Download
                                  </Button>
                                  {hasDraftChanges && (
                                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                      Unsaved changes
                                    </span>
                                  )}
                                </>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setShowTextConverter(!showTextConverter)
                                }
                                className="flex items-center gap-2 cursor-pointer"
                                title="Convert text to transcript JSON"
                              >
                                <Edit2 className="h-4 w-4" />
                                Text Converter
                              </Button>
                            </>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTooltipsEnabled(!tooltipsEnabled)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            {tooltipsEnabled ? (
                              <>
                                <Eye className="h-4 w-4" />
                                Tooltips
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-4 w-4" />
                                Tooltips
                              </>
                            )}
                          </Button>

                          {!showWaveform && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (rightPanelRef.current) {
                                  if (rightPanelRef.current.isCollapsed()) {
                                    rightPanelRef.current.expand();
                                  } else {
                                    rightPanelRef.current.collapse();
                                  }
                                }
                              }}
                              className="flex items-center gap-2 cursor-pointer"
                              title={
                                isRightPanelCollapsed
                                  ? "Expand stats panel"
                                  : "Collapse stats panel"
                              }
                            >
                              {isRightPanelCollapsed ? (
                                <>
                                  <ChevronLeft className="h-4 w-4" />
                                  Stats
                                </>
                              ) : (
                                <>
                                  <ChevronRight className="h-4 w-4" />
                                  Stats
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <PersonAudioSelector
                        people={people}
                        filteredAudio={filteredAudio}
                        selectedPerson={selectedPerson}
                        selectedAudio={selectedAudio}
                        onPersonSelect={setSelectedPerson}
                        onAudioSelect={setSelectedAudio}
                        size="large"
                      />
                    )}

                    {(isAudioLoading || (selectedAudio && !hasAudioLoaded)) && (
                      <div className={cn("text-muted-foreground text-center")}>
                        {isAudioLoading
                          ? "Loading..."
                          : "Selected audio file appears to be empty"}
                      </div>
                    )}
                  </div>

                  {/* Only show these once audio is loaded */}
                  {hasAudioLoaded && (
                    <>
                      <div>
                        <AudioPlayer
                          mp3url={mp3url}
                          ref={audioRef}
                          playbackSpeed={playbackSpeed}
                          onPlaybackSpeedChange={setPlaybackSpeed}
                        />
                      </div>
                    </>
                  )}
                </header>
                <section>
                  {/* Only show transcript viewer when audio is loaded */}
                  {hasAudioLoaded && (
                    <TranscriptViewerV1
                      annotatedTranscript={annotatedTranscript}
                      activeWordIndex={activeWordIndex}
                      handleWordClick={(start_time) => {
                        // Always allow audio playback, even in edit mode
                        audioRef.current.currentTime = start_time;
                        audioRef.current.play();
                      }}
                      onAnnotationHover={handleAnnotationHover}
                      onPronunciationHover={handlePronunciationHover}
                      onPronunciation2Hover={handlePronunciation2Hover}
                      issuesData={issuesData}
                      onAnnotationUpdate={handleAnnotationUpdate}
                      activeFilters={activeFilters}
                      hoveredWordIndices={hoveredWordIndices}
                      tooltipsEnabled={tooltipsEnabled}
                      isEditMode={isEditMode}
                      draftTranscript={draftTranscript}
                      onDraftUpdate={updateDraftWord}
                      audioRef={audioRef}
                      currentTime={currentTime}
                    />
                  )}
                </section>
                <aside>
                  <KeyboardShortcutsModal
                    isOpen={isShortcutsModalOpen}
                    onClose={() => setIsShortcutsModalOpen(false)}
                  />
                </aside>
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        {/* Only show right panel when audio is loaded and waveform is not shown */}
        {hasAudioLoaded && !isEditMode && (
          <ResizablePanel
            ref={rightPanelRef}
            id="transcript-stats"
            order={1}
            className="h-[calc(100vh-var(--navbar-height))] sm:h-screen"
            defaultSize={50}
            minSize={30}
            maxSize={50}
            collapsible={true}
            collapsedSize={0}
            onCollapse={() => setIsRightPanelCollapsed(true)}
            onExpand={() => setIsRightPanelCollapsed(false)}
          >
            <ScrollArea className="h-[calc(100vh-var(--navbar-height))] sm:h-screen">
              <div className="px-4 bg-background">
                <TranscriptStatsV1
                  annotatedTranscript={annotatedTranscript}
                  issuesData={issuesData}
                  onFilterChange={handleFilterChange}
                  setHoveredWordIndices={setHoveredWordIndices}
                />
              </div>
            </ScrollArea>
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
      {/* <SidebarRight /> */}

      {/* Floating help buttons */}
      {hasAudioLoaded && (
        <div className="fixed bottom-19 right-8 z-50 flex flex-col gap-3">
          {/* Keyboard shortcuts help */}
          <Button
            onClick={() => setIsShortcutsModalOpen(true)}
            className="rounded-full w-12 h-12 bg-gray-600 hover:bg-gray-700 shadow-lg cursor-pointer"
            size="sm"
            title="Keyboard shortcuts and pronunciation guide"
          >
            <Keyboard className="!h-7 !w-7" />
          </Button>

          {/* Personal coaching CTA */}
          <TranscriptCTA
            variant="floating"
            className="fixed bottom-6 right-8"
          />
        </div>
      )}
    </div>
  );
}
