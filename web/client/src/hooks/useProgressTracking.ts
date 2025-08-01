import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ProgressData {
  goalId: number;
  progress: number;
  milestones: Milestone[];
  lastUpdated: string;
}

interface Milestone {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
  achievedAt?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
}

interface UserStats {
  totalDistance: number;
  totalEvents: number;
  streak: number;
  averagePace?: string;
  weeklyDistance: number;
  monthlyDistance: number;
}

export function useProgressTracking(userId: string) {
  const queryClient = useQueryClient();
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);

  // Fetch user's progress data
  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ["/api/progress", userId],
    queryFn: async () => {
      const response = await fetch(`/api/progress/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch progress");
      return response.json();
    },
    enabled: !!userId,
    retry: false,
  });

  // Fetch user statistics
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats", userId],
    queryFn: async () => {
      const response = await fetch(`/api/stats/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
    enabled: !!userId,
    retry: false,
  });

  // Fetch recent achievements
  const { data: achievements = [] } = useQuery({
    queryKey: ["/api/achievements", userId],
    queryFn: async () => {
      const response = await fetch(`/api/achievements/${userId}?recent=true`);
      if (!response.ok) throw new Error("Failed to fetch achievements");
      return response.json();
    },
    enabled: !!userId,
    retry: false,
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (data: { goalId: number; activity: any }) => {
      return await apiRequest(`/api/progress/${data.goalId}`, {
        method: "PATCH",
        body: JSON.stringify({ activity: data.activity }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
    },
  });

  // Calculate progress based on activities
  const calculateGoalProgress = (goal: any, activities: any[]) => {
    if (!activities || activities.length === 0) return 0;

    // Filter activities relevant to this goal
    const relevantActivities = activities.filter(activity => {
      // Match by distance type or training activities
      return activity.type === "Run" || activity.type === "Race";
    });

    if (relevantActivities.length === 0) return 0;

    // Calculate progress based on goal type
    switch (goal.distance) {
      case "5k":
        return Math.min(100, (relevantActivities.length / 20) * 100); // 20 runs for 5K goal
      case "10k":
        return Math.min(100, (relevantActivities.length / 30) * 100); // 30 runs for 10K goal
      case "half_marathon":
        return Math.min(100, (relevantActivities.length / 40) * 100); // 40 runs for half marathon
      case "marathon":
        return Math.min(100, (relevantActivities.length / 60) * 100); // 60 runs for marathon
      case "ultra_marathon":
        return Math.min(100, (relevantActivities.length / 80) * 100); // 80 runs for ultra
      default:
        return Math.min(100, (relevantActivities.length / 25) * 100);
    }
  };

  // Generate milestones for a goal
  const generateMilestones = (goal: any, currentProgress: number) => {
    const baseMilestones = [
      { name: "First Training Run", target: 1, unit: "runs" },
      { name: "Building Base", target: 5, unit: "runs" },
      { name: "Consistency Building", target: 10, unit: "runs" },
      { name: "Halfway There", target: 20, unit: "runs" },
      { name: "Almost Ready", target: 35, unit: "runs" },
      { name: "Race Ready", target: 50, unit: "runs" },
    ];

    // Adjust targets based on goal difficulty
    const multiplier = goal.difficulty === "elite" ? 1.5 : 
                     goal.difficulty === "advanced" ? 1.3 :
                     goal.difficulty === "intermediate" ? 1.1 : 1;

    return baseMilestones.map((milestone, index) => {
      const adjustedTarget = Math.round(milestone.target * multiplier);
      const current = Math.round((currentProgress / 100) * adjustedTarget);
      
      return {
        id: `${goal.id}-milestone-${index}`,
        name: milestone.name,
        target: adjustedTarget,
        current: Math.min(current, adjustedTarget),
        unit: milestone.unit,
        completed: current >= adjustedTarget,
        achievedAt: current >= adjustedTarget ? new Date().toISOString() : undefined,
      };
    });
  };

  // Check for new achievements
  const checkForAchievements = (stats: UserStats, goals: any[]) => {
    const newAchievements: Achievement[] = [];
    const existingAchievementIds = achievements.map((a: Achievement) => a.id);

    // Distance achievements
    if (stats.totalDistance >= 100 && !existingAchievementIds.includes("distance-100")) {
      newAchievements.push({
        id: "distance-100",
        title: "Century Runner",
        description: "Completed 100km total distance!",
        icon: "Trophy",
        rarity: "rare",
        unlockedAt: new Date().toISOString(),
      });
    }

    if (stats.totalDistance >= 500 && !existingAchievementIds.includes("distance-500")) {
      newAchievements.push({
        id: "distance-500",
        title: "Distance Warrior",
        description: "Completed 500km total distance!",
        icon: "Crown",
        rarity: "epic",
        unlockedAt: new Date().toISOString(),
      });
    }

    // Streak achievements
    if (stats.streak >= 7 && !existingAchievementIds.includes("streak-7")) {
      newAchievements.push({
        id: "streak-7",
        title: "Week Warrior",
        description: "Maintained a 7-day training streak!",
        icon: "Flame",
        rarity: "common",
        unlockedAt: new Date().toISOString(),
      });
    }

    if (stats.streak >= 30 && !existingAchievementIds.includes("streak-30")) {
      newAchievements.push({
        id: "streak-30",
        title: "Monthly Master",
        description: "Incredible 30-day training streak!",
        icon: "Star",
        rarity: "legendary",
        unlockedAt: new Date().toISOString(),
      });
    }

    // Goal completion achievements
    const completedGoals = goals.filter(goal => (goal.progress || 0) >= 100);
    if (completedGoals.length >= 1 && !existingAchievementIds.includes("first-goal")) {
      newAchievements.push({
        id: "first-goal",
        title: "Goal Crusher",
        description: "Completed your first training goal!",
        icon: "Target",
        rarity: "rare",
        unlockedAt: new Date().toISOString(),
      });
    }

    return newAchievements;
  };

  // Update progress when user completes activities
  const updateProgress = (goalId: number, activity: any) => {
    updateProgressMutation.mutate({ goalId, activity });
  };

  useEffect(() => {
    if (achievements && achievements.length > 0) {
      // Show only achievements from the last 7 days
      const recentOnly = achievements.filter((achievement: Achievement) => {
        const achievedDate = new Date(achievement.unlockedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return achievedDate >= weekAgo;
      });
      setRecentAchievements(recentOnly);
    }
  }, [achievements]);

  return {
    progressData,
    userStats,
    recentAchievements,
    updateProgress,
    calculateGoalProgress,
    generateMilestones,
    checkForAchievements,
    isLoading: progressLoading || statsLoading,
    updateProgressMutation,
  };
}