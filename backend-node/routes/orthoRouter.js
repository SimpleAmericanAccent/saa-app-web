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
  LOT: "AA", // or AO
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
  const lex = req.params.lex.toUpperCase();
  const arpabet = LEXICAL_SET_MAP[lex];

  if (!arpabet) {
    return res
      .status(400)
      .json({ error: `Unknown lexical set or phoneme: ${lex}` });
  }

  try {
    const words = await prisma.orthoWord.findMany({
      where: {
        pronsCmuDict: {
          some: {
            pronCmuDict: {
              contains: arpabet,
              mode: "insensitive",
            },
          },
        },
        freqSubtlexUs: { not: null },
      },
      orderBy: { freqSubtlexUs: "desc" },
      take: 20,
      include: { pronsCmuDict: true },
    });

    res.json(words);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
