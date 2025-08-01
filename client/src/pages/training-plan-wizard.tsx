import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calendar as CalendarIcon, 
  Target, 
  Clock, 
  MapPin, 
  Zap, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  PlayCircle,
  Activity,
  Trophy,
  Heart,
  Gauge,
  AlertCircle,
  Share2,
  Home
} from "lucide-react";
import { TrainingPlanShare } from "@/components/social-share";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";

interface WizardStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface TrainingPlanData {
  // Connect to existing user goals
  goalId: number | null;
  existingGoal: any | null;
  
  // Goal definition (optional if using existing goal)
  goalType: string; // 'race_preparation', 'fitness_improvement', 'weight_loss', 'general_fitness'
  targetDistance: string;
  targetTime: string;
  raceDate: Date | null;
  eventName: string;
  
  // Fitness assessment
  currentFitness: string;
  experienceLevel: string;
  weeklyRunningDistance: string; // current weekly volume
  longestRecentRun: string;
  
  // Schedule and preferences
  daysPerWeek: number;
  preferredDays: string[];
  timePerSession: string; // how much time they have per session
  restDays: string[];
  
  // Focus areas and restrictions
  focusAreas: string[];
  injuries: string[];
  equipment: string[];
  location: string; // 'outdoor', 'treadmill', 'both'
  locationPreference: string; // 'outdoor', 'treadmill', 'both'
  
  // Plan customization
  planName: string;
  personalNotes: string;
  adaptToProgress: boolean; // whether plan should auto-adjust
}

const WIZARD_STEPS: WizardStep[] = [
  { id: 1, title: "Your Goals", description: "Choose your running objective", completed: false },
  { id: 2, title: "Current Fitness", description: "Tell us about your fitness level", completed: false },
  { id: 3, title: "Schedule & Time", description: "Set your availability", completed: false },
  { id: 4, title: "Preferences", description: "Customise your training", completed: false },
  { id: 5, title: "Plan Creation", description: "Review and create your plan", completed: false },
];

const GOAL_TYPES = [
  { value: "race_preparation", label: "Prepare for a Specific Race", description: "Train for an upcoming race or event", icon: Trophy },
  { value: "fitness_improvement", label: "Improve Overall Fitness", description: "Build endurance and get stronger", icon: TrendingUp },
  { value: "weight_loss", label: "Weight Loss & Health", description: "Use running to lose weight and improve health", icon: Heart },
  { value: "general_fitness", label: "Stay Active & Healthy", description: "Maintain fitness with regular running", icon: Activity },
];

const DISTANCE_OPTIONS = [
  { value: "5k", label: "5K", description: "Great for beginners and speed work" },
  { value: "10k", label: "10K", description: "Perfect balance of speed and endurance" },
  { value: "15k", label: "15K", description: "Building endurance foundation" },
  { value: "half_marathon", label: "Half Marathon", description: "21.1km - serious endurance challenge" },
  { value: "marathon", label: "Marathon", description: "42.2km - ultimate endurance test" },
  { value: "ultra_marathon", label: "Ultra Marathon", description: "50km+ - extreme endurance" },
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner", description: "New to running or returning after a break" },
  { value: "intermediate", label: "Intermediate", description: "Regular runner with some race experience" },
  { value: "advanced", label: "Advanced", description: "Experienced with multiple races and training" },
  { value: "elite", label: "Elite", description: "Competitive athlete with extensive experience" },
];

const FITNESS_LEVELS = [
  { value: "low", label: "Starting Out", description: "Can run 1-2km continuously" },
  { value: "moderate", label: "Building Base", description: "Can run 3-5km continuously" },
  { value: "good", label: "Solid Base", description: "Can run 5-10km continuously" },
  { value: "excellent", label: "Strong Runner", description: "Can run 10km+ continuously" },
];

const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

const FOCUS_AREAS = [
  { value: "endurance", label: "Endurance", icon: Heart, description: "Build cardiovascular stamina" },
  { value: "speed", label: "Speed", icon: Zap, description: "Improve running pace and power" },
  { value: "strength", label: "Strength", icon: Activity, description: "Build muscle and prevent injury" },
  { value: "recovery", label: "Recovery", icon: Clock, description: "Optimize rest and regeneration" },
];

export default function TrainingPlanWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState(WIZARD_STEPS);
  const [isCompleted, setIsCompleted] = useState(false);
  const [createdPlan, setCreatedPlan] = useState<any>(null);
  const [planData, setPlanData] = useState<TrainingPlanData>({
    goalId: null,
    existingGoal: null,
    goalType: "",
    targetDistance: "",
    targetTime: "",
    raceDate: null,
    eventName: "",
    currentFitness: "",
    experienceLevel: "",
    weeklyRunningDistance: "",
    longestRecentRun: "",
    daysPerWeek: 3,
    preferredDays: [],
    timePerSession: "",
    restDays: [],
    focusAreas: [],
    injuries: [],
    equipment: [],
    location: "outdoor",
    locationPreference: "outdoor",
    planName: "",
    personalNotes: "",
    adaptToProgress: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPlanMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/training-plans", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Training Plan Created!",
        description: "Your personalized training plan is ready to start.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/training-plans"] });
      setCreatedPlan(data);
      setIsCompleted(true);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create training plan",
        variant: "destructive",
      });
    },
  });

  const updateStepCompletion = (stepId: number, completed: boolean) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed } : step
    ));
  };

  const handleNext = () => {
    updateStepCompletion(currentStep, true);
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    const startDate = new Date();
    const duration = calculatePlanDuration(planData.targetDistance, planData.experienceLevel);

    // Send wizard data to server for proper training plan generation
    const wizardData = {
      goal: {
        objective: planData.goalType,
        raceType: planData.targetDistance,
        raceDate: planData.raceDate ? format(planData.raceDate, 'yyyy-MM-dd') : null,
        targetDistance: planData.targetDistance
      },
      fitness: {
        currentLevel: planData.experienceLevel,
        weeklyDistance: planData.weeklyRunningDistance,
        longestRun: planData.longestRecentRun,
        experience: planData.experienceLevel
      },
      preferences: {
        daysPerWeek: planData.daysPerWeek,
        preferredDays: planData.preferredDays,
        timePerSession: planData.timePerSession,
        location: planData.location || "outdoor",
        adaptToPace: true
      },
      schedule: {
        duration,
        startDate: format(startDate, 'yyyy-MM-dd')
      }
    };

    createPlanMutation.mutate(wizardData);
  };

  const calculatePlanDuration = (distance: string, experience: string): number => {
    const baseDurations: { [key: string]: number } = {
      "5k": 8,
      "10k": 12,
      "15k": 14,
      "half_marathon": 16,
      "marathon": 20,
      "ultra_marathon": 24,
    };
    
    const experienceMultiplier = experience === "beginner" ? 1.2 : experience === "advanced" ? 0.8 : 1.0;
    return Math.round((baseDurations[distance] || 12) * experienceMultiplier);
  };

  const calculateMaxWeeklyDistance = (distance: string, experience: string): number => {
    const baseDistances: { [key: string]: number } = {
      "5k": 25,
      "10k": 40,
      "15k": 50,
      "half_marathon": 65,
      "marathon": 85,
      "ultra_marathon": 100,
    };
    
    const experienceMultiplier = experience === "beginner" ? 0.7 : experience === "advanced" ? 1.3 : 1.0;
    return Math.round((baseDistances[distance] || 40) * experienceMultiplier);
  };



  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">What's your primary running goal?</h3>
              <p className="text-sm text-gray-600 mb-6">Choose what you want to achieve with your personalized training plan</p>
              
              <div className="grid gap-4">
                {GOAL_TYPES.map((goal) => {
                  const IconComponent = goal.icon;
                  return (
                    <Card key={goal.value} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        planData.goalType === goal.value ? 'ring-2 ring-orange-500 bg-orange-50' : ''
                      }`}
                      onClick={() => setPlanData(prev => ({ ...prev, goalType: goal.value }))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${
                            planData.goalType === goal.value ? 'bg-orange-100' : 'bg-gray-100'
                          }`}>
                            <IconComponent className={`h-6 w-6 ${
                              planData.goalType === goal.value ? 'text-orange-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{goal.label}</p>
                            <p className="text-sm text-gray-600">{goal.description}</p>
                          </div>
                          {planData.goalType === goal.value && (
                            <CheckCircle className="h-5 w-5 text-orange-600" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {planData.goalType === 'race_preparation' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="eventName">Event/Race Name</Label>
                  <Input
                    id="eventName"
                    placeholder="e.g., Sydney Marathon, parkrun, local 10K"
                    value={planData.eventName}
                    onChange={(e) => setPlanData(prev => ({ ...prev, eventName: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label>Target Distance</Label>
                  <Select value={planData.targetDistance} onValueChange={(value) => setPlanData(prev => ({ ...prev, targetDistance: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select distance" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISTANCE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="targetTime">Target Time (optional)</Label>
                  <Input
                    id="targetTime"
                    placeholder="e.g., 25:00 for 5K, 1:45:00 for Half Marathon"
                    value={planData.targetTime}
                    onChange={(e) => setPlanData(prev => ({ ...prev, targetTime: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Race Date (optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {planData.raceDate ? format(planData.raceDate, "PPP") : "Select race date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={planData.raceDate || undefined}
                        onSelect={(date) => setPlanData(prev => ({ ...prev, raceDate: date || null }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {planData.goalType === 'fitness_improvement' && (
              <div className="space-y-4">
                <div>
                  <Label>Which distance do you want to focus on improving?</Label>
                  <Select value={planData.targetDistance} onValueChange={(value) => setPlanData(prev => ({ ...prev, targetDistance: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select distance focus" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISTANCE_OPTIONS.slice(0, 4).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} - {option.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {planData.goalType === 'general_fitness' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Flexible Training Plan</p>
                    <p className="text-sm text-blue-700 mt-1">
                      We'll create a balanced plan focused on maintaining fitness, improving endurance, and keeping running enjoyable.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {planData.targetDistance && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="targetTime">Target Time (optional)</Label>
                  <Input
                    id="targetTime"
                    placeholder="e.g., 25:00 for 5K, 1:45:00 for Half Marathon"
                    value={planData.targetTime}
                    onChange={(e) => setPlanData(prev => ({ ...prev, targetTime: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Race Date (optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !planData.raceDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {planData.raceDate ? format(planData.raceDate, "PPP") : "Select race date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={planData.raceDate || undefined}
                        onSelect={(date) => setPlanData(prev => ({ ...prev, raceDate: date || null }))}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Tell us about your current fitness level</h3>
              <p className="text-sm text-gray-600 mb-6">This helps us create a plan that's perfectly suited to your starting point</p>
              
              <div className="space-y-4">
                {FITNESS_LEVELS.map((level) => (
                  <Card 
                    key={level.value}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      planData.currentFitness === level.value && "ring-2 ring-orange-500 bg-orange-50"
                    )}
                    onClick={() => setPlanData(prev => ({ ...prev, currentFitness: level.value }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{level.label}</h4>
                        {planData.currentFitness === level.value && (
                          <CheckCircle className="h-5 w-5 text-orange-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{level.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium mb-3">Running Experience</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {EXPERIENCE_LEVELS.map((exp) => (
                  <Card 
                    key={exp.value}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md p-3",
                      planData.experienceLevel === exp.value && "ring-2 ring-orange-500 bg-orange-50"
                    )}
                    onClick={() => setPlanData(prev => ({ ...prev, experienceLevel: exp.value }))}
                  >
                    <div className="text-center">
                      <h5 className="font-medium">{exp.label}</h5>
                      <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weeklyDistance">Current Weekly Running Distance</Label>
                <Select value={planData.weeklyRunningDistance} onValueChange={(value) => setPlanData(prev => ({ ...prev, weeklyRunningDistance: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select current weekly distance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-5km">0-5km per week</SelectItem>
                    <SelectItem value="5-15km">5-15km per week</SelectItem>
                    <SelectItem value="15-30km">15-30km per week</SelectItem>
                    <SelectItem value="30-50km">30-50km per week</SelectItem>
                    <SelectItem value="50km+">50km+ per week</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="longestRun">Longest Recent Run</Label>
                <Select value={planData.longestRecentRun} onValueChange={(value) => setPlanData(prev => ({ ...prev, longestRecentRun: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select longest recent run" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-2km">0-2km</SelectItem>
                    <SelectItem value="2-5km">2-5km</SelectItem>
                    <SelectItem value="5-10km">5-10km</SelectItem>
                    <SelectItem value="10-15km">10-15km</SelectItem>
                    <SelectItem value="15-21km">15-21km</SelectItem>
                    <SelectItem value="21km+">21km+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Set your training schedule</h3>
              <p className="text-sm text-gray-600 mb-6">Tell us about your availability and time constraints</p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label>Days per week</Label>
                  <Select 
                    value={planData.daysPerWeek.toString()} 
                    onValueChange={(value) => setPlanData(prev => ({ ...prev, daysPerWeek: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6, 7].map(days => (
                        <SelectItem key={days} value={days.toString()}>{days} days</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Time available per session</Label>
                  <Select value={planData.timePerSession} onValueChange={(value) => setPlanData(prev => ({ ...prev, timePerSession: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select session duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30min">30 minutes or less</SelectItem>
                      <SelectItem value="45min">30-45 minutes</SelectItem>
                      <SelectItem value="60min">45-60 minutes</SelectItem>
                      <SelectItem value="90min">60-90 minutes</SelectItem>
                      <SelectItem value="90min+">90+ minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Which days work best for you?</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.value}
                      checked={planData.preferredDays.includes(day.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPlanData(prev => ({
                            ...prev,
                            preferredDays: [...prev.preferredDays, day.value]
                          }));
                        } else {
                          setPlanData(prev => ({
                            ...prev,
                            preferredDays: prev.preferredDays.filter(d => d !== day.value)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={day.value} className="text-sm font-medium">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Preferred rest days</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rest-${day.value}`}
                      checked={planData.restDays.includes(day.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPlanData(prev => ({
                            ...prev,
                            restDays: [...prev.restDays, day.value]
                          }));
                        } else {
                          setPlanData(prev => ({
                            ...prev,
                            restDays: prev.restDays.filter(d => d !== day.value)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={`rest-${day.value}`} className="text-sm font-medium">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Customise your training preferences</h3>
              <p className="text-sm text-gray-600 mb-6">Help us create a plan that works perfectly for your situation</p>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium mb-3">Training Focus Areas</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {FOCUS_AREAS.map((area) => {
                      const Icon = area.icon;
                      return (
                        <Card 
                          key={area.value}
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            planData.focusAreas.includes(area.value) && "ring-2 ring-orange-500 bg-orange-50"
                          )}
                          onClick={() => {
                            if (planData.focusAreas.includes(area.value)) {
                              setPlanData(prev => ({
                                ...prev,
                                focusAreas: prev.focusAreas.filter(f => f !== area.value)
                              }));
                            } else {
                              setPlanData(prev => ({
                                ...prev,
                                focusAreas: [...prev.focusAreas, area.value]
                              }));
                            }
                          }}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3 mb-1">
                              <Icon className="h-4 w-4 text-orange-600" />
                              <h4 className="font-medium text-sm">{area.label}</h4>
                              {planData.focusAreas.includes(area.value) && (
                                <CheckCircle className="h-4 w-4 text-orange-600 ml-auto" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600">{area.description}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium mb-3">Training Location Preference</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'outdoor', label: 'Outdoor Running', description: 'Prefer running outside' },
                      { value: 'treadmill', label: 'Treadmill/Indoor', description: 'Prefer indoor running' },
                      { value: 'both', label: 'Both', description: 'Mix of indoor and outdoor' }
                    ].map((option) => (
                      <Card 
                        key={option.value}
                        className={`cursor-pointer transition-all hover:shadow-md p-3 ${
                          planData.locationPreference === option.value ? 'ring-2 ring-orange-500 bg-orange-50' : ''
                        }`}
                        onClick={() => setPlanData(prev => ({ ...prev, locationPreference: option.value }))}
                      >
                        <div className="text-center">
                          <h5 className="font-medium text-sm">{option.label}</h5>
                          <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium mb-3">Do you have any current injuries or physical limitations?</h4>
                  <Textarea
                    placeholder="e.g., Recovering from knee injury, lower back issues, etc. (optional)"
                    value={planData.injuries.join(', ')}
                    onChange={(e) => setPlanData(prev => ({ 
                      ...prev, 
                      injuries: e.target.value ? e.target.value.split(', ').filter(i => i.trim()) : [] 
                    }))}
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <h4 className="text-md font-medium mb-3">Plan Adaptability</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="adaptToProgress"
                      checked={planData.adaptToProgress}
                      onCheckedChange={(checked) => setPlanData(prev => ({ ...prev, adaptToProgress: !!checked }))}
                    />
                    <Label htmlFor="adaptToProgress" className="text-sm">
                      Allow the plan to automatically adjust based on my progress and feedback
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This helps create a more personalised training experience that evolves with your fitness level
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Review and create your training plan</h3>
              <p className="text-sm text-gray-600 mb-6">Review your selections and create your personalised plan</p>
              
              {/* Plan Summary */}
              <div className="bg-orange-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-orange-900 mb-3">Your Training Plan Summary</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><span className="font-medium">Goal:</span> {GOAL_TYPES.find(g => g.value === planData.goalType)?.label || 'Not selected'}</p>
                    {planData.targetDistance && <p><span className="font-medium">Distance:</span> {DISTANCE_OPTIONS.find(d => d.value === planData.targetDistance)?.label}</p>}
                    {planData.eventName && <p><span className="font-medium">Event:</span> {planData.eventName}</p>}
                    {planData.targetTime && <p><span className="font-medium">Target Time:</span> {planData.targetTime}</p>}
                  </div>
                  <div>
                    <p><span className="font-medium">Training Days:</span> {planData.daysPerWeek} days per week</p>
                    <p><span className="font-medium">Session Duration:</span> {planData.timePerSession || 'Not specified'}</p>
                    <p><span className="font-medium">Experience:</span> {EXPERIENCE_LEVELS.find(e => e.value === planData.experienceLevel)?.label || 'Not selected'}</p>
                    <p><span className="font-medium">Location:</span> {planData.locationPreference === 'outdoor' ? 'Outdoor' : planData.locationPreference === 'treadmill' ? 'Indoor/Treadmill' : 'Mixed'}</p>
                  </div>
                </div>
                {planData.focusAreas.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium text-sm">Focus Areas:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {planData.focusAreas.map(area => (
                        <Badge key={area} variant="secondary" className="text-xs">
                          {FOCUS_AREAS.find(f => f.value === area)?.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="planName">Plan Name</Label>
                  <Input
                    id="planName"
                    placeholder={`My ${planData.targetDistance ? planData.targetDistance.toUpperCase() : 'Custom'} Training Plan`}
                    value={planData.planName}
                    onChange={(e) => setPlanData(prev => ({ ...prev, planName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="personalNotes">Personal Notes (optional)</Label>
                  <Textarea
                    id="personalNotes"
                    placeholder="Any specific requirements, goals, motivations, or notes about your training journey..."
                    value={planData.personalNotes}
                    onChange={(e) => setPlanData(prev => ({ ...prev, personalNotes: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Ready to Start Training?</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Your personalised training plan will be created based on your goals, fitness level, and preferences. 
                        You can always adjust it later as your fitness improves.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>
        );

      default:
        return null;
    }
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return planData.goalType !== "" && 
               (planData.goalType !== 'race_preparation' || planData.targetDistance !== "") &&
               (planData.goalType !== 'fitness_improvement' || planData.targetDistance !== "");
      case 2:
        return planData.currentFitness !== "" && 
               planData.experienceLevel !== "" &&
               planData.weeklyRunningDistance !== "" &&
               planData.longestRecentRun !== "";
      case 3:
        return planData.daysPerWeek > 0 && 
               planData.timePerSession !== "" &&
               planData.preferredDays.length > 0;
      case 4:
        return planData.locationPreference !== ""; // At least location preference required
      case 5:
        return planData.planName !== "";
      default:
        return false;
    }
  };

  // Show completion screen if plan was created successfully
  if (isCompleted && createdPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎉 Training Plan Created!
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your personalised {planData.planName || `${planData.targetDistance.toUpperCase()} Training Plan`} is ready! 
              Time to start your journey towards achieving your running goals.
            </p>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Overview</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <p className="text-gray-600">Goal</p>
                  <p className="font-medium">{GOAL_TYPES.find(g => g.value === planData.goalType)?.label}</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-600">Duration</p>
                  <p className="font-medium">{calculatePlanDuration(planData.targetDistance, planData.experienceLevel)} weeks</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-600">Training Days</p>
                  <p className="font-medium">{planData.daysPerWeek} per week</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-600">Focus Areas</p>
                  <p className="font-medium">{planData.focusAreas.join(', ') || 'General'}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link href="/training-plan-dashboard">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 px-8">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Start Training
                </Button>
              </Link>
              
              <TrainingPlanShare
                planName={planData.planName || `${planData.targetDistance.toUpperCase()} Training Plan`}
                planType={planData.targetDistance}
                duration={calculatePlanDuration(planData.targetDistance, planData.experienceLevel)}
                achievements={['NewPlan', 'GoalSetter']}
                className="px-8"
              />
            </div>

            <p className="text-gray-500 text-sm">
              Share your achievement with friends and family to stay motivated on your training journey!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Training Plan Wizard - Create Personalized Running Plans"
        description="Build your custom running training plan with our intelligent wizard. Set goals, preferences, and get personalized workouts for 5K, 10K, half marathon, marathon training across Australia."
        keywords="running training plan, custom workout schedule, marathon training, 5K training plan, personalized running coach, training calendar"
        ogType="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Training Plan Wizard",
          "description": "Create personalized running training plans with intelligent goal-based scheduling",
          "mainEntity": {
            "@type": "SoftwareApplication",
            "name": "Training Plan Wizard",
            "applicationCategory": "HealthApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "AUD"
            }
          }
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 p-4 pb-20 md:pb-4">
      <div className="max-w-4xl mx-auto">
        {/* Return Home Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Return Home</span>
              <span className="sm:hidden">Home</span>
            </Button>
          </Link>
        </div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Personalized Training Plan Wizard
          </h1>
          <p className="text-gray-600 mb-4">
            Create a customized training plan tailored to your goals and schedule
          </p>
          
          {/* Differentiation Statement */}
          <div className="bg-gradient-to-r from-orange-100 to-green-100 border border-orange-200 rounded-lg p-4 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">Expert-Designed AI Training Plans</h2>
              <Trophy className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Our AI-assisted training plans have been developed in collaboration with 
              <span className="font-semibold text-orange-700"> multiple international running coaches and running experts</span>, 
              including marathon specialists from Australia, Kenya, and the UK. Each plan incorporates proven training methodologies, 
              realistic pace progressions, and authentic workout structures used by elite athletes worldwide.
            </p>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>Expert Collaboration</span>
              </div>
              <div className="flex items-center gap-1">
                <Gauge className="h-3 w-3" />
                <span>Proven Methodologies</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>Realistic Progressions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  currentStep === step.id 
                    ? "bg-orange-600 text-white" 
                    : step.completed 
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                )}>
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-16 h-1 mx-2 transition-colors",
                    step.completed ? "bg-green-600" : "bg-gray-200"
                  )} />
                )}
              </div>
            ))}
          </div>
          <Progress 
            value={(currentStep / WIZARD_STEPS.length) * 100} 
            className="h-2"
          />
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              Step {currentStep}: {steps[currentStep - 1]?.title}
            </CardTitle>
            <CardDescription>
              {steps[currentStep - 1]?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep < WIZARD_STEPS.length ? (
            <Button 
              onClick={handleNext}
              disabled={!isStepComplete()}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleFinish}
              disabled={!isStepComplete() || createPlanMutation.isPending}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {createPlanMutation.isPending ? "Creating..." : "Create My Plan"}
              <PlayCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <Footer />
      </div>
    </>
  );
}