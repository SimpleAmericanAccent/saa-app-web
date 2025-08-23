import express from "express";
import { PrismaClient } from "../prisma/generated/index.js";
import { requiresAdmin } from "../middleware/requiresAdmin.js";

const router = express.Router();
const prisma = new PrismaClient();

// Apply admin middleware to all routes
router.use(requiresAdmin);

// GET /api/admin/users/quiz-activity
// Get all users with quiz activity
router.get("/users/quiz-activity", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        trials: {
          some: {}, // Only users who have taken trials
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        _count: {
          select: {
            trials: true,
          },
        },
        trials: {
          orderBy: {
            presentedAt: "desc",
          },
          take: 1,
          select: {
            presentedAt: true,
          },
        },
      },
      orderBy: {
        trials: {
          _count: "desc",
        },
      },
    });

    const usersWithActivity = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      trialCount: user._count.trials,
      lastActive: user.trials[0]?.presentedAt || null,
    }));

    res.json({ users: usersWithActivity });
  } catch (error) {
    console.error("Error fetching users with quiz activity:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET /api/admin/users/:userId/trials
// Get all trials for a specific user
router.get("/users/:userId/trials", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    const trials = await prisma.trial.findMany({
      where: {
        userId: userId,
      },
      include: {
        pair: {
          include: {
            contrast: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        presentedAt: "desc",
      },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const formattedTrials = trials.map((trial) => ({
      id: trial.trialId,
      trialId: trial.trialId,
      pairId: trial.pairId,
      presentedSide: trial.presentedSide,
      choiceSide: trial.choiceSide,
      isCorrect: trial.isCorrect,
      createdAt: trial.presentedAt, // Use presentedAt as the creation time
      wordA: trial.pair.wordA,
      wordB: trial.pair.wordB,
      contrastName: trial.pair.contrast.name,
    }));

    res.json({ trials: formattedTrials });
  } catch (error) {
    console.error("Error fetching user trials:", error);
    res.status(500).json({ error: "Failed to fetch user trials" });
  }
});

// GET /api/admin/users/:userId/stats
// Get quiz statistics for a specific user
router.get("/users/:userId/stats", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all trials for the user
    const trials = await prisma.trial.findMany({
      where: {
        userId: userId,
      },
      include: {
        pair: {
          include: {
            contrast: {
              select: {
                name: true,
                category: true,
              },
            },
          },
        },
      },
    });

    // Calculate overall stats
    const totalTrials = trials.length;
    const correctTrials = trials.filter((t) => t.isCorrect).length;
    const overallAverage =
      totalTrials > 0 ? Math.round((correctTrials / totalTrials) * 100) : 0;

    // Group by contrast category
    const byCategory = trials.reduce((acc, trial) => {
      const category = trial.pair.contrast.category;
      if (!acc[category]) {
        acc[category] = { trials: [], correct: 0, total: 0 };
      }
      acc[category].trials.push(trial);
      acc[category].total++;
      if (trial.isCorrect) acc[category].correct++;
      return acc;
    }, {});

    // Calculate category averages
    const categoryStats = {};
    Object.entries(byCategory).forEach(([category, data]) => {
      categoryStats[category] = {
        total: data.total,
        correct: data.correct,
        average:
          data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      };
    });

    // Get unique contrasts completed
    const uniqueContrasts = new Set(trials.map((t) => t.pair.contrast.name));
    const totalContrasts = await prisma.contrast.count({
      where: { active: true },
    });

    // Calculate completion by category
    const vowelsContrasts = await prisma.contrast.count({
      where: {
        active: true,
        category: "vowels",
      },
    });
    const consonantsContrasts = await prisma.contrast.count({
      where: {
        active: true,
        category: "consonants",
      },
    });

    const vowelsCompleted = new Set(
      trials
        .filter((t) => t.pair.contrast.category === "vowels")
        .map((t) => t.pair.contrast.name)
    ).size;
    const consonantsCompleted = new Set(
      trials
        .filter((t) => t.pair.contrast.category === "consonants")
        .map((t) => t.pair.contrast.name)
    ).size;

    const stats = {
      overall: {
        total: totalTrials,
        correct: correctTrials,
        average: overallAverage,
        completed: uniqueContrasts.size,
        total: totalContrasts,
      },
      vowels: {
        ...categoryStats.vowels,
        completed: vowelsCompleted,
        total: vowelsContrasts,
      },
      consonants: {
        ...categoryStats.consonants,
        completed: consonantsCompleted,
        total: consonantsContrasts,
      },
    };

    res.json({ stats });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
});

// GET /api/admin/overview
// Get overall admin dashboard statistics
router.get("/overview", async (req, res) => {
  try {
    // Total users with quiz activity
    const totalUsers = await prisma.user.count({
      where: {
        trials: {
          some: {},
        },
      },
    });

    // Total trials
    const totalTrials = await prisma.trial.count();

    // Average accuracy across all users
    const correctTrials = await prisma.trial.count({
      where: { isCorrect: true },
    });
    const overallAccuracy =
      totalTrials > 0 ? Math.round((correctTrials / totalTrials) * 100) : 0;

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTrials = await prisma.trial.count({
      where: {
        presentedAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    const newUsers = await prisma.user.count({
      where: {
        trials: {
          some: {
            presentedAt: {
              gte: sevenDaysAgo,
            },
          },
        },
      },
    });

    // Most active contrasts
    const contrastActivity = await prisma.trial.groupBy({
      by: ["pairId"],
      _count: {
        trialId: true,
      },
      orderBy: {
        _count: {
          trialId: "desc",
        },
      },
      take: 10,
    });

    const contrastDetails = await Promise.all(
      contrastActivity.map(async (item) => {
        const pair = await prisma.pair.findUnique({
          where: { pairId: item.pairId },
          include: {
            contrast: {
              select: { name: true },
            },
          },
        });
        return {
          contrastName: pair?.contrast.name || "Unknown",
          trialCount: item._count.trialId,
        };
      })
    );

    const overview = {
      totalUsers,
      totalTrials,
      overallAccuracy,
      recentActivity: {
        trials: recentTrials,
        newUsers,
      },
      topContrasts: contrastDetails,
    };

    res.json({ overview });
  } catch (error) {
    console.error("Error fetching admin overview:", error);
    res.status(500).json({ error: "Failed to fetch admin overview" });
  }
});

export default router;
