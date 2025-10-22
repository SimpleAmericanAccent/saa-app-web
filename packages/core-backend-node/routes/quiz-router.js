import express from "express";
import { PrismaClient } from "../prisma/generated/index.js";

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to get display name for different data keys
function getContrastDisplayName(contrastKey) {
  switch (contrastKey) {
    case "vowels":
      return "All Vowels";
    case "consonants":
      return "All Consonants";
    case "overall":
      return "Overall Progress";
    default:
      return "Unknown";
  }
}

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
      pairs,
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
    const { recentTrials = 30 } = req.query; // Default to 30 most recent trials

    if (!userId) {
      return res.status(401).json({
        error: "User not authenticated",
      });
    }

    // Get all trials for the user, grouped by contrast
    const allTrials = await prisma.trial.findMany({
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

    // First pass: group all trials by contrast
    allTrials.forEach((trial) => {
      const contrastKey = trial.pair.contrast.key;

      if (!resultsByContrast[contrastKey]) {
        resultsByContrast[contrastKey] = {
          contrastKey,
          contrastName: trial.pair.contrast.name,
          allTrials: [],
          recentTrials: [],
          totalTrials: 0,
          correctTrials: 0,
          recentTotalTrials: 0,
          recentCorrectTrials: 0,
          percentage: 0,
          recentPercentage: 0,
          lastAttempt: null,
        };
      }

      const result = resultsByContrast[contrastKey];
      result.allTrials.push(trial);

      // Update last attempt timestamp
      if (!result.lastAttempt || trial.presentedAt > result.lastAttempt) {
        result.lastAttempt = trial.presentedAt;
      }
    });

    // Second pass: calculate stats for each contrast
    Object.values(resultsByContrast).forEach((result) => {
      // Sort trials by presentedAt (most recent first)
      result.allTrials.sort(
        (a, b) => new Date(b.presentedAt) - new Date(a.presentedAt)
      );

      // Get recent trials (up to the specified limit)
      result.recentTrials = result.allTrials.slice(0, parseInt(recentTrials));

      // Calculate all-time stats
      result.totalTrials = result.allTrials.length;
      result.correctTrials = result.allTrials.filter(
        (trial) => trial.isCorrect
      ).length;
      result.percentage =
        result.totalTrials > 0
          ? Math.round((result.correctTrials / result.totalTrials) * 100)
          : 0;

      // Calculate recent stats
      result.recentTotalTrials = result.recentTrials.length;
      result.recentCorrectTrials = result.recentTrials.filter(
        (trial) => trial.isCorrect
      ).length;
      result.recentPercentage =
        result.recentTotalTrials > 0
          ? Math.round(
              (result.recentCorrectTrials / result.recentTotalTrials) * 100
            )
          : 0;

      // Calculate first 30 trials stats
      // Since trials are ordered by presentedAt desc (newest first),
      // we need to reverse to get chronological order, then take first 30
      const chronologicalTrials = [...result.allTrials].reverse();
      const first30Trials = chronologicalTrials.slice(0, 30);
      result.first30TotalTrials = Math.min(first30Trials.length, 30);
      result.first30CorrectTrials = first30Trials.filter(
        (trial) => trial.isCorrect
      ).length;
      result.first30Percentage =
        result.first30TotalTrials > 0
          ? Math.round(
              (result.first30CorrectTrials / result.first30TotalTrials) * 100
            )
          : 0;

      // Clean up - remove the trial arrays to reduce response size
      delete result.allTrials;
      delete result.recentTrials;
    });

    res.json({ results: resultsByContrast });
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    res.status(500).json({ error: "Failed to fetch quiz results" });
  }
});

// GET /api/quiz/progress/:contrastKey
// Get progress data for a specific contrast with rolling averages
router.get("/progress/:contrastKey", async (req, res) => {
  try {
    const userId = req.userId;
    const { contrastKey } = req.params;
    const { windowSize = 30 } = req.query; // Rolling average window size

    if (!userId) {
      return res.status(401).json({
        error: "User not authenticated",
      });
    }

    // Handle special data keys for aggregated views
    let whereClause = { userId };

    if (contrastKey === "vowels") {
      whereClause.pair = {
        contrast: {
          category: "vowels",
        },
      };
    } else if (contrastKey === "consonants") {
      whereClause.pair = {
        contrast: {
          category: "consonants",
        },
      };
    } else if (contrastKey === "overall") {
      // No additional filter - get all trials
    } else {
      // Specific contrast key
      whereClause.pair = {
        contrast: {
          key: contrastKey,
        },
      };
    }

    // Get all trials based on the filter, ordered by time
    const trials = await prisma.trial.findMany({
      where: whereClause,
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
      orderBy: { presentedAt: "asc" }, // Oldest first for rolling average calculation
    });

    if (trials.length === 0) {
      return res.json({
        contrastKey,
        contrastName: getContrastDisplayName(contrastKey),
        trials: [],
        rollingAverages: [],
        totalTrials: 0,
      });
    }

    // Calculate rolling averages
    const rollingAverages = [];
    const windowSizeNum = parseInt(windowSize);

    for (let i = windowSizeNum - 1; i < trials.length; i++) {
      const window = trials.slice(i - windowSizeNum + 1, i + 1);
      const correctCount = window.filter((trial) => trial.isCorrect).length;
      const accuracy = Math.round((correctCount / windowSizeNum) * 100);

      rollingAverages.push({
        trialIndex: i + 1,
        accuracy,
        trialCount: windowSizeNum,
        timestamp: window[window.length - 1].presentedAt,
        correctTrials: correctCount,
        totalTrials: windowSizeNum,
      });
    }

    // Also calculate daily aggregates for broader trends
    const dailyStats = {};
    trials.forEach((trial) => {
      const date = trial.presentedAt.toISOString().split("T")[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          totalTrials: 0,
          correctTrials: 0,
          avgResponseTime: 0,
          responseTimes: [],
        };
      }

      dailyStats[date].totalTrials++;
      if (trial.isCorrect) {
        dailyStats[date].correctTrials++;
      }
      if (trial.latencyMs) {
        dailyStats[date].responseTimes.push(trial.latencyMs);
      }
    });

    // Calculate daily averages
    const dailyAverages = Object.values(dailyStats).map((day) => ({
      date: day.date,
      accuracy: Math.round((day.correctTrials / day.totalTrials) * 100),
      totalTrials: day.totalTrials,
      correctTrials: day.correctTrials,
      avgResponseTime:
        day.responseTimes.length > 0
          ? Math.round(
              day.responseTimes.reduce((a, b) => a + b, 0) /
                day.responseTimes.length
            )
          : 0,
    }));

    res.json({
      contrastKey,
      contrastName: getContrastDisplayName(contrastKey),
      trials: trials.map((trial) => ({
        trialId: trial.trialId,
        isCorrect: trial.isCorrect,
        presentedAt: trial.presentedAt,
        respondedAt: trial.respondedAt,
        latencyMs: trial.latencyMs,
      })),
      rollingAverages,
      dailyAverages,
      totalTrials: trials.length,
    });
  } catch (error) {
    console.error("Error fetching progress data:", error);
    res.status(500).json({ error: "Failed to fetch progress data" });
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
      settings: userSettings?.quizSettings || defaultSettings,
    });
  } catch (error) {
    console.error("Error fetching quiz settings:", error);
    res.status(500).json({ error: "Failed to fetch quiz settings" });
  }
});

export default router;
