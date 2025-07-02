import React from "react";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

export default function ConsonantReplays() {
  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold text-center mb-8">
        Consonant Call Replays
      </h1>

      <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
        <div className="w-full max-w-[500px]">
          <h2 className="text-xl font-semibold mb-3 text-center">
            Consonants Training - January 22, 2025
          </h2>
          <LiteYouTubeEmbed
            id="lWbWnhOhVj0"
            title="Consonants Training - January 22, 2025"
          />
        </div>
      </div>

      <h1 className="text-2xl font-bold mt-10">External Resources</h1>
      <p className="mt-4">Practice phrases & words</p>
      <ul className="px-8 list-disc">
        <li>
          <a
            href="https://www.home-speech-home.com/speech-therapy-word-lists.html#:~:text=Client%20Centered%20Products-,Articulation,-Each%20list%20of"
            target="_blank"
            rel="noopener noreferrer"
          >
            Home Speech Home
          </a>{" "}
          - Practice phrases & words for <i>consonants</i>.
        </li>
        <li>
          <a
            href="https://chatgpt.com/?q=Can%20you%20please%20generate%205%20to%2010%20practice%20phrases%20for%20me%20to%20help%20me%20train%20my%20American%20accent%3F%20I%27ll%20supply%20you%20some%20words%20that%20I%20want%20you%20to%20make%20sure%20to%20include%20in%20the%20phrases."
            target="_blank"
            rel="noopener noreferrer"
          >
            ChatGPT
          </a>{" "}
          - Use ChatGPT to generate your own practice phrases. I've included a
          sample prompt for you to get started - click to try it out
          automatically. Try following up with "the this that these those"
        </li>
      </ul>
      <p className="mt-4">Search For Native Audio</p>
      <ul className="px-8 list-disc">
        <li>
          <a
            href="https://youglish.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            YouGlish
          </a>
        </li>
        <li>
          <a
            href="https://forvo.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Forvo
          </a>
        </li>
      </ul>
      <p className="mt-4">Software to help you practice/analyze accents</p>
      <ul className="px-8 list-disc">
        <li>
          <a
            href="https://www.youtube.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube
          </a>{" "}
          - Sometimes simple is best! Try using keyboard shortcuts to change
          speed and jump back and forth.
        </li>
        <li>
          <a
            href="https://agrahn.gitlab.io/ABLoopPlayer/"
            target="_blank"
            rel="noopener noreferrer"
          >
            AB Loop Player
          </a>{" "}
          - Infinitely loop any section of any YouTube video, at any speed you
          want.
        </li>
        <li>
          <a
            href="https://www.audacityteam.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Audacity
          </a>{" "}
          - If you want to record your own voice / analyze audio more deeply.{" "}
          <ul className="px-8 list-disc">
            <li>
              Here's an old training I did on{" "}
              <a
                href="https://www.youtube.com/watch?v=MS3xQ1TBY8c/"
                target="_blank"
                rel="noopener noreferrer"
              >
                how to use Audacity for accent training.
              </a>
            </li>
          </ul>
        </li>
        <li>
          <a
            href="https://www.fon.hum.uva.nl/praat/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Praat
          </a>{" "}
          - The website might look outdated, but Praat is a powerful tool widely
          used in academic and professional accent analysis—perfect if you
          really want to dive deep.
        </li>
      </ul>
      <p className="mt-4">Accent training apps</p>
      <ul className="px-8 list-disc">
        <li>
          <a
            href="https://start.boldvoice.com/HVZQEF?d=R10&z=1"
            target="_blank"
            rel="noopener noreferrer"
          >
            BoldVoice
          </a>{" "}
          (Free 7 day trial -&gt; monthly/yearly subscription)
        </li>
      </ul>
    </div>
  );
}
