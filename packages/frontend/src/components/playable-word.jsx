import { useWordAudio } from "frontend/src/hooks/use-word-audio";

export const PlayableWord = ({ word, isInline = false, onClick }) => {
  const { playWord, isLoading } = useWordAudio();

  return (
    <button
      onClick={(e) => {
        playWord(word);
        onClick?.(e);
      }}
      disabled={isLoading}
      className={`cursor-pointer hover:bg-accent/50 inline-flex items-center gap-2 ${
        isInline ? "p-0 hover:underline" : "p-2"
      }`}
    >
      <span className={`text-muted-foreground ${isInline ? "text-sm" : ""}`}>
        {isLoading ? "⏳" : "🔊"}
      </span>
      {word}
    </button>
  );
};

export default PlayableWord;
