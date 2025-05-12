import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "core-frontend-web/src/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "core-frontend-web/src/components/ui/tooltip";
import { PlayableWord } from "core-frontend-web/src/content/temp-components/PlayableWord";
import { useWordAudio } from "core-frontend-web/src/hooks/useWordAudio";

export const PhonemeCardCompact = ({ name, description, className = "" }) => {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="font-medium">{name}</div>
        {description && (
          <div className="text-sm text-muted-foreground">{description}</div>
        )}
      </CardContent>
    </Card>
  );
};

export function PhonemeCard({
  name,
  respelling,
  phonemic,
  phonetic,
  spellings = [],
  examples = [],
  type = "vowel", // or "consonant"
  onClick,
}) {
  const { playWord } = useWordAudio();

  // Group examples by spelling using direct index mapping
  const spellingExamples = spellings.reduce((acc, spelling, index) => {
    // Get example for this spelling at the same index
    if (examples[index]) {
      acc[spelling] = [examples[index]];
    }
    return acc;
  }, {});

  const handleClick = (e) => {
    if (examples.length > 0) {
      playWord(examples[0]);
    }
    onClick?.(e);
  };

  return (
    <TooltipProvider delayDuration={700}>
      <Tooltip delayDuration={700}>
        <TooltipTrigger asChild>
          <Card
            className="cursor-pointer transition-all duration-200 hover:shadow-lg w-full"
            onClick={handleClick}
          >
            <CardHeader className="p-0.5 flex items-center justify-center min-h-[32px]">
              <CardTitle className="text-sm leading-none py-0 flex items-center gap-0.5">
                {name}
              </CardTitle>
            </CardHeader>
          </Card>
        </TooltipTrigger>
        <TooltipContent className="max-w-[300px] p-3">
          <div className="space-y-2">
            {Object.entries(spellingExamples).map(([spelling, exs]) => (
              <div key={spelling} className="text-sm flex items-center gap-2">
                <span className="font-semibold">{spelling}:</span>
                <span className="flex-1">
                  <PlayableWord word={exs[0]} isInline={true} />
                </span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
