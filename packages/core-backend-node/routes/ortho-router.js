import express from "express";
import { prisma } from "../prisma/services/prisma-client.js";

const router = express.Router();

const LEXICAL_SET_MAP = {
  FLEECE: { arpabets: ["IY"], type: "vowel" },
  KIT: { arpabets: ["IH"], type: "vowel" },
  DRESS: { arpabets: ["EH"], type: "vowel" },
  TRAP: { arpabets: ["AE"], type: "vowel" },
  GOOSE: { arpabets: ["UW"], type: "vowel" },
  FOOT: { arpabets: ["UH"], type: "vowel" },
  STRUT: { arpabets: ["AH"], type: "vowel" },
  commA: { arpabets: ["AH"], type: "vowel" },
  LOT: { arpabets: ["AA", "AO"], type: "vowel" },
  FACE: { arpabets: ["EY"], type: "vowel" },
  PRICE: { arpabets: ["AY"], type: "vowel" },
  CHOICE: { arpabets: ["OY"], type: "vowel" },
  GOAT: { arpabets: ["OW"], type: "vowel" },
  MOUTH: { arpabets: ["AW"], type: "vowel" },
  NURSE: { arpabets: ["ER"], type: "vowel" },

  P: { arpabets: ["P"], type: "consonant" },
  B: { arpabets: ["B"], type: "consonant" },
  T: { arpabets: ["T"], type: "consonant" },
  D: { arpabets: ["D"], type: "consonant" },
  K: { arpabets: ["K"], type: "consonant" },
  G: { arpabets: ["G"], type: "consonant" },
  CH: { arpabets: ["CH"], type: "consonant" },
  J: { arpabets: ["JH"], type: "consonant" },
  F: { arpabets: ["F"], type: "consonant" },
  V: { arpabets: ["V"], type: "consonant" },
  TH: { arpabets: ["TH"], type: "consonant" },
  DH: { arpabets: ["DH"], type: "consonant" },
  S: { arpabets: ["S"], type: "consonant" },
  SH: { arpabets: ["SH"], type: "consonant" },
  Z: { arpabets: ["Z"], type: "consonant" },
  ZH: { arpabets: ["ZH"], type: "consonant" },
  H: { arpabets: ["HH"], type: "consonant" },
  M: { arpabets: ["M"], type: "consonant" },
  N: { arpabets: ["N"], type: "consonant" },
  NG: { arpabets: ["NG"], type: "consonant" },
  L: { arpabets: ["L"], type: "consonant" },
  R: { arpabets: ["R"], type: "consonant" },
  W: { arpabets: ["W"], type: "consonant" },
  Y: { arpabets: ["Y"], type: "consonant" },
};

router.get("/word/:word", async (req, res) => {
  const word = req.params.word.toLowerCase();

  try {
    const ortho = await prisma.orthoWord.findUnique({
      where: { word },
      include: { pronsCmuDict: true },
    });

    if (!ortho) return res.json({ error: "Not found" });

    res.json(ortho);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/lex/:lex", async (req, res) => {
  const lex = req.params.lex.toLowerCase();
  const lexEntry = LEXICAL_SET_MAP[lex.toUpperCase()];
  if (!lexEntry) {
    return res
      .status(400)
      .json({ error: `Unknown lexical set or phoneme: ${lex}` });
  }
  const { arpabets, type } = lexEntry;
  const limit = parseInt(req.query.limit) || 20;
  const stressParam = (req.query.stress ?? "1").toString();
  const allowedStresses = new Set(stressParam.toLowerCase().split(""));

  if (!arpabets) {
    return res
      .status(400)
      .json({ error: `Unknown lexical set or phoneme: ${lex}` });
  }

  try {
    let words;

    if (type === "vowel") {
      const stressSuffixes = ["0", "1", "2"].filter((s) =>
        allowedStresses.has(s)
      );
      if (stressSuffixes.length === 0) {
        return res.status(400).json({ error: "Invalid stress filter" });
      }
      const exactPatterns = arpabets.flatMap((a) =>
        stressSuffixes.map((s) => `${a}${s}`)
      );

      // Use OR conditions for vowel patterns since contains doesn't work well with pipe-separated patterns
      const orConditions = exactPatterns.map((pattern) => ({
        pronCmuDict: {
          contains: pattern,
          mode: "insensitive",
        },
      }));

      // Exclude common contraction fragments
      const contractionFragments = ["t", "re", "d", "s", "m", "ll", "ve"];

      words = await prisma.orthoWord.findMany({
        where: {
          pronsCmuDict: {
            some: {
              OR: orConditions,
            },
          },
          freqSubtlexUs: { not: null },
          word: {
            notIn: contractionFragments,
          },
        },
        orderBy: { freqSubtlexUs: "desc" },
        take: limit,
        include: { pronsCmuDict: true },
      });
    } else {
      // For consonants, we need to match exact phonemes, not substrings
      // Use multiple OR conditions to match exact phoneme boundaries
      const orConditions = arpabets.flatMap((a) => [
        { pronCmuDict: { startsWith: `${a} `, mode: "insensitive" } },
        { pronCmuDict: { endsWith: ` ${a}`, mode: "insensitive" } },
        { pronCmuDict: { contains: ` ${a} `, mode: "insensitive" } },
        { pronCmuDict: { equals: a, mode: "insensitive" } },
      ]);

      // Special case for H phoneme - exclude WH combinations
      let whereClause = {
        pronsCmuDict: {
          some: {
            OR: orConditions,
          },
        },
        freqSubtlexUs: { not: null },
      };

      // Exclude common contraction fragments
      const contractionFragments = ["t", "re", "d", "s", "m", "ll", "ve"];
      whereClause.word = {
        notIn: contractionFragments,
      };

      if (lex.toUpperCase() === "H") {
        whereClause.pronsCmuDict.some.NOT = {
          pronCmuDict: {
            contains: "HH W",
            mode: "insensitive",
          },
        };
      }

      words = await prisma.orthoWord.findMany({
        where: whereClause,
        orderBy: { freqSubtlexUs: "desc" },
        take: limit,
        include: { pronsCmuDict: true },
      });
    }

    res.json(words);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
