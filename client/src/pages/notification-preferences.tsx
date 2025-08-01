import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ArrowLeft, Bell, Smartphone, Clock, Brain, Zap, BatteryLow, MapPin } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";

const notificationPreferencesSchema = z.object({
  events: z.boolean(),
  achievements: z.boolean(),
  social: z.boolean(),
  reminders: z.boolean(),
  frequency: z.enum(['immediate', 'daily', 'weekly']),
  quietHours: z.object({
    enabled: z.boolean(),
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be in HH:mm format"),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be in HH:mm format"),
  }),
  deviceSettings: z.object({
    sound: z.boolean(),
    vibration: z.boolean(),
    badge: z.boolean(),
  }),
  adaptiveSettings: z.object({
    smartTiming: z.boolean(),
    contextAware: z.boolean(),
    engagementBased: z.boolean(),
    batteryOptimised: z.boolean(),
  }),
});

type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;

const defaultPreferences: NotificationPreferences = {
  events: true,
  achievements: true,
  social: true,
  reminders: true,
  frequency: 'immediate',
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  },
  deviceSettings: {
    sound: true,
    vibration: true,
    badge: true
  },
  adaptiveSettings: {
    smartTiming: true,
    contextAware: true,
    engagementBased: true,
    batteryOptimised: true
  }
};

export default function NotificationPreferences() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();
  const [testingSent, setTestingSent] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorised",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch current notification preferences
  const { data: preferences, isLoading: preferencesLoading, error } = useQuery({
    queryKey: ['/api/notifications/preferences'],
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (isUnauthorizedError(error as Error)) return false;
      return failureCount < 3;
    }
  });

  // Handle authentication errors from query
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorised",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  const form = useForm<NotificationPreferences>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: defaultPreferences,
  });

  // Update form when preferences are loaded
  useEffect(() => {
    if (preferences) {
      form.reset(preferences.notificationPreferences || defaultPreferences);
    }
  }, [preferences, form]);

  // Save preferences mutation
  const savePreferencesMutation = useMutation({
    mutationFn: async (data: NotificationPreferences) => {
      await apiRequest('/api/notifications/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ notificationPreferences: data }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/preferences'] });
      toast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorised",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Test notification mutation
  const testNotificationMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('/api/notifications/test', { method: 'POST' });
    },
    onSuccess: () => {
      setTestingSent(true);
      toast({
        title: "Test Notification Sent",
        description: "Check your device for the test notification.",
      });
      setTimeout(() => setTestingSent(false), 5000);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorised",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send test notification. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NotificationPreferences) => {
    savePreferencesMutation.mutate(data);
  };

  const handleTestNotification = () => {
    testNotificationMutation.mutate();
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notification Preferences</h1>
            <p className="text-gray-600 mt-1">Customise your notification experience with adaptive settings</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Notification Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-600" />
                  Notification Types
                </CardTitle>
                <CardDescription>
                  Choose which types of notifications you'd like to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="events"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">Event Updates</FormLabel>
                          <FormDescription>
                            New events, changes, and cancellations
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="achievements"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">Achievements</FormLabel>
                          <FormDescription>
                            Personal records, milestones, and badges
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="social"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">Social Updates</FormLabel>
                          <FormDescription>
                            Friend requests, messages, and activity
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reminders"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">Event Reminders</FormLabel>
                          <FormDescription>
                            Upcoming events you've joined
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Frequency & Timing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Frequency & Timing
                </CardTitle>
                <CardDescription>
                  Control when and how often you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notification Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="daily">Daily Summary</SelectItem>
                          <SelectItem value="weekly">Weekly Summary</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How often you'd like to receive notification summaries
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border rounded-lg p-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="quietHours.enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">Quiet Hours</FormLabel>
                          <FormDescription>
                            Disable notifications during specific hours
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("quietHours.enabled") && (
                    <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-gray-200">
                      <FormField
                        control={form.control}
                        name="quietHours.start"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <input
                                type="time"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="quietHours.end"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <input
                                type="time"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Device Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-green-600" />
                  Device Settings
                </CardTitle>
                <CardDescription>
                  Configure how notifications appear on your device
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="deviceSettings.sound"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">Sound</FormLabel>
                          <FormDescription>
                            Play notification sounds
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deviceSettings.vibration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">Vibration</FormLabel>
                          <FormDescription>
                            Vibrate on notifications
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deviceSettings.badge"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">Badge</FormLabel>
                          <FormDescription>
                            Show notification badges
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Adaptive Intelligence */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Adaptive Intelligence
                </CardTitle>
                <CardDescription>
                  Let AI optimise your notification experience based on your behaviour and context
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="adaptiveSettings.smartTiming"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium flex items-center gap-2">
                            <Zap className="h-4 w-4 text-purple-600" />
                            Smart Timing
                          </FormLabel>
                          <FormDescription>
                            AI learns when you're most likely to engage
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="adaptiveSettings.contextAware"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-green-600" />
                            Context Aware
                          </FormLabel>
                          <FormDescription>
                            Filter notifications based on location & activity
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="adaptiveSettings.engagementBased"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-orange-50 to-red-50">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium flex items-center gap-2">
                            <Bell className="h-4 w-4 text-orange-600" />
                            Engagement Based
                          </FormLabel>
                          <FormDescription>
                            Adjust frequency based on your interactions
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="adaptiveSettings.batteryOptimised"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium flex items-center gap-2">
                            <BatteryLow className="h-4 w-4 text-yellow-600" />
                            Battery Optimised
                          </FormLabel>
                          <FormDescription>
                            Reduce notifications when battery is low
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Test & Save */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestNotification}
                disabled={testNotificationMutation.isPending || testingSent}
                className="gap-2"
              >
                <Bell className="h-4 w-4" />
                {testingSent ? "Test Sent!" : "Send Test Notification"}
              </Button>

              <Button
                type="submit"
                disabled={savePreferencesMutation.isPending}
                className="gap-2"
              >
                {savePreferencesMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    Save Preferences
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}