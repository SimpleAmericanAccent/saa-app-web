import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

const LEXICAL_SET_MAP = {
  FLEECE: "IY",
  KIT: "IH",
  DRESS: "EH",
  TRAP: "AE",
  GOOSE: "UW",
  FOOT: "UH",
  STRUT: "AH",
  commA: "AH",
  LOT: ["AA", "AO"],
  FACE: "EY",
  PRICE: "AY",
  CHOICE: "OY",
  GOAT: "OW",
  MOUTH: "AW",
  NURSE: "ER",
  P: "P",
  B: "B",
  T: "T",
  D: "D",
  K: "K",
  G: "G",
  CH: "CH",
  J: "JH",
  F: "F",
  V: "V",
  TH: "TH",
  DH: "DH",
  S: "S",
  SH: "SH",
  Z: "Z",
  ZH: "ZH",
  H: "HH",
  M: "M",
  N: "N",
  NG: "NG",
  L: "L",
  R: "R",
  W: "W",
  Y: "Y",
};

router.get("/word/:word", async (req, res) => {
  const word = req.params.word.toLowerCase();

  try {
    const ortho = await prisma.orthoWord.findUnique({
      where: { word },
      include: { pronsCmuDict: true },
    });

    if (!ortho) return res.status(404).json({ error: "Not found" });

    res.json(ortho);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/lex/:lex", async (req, res) => {
  const lex = req.params.lex.toLowerCase();
  const arpabetRaw = LEXICAL_SET_MAP[lex.toUpperCase()];
  const arpabets = Array.isArray(arpabetRaw) ? arpabetRaw : [arpabetRaw];
  const limit = parseInt(req.query.limit) || 20;
  const stressParam = (req.query.stress ?? "1").toString();
  const allowedStresses = new Set(stressParam.toLowerCase().split(""));

  if (!arpabetRaw) {
    return res
      .status(400)
      .json({ error: `Unknown lexical set or phoneme: ${lex}` });
  }

  const stressSuffixes = ["0", "1", "2"].filter((s) => allowedStresses.has(s));
  if (stressSuffixes.length === 0) {
    return res.status(400).json({ error: "Invalid stress filter" });
  }

  const exactPatterns = arpabets.flatMap((a) =>
    stressSuffixes.map((s) => `${a}${s}`)
  );
  const regex = exactPatterns.join("|");

  try {
    const words = await prisma.orthoWord.findMany({
      where: {
        pronsCmuDict: {
          some: {
            pronCmuDict: {
              contains: regex,
              mode: "insensitive",
            },
          },
        },
        freqSubtlexUs: { not: null },
      },
      orderBy: { freqSubtlexUs: "desc" },
      take: limit,
      include: { pronsCmuDict: true },
    });

    res.json(words);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
