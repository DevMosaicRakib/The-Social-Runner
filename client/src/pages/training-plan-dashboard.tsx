import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Play, 
  Pause, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle, 
  Plus,
  Activity,
  Award,
  BarChart3,
  Timer,
  MapPin,
  Settings,
  Zap,
  Share2,
  ArrowLeft,
  Heart,
  Trophy,
  Bell,
  RotateCcw
} from "lucide-react";
import { TrainingPlanShare } from "@/components/social-share";
import { format, addDays, parseISO } from "date-fns";
import { Link } from "wouter";
import Footer from "@/components/footer";
import { AnimatedProgressTracker } from "@/components/animated-progress-tracker";
import AdaptiveDifficultyAdjuster from "@/components/adaptive-difficulty-adjuster";
import CalendarSync from "@/components/calendar-sync";

// Weekly Schedule Grid Component
interface WeeklyScheduleGridProps {
  weekData: any;
  planId: number;
  currentWeek: number;
  viewingWeek: number;
  totalWeeks: number;
  onWorkoutUpdate: any;
  onWeekChange: (week: number) => void;
}

function WeeklyScheduleGrid({ weekData, planId, currentWeek, viewingWeek, totalWeeks, onWorkoutUpdate, onWeekChange }: WeeklyScheduleGridProps) {
  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'bg-red-50 border-red-200';
      case 'moderate': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onWeekChange(viewingWeek - 1)}
          disabled={viewingWeek <= 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous Week
        </Button>
        
        <div className="text-center">
          <h3 className="font-semibold">Week {viewingWeek} of {totalWeeks}</h3>
          {viewingWeek === currentWeek && (
            <Badge variant="default" className="mt-1">Current Week</Badge>
          )}
          {viewingWeek < currentWeek && (
            <Badge variant="secondary" className="mt-1">Completed</Badge>
          )}
          {viewingWeek > currentWeek && (
            <Badge variant="outline" className="mt-1">Future</Badge>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onWeekChange(viewingWeek + 1)}
          disabled={viewingWeek >= totalWeeks}
          className="flex items-center gap-2"
        >
          Next Week
          <ArrowLeft className="h-4 w-4 rotate-180" />
        </Button>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {days.map((day) => {
        const workout = weekData[day.key];
        const isCompleted = workout?.completed;
        
        return (
          <div 
            key={day.key} 
            className={`p-4 border rounded-lg min-h-[180px] ${getIntensityColor(workout?.intensity)} 
                       ${isCompleted ? 'opacity-75' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">{day.label}</h3>
              {workout && workout.type !== 'rest' && (
                <Checkbox
                  checked={isCompleted}
                  onCheckedChange={(checked) => {
                    onWorkoutUpdate.mutate({
                      planId,
                      workoutId: day.key,
                      completed: checked,
                    });
                  }}
                />
              )}
            </div>
            
            {workout ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={workout.intensity === "high" ? "destructive" : workout.intensity === "moderate" ? "default" : "secondary"} 
                    className="text-xs"
                  >
                    {workout.intensity === "high" ? "High" : workout.intensity === "moderate" ? "Moderate" : "Easy"}
                  </Badge>
                  {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                </div>
                
                <h4 className="font-medium text-sm">{workout.name || workout.type?.replace(/_/g, ' ')}</h4>
                
                <div className="space-y-1 text-xs text-gray-600">
                  {workout.distance && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {workout.distance}
                    </div>
                  )}
                  {workout.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {workout.duration}
                    </div>
                  )}
                  {workout.pace && (
                    <div className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {workout.pace}
                    </div>
                  )}
                </div>
                
                {workout.description && (
                  <p className="text-xs text-gray-600 mt-2">{workout.description}</p>
                )}
                
                {workout.type !== 'rest' && (
                  <Button
                    size="sm"
                    variant={isCompleted ? "secondary" : "default"}
                    className={`w-full mt-2 text-xs ${!isCompleted ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Done
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <div className="text-xs">No workout</div>
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}

interface TrainingPlan {
  id: number;
  planName: string;
  planType: string;
  duration: number;
  currentWeek: number;
  status: string;
  startDate: string;
  endDate: string;
  weeklySchedule: any;
  preferences: {
    daysPerWeek: number;
    preferredDays: string[];
    focusAreas: string[];
  };
  progressData: {
    completedWeeks: number;
    totalRuns: number;
    totalDistance: number;
    averagePace: string;
    missedSessions: number;
  };
}

interface WeeklyWorkout {
  id: string;
  planId: number;
  week: number;
  day: string;
  date: string;
  type: string;
  name?: string;
  distance?: string;
  pace?: string;
  duration?: string;
  notes?: string;
  description?: string;
  warmup?: string;
  cooldown?: string;
  completed?: boolean;
  intensity?: "low" | "moderate" | "high";
}

export default function TrainingPlanDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewingWeek, setViewingWeek] = useState<number>(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trainingPlans = [], isLoading } = useQuery<TrainingPlan[]>({
    queryKey: ["/api/training-plans"],
  });

  const { data: currentWeekWorkouts = [], isLoading: workoutsLoading } = useQuery<WeeklyWorkout[]>({
    queryKey: ["/api/training-plans/current-week"],
  });

  const { data: allWorkouts = [] } = useQuery<(WeeklyWorkout & { originalIndex: number })[]>({
    queryKey: ["/api/training-plans/all-workouts"],
  });

  const updateWorkoutMutation = useMutation({
    mutationFn: async ({ planId, workoutId, completed }: any) => {
      return await apiRequest(`/api/training-plans/${planId}/workouts/${workoutId}`, {
        method: "PATCH",
        body: JSON.stringify({ completed }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-plans/current-week"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-plans/all-workouts"] });
      toast({
        title: "Workout Updated",
        description: "Your progress has been saved.",
      });
    },
  });

  const pausePlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      return await apiRequest(`/api/training-plans/${planId}/pause`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-plans/current-week"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-plans/all-workouts"] });
      toast({
        title: "Training Plan Paused",
        description: "Your training plan has been paused. You can reactivate it anytime.",
      });
    },
  });

  const resumePlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      return await apiRequest(`/api/training-plans/${planId}/resume`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-plans/current-week"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-plans/all-workouts"] });
      toast({
        title: "Training Plan Resumed",
        description: "Your training plan has been reactivated and dates have been adjusted.",
      });
    },
  });

  const resetPlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      return await apiRequest(`/api/training-plans/${planId}/reset`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-plans/current-week"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-plans/all-workouts"] });
      toast({
        title: "Training Plan Reset",
        description: "Your training plan has been reset to week 1 with updated dates.",
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      return await apiRequest(`/api/training-plans/${planId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-plans/current-week"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-plans/all-workouts"] });
      toast({
        title: "Training Plan Archived",
        description: "Your training plan has been archived and moved to your running history.",
      });
      // Navigate back to training plan selection
      setTimeout(() => {
        window.location.href = "/training-plan-wizard";
      }, 1000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to archive training plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePausePlan = () => {
    if (activePlan && activePlan.status === "active") {
      pausePlanMutation.mutate(activePlan.id);
    } else if (activePlan && activePlan.status === "paused") {
      resumePlanMutation.mutate(activePlan.id);
    }
  };

  const handleResetPlan = () => {
    if (activePlan && window.confirm("Are you sure you want to reset your training plan to week 1? All progress will be reset but your history will be preserved.")) {
      resetPlanMutation.mutate(activePlan.id);
    }
  };

  const handleDeletePlan = () => {
    if (activePlan && window.confirm("Are you sure you want to archive this training plan? It will be moved to your running history and you'll need to create a new plan.")) {
      deletePlanMutation.mutate(activePlan.id);
    }
  };

  const activePlan = trainingPlans.find((plan: TrainingPlan) => plan.status === "active");
  
  // Initialize viewing week to current week when plan loads
  React.useEffect(() => {
    if (activePlan?.currentWeek && viewingWeek === 1) {
      setViewingWeek(activePlan.currentWeek);
    }
  }, [activePlan?.currentWeek, viewingWeek]);

  // Helper function to get all workout dates for calendar highlighting
  const getWorkoutDates = (): Date[] => {
    return allWorkouts.map(workout => parseISO(workout.date));
  };

  // Helper function to get workouts for a specific date
  const getWorkoutsForDate = (date: Date): (WeeklyWorkout & { originalIndex: number })[] => {
    const targetDateStr = format(date, 'yyyy-MM-dd');
    return allWorkouts.filter(workout => workout.date === targetDateStr);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!activePlan) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-20 md:pb-4">
        <div className="max-w-4xl mx-auto py-8">
          <div className="mb-8">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Return Home</span>
                <span className="sm:hidden">Home</span>
              </Button>
            </Link>
          </div>
          <div className="text-center py-16">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Active Training Plan</h1>
            <p className="text-gray-600 mb-8">
              Create a personalized training plan to start your running journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/training-plan-wizard">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Training Plan
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="lg">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = (activePlan.currentWeek / activePlan.duration) * 100;
  const daysUntilGoal = Math.ceil((new Date(activePlan.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20 md:pb-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2 w-fit">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Return Home</span>
                <span className="sm:hidden">Home</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900">{activePlan?.planName}</h1>
              <p className="text-sm md:text-base text-gray-600">
                Week {activePlan?.currentWeek} of {activePlan?.duration} • {daysUntilGoal} days to go
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <TrainingPlanShare
              planName={activePlan?.planName || ''}
              planType={activePlan?.planType || ''}
              duration={activePlan?.duration || 0}
              currentWeek={activePlan?.currentWeek || 0}
              achievements={['Consistency', 'Dedication']}
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 md:flex-none"
            >
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Settings</span>
            </Button>
            <Link href="/training-plan-wizard">
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700 flex-1 md:flex-none">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">New Plan</span>
                <span className="sm:hidden">New</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overall Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(progressPercentage)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <Progress value={progressPercentage} className="mt-3" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Runs</p>
                  <p className="text-2xl font-bold text-gray-900">{activePlan.progressData.totalRuns}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Distance</p>
                  <p className="text-2xl font-bold text-gray-900">{activePlan.progressData.totalDistance}km</p>
                </div>
                <MapPin className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Pace</p>
                  <p className="text-2xl font-bold text-gray-900">{activePlan.progressData.averagePace}</p>
                </div>
                <Timer className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Management Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={activePlan.status === "active" ? "outline" : "default"}
              size="sm"
              onClick={handlePausePlan}
              disabled={pausePlanMutation.isPending || resumePlanMutation.isPending}
              className="flex items-center gap-2"
            >
              {activePlan.status === "active" ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pause Plan</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Resume Plan</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetPlan}
              disabled={resetPlanMutation.isPending}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Plan</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeletePlan}
              disabled={deletePlanMutation.isPending}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              <span>Archive Plan</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="current-week" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 gap-1 md:gap-0">
            <TabsTrigger value="current-week" className="text-xs md:text-sm">This Week</TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs md:text-sm">Calendar</TabsTrigger>
            <TabsTrigger value="progress" className="text-xs md:text-sm">Progress</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs md:text-sm">Analytics</TabsTrigger>
            <TabsTrigger value="adaptive" className="text-xs md:text-sm">Smart Adjust</TabsTrigger>
            <TabsTrigger value="sync" className="text-xs md:text-sm">Sync</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs md:text-sm">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="current-week" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Training Schedule
                </CardTitle>
                <CardDescription>
                  Complete your workouts and track your progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workoutsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                      <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : activePlan?.weeklySchedule?.[viewingWeek] ? (
                  <WeeklyScheduleGrid 
                    weekData={activePlan.weeklySchedule[viewingWeek]}
                    planId={activePlan.id}
                    currentWeek={activePlan.currentWeek}
                    viewingWeek={viewingWeek}
                    totalWeeks={activePlan.duration}
                    onWorkoutUpdate={updateWorkoutMutation}
                    onWeekChange={setViewingWeek}
                  />
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">No workouts scheduled for this week.</p>
                    <p className="text-gray-500 text-xs mt-1">Create a training plan to get started!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Training Calendar</CardTitle>
                  <CardDescription>
                    View your complete training schedule
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => setSelectedDate(date || new Date())}
                    className="rounded-md border"
                    modifiers={{
                      workout: getWorkoutDates()
                    }}
                    modifiersStyles={{
                      workout: { backgroundColor: '#f97316', color: 'white', fontWeight: 'bold' }
                    }}
                  />
                  <div className="mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                      <span>Workout scheduled</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {format(selectedDate, "EEEE, MMMM d")}
                  </CardTitle>
                  <CardDescription>
                    Workouts scheduled for this day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {getWorkoutsForDate(selectedDate).length > 0 ? (
                    <div className="space-y-3">
                      {getWorkoutsForDate(selectedDate).map((workout, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                          <Checkbox
                            checked={workout.completed || false}
                            onCheckedChange={(checked) => 
                              updateWorkoutMutation.mutate({
                                planId: workout.planId,
                                workoutId: workout.originalIndex,
                                completed: checked
                              })
                            }
                            disabled={updateWorkoutMutation.isPending}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                variant={workout.intensity === "high" ? "destructive" : workout.intensity === "moderate" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {workout.intensity}
                              </Badge>
                              <span className="font-semibold capitalize">{workout.name || workout.type.replace(/_/g, ' ')}</span>
                              {workout.completed && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {workout.distance && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {workout.distance}
                                </span>
                              )}
                              {workout.pace && (
                                <span className="flex items-center gap-1">
                                  <Timer className="h-3 w-3" />
                                  {workout.pace}
                                </span>
                              )}
                              {workout.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {workout.duration}
                                </span>
                              )}
                            </div>
                            {workout.notes && (
                              <p className="text-sm text-gray-500 mt-1">{workout.notes}</p>
                            )}
                          </div>
                          <Badge variant={workout.completed ? "default" : "secondary"}>
                            {workout.completed ? "✓ Completed" : "Pending"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No workouts scheduled for this day</p>
                      <p className="text-xs mt-1">Select a different date to view other workouts</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <AnimatedProgressTracker
              stats={{
                completedWorkouts: activePlan.progressData.totalRuns,
                totalWorkouts: activePlan.duration * 4, // Assuming 4 workouts per week average
                totalDistance: activePlan.progressData.totalDistance,
                averagePace: activePlan.progressData.averagePace,
                currentStreak: 7, // This would come from actual data
                longestStreak: 14, // This would come from actual data
                weeklyGoal: 4,
                weeklyCompleted: 3 // This would come from current week data
              }}
              achievements={[
                {
                  id: "first_week",
                  title: "First Week Complete",
                  description: "You completed your first week of training!",
                  icon: <CheckCircle className="h-6 w-6 text-green-600" />,
                  unlocked: activePlan.currentWeek > 1,
                  rarity: "common"
                },
                {
                  id: "speed_demon",
                  title: "Speed Demon",
                  description: "Improved your pace by 30 seconds per km",
                  icon: <Zap className="h-6 w-6 text-blue-600" />,
                  unlocked: true,
                  rarity: "rare"
                },
                {
                  id: "consistent_runner",
                  title: "Consistent Runner",
                  description: "Complete 7 days in a row",
                  icon: <CalendarIcon className="h-6 w-6 text-purple-600" />,
                  unlocked: false,
                  progress: 5,
                  target: 7,
                  rarity: "epic"
                },
                {
                  id: "distance_master",
                  title: "Distance Master",
                  description: "Run 100km total distance",
                  icon: <Target className="h-6 w-6 text-orange-600" />,
                  unlocked: activePlan.progressData.totalDistance >= 100,
                  progress: activePlan.progressData.totalDistance,
                  target: 100,
                  rarity: "legendary"
                }
              ]}
              planName={activePlan.planName}
              currentWeek={activePlan.currentWeek}
              totalWeeks={activePlan.duration}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Analytics charts will appear here</p>
                      <p className="text-sm">as you complete more workouts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Training Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">💡 Training Tip</h4>
                      <p className="text-sm text-orange-700">
                        Focus on maintaining consistent effort rather than pace during your easy runs. 
                        This helps build your aerobic base more effectively.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">📊 This Week's Focus</h4>
                      <p className="text-sm text-blue-700">
                        Build endurance with longer, slower runs. Your focus areas this week are 
                        aerobic capacity and running economy.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="adaptive">
            <AdaptiveDifficultyAdjuster 
              trainingPlanId={activePlan?.id || 0}
              currentWeek={activePlan?.currentWeek || 1}
              className="space-y-6"
            />
          </TabsContent>

          <TabsContent value="sync">
            <CalendarSync 
              trainingPlanId={activePlan?.id || 0}
              planName={activePlan?.planName || 'Training Plan'}
              className="space-y-6"
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Plan Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Plan Settings
                  </CardTitle>
                  <CardDescription>
                    Modify your training plan preferences and schedule
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Plan Name</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md" 
                      defaultValue={activePlan.planName}
                      placeholder="Enter plan name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Training Days per Week</label>
                    <select className="w-full p-2 border rounded-md" defaultValue={activePlan.preferences?.daysPerWeek || 4}>
                      <option value={3}>3 days</option>
                      <option value={4}>4 days</option>
                      <option value={5}>5 days</option>
                      <option value={6}>6 days</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preferred Training Days</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <label key={day} className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            defaultChecked={activePlan.preferences?.preferredDays?.includes(day) || false}
                          />
                          <span className="text-sm">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Save Plan Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>
                    Configure when and how you receive training reminders
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium">Workout Reminders</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium">Rest Day Notifications</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progress Updates</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium">Achievement Alerts</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reminder Time</label>
                    <select className="w-full p-2 border rounded-md" defaultValue="18:00">
                      <option value="06:00">6:00 AM</option>
                      <option value="07:00">7:00 AM</option>
                      <option value="08:00">8:00 AM</option>
                      <option value="17:00">5:00 PM</option>
                      <option value="18:00">6:00 PM</option>
                      <option value="19:00">7:00 PM</option>
                    </select>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Save Notification Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Trophy className="h-5 w-5" />
                    Plan Management
                  </CardTitle>
                  <CardDescription>
                    Advanced options for managing your training plan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Button 
                      variant="outline" 
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                      onClick={handlePausePlan}
                      disabled={pausePlanMutation.isPending || resumePlanMutation.isPending}
                    >
                      {activePlan.status === "active" ? "Pause Plan" : "Resume Plan"}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={handleResetPlan}
                      disabled={resetPlanMutation.isPending}
                    >
                      Reset Progress
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-red-300 text-red-700 hover:bg-red-50"
                      onClick={handleDeletePlan}
                      disabled={deletePlanMutation.isPending}
                    >
                      Delete Plan
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    These actions will affect your training plan data. Pause plan temporarily stops notifications, 
                    reset progress clears completion history, and delete permanently removes the plan.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}