import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { User } from "@shared/schema";

interface RunningPreferencesProps {
  user: User;
}

const DISTANCE_OPTIONS = [
  { value: "5k", label: "5K" },
  { value: "10k", label: "10K" },
  { value: "15k", label: "15K" },
  { value: "half_marathon", label: "Half Marathon" },
  { value: "marathon", label: "Marathon" },
  { value: "ultra", label: "Ultra Marathon" },
  { value: "fun_run", label: "Fun Run" },
  { value: "other", label: "Other" }
];

const PACE_OPTIONS = [
  { value: "easy", label: "Easy (6:00+ min/km)" },
  { value: "moderate", label: "Moderate (5:00-6:00 min/km)" },
  { value: "fast", label: "Fast (4:00-5:00 min/km)" },
  { value: "very_fast", label: "Very Fast (<4:00 min/km)" }
];

const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "elite", label: "Elite" }
];

const GOAL_OPTIONS = [
  { value: "weight_loss", label: "Weight Loss" },
  { value: "endurance", label: "Build Endurance" },
  { value: "speed", label: "Improve Speed" },
  { value: "social", label: "Social Running" },
  { value: "competition", label: "Competition" }
];

const AVAILABILITY_DAYS = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" }
];

const TIME_OPTIONS = [
  { value: "early_morning", label: "Early Morning" },
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" }
];

export default function RunningPreferences({ user }: RunningPreferencesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>(user);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await apiRequest("PATCH", "/api/auth/profile", data);
      return response.json();
    },
    onSuccess: (updatedUser) => {
      toast({
        title: "Preferences Updated",
        description: "Your running preferences have been updated successfully!",
      });
      queryClient.setQueryData(["/api/auth/user"], updatedUser);
      setIsEditing(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Update Failed",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setFormData(user);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const handleSave = () => {
    updatePreferencesMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof User, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isEditing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-500" />
              Running Preferences
            </CardTitle>
            <Button size="sm" onClick={handleEdit}>
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-gray-600">Preferred Distances</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {user.preferredDistances?.length ? user.preferredDistances.map(distance => (
                  <Badge key={distance} variant="secondary" className="text-xs">
                    {DISTANCE_OPTIONS.find(opt => opt.value === distance)?.label || distance}
                  </Badge>
                )) : (
                  <p className="text-sm text-gray-500">No distances set</p>
                )}
              </div>
            </div>
            <div>
              <Label className="text-gray-600">Experience Level</Label>
              <p className="font-medium">
                {EXPERIENCE_OPTIONS.find(opt => opt.value === user.experienceLevel)?.label || 'Not set'}
              </p>
            </div>
            <div>
              <Label className="text-gray-600">Preferred Pace</Label>
              <p className="font-medium">
                {PACE_OPTIONS.find(opt => opt.value === user.preferredPace)?.label || 'Not set'}
              </p>
            </div>
            <div>
              <Label className="text-gray-600">Preferred Time</Label>
              <p className="font-medium">
                {TIME_OPTIONS.find(opt => opt.value === user.preferredTime)?.label || 'Not set'}
              </p>
            </div>
          </div>
          
          <div>
            <Label className="text-gray-600">Running Goals</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {user.runningGoals?.length ? user.runningGoals.map(goal => (
                <Badge key={goal} variant="secondary" className="text-xs">
                  {GOAL_OPTIONS.find(opt => opt.value === goal)?.label || goal}
                </Badge>
              )) : (
                <p className="text-sm text-gray-500">No goals set</p>
              )}
            </div>
          </div>

          <div>
            <Label className="text-gray-600">Availability</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {user.availabilityDays?.length ? user.availabilityDays.map(day => (
                <Badge key={day} variant="outline" className="text-xs">
                  {AVAILABILITY_DAYS.find(opt => opt.value === day)?.label || day}
                </Badge>
              )) : (
                <p className="text-sm text-gray-500">No availability set</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-orange-500" />
            Edit Running Preferences
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={updatePreferencesMutation.isPending}>
              <Save className="h-4 w-4 mr-1" />
              {updatePreferencesMutation.isPending ? "Saving..." : "Save"}
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preferred Distances */}
        <div>
          <Label className="text-base font-medium">Preferred Distances (select all that apply)</Label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
              {DISTANCE_OPTIONS.map(distance => (
                <div key={distance.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={distance.value}
                    checked={(formData.preferredDistances || []).includes(distance.value)}
                    onCheckedChange={(checked) => {
                      const currentDistances = formData.preferredDistances || [];
                      if (checked) {
                        handleInputChange('preferredDistances', [...currentDistances, distance.value]);
                      } else {
                        handleInputChange('preferredDistances', currentDistances.filter(d => d !== distance.value));
                      }
                    }}
                  />
                  <Label htmlFor={distance.value} className="text-sm">
                    {distance.label}
                  </Label>
                </div>
              ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Experience Level */}
          <div>
            <Label htmlFor="experienceLevel">Experience Level</Label>
            <Select
              value={formData.experienceLevel || ''}
              onValueChange={(value) => handleInputChange('experienceLevel', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preferred Pace */}
          <div>
            <Label htmlFor="preferredPace">Preferred Pace</Label>
            <Select
              value={formData.preferredPace || ''}
              onValueChange={(value) => handleInputChange('preferredPace', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pace" />
              </SelectTrigger>
              <SelectContent>
                {PACE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preferred Time */}
          <div>
            <Label htmlFor="preferredTime">Preferred Time</Label>
            <Select
              value={formData.preferredTime || ''}
              onValueChange={(value) => handleInputChange('preferredTime', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Running Goals */}
        <div>
          <Label className="text-base font-medium">Running Goals</Label>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
            {GOAL_OPTIONS.map(goal => (
              <div key={goal.value} className="flex items-center space-x-2">
                <Checkbox
                  id={goal.value}
                  checked={(formData.runningGoals || []).includes(goal.value)}
                  onCheckedChange={(checked) => {
                    const currentGoals = formData.runningGoals || [];
                    if (checked) {
                      handleInputChange('runningGoals', [...currentGoals, goal.value]);
                    } else {
                      handleInputChange('runningGoals', currentGoals.filter(g => g !== goal.value));
                    }
                  }}
                />
                <Label htmlFor={goal.value} className="text-sm">
                  {goal.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div>
          <Label className="text-base font-medium">Availability</Label>
          <div className="grid grid-cols-4 lg:grid-cols-7 gap-2 mt-2">
            {AVAILABILITY_DAYS.map(day => (
              <div key={day.value} className="flex items-center space-x-2">
                <Checkbox
                  id={day.value}
                  checked={(formData.availabilityDays || []).includes(day.value)}
                  onCheckedChange={(checked) => {
                    const currentDays = formData.availabilityDays || [];
                    if (checked) {
                      handleInputChange('availabilityDays', [...currentDays, day.value]);
                    } else {
                      handleInputChange('availabilityDays', currentDays.filter(d => d !== day.value));
                    }
                  }}
                />
                <Label htmlFor={day.value} className="text-sm">
                  {day.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}