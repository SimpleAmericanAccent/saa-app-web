/**
 * Data structure for external training resources and tools
 * Single source of truth for external links and resources
 */

import { categories } from "./categories.jsx";
import {
  BookOpen,
  Search,
  Mic,
  MessageSquare,
  Headphones,
  Play,
  FileText,
  Globe,
  Smartphone,
  Volume2,
  VolumeX,
  Type,
  Edit3,
  BarChart3,
  Settings,
  Zap,
  Target,
  Repeat,
  DollarSign,
  Gift,
  Clock,
  CreditCard,
  Gauge,
} from "lucide-react";

// Category taxonomy for different types of categorization
export const categoryTypes = {
  fundamentals: {
    name: "Fundamentals",
    description: "Core training pillars",
    categories: categories,
  },
  audio: {
    name: "Audio",
    description: "How audio is generated",
    categories: {
      native: {
        name: "Native Audio",
        icon: Mic,
        description: "Real human speech",
      },
      synthetic: {
        name: "Synthetic Audio",
        icon: Zap,
        description: "Generated or AI speech",
      },
    },
  },
  scope: {
    name: "Content Scope",
    description: "The scope and context of content",
    categories: {
      standalone: {
        name: "Standalone Words",
        icon: Target,
        description: "Individual words, phrases, or isolated content",
      },
      connected: {
        name: "Connected Speech",
        icon: Volume2,
        description: "Content in natural context or conversation",
      },
    },
  },
  text: {
    name: "Text",
    description: "How text content is sourced",
    categories: {
      native: {
        name: "Native Text",
        icon: Type,
        description: "Real native speaker text",
      },
      generated: {
        name: "Generated Text",
        icon: Edit3,
        description: "AI or programmatically generated",
      },
    },
  },
  functionality: {
    name: "Functionality",
    description: "What the tool does",
    categories: {
      playback: {
        name: "Playback Control",
        icon: Play,
        description: "Control audio playback for training",
      },
      analysis: {
        name: "Audio Analysis",
        icon: BarChart3,
        description: "Analyze audio beyond playback",
      },
      recording: {
        name: "Record Audio",
        icon: Mic,
        description: "Record audio",
      },
      reference: {
        name: "Reference Material",
        icon: BookOpen,
        description: "Educational content and guides",
      },
    },
  },
  discovery: {
    name: "Discovery",
    description: "How users find and access content",
    categories: {
      meta: {
        name: "Metadata Search",
        icon: Globe,
        description:
          "Search title, author, keywords, etc - likely not transcript-based.",
      },
      word: {
        name: "Word Search",
        icon: FileText,
        description: "Search for exact word(s)",
      },
      ai: {
        name: "AI Search",
        icon: Search,
        description: "AI-powered content understanding and search",
      },
      curated: {
        name: "Curated Collections",
        icon: BookOpen,
        description: "Pre-organized, curated content collections",
      },
      api: {
        name: "API/Programmatic",
        icon: Settings,
        description: "Programmatic access via APIs or structured data",
      },
    },
  },
  pricing: {
    name: "Pricing",
    description: "Cost and access model",
    categories: {
      free: {
        name: "Free",
        icon: Gift,
        description: "Completely free to use",
        color:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      },
      freemium: {
        name: "Free with Limits",
        icon: Gauge,
        description: "Free tier with usage limits",
        color:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      },
      trial: {
        name: "Free Trial",
        icon: Clock,
        description: "Free trial period, then paid",
        color:
          "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      },
      paid: {
        name: "Paid Only",
        icon: CreditCard,
        description: "Requires payment to use",
        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      },
    },
  },
};

export const resourcesData = {
  categories,
  categoryTypes,

  resources: [
    {
      id: "lexical-sets",
      url: "https://ecampusontario.pressbooks.pub/lexicalsets/chapter/1-kit-lexical-set/#phrases",
      name: "Lexical Sets for Actors",
      description: "Words & phrases for vowel practice.",
      section: "Practice phrases & words",
      icon: BookOpen,
      tags: {
        fundamentals: ["vowels"],
        functionality: ["reference"],
        discovery: ["curated"],
        text: ["native"],
        pricing: ["free"],
      },
      icons: [BookOpen, Target],
    },
    {
      id: "home-speech-home",
      url: "https://www.home-speech-home.com/speech-therapy-word-lists.html#:~:text=Client%20Centered%20Products-,Articulation,-Each%20list%20of",
      name: "Home Speech Home",
      description: "Words & phrases for consonant practice.",
      section: "Practice phrases & words",
      icon: BookOpen,
      tags: {
        fundamentals: ["consonants"],
        functionality: ["reference"],
        discovery: ["curated"],
        text: ["native"],
        pricing: ["free"],
      },
      icons: [Mic, Target],
    },
    {
      id: "chatgpt",
      url: "https://chatgpt.com/?q=Can%20you%20please%20generate%205%20to%2010%20practice%20phrases%20for%20me%20to%20help%20me%20train%20my%20American%20accent%3F%20I%27ll%20supply%20you%20some%20words%20that%20I%20want%20you%20to%20make%20sure%20to%20include%20in%20the%20phrases.",
      name: "ChatGPT",
      description: "Make your own practice phrases. Here's a prompt.",
      section: "Practice phrases & words",
      icon: MessageSquare,
      tags: {
        fundamentals: ["vowels", "consonants", "flow", "smart-practice"],
        text: ["generated"],
        functionality: ["reference"],
        discovery: ["ai"],
        pricing: ["freemium"],
      },
      icons: [MessageSquare, Edit3, Target],
    },
    {
      id: "youglish",
      url: "https://youglish.com/",
      name: "YouGlish",
      description: "Better YouTube search. Hear exactly when a word was said.",
      section: "Search For Native Audio",
      icon: Search,
      tags: {
        fundamentals: ["vowels", "consonants", "flow"],
        audio: ["native"],
        scope: ["connected"],
        functionality: ["playback"],
        discovery: ["word"],
        pricing: ["freemium"],
      },
      icons: [Headphones, Volume2, Mic, BookOpen],
    },
    {
      id: "forvo",
      url: "https://forvo.com/",
      name: "Forvo",
      description: "Crowdsourced native speaker audio.",
      section: "Search For Native Audio",
      icon: Search,
      tags: {
        fundamentals: ["vowels", "consonants"],
        audio: ["native"],
        scope: ["standalone"],
        functionality: ["playback"],
        discovery: ["word"],
        pricing: ["freemium"],
      },
      icons: [Headphones, Target, Mic, BookOpen],
    },
    {
      id: "playphrase.me",
      url: "https://www.playphrase.me/",
      name: "Playphrase.me",
      description: "Search movies & TV shows for phrases.",
      section: "Practice phrases & words",
      icon: Search,
      tags: {
        fundamentals: ["vowels", "consonants"],
        audio: ["native"],
        scope: ["connected"],
        functionality: ["playback"],
        discovery: ["word"],
        pricing: ["freemium"],
      },
      icons: [BookOpen, Target],
    },
    {
      id: "yarn",
      url: "https://getyarn.io/",
      name: "Yarn",
      description: "Search movies, TV, & music for phrases.",
      section: "Practice phrases & words",
      icon: Search,
      tags: {
        fundamentals: ["vowels", "consonants"],
        audio: ["native"],
        scope: ["connected"],
        functionality: ["playback"],
        discovery: ["word"],
        pricing: ["free"],
      },
      icons: [BookOpen, Target],
    },
    {
      id: "youtube",
      url: "https://www.youtube.com/",
      name: "YouTube",
      description:
        "Use keyboard shortcuts to change speed & jump back & forward.",
      section: "Software to help you practice/analyze accents",
      icon: Play,
      tags: {
        fundamentals: ["vowels", "consonants", "flow", "smart-practice"],
        audio: ["native"],
        scope: ["connected"],
        functionality: ["playback"],
        discovery: ["meta"],
        pricing: ["free"],
      },
      icons: [Play, Volume2, Mic, Play],
    },
    {
      id: "ab-loop-player",
      url: "https://agrahn.gitlab.io/ABLoopPlayer/",
      name: "AB Loop Player",
      description:
        "Infinitely loop any section of any YouTube video, at any speed you want.",
      section: "Software to help you practice/analyze accents",
      icon: Repeat,
      tags: {
        fundamentals: ["vowels", "consonants", "flow", "smart-practice"],
        scope: ["connected"],
        functionality: ["playback"],
        pricing: ["free"],
      },
      icons: [Play, Volume2, Mic, Play],
    },
    {
      id: "audacity",
      url: "https://www.audacityteam.org/",
      name: "Audacity",
      description: "Record, edit, and compare audios.",
      section: "Software to help you practice/analyze accents",
      icon: Mic,
      tags: {
        fundamentals: ["vowels", "consonants", "flow", "smart-practice"],
        functionality: ["playback", "analysis", "recording"],
        pricing: ["free"],
      },
      icons: [Mic, Volume2, Mic, BarChart3],
    },
    {
      id: "praat",
      url: "https://www.fon.hum.uva.nl/praat/",
      name: "Praat",
      description:
        "Powerful speech analysis. Old-school but industry standard.",
      section: "Software to help you practice/analyze accents",
      icon: BarChart3,
      tags: {
        fundamentals: ["vowels", "consonants", "flow", "smart-practice"],
        functionality: ["playback", "analysis", "recording"],
        pricing: ["free"],
      },
      icons: [Play, Volume2, Mic, BarChart3],
    },
    {
      id: "boldvoice",
      url: "https://start.boldvoice.com/HVZQEF?d=R10&z=1",
      name: "BoldVoice",
      description: "AI accent feedback. 7 day trial then paid subscription",
      section: "Accent training apps",
      icon: Smartphone,
      tags: {
        fundamentals: ["vowels", "consonants", "flow", "smart-practice"],
        audio: ["native"],
        scope: ["standalone", "connected"],
        functionality: ["reference", "recording"],
        discovery: ["curated"],
        pricing: ["trial"],
      },
      icons: [Smartphone, Volume2, Mic, Target],
    },
  ],
};
