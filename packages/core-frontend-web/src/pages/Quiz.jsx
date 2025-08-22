import React, { useState, useRef, useEffect } from "react";
import { getQuizStats } from "../utils/quizStats";
import { useLocalStorage } from "../hooks/useLocalStorage";
import useAuthStore from "../stores/authStore";
import {
  getPerformanceLevel,
  getTextColorClass,
  getBorderColorClass,
  getPerformanceMessage,
  getPerformanceLevelName,
  getGradientNumberLineLegend,
  getGradientColorStyle,
  getGradientBorderStyle,
  getQuizCardTextProps,
} from "../utils/performanceColors";
import { Button } from "core-frontend-web/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "core-frontend-web/src/components/ui/card";
import { Progress } from "core-frontend-web/src/components/ui/progress";
import { Checkbox } from "core-frontend-web/src/components/ui/checkbox";
import { Play, Volume2, Loader2 } from "lucide-react";

// Quiz type IDs for easy reference
export const QUIZ_TYPE_IDS = {
  KIT_FLEECE: "kit_fleece",
  TRAP_DRESS: "trap_dress",
  BAN_DRESS: "ban_dress",
  FOOT_GOOSE: "foot_goose",
  STRUT_LOT: "strut_lot",
  DH_D: "dh_d",
  DARK_L_O: "dark_l_o",
  DARK_L_U: "dark_l_u",
  T_CH: "t_ch",
  S_Z: "s_z",
  M_N: "m_n",
  N_NG: "n_ng",
  M_NG: "m_ng",
  TH_T: "th_t",
  TH_F: "th_f",
  R_NULL: "r_null",
};

// Minimal pairs data for KIT vs FLEECE vowels (alphabetical by KIT word)
const kitFleeceMinimalPairs = [
  // Basic minimal pairs with alternates
  [
    { word: "bitch", alternates: [] },
    { word: "beach", alternates: ["beech"] },
  ],
  [
    { word: "bid", alternates: [] },
    { word: "bead", alternates: [] },
  ],
  [
    { word: "bin", alternates: ["been"] },
    { word: "bean", alternates: [] },
  ],
  // [
  //   { word: "biz", alternates: [] },
  //   { word: "bees", alternates: [] },
  // ],
  [
    { word: "bit", alternates: [] },
    { word: "beat", alternates: ["beet"] },
  ],
  // [
  //   { word: "sis", alternates: ["cis"] },
  //   { word: "cease", alternates: [] },
  // ],
  // [
  //   { word: "chip", alternates: [] },
  //   { word: "cheap", alternates: [] },
  // ],
  [
    { word: "chick", alternates: [] },
    { word: "cheek", alternates: [] },
  ],
  // [
  //   { word: "dill", alternates: [] },
  //   { word: "deal", alternates: [] },
  // ],
  // [
  //   { word: "dip", alternates: [] },
  //   { word: "deep", alternates: [] },
  // ],
  // [
  //   { word: "did", alternates: [] },
  //   { word: "deed", alternates: [] },
  // ],
  [
    { word: "itch", alternates: [] },
    { word: "each", alternates: [] },
  ],
  // [
  //   { word: "it", alternates: [] },
  //   { word: "eat", alternates: [] },
  // ],
  // [
  //   { word: "is", alternates: [] },
  //   { word: "ease", alternates: [] },
  // ],
  [
    { word: "ill", alternates: [] },
    { word: "eel", alternates: [] },
  ],
  [
    { word: "fit", alternates: [] },
    { word: "feet", alternates: ["feat"] },
  ],
  [
    { word: "fill", alternates: ["Phil"] },
    { word: "feel", alternates: [] },
  ],
  [
    { word: "fizz", alternates: [] },
    { word: "fees", alternates: [] },
  ],
  [
    { word: "grin", alternates: [] },
    { word: "green", alternates: [] },
  ],
  [
    { word: "hip", alternates: [] },
    { word: "heap", alternates: [] },
  ],
  [
    { word: "hit", alternates: [] },
    { word: "heat", alternates: [] },
  ],
  [
    { word: "hill", alternates: [] },
    { word: "heel", alternates: ["heal"] },
  ],
  // [
  //   { word: "his", alternates: [] },
  //   { word: "he's", alternates: [] },
  // ],
  // [
  //   { word: "gyp", alternates: [] },
  //   { word: "Jeep", alternates: [] },
  // ],
  // [
  //   { word: "kip", alternates: [] },
  //   { word: "keep", alternates: [] },
  // ],
  // [
  //   { word: "kid", alternates: [] },
  //   { word: "keyed", alternates: [] },
  // ],
  [
    { word: "lick", alternates: [] },
    { word: "leak", alternates: ["leek"] },
  ],
  [
    { word: "lip", alternates: [] },
    { word: "leap", alternates: [] },
  ],
  [
    { word: "live", alternates: [] },
    { word: "leave", alternates: [] },
  ],
  // [
  //   { word: "Liz", alternates: [] },
  //   { word: "Lee's", alternates: [] },
  // ],
  // [
  //   { word: "mill", alternates: ["mil"] },
  //   { word: "meal", alternates: [] },
  // ],
  // [
  //   { word: "min", alternates: [] },
  //   { word: "mean", alternates: [] },
  // ],
  // [
  //   { word: "mitt", alternates: [] },
  //   { word: "meet", alternates: ["meat"] },
  // ],
  [
    { word: "pitch", alternates: [] },
    { word: "peach", alternates: [] },
  ],
  // [
  //   { word: "pick", alternates: ["pic"] },
  //   { word: "peek", alternates: ["peak", "pique"] },
  // ],
  // [
  //   { word: "pill", alternates: [] },
  //   { word: "peel", alternates: [] },
  // ],
  // [
  //   { word: "pit", alternates: [] },
  //   { word: "Pete", alternates: ["peat"] },
  // ],
  // [
  //   { word: "piss", alternates: [] },
  //   { word: "piece", alternates: ["peace"] },
  // ],
  [
    { word: "rich", alternates: [] },
    { word: "reach", alternates: [] },
  ],
  // [
  //   { word: "rid", alternates: [] },
  //   { word: "read", alternates: ["reed"] },
  // ],
  // [
  //   { word: "riff", alternates: [] },
  //   { word: "reef", alternates: [] },
  // ],
  // [
  //   { word: "sill", alternates: [] },
  //   { word: "seal", alternates: [] },
  // ],
  [
    { word: "sit", alternates: [] },
    { word: "seat", alternates: [] },
  ],
  [
    { word: "sick", alternates: [] },
    { word: "seek", alternates: [] },
  ],
  [
    { word: "sin", alternates: [] },
    { word: "seen", alternates: ["scene"] },
  ],
  // [
  //   { word: "sim", alternates: [] },
  //   { word: "seem", alternates: ["seam"] },
  // ],
  [
    { word: "shit", alternates: [] },
    { word: "sheet", alternates: [] },
  ],
  // [
  //   { word: "shin", alternates: [] },
  //   { word: "sheen", alternates: [] },
  // ],
  [
    { word: "ship", alternates: [] },
    { word: "sheep", alternates: [] },
  ],
  [
    { word: "slip", alternates: [] },
    { word: "sleep", alternates: [] },
  ],
  [
    { word: "still", alternates: [] },
    { word: "steal", alternates: ["steel"] },
  ],
  // [
  //   { word: "Tim", alternates: [] },
  //   { word: "team", alternates: [] },
  // ],
  [
    { word: "tin", alternates: [] },
    { word: "teen", alternates: [] },
  ],
  // [
  //   { word: "win", alternates: [] },
  //   { word: "wean", alternates: [] },
  // ],
  // [
  //   { word: "wick", alternates: [] },
  //   { word: "week", alternates: ["weak"] },
  // ],
  [
    { word: "whip", alternates: [] },
    { word: "weep", alternates: [] },
  ],
  [
    { word: "wit", alternates: [] },
    { word: "wheat", alternates: [] },
  ],
  [
    { word: "will", alternates: [] },
    { word: "wheel", alternates: [] },
  ],
  // [
  //   { word: "wiz", alternates: [] },
  //   { word: "wheeze", alternates: [] },
  // ],
];

// Minimal pairs data for TRAP vs DRESS vowels (alphabetical by TRAP word)
const trapDressMinimalPairs = [
  // [
  //   { word: "ad", alternates: ["add"] },
  //   { word: "ed", alternates: ["Ed"] },
  // ],
  // [
  //   { word: "Al", alternates: [] },
  //   { word: "L", alternates: ["Elle"] },
  // ],
  // [
  //   { word: "ass", alternates: [] },
  //   { word: "S", alternates: [] },
  // ],
  [
    { word: "bad", alternates: [] },
    { word: "bed", alternates: [] },
  ],
  [
    { word: "bag", alternates: [] },
    { word: "beg", alternates: [] },
  ],
  [
    { word: "bat", alternates: [] },
    { word: "bet", alternates: [] },
  ],
  [
    { word: "dad", alternates: ["Dad"] },
    { word: "dead", alternates: [] },
  ],
  // [
  //   { word: "dab", alternates: [] },
  //   { word: "Deb", alternates: [] },
  // ],
  // [
  //   { word: "fad", alternates: [] },
  //   { word: "fed", alternates: [] },
  // ],
  [
    { word: "had", alternates: [] },
    { word: "head", alternates: [] },
  ],
  [
    { word: "knack", alternates: [] },
    { word: "neck", alternates: [] },
  ],
  [
    { word: "lad", alternates: [] },
    { word: "led", alternates: ["lead"] },
  ],
  [
    { word: "laughed", alternates: [] },
    { word: "left", alternates: [] },
  ],
  [
    { word: "mad", alternates: [] },
    { word: "med", alternates: [] },
  ],
  // [
  //   { word: "mag", alternates: [] },
  //   { word: "Meg", alternates: [] },
  // ],
  [
    { word: "mat", alternates: ["Matt"] },
    { word: "met", alternates: [] },
  ],
  // [
  //   { word: "pack", alternates: [] },
  //   { word: "peck", alternates: ["pec"] },
  // ],
  [
    { word: "rack", alternates: [] },
    { word: "wreck", alternates: [] },
  ],
  // [
  //   { word: "rad", alternates: [] },
  //   { word: "red", alternates: ["read"] },
  // ],
  // [
  //   { word: "rag", alternates: [] },
  //   { word: "reg", alternates: [] },
  // ],
  // [
  //   { word: "sad", alternates: [] },
  //   { word: "said", alternates: [] },
  // ],
  // [
  //   { word: "Sal", alternates: [] },
  //   { word: "sell", alternates: [] },
  // ],
  [
    { word: "sat", alternates: [] },
    { word: "set", alternates: [] },
  ],
  // [
  //   { word: "shall", alternates: [] },
  //   { word: "shell", alternates: [] },
  // ],
  // [
  //   { word: "tack", alternates: [] },
  //   { word: "tech", alternates: [] },
  // ],
  // [
  //   { word: "tad", alternates: [] },
  //   { word: "Ted", alternates: [] },
  // ],
];

// Minimal pairs data for BAN vs DRESS vowels (alphabetical by BAN word)
const banDressMinimalPairs = [
  [
    { word: "can", alternates: [] },
    { word: "Ken", alternates: [] },
  ],
  [
    { word: "Dan", alternates: [] },
    { word: "den", alternates: [] },
  ],
  // [
  //   { word: "Jan", alternates: [] },
  //   { word: "Jen", alternates: ["gen"] },
  // ],
  [
    { word: "land", alternates: [] },
    { word: "lend", alternates: [] },
  ],
  // [
  //   { word: "pan", alternates: [] },
  //   { word: "pen", alternates: [] },
  // ],
  // [
  //   { word: "rant", alternates: [] },
  //   { word: "rent", alternates: [] },
  // ],
  [
    { word: "sand", alternates: [] },
    { word: "send", alternates: [] },
  ],
  // [
  //   { word: "tan", alternates: [] },
  //   { word: "ten", alternates: [] },
  // ],
  // [
  //   { word: "than", alternates: [] },
  //   { word: "then", alternates: [] },
  // ],
  // [
  //   { word: "van", alternates: [] },
  //   { word: "Venn", alternates: [] },
  // ],
];

// Minimal pairs data for FOOT vs GOOSE vowels (alphabetical by FOOT word)
const footGooseMinimalPairs = [
  // [
  //   { word: "nook", alternates: [] },
  //   { word: "nuke", alternates: [] },
  // ],
  // [
  //   { word: "would", alternates: ["wood"] },
  //   { word: "wooed", alternates: [] },
  // ],
  // [
  //   { word: "stood", alternates: [] },
  //   { word: "stewed", alternates: [] },
  // ],
  // [
  //   { word: "cook", alternates: [] },
  //   { word: "kook", alternates: [] },
  // ],
  [
    { word: "soot", alternates: [] },
    { word: "suit", alternates: [] },
  ],
  // [
  //   { word: "who'd", alternates: [] },
  //   { word: "hood", alternates: [] },
  // ],

  // [
  //   { word: "could", alternates: [] },
  //   { word: "cooed", alternates: [] },
  // ],
  // [
  //   { word: "should", alternates: [] },
  //   { word: "shooed", alternates: [] },
  // ],
  // [
  //   { word: "look", alternates: [] },
  //   { word: "Luke", alternates: [] },
  // ],
];

// Minimal pairs data for STRUT vs LOT vowels (alphabetical by STRUT word)
const strutLotMinimalPairs = [
  // [
  //   { word: "bud", alternates: [] },
  //   { word: "bod", alternates: [] },
  // ],
  [
    { word: "bus", alternates: [] },
    { word: "boss", alternates: [] },
  ],
  [
    { word: "but", alternates: ["butt"] },
    { word: "bot", alternates: [] },
  ],
  // [
  //   { word: "cup", alternates: [] },
  //   { word: "cop", alternates: [] },
  // ],
  [
    { word: "cut", alternates: [] },
    { word: "cot", alternates: ["caught"] },
  ],
  [
    { word: "duck", alternates: [] },
    { word: "dock", alternates: [] },
  ],
  // [
  //   { word: "fun", alternates: [] },
  //   { word: "fawn", alternates: [] },
  // ],
  [
    { word: "hut", alternates: [] },
    { word: "hot", alternates: [] },
  ],
  [
    { word: "luck", alternates: [] },
    { word: "lock", alternates: [] },
  ],
  // [
  //   { word: "mud", alternates: [] },
  //   { word: "mod", alternates: [] },
  // ],
  [
    { word: "nut", alternates: [] },
    { word: "not", alternates: [] },
  ],
  // [
  //   { word: "run", alternates: [] },
  //   { word: "Ron", alternates: [] },
  // ],
  [
    { word: "shut", alternates: [] },
    { word: "shot", alternates: [] },
  ],
  [
    { word: "lunch", alternates: [] },
    { word: "launch", alternates: [] },
  ],
  // [
  //   { word: "done", alternates: [] },
  //   { word: "dawn", alternates: ["dawn"] },
  // ],
  [
    { word: "gun", alternates: [] },
    { word: "gone", alternates: [] },
  ],
  [
    { word: "none", alternates: ["nun"] },
    { word: "non", alternates: [] },
  ],
  // [
  //   { word: "pun", alternates: [] },
  //   { word: "pawn", alternates: [] },
  // ],
  [
    { word: "rung", alternates: [] },
    { word: "wrong", alternates: [] },
  ],
  [
    { word: "sung", alternates: [] },
    { word: "song", alternates: [] },
  ],
  // [
  //   { word: "son", alternates: ["sun"] },
  //   { word: "sawn", alternates: [] },
  // ],
];

// Minimal pairs data for DH vs D consonants (alphabetical by DH word)
const dhDMinimalPairs = [
  [
    { word: "bathe", alternates: [] },
    { word: "bade", alternates: [] },
  ],
  [
    { word: "breathe", alternates: [] },
    { word: "breed", alternates: [] },
  ],
  [
    { word: "lathe", alternates: [] },
    { word: "laid", alternates: [] },
  ],
  [
    { word: "loathe", alternates: [] },
    { word: "load", alternates: [] },
  ],
  // [
  //   { word: "mouth", alternates: [] },
  //   { word: "mouthed", alternates: [] },
  // ],
  [
    { word: "scythe", alternates: [] },
    { word: "sighed", alternates: [] },
  ],
  [
    { word: "seethe", alternates: [] },
    { word: "seed", alternates: [] },
  ],
  // [
  //   { word: "sheathe", alternates: [] },
  //   { word: "she'd", alternates: [] },
  // ],
  // [
  //   { word: "soothe", alternates: [] },
  //   { word: "sued", alternates: [] },
  // ],
  // [
  //   { word: "teethe", alternates: [] },
  //   { word: "teed", alternates: [] },
  // ],
  [
    { word: "they", alternates: [] },
    { word: "day", alternates: [] },
  ],
  // [
  //   { word: "this", alternates: [] },
  //   { word: "diss", alternates: [] },
  // ],
  [
    { word: "there", alternates: [] },
    { word: "dare", alternates: [] },
  ],
  [
    { word: "then", alternates: [] },
    { word: "den", alternates: [] },
  ],
  // [
  //   { word: "than", alternates: [] },
  //   { word: "Dan", alternates: [] },
  // ],

  [
    { word: "though", alternates: [] },
    { word: "dough", alternates: [] },
  ],
  // [
  //   { word: "thus", alternates: [] },
  //   { word: "does", alternates: [] },
  // ],
  [
    { word: "thy", alternates: [] },
    { word: "die", alternates: [] },
  ],
  // [
  //   { word: "wreath", alternates: [] },
  //   { word: "reed", alternates: [] },
  // ],
  [
    { word: "writhe", alternates: [] },
    { word: "ride", alternates: [] },
  ],
];

// Minimal pairs data for Dark L vs O (alphabetical by Dark L word)
const darkLOMinimalPairs = [
  // [
  //   { word: "eagle", alternates: [] },
  //   { word: "ego", alternates: [] },
  // ],
  // [
  //   { word: "natal", alternates: [] },
  //   { word: "NATO", alternates: [] },
  // ],
  // [
  //   { word: "jumble", alternates: [] },
  //   { word: "jumbo", alternates: [] },
  // ],
  [
    { word: "old", alternates: [] },
    { word: "owed", alternates: ["ode"] },
  ],
  // [
  //   { word: "cold", alternates: [] },
  //   { word: "code", alternates: [] },
  // ],
  // [
  //   { word: "mold", alternates: [] },
  //   { word: "mowed", alternates: [] },
  // ],
  // [
  //   { word: "sold", alternates: [] },
  //   { word: "sowed", alternates: ["sewed"] },
  // ],
  // [
  //   { word: "toll", alternates: [] },
  //   { word: "toe", alternates: ["tow"] },
  // ],
  // [
  //   { word: "told", alternates: [] },
  //   { word: "towed", alternates: ["toed"] },
  // ],
  [
    { word: "bolt", alternates: [] },
    { word: "boat", alternates: [] },
  ],
  // [
  //   { word: "colt", alternates: [] },
  //   { word: "coat", alternates: [] },
  // ],
  // [
  //   { word: "molt", alternates: [] },
  //   { word: "moat", alternates: [] },
  // ],
  // [
  //   { word: "volt", alternates: [] },
  //   { word: "vote", alternates: [] },
  // ],
  [
    { word: "bowl", alternates: ["bull"] },
    { word: "bow", alternates: ["Bo"] },
  ],
  // [
  //   { word: "coal", alternates: ["Cole", "cull"] },
  //   { word: "co", alternates: [] },
  // ],
  [
    { word: "dull", alternates: ["dole"] },
    { word: "dough", alternates: ["doe"] },
  ],
  [
    { word: "full", alternates: ["foal"] },
    { word: "foe", alternates: [] },
  ],
  [
    { word: "goal", alternates: ["gull"] },
    { word: "go", alternates: [] },
  ],
  // [
  //   { word: "whole", alternates: ["hole", "hull"] },
  //   { word: "hoe", alternates: ["ho"] },
  // ],
  // [
  //   { word: "joel", alternates: [] },
  //   { word: "Joe", alternates: [] },
  // ],
  // [
  //   { word: "lull", alternates: [] },
  //   { word: "low", alternates: ["lo"] },
  // ],
  [
    { word: "mole", alternates: ["mull"] },
    { word: "mow", alternates: ["Moe"] },
  ],
  [
    { word: "null", alternates: ["knoll"] },
    { word: "no", alternates: ["know"] },
  ],
  // [
  //   { word: "pull", alternates: ["poll"] },
  //   { word: "Poe", alternates: [] },
  // ],
  [
    { word: "roll", alternates: ["role"] },
    { word: "row", alternates: ["Roe"] },
  ],
  [
    { word: "soul", alternates: ["sole"] },
    { word: "so", alternates: ["sew", "sow"] },
  ],
  // [
  //   { word: "stole", alternates: [] },
  //   { word: "stow", alternates: [] },
  // ],
];

// Minimal pairs data for Dark L vs U (alphabetical by Dark L word)
const darkLUMinimalPairs = [
  // [
  //   { word: "tool", alternates: [] },
  //   { word: "too", alternates: [] },
  // ],
  // [
  //   { word: "bull", alternates: [] },
  //   { word: "boo", alternates: [] },
  // ],
  [
    { word: "dull", alternates: [] },
    { word: "do", alternates: ["due", "dew"] },
  ],
  [
    { word: "null", alternates: [] },
    { word: "new", alternates: ["knew"] },
  ],
  // [
  //   { word: "cool", alternates: [] },
  //   { word: "coo", alternates: [] },
  // ],
  [
    { word: "jewel", alternates: [] },
    { word: "Jew", alternates: [] },
  ],
  // [
  //   { word: "rule", alternates: [] },
  //   { word: "rue", alternates: [] },
  // ],
  // [
  //   { word: "stool", alternates: [] },
  //   { word: "stew", alternates: [] },
  // ],
  [
    { word: "wool", alternates: [] },
    { word: "woo", alternates: [] },
  ],
  // [
  //   { word: "yule", alternates: [] },
  //   { word: "you", alternates: [] },
  // ],
];

// Minimal pairs data for T vs CH (alphabetical by T word)
const tChMinimalPairs = [
  [
    { word: "too", alternates: ["two", "to"] },
    { word: "chew", alternates: ["choo"] },
  ],
  // [
  //   { word: "tea", alternates: ["T", "tee"] },
  //   { word: "chi", alternates: [] },
  // ],
  [
    { word: "tease", alternates: ["teas"] },
    { word: "cheese", alternates: [] },
  ],
  // [
  //   { word: "tear", alternates: [] },
  //   { word: "cheer", alternates: [] },
  // ],
  // [
  //   { word: "teach", alternates: [] },
  //   { word: "Cheech", alternates: [] },
  // ],
  // [
  //   { word: "teak", alternates: [] },
  //   { word: "cheek", alternates: [] },
  // ],
  // [
  //   { word: "twos", alternates: [] },
  //   { word: "choose", alternates: ["chews"] },
  // ],
  [
    { word: "bat", alternates: [] },
    { word: "batch", alternates: [] },
  ],
  [
    { word: "bit", alternates: [] },
    { word: "bitch", alternates: [] },
  ],
  [
    { word: "eat", alternates: [] },
    { word: "each", alternates: [] },
  ],
  // [
  //   { word: "hat", alternates: [] },
  //   { word: "hatch", alternates: [] },
  // ],
  [
    { word: "hit", alternates: [] },
    { word: "hitch", alternates: [] },
  ],
  [
    { word: "it", alternates: [] },
    { word: "itch", alternates: [] },
  ],
  [
    { word: "mat", alternates: ["Matt"] },
    { word: "match", alternates: [] },
  ],
  // [
  //   { word: "not", alternates: ["knot"] },
  //   { word: "notch", alternates: [] },
  // ],
  [
    { word: "pat", alternates: [] },
    { word: "patch", alternates: [] },
  ],
  // [
  //   { word: "pit", alternates: [] },
  //   { word: "pitch", alternates: [] },
  // ],
];

// Minimal pairs data for S vs Z (alphabetical by S word)
const sZMinimalPairs = [
  // [
  //   { word: "ace", alternates: [] },
  //   { word: "A's", alternates: [] },
  // ],
  [
    { word: "advice", alternates: [] },
    { word: "advise", alternates: [] },
  ],
  [
    { word: "ass", alternates: [] },
    { word: "as", alternates: [] },
  ],
  // [
  //   { word: "base", alternates: [] },
  //   { word: "bays", alternates: [] },
  // ],
  [
    { word: "bus", alternates: [] },
    { word: "buzz", alternates: [] },
  ],
  [
    { word: "cease", alternates: [] },
    { word: "seize", alternates: [] },
  ],
  [
    { word: "device", alternates: [] },
    { word: "devise", alternates: [] },
  ],
  [
    { word: "dice", alternates: [] },
    { word: "dies", alternates: [] },
  ],
  // [
  //   { word: "face", alternates: [] },
  //   { word: "phase", alternates: [] },
  // ],
  // [
  //   { word: "fleece", alternates: [] },
  //   { word: "fleas", alternates: [] },
  // ],
  // [
  //   { word: "force", alternates: [] },
  //   { word: "fours", alternates: [] },
  // ],
  [
    { word: "grace", alternates: [] },
    { word: "graze", alternates: [] },
  ],
  [
    { word: "gross", alternates: [] },
    { word: "grows", alternates: [] },
  ],
  [
    { word: "ice", alternates: [] },
    { word: "eyes", alternates: [] },
  ],
  [
    { word: "lace", alternates: [] },
    { word: "lays", alternates: [] },
  ],
  [
    { word: "loose", alternates: [] },
    { word: "lose", alternates: [] },
  ],
  [
    { word: "mace", alternates: [] },
    { word: "maze", alternates: [] },
  ],
  // [
  //   { word: "pace", alternates: [] },
  //   { word: "pays", alternates: [] },
  // ],
  // [
  //   { word: "peace", alternates: ["piece"] },
  //   { word: "peas", alternates: ["pees"] },
  // ],
  [
    { word: "place", alternates: [] },
    { word: "plays", alternates: [] },
  ],
  [
    { word: "price", alternates: [] },
    { word: "prize", alternates: [] },
  ],
  [
    { word: "race", alternates: [] },
    { word: "raise", alternates: ["rays"] },
  ],
  [
    { word: "rice", alternates: [] },
    { word: "rise", alternates: ["ryes"] },
  ],
  // [
  //   { word: "sauce", alternates: [] },
  //   { word: "saws", alternates: [] },
  // ],
  // [
  //   { word: "source", alternates: [] },
  //   { word: "sores", alternates: ["soars"] },
  // ],
  // [
  //   { word: "spice", alternates: [] },
  //   { word: "spies", alternates: [] },
  // ],
  // [
  //   { word: "trace", alternates: [] },
  //   { word: "trays", alternates: [] },
  // ],
  // [
  //   { word: "vice", alternates: [] },
  //   { word: "vies", alternates: [] },
  // ],
];

// Minimal pairs data for M vs N (alphabetical by M word)
const mNMinimalPairs = [
  [
    { word: "beam", alternates: [] },
    { word: "bean", alternates: [] },
  ],
  [
    { word: "dim", alternates: [] },
    { word: "din", alternates: [] },
  ],
  // [
  //   { word: "dime", alternates: [] },
  //   { word: "dine", alternates: [] },
  // ],
  [
    { word: "game", alternates: [] },
    { word: "gain", alternates: [] },
  ],
  [
    { word: "hem", alternates: [] },
    { word: "hen", alternates: [] },
  ],
  // [
  //   { word: "lame", alternates: [] },
  //   { word: "lane", alternates: [] },
  // ],
  // [
  //   { word: "limb", alternates: [] },
  //   { word: "Lynn", alternates: [] },
  // ],
  // [
  //   { word: "lime", alternates: [] },
  //   { word: "line", alternates: [] },
  // ],
  [
    { word: "ram", alternates: [] },
    { word: "ran", alternates: [] },
  ],
  // [
  //   { word: "same", alternates: [] },
  //   { word: "sane", alternates: [] },
  // ],
  [
    { word: "seem", alternates: ["seam"] },
    { word: "seen", alternates: ["scene"] },
  ],
  // [
  //   { word: "sim", alternates: [] },
  //   { word: "sin", alternates: [] },
  // ],
  [
    { word: "sum", alternates: ["some"] },
    { word: "sun", alternates: ["son"] },
  ],
  [
    { word: "team", alternates: [] },
    { word: "teen", alternates: [] },
  ],
  // [
  //   { word: "M", alternates: ["Em"] },
  //   { word: "N", alternates: [] },
  // ],
  [
    { word: "gum", alternates: [] },
    { word: "gun", alternates: [] },
  ],
  // [
  //   { word: "ohm", alternates: [] },
  //   { word: "own", alternates: [] },
  // ],
  [
    { word: "foam", alternates: [] },
    { word: "phone", alternates: [] },
  ],
  [
    { word: "them", alternates: [] },
    { word: "then", alternates: [] },
  ],
];

// Minimal pairs data for N vs NG (alphabetical by N word)
const nNgMinimalPairs = [
  // [
  //   { word: "bin", alternates: ["been"] },
  //   { word: "bing", alternates: [] },
  // ],
  // [
  //   { word: "din", alternates: [] },
  //   { word: "ding", alternates: [] },
  // ],
  [
    { word: "kin", alternates: [] },
    { word: "king", alternates: [] },
  ],
  // [
  //   { word: "pin", alternates: [] },
  //   { word: "ping", alternates: [] },
  // ],
  [
    { word: "sin", alternates: [] },
    { word: "sing", alternates: [] },
  ],
  [
    { word: "thin", alternates: [] },
    { word: "thing", alternates: [] },
  ],
  [
    { word: "win", alternates: [] },
    { word: "wing", alternates: [] },
  ],
  // [
  //   { word: "talkin", alternates: [] },
  //   { word: "talking", alternates: [] },
  // ],
  // [
  //   { word: "walkin", alternates: [] },
  //   { word: "walking", alternates: [] },
  // ],
];

// Minimal pairs data for M vs NG (alphabetical by M word)
const mNgMinimalPairs = [
  // [
  //   { word: "dim", alternates: [] },
  //   { word: "ding", alternates: [] },
  // ],
  // [
  //   { word: "game", alternates: [] },
  //   { word: "gang", alternates: [] },
  // ],
  [
    { word: "hem", alternates: [] },
    { word: "hang", alternates: [] },
  ],
  // [
  //   { word: "lame", alternates: [] },
  //   { word: "laying", alternates: [] },
  // ],
  // [
  //   { word: "limb", alternates: [] },
  //   { word: "ling", alternates: [] },
  // ],
  [
    { word: "same", alternates: [] },
    { word: "saying", alternates: [] },
  ],
  // [
  //   { word: "sim", alternates: [] },
  //   { word: "sing", alternates: [] },
  // ],
  [
    { word: "sum", alternates: ["some"] },
    { word: "sung", alternates: [] },
  ],
  [
    { word: "rim", alternates: [] },
    { word: "ring", alternates: [] },
  ],
  // [
  //   { word: "whim", alternates: [] },
  //   { word: "wing", alternates: [] },
  // ],
  // [
  //   { word: "whim", alternates: [] },
  //   { word: "whin", alternates: [] },
  // ],
  // [
  //   { word: "bomb", alternates: [] },
  //   { word: "bong", alternates: [] },
  // ],
  // [
  //   { word: "calm", alternates: [] },
  //   { word: "Kong", alternates: [] },
  // ],
  // [
  //   { word: "palm", alternates: [] },
  //   { word: "pong", alternates: [] },
  // ],
  // [
  //   { word: "ROM", alternates: [] },
  //   { word: "wrong", alternates: [] },
  // ],
  // [
  //   { word: "psalm", alternates: [] },
  //   { word: "song", alternates: [] },
  // ],
];

// Minimal pairs data for TH vs T (alphabetical by TH word)
const thTMinimalPairs = [
  // [
  //   { word: "thank", alternates: [] },
  //   { word: "tank", alternates: [] },
  // ],
  [
    { word: "theme", alternates: [] },
    { word: "team", alternates: [] },
  ],
  // [
  //   { word: "thick", alternates: [] },
  //   { word: "tick", alternates: [] },
  // ],
  [
    { word: "thigh", alternates: [] },
    { word: "tie", alternates: [] },
  ],
  [
    { word: "thin", alternates: [] },
    { word: "tin", alternates: [] },
  ],
  // [
  //   { word: "thinker", alternates: [] },
  //   { word: "tinker", alternates: [] },
  // ],
  // [
  //   { word: "third", alternates: [] },
  //   { word: "turd", alternates: [] },
  // ],
  // [
  //   { word: "thong", alternates: [] },
  //   { word: "tong", alternates: [] },
  // ],
  [
    { word: "thorn", alternates: [] },
    { word: "torn", alternates: [] },
  ],
  [
    { word: "three", alternates: [] },
    { word: "tree", alternates: [] },
  ],
  [
    { word: "through", alternates: ["threw"] },
    { word: "true", alternates: [] },
  ],
];

// Minimal pairs data for TH vs F (alphabetical by TH word)
const thFMinimalPairs = [
  // [
  //   { word: "thin", alternates: [] },
  //   { word: "fin", alternates: [] },
  // ],
  [
    { word: "thirst", alternates: [] },
    { word: "first", alternates: [] },
  ],
  [
    { word: "three", alternates: [] },
    { word: "free", alternates: [] },
  ],
  // [
  //   { word: "with", alternates: [] },
  //   { word: "whiff", alternates: [] },
  // ],
  [
    { word: "death", alternates: [] },
    { word: "deaf", alternates: [] },
  ],
];

// Minimal pairs data for R vs null (alphabetical by R word)
const rNullMinimalPairs = [
  // [
  //   { word: "are", alternates: [] },
  //   { word: "ah", alternates: [] },
  // ],
  // [
  //   { word: "art", alternates: [] },
  //   { word: "ought", alternates: ["aught"] },
  // ],
  [
    { word: "card", alternates: [] },
    { word: "cod", alternates: [] },
  ],
  [
    { word: "cart", alternates: [] },
    { word: "caught", alternates: ["cot"] },
  ],
  [
    { word: "fear", alternates: [] },
    { word: "fee", alternates: [] },
  ],
  [
    { word: "here", alternates: [] },
    { word: "he", alternates: [] },
  ],
  [
    { word: "more", alternates: ["moor"] },
    { word: "mow", alternates: ["Moe"] },
  ],
  [
    { word: "near", alternates: [] },
    { word: "knee", alternates: [] },
  ],
  [
    { word: "or", alternates: [] },
    { word: "owe", alternates: [] },
  ],
  // [
  //   { word: "word", alternates: [] },
  //   { word: "wood", alternates: [] },
  // ],
  [
    { word: "heard", alternates: [] },
    { word: "hood", alternates: [] },
  ],
];

// Function to process minimal pairs data into quiz format
const processMinimalPairsData = (pairsData) => {
  return pairsData
    .map(([sound1Data, sound2Data]) => [
      {
        word: sound1Data.word,
        options: [sound1Data.word, sound2Data.word],
        soundType: "SOUND1",
        alternates: sound1Data.alternates,
      },
      {
        word: sound2Data.word,
        options: [sound1Data.word, sound2Data.word],
        soundType: "SOUND2",
        alternates: sound2Data.alternates,
      },
    ])
    .flat();
};

// Quiz data mapping
export const QUIZ_DATA = {
  [QUIZ_TYPE_IDS.KIT_FLEECE]: {
    id: QUIZ_TYPE_IDS.KIT_FLEECE,
    name: "KIT vs FLEECE",
    title: "KIT vs FLEECE Minimal Pairs Quiz",
    description: "sick vs seek",
    pairs: processMinimalPairsData(kitFleeceMinimalPairs),
    sound1Name: "KIT",
    sound2Name: "FLEECE",
    sound1Symbol: "[ɪ]",
    sound2Symbol: "[i]",
  },
  [QUIZ_TYPE_IDS.TRAP_DRESS]: {
    id: QUIZ_TYPE_IDS.TRAP_DRESS,
    name: "TRAP vs DRESS",
    title: "TRAP vs DRESS Minimal Pairs Quiz",
    description: "bad vs bed",
    pairs: processMinimalPairsData(trapDressMinimalPairs),
    sound1Name: "TRAP",
    sound2Name: "DRESS",
    sound1Symbol: "[æ]",
    sound2Symbol: "[ɛ]",
  },
  [QUIZ_TYPE_IDS.BAN_DRESS]: {
    id: QUIZ_TYPE_IDS.BAN_DRESS,
    name: "BAN vs DRESS",
    title: "BAN vs DRESS Minimal Pairs Quiz",
    description: "tan vs ten",
    pairs: processMinimalPairsData(banDressMinimalPairs),
    sound1Name: "BAN",
    sound2Name: "DRESS",
    sound1Symbol: "[eə̯]",
    sound2Symbol: "[ɛ]",
  },
  [QUIZ_TYPE_IDS.FOOT_GOOSE]: {
    id: QUIZ_TYPE_IDS.FOOT_GOOSE,
    name: "FOOT vs GOOSE",
    title: "FOOT vs GOOSE Minimal Pairs Quiz",
    description: "look vs Luke",
    pairs: processMinimalPairsData(footGooseMinimalPairs),
    sound1Name: "FOOT",
    sound2Name: "GOOSE",
    sound1Symbol: "[ʊ]",
    sound2Symbol: "[ɨ̯u]",
  },
  [QUIZ_TYPE_IDS.STRUT_LOT]: {
    id: QUIZ_TYPE_IDS.STRUT_LOT,
    name: "STRUT vs LOT",
    title: "STRUT vs LOT Minimal Pairs Quiz",
    description: "luck vs lock",
    pairs: processMinimalPairsData(strutLotMinimalPairs),
    sound1Name: "STRUT",
    sound2Name: "LOT",
    sound1Symbol: "[ʌ̟]",
    sound2Symbol: "[ɑ]",
  },
  [QUIZ_TYPE_IDS.T_CH]: {
    id: QUIZ_TYPE_IDS.T_CH,
    name: "T vs CH",
    title: "T vs CH Minimal Pairs Quiz",
    description: "too vs choo",
    pairs: processMinimalPairsData(tChMinimalPairs),
    sound1Name: "T",
    sound2Name: "CH",
    sound1Symbol: "[t]",
    sound2Symbol: "[tʃ]",
  },
  [QUIZ_TYPE_IDS.DH_D]: {
    id: QUIZ_TYPE_IDS.DH_D,
    name: "DH vs D",
    title: "DH vs D Minimal Pairs Quiz",
    description: "they vs day",
    pairs: processMinimalPairsData(dhDMinimalPairs),
    sound1Name: "DH",
    sound2Name: "D",
    sound1Symbol: "[ð]",
    sound2Symbol: "[d]",
  },
  [QUIZ_TYPE_IDS.DARK_L_O]: {
    id: QUIZ_TYPE_IDS.DARK_L_O,
    name: "Dark L vs O",
    title: "Dark L vs O Minimal Pairs Quiz",
    description: "cold vs code",
    pairs: processMinimalPairsData(darkLOMinimalPairs),
    sound1Name: "Dark L",
    sound2Name: "O",
    sound1Symbol: "[ɫ]",
    sound2Symbol: "[o]/[ʌʊ̯]",
  },
  [QUIZ_TYPE_IDS.DARK_L_U]: {
    id: QUIZ_TYPE_IDS.DARK_L_U,
    name: "Dark L vs U",
    title: "Dark L vs U Minimal Pairs Quiz",
    description: "tool vs too",
    pairs: processMinimalPairsData(darkLUMinimalPairs),
    sound1Name: "Dark L",
    sound2Name: "U",
    sound1Symbol: "[ɫ]",
    sound2Symbol: "[u]/[ɨ̯u]",
  },
  [QUIZ_TYPE_IDS.R_NULL]: {
    id: QUIZ_TYPE_IDS.R_NULL,
    name: "R vs null",
    title: "R vs null Minimal Pairs Quiz",
    description: "here vs he",
    pairs: processMinimalPairsData(rNullMinimalPairs),
    sound1Name: "R",
    sound2Name: "null",
    sound1Symbol: "[ɹ]",
    sound2Symbol: "[∅]",
  },
  [QUIZ_TYPE_IDS.S_Z]: {
    id: QUIZ_TYPE_IDS.S_Z,
    name: "S vs Z",
    title: "S vs Z Minimal Pairs Quiz",
    description: "ice vs eyes",
    pairs: processMinimalPairsData(sZMinimalPairs),
    sound1Name: "S",
    sound2Name: "Z",
    sound1Symbol: "[s]",
    sound2Symbol: "[z]",
  },
  [QUIZ_TYPE_IDS.M_N]: {
    id: QUIZ_TYPE_IDS.M_N,
    name: "M vs N",
    title: "M vs N Minimal Pairs Quiz",
    description: "sim vs sin",
    pairs: processMinimalPairsData(mNMinimalPairs),
    sound1Name: "M",
    sound2Name: "N",
    sound1Symbol: "[m]",
    sound2Symbol: "[n]",
  },
  [QUIZ_TYPE_IDS.N_NG]: {
    id: QUIZ_TYPE_IDS.N_NG,
    name: "N vs NG",
    title: "N vs NG Minimal Pairs Quiz",
    description: "sin vs sing",
    pairs: processMinimalPairsData(nNgMinimalPairs),
    sound1Name: "N",
    sound2Name: "NG",
    sound1Symbol: "[n]",
    sound2Symbol: "[ŋ]",
  },
  [QUIZ_TYPE_IDS.M_NG]: {
    id: QUIZ_TYPE_IDS.M_NG,
    name: "M vs NG",
    title: "M vs NG Minimal Pairs Quiz",
    description: "sim vs sing",
    pairs: processMinimalPairsData(mNgMinimalPairs),
    sound1Name: "M",
    sound2Name: "NG",
    sound1Symbol: "[m]",
    sound2Symbol: "[ŋ]",
  },
  [QUIZ_TYPE_IDS.TH_T]: {
    id: QUIZ_TYPE_IDS.TH_T,
    name: "TH vs T",
    title: "TH vs T Minimal Pairs Quiz",
    description: "thigh vs tie",
    pairs: processMinimalPairsData(thTMinimalPairs),
    sound1Name: "TH",
    sound2Name: "T",
    sound1Symbol: "[θ]",
    sound2Symbol: "[t]",
  },
  [QUIZ_TYPE_IDS.TH_F]: {
    id: QUIZ_TYPE_IDS.TH_F,
    name: "TH vs F",
    title: "TH vs F Minimal Pairs Quiz",
    description: "thin vs fin",
    pairs: processMinimalPairsData(thFMinimalPairs),
    sound1Name: "TH",
    sound2Name: "F",
    sound1Symbol: "[θ]",
    sound2Symbol: "[f]",
  },
};

// Word metadata dictionary
const wordMetadata = {
  // FLEECE words
  beat: {
    frequency: 0.0001, // Relative frequency (0-1)
    syllables: 1,
    offensive: false,
    phonemes: ["b", "iː", "t"],
    neighboringPhonemes: ["b", "t"],
    difficulty: "easy",
  },
  meet: {
    frequency: 0.0002,
    syllables: 1,
    offensive: false,
    phonemes: ["m", "iː", "t"],
    neighboringPhonemes: ["m", "t"],
    difficulty: "easy",
  },
  feel: {
    frequency: 0.0003,
    syllables: 1,
    offensive: false,
    phonemes: ["f", "iː", "l"],
    neighboringPhonemes: ["f", "l"],
    difficulty: "easy",
  },

  // KIT words
  bit: {
    frequency: 0.0001,
    syllables: 1,
    offensive: false,
    phonemes: ["b", "ɪ", "t"],
    neighboringPhonemes: ["b", "t"],
    difficulty: "easy",
  },
  mitt: {
    frequency: 0.00005,
    syllables: 1,
    offensive: false,
    phonemes: ["m", "ɪ", "t"],
    neighboringPhonemes: ["m", "t"],
    difficulty: "medium",
  },
  fill: {
    frequency: 0.0002,
    syllables: 1,
    offensive: false,
    phonemes: ["f", "ɪ", "l"],
    neighboringPhonemes: ["f", "l"],
    difficulty: "easy",
  },

  // Add more words as needed...
};

// Helper function to get word metadata
const getWordMetadata = (word) => {
  return (
    wordMetadata[word] || {
      frequency: 0,
      syllables: 1,
      offensive: false,
      phonemes: [],
      neighboringPhonemes: [],
      difficulty: "unknown",
    }
  );
};

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function Quiz() {
  const [quizSettings, setQuizSettings] = useState({
    numberOfQuestions: 10,
    autoPlayAudio: true,
    showSoundSymbols: true,
  });

  // Load previous quiz results from localStorage using custom hook
  const [previousResults, setPreviousResults] = useLocalStorage(
    "quizResults",
    {}
  );

  // Save quiz result to localStorage
  const saveQuizResult = (quizTypeId, score, totalQuestions) => {
    const percentage = Math.round((score / totalQuestions) * 100);
    const newResults = {
      ...previousResults,
      [quizTypeId]: {
        score,
        totalQuestions,
        percentage,
        timestamp: Date.now(),
      },
    };
    setPreviousResults(newResults);
  };

  const [selectedQuizType, setSelectedQuizType] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [playingSource, setPlayingSource] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrls, setAudioUrls] = useState({
    dictionary: null,
  });
  const [nextAudioUrls, setNextAudioUrls] = useState({
    dictionary: null,
  });
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState("category"); // "category", "quizType", "settings", "quiz"
  const [selectedCategory, setSelectedCategory] = useState(null); // "vowels", "consonants"
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const audioRef = useRef(null);

  // Save result when quiz is completed
  useEffect(() => {
    if (showResults && selectedQuizType && shuffledQuestions.length > 0) {
      saveQuizResult(selectedQuizType, score, shuffledQuestions.length);
    }
  }, [showResults, selectedQuizType, score, shuffledQuestions.length]);

  // Get current quiz data
  const currentQuizData = selectedQuizType ? QUIZ_DATA[selectedQuizType] : null;

  // Get quiz statistics using utility function
  const quizStats = getQuizStats();
  const vowelsAverage = quizStats.vowels.average;
  const consonantsAverage = quizStats.consonants.average;
  const vowelsCompletion = quizStats.vowels.completion;
  const consonantsCompletion = quizStats.consonants.completion;

  // Initialize shuffled questions when quiz type is selected
  useEffect(() => {
    if (selectedQuizType && currentQuizData) {
      const allQuestions = shuffleArray(currentQuizData.pairs);
      // Limit questions based on settings
      const limitedQuestions =
        quizSettings.numberOfQuestions === "all"
          ? allQuestions
          : allQuestions.slice(0, quizSettings.numberOfQuestions);
      setShuffledQuestions(limitedQuestions);

      // Preload audio for the second question if available
      if (limitedQuestions.length > 1) {
        const secondQuestion = limitedQuestions[1];
        preloadNextAudio(secondQuestion.word);
      }
    }
  }, [selectedQuizType, currentQuizData, quizSettings.numberOfQuestions]);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const progress =
    ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;

  // Function to get US audio from Free Dictionary API
  const getDictionaryAudio = async (word) => {
    if (!word) return null;

    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
      const data = await response.json();

      if (
        data &&
        data[0] &&
        data[0].phonetics &&
        data[0].phonetics.length > 0
      ) {
        // Look for US audio specifically - check for various US audio patterns
        const usPhonetic = data[0].phonetics.find(
          (p) =>
            p.audio &&
            (p.audio.includes("-us.") ||
              p.audio.includes("-us-") ||
              p.audio.includes("/us/"))
        );

        // Only return US audio, no fallback
        if (usPhonetic && usPhonetic.audio) {
          return usPhonetic.audio;
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching dictionary audio:", error);
      return null;
    }
  };

  // Function to get all audio sources for a word
  const getAudioForWord = async (word) => {
    if (!word) return;

    setIsLoading(true);
    try {
      const dictionaryAudio = await getDictionaryAudio(word);

      const newAudioUrls = {
        dictionary: dictionaryAudio,
      };

      setAudioUrls(newAudioUrls);

      // Log audio availability for admin users
      const { isAdmin } = useAuthStore.getState();
      if (isAdmin && selectedQuizType) {
        const audioStatus = {
          word,
          quizType: selectedQuizType,
          hasAudio: !!dictionaryAudio,
          audioUrl: dictionaryAudio || null,
          timestamp: new Date().toISOString(),
        };

        // Get existing audio logs
        const existingLogs = JSON.parse(
          localStorage.getItem("quizAudioLogs") || "{}"
        );
        if (!existingLogs[selectedQuizType]) {
          existingLogs[selectedQuizType] = {};
        }
        existingLogs[selectedQuizType][word] = audioStatus;
        localStorage.setItem("quizAudioLogs", JSON.stringify(existingLogs));
      }

      // Auto-play immediately if conditions are met
      if (
        hasUserInteracted &&
        quizSettings.autoPlayAudio &&
        !hasAutoPlayed &&
        !playingSource &&
        dictionaryAudio
      ) {
        setHasAutoPlayed(true);
        playAudio("dictionary");
      }
    } catch (error) {
      console.error("Error fetching audio:", error);
      setAudioUrls({ dictionary: null });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to preload audio for the next question
  const preloadNextAudio = async (word) => {
    if (!word) return;

    try {
      const dictionaryAudio = await getDictionaryAudio(word);

      setNextAudioUrls({
        dictionary: dictionaryAudio,
      });

      // Log audio availability for admin users (for preloaded audio)
      const { isAdmin } = useAuthStore.getState();
      if (isAdmin && selectedQuizType) {
        const audioStatus = {
          word,
          quizType: selectedQuizType,
          hasAudio: !!dictionaryAudio,
          timestamp: new Date().toISOString(),
        };

        // Get existing audio logs
        const existingLogs = JSON.parse(
          localStorage.getItem("quizAudioLogs") || "{}"
        );
        if (!existingLogs[selectedQuizType]) {
          existingLogs[selectedQuizType] = {};
        }
        existingLogs[selectedQuizType][word] = audioStatus;
        localStorage.setItem("quizAudioLogs", JSON.stringify(existingLogs));
      }
    } catch (error) {
      console.error("Error preloading audio:", error);
      setNextAudioUrls({ dictionary: null });
    }
  };

  // Load audio when question changes
  useEffect(() => {
    if (currentQuestion) {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingSource(null);
      setHasAutoPlayed(false); // Reset auto-play flag

      // Load current question audio
      setAudioUrls({ dictionary: null });
      getAudioForWord(currentQuestion.word);

      // Preload next question audio if available
      const nextQuestionIndex = currentQuestionIndex + 1;
      if (nextQuestionIndex < shuffledQuestions.length) {
        const nextQuestion = shuffledQuestions[nextQuestionIndex];
        preloadNextAudio(nextQuestion.word);
      } else {
        // Clear next audio if this is the last question
        setNextAudioUrls({ dictionary: null });
      }
    }
  }, [currentQuestionIndex, currentQuestion]);

  // Auto-play audio when URLs are loaded
  useEffect(() => {
    if (
      audioUrls.dictionary &&
      !playingSource &&
      !isLoading &&
      !hasAutoPlayed &&
      hasUserInteracted && // Only autoplay after user has interacted
      quizSettings.autoPlayAudio && // Only autoplay if setting is enabled
      currentQuestion // Only autoplay if we have a current question
    ) {
      setHasAutoPlayed(true);
      playAudio("dictionary");
    }
  }, [
    audioUrls.dictionary,
    playingSource,
    isLoading,
    hasAutoPlayed,
    hasUserInteracted,
    quizSettings.autoPlayAudio,
  ]);

  // Handle settings changes
  const handleSettingsChange = (setting, value) => {
    setQuizSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  // Handle settings completion
  const handleSettingsComplete = () => {
    setCurrentStep("quiz");
  };

  // Handle quiz type selection
  const handleQuizTypeSelect = (quizTypeId) => {
    setSelectedQuizType(quizTypeId);
    setCurrentStep("settings");
  };

  // Handle begin quiz (for backward compatibility)
  const handleBeginQuiz = () => {
    setHasUserInteracted(true);
  };

  const playAudio = (source) => {
    // Safety check - don't play audio if no current question
    if (!currentQuestion) {
      console.warn("Cannot play audio: no current question");
      return;
    }

    // Mark that user has interacted
    setHasUserInteracted(true);

    // Stop any currently playing audio first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Use audio element for dictionary audio
    const url = audioUrls[source];
    if (audioRef.current && url) {
      audioRef.current.src = url;
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
        setPlayingSource(null);
      });
      setPlayingSource(source);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (isAnswered) return; // Don't respond to keys when answered

      switch (event.key) {
        case "1":
          if (audioUrls.dictionary && !playingSource && !isLoading) {
            playAudio("dictionary");
          }
          break;

        case "ArrowLeft":
        case "a":
          if (currentQuestion.options[0]) {
            handleAnswerSelect(currentQuestion.options[0]);
          }
          break;
        case "ArrowRight":
        case "d":
          if (currentQuestion.options[1]) {
            handleAnswerSelect(currentQuestion.options[1]);
          }
          break;
        case "Enter":
        case " ":
          // Auto-advance if answered
          if (isAnswered) {
            handleNext();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isAnswered, audioUrls, playingSource, isLoading, currentQuestion]);

  const handleAudioEnded = () => {
    setPlayingSource(null);
  };

  const handleAudioError = () => {
    console.error("Audio playback error");
    setPlayingSource(null);
  };

  const handleAnswerSelect = (answer) => {
    if (isAnswered) return;

    // Mark that user has interacted
    setHasUserInteracted(true);

    setSelectedAnswer(answer);
    setIsAnswered(true);
    setQuestionsAnswered(questionsAnswered + 1);

    // Check if answer matches the word or any of its alternates
    const isCorrect =
      answer === currentQuestion.word ||
      currentQuestion.alternates.includes(answer);

    if (isCorrect) {
      setScore(score + 1);
    }

    // Auto-advance after a short delay for better flow
    setTimeout(() => {
      if (currentQuestionIndex < shuffledQuestions.length - 1) {
        handleNext();
      } else {
        // This is the last question, show results
        setShowResults(true);
      }
    }, 1000); // 1 second delay
  };

  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      // Use preloaded audio for the next question
      setAudioUrls(nextAudioUrls);
      setNextAudioUrls({ dictionary: null });

      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setHasAutoPlayed(false); // Reset auto-play flag for next question
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setQuestionsAnswered(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
    setHasAutoPlayed(false);
    setPlayingSource(null);
    setHasUserInteracted(false);
    setCurrentStep("settings");
    setShuffledQuestions([]);
  };

  if (showResults) {
    const percentage = Math.round((score / shuffledQuestions.length) * 100);

    // Determine performance level and message using centralized functions
    const performanceLevel = getPerformanceLevelName(percentage);
    const message = getPerformanceMessage(percentage);
    const colorClass = getTextColorClass(percentage);

    return (
      <div className="h-[calc(100vh-var(--navbar-height))] sm:h-screen bg-background flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        <Card className="w-full max-w-lg ">
          <CardHeader className="text-center pb-0">
            <CardTitle className="text-base sm:text-xl">
              Quiz Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-0">
            {/* 2x2 Grid Layout */}
            <div className="grid grid-cols-2 gap-3 max-w-full">
              {/* Progress Ring */}
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="30"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-muted/20"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="30"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 30}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 30 * (1 - percentage / 100)
                        }`}
                        style={getGradientColorStyle(percentage)}
                        className="transition-all duration-1000"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div
                          className="text-base font-bold"
                          style={getGradientColorStyle(percentage)}
                        >
                          {percentage}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {score}/{shuffledQuestions.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sound Distinction Info */}
              {currentQuizData && (
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="font-semibold mb-1 text-xs">
                      Distinction Practiced
                    </h3>
                    <div className="flex justify-center items-center gap-1 text-xs">
                      <div className="text-center">
                        <div className="font-mono text-xs">
                          {currentQuizData.sound1Symbol}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {currentQuizData.sound1Name}
                        </div>
                      </div>
                      <div className="text-muted-foreground text-xs">vs</div>
                      <div className="text-center">
                        <div className="font-mono text-xs">
                          {currentQuizData.sound2Symbol}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {currentQuizData.sound2Name}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Again Button */}
              <div className="flex items-center justify-center">
                <Button
                  onClick={handleRestart}
                  className="w-full h-8 text-xs cursor-pointer"
                  size="sm"
                >
                  Again
                </Button>
              </div>

              {/* Change Button */}
              <div className="flex items-center justify-center">
                <Button
                  onClick={() => {
                    setSelectedQuizType(null);
                    setCurrentQuestionIndex(0);
                    setQuestionsAnswered(0);
                    setSelectedAnswer(null);
                    setIsAnswered(false);
                    setScore(0);
                    setShowResults(false);
                    setHasAutoPlayed(false);
                    setPlayingSource(null);
                    setHasUserInteracted(false);
                    setCurrentStep("category");
                    setShuffledQuestions([]);
                  }}
                  variant="outline"
                  className="w-full h-8 text-xs cursor-pointer"
                  size="sm"
                >
                  Change
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render until questions are shuffled (only for quiz step)
  if (
    currentStep === "quiz" &&
    hasUserInteracted &&
    shuffledQuestions.length === 0
  ) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-var(--navbar-height))] bg-background flex items-center justify-center p-4 overflow-hidden relative">
      {/* Settings Step */}
      {currentStep === "settings" && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg text-center">
                {currentQuizData
                  ? `${currentQuizData.name} Settings`
                  : "Quiz Settings"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Number of Questions */}
              <div className="space-y-2 text-center">
                <label className="text-md font-medium">
                  Number of Questions
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 30, "all"].map((num) => (
                    <Button
                      key={num}
                      variant={
                        quizSettings.numberOfQuestions === num
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        handleSettingsChange("numberOfQuestions", num)
                      }
                      className="w-full cursor-pointer mt-2"
                    >
                      {num === "all" ? "All" : num}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Auto-play Audio */}
              {/* <div className="space-y-2">
                <label className="text-sm font-medium">Audio Settings</label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoPlayAudio"
                    checked={quizSettings.autoPlayAudio}
                    onCheckedChange={(checked) =>
                      handleSettingsChange("autoPlayAudio", checked)
                    }
                  />
                  <label
                    htmlFor="autoPlayAudio"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Auto-play audio for each question
                  </label>
                </div>
              </div> */}

              {/* Show Sound Symbols */}
              {/* <div className="space-y-2">
                <label className="text-sm font-medium">Display Options</label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showSoundSymbols"
                    checked={quizSettings.showSoundSymbols}
                    onCheckedChange={(checked) =>
                      handleSettingsChange("showSoundSymbols", checked)
                    }
                  />
                  <label
                    htmlFor="showSoundSymbols"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Show sound symbols (IPA)
                  </label>
                </div>
              </div> */}

              {/* Start Quiz Button */}
              <Button
                onClick={() => {
                  // Force regenerate questions by temporarily clearing and resetting selectedQuizType
                  const currentQuizType = selectedQuizType;
                  setSelectedQuizType(null);
                  setTimeout(() => {
                    setSelectedQuizType(currentQuizType);
                  }, 0);
                  handleSettingsComplete();
                  setHasUserInteracted(true);
                }}
                className="w-full cursor-pointer"
                size="lg"
              >
                Start Quiz
              </Button>

              {/* Back to Quiz Types Button */}
              <Button
                onClick={() => setCurrentStep("quizType")}
                variant="ghost"
                className="w-full cursor-pointer text-sm"
              >
                ← Back to Quiz Types
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Selection Step */}
      {currentStep === "category" && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 p-4 overflow-hidden">
          <Card className="w-full max-w-md max-h-[80vh] flex flex-col">
            <CardHeader className="pb-1 flex-shrink-0">
              <CardTitle className="text-center text-xl">
                Choose Category
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto px-3">
              <div className="grid grid-cols-2 gap-4">
                {/* Vowels Category */}
                <div
                  onClick={() => {
                    setSelectedCategory("vowels");
                    setCurrentStep("quizType");
                  }}
                  className={`relative w-full cursor-pointer rounded-lg p-6 hover:bg-accent hover:text-accent-foreground transition-colors ${
                    vowelsAverage ? "border-2" : "border border-border"
                  } bg-card`}
                  style={
                    vowelsAverage ? getGradientBorderStyle(vowelsAverage) : {}
                  }
                >
                  <div className="relative z-10 flex flex-col items-center justify-center text-center">
                    <div className="font-semibold text-lg mb-2">Vowels</div>

                    <div className="flex flex-col gap-1">
                      <div className="text-[10px] sm:text-xs text-muted-foreground">
                        {vowelsCompletion.completed}/{vowelsCompletion.total}{" "}
                        completed
                      </div>
                      {vowelsAverage && (
                        <div
                          className="text-[10px] sm:text-xs font-bold"
                          style={getGradientColorStyle(vowelsAverage)}
                        >
                          {vowelsAverage}% Average
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Consonants Category */}
                <div
                  onClick={() => {
                    setSelectedCategory("consonants");
                    setCurrentStep("quizType");
                  }}
                  className={`relative w-full cursor-pointer rounded-lg p-6 hover:bg-accent hover:text-accent-foreground transition-colors ${
                    consonantsAverage ? "border-2" : "border border-border"
                  } bg-card`}
                  style={
                    consonantsAverage
                      ? getGradientBorderStyle(consonantsAverage)
                      : {}
                  }
                >
                  <div className="relative z-10 flex flex-col items-center justify-center text-center">
                    <div className="font-semibold text-lg mb-2">Consonants</div>

                    <div className="flex flex-col gap-1">
                      <div className="text-[10px] sm:text-xs text-muted-foreground">
                        {consonantsCompletion.completed}/
                        {consonantsCompletion.total} completed
                      </div>
                      {consonantsAverage && (
                        <div
                          className="text-[10px] sm:text-xs font-bold"
                          style={getGradientColorStyle(consonantsAverage)}
                        >
                          {consonantsAverage}% Average
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Legend - Show when there are quiz results */}
              {(vowelsAverage !== null || consonantsAverage !== null) && (
                <div className="mt-4 p-3 pt-0 space-y-2">
                  <p className="text-xs text-muted-foreground text-center">
                    Performance Legend
                  </p>
                  <div className="flex flex-col items-center gap-2 text-xs">
                    {(() => {
                      const legend = getGradientNumberLineLegend();
                      return (
                        <>
                          <div className="w-full max-w-xs relative">
                            <div style={legend.gradientStyle}></div>
                            <div className="relative mt-1 h-4">
                              {legend.markers.map((marker, index) => (
                                <div
                                  key={index}
                                  className="absolute flex flex-col items-center transform -translate-x-1/2"
                                  style={{ left: marker.left }}
                                >
                                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                                  <span className="text-muted-foreground text-[10px] mt-1 whitespace-nowrap">
                                    {marker.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quiz Type Selection Step */}
      {currentStep === "quizType" && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 p-2 sm:p-4 overflow-hidden">
          <Card className="w-full gap-0 py-3 max-w-md max-h-[95vh] sm:max-h-[80vh] flex flex-col">
            <CardHeader className="pb-1 flex-shrink-0">
              <CardTitle className="text-center text-sm sm:text-base">
                Choose Quiz Type
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto px-2 sm:px-3">
              {selectedCategory === "vowels" && (
                <div className="grid grid-cols-2 gap-1 sm:gap-2">
                  {/* Column 1: KIT_FLEECE, TRAP_DRESS, BAN_DRESS */}
                  <div className="space-y-1 sm:space-y-2">
                    {Object.values(QUIZ_DATA)
                      .filter(
                        (quizData) =>
                          quizData.id === QUIZ_TYPE_IDS.KIT_FLEECE ||
                          quizData.id === QUIZ_TYPE_IDS.TRAP_DRESS ||
                          quizData.id === QUIZ_TYPE_IDS.BAN_DRESS
                      )
                      .map((quizData) => {
                        const previousResult = previousResults[quizData.id];
                        return (
                          <div
                            key={quizData.id}
                            onClick={() => handleQuizTypeSelect(quizData.id)}
                            className={`relative w-full cursor-pointer rounded-lg p-2 sm:p-3 hover:bg-accent hover:text-accent-foreground transition-colors ${
                              previousResult
                                ? "border-2"
                                : "border border-border"
                            } bg-card`}
                            style={
                              previousResult
                                ? getGradientBorderStyle(
                                    previousResult.percentage
                                  )
                                : {}
                            }
                          >
                            <div className="relative z-10 flex flex-col items-center justify-center text-center">
                              <div className="font-semibold text-xs">
                                {quizData.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {quizData.description}
                              </div>
                              <div {...getQuizCardTextProps(previousResult)}>
                                {previousResult
                                  ? `${previousResult.percentage}%`
                                  : "No Result Yet"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Column 2: FOOT_GOOSE, STRUT_LOT */}
                  <div className="space-y-1 sm:space-y-2">
                    {Object.values(QUIZ_DATA)
                      .filter(
                        (quizData) =>
                          quizData.id === QUIZ_TYPE_IDS.FOOT_GOOSE ||
                          quizData.id === QUIZ_TYPE_IDS.STRUT_LOT
                      )
                      .map((quizData) => {
                        const previousResult = previousResults[quizData.id];
                        return (
                          <div
                            key={quizData.id}
                            onClick={() => handleQuizTypeSelect(quizData.id)}
                            className={`relative w-full cursor-pointer rounded-lg p-2 sm:p-3 hover:bg-accent hover:text-accent-foreground transition-colors ${
                              previousResult
                                ? "border-2"
                                : "border border-border"
                            } bg-card`}
                            style={
                              previousResult
                                ? getGradientBorderStyle(
                                    previousResult.percentage
                                  )
                                : {}
                            }
                          >
                            <div className="relative z-10 flex flex-col items-center justify-center text-center">
                              <div className="font-semibold text-xs">
                                {quizData.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {quizData.description}
                              </div>
                              <div {...getQuizCardTextProps(previousResult)}>
                                {previousResult
                                  ? `${previousResult.percentage}%`
                                  : "No Result Yet"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {selectedCategory === "consonants" && (
                <div className="grid grid-cols-3 gap-1 sm:gap-2">
                  {/* Column 1: DH_D, TH_T, TH_F, R_NULL */}
                  <div className="space-y-1 sm:space-y-2">
                    {Object.values(QUIZ_DATA)
                      .filter(
                        (quizData) =>
                          quizData.id === QUIZ_TYPE_IDS.T_CH ||
                          quizData.id === QUIZ_TYPE_IDS.DH_D ||
                          quizData.id === QUIZ_TYPE_IDS.TH_T ||
                          quizData.id === QUIZ_TYPE_IDS.TH_F
                      )
                      .map((quizData) => {
                        const previousResult = previousResults[quizData.id];
                        return (
                          <div
                            key={quizData.id}
                            onClick={() => handleQuizTypeSelect(quizData.id)}
                            className={`relative w-full cursor-pointer rounded-lg p-2 sm:p-3 hover:bg-accent hover:text-accent-foreground transition-colors ${
                              previousResult
                                ? "border-2"
                                : "border border-border"
                            } bg-card`}
                            style={
                              previousResult
                                ? getGradientBorderStyle(
                                    previousResult.percentage
                                  )
                                : {}
                            }
                          >
                            <div className="relative z-10 flex flex-col items-center justify-center text-center">
                              <div className="font-semibold text-xs">
                                {quizData.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {quizData.description}
                              </div>
                              <div
                                {...getQuizCardTextProps(previousResult, true)}
                              >
                                {previousResult
                                  ? `${previousResult.percentage}%`
                                  : "No Result Yet"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Column 2: T_CH, DARK_L_O, DARK_L_U, S_Z */}
                  <div className="space-y-1 sm:space-y-2">
                    {Object.values(QUIZ_DATA)
                      .filter(
                        (quizData) =>
                          quizData.id === QUIZ_TYPE_IDS.DARK_L_O ||
                          quizData.id === QUIZ_TYPE_IDS.DARK_L_U ||
                          quizData.id === QUIZ_TYPE_IDS.R_NULL ||
                          quizData.id === QUIZ_TYPE_IDS.S_Z
                      )
                      .map((quizData) => {
                        const previousResult = previousResults[quizData.id];
                        return (
                          <div
                            key={quizData.id}
                            onClick={() => handleQuizTypeSelect(quizData.id)}
                            className={`relative w-full cursor-pointer rounded-lg p-2 sm:p-3 hover:bg-accent hover:text-accent-foreground transition-colors ${
                              previousResult
                                ? "border-2"
                                : "border border-border"
                            } bg-card`}
                            style={
                              previousResult
                                ? getGradientBorderStyle(
                                    previousResult.percentage
                                  )
                                : {}
                            }
                          >
                            <div className="relative z-10 flex flex-col items-center justify-center text-center">
                              <div className="font-semibold text-xs">
                                {quizData.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {quizData.description}
                              </div>
                              <div
                                {...getQuizCardTextProps(previousResult, true)}
                              >
                                {previousResult
                                  ? `${previousResult.percentage}%`
                                  : "No Result Yet"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Column 3: M_N, N_NG, M_NG */}
                  <div className="space-y-1 sm:space-y-2">
                    {Object.values(QUIZ_DATA)
                      .filter(
                        (quizData) =>
                          quizData.id === QUIZ_TYPE_IDS.M_N ||
                          quizData.id === QUIZ_TYPE_IDS.N_NG ||
                          quizData.id === QUIZ_TYPE_IDS.M_NG
                      )
                      .map((quizData) => {
                        const previousResult = previousResults[quizData.id];
                        return (
                          <div
                            key={quizData.id}
                            onClick={() => handleQuizTypeSelect(quizData.id)}
                            className={`relative w-full cursor-pointer rounded-lg p-2 sm:p-3 hover:bg-accent hover:text-accent-foreground transition-colors ${
                              previousResult
                                ? "border-2"
                                : "border border-border"
                            } bg-card`}
                            style={
                              previousResult
                                ? getGradientBorderStyle(
                                    previousResult.percentage
                                  )
                                : {}
                            }
                          >
                            <div className="relative z-10 flex flex-col items-center justify-center text-center">
                              <div className="font-semibold text-xs">
                                {quizData.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {quizData.description}
                              </div>
                              <div
                                {...getQuizCardTextProps(previousResult, true)}
                              >
                                {previousResult
                                  ? `${previousResult.percentage}%`
                                  : "No Result Yet"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </CardContent>
            <div className="p-3 pt-0 flex-shrink-0">
              <Button
                onClick={() => setCurrentStep("category")}
                variant="ghost"
                className="w-full cursor-pointer text-sm"
              >
                ← Back to Categories
              </Button>
            </div>
            {Object.keys(previousResults).length > 0 && (
              <div className="p-3 pt-0 flex-shrink-0 space-y-2">
                <p className="text-xs text-muted-foreground text-center">
                  Note: Shows last result for each quiz type
                </p>
                <div className="flex flex-col items-center gap-2 text-xs">
                  {(() => {
                    const legend = getGradientNumberLineLegend();
                    return (
                      <>
                        <div className="w-full max-w-xs relative">
                          <div style={legend.gradientStyle}></div>
                          <div className="relative mt-1 h-4">
                            {legend.markers.map((marker, index) => (
                              <div
                                key={index}
                                className="absolute flex flex-col items-center transform -translate-x-1/2"
                                style={{ left: marker.left }}
                              >
                                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                                <span className="text-muted-foreground text-[10px] mt-1 whitespace-nowrap">
                                  {marker.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={() => setShowClearConfirm(true)}
                    variant="outline"
                    className="w-50 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                    size="sm"
                  >
                    Clear All Results
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Clear Results Confirmation Dialog */}
      {showClearConfirm && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-center text-base">
                Clear All Results?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                This will delete your quiz results and cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowClearConfirm(false)}
                  variant="outline"
                  className="flex-1 cursor-pointer"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setPreviousResults({});
                    setShowClearConfirm(false);
                  }}
                  variant="destructive"
                  className="flex-1 cursor-pointer"
                  size="sm"
                >
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quiz Interface */}
      {currentStep === "quiz" && hasUserInteracted && currentQuizData && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              Quiz: {currentQuizData.name}
            </CardTitle>
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>
                  Question {currentQuestionIndex + 1} of{" "}
                  {shuffledQuestions.length}
                </span>
                <span className="text-right">
                  {score}/{questionsAnswered} (
                  {questionsAnswered > 0
                    ? Math.round((score / questionsAnswered) * 100)
                    : 0}
                  %)
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            {/* Audio Player */}
            <div className="space-y-4">
              <p className="text-lg font-medium text-center">
                Listen to the audio for the word:
              </p>

              {/* Hidden audio element */}
              <audio
                ref={audioRef}
                onEnded={handleAudioEnded}
                onError={handleAudioError}
                className="hidden"
              />

              <div className="flex flex-col gap-2 justify-center">
                {/* US Native Audio */}
                <Button
                  onClick={() => playAudio("dictionary")}
                  disabled={playingSource || isLoading || !audioUrls.dictionary}
                  variant="outline"
                  className={`flex items-center gap-2 px-4 py-2 cursor-pointer ${
                    !audioUrls.dictionary && !isLoading ? "opacity-50" : ""
                  }`}
                  title="Press '1' to play US Native audio"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : playingSource === "dictionary" ? (
                    <Volume2 className="h-4 w-4 animate-pulse" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isLoading
                    ? "Loading..."
                    : playingSource === "dictionary"
                    ? "Playing..."
                    : "US Native"}
                </Button>
              </div>

              {!audioUrls.dictionary && !isLoading && (
                <div className="space-y-3">
                  <p className="text-xs text-orange-600 dark:text-orange-400 text-center">
                    ⚠️ No audio available for this word.
                  </p>
                  <Button
                    onClick={handleNext}
                    variant="secondary"
                    className="w-full"
                  >
                    Skip This Word
                  </Button>
                </div>
              )}
            </div>

            {/* Question */}
            <div className="text-center">
              <p className="text-lg font-medium">Which word did you hear?</p>
              {quizSettings.showSoundSymbols}
            </div>

            {/* Answer Options */}
            <div className="flex gap-3">
              {currentQuestion.options.map((option, index) => {
                // Get all possible correct answers (main word + alternates)
                const correctAnswers = [
                  currentQuestion.word,
                  ...currentQuestion.alternates,
                ];
                const isCorrect = correctAnswers.includes(option);

                // Get alternates for this specific option
                // For the current question word, show its alternates
                // For the other option, we need to find its alternates from the data
                let optionAlternates = [];
                if (option === currentQuestion.word) {
                  optionAlternates = currentQuestion.alternates;
                } else {
                  // Find the other word's alternates from the minimal pairs data
                  const otherWord = currentQuestion.options.find(
                    (o) => o !== currentQuestion.word
                  );
                  const otherQuestion = currentQuizData.pairs.find(
                    (q) => q.word === otherWord
                  );
                  optionAlternates = otherQuestion
                    ? otherQuestion.alternates
                    : [];
                }

                // Determine which sound symbol to show for this option
                const soundSymbol =
                  index === 0
                    ? `${currentQuizData.sound1Name} ${currentQuizData.sound1Symbol}`
                    : `${currentQuizData.sound2Name} ${currentQuizData.sound2Symbol}`;

                return (
                  <div
                    key={option}
                    className="flex-1 flex flex-col items-center space-y-1"
                  >
                    <Button
                      onClick={() => handleAnswerSelect(option)}
                      variant={
                        selectedAnswer === option
                          ? isCorrect
                            ? "default"
                            : "destructive"
                          : "outline"
                      }
                      className={`w-full h-12 text-lg relative cursor-pointer ${
                        selectedAnswer === option && isCorrect
                          ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                          : ""
                      }`}
                      disabled={isAnswered}
                    >
                      <div className="flex flex-col items-center">
                        {optionAlternates.length > 0 ? (
                          <span>
                            {option}, {optionAlternates.join(", ")}
                          </span>
                        ) : (
                          <span>{option}</span>
                        )}
                      </div>
                    </Button>
                    {quizSettings.showSoundSymbols && (
                      <div className="text-xs text-muted-foreground">
                        {soundSymbol}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
