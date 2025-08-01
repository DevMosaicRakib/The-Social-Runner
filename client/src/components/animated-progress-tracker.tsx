import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Target, 
  Zap, 
  Award, 
  Clock, 
  MapPin, 
  Activity, 
  TrendingUp,
  Calendar,
  BarChart3,
  CheckCircle,
  Star
} from "lucide-react";
import { useState, useEffect } from "react";

interface ProgressStats {
  completedWorkouts: number;
  totalWorkouts: number;
  totalDistance: number;
  averagePace: string;
  currentStreak: number;
  longestStreak: number;
  weeklyGoal: number;
  weeklyCompleted: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  target?: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface AnimatedProgressTrackerProps {
  stats: ProgressStats;
  achievements: Achievement[];
  planName: string;
  currentWeek: number;
  totalWeeks: number;
}

export function AnimatedProgressTracker({ 
  stats, 
  achievements, 
  planName, 
  currentWeek, 
  totalWeeks 
}: AnimatedProgressTrackerProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({
    completedWorkouts: 0,
    totalDistance: 0,
    currentStreak: 0
  });

  const overallProgress = (stats.completedWorkouts / stats.totalWorkouts) * 100;
  const weeklyProgress = (stats.weeklyCompleted / stats.weeklyGoal) * 100;

  // Animate progress on mount with staggered counter animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(overallProgress);
    }, 500);

    // Animate counters individually
    const animateCounter = (target: number, setter: (value: number) => void, delay: number) => {
      setTimeout(() => {
        let current = 0;
        const increment = target / 30; // 30 frames for smooth animation
        const counterTimer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setter(target);
            clearInterval(counterTimer);
          } else {
            setter(Math.floor(current));
          }
        }, 50);
      }, delay);
    };

    animateCounter(stats.completedWorkouts, (value) => 
      setAnimatedStats(prev => ({ ...prev, completedWorkouts: value })), 800);
    animateCounter(stats.totalDistance, (value) => 
      setAnimatedStats(prev => ({ ...prev, totalDistance: value })), 1000);
    animateCounter(stats.currentStreak, (value) => 
      setAnimatedStats(prev => ({ ...prev, currentStreak: value })), 1200);

    return () => clearTimeout(timer);
  }, [overallProgress, stats]);

  const rarityColors = {
    common: "bg-white border-gray-200 shadow-sm",
    rare: "bg-blue-50 border-blue-200 shadow-sm",
    epic: "bg-purple-50 border-purple-200 shadow-sm",
    legendary: "bg-orange-50 border-orange-200 shadow-md"
  };

  const rarityTextColors = {
    common: "text-gray-900",
    rare: "text-blue-900",
    epic: "text-purple-900",
    legendary: "text-orange-900"
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const pulseVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Overall Progress Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-1">{planName}</h3>
                <p className="text-orange-100 text-sm font-medium">Week {currentWeek} of {totalWeeks}</p>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="bg-white/20 p-3 rounded-full"
              >
                <Trophy className="h-8 w-8 text-white" />
              </motion.div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Overall Progress</span>
                <span className="text-2xl font-bold">{Math.round(animatedProgress)}%</span>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-white/20 rounded-full h-3 overflow-hidden"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${animatedProgress}%` }}
                  transition={{ duration: 1.5, delay: 0.7, ease: "easeOut" }}
                  className="h-full bg-white rounded-full"
                />
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="group"
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200 bg-white">
            <CardContent className="p-6 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors"
              >
                <Activity className="h-8 w-8 text-blue-600" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 150 }}
                className="text-3xl font-bold text-gray-900 mb-1"
              >
                {animatedStats.completedWorkouts}
              </motion.p>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Workouts</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="group"
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200 bg-white">
            <CardContent className="p-6 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors"
              >
                <MapPin className="h-8 w-8 text-green-600" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, type: "spring", stiffness: 150 }}
                className="text-3xl font-bold text-gray-900 mb-1"
              >
                {animatedStats.totalDistance}km
              </motion.p>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Distance</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="group"
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200 bg-white">
            <CardContent className="p-6 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors"
              >
                <Zap className="h-8 w-8 text-orange-600" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, type: "spring", stiffness: 150 }}
                className="text-3xl font-bold text-gray-900 mb-1"
              >
                {animatedStats.currentStreak}
              </motion.p>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Day Streak</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="group"
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200 bg-white">
            <CardContent className="p-6 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors"
              >
                <Clock className="h-8 w-8 text-purple-600" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, type: "spring", stiffness: 150 }}
                className="text-3xl font-bold text-gray-900 mb-1"
              >
                {stats.averagePace}
              </motion.p>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Avg Pace</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Weekly Goal Progress */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">This Week's Target</h3>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">{Math.round(weeklyProgress)}%</p>
                <p className="text-sm text-gray-500">Complete</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">{stats.weeklyCompleted} of {stats.weeklyGoal} workouts completed</span>
                <Badge variant={weeklyProgress >= 100 ? "default" : "secondary"} className="bg-blue-50 text-blue-700 border-blue-200">
                  {stats.weeklyCompleted}/{stats.weeklyGoal}
                </Badge>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 1.2 }}
                className="bg-gray-200 rounded-full h-4 overflow-hidden"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${weeklyProgress}%` }}
                  transition={{ duration: 1.5, delay: 1.4, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                />
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-2xl">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Milestones</h3>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-600">
                  {achievements.filter(a => a.unlocked).length}
                </p>
                <p className="text-sm text-gray-500">Earned</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 + index * 0.15, type: "spring", stiffness: 100 }}
                  whileHover={{ 
                    y: -8, 
                    transition: { duration: 0.3, type: "spring", stiffness: 300 }
                  }}
                  className={`relative p-6 rounded-3xl border-2 transition-all duration-300 ${
                    achievement.unlocked 
                      ? rarityColors[achievement.rarity] + " shadow-lg"
                      : "bg-gray-50 border-gray-200 shadow-sm"
                  }`}
                >
                  {achievement.unlocked && (
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 2 + index * 0.15, type: "spring", stiffness: 200 }}
                      className="absolute -top-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-lg"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </motion.div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <motion.div
                      whileHover={{ 
                        rotate: achievement.unlocked ? [0, -10, 10, 0] : 0,
                        scale: achievement.unlocked ? 1.1 : 1
                      }}
                      transition={{ duration: 0.4 }}
                      className={`p-4 rounded-2xl ${
                        achievement.unlocked 
                          ? "bg-white shadow-md" 
                          : "bg-gray-200"
                      } transition-all duration-200`}
                    >
                      {achievement.icon}
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className={`font-bold text-base ${
                          achievement.unlocked 
                            ? rarityTextColors[achievement.rarity]
                            : "text-gray-500"
                        }`}>
                          {achievement.title}
                        </h4>
                        {achievement.unlocked && (
                          <Badge 
                            className={`text-xs font-semibold ${
                              achievement.rarity === 'legendary' ? 'bg-orange-100 text-orange-700' :
                              achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                              achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {achievement.rarity.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      
                      <p className={`text-sm leading-relaxed mb-3 ${
                        achievement.unlocked ? "text-gray-700" : "text-gray-500"
                      }`}>
                        {achievement.description}
                      </p>
                      
                      {!achievement.unlocked && achievement.progress !== undefined && achievement.target && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 font-medium">Progress</span>
                            <span className="font-bold text-gray-800">
                              {achievement.progress} / {achievement.target}
                            </span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                              transition={{ duration: 1.5, delay: 2.5 + index * 0.15, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Motivational Message */}
      <motion.div 
        variants={itemVariants}
        className="text-center"
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
          <CardContent className="p-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 2.5, type: "spring", stiffness: 100 }}
              className="flex items-center justify-center gap-4 mb-4"
            >
              <div className="bg-white p-3 rounded-full shadow-md">
                <Star className="h-6 w-6 text-orange-500" />
              </div>
              <div className="bg-white p-3 rounded-full shadow-md">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Outstanding Progress!
            </h3>
            <p className="text-gray-700 text-lg">
              You're <span className="font-bold text-orange-600">{Math.round(overallProgress)}%</span> through your training plan.
            </p>
            <p className="text-gray-600 mt-2">
              Every workout brings you closer to your running goals.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}