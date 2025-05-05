import { forwardRef, useState, useEffect } from "react";
import { Button } from "shared/frontend-web-core/src/components/ui/button";
import { Slider } from "shared/frontend-web-core/src/components/ui/slider";
import { Play, Pause, Volume2, Minus, Plus, Gauge } from "lucide-react";

const AudioPlayer = forwardRef(
  ({ mp3url, playbackSpeed, onPlaybackSpeedChange }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    // If no mp3url, disable all controls
    const isDisabled = !mp3url;

    const handleSpeedChange = (delta) => {
      if (ref.current) {
        const newSpeed = Math.round((playbackSpeed + delta) * 10) / 10; // Round to 1 decimal
        if (newSpeed >= 0.1 && newSpeed <= 2.0) {
          ref.current.playbackRate = newSpeed;
          onPlaybackSpeedChange(newSpeed);
        }
      }
    };

    // Update audio playback rate when prop changes
    useEffect(() => {
      if (ref.current) {
        ref.current.playbackRate = playbackSpeed;
      }
    }, [playbackSpeed]);

    const togglePlay = () => {
      if (isDisabled) return;
      if (isPlaying) {
        ref.current.pause();
      } else {
        ref.current.play();
      }
      setIsPlaying(!isPlaying);
    };

    return (
      <div className="p-1 border rounded-md">
        {/* Only render audio element if mp3url exists */}
        {mp3url ? (
          <audio
            ref={ref}
            src={mp3url}
            onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
            onDurationChange={(e) => setDuration(e.target.duration)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="hidden"
          />
        ) : null}

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 cursor-pointer"
            onClick={togglePlay}
            disabled={isDisabled}
          >
            {isPlaying ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
          </Button>

          <Slider
            value={[currentTime]}
            min={0}
            max={duration}
            step={0.1}
            className="flex-1 h-1 cursor-pointer"
            onValueChange={([value]) => {
              if (!isDisabled) {
                ref.current.currentTime = value;
                setCurrentTime(value);
              }
            }}
            disabled={isDisabled}
          />

          <div className="flex flex-col gap-0.5 w-[150px]">
            <div className="flex items-center gap-1 h-4">
              <Volume2 className="h-3.5 w-3.5 shrink-0" />
              <Slider
                value={[volume * 100]}
                min={0}
                max={100}
                className="w-full h-1 cursor-pointer"
                onValueChange={([value]) => {
                  if (!isDisabled) {
                    const vol = value / 100;
                    ref.current.volume = vol;
                    setVolume(vol);
                  }
                }}
                disabled={isDisabled}
              />
            </div>
            <div className="flex items-center gap-1 h-4">
              <Gauge className="h-3 w-3 shrink-0 mb-0.5" />
              <div className="flex items-center justify-between w-full">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 cursor-pointer"
                  onClick={() => handleSpeedChange(-0.1)}
                  disabled={isDisabled}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-xs w-8 text-center">
                  {playbackSpeed.toFixed(1)}x
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 cursor-pointer"
                  onClick={() => handleSpeedChange(0.1)}
                  disabled={isDisabled}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default AudioPlayer;
