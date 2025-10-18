/**
 * Centralized data structure for all replays content
 * Single source of truth for videos, categories, and external resources
 */

export const replaysData = {
  videos: [
    {
      id: "vowels-2025-06-11",
      slug: "vowels-2025-06-11",
      title: "Vowels Training - June 11, 2025",
      category: "vowels",
      date: "2025-06-11",
      featured: true,
      description:
        "Comprehensive vowel training session covering American English vowel sounds",
    },
    {
      id: "vowels-2025-01-08",
      slug: "vowels-2025-01-08",
      title: "Vowels Training - January 8, 2025",
      category: "vowels",
      date: "2025-01-08",
      featured: true,
      description: "Advanced vowel pronunciation techniques and exercises",
    },
    {
      id: "consonants-2025-01-22",
      slug: "consonants-2025-01-22",
      title: "Consonants Training - January 22, 2025",
      category: "consonants",
      date: "2025-01-22",
      featured: true,
      description: "Master American English consonant sounds and articulation",
    },
    {
      id: "flow-2025-03-19",
      slug: "flow-2025-03-19",
      title: "Flow Training - March 19, 2025",
      category: "flow",
      date: "2025-03-19",
      featured: true,
      description: "Improve speech rhythm, stress patterns, and natural flow",
    },
    {
      id: "smart-practice-2025",
      slug: "smart-practice-2025",
      title: "Some of My Favorite Accent Training Exercises",
      category: "smart-practice",
      date: "2025-01-01",
      featured: true,
      description:
        "Comprehensive guide to effective accent training techniques",
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
  ],

  categories: {
    vowels: {
      name: "Vowels",
      icon: "🎵",
      color: "blue",
      description: "American English vowel sounds and pronunciation",
    },
    consonants: {
      name: "Consonants",
      icon: "🔤",
      color: "green",
      description: "Consonant articulation and sound production",
    },
    flow: {
      name: "Flow",
      icon: "🌊",
      color: "purple",
      description: "Speech rhythm, stress patterns, and natural flow",
    },
    "smart-practice": {
      name: "Smart Practice",
      icon: "🧠",
      color: "orange",
      description: "Advanced training techniques and exercises",
    },
  },

  sharedResources: {
    "Practice phrases & words": [
      {
        url: "https://ecampusontario.pressbooks.pub/lexicalsets/chapter/1-kit-lexical-set/#phrases",
        name: "Lexical Sets for Actors",
        description: "Practice phrases & words for vowels.",
        category: "vowels",
      },
      {
        url: "https://www.home-speech-home.com/speech-therapy-word-lists.html#:~:text=Client%20Centered%20Products-,Articulation,-Each%20list%20of",
        name: "Home Speech Home",
        description: "Practice phrases & words for consonants.",
        category: "consonants",
      },
      {
        url: "https://chatgpt.com/?q=Can%20you%20please%20generate%205%20to%2010%20practice%20phrases%20for%20me%20to%20help%20me%20train%20my%20American%20accent%3F%20I%27ll%20supply%20you%20some%20words%20that%20I%20want%20you%20to%20make%20sure%20to%20include%20in%20the%20phrases.",
        name: "ChatGPT",
        description:
          'Use ChatGPT to generate your own practice phrases. I\'ve included a sample prompt for you to get started - click to try it out automatically. Try following up with "the this that these those"',
        category: "all",
      },
    ],
    "Search For Native Audio": [
      {
        url: "https://youglish.com/",
        name: "YouGlish",
        description: "Find words in context from real YouTube videos",
        category: "all",
      },
      {
        url: "https://forvo.com/",
        name: "Forvo",
        description: "Pronunciation dictionary with native speaker audio",
        category: "all",
      },
    ],
    "Software to help you practice/analyze accents": [
      {
        url: "https://www.youtube.com/",
        name: "YouTube",
        description:
          "Sometimes simple is best! Try using keyboard shortcuts to change speed and jump back and forth.",
        category: "all",
      },
      {
        url: "https://agrahn.gitlab.io/ABLoopPlayer/",
        name: "AB Loop Player",
        description:
          "Infinitely loop any section of any YouTube video, at any speed you want.",
        category: "all",
      },
      {
        url: "https://www.audacityteam.org/",
        name: "Audacity",
        description:
          "If you want to record your own voice / analyze audio more deeply.",
        category: "all",
        subLinks: [
          {
            url: "https://www.youtube.com/watch?v=MS3xQ1TBY8c/",
            name: "How to use Audacity for accent training",
            description:
              "Here's an old training I did on how to use Audacity for accent training.",
          },
        ],
      },
      {
        url: "https://www.fon.hum.uva.nl/praat/",
        name: "Praat",
        description:
          "The website might look outdated, but Praat is a powerful tool widely used in academic and professional accent analysis—perfect if you really want to dive deep.",
        category: "all",
      },
    ],
    "Accent training apps": [
      {
        url: "https://start.boldvoice.com/HVZQEF?d=R10&z=1",
        name: "BoldVoice",
        description: "(Free 7 day trial -> monthly/yearly subscription)",
        category: "all",
      },
    ],
  },
};
