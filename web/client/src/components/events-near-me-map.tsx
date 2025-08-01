import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Users, 
  Calendar,
  Loader2,
  Search,
  Filter
} from "lucide-react";
import type { EventWithParticipants } from "@shared/schema";
import { searchLocations, type LocationData } from "@shared/australianLocations";
import InteractiveMap from "@/components/interactive-map";
import LocationSearch from "@/components/location-search";
import RunnerLoading, { RunnerLoadingCompact } from "@/components/runner-loading";

interface SimpleLocationData {
  lat: number;
  lng: number;
  name: string;
}

interface EventWithDistance extends Omit<EventWithParticipants, 'distance'> {
  distance: number;
  latitude: number;
  longitude: number;
}

export default function EventsNearMeMap() {
  const [userLocation, setUserLocation] = useState<LocationData>({
    value: "sydney-2000",
    label: "Sydney", 
    state: "NSW",
    postcode: "2000",
    lat: -33.8688, 
    lng: 151.2093
  });
  const [locationSearch, setLocationSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<string>("48"); // Default 48 hours
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Calculate hours based on filter selection
  const hoursFromFilter = useMemo(() => {
    if (timeFilter === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      const diffInMs = end.getTime() - start.getTime();
      return Math.max(1, Math.ceil(diffInMs / (1000 * 60 * 60))); // Convert to hours
    }
    return parseInt(timeFilter);
  }, [timeFilter, customStartDate, customEndDate]);

  // Fetch nearby events using current location and time filter
  const { data: nearbyEvents, isLoading: isLoadingEvents } = useQuery<EventWithDistance[]>({
    queryKey: ["/api/events/search/location", userLocation.lat, userLocation.lng, 10, hoursFromFilter],
    queryFn: async () => {
      const url = `/api/events/search/location?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=10&hours=${hoursFromFilter}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch nearby events: ${response.statusText}`);
      }
      return response.json();
    },
    retry: false,
    staleTime: 1 * 60 * 1000, // Reduced to 1 minute for faster updates
  });

  // Note: Using LocationSearch component instead of manual implementation

  // Handle location change from map click
  const handleMapLocationChange = (location: SimpleLocationData) => {
    const newLocation: LocationData = {
      value: `custom-${Date.now()}`,
      label: location.name,
      state: "CUSTOM",
      postcode: "0000",
      lat: location.lat,
      lng: location.lng
    };
    setUserLocation(newLocation);
    setLocationSearch(location.name);
  };

  // Initialize location search with current location
  useEffect(() => {
    if (!locationSearch) {
      setLocationSearch(userLocation.label);
    }
  }, [userLocation.label]);

  // LocationSearch component handles its own suggestion display and click outside behavior



  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-orange-500" />
          Events Near Me
          <Badge variant="secondary" className="ml-2">
            {nearbyEvents?.length || 0} events
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Within 10km of {userLocation.label} • {
            timeFilter === "custom" && customStartDate && customEndDate
              ? `${customStartDate} to ${customEndDate}`
              : timeFilter === "24" ? "Next 24 hours"
              : timeFilter === "48" ? "Next 2 days"
              : timeFilter === "168" ? "Next week"
              : timeFilter === "336" ? "Next 2 weeks"
              : timeFilter === "720" ? "Next month"
              : "Next 2 days"
          }
        </p>
      </CardHeader>
      <CardContent>
        {/* Location Search */}
        <div className="mb-4 space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Search className="h-3 w-3" />
              Search Location
            </h4>
            <LocationSearch
              value={locationSearch}
              onLocationSelect={(location: LocationData) => {
                setUserLocation(location);
                setLocationSearch(location.label);
              }}
              placeholder="Search Australian suburbs and cities..."
              showCurrentLocation={true}
              className="w-full"
            />
          </div>

          {/* Time Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Time Period
            </h4>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "24", label: "Next 24 hours" },
                  { value: "48", label: "Next 2 days" },
                  { value: "168", label: "Next week" },
                  { value: "336", label: "Next 2 weeks" },
                  { value: "720", label: "Next month" },
                  { value: "custom", label: "Custom range" }
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={timeFilter === option.value ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setTimeFilter(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              
              {/* Custom Date Range */}
              {timeFilter === "custom" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="startDate" className="text-xs">From</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="text-xs h-8"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-xs">To</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="text-xs h-8"
                      min={customStartDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Interactive Map */}
        <div className="mb-4 h-64">
          <InteractiveMap 
            events={nearbyEvents?.map(event => ({
              ...event,
              distance: `${event.distance.toFixed(1)}km`, // Convert back to string for display
              latitude: event.latitude, // Ensure these are passed through
              longitude: event.longitude
            })) || []} 
            className="h-full border-0 rounded-lg overflow-hidden"
            centerLocation={userLocation}
            onEventSelect={(event) => {
              // Event selected for details view
            }}
          />
        </div>

        {isLoadingEvents ? (
          <RunnerLoading count={2} showText={true} />
        ) : nearbyEvents && nearbyEvents.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Upcoming Events</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {nearbyEvents.slice(0, 4).map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-sm text-gray-900 truncate">
                      {event.title}
                    </h5>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(event.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Navigation className="h-3 w-3" />
                        <span>{event.distance.toFixed(1)}km away</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 ml-2">
                    <Users className="h-3 w-3" />
                    <span>{event.participantCount}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {nearbyEvents.length > 4 && (
              <div className="text-center pt-2">
                <Button variant="outline" size="sm">
                  View All {nearbyEvents.length} Events
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No events found nearby</p>
            <p className="text-sm text-gray-500">
              Try expanding your search radius or check back later
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}