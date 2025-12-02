import express from "express";
import { prisma } from "../prisma/services/prisma-client.js";
import { LEXICAL_SET_MAP } from "shared/phonemes.js";

const router = express.Router();

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
