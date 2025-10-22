/**
 * Data structure for call replays and training videos
 * Single source of truth for video content
 */

import { categories } from "./categories.jsx";

export const replaysData = {
  videos: [
    {
      id: "vowels-2025-06-11",
      slug: "vowels-2025-06-11",
      title: "Vowels - June 11, 2025",
      category: "vowels",
      date: "2025-06-11",
      featured: true,
      description: "",
    },
    {
      id: "vowels-2025-01-08",
      slug: "vowels-2025-01-08",
      title: "Vowels - January 8, 2025",
      category: "vowels",
      date: "2025-01-08",
      featured: true,
      description: "",
    },
    {
      id: "consonants-2025-01-22",
      slug: "consonants-2025-01-22",
      title: "Consonants - January 22, 2025",
      category: "consonants",
      date: "2025-01-22",
      featured: true,
      description: "",
    },
    {
      id: "flow-2025-03-19",
      slug: "flow-2025-03-19",
      title: "Flow - March 19, 2025",
      category: "flow",
      date: "2025-03-19",
      featured: true,
      description: "",
    },
    {
      id: "smart-practice-2023-10-26",
      slug: "smart-practice-2023-10-26",
      title: "Smart Practice - October 26, 2023",
      category: "smart-practice",
      date: "2023-10-26",
      featured: true,
      description: "",
      chapters: [
        {
          time: "00:00",
          title: "Side-by-side comparison / contrastive listening",
        },
        { time: "05:26", title: "Sort words into 2 columns / 2 categories" },
        {
          time: "12:40",
          title:
            "Go slow to go fast. (Slow it down, break it down, & rebuild it)",
        },
        {
          time: "19:06",
          title:
            "Narrow focus to 1 phrase / 1 word / 1 sound and try to sound 100% like native / like original audio",
        },
        {
          time: "23:47",
          title:
            'Do multiple passes through same audio, focusing on different aspects/layers (including "mumbling to the music" of their speech)',
        },
        { time: "31:52", title: "Improvise, situate, simulate" },
        {
          time: "39:06",
          title: "Imitate random speech sounds / accents / languages",
        },
        {
          time: "46:36",
          title:
            "Record yourself & listen... & compare vs target accent (repeat until you can't hear any differences)",
        },
      ],
    },
    {
      id: "smart-practice-2022-07-13",
      slug: "smart-practice-2022-07-13",
      title: "Smart Practice - July 13, 2022",
      category: "smart-practice",
      date: "2022-07-13",
      featured: true,
      description: "How to use Audacity for accent training",
    },
  ],

  categories,
};
