import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navigation from "@/components/navigation";
import SmoothMobileNav from "@/components/smooth-mobile-nav";
import DragDropEventCreator from "@/components/drag-drop-event-creator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertEventSchema } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function DragDropCreatePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      // Transform the drag-drop event data to match our schema
      const transformedData = {
        title: eventData.title,
        description: eventData.description || "",
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        lat: "0", // Will be geocoded on the server
        lng: "0", // Will be geocoded on the server
        distance: eventData.distance || "5K",
        maxParticipants: eventData.maxParticipants || 15,
        isClubEvent: eventData.isClubEvent || false,
        clubName: eventData.clubName || "",
        abilityLevels: eventData.abilityLevels || [],
        creatorComments: eventData.creatorComments || "",
        isRace: eventData.isRace || false,
        raceCost: eventData.raceCost || undefined,
        raceWebsite: eventData.raceWebsite || "",
      };

      // Validate the data
      const validatedData = insertEventSchema.parse(transformedData);
      
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      
      toast({
        title: "Event Created Successfully!",
        description: `"${data.title || 'Your event'}" has been created and is now open for participants.`,
      });
      
      // Redirect to home page to see the new event
      setTimeout(() => {
        setLocation("/");
      }, 1500);
    },
    onError: (error: any) => {
      // Event creation error handled in toast
      toast({
        title: "Failed to Create Event",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <Navigation />
      
      <div className="container mx-auto py-6 px-4 mobile-content-padding">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Create Your Perfect Running Event
            </h1>
            <p className="text-xl text-gray-600">
              Drag and drop templates to design an engaging running experience
            </p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-500 max-w-md mx-auto">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Choose templates</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Drop on canvas</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span>Fill details</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span>Create event</span>
              </div>
            </div>
          </div>

          {/* Welcome message for authenticated user */}
          {user && (
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 mb-6 border border-orange-200">
              <p className="text-center text-gray-700">
                Welcome, <span className="font-semibold">{(user as any)?.firstName || 'Runner'}</span>! 
                Let&apos;s create an amazing running event for your community.
              </p>
            </div>
          )}

          {/* Main Drag-Drop Interface */}
          <DragDropEventCreator
            onEventCreate={(eventData) => createEventMutation.mutate(eventData)}
            isCreating={createEventMutation.isPending}
          />

          {/* Tips Section */}
          <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-blue-200">
            <h3 className="font-semibold text-lg mb-4 text-center">💡 Pro Tips for Great Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-1">Choose the Right Distance</h4>
                <p className="text-blue-600">Match the distance to your group&apos;s fitness level</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-medium text-green-800 mb-1">Pick Great Locations</h4>
                <p className="text-green-600">Parks and tracks create safe, enjoyable experiences</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-1">Time It Right</h4>
                <p className="text-orange-600">Early morning or evening runs work best</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-1">Group Size</h4>
                <p className="text-purple-600">Choose an appropriate group size for your event</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SmoothMobileNav />
    </div>
  );
}