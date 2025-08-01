import { Request, Response } from "express";
import { storage } from "./storage";

// Sample progress data generator for demo purposes
function generateSampleUserStats(userId: string) {
  return {
    totalDistance: Math.floor(Math.random() * 500) + 50, // 50-550 km
    totalEvents: Math.floor(Math.random() * 25) + 5, // 5-30 events
    streak: Math.floor(Math.random() * 30) + 1, // 1-30 days
    averagePace: "5:30", // Sample pace
    weeklyDistance: Math.floor(Math.random() * 50) + 10, // 10-60 km
    monthlyDistance: Math.floor(Math.random() * 200) + 50, // 50-250 km
  };
}

function generateSampleAchievements(userId: string) {
  const achievements = [
    {
      id: "first-run",
      title: "First Steps",
      description: "Completed your first run with the community!",
      icon: "Trophy",
      rarity: "common" as const,
      unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    },
    {
      id: "early-bird",
      title: "Early Bird",
      description: "Joined a morning run before 7 AM!",
      icon: "Star",
      rarity: "rare" as const,
      unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
    {
      id: "consistent-runner",
      title: "Consistency Champion",
      description: "Maintained a 7-day running streak!",
      icon: "Flame",
      rarity: "epic" as const,
      unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
  ];

  return achievements.filter(() => Math.random() > 0.4); // Randomly show some achievements
}

function generateSampleProgress(userId: string, goalId: number) {
  return {
    goalId,
    progress: Math.floor(Math.random() * 100),
    milestones: [
      {
        id: `${goalId}-milestone-1`,
        name: "First Training Week",
        target: 3,
        current: Math.min(3, Math.floor(Math.random() * 4)),
        unit: "runs",
        completed: Math.random() > 0.3,
        achievedAt: Math.random() > 0.5 ? new Date().toISOString() : undefined,
      },
      {
        id: `${goalId}-milestone-2`,
        name: "Building Endurance",
        target: 10,
        current: Math.floor(Math.random() * 12),
        unit: "runs",
        completed: Math.random() > 0.6,
        achievedAt: Math.random() > 0.5 ? new Date().toISOString() : undefined,
      },
      {
        id: `${goalId}-milestone-3`,
        name: "Distance Milestone",
        target: 25,
        current: Math.floor(Math.random() * 30),
        unit: "km",
        completed: Math.random() > 0.7,
        achievedAt: Math.random() > 0.5 ? new Date().toISOString() : undefined,
      },
    ],
    lastUpdated: new Date().toISOString(),
  };
}

export async function getUserStats(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // For now, generate sample data
    // In production, this would fetch from database
    const stats = generateSampleUserStats(userId);
    
    res.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Failed to fetch user statistics" });
  }
}

export async function getUserProgress(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Get user's goals and generate progress for each
    const goals = await storage.getUserGoals(userId);
    const progressData = goals.map(goal => generateSampleProgress(userId, goal.id));
    
    res.json(progressData);
  } catch (error) {
    console.error("Error fetching user progress:", error);
    res.status(500).json({ message: "Failed to fetch progress data" });
  }
}

export async function getUserAchievements(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { recent } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    let achievements = generateSampleAchievements(userId);
    
    // Filter to recent achievements if requested
    if (recent === "true") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      achievements = achievements.filter(achievement => 
        new Date(achievement.unlockedAt) >= oneWeekAgo
      );
    }
    
    res.json(achievements);
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    res.status(500).json({ message: "Failed to fetch achievements" });
  }
}

export async function updateProgress(req: Request, res: Response) {
  try {
    const { goalId } = req.params;
    const { activity } = req.body;
    
    if (!goalId) {
      return res.status(400).json({ message: "Goal ID is required" });
    }

    if (!activity) {
      return res.status(400).json({ message: "Activity data is required" });
    }

    // For now, return success
    // In production, this would update the database
    const updatedProgress = generateSampleProgress("", parseInt(goalId));
    
    res.json(updatedProgress);
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ message: "Failed to update progress" });
  }
}