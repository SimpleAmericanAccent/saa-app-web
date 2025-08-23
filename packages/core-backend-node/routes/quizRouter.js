import express from "express";
import { PrismaClient } from "../prisma/generated/index.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/quiz/contrasts
// Get all available contrasts with metadata
router.get("/contrasts", async (req, res) => {
  try {
    const contrasts = await prisma.contrast.findMany({
      where: {
        active: true,
      },
      include: {
        _count: {
          select: { pairs: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const result = contrasts.map((contrast) => ({
      key: contrast.key,
      name: contrast.name,
      title: contrast.title,
      description: contrast.description,
      category: contrast.category,
      soundAName: contrast.soundAName,
      soundBName: contrast.soundBName,
      soundASymbol: contrast.soundASymbol,
      soundBSymbol: contrast.soundBSymbol,
      pairCount: contrast._count.pairs,
    }));

    res.json({ contrasts: result });
  } catch (error) {
    console.error("Error fetching contrasts:", error);
    res.status(500).json({ error: "Failed to fetch contrasts" });
  }
});

// GET /api/quiz/pairs?contrastKey=kit_fleece
// Get pairs for a specific contrast
router.get("/pairs", async (req, res) => {
  try {
    const { contrastKey } = req.query;

    if (!contrastKey) {
      return res.status(400).json({ error: "contrastKey is required" });
    }

    // First get the contrast to verify it exists
    const contrast = await prisma.contrast.findUnique({
      where: { key: contrastKey },
      select: { id: true, name: true },
    });

    if (!contrast) {
      return res.status(404).json({ error: "Contrast not found" });
    }

    const pairs = await prisma.pair.findMany({
      where: {
        contrastId: contrast.id,
        active: true,
      },
      select: {
        pairId: true,
        wordA: true,
        wordB: true,
        alternateA: true,
        alternateB: true,
        audioAUrl: true,
        audioBUrl: true,
      },
    });

    res.json({ 
      contrast: contrast.name,
      pairs 
    });
  } catch (error) {
    console.error("Error fetching pairs:", error);
    res.status(500).json({ error: "Failed to fetch pairs" });
  }
});

// POST /api/quiz/trials
// Save a trial - uses server-provided userId, ignores client-sent userId
router.post("/trials", async (req, res) => {
  try {
    const {
      trialId,
      pairId,
      presentedSide,
      choiceSide,
      isCorrect,
      presentedAt,
      respondedAt,
      latencyMs,
    } = req.body;

    // Validate required fields (userId is now provided by middleware)
    if (
      !trialId ||
      !pairId ||
      !presentedSide ||
      !choiceSide ||
      isCorrect === undefined
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: trialId, pairId, presentedSide, choiceSide, isCorrect",
      });
    }

    // Use userId from middleware (server-provided, secure)
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        error: "User not authenticated",
      });
    }

    // Verify the user exists (should always exist due to JIT provisioning)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid userId: user not found",
      });
    }

    // Create the trial with server-provided userId
    const trial = await prisma.trial.create({
      data: {
        trialId,
        userId, // Server-provided, secure
        pairId,
        presentedSide,
        choiceSide,
        isCorrect,
        presentedAt: presentedAt ? new Date(presentedAt) : new Date(),
        respondedAt: respondedAt ? new Date(respondedAt) : new Date(),
        latencyMs: latencyMs || 0,
      },
      include: {
        pair: {
          include: {
            contrast: {
              select: {
                name: true,
                key: true,
              },
            },
          },
        },
        user: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(201).json({
      message: "Trial saved successfully",
      trial,
    });
  } catch (error) {
    console.error("Error saving trial:", error);

    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ error: "Trial with this ID already exists" });
    }

    res.status(500).json({ error: "Failed to save trial" });
  }
});

// GET /api/quiz/trials?limit=10
// Get trials for the authenticated user
router.get("/trials", async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        error: "User not authenticated",
      });
    }

    const trials = await prisma.trial.findMany({
      where: { userId },
      orderBy: { presentedAt: "desc" },
      take: parseInt(limit),
      include: {
        pair: {
          include: {
            contrast: {
              select: {
                name: true,
                key: true,
              },
            },
          },
        },
      },
    });

    res.json({ trials });
  } catch (error) {
    console.error("Error fetching trials:", error);
    res.status(500).json({ error: "Failed to fetch trials" });
  }
});

// GET /api/quiz/results
// Get quiz results summary for the authenticated user
router.get("/results", async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        error: "User not authenticated",
      });
    }

    // Get all trials for the user, grouped by contrast
    const trials = await prisma.trial.findMany({
      where: { userId },
      include: {
        pair: {
          include: {
            contrast: {
              select: {
                key: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { presentedAt: "desc" },
    });

    // Group trials by contrast and calculate results
    const resultsByContrast = {};
    
    trials.forEach((trial) => {
      const contrastKey = trial.pair.contrast.key;
      
      if (!resultsByContrast[contrastKey]) {
        resultsByContrast[contrastKey] = {
          contrastKey,
          contrastName: trial.pair.contrast.name,
          totalTrials: 0,
          correctTrials: 0,
          percentage: 0,
          lastAttempt: null,
        };
      }
      
      const result = resultsByContrast[contrastKey];
      result.totalTrials++;
      if (trial.isCorrect) {
        result.correctTrials++;
      }
      
      // Update last attempt timestamp
      if (!result.lastAttempt || trial.presentedAt > result.lastAttempt) {
        result.lastAttempt = trial.presentedAt;
      }
    });

    // Calculate percentages
    Object.values(resultsByContrast).forEach((result) => {
      result.percentage = Math.round((result.correctTrials / result.totalTrials) * 100);
    });

    res.json({ results: resultsByContrast });
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    res.status(500).json({ error: "Failed to fetch quiz results" });
  }
});

// POST /api/quiz/settings
// Save user quiz settings
router.post("/settings", async (req, res) => {
  try {
    const userId = req.userId;
    const { settings } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: "User not authenticated",
      });
    }

    if (!settings) {
      return res.status(400).json({
        error: "Settings data is required",
      });
    }

    // Upsert user settings
    const userSettings = await prisma.userSettings.upsert({
      where: { userId },
      update: {
        quizSettings: settings,
        updatedAt: new Date(),
      },
      create: {
        userId,
        quizSettings: settings,
      },
    });

    res.json({ settings: userSettings.quizSettings });
  } catch (error) {
    console.error("Error saving quiz settings:", error);
    res.status(500).json({ error: "Failed to save quiz settings" });
  }
});

// GET /api/quiz/settings
// Get user quiz settings
router.get("/settings", async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        error: "User not authenticated",
      });
    }

    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    const defaultSettings = {
      numberOfQuestions: 10,
      autoPlayAudio: true,
      showSoundSymbols: true,
      soundEffects: true,
    };

    res.json({ 
      settings: userSettings?.quizSettings || defaultSettings 
    });
  } catch (error) {
    console.error("Error fetching quiz settings:", error);
    res.status(500).json({ error: "Failed to fetch quiz settings" });
  }
});

export default router;
