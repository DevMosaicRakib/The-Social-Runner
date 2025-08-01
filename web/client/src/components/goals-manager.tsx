import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X, Target } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Goal {
  id?: number;
  eventName: string;
  distance: string;
  difficulty: string;
  eventDate?: string;
  targetTime?: string;
  status: string;
}

interface GoalsManagerProps {
  goals: Goal[];
  onChange: (goals: Goal[]) => void;
  isOptional?: boolean;
}

const GOAL_CATEGORIES = [
  { value: "5k", label: "5K Run" },
  { value: "10k", label: "10K Run" },
  { value: "half_marathon", label: "Half Marathon" },
  { value: "marathon", label: "Marathon" },
  { value: "ultra_marathon", label: "Ultra Marathon" },
  { value: "triathlon", label: "Triathlon" },
  { value: "trail_running", label: "Trail Running" },
  { value: "charity_run", label: "Charity Run" },
];

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "elite", label: "Elite" },
];

export default function GoalsManager({ goals, onChange, isOptional = false }: GoalsManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    eventName: "",
    distance: "",
    difficulty: "",
    eventDate: "",
    targetTime: "",
    status: "active"
  });

  const handleAddGoal = () => {
    if (newGoal.eventName && newGoal.distance && newGoal.difficulty) {
      const goalToAdd: Goal = {
        eventName: newGoal.eventName!,
        distance: newGoal.distance!,
        difficulty: newGoal.difficulty!,
        eventDate: newGoal.eventDate,
        targetTime: newGoal.targetTime,
        status: "active"
      };
      
      onChange([...goals, goalToAdd]);
      
      // Reset form
      setNewGoal({
        eventName: "",
        distance: "",
        difficulty: "",
        eventDate: "",
        targetTime: "",
        status: "active"
      });
      setShowAddForm(false);
    }
  };

  const handleRemoveGoal = (index: number) => {
    const updatedGoals = goals.filter((_, i) => i !== index);
    onChange(updatedGoals);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-blue-100 text-blue-800";
      case "advanced": return "bg-orange-100 text-orange-800";
      case "elite": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDistanceColor = (distance: string) => {
    switch (distance) {
      case "5k": case "10k": return "bg-emerald-100 text-emerald-800";
      case "half_marathon": return "bg-yellow-100 text-yellow-800";
      case "marathon": case "ultra_marathon": return "bg-purple-100 text-purple-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-600" />
          Training Goals
          {isOptional && <Badge variant="secondary" className="ml-2">Optional</Badge>}
        </CardTitle>
        {isOptional && (
          <p className="text-sm text-gray-600">
            Add your training goals to find like-minded training partners. You can skip this and add goals later.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Goals */}
        {goals.length > 0 && (
          <div className="space-y-3">
            {goals.map((goal, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{goal.eventName}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className={getDistanceColor(goal.distance)}>
                      {goal.distance.replace('_', ' ')}
                    </Badge>
                    <Badge variant="secondary" className={getDifficultyColor(goal.difficulty)}>
                      {goal.difficulty}
                    </Badge>
                  </div>
                  {goal.eventDate && (
                    <div className="text-sm text-gray-600 mt-1">
                      Target Date: {new Date(goal.eventDate).toLocaleDateString()}
                    </div>
                  )}
                  {goal.targetTime && (
                    <div className="text-sm text-gray-600 mt-1">
                      Target Time: {goal.targetTime}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveGoal(index)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Goal */}
        {!showAddForm ? (
          <Button
            variant="outline"
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Training Goal
          </Button>
        ) : (
          <div className="space-y-4 p-4 border rounded-lg bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-name">Event Name</Label>
                <Input
                  id="event-name"
                  placeholder="e.g., Sydney Marathon 2025"
                  value={newGoal.eventName || ""}
                  onChange={(e) => setNewGoal({ ...newGoal, eventName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="distance">Distance/Category</Label>
                <Select
                  value={newGoal.distance || ""}
                  onValueChange={(value) => setNewGoal({ ...newGoal, distance: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select distance" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={newGoal.difficulty || ""}
                  onValueChange={(value) => setNewGoal({ ...newGoal, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-time">Target Time (Optional)</Label>
                <Input
                  id="target-time"
                  placeholder="e.g., 4:00:00"
                  value={newGoal.targetTime || ""}
                  onChange={(e) => setNewGoal({ ...newGoal, targetTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Event Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newGoal.eventDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newGoal.eventDate ? format(new Date(newGoal.eventDate), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newGoal.eventDate ? new Date(newGoal.eventDate) : undefined}
                    onSelect={(date) => setNewGoal({ ...newGoal, eventDate: date?.toISOString().split('T')[0] || "" })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddGoal}
                disabled={!newGoal.eventName || !newGoal.distance || !newGoal.difficulty}
                className="flex-1"
              >
                Add Goal
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setNewGoal({
                    eventName: "",
                    distance: "",
                    difficulty: "",
                    eventDate: "",
                    targetTime: "",
                    status: "active"
                  });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}