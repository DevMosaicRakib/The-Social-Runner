import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { User, MapPin, Calendar, Mail } from "lucide-react";
import { useLocation } from "wouter";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { FaGoogle } from "react-icons/fa";
import { SiStrava } from "react-icons/si";
import LocationSearch from "@/components/location-search";
import GoalsManager from "@/components/goals-manager";
import type { LocationData } from "@shared/australianLocations";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  location: z.string().min(1, "Location is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  sex: z.string().min(1, "Sex is required"),
  preferredDistances: z.array(z.string()).min(1, "Select at least one preferred distance"),
  goals: z.array(z.object({
    eventName: z.string(),
    eventDate: z.string().optional(),
    targetTime: z.string().optional(),
    distance: z.string(),
    difficulty: z.string(),
    notes: z.string().optional(),
  })).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      location: "",
      dateOfBirth: "",
      sex: "",
      preferredDistances: [],
      goals: [],
    },
  });

  // Populate form with existing user data if available
  useEffect(() => {
    if (user) {
      const userData = user as any;
      form.reset({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        location: userData.location || "",
        dateOfBirth: userData.dateOfBirth || "",
        sex: userData.sex || "",
        preferredDistances: userData.preferredDistances || [],
      });
    }
  }, [user, form]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [isAuthenticated, isLoading]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest("PATCH", "/api/auth/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Help us create the perfect Social Runner experience for you
              </p>
              {(user as any)?.authProvider && (user as any)?.authProvider !== 'replit' && (
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-green-600">
                  {(user as any).authProvider === 'strava' && <SiStrava className="w-4 h-4" />}
                  {(user as any).authProvider === 'google' && <FaGoogle className="w-4 h-4" />}
                  Connected with {(user as any).authProvider === 'strava' ? 'Strava' : 'Google'}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input {...field} className="pl-10" placeholder="Enter your first name" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input {...field} className="pl-10" placeholder="Enter your last name" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <LocationSearch
                            value={field.value}
                            onLocationSelect={(location) => {
                              setSelectedLocation(location);
                              field.onChange(location.label);
                            }}
                            placeholder="Search Australian suburbs and cities..."
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                              {...field} 
                              type="date"
                              className="pl-10" 
                              max={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sex</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your sex" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="non-binary">Non-binary</SelectItem>
                              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredDistances"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Running Distances (select all that apply)</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { value: "5k", label: "5K" },
                              { value: "10k", label: "10K" },
                              { value: "15k", label: "15K" },
                              { value: "half_marathon", label: "Half Marathon" },
                              { value: "marathon", label: "Marathon" },
                              { value: "ultra", label: "Ultra Marathon" },
                              { value: "fun_run", label: "Fun Run" },
                              { value: "other", label: "Other" },
                            ].map((distance) => (
                              <div key={distance.value} className="flex items-center space-x-2">
                                <Checkbox
                                  id={distance.value}
                                  checked={field.value?.includes(distance.value)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValues, distance.value]);
                                    } else {
                                      field.onChange(currentValues.filter((v) => v !== distance.value));
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={distance.value}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {distance.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Training Goals Section */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="goals"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <GoalsManager
                              goals={(field.value || []).map(g => ({ ...g, status: g.status || 'in_progress' }))}
                              onChange={(goals) => field.onChange(goals)}
                              isOptional={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Updating..." : "Complete Profile"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}