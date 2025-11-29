import { ScrollArea } from "frontend/src/components/ui/scroll-area";
import { Checkbox } from "frontend/src/components/ui/checkbox";
import { useState, useEffect, useRef } from "react";
import useFetchAudio from "frontend/src/hooks/use-fetch-audio";

export default function TranscriptList({
  people,
  audio,
  currentPersonId,
  onTranscriptSelect,
}) {
  const [selectedTranscripts, setSelectedTranscripts] = useState(new Set());
  const { fetchAudio, annotatedTranscript } = useFetchAudio();
  const [transcriptCache, setTranscriptCache] = useState({});

  // When selection changes, fetch the transcript data
  useEffect(() => {
    const fetchTranscriptsAndNotify = async () => {
      const newCache = {};

      for (const id of selectedTranscripts) {
        if (!transcriptCache[id]) {
          const transcript = await fetchAudio(id);
          newCache[id] = transcript;
        }
      }

      // Update cache (merge with previous cache)
      if (Object.keys(newCache).length > 0) {
        setTranscriptCache((prev) => ({
          ...prev,
          ...newCache,
        }));
      }

      // Only send to parent if all selected are cached
      const transcriptData = [...selectedTranscripts]
        .filter((id) => transcriptCache[id] || newCache[id])
        .map((id) => ({
          id,
          annotatedTranscript: transcriptCache[id] || newCache[id],
        }));

      if (transcriptData.length === selectedTranscripts.size) {
        onTranscriptSelect(transcriptData);
      }
    };

    fetchTranscriptsAndNotify();
  }, [selectedTranscripts]);

  // Helper to get speaker name
  const getSpeakerName = (speakerId) => {
    const speaker = people.find((p) => p.id === speakerId);
    return speaker ? speaker.Name : speakerId;
  };

  const allTranscripts = (audio || []).sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date) - new Date(a.date);
  });

  // Your transcripts
  const yourTranscripts = (audio || [])
    .filter((t) => t.SpeakerName === currentPersonId)
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date) - new Date(a.date);
    });

  // Other people's transcripts (flat, most recent first)
  const otherTranscripts = (audio || [])
    .filter((t) => t.SpeakerName !== currentPersonId)
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date) - new Date(a.date);
    });

  const toggleTranscript = (id) => {
    setSelectedTranscripts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const TranscriptItem = ({ transcript, showSpeaker = false }) => (
    <li
      key={transcript.id}
      className="px-1 py-0.5 hover:bg-accent rounded flex items-center gap-2"
    >
      <Checkbox
        checked={selectedTranscripts.has(transcript.id)}
        onCheckedChange={() => toggleTranscript(transcript.id)}
        id={`transcript-${transcript.id}`}
      />
      <div className="flex-1">
        <a
          href={`/transcript/${transcript.id}`}
          className="block font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          {showSpeaker && `${getSpeakerName(transcript.SpeakerName)} → `}
          {transcript.Name || transcript.id}
        </a>
      </div>
    </li>
  );

  return (
    <div className="space-y-4">
      {/* All Transcripts Collapsible */}

      <ScrollArea>
        {allTranscripts.length > 0 ? (
          <ul className="space-y-1">
            {allTranscripts.map((transcript) => (
              <TranscriptItem
                key={transcript.id}
                transcript={transcript}
                showSpeaker={true}
              />
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No transcripts found</p>
        )}
      </ScrollArea>

      {/* Your Transcripts Collapsible */}
      {/* <Collapsible defaultOpen>
        <div className="flex items-center gap-2">
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 cursor-pointer text-lg font-semibold mb-2">
              <ChevronRight className="h-4 w-4" />
              Your Transcripts
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <ScrollArea>
            {yourTranscripts.length > 0 ? (
              <ul className="space-y-1">
                {yourTranscripts.map((transcript) => (
                  <TranscriptItem
                    key={transcript.id}
                    transcript={transcript}
                    showSpeaker={false}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No transcripts found</p>
            )}
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible> */}
      {/* Other People's Transcripts Collapsible */}
      {/* <Collapsible defaultOpen>
        <div className="flex items-center gap-2">
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 cursor-pointer text-lg font-semibold mb-2">
              <ChevronRight className="h-4 w-4" />
              Other People's Transcripts
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <ScrollArea>
            {otherTranscripts.length > 0 ? (
              <ul className="space-y-1">
                {otherTranscripts.map((transcript) => (
                  <TranscriptItem
                    key={transcript.id}
                    transcript={transcript}
                    showSpeaker={true}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No other transcripts</p>
            )}
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible> */}
    </div>
  );
}
