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
} from "lucide-react";

export const resourcesData = {
  categories,

  resources: [
    {
      id: "lexical-sets",
      url: "https://ecampusontario.pressbooks.pub/lexicalsets/chapter/1-kit-lexical-set/#phrases",
      name: "Lexical Sets for Actors",
      description: "Practice phrases & words for vowels.",
      section: "Practice phrases & words",
      category: "vowels",
      icon: BookOpen,
    },
    {
      id: "home-speech-home",
      url: "https://www.home-speech-home.com/speech-therapy-word-lists.html#:~:text=Client%20Centered%20Products-,Articulation,-Each%20list%20of",
      name: "Home Speech Home",
      description: "Practice phrases & words for consonants.",
      section: "Practice phrases & words",
      category: "consonants",
      icon: Mic,
    },
    {
      id: "chatgpt",
      url: "https://chatgpt.com/?q=Can%20you%20please%20generate%205%20to%2010%20practice%20phrases%20for%20me%20to%20help%20me%20train%20my%20American%20accent%3F%20I%27ll%20supply%20you%20some%20words%20that%20I%20want%20you%20to%20make%20sure%20to%20include%20in%20the%20phrases.",
      name: "ChatGPT",
      description:
        'Use ChatGPT to generate your own practice phrases. I\'ve included a sample prompt for you to get started - click to try it out automatically. Try following up with "the this that these those"',
      section: "Practice phrases & words",
      category: "all",
      icon: MessageSquare,
    },
    {
      id: "youglish",
      url: "https://youglish.com/",
      name: "YouGlish",
      description: "Find words in context from real YouTube videos",
      section: "Search For Native Audio",
      category: "all",
      icon: Headphones,
    },
    {
      id: "forvo",
      url: "https://forvo.com/",
      name: "Forvo",
      description: "Pronunciation dictionary with native speaker audio",
      section: "Search For Native Audio",
      category: "all",
      icon: Headphones,
    },
    {
      id: "youtube",
      url: "https://youtube.com/",
      name: "YouTube",
      description:
        "Sometimes simple is best! Try using keyboard shortcuts to change speed and jump back and forth.",
      section: "Software to help you practice/analyze accents",
      category: "all",
      icon: Play,
    },
    {
      id: "ab-loop-player",
      url: "https://agrahn.gitlab.io/ABLoopPlayer/",
      name: "AB Loop Player",
      description:
        "Infinitely loop any section of any YouTube video, at any speed you want.",
      section: "Software to help you practice/analyze accents",
      category: "all",
      icon: Play,
    },
    {
      id: "audacity",
      url: "https://www.audacityteam.org/",
      name: "Audacity",
      description:
        "If you want to record your own voice / analyze audio more deeply.",
      section: "Software to help you practice/analyze accents",
      category: "all",
      icon: Mic,
    },
    {
      id: "praat",
      url: "https://www.fon.hum.uva.nl/praat/",
      name: "Praat",
      description:
        "The website might look outdated, but Praat is a powerful tool widely used in academic and professional accent analysis—perfect if you really want to dive deep.",
      section: "Software to help you practice/analyze accents",
      category: "all",
      icon: Play,
    },
    {
      id: "boldvoice",
      url: "https://start.boldvoice.com/HVZQEF?d=R10&z=1",
      name: "BoldVoice",
      description: "(Free 7 day trial -> monthly/yearly subscription)",
      section: "Accent training apps",
      category: "all",
      icon: Smartphone,
    },
  ],
};
