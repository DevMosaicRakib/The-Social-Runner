import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, Users, Navigation } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { EventWithParticipants } from "@shared/schema";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface EventsNearMeProps {
  onEventClick?: (event: EventWithParticipants) => void;
}

export default function EventsNearMe({ onEventClick }: EventsNearMeProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState("48"); // hours
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setIsLoadingLocation(false);
      },
      (error) => {
        let errorMessage = "Unable to get your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location services and refresh.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        setLocationError(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const { data: nearbyEvents = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ["/api/events/search/location", location?.latitude, location?.longitude, dateFilter],
    queryFn: async () => {
      if (!location) return [];
      
      const radius = 10; // 10km radius
      const response = await apiRequest("GET", `/api/events/search/location?lat=${location.latitude}&lng=${location.longitude}&radius=${radius}&hours=${dateFilter}`);
      return response.json();
    },
    enabled: !!location,
    retry: false,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric",
        weekday: "short"
      });
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Removed unused calculateDistance function as it's now handled on the server

  const openInMaps = (event: EventWithParticipants) => {
    // Extract coordinates from location if available, otherwise use location name
    const query = encodeURIComponent(event.location);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(mapsUrl, '_blank');
  };

  if (isLoadingLocation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-orange-500" />
            Events Near Me
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Navigation className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-gray-600">Getting your location...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (locationError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-orange-500" />
            Events Near Me
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MapPin className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-600 mb-4">{locationError}</p>
            <Button onClick={getCurrentLocation} variant="outline" size="sm">
              Try Again
            </Button>
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
            <MapPin className="h-5 w-5 text-orange-500" />
            Events Near Me
            {location && (
              <Badge variant="outline" className="text-xs">
                Within 10km
              </Badge>
            )}
          </CardTitle>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24">Next 24h</SelectItem>
              <SelectItem value="48">Next 48h</SelectItem>
              <SelectItem value="72">Next 3 days</SelectItem>
              <SelectItem value="168">Next week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {/* Interactive Map Placeholder */}
        <div className="relative bg-gray-100 rounded-lg h-64 mb-6 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-orange-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Interactive Map</p>
              <p className="text-xs text-gray-500">
                {location && `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
              </p>
              {nearbyEvents.length > 0 && (
                <Badge variant="secondary" className="mt-2">
                  {nearbyEvents.length} event{nearbyEvents.length !== 1 ? 's' : ''} nearby
                </Badge>
              )}
            </div>
          </div>
          
          {/* Map pins visualization */}
          {location && nearbyEvents.map((event: EventWithParticipants, index: number) => (
            <div
              key={event.id}
              className="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
              style={{
                left: `${20 + (index * 15) % 60}%`,
                top: `${30 + (index * 20) % 40}%`,
              }}
              onClick={() => onEventClick?.(event)}
              title={event.title}
            >
              <div className="w-full h-full rounded-full bg-orange-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Events List */}
        {isLoadingEvents ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Finding nearby events...</p>
          </div>
        ) : nearbyEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">No events found nearby</p>
            <p className="text-xs text-gray-500">Try expanding your time filter or check back later</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 text-sm mb-3">
              {nearbyEvents.length} event{nearbyEvents.length !== 1 ? 's' : ''} found
            </h4>
            {nearbyEvents.map((event: EventWithParticipants) => (
              <div
                key={event.id}
                className="p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 transition-colors cursor-pointer"
                onClick={() => onEventClick?.(event)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-gray-900 text-sm leading-tight">
                    {event.title}
                  </h5>
                  {location && (
                    <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                      {/* Distance calculation placeholder */}
                      ~2km
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(event.time)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{event.participantCount}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openInMaps(event);
                    }}
                    className="text-xs h-6 px-2"
                  >
                    Directions
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {location && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Location accuracy: ±{Math.round(location.accuracy)}m
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}