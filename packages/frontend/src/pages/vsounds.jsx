import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "frontend/src/components/ui/select";
import timestampsData from "frontend/src/data/timestamps.json";
import { getWiktionaryUSAudio } from "../utils/wiktionary-api.js";

export default function VSounds() {
  const [selectedColumn, setSelectedColumn] = useState("gambiarra");
  const [selectedSpeed, setSelectedSpeed] = useState("1.0");
  const [audioCache, setAudioCache] = useState({});
  const [wiktionaryCache, setWiktionaryCache] = useState({});
  const [timeoutId, setTimeoutId] = useState(null);
  const audioUrl =
    "https://saa-assets.s3.us-east-2.amazonaws.com/2025+01+04+will+rosenberg+vowels+96+hz+h_d+b_d+b_t+frames.mp3";

  const handlePlayAudio = async (word) => {
    if (!timestampsData || !timestampsData[word]) {
      console.error("No data for word:", word);
      return;
    }

    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Try Wiktionary audio first
    try {
      let wiktionaryAudioUrl = wiktionaryCache[word];

      if (!wiktionaryAudioUrl) {
        wiktionaryAudioUrl = await getWiktionaryUSAudio(word);
        if (wiktionaryAudioUrl) {
          setWiktionaryCache((prev) => ({
            ...prev,
            [word]: wiktionaryAudioUrl,
          }));
        }
      }

      if (wiktionaryAudioUrl) {
        // Use Wiktionary audio
        const audio = new Audio(wiktionaryAudioUrl);
        audio.playbackRate = parseFloat(selectedSpeed);
        await audio.play();
        return;
      }
    } catch (error) {
      console.error("Wiktionary audio failed, falling back to S3:", error);
    }

    // Fallback to S3 audio with timestamps
    const audio = audioCache[0] || new Audio(audioUrl);
    if (!audioCache[0]) {
      setAudioCache({ 0: audio });
    }

    const wordData = timestampsData[word];
    const duration = wordData.full.end - wordData.full.start;

    // Update audio position and speed
    audio.currentTime = wordData.full.start;
    audio.playbackRate = parseFloat(selectedSpeed);
    audio.play();

    // Set new timeout and store its ID
    const newTimeoutId = setTimeout(() => {
      audio.pause();
    }, (duration / audio.playbackRate) * 1000);

    setTimeoutId(newTimeoutId);
  };

  const handleColumnChange = (column) => {
    setSelectedColumn(column);
    // Hide all columns first
    document
      .querySelectorAll(
        ".vs-gambiarra, .vs-respelled, .vs-phonemic, .vs-phonetic"
      )
      .forEach((element) => element.classList.add("vs-hidden"));

    // Show selected column
    document
      .querySelectorAll(`.vs-${column}`)
      .forEach((element) => element.classList.remove("vs-hidden"));
  };

  const PlayableWord = ({ word }) => (
    <td
      className="cursor-pointer hover:bg-accent/50 p-2"
      onClick={(e) => handlePlayAudio(e.currentTarget.dataset.word)}
      data-word={word}
    >
      <span className="text-muted-foreground mr-2">🔊</span>
      {word}
    </td>
  );

  PlayableWord.propTypes = {
    word: PropTypes.string.isRequired,
  };

  return (
    <div className="bg-background p-0">
      <div className="relative w-full max-w-3xl mx-auto">
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left font-medium sticky left-0 bg-background">
                  Lex Set
                </th>
                <th className="p-2 text-center font-medium">h_d</th>
                <th className="p-2 text-center font-medium">b_d</th>
                <th className="p-2 text-center font-medium">b_t</th>
                <th className="vs-gambiarra">gambiarra</th>
                <th className="p-2 text-center font-medium">respelled</th>
                <th className="p-2 text-center font-medium">phonemic</th>
                <th className="p-2 text-center font-medium">phonetic</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2 text-left font-medium sticky left-0 bg-background">
                  FLEECE
                </td>
                <PlayableWord word="heed" />
                <PlayableWord word="bead" />
                <PlayableWord word="beat" />
                <td className="vs-gambiarra">i</td>
                <td className="vs-respelled vs-hidden">ee</td>
                <td className="vs-phonemic vs-hidden vs-ipa-symbol">/i/</td>
                <td className="vs-phonetic vs-hidden vs-ipa-symbol">[i]</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 text-left font-medium sticky left-0 bg-background">
                  KIT
                </td>
                <PlayableWord word="hid" />
                <PlayableWord word="bid" />
                <PlayableWord word="bit" />
                <td className="vs-gambiarra">ê</td>
                <td className="vs-respelled vs-hidden">i</td>
                <td className="vs-phonemic vs-hidden vs-ipa-symbol">/ɪ/</td>
                <td className="vs-phonetic vs-hidden vs-ipa-symbol">[ɪ]</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 text-left font-medium sticky left-0 bg-background">
                  DRESS
                </td>
                <PlayableWord word="head" />
                <PlayableWord word="bed" />
                <PlayableWord word="bet" />
                <td className="vs-gambiarra">é</td>
                <td className="vs-respelled vs-hidden">e</td>
                <td className="vs-phonemic vs-hidden vs-ipa-symbol">/ɛ/</td>
                <td className="vs-phonetic vs-hidden vs-ipa-symbol">[ɛ]</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 text-left font-medium sticky left-0 bg-background">
                  TRAP
                </td>
                <PlayableWord word="had" />
                <PlayableWord word="bad" />
                <PlayableWord word="bat" />
                <td className="vs-gambiarra"></td>
                <td className="vs-respelled vs-hidden">a</td>
                <td className="vs-phonemic vs-hidden vs-ipa-symbol">/æ/</td>
                <td className="vs-phonetic vs-hidden vs-ipa-symbol">[æ]</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 text-left font-medium sticky left-0 bg-background">
                  TRAM
                </td>
                <PlayableWord word="ham" />
                <PlayableWord word="ban" />
                <PlayableWord word="ban" />
                <td className="vs-gambiarra">êa</td>
                <td className="vs-respelled vs-hidden">a</td>
                <td className="vs-phonemic vs-hidden vs-ipa-symbol">/æ/</td>
                <td className="vs-phonetic vs-hidden vs-ipa-symbol">[eə̯]</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 text-left font-medium sticky left-0 bg-background">
                  GOOSE
                </td>
                <PlayableWord word="hooed" />
                <PlayableWord word="booed" />
                <PlayableWord word="boot" />
                <td className="vs-gambiarra">u</td>
                <td className="vs-respelled vs-hidden">oo</td>
                <td className="vs-phonemic vs-hidden vs-ipa-symbol">/u/</td>
                <td className="vs-phonetic vs-hidden vs-ipa-symbol">[u]</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 text-left font-medium sticky left-0 bg-background">
                  FOOT
                </td>
                <PlayableWord word="hood" />
                <PlayableWord word="b_d" />
                <PlayableWord word="b_t" />
                <td className="vs-gambiarra"></td>
                <td className="vs-respelled vs-hidden">u</td>
                <td className="vs-phonemic vs-hidden vs-ipa-symbol">/ʊ/</td>
                <td className="vs-phonetic vs-hidden vs-ipa-symbol">[ʊ]</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 text-left font-medium sticky left-0 bg-background">
                  STRUT
                </td>
                <PlayableWord word="HUD" />
                <PlayableWord word="bud" />
                <PlayableWord word="but" />
                <td className="vs-gambiarra"></td>
                <td className="vs-respelled vs-hidden">uh</td>
                <td className="vs-phonemic vs-hidden vs-ipa-symbol">/ʌ/</td>
                <td className="vs-phonetic vs-hidden vs-ipa-symbol">[ʌ̟]</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 text-left font-medium sticky left-0 bg-background">
                  LOT
                </td>
                <PlayableWord word="hawed" />
                <PlayableWord word="bod" />
                <PlayableWord word="bot" />
                <td className="vs-gambiarra">aa</td>
                <td className="vs-respelled vs-hidden">aa</td>
                <td className="vs-phonemic vs-hidden vs-ipa-symbol">/ɑ/</td>
                <td className="vs-phonetic vs-hidden vs-ipa-symbol">[ɑ]</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 text-left font-medium sticky left-0 bg-background">
                  FACE
                </td>
                <PlayableWord word="hayed" />
                <PlayableWord word="bade" />
                <PlayableWord word="bait" />
                <td className="vs-gambiarra">ei</td>
                <td className="vs-respelled vs-hidden">ay</td>
                <td className="vs-phonemic vs-hidden vs-ipa-symbol">/eɪ/</td>
                <td className="vs-phonetic vs-hidden vs-ipa-symbol">[e̞ɪ̯]</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 text-left font-medium sticky left-0 bg-background">
                  PRICE
                </td>
                <PlayableWord word="hide" />
                <PlayableWord word="bide" />
                <PlayableWord word="bite" />
                <td className="vs-gambiarra">ai</td>
                <td className="vs-respelled vs-hidden">ai</td>
                <td className="vs-phonemic vs-hidden vs-ipa-symbol">/aɪ/</td>
                <td className="vs-phonetic vs-hidden vs-ipa-symbol">[ɑ̟ɪ̯]</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 text-left font-medium sticky left-0 bg-background">
                  CHOICE
                </td>
                <PlayableWord word="hoyed" />
                <PlayableWord word="Boyd" />
                <PlayableWord word="Boyt" />
                <td className="vs-gambiarra">ôi</td>
                <td className="vs-respelled vs-hidden">oy</td>
                <td className="vs-phonemic vs-hidden vs-ipa-symbol">/ɔɪ/</td>
                <td className="vs-phonetic vs-hidden vs-ipa-symbol">[o̞ɪ̯]</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 text-left font-medium sticky left-0 bg-background">
                  GOAT
                </td>
                <PlayableWord word="hoed" />
                <PlayableWord word="bode" />
                <PlayableWord word="boat" />
                <td className="vs-gambiarra"></td>
                <td className="vs-respelled vs-hidden">ow</td>
                <td className="vs-phonemic vs-hidden vs-ipa-symbol">/oʊ/</td>
                <td className="vs-phonetic vs-hidden vs-ipa-symbol">[ʌʊ̯]</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 text-left font-medium sticky left-0 bg-background">
                  MOUTH
                </td>
                <PlayableWord word="how'd" />
                <PlayableWord word="bowed" />
                <PlayableWord word="bout" />
                <td className="vs-gambiarra">au</td>
                <td className="vs-respelled vs-hidden">au</td>
                <td className="vs-phonemic vs-hidden vs-ipa-symbol">/aʊ/</td>
                <td className="vs-phonetic vs-hidden vs-ipa-symbol">[aʊ̯]</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Add controls section */}
        <div className=" bottom-0 left-0 right-0 bg-background border-t p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="audio-speed" className="text-sm">
                Speed:
              </label>
              <Select value={selectedSpeed} onValueChange={setSelectedSpeed}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Speed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="0.75">0.75x</SelectItem>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="0.25">0.25x</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 hidden">
              <label htmlFor="column-select" className="text-sm">
                View:
              </label>
              <Select value={selectedColumn} onValueChange={handleColumnChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gambiarra">gambiarra</SelectItem>
                  <SelectItem value="respelled">respelled</SelectItem>
                  <SelectItem value="phonemic">phonemic</SelectItem>
                  <SelectItem value="phonetic">phonetic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
