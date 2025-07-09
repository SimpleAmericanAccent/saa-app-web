import React from "react";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

export default function SmartPracticeReplays() {
  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold text-center mb-8">
        Smart Practice Call Replays
      </h1>

      <div className="w-[800px] aspect-video mx-auto">
        <iframe
          src="https://www.loom.com/embed/4331ad9391924c219659dbbea578d9cd?sid=b5bd5864-0d86-4571-b88d-ce95b68c80e6"
          title="Some of My Favorite Accent Training Exercises"
          className="w-full h-full"
        ></iframe>
      </div>

      <div className="max-w-4xl mx-auto mt-8">
        <h3 className="text-xl font-semibold mb-4 text-center">
          Video Chapters
        </h3>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="font-mono text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded mr-3 mt-0.5">
                00:00
              </span>
              <span>Side-by-side comparison / contrastive listening</span>
            </li>
            <li className="flex items-start">
              <span className="font-mono text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded mr-3 mt-0.5">
                05:26
              </span>
              <span>Sort words into 2 columns / 2 categories</span>
            </li>
            <li className="flex items-start">
              <span className="font-mono text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded mr-3 mt-0.5">
                12:40
              </span>
              <span>
                Go slow to go fast. (Slow it down, break it down, & rebuild it)
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-mono text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded mr-3 mt-0.5">
                19:06
              </span>
              <span>
                Narrow focus to 1 phrase / 1 word / 1 sound and try to sound
                100% like native / like original audio
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-mono text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded mr-3 mt-0.5">
                23:47
              </span>
              <span>
                Do multiple passes through same audio, focusing on different
                aspects/layers (including "mumbling to the music" of their
                speech)
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-mono text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded mr-3 mt-0.5">
                31:52
              </span>
              <span>Improvise, situate, simulate</span>
            </li>
            <li className="flex items-start">
              <span className="font-mono text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded mr-3 mt-0.5">
                39:06
              </span>
              <span>Imitate random speech sounds / accents / languages</span>
            </li>
            <li className="flex items-start">
              <span className="font-mono text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded mr-3 mt-0.5">
                46:36
              </span>
              <span>
                Record yourself & listen... & compare vs target accent (repeat
                until you can't hear any differences)
              </span>
            </li>
          </ul>
        </div>
      </div>

      <h1 className="text-2xl font-bold mt-10">External Resources</h1>
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
