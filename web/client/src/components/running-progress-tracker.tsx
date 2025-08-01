import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar, 
  Timer, 
  Zap, 
  Star,
  Medal,
  Crown,
  Flame
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Goal {
  id: number;
  eventName: string;
  distance: string;
  difficulty: string;
  eventDate?: string;
  targetTime?: string;
  status: string;
  progress?: number;
  milestones?: Milestone[];
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
  icon: React.ComponentType<any>;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
}

interface RunningProgressTrackerProps {
  goals: Goal[];
  userStats?: {
    totalDistance: number;
    totalEvents: number;
    streak: number;
    averagePace?: string;
  };
  recentAchievements?: Achievement[];
}

const MOTIVATIONAL_MESSAGES = [
  "Every mile is a milestone! 🏃‍♂️",
  "You're building unstoppable momentum! 💪",
  "Progress over perfection - you've got this! ⭐",
  "Your dedication is paying off! 🔥",
  "Keep pushing those boundaries! 🚀",
  "Amazing progress - stay consistent! 👏",
  "You're getting stronger every day! 💯",
  "The finish line is getting closer! 🏁"
];

const ACHIEVEMENT_RARITIES = {
  common: { color: "bg-gray-100 text-gray-800", glow: "shadow-gray-200" },
  rare: { color: "bg-blue-100 text-blue-800", glow: "shadow-blue-200" },
  epic: { color: "bg-purple-100 text-purple-800", glow: "shadow-purple-200" },
  legendary: { color: "bg-yellow-100 text-yellow-800", glow: "shadow-yellow-200" }
};

export default function RunningProgressTracker({ 
  goals, 
  userStats, 
  recentAchievements = [] 
}: RunningProgressTrackerProps) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(goals[0] || null);
  const [showMotivation, setShowMotivation] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [celebratingAchievement, setCelebratingAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    // Show motivational message when progress increases
    if (selectedGoal?.progress && selectedGoal.progress > 0) {
      const randomMessage = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
      setCurrentMessage(randomMessage);
      setShowMotivation(true);
      setTimeout(() => setShowMotivation(false), 3000);
    }
  }, [selectedGoal?.progress]);

  // Calculate overall progress across all goals
  const overallProgress = goals.length > 0 
    ? goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / goals.length 
    : 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-blue-100 text-blue-800";
      case "advanced": return "bg-orange-100 text-orange-800";
      case "elite": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDistanceColor = (distance: string) => {
    switch (distance?.toLowerCase()) {
      case "5k": case "10k": return "bg-emerald-100 text-emerald-800";
      case "half_marathon": return "bg-yellow-100 text-yellow-800";
      case "marathon": case "ultra_marathon": return "bg-purple-100 text-purple-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const calculateDaysUntilEvent = (eventDate?: string) => {
    if (!eventDate) return null;
    const today = new Date();
    const event = new Date(eventDate);
    const diffTime = event.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderAchievementCelebration = () => {
    if (!celebratingAchievement) return null;

    const rarity = ACHIEVEMENT_RARITIES[celebratingAchievement.rarity];
    const Icon = celebratingAchievement.icon;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setCelebratingAchievement(null)}
        >
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            className={cn(
              "bg-white rounded-lg p-8 max-w-md mx-4 text-center",
              rarity.glow,
              "shadow-2xl"
            )}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 0.6,
                repeat: 2
              }}
              className="mb-4"
            >
              <Icon className="h-16 w-16 mx-auto text-orange-600" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Achievement Unlocked!
            </h3>
            
            <Badge className={cn("mb-4", rarity.color)}>
              {celebratingAchievement.rarity.toUpperCase()}
            </Badge>
            
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              {celebratingAchievement.title}
            </h4>
            
            <p className="text-gray-600 mb-6">
              {celebratingAchievement.description}
            </p>
            
            <Button onClick={() => setCelebratingAchievement(null)}>
              Awesome!
            </Button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="space-y-6">
      {/* Achievement Celebration Modal */}
      {renderAchievementCelebration()}

      {/* Motivational Message */}
      <AnimatePresence>
        {showMotivation && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg text-center font-medium shadow-lg"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            >
              {currentMessage}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overall Progress Summary */}
      {userStats && (
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Your Running Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-2xl font-bold text-orange-600">
                  {userStats.totalDistance.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Total KM</div>
              </motion.div>
              
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-2xl font-bold text-blue-600">
                  {userStats.totalEvents}
                </div>
                <div className="text-sm text-gray-600">Events Joined</div>
              </motion.div>
              
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                  {userStats.streak}
                  <Flame className="h-5 w-5" />
                </div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </motion.div>
              
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-2xl font-bold text-purple-600">
                  {userStats.averagePace || "N/A"}
                </div>
                <div className="text-sm text-gray-600">Avg Pace</div>
              </motion.div>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Overall Progress</span>
                <span className="font-medium">{Math.round(overallProgress)}%</span>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Progress 
                  value={overallProgress} 
                  className="h-2"
                />
              </motion.div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals Progress */}
      {goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Goal Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Goal Selection Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {goals.map((goal) => (
                <motion.button
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    selectedGoal?.id === goal.id
                      ? "bg-orange-100 text-orange-800 border-2 border-orange-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {goal.eventName}
                </motion.button>
              ))}
            </div>

            {/* Selected Goal Details */}
            {selectedGoal && (
              <motion.div
                key={selectedGoal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge className={getDistanceColor(selectedGoal.distance)}>
                    {selectedGoal.distance.replace('_', ' ')}
                  </Badge>
                  <Badge className={getDifficultyColor(selectedGoal.difficulty)}>
                    {selectedGoal.difficulty}
                  </Badge>
                  {selectedGoal.eventDate && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {calculateDaysUntilEvent(selectedGoal.eventDate)} days
                    </Badge>
                  )}
                  {selectedGoal.targetTime && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {selectedGoal.targetTime}
                    </Badge>
                  )}
                </div>

                {/* Progress Bar with Animation */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Training Progress</span>
                    <span className="font-medium">{Math.round(selectedGoal.progress || 0)}%</span>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                    <Progress 
                      value={selectedGoal.progress || 0} 
                      className="h-3"
                    />
                  </motion.div>
                </div>

                {/* Milestones */}
                {selectedGoal.milestones && selectedGoal.milestones.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Milestones
                    </h4>
                    <div className="space-y-2">
                      {selectedGoal.milestones.map((milestone) => (
                        <motion.div
                          key={milestone.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border",
                            milestone.completed 
                              ? "bg-green-50 border-green-200" 
                              : "bg-gray-50 border-gray-200"
                          )}
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center gap-3">
                            <motion.div
                              animate={milestone.completed ? { rotate: 360 } : {}}
                              transition={{ duration: 0.5 }}
                            >
                              {milestone.completed ? (
                                <Trophy className="h-5 w-5 text-yellow-500" />
                              ) : (
                                <Target className="h-5 w-5 text-gray-400" />
                              )}
                            </motion.div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {milestone.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {milestone.current}/{milestone.target} {milestone.unit}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={cn(
                              "text-sm font-medium",
                              milestone.completed ? "text-green-600" : "text-gray-500"
                            )}>
                              {milestone.completed ? "Completed!" : 
                               `${Math.round((milestone.current / milestone.target) * 100)}%`}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-orange-600" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {recentAchievements.map((achievement) => {
                const Icon = achievement.icon;
                const rarity = ACHIEVEMENT_RARITIES[achievement.rarity];
                
                return (
                  <motion.div
                    key={achievement.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border cursor-pointer",
                      rarity.color,
                      rarity.glow
                    )}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCelebratingAchievement(achievement)}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Icon className="h-8 w-8 text-orange-600" />
                    </motion.div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {achievement.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        {achievement.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge className={rarity.color}>
                      {achievement.rarity}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Goals Set Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Set your first training goal to start tracking your progress!
            </p>
            <Button>Add Your First Goal</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}