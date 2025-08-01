import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Crown, 
  Medal,
  Award,
  Flame,
  Heart,
  MapPin,
  Calendar,
  Users,
  Timer,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  X
} from "lucide-react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
  category: "training" | "social" | "consistency" | "distance" | "special";
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface GamifiedAchievementsProps {
  achievements: Achievement[];
  onAchievementClaim?: (achievement: Achievement) => void;
  showUnlockedOnly?: boolean;
  enableCelebrations?: boolean;
}

const rarityConfig = {
  common: {
    color: "bg-gray-100 text-gray-800 border-gray-300",
    glow: "shadow-gray-200",
    particles: "#9CA3AF"
  },
  rare: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    glow: "shadow-blue-200",
    particles: "#3B82F6"
  },
  epic: {
    color: "bg-purple-100 text-purple-800 border-purple-300",
    glow: "shadow-purple-200",
    particles: "#8B5CF6"
  },
  legendary: {
    color: "bg-orange-100 text-orange-800 border-orange-300",
    glow: "shadow-orange-200",
    particles: "#F97316"
  }
};

const categoryIcons = {
  training: <Target className="w-5 h-5" />,
  social: <Users className="w-5 h-5" />,
  consistency: <Calendar className="w-5 h-5" />,
  distance: <MapPin className="w-5 h-5" />,
  special: <Crown className="w-5 h-5" />
};

export default function GamifiedAchievements({ 
  achievements, 
  onAchievementClaim,
  showUnlockedOnly = false,
  enableCelebrations = true
}: GamifiedAchievementsProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [celebratingAchievement, setCelebratingAchievement] = useState<Achievement | null>(null);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const { toast } = useToast();

  const filteredAchievements = showUnlockedOnly 
    ? achievements.filter(a => a.unlockedAt)
    : achievements;

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalPoints = achievements
    .filter(a => a.unlockedAt)
    .reduce((sum, a) => sum + a.points, 0);

  // Create celebration particles
  const createParticles = () => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100
    }));
    setParticles(newParticles);
    
    setTimeout(() => setParticles([]), 3000);
  };

  // Handle achievement unlock celebration
  const handleAchievementUnlock = (achievement: Achievement) => {
    if (!enableCelebrations) return;
    
    setCelebratingAchievement(achievement);
    createParticles();
    
    toast({
      title: "🎉 Achievement Unlocked!",
      description: `${achievement.title} - ${achievement.points} points earned!`,
      duration: 5000,
    });

    setTimeout(() => {
      setCelebratingAchievement(null);
    }, 4000);
  };

  // Check for newly unlocked achievements
  useEffect(() => {
    const recentlyUnlocked = achievements.filter(a => 
      a.unlockedAt && 
      new Date().getTime() - new Date(a.unlockedAt).getTime() < 5000
    );
    
    if (recentlyUnlocked.length > 0 && enableCelebrations) {
      recentlyUnlocked.forEach(achievement => {
        setTimeout(() => handleAchievementUnlock(achievement), 500);
      });
    }
  }, [achievements, enableCelebrations]);

  const getProgressPercentage = (achievement: Achievement) => {
    if (!achievement.progress || !achievement.maxProgress) return 0;
    return Math.min((achievement.progress / achievement.maxProgress) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-6 h-6 text-orange-600 mr-2" />
              <span className="text-2xl font-bold text-orange-900">{unlockedCount}</span>
            </div>
            <p className="text-sm text-orange-700">Achievements Unlocked</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-6 h-6 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-blue-900">{totalPoints}</span>
            </div>
            <p className="text-sm text-blue-700">Total Points</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-purple-600 mr-2" />
              <span className="text-2xl font-bold text-purple-900">
                {Math.round((unlockedCount / achievements.length) * 100)}%
              </span>
            </div>
            <p className="text-sm text-purple-700">Completion Rate</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredAchievements.map((achievement, index) => {
            const isUnlocked = !!achievement.unlockedAt;
            const rarity = rarityConfig[achievement.rarity];
            const progress = getProgressPercentage(achievement);
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ 
                  scale: 1.02, 
                  boxShadow: "0 8px 25px rgba(0,0,0,0.1)" 
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-300 ${
                    isUnlocked 
                      ? `${rarity.color} ${rarity.glow} shadow-lg` 
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}
                  onClick={() => setSelectedAchievement(achievement)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className={`p-2 rounded-full ${
                            isUnlocked ? "bg-white" : "bg-gray-200"
                          }`}
                          animate={isUnlocked ? { 
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          {achievement.icon}
                        </motion.div>
                        {categoryIcons[achievement.category]}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {achievement.rarity}
                      </Badge>
                    </div>

                    <h3 className={`font-semibold mb-1 ${
                      isUnlocked ? "text-gray-900" : "text-gray-500"
                    }`}>
                      {achievement.title}
                    </h3>
                    
                    <p className={`text-sm mb-3 ${
                      isUnlocked ? "text-gray-700" : "text-gray-400"
                    }`}>
                      {achievement.description}
                    </p>

                    {/* Progress Bar for Locked Achievements */}
                    {!isUnlocked && achievement.progress !== undefined && achievement.maxProgress && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-orange-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">{achievement.points} pts</span>
                      </div>
                      
                      {isUnlocked && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </motion.div>
                      )}
                    </div>

                    {isUnlocked && achievement.unlockedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-full">
                    {selectedAchievement.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedAchievement.title}</h2>
                    <Badge className={rarityConfig[selectedAchievement.rarity].color}>
                      {selectedAchievement.rarity}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAchievement(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-gray-700 mb-4">{selectedAchievement.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>Category: {selectedAchievement.category}</span>
                <span>{selectedAchievement.points} points</span>
              </div>

              {selectedAchievement.unlockedAt ? (
                <div className="text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <p className="text-green-700 font-medium">Achievement Unlocked!</p>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Timer className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Keep going to unlock this achievement!</p>
                  {selectedAchievement.progress !== undefined && selectedAchievement.maxProgress && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${getProgressPercentage(selectedAchievement)}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedAchievement.progress} / {selectedAchievement.maxProgress}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {selectedAchievement.unlockedAt && onAchievementClaim && (
                <Button 
                  className="w-full mt-4"
                  onClick={() => {
                    onAchievementClaim(selectedAchievement);
                    setSelectedAchievement(null);
                  }}
                >
                  <Award className="w-4 h-4 mr-2" />
                  Claim Reward
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {celebratingAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            {/* Particles */}
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: rarityConfig[celebratingAchievement.rarity].particles,
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0],
                  y: [-20, -100],
                }}
                transition={{
                  duration: 3,
                  ease: "easeOut",
                  delay: Math.random() * 0.5,
                }}
              />
            ))}

            {/* Main Celebration */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white rounded-lg p-8 shadow-2xl border-4 border-orange-300 text-center max-w-sm"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 0.6, repeat: 2 }}
                className="mb-4"
              >
                <div className="p-4 bg-orange-100 rounded-full inline-block">
                  {celebratingAchievement.icon}
                </div>
              </motion.div>
              
              <h2 className="text-2xl font-bold mb-2">🎉 Achievement Unlocked!</h2>
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                {celebratingAchievement.title}
              </h3>
              <p className="text-gray-700 mb-4">{celebratingAchievement.description}</p>
              
              <div className="flex items-center justify-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-orange-900">
                  +{celebratingAchievement.points} points!
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Pre-defined achievement templates
export const defaultAchievements: Achievement[] = [
  {
    id: "first-run",
    title: "First Steps",
    description: "Complete your first recorded run",
    icon: <Trophy className="w-5 h-5 text-orange-600" />,
    rarity: "common",
    points: 50,
    category: "training"
  },
  {
    id: "week-streak",
    title: "Week Warrior",
    description: "Run for 7 consecutive days",
    icon: <Flame className="w-5 h-5 text-red-600" />,
    rarity: "rare",
    points: 150,
    category: "consistency"
  },
  {
    id: "social-butterfly",
    title: "Social Butterfly",
    description: "Join 5 community events",
    icon: <Users className="w-5 h-5 text-blue-600" />,
    rarity: "rare",
    points: 200,
    category: "social"
  },
  {
    id: "marathon-distance",
    title: "Marathon Legend",
    description: "Complete a marathon distance (42.2km)",
    icon: <Crown className="w-5 h-5 text-purple-600" />,
    rarity: "legendary",
    points: 1000,
    category: "distance"
  },
  {
    id: "speed-demon",
    title: "Speed Demon",
    description: "Achieve a sub-20 minute 5K",
    icon: <Zap className="w-5 h-5 text-yellow-600" />,
    rarity: "epic",
    points: 500,
    category: "training"
  },
  {
    id: "early-bird",
    title: "Early Bird",
    description: "Complete 10 runs before 7 AM",
    icon: <Heart className="w-5 h-5 text-pink-600" />,
    rarity: "epic",
    points: 300,
    category: "special"
  }
];