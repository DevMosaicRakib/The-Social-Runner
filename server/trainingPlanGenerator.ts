// Training Plan Generator - Creates detailed workout schedules with authentic running terminology
export interface TrainingPlanInput {
  goal: {
    type: string; // "race_prep", "fitness_improvement", "weight_loss", "general_fitness"
    raceType?: string; // "5k", "10k", "half_marathon", "marathon"
    raceDate?: string;
    targetDistance?: string;
  };
  fitness: {
    currentLevel: string; // "beginner", "intermediate", "advanced"
    weeklyDistance: number; // current weekly km
    longestRun: number; // current longest run km
    experience: string; // "new", "occasional", "regular", "experienced"
  };
  preferences: {
    daysPerWeek: number;
    preferredDays: string[];
    timeAvailable: string; // "30min", "45min", "60min", "90min+"
    location: string; // "outdoor", "treadmill", "both"
    adaptToPace: boolean;
  };
  schedule: {
    duration: number; // weeks
    startDate: string;
  };
}

export interface WorkoutSession {
  type: string; // "easy_run", "tempo_run", "fartlek", "hills", "intervals", "long_run", "rest", "cross_training", "track_work", "recovery_run"
  name: string; // Display name like "Fartlek Run", "Hill Session", "Long Run", etc.
  distance?: string;
  duration?: string;
  pace?: string;
  description?: string; // Detailed workout description
  warmup?: string;
  cooldown?: string;
  completed?: boolean;
  intensity?: "low" | "moderate" | "high";
}

export interface WeeklySchedule {
  [week: number]: {
    focus: string;
    totalDistance: string;
    monday?: WorkoutSession;
    tuesday?: WorkoutSession;
    wednesday?: WorkoutSession;
    thursday?: WorkoutSession;
    friday?: WorkoutSession;
    saturday?: WorkoutSession;
    sunday?: WorkoutSession;
  };
}

// Authentic running session templates based on professional training plans
const getRunningSessionTemplates = (fitnessLevel: string, week: number, totalWeeks: number) => {
  const phase = Math.ceil((week / totalWeeks) * 3);
  const isAdvanced = fitnessLevel === "advanced";
  
  // Realistic paces based on fitness level (using marathon pace as reference)
  const paces = {
    beginner: {
      easy: "6:00-6:30/km",
      recovery: "6:30-7:00/km", 
      tempo: "5:30-5:45/km",
      long: "6:00-6:15/km"
    },
    intermediate: {
      easy: "5:30-6:00/km",
      recovery: "6:00-6:30/km",
      tempo: "5:00-5:15/km", 
      long: "5:30-5:45/km"
    },
    advanced: {
      easy: "5:10-5:30/km",
      recovery: "5:30-6:00/km",
      tempo: "4:44-4:55/km",
      long: "5:10-5:25/km"
    }
  };
  
  const levelPaces = paces[fitnessLevel as keyof typeof paces] || paces.intermediate;
  
  return {
    easy_run: {
      type: "easy_run",
      name: "Easy Run",
      description: "Conversational pace aerobic run",
      pace: levelPaces.easy,
      intensity: "low" as const,
      warmup: "10min easy jog",
      cooldown: "5min walk + stretching"
    },
    
    recovery_run: {
      type: "recovery_run", 
      name: "Recovery Run",
      description: "Very easy pace for active recovery",
      pace: levelPaces.recovery,
      intensity: "low" as const,
      duration: "30-40min"
    },
    
    tempo_run: {
      type: "tempo_run",
      name: "Tempo Run", 
      description: "Comfortably hard effort, threshold pace + warm-up & cool down",
      pace: `${levelPaces.tempo} effort`,
      intensity: "high" as const,
      warmup: "1.5km easy + dynamic stretches",
      cooldown: "1.5km easy"
    },
    
    fartlek: {
      type: "fartlek",
      name: "Fartlek Run",
      description: "Swedish speed play - varied pace throughout",
      pace: "Variable from easy to 5K pace",
      intensity: "moderate" as const,
      warmup: "10-15min easy",
      cooldown: "10min easy"
    },
    
    hills: {
      type: "hills", 
      name: isAdvanced ? "Kenyan Hills" : "Hill Session",
      description: isAdvanced ? "3 x 10min with 2min recovery jog between sets + warm-up/cool-down" : "Hill repeats for strength and power",
      pace: "5K-10K effort uphill",
      intensity: "high" as const,
      warmup: "10min easy + 4 x 100m strides",
      cooldown: "10min easy"
    },
    
    track_work: {
      type: "track_work",
      name: phase === 1 ? "Aerobic Intervals" : phase === 2 ? "VO2 Max Intervals" : "Race Pace Work",
      description: getTrackWorkout(week, fitnessLevel, phase),
      pace: phase === 1 ? "10K pace" : phase === 2 ? "5K pace" : "Race pace",
      intensity: "high" as const,
      warmup: "800m easy + 400m warm-up",
      cooldown: "400m easy"
    },
    
    long_run: {
      type: "long_run",
      name: "Long Run",
      description: "Aerobic endurance building run",
      pace: `${levelPaces.long} easy, off road if possible`,
      intensity: week <= totalWeeks/2 ? "low" as const : "moderate" as const,
      warmup: "Start very easy for first 2km",
      cooldown: "10min easy walk + full stretch"
    },
    
    cross_training: {
      type: "cross_training",
      name: "Cross Training",
      description: "Focus on upper body and core strength or yoga/pilates",
      duration: "45-60min",
      intensity: "low" as const
    },
    
    rest: {
      type: "rest",
      name: "Rest Day",
      description: "Complete rest or gentle yoga/stretching",
      intensity: "low" as const
    }
  };
};

const getTrackWorkout = (week: number, fitnessLevel: string, phase: number): string => {
  if (fitnessLevel === "advanced") {
    if (phase === 1) return "6 x 800m with 400m recovery jog @ 3:12/800m + warm-up/cool-down";
    if (phase === 2) return "5 x 1km with 400m recovery @ 3:56/km + warm-up/cool-down"; 
    return "3 x 1600m with 600m recovery @ 6:20/1600m + warm-up/cool-down";
  } else if (fitnessLevel === "intermediate") {
    if (phase === 1) return "4 x 800m with 400m recovery @ 3:45/800m + warm-up/cool-down";
    if (phase === 2) return "6 x 400m with 200m recovery @ 1:55/400m + warm-up/cool-down";
    return "3 x 1200m with 400m recovery @ 5:30/1200m + warm-up/cool-down";
  } else {
    if (phase === 1) return "4 x 400m with 200m walk recovery @ 2:10/400m + warm-up/cool-down";
    if (phase === 2) return "5 x 600m with 200m jog recovery @ 3:15/600m + warm-up/cool-down";
    return "3 x 800m with 400m recovery @ 4:20/800m + warm-up/cool-down";
  }
};

export function generateTrainingPlan(input: TrainingPlanInput): WeeklySchedule {
  const { goal, fitness, preferences, schedule } = input;
  const weeklySchedule: WeeklySchedule = {};
  
  // Calculate realistic progressive distances based on fitness level
  const calculateWeeklyDistance = (week: number) => {
    let baseDistance = fitness.weeklyDistance;
    
    // Ensure realistic base distances by fitness level
    if (fitness.currentLevel === "beginner") {
      baseDistance = Math.min(baseDistance, 20); // Cap beginners at 20km/week start
    } else if (fitness.currentLevel === "intermediate") {
      baseDistance = Math.min(baseDistance, 40); // Cap intermediate at 40km/week start  
    } else {
      baseDistance = Math.min(baseDistance, 60); // Cap advanced at 60km/week start
    }
    
    // Realistic 10% rule progression (max 10% increase per week)
    const progressionFactor = Math.min(1 + (week - 1) * 0.1, 1.5); // Max 50% increase over entire plan
    const weeklyDistance = Math.round(baseDistance * progressionFactor);
    
    // Apply fitness level caps
    const maxWeekly = fitness.currentLevel === "beginner" ? 35 : 
                      fitness.currentLevel === "intermediate" ? 60 : 85;
    
    return Math.min(weeklyDistance, maxWeekly);
  };
  
  // Main plan generation logic
  for (let week = 1; week <= schedule.duration; week++) {
    const weeklyDistance = calculateWeeklyDistance(week);
    const weekData: any = {
      focus: getWeekFocus(week, goal.type, schedule.duration),
      totalDistance: `${weeklyDistance}km`
    };
    
    const availableDays = preferences.preferredDays;
    const templates = getRunningSessionTemplates(fitness.currentLevel, week, schedule.duration);
    
    // 3-day plan structure with realistic distances
    if (preferences.daysPerWeek === 3) {
      const easyDistance = Math.max(3, Math.min(8, Math.round(weeklyDistance * 0.25))); // 3-8km
      const tempoDistance = Math.max(5, Math.min(10, Math.round(weeklyDistance * 0.35))); // 5-10km  
      const longDistance = Math.max(8, Math.min(16, Math.round(weeklyDistance * 0.4))); // 8-16km
      
      const workoutPlan = [
        { day: availableDays[0], session: { ...templates.easy_run, distance: `${easyDistance}km` }},
        { day: availableDays[1], session: { ...templates.tempo_run, distance: `${tempoDistance}km` }},
        { day: availableDays[2], session: { ...templates.long_run, distance: `${longDistance}km` }}
      ];
      
      workoutPlan.forEach(({ day, session }) => {
        weekData[day] = { ...session, completed: false };
      });
    }
    
    // 4-day plan structure with realistic distances
    else if (preferences.daysPerWeek === 4) {
      const recoveryDistance = Math.max(3, Math.min(6, Math.round(weeklyDistance * 0.15))); // 3-6km
      const trackDistance = Math.max(6, Math.min(10, Math.round(weeklyDistance * 0.25))); // 6-10km (includes warm-up/cool-down)
      const tempoDistance = Math.max(8, Math.min(13, Math.round(weeklyDistance * 0.3))); // 8-13km
      const longDistance = Math.max(12, Math.min(22, Math.round(weeklyDistance * 0.35))); // 12-22km
      
      const workoutPlan = [
        { day: availableDays[0], session: { ...templates.recovery_run, distance: `${recoveryDistance}km` }},
        { day: availableDays[1], session: { ...templates.track_work, distance: `${trackDistance}km` }},
        { day: availableDays[2], session: { ...templates.tempo_run, distance: `${tempoDistance}km` }},
        { day: availableDays[3], session: { ...templates.long_run, distance: `${longDistance}km` }}
      ];
      
      workoutPlan.forEach(({ day, session }) => {
        weekData[day] = { ...session, completed: false };
      });
    }
    
    // 5-day plan structure with realistic distances  
    else if (preferences.daysPerWeek === 5) {
      const recoveryDistance = Math.max(3, Math.min(5, Math.round(weeklyDistance * 0.12))); // 3-5km
      const trackDistance = Math.max(6, Math.min(10, Math.round(weeklyDistance * 0.18))); // 6-10km
      const fartlekDistance = Math.max(6, Math.min(10, Math.round(weeklyDistance * 0.18))); // 6-10km
      const tempoDistance = Math.max(10, Math.min(16, Math.round(weeklyDistance * 0.25))); // 10-16km
      const longDistance = Math.max(16, Math.min(32, Math.round(weeklyDistance * 0.27))); // 16-32km
      
      const workoutPlan = [
        { day: availableDays[0], session: { ...templates.recovery_run, distance: `${recoveryDistance}km` }},
        { day: availableDays[1], session: { ...templates.track_work, distance: `${trackDistance}km` }},
        { day: availableDays[2], session: week % 2 === 1 ? { ...templates.fartlek, distance: `${fartlekDistance}km` } : { ...templates.hills, distance: `${fartlekDistance}km` }},
        { day: availableDays[3], session: { ...templates.tempo_run, distance: `${tempoDistance}km` }},
        { day: availableDays[4], session: { ...templates.long_run, distance: `${longDistance}km` }}
      ];
      
      workoutPlan.forEach(({ day, session }) => {
        weekData[day] = { ...session, completed: false };
      });
    }

    // Add rest days for non-preferred days
    const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    allDays.forEach(day => {
      if (!weekData[day]) {
        weekData[day] = {
          ...templates.rest,
          completed: false
        };
      }
    });

    weeklySchedule[week] = weekData;
  }

  return weeklySchedule;
}

function getWeekFocus(week: number, goalType: string, totalWeeks: number): string {
  const phase = Math.ceil((week / totalWeeks) * 3); // 3 phases
  
  if (goalType === "race_prep") {
    if (phase === 1) return "Base Building";
    if (phase === 2) return "Build Phase";
    return "Peak & Taper";
  } else if (goalType === "fitness_improvement") {
    if (phase === 1) return "Aerobic Development";
    if (phase === 2) return "Strength & Speed";
    return "Performance";
  } else if (goalType === "weight_loss") {
    if (phase === 1) return "Consistency Building";
    if (phase === 2) return "Fat Burning";
    return "Maintenance";
  }
  
  return "General Fitness";
}

export function calculatePlanName(input: TrainingPlanInput): string {
  const { goal, schedule } = input;
  
  if (goal.type === "race_prep" && goal.raceType) {
    const raceNames: { [key: string]: string } = {
      "5k": "5K Race",
      "10k": "10K Race", 
      "half_marathon": "Half Marathon",
      "marathon": "Marathon"
    };
    return `${raceNames[goal.raceType]} Training Plan (${schedule.duration} weeks)`;
  } else if (goal.type === "fitness_improvement") {
    return `Fitness Improvement Plan (${schedule.duration} weeks)`;
  } else if (goal.type === "weight_loss") {
    return `Weight Loss Running Plan (${schedule.duration} weeks)`;
  }
  
  return `Custom Training Plan (${schedule.duration} weeks)`;
}