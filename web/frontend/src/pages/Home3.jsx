import { useState, useEffect } from "react";
import PropTypes from "prop-types";

export default function Home3() {
  const [selectedColumn, setSelectedColumn] = useState("gambiarra");
  const [selectedSpeed, setSelectedSpeed] = useState("1.0");
  const [audioCache, setAudioCache] = useState({});
  const [timestampsData, setTimestampsData] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);
  const audioUrl =
    "https://native-scga-audio.s3.us-east-2.amazonaws.com/2025+01+04+will+rosenberg+vowels+96+hz+h_d+b_d+b_t+frames.mp3";

  useEffect(() => {
    // Load timestamps data
    fetch("/JSON/timestamps.json")
      .then((response) => response.json())
      .then((data) => setTimestampsData(data))
      .catch((error) => console.error("Error loading timestamps:", error));
  }, []);

  const handlePlayAudio = (word) => {
    if (!timestampsData || !timestampsData[word]) {
      console.error("No data for word:", word);
      return;
    }

    const audio = audioCache[0] || new Audio(audioUrl);
    if (!audioCache[0]) {
      setAudioCache({ 0: audio });
    }

    const wordData = timestampsData[word];
    const duration = wordData.full.end - wordData.full.start;

    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

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
      className="vs-playable"
      data-word={word}
      onClick={(e) => handlePlayAudio(e.currentTarget.dataset.word)}
    >
      <span className="vs-audio-icon">🔊</span>
      {word}
    </td>
  );

  PlayableWord.propTypes = {
    word: PropTypes.string.isRequired,
  };

  return (
    <>
      <div className="vs-main">
        <div className="vs-table-container">
          {/* Add controls section */}
          <div className="vs-sticky-footer">
            <div className="vs-controls">
              <label htmlFor="audio-speed">Select audio speed:</label>
              <select
                id="audio-speed"
                value={selectedSpeed}
                onChange={(e) => setSelectedSpeed(e.target.value)}
              >
                <option value="1">1x</option>
                <option value="0.75">0.75x</option>
                <option value="0.5">0.5x</option>
                <option value="0.25">0.25x</option>
              </select>
              <label htmlFor="column-select" className="vs-column-select">
                Select column:
              </label>
              <select
                id="column-select"
                className="vs-column-select"
                value={selectedColumn}
                onChange={(e) => handleColumnChange(e.target.value)}
              >
                <option value="gambiarra">gambiarra</option>
                <option value="respelled">respelled</option>
                <option value="phonemic">phonemic</option>
                <option value="phonetic">phonetic</option>
              </select>
            </div>
          </div>
          <div>
            <table className="vs-table">
              <thead>
                <tr>
                  <th className="vs-lex-set-header">Lex Set</th>
                  <th className="">h_d</th>
                  <th className="">b_d</th>
                  <th className="">b_t</th>
                  <th className="vs-gambiarra">gambiarra</th>
                  <th className="vs-respelled vs-hidden">respelled</th>
                  <th className="vs-phonemic vs-hidden">phonemic</th>
                  <th className="vs-phonetic vs-hidden">phonetic</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="vs-lex-set">FLEECE</td>
                  <PlayableWord word="heed" />
                  <PlayableWord word="bead" />
                  <PlayableWord word="beat" />
                  <td className="vs-gambiarra">i</td>
                  <td className="vs-respelled vs-hidden">ee</td>
                  <td className="vs-phonemic vs-hidden vs-ipa-symbol">/i/</td>
                  <td className="vs-phonetic vs-hidden vs-ipa-symbol">[i]</td>
                </tr>
                <tr>
                  <td className="vs-lex-set">KIT</td>
                  <PlayableWord word="hid" />
                  <PlayableWord word="bid" />
                  <PlayableWord word="bit" />
                  <td className="vs-gambiarra">ê</td>
                  <td className="vs-respelled vs-hidden">i</td>
                  <td className="vs-phonemic vs-hidden vs-ipa-symbol">/ɪ/</td>
                  <td className="vs-phonetic vs-hidden vs-ipa-symbol">[ɪ]</td>
                </tr>
                <tr>
                  <td className="vs-lex-set">DRESS</td>
                  <PlayableWord word="head" />
                  <PlayableWord word="bed" />
                  <PlayableWord word="bet" />
                  <td className="vs-gambiarra">é</td>
                  <td className="vs-respelled vs-hidden">e</td>
                  <td className="vs-phonemic vs-hidden vs-ipa-symbol">/ɛ/</td>
                  <td className="vs-phonetic vs-hidden vs-ipa-symbol">[ɛ]</td>
                </tr>
                <tr>
                  <td className="vs-lex-set">TRAP</td>
                  <PlayableWord word="had" />
                  <PlayableWord word="bad" />
                  <PlayableWord word="bat" />
                  <td className="vs-gambiarra"></td>
                  <td className="vs-respelled vs-hidden">a</td>
                  <td className="vs-phonemic vs-hidden vs-ipa-symbol">/æ/</td>
                  <td className="vs-phonetic vs-hidden vs-ipa-symbol">[æ]</td>
                </tr>
                <tr>
                  <td className="vs-lex-set">TRAM</td>
                  <PlayableWord word="ham" />
                  <PlayableWord word="ban" />
                  <PlayableWord word="ban" />
                  <td className="vs-gambiarra">êa</td>
                  <td className="vs-respelled vs-hidden">a</td>
                  <td className="vs-phonemic vs-hidden vs-ipa-symbol">/æ/</td>
                  <td className="vs-phonetic vs-hidden vs-ipa-symbol">[eə̯]</td>
                </tr>
                <tr>
                  <td className="vs-lex-set">GOOSE</td>
                  <PlayableWord word="hooed" />
                  <PlayableWord word="booed" />
                  <PlayableWord word="boot" />
                  <td className="vs-gambiarra">u</td>
                  <td className="vs-respelled vs-hidden">oo</td>
                  <td className="vs-phonemic vs-hidden vs-ipa-symbol">/u/</td>
                  <td className="vs-phonetic vs-hidden vs-ipa-symbol">[u]</td>
                </tr>
                <tr>
                  <td className="vs-lex-set">FOOT</td>
                  <PlayableWord word="hood" />
                  <PlayableWord word="b_d" />
                  <PlayableWord word="b_t" />
                  <td className="vs-gambiarra"></td>
                  <td className="vs-respelled vs-hidden">u</td>
                  <td className="vs-phonemic vs-hidden vs-ipa-symbol">/ʊ/</td>
                  <td className="vs-phonetic vs-hidden vs-ipa-symbol">[ʊ]</td>
                </tr>
                <tr>
                  <td className="vs-lex-set">STRUT</td>
                  <PlayableWord word="HUD" />
                  <PlayableWord word="bud" />
                  <PlayableWord word="but" />
                  <td className="vs-gambiarra"></td>
                  <td className="vs-respelled vs-hidden">uh</td>
                  <td className="vs-phonemic vs-hidden vs-ipa-symbol">/ʌ/</td>
                  <td className="vs-phonetic vs-hidden vs-ipa-symbol">[ʌ̟]</td>
                </tr>
                <tr>
                  <td className="vs-lex-set">LOT</td>
                  <PlayableWord word="hawed" />
                  <PlayableWord word="bod" />
                  <PlayableWord word="bot" />
                  <td className="vs-gambiarra">aa</td>
                  <td className="vs-respelled vs-hidden">aa</td>
                  <td className="vs-phonemic vs-hidden vs-ipa-symbol">/ɑ/</td>
                  <td className="vs-phonetic vs-hidden vs-ipa-symbol">[ɑ]</td>
                </tr>
                <tr>
                  <td className="vs-lex-set">FACE</td>
                  <PlayableWord word="hayed" />
                  <PlayableWord word="bade" />
                  <PlayableWord word="bait" />
                  <td className="vs-gambiarra">ei</td>
                  <td className="vs-respelled vs-hidden">ay</td>
                  <td className="vs-phonemic vs-hidden vs-ipa-symbol">/eɪ/</td>
                  <td className="vs-phonetic vs-hidden vs-ipa-symbol">[e̞ɪ̯]</td>
                </tr>
                <tr>
                  <td className="vs-lex-set">PRICE</td>
                  <PlayableWord word="hide" />
                  <PlayableWord word="bide" />
                  <PlayableWord word="bite" />
                  <td className="vs-gambiarra">ai</td>
                  <td className="vs-respelled vs-hidden">ai</td>
                  <td className="vs-phonemic vs-hidden vs-ipa-symbol">/aɪ/</td>
                  <td className="vs-phonetic vs-hidden vs-ipa-symbol">[ɑ̟ɪ̯]</td>
                </tr>
                <tr>
                  <td className="vs-lex-set">CHOICE</td>
                  <PlayableWord word="hoyed" />
                  <PlayableWord word="Boyd" />
                  <PlayableWord word="Boyt" />
                  <td className="vs-gambiarra">ôi</td>
                  <td className="vs-respelled vs-hidden">oy</td>
                  <td className="vs-phonemic vs-hidden vs-ipa-symbol">/ɔɪ/</td>
                  <td className="vs-phonetic vs-hidden vs-ipa-symbol">[o̞ɪ̯]</td>
                </tr>
                <tr>
                  <td className="vs-lex-set">GOAT</td>
                  <PlayableWord word="hoed" />
                  <PlayableWord word="bode" />
                  <PlayableWord word="boat" />
                  <td className="vs-gambiarra"></td>
                  <td className="vs-respelled vs-hidden">ow</td>
                  <td className="vs-phonemic vs-hidden vs-ipa-symbol">/oʊ/</td>
                  <td className="vs-phonetic vs-hidden vs-ipa-symbol">[ʌʊ̯]</td>
                </tr>
                <tr>
                  <td className="vs-lex-set">MOUTH</td>
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
        </div>
      </div>
    </>
  );
}
