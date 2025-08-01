import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Home, Upload, Users, MapPin, Calendar, Target, DollarSign, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import Navigation from "@/components/navigation";
import SmoothMobileNav from "@/components/smooth-mobile-nav";
import Footer from "@/components/footer";
import LocationSearch from "@/components/location-search";
import SEOHead from "@/components/seo-head";

const createRunclubSchema = z.object({
  name: z.string().min(1, "Club name is required").max(100, "Club name must be less than 100 characters"),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  annualCost: z.string().optional().transform(val => val === "" ? "0" : val),
  location: z.string().min(1, "Location is required"),
  lat: z.string().min(1, "Location coordinates are required"),
  lng: z.string().min(1, "Location coordinates are required"),
  runDays: z.array(z.string()).min(1, "At least one run day is required"),
  distances: z.array(z.string()).min(1, "At least one distance is required"),
  abilityLevels: z.array(z.string()).min(1, "At least one ability level is required"),
  comments: z.string().optional(),
});

type FormData = z.infer<typeof createRunclubSchema>;

const RUN_DAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

const DISTANCES = [
  { value: "5k", label: "5K" },
  { value: "10k", label: "10K" },
  { value: "15k", label: "15K" },
  { value: "half_marathon", label: "Half Marathon" },
  { value: "marathon", label: "Marathon" },
  { value: "ultra", label: "Ultra Marathon" },
  { value: "fun_run", label: "Fun Run" },
  { value: "other", label: "Other" },
];

const ABILITY_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "elite", label: "Elite" },
];

export default function CreateRunclub() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: string;
    lng: string;
    address: string;
  } | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(createRunclubSchema),
    defaultValues: {
      name: "",
      description: "",
      logoUrl: "",
      annualCost: "0",
      location: "",
      lat: "",
      lng: "",
      runDays: [],
      distances: [],
      abilityLevels: [],
      comments: "",
    },
  });

  const createRunclubMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("/api/runclubs", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your run club has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/runclubs"] });
      setLocation("/find-runclub");
    },
    onError: (error) => {
      console.error("Error creating runclub:", error);
      toast({
        title: "Error",
        description: "Failed to create run club. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createRunclubMutation.mutate(data);
  };

  const handleLocationSelect = (location: any) => {
    const address = location.name || location.address || location.suburb || '';
    setSelectedLocation({
      lat: location.lat.toString(),
      lng: location.lng.toString(),
      address: address
    });
    form.setValue("lat", location.lat.toString());
    form.setValue("lng", location.lng.toString());
    form.setValue("location", address);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        form.setValue("logoUrl", result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <SEOHead
        title="Create Run Club - Start Your Community"
        description="Create and launch your own Run Club in Australia. Build a local running community with custom schedules, member management, and group activities. Connect runners in your area."
        keywords="create running club, start run club, running community, local running group, club management, training group setup"
        ogType="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Create Running Club",
          "description": "Start your own running club and build a local community",
          "mainEntity": {
            "@type": "SportsClub",
            "sport": "Running",
            "name": "Create Run Club",
            "description": "Platform for creating and managing run clubs across Australia"
          }
        }}
      />
      <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="container mx-auto py-6 px-4 mobile-content-padding">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link href="/find-runclub">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Find Clubs
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2 mb-4">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Return Home</span>
                <span className="sm:hidden">Home</span>
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Create Run Club</h1>
            <p className="text-slate-600">Start your own running community and connect with local runners.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Club Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Club Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Club Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Sydney Sunrise Runners" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell potential members about your club's mission, goals, and what makes it special..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Logo Upload */}
                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Club Logo (Optional)</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            {field.value && (
                              <div className="flex items-center gap-4">
                                <img
                                  src={field.value}
                                  alt="Club logo preview"
                                  className="w-16 h-16 rounded-full object-cover border"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => form.setValue("logoUrl", "")}
                                >
                                  Remove
                                </Button>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                                id="logo-upload"
                              />
                              <Label htmlFor="logo-upload" className="cursor-pointer">
                                <Button type="button" variant="outline" asChild>
                                  <span>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Logo
                                  </span>
                                </Button>
                              </Label>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Annual Cost */}
                  <FormField
                    control={form.control}
                    name="annualCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Membership Cost (AUD)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.01"
                              placeholder="0.00"
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <p className="text-sm text-gray-600">Enter 0 for free clubs</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Location */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Primary Location *
                        </FormLabel>
                        <FormControl>
                          <LocationSearch
                            onLocationSelect={handleLocationSelect}
                            placeholder="Search for club's main meeting location..."
                            defaultValue={selectedLocation?.address || field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Run Days */}
                  <FormField
                    control={form.control}
                    name="runDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Run Days *
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {RUN_DAYS.map((day) => (
                              <div key={day.value} className="flex items-center space-x-2">
                                <Checkbox
                                  id={day.value}
                                  checked={field.value?.includes(day.value)}
                                  onCheckedChange={(checked) => {
                                    const updatedDays = checked
                                      ? [...(field.value || []), day.value]
                                      : (field.value || []).filter((d) => d !== day.value);
                                    field.onChange(updatedDays);
                                  }}
                                />
                                <Label htmlFor={day.value} className="text-sm">
                                  {day.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Distances */}
                  <FormField
                    control={form.control}
                    name="distances"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Distance Focus *
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {DISTANCES.map((distance) => (
                              <div key={distance.value} className="flex items-center space-x-2">
                                <Checkbox
                                  id={distance.value}
                                  checked={field.value?.includes(distance.value)}
                                  onCheckedChange={(checked) => {
                                    const updatedDistances = checked
                                      ? [...(field.value || []), distance.value]
                                      : (field.value || []).filter((d) => d !== distance.value);
                                    field.onChange(updatedDistances);
                                  }}
                                />
                                <Label htmlFor={distance.value} className="text-sm">
                                  {distance.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Ability Levels */}
                  <FormField
                    control={form.control}
                    name="abilityLevels"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Ability Levels Welcome *
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {ABILITY_LEVELS.map((level) => (
                              <div key={level.value} className="flex items-center space-x-2">
                                <Checkbox
                                  id={level.value}
                                  checked={field.value?.includes(level.value)}
                                  onCheckedChange={(checked) => {
                                    const updatedLevels = checked
                                      ? [...(field.value || []), level.value]
                                      : (field.value || []).filter((l) => l !== level.value);
                                    field.onChange(updatedLevels);
                                  }}
                                />
                                <Label htmlFor={level.value} className="text-sm">
                                  {level.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Additional Comments */}
                  <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Information</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any special requirements, meeting points, social activities, or other details potential members should know..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Link href="/find-runclub">
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </Link>
                    <Button 
                      type="submit" 
                      disabled={createRunclubMutation.isPending}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {createRunclubMutation.isPending ? "Creating..." : "Create Running Club"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      <SmoothMobileNav />
      <Footer />
      </div>
    </>
  );
}