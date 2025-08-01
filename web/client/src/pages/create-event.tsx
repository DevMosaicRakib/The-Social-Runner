import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ArrowLeft, MapPin, Calendar, Clock, Users, Route, Repeat, CheckSquare } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useLocation } from "wouter";
import { recurringEventSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import EventMap from "@/components/event-map";
import LocationSearch from "@/components/location-search";
import type { LocationData } from "@shared/australianLocations";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(1, "Location is required"),
  lat: z.string().min(1, "Latitude is required"),
  lng: z.string().min(1, "Longitude is required"),
  distance: z.string().min(1, "Distance is required"),
  maxParticipants: z.number().min(2).max(50),
  isClubEvent: z.boolean().optional(),
  clubName: z.string().optional(),
  abilityLevels: z.array(z.enum(['beginner', 'intermediate', 'advanced', 'all_welcome'])).default([]),
  creatorComments: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringType: z.enum(['daily', 'weekly', 'monthly']).optional(),
  recurringEndDate: z.string().optional(),
  recurringDaysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  // Race fields
  isRace: z.boolean().optional(),
  raceCost: z.number().positive().optional(),
  raceWebsite: z.string().url().optional().or(z.literal("")),
}).refine((data) => {
  // If it's a club event, club name is required
  if (data.isClubEvent && !data.clubName?.trim()) {
    return false;
  }
  // If it's recurring, require recurring type and end date
  if (data.isRecurring && (!data.recurringType || !data.recurringEndDate)) {
    return false;
  }
  // If race website is provided, it must be a valid URL
  if (data.raceWebsite && data.raceWebsite.trim() && !data.raceWebsite.startsWith('http')) {
    return false;
  }
  return true;
}, {
  message: "Club events require a club name, recurring events require type and end date, and race website must be a valid URL",
});

type FormData = z.infer<typeof formSchema>;

export default function CreateEvent() {
  const [, setLocation] = useLocation();
  const [selectedLocation, setSelectedLocation] = useState<{ lat: string; lng: string; address: string } | null>(null);
  const [selectedSuburb, setSelectedSuburb] = useState<LocationData | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      lat: "",
      lng: "",
      distance: "",
      maxParticipants: 15,
      isRecurring: false,
      recurringType: undefined,
      recurringEndDate: undefined,
      recurringDaysOfWeek: undefined,
      isClubEvent: false,
      clubName: "",
      abilityLevels: [],
      creatorComments: "",
      isRace: false,
      raceCost: undefined,
      raceWebsite: "",
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("/api/events", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (response: any) => {
      const isRecurring = response?.totalEvents > 1;
      toast({
        title: isRecurring ? "Recurring Events Created" : "Event Created",
        description: isRecurring 
          ? `Successfully created ${response.totalEvents} recurring events!`
          : "Your running event has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setLocation("/");
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
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createEventMutation.mutate(data);
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation({
      lat: location.lat.toString(),
      lng: location.lng.toString(),
      address: location.address
    });
    form.setValue("lat", location.lat.toString());
    form.setValue("lng", location.lng.toString());
    form.setValue("location", location.address);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Running Event</h1>
          <p className="text-slate-600">Set up a new running event and connect with The Social Runner community.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Morning Central Park Run" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Time
                        </FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Location */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Event Location
                      </FormLabel>
                      <FormControl>
                        <LocationSearch
                          value={field.value}
                          onLocationSelect={(location) => {
                            setSelectedSuburb(location);
                            form.setValue("location", location.label);
                            form.setValue("lat", location.lat.toString());
                            form.setValue("lng", location.lng.toString());
                            // Update map location for backward compatibility
                            setSelectedLocation({
                              lat: location.lat.toString(),
                              lng: location.lng.toString(),
                              address: location.label
                            });
                          }}
                          placeholder="Search Australian suburbs and cities..."
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Map for Location Selection */}
                <div>
                  <FormLabel>Pin Start Location on Map</FormLabel>
                  <div className="mt-2">
                    <EventMap 
                      events={[]} 
                      interactive={true}
                      onLocationSelect={handleLocationSelect}
                      className="h-64 rounded-lg border"
                    />
                  </div>
                  <p className="text-sm text-slate-600 mt-1">Click on the map to set the start location for your event.</p>
                </div>

                {/* Distance and Participants */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="distance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Route className="h-4 w-4" />
                          Distance
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select distance" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1K">1K</SelectItem>
                            <SelectItem value="2K">2K</SelectItem>
                            <SelectItem value="3K">3K</SelectItem>
                            <SelectItem value="5K">5K</SelectItem>
                            <SelectItem value="8K">8K</SelectItem>
                            <SelectItem value="10K">10K</SelectItem>
                            <SelectItem value="15K">15K</SelectItem>
                            <SelectItem value="Half Marathon">Half Marathon (21K)</SelectItem>
                            <SelectItem value="Marathon">Marathon (42K)</SelectItem>
                            <SelectItem value="Trail Run">Trail Run</SelectItem>
                            <SelectItem value="Fun Run">Fun Run</SelectItem>
                            <SelectItem value="Other">Other Distance</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Max Participants
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="15" 
                            min="2" 
                            max="50"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 15)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Club Event Section */}
                <div className="space-y-4 border-t pt-4">
                  <FormField
                    control={form.control}
                    name="isClubEvent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            This is a club event
                          </FormLabel>
                          <p className="text-sm text-slate-600">
                            Mark this if you&apos;re organising for a running club
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch("isClubEvent") && (
                    <FormField
                      control={form.control}
                      name="clubName"
                      render={({ field }) => (
                        <FormItem className="ml-6">
                          <FormLabel>Club Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your running club name..." 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Race Options */}
                <div className="space-y-4 border-t pt-4">
                  <FormField
                    control={form.control}
                    name="isRace"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center gap-2">
                            🏁 This is a race event
                          </FormLabel>
                          <p className="text-sm text-slate-600">
                            Check if this is a competitive race with timing and results
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch("isRace") && (
                    <div className="space-y-4 ml-6 border-l-2 border-blue-200 pl-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="raceCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Entry Cost (Optional)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                                  <Input 
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    className="pl-8"
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                  />
                                </div>
                              </FormControl>
                              <p className="text-xs text-slate-500">
                                Leave blank if the race is free
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="raceWebsite"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Race Website (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="url"
                                  placeholder="https://example.com"
                                  {...field} 
                                />
                              </FormControl>
                              <p className="text-xs text-slate-500">
                                Link to registration or race information
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded">
                        <p className="font-medium">Race Event Details:</p>
                        <p>
                          {form.watch("raceCost") ? `Entry fee: $${form.watch("raceCost")}` : "Free entry"}
                          {form.watch("raceWebsite") && ` • Website: ${form.watch("raceWebsite")}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ability Levels */}
                <FormField
                  control={form.control}
                  name="abilityLevels"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4" />
                        Ability Levels Welcome
                      </FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                        {[
                          { value: "beginner", label: "Beginner", desc: "New to running" },
                          { value: "intermediate", label: "Intermediate", desc: "Regular runner" },
                          { value: "advanced", label: "Advanced", desc: "Experienced runner" },
                          { value: "all_welcome", label: "All Welcome", desc: "Any fitness level" }
                        ].map((level) => (
                          <div key={level.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={level.value}
                              checked={field.value?.includes(level.value as "beginner" | "intermediate" | "advanced" | "all_welcome")}
                              onCheckedChange={(checked) => {
                                const currentLevels = field.value || [];
                                if (checked) {
                                  field.onChange([...currentLevels, level.value as "beginner" | "intermediate" | "advanced" | "all_welcome"]);
                                } else {
                                  field.onChange(currentLevels.filter((l) => l !== level.value));
                                }
                              }}
                            />
                            <div>
                              <label htmlFor={level.value} className="text-sm font-medium cursor-pointer">
                                {level.label}
                              </label>
                              <p className="text-xs text-slate-500">{level.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Creator Comments */}
                <FormField
                  control={form.control}
                  name="creatorComments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Comments</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any additional details about the event, route info, meeting points, what to bring, etc..."
                          className="resize-none"
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <p className="text-sm text-slate-600">
                        Share helpful details like route information, parking, what to bring, or special instructions
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Recurring Event Options */}
                <div className="space-y-4 border-t pt-4">
                  <FormField
                    control={form.control}
                    name="isRecurring"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center gap-2">
                            <Repeat className="h-4 w-4" />
                            Make this a recurring event
                          </FormLabel>
                          <p className="text-sm text-slate-600">
                            Create multiple events that repeat on a schedule
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch("isRecurring") && (
                    <div className="space-y-4 ml-6 border-l-2 border-orange-200 pl-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="recurringType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frequency</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="How often?" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="recurringEndDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {form.watch("recurringType") === "weekly" && (
                        <FormField
                          control={form.control}
                          name="recurringDaysOfWeek"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Days of Week</FormLabel>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {[
                                  { value: 1, label: "Mon" },
                                  { value: 2, label: "Tue" },
                                  { value: 3, label: "Wed" },
                                  { value: 4, label: "Thu" },
                                  { value: 5, label: "Fri" },
                                  { value: 6, label: "Sat" },
                                  { value: 0, label: "Sun" },
                                ].map((day) => {
                                  const currentDays = field.value || [];
                                  const isSelected = currentDays.includes(day.value);
                                  
                                  return (
                                    <Button
                                      key={day.value}
                                      type="button"
                                      variant={isSelected ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => {
                                        if (isSelected) {
                                          field.onChange(currentDays.filter((d: number) => d !== day.value));
                                        } else {
                                          field.onChange([...currentDays, day.value]);
                                        }
                                      }}
                                    >
                                      {day.label}
                                    </Button>
                                  );
                                })}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded">
                        <p className="font-medium">Preview:</p>
                        <p>
                          {form.watch("recurringType") === "daily" && "This event will repeat every day"}
                          {form.watch("recurringType") === "weekly" && 
                            `This event will repeat weekly${
                              form.watch("recurringDaysOfWeek")?.length ? 
                                ` on ${form.watch("recurringDaysOfWeek")?.map((d: number) => 
                                  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]
                                ).join(", ")}` : ""
                            }`
                          }
                          {form.watch("recurringType") === "monthly" && "This event will repeat monthly"}
                          {form.watch("recurringEndDate") && ` until ${form.watch("recurringEndDate")}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any additional details about your running event..."
                          rows={3}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-4">
                  <Link href="/">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    className="btn-primary"
                    disabled={createEventMutation.isPending}
                  >
                    {createEventMutation.isPending ? "Creating..." : "Create Event"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
