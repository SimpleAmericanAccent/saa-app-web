/* eslint-disable react/prop-types */
import { forwardRef } from "react";

const AudioPlayer = forwardRef(({ mp3url }, ref) => {
  return (
    <audio className="block" ref={ref} controls>
      <source src={mp3url} type="audio/mp3" />
      Your browser does not support the audio element.
    </audio>
  );
});

AudioPlayer.displayName = "AudioPlayer";

export default AudioPlayer;
