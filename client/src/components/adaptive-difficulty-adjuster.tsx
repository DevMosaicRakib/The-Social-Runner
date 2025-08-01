import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  Activity, 
  Clock, 
  Heart, 
  Star,
  AlertTriangle,
  CheckCircle,
  Settings
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WorkoutFeedback {
  workoutDate: string;
  workoutType: string;
  completed: boolean;
  difficultyRating?: number;
  effortRating?: number;
  enjoymentRating?: number;
  energyLevel?: number;
  recoveryRating?: number;
  notes?: string;
}

interface AdaptiveDifficultyData {
  currentDifficulty: number;
  performanceScore: number;
  recentAdjustments: Array<{
    date: string;
    type: string;
    reason: string;
    multiplier: number;
  }>;
  recommendations: Array<{
    type: string;
    suggestion: string;
    confidence: number;
  }>;
  weeklyStats: {
    completionRate: number;
    averageDifficulty: number;
    averageEffort: number;
    totalWorkouts: number;
  };
}

interface AdaptiveDifficultyAdjusterProps {
  trainingPlanId: number;
  currentWeek: number;
  className?: string;
}

export default function AdaptiveDifficultyAdjuster({ 
  trainingPlanId, 
  currentWeek, 
  className = "" 
}: AdaptiveDifficultyAdjusterProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [sessionVariance, setSessionVariance] = useState<any>(null);
  const [workoutFeedback, setWorkoutFeedback] = useState<WorkoutFeedback>({
    workoutDate: new Date().toISOString().split('T')[0],
    workoutType: '',
    completed: false,
  });
  const { toast } = useToast();

  // Fetch adaptive difficulty data
  const { data: adaptiveData, isLoading } = useQuery<AdaptiveDifficultyData>({
    queryKey: ["/api/training-plans", trainingPlanId, "adaptive-difficulty"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Submit workout feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedback: WorkoutFeedback) => {
      return apiRequest("POST", `/api/training-plans/${trainingPlanId}/workout-feedback`, {
        ...feedback,
        trainingPlanId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Your workout feedback has been recorded and will help improve your training plan.",
      });
      setShowFeedbackForm(false);
      setWorkoutFeedback({
        workoutDate: new Date().toISOString().split('T')[0],
        workoutType: '',
        completed: false,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/training-plans", trainingPlanId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Trigger manual adjustment mutation
  const manualAdjustmentMutation = useMutation({
    mutationFn: async (adjustmentType: string) => {
      return apiRequest("POST", `/api/training-plans/${trainingPlanId}/adjust-difficulty`, {
        adjustmentType,
        weekNumber: currentWeek,
        manual: true,
      });
    },
    onSuccess: (response: any) => {
      // Display session variance if available
      if (response.variance) {
        setSessionVariance(response.variance);
        toast({
          title: response.variance.title || "Training Plan Adjusted",
          description: response.variance.description || "Your training difficulty has been updated.",
        });
      } else {
        toast({
          title: "Training Plan Adjusted",
          description: "Your training difficulty has been updated based on your request.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/training-plans", trainingPlanId] });
    },
  });

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 0.8) return "text-green-600 bg-green-50";
    if (difficulty < 1.2) return "text-blue-600 bg-blue-50";
    if (difficulty < 1.5) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty < 0.8) return "Easy";
    if (difficulty < 1.2) return "Moderate";
    if (difficulty < 1.5) return "Challenging";
    return "Very Hard";
  };

  const getPerformanceIcon = (score: number) => {
    if (score >= 1.2) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (score >= 0.8) return <Target className="h-4 w-4 text-blue-600" />;
    return <TrendingDown className="h-4 w-4 text-orange-600" />;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Adaptive Difficulty Adjuster
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!adaptiveData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Adaptive Difficulty Adjuster
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No adaptive data available yet. Complete some workouts to see personalized adjustments.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Difficulty Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Adaptive Difficulty Status
            </div>
            <Badge className={getDifficultyColor(adaptiveData.currentDifficulty)}>
              {getDifficultyLabel(adaptiveData.currentDifficulty)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {getPerformanceIcon(adaptiveData.performanceScore)}
                <span className="text-sm font-medium">Performance</span>
              </div>
              <p className="text-2xl font-bold">
                {(adaptiveData.performanceScore * 100).toFixed(0)}%
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Completion</span>
              </div>
              <p className="text-2xl font-bold">
                {(adaptiveData.weeklyStats.completionRate * 100).toFixed(0)}%
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Activity className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Avg Effort</span>
              </div>
              <p className="text-2xl font-bold">
                {adaptiveData.weeklyStats.averageEffort.toFixed(1)}/10
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Workouts</span>
              </div>
              <p className="text-2xl font-bold">
                {adaptiveData.weeklyStats.totalWorkouts}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => manualAdjustmentMutation.mutate("difficulty_decrease")}
              disabled={manualAdjustmentMutation.isPending}
            >
              <TrendingDown className="h-4 w-4 mr-1" />
              Make Easier
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => manualAdjustmentMutation.mutate("difficulty_increase")}
              disabled={manualAdjustmentMutation.isPending}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Make Harder
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
            >
              <Star className="h-4 w-4 mr-1" />
              Give Feedback
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {adaptiveData.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {adaptiveData.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">{rec.type}</p>
                  <p className="text-sm text-blue-700">{rec.suggestion}</p>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {rec.confidence}% confidence
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Workout Feedback Form */}
      {showFeedbackForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Workout Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Workout Date</Label>
                <input
                  type="date"
                  value={workoutFeedback.workoutDate}
                  onChange={(e) => setWorkoutFeedback(prev => ({ ...prev, workoutDate: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <Label>Workout Type</Label>
                <select
                  value={workoutFeedback.workoutType}
                  onChange={(e) => setWorkoutFeedback(prev => ({ ...prev, workoutType: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select workout type</option>
                  <option value="easy_run">Easy Run</option>
                  <option value="tempo_run">Tempo Run</option>
                  <option value="long_run">Long Run</option>
                  <option value="intervals">Intervals</option>
                  <option value="recovery_run">Recovery Run</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Did you complete this workout?</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    variant={workoutFeedback.completed ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWorkoutFeedback(prev => ({ ...prev, completed: true }))}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={!workoutFeedback.completed ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWorkoutFeedback(prev => ({ ...prev, completed: false }))}
                  >
                    No
                  </Button>
                </div>
              </div>

              <div>
                <Label>Difficulty Rating (1=Too Easy, 10=Too Hard)</Label>
                <Slider
                  value={[workoutFeedback.difficultyRating || 5]}
                  onValueChange={([value]) => setWorkoutFeedback(prev => ({ ...prev, difficultyRating: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Too Easy</span>
                  <span>{workoutFeedback.difficultyRating || 5}</span>
                  <span>Too Hard</span>
                </div>
              </div>

              <div>
                <Label>Effort Rating (1=Very Easy, 10=Maximum Effort)</Label>
                <Slider
                  value={[workoutFeedback.effortRating || 5]}
                  onValueChange={([value]) => setWorkoutFeedback(prev => ({ ...prev, effortRating: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Easy</span>
                  <span>{workoutFeedback.effortRating || 5}</span>
                  <span>Maximum</span>
                </div>
              </div>

              <div>
                <Label>Energy Level Before Workout</Label>
                <Slider
                  value={[workoutFeedback.energyLevel || 5]}
                  onValueChange={([value]) => setWorkoutFeedback(prev => ({ ...prev, energyLevel: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Low</span>
                  <span>{workoutFeedback.energyLevel || 5}</span>
                  <span>Very High</span>
                </div>
              </div>

              <div>
                <Label>Notes (optional)</Label>
                <Textarea
                  value={workoutFeedback.notes || ''}
                  onChange={(e) => setWorkoutFeedback(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="How did this workout feel? Any challenges or observations?"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => submitFeedbackMutation.mutate(workoutFeedback)}
                disabled={submitFeedbackMutation.isPending || !workoutFeedback.workoutType}
                className="flex-1"
              >
                {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFeedbackForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Variance Display */}
      {sessionVariance && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Target className="h-5 w-5" />
              {sessionVariance.title}
            </CardTitle>
            <p className="text-sm text-blue-700">{sessionVariance.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{sessionVariance.sessionsModified}</p>
                <p className="text-sm text-gray-600">Sessions Modified</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{sessionVariance.weeksAffected}</p>
                <p className="text-sm text-gray-600">Weeks Affected</p>
              </div>
            </div>

            {sessionVariance.changes && sessionVariance.changes.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-900 mb-3">Session Changes:</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sessionVariance.changes.map((change: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-gray-900">{change.session}</p>
                        <Badge variant="outline" className="text-xs">
                          {change.impact}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Distance:</strong> {change.distanceChange}</p>
                        <p><strong>Pace:</strong> {change.paceChange}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sessionVariance.summary && (
              <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-medium text-blue-900 mb-2">Summary</h4>
                <p className="text-sm text-gray-700 mb-2">{sessionVariance.summary.averageChange}</p>
                <p className="text-sm text-blue-700 italic">{sessionVariance.summary.nextSteps}</p>
              </div>
            )}

            <Button 
              variant="outline" 
              onClick={() => setSessionVariance(null)}
              className="w-full"
            >
              Close Details
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Adjustments */}
      {adaptiveData.recentAdjustments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Adjustments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adaptiveData.recentAdjustments.slice(0, 3).map((adjustment, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="font-medium capitalize">
                      {adjustment.type.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-gray-600">{adjustment.reason}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(adjustment.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {adjustment.multiplier.toFixed(2)}x
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}