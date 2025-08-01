import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";
import type { EventWithParticipants } from "@shared/schema";

interface EventMapProps {
  events: EventWithParticipants[];
  interactive?: boolean;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  className?: string;
}

export default function EventMap({ events, interactive = false, onLocationSelect, className }: EventMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Simulate map click for location selection
  const handleMapClick = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onLocationSelect) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert pixel coordinates to approximate lat/lng (simplified)
    // In real implementation, this would use actual map coordinates
    const lat = 40.7829 - (y / rect.height) * 0.1; // NYC area
    const lng = -73.9654 + (x / rect.width) * 0.1;
    
    setSelectedLocation({ lat, lng });
    setIsGeocoding(true);
    
    // Simulate reverse geocoding
    setTimeout(() => {
      const address = `Location near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      onLocationSelect({ lat, lng, address });
      setIsGeocoding(false);
    }, 1000);
  }, [interactive, onLocationSelect]);

  if (!interactive && events.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Event Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-slate-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-slate-500">
              <MapPin className="h-12 w-12 mx-auto mb-2" />
              <p>No events to display on map</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (interactive) {
    return (
      <div className={className}>
        <div 
          className="relative h-full bg-slate-100 rounded-lg border cursor-crosshair overflow-hidden"
          onClick={handleMapClick}
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Map overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          
          {!selectedLocation && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-center z-10">
              <div>
                <MapPin className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Click to select start location</p>
              </div>
            </div>
          )}
          
          {/* Crosshair */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[hsl(14,100%,60%)] z-10">
            <div className="w-6 h-6 border-2 border-current rounded-full bg-white bg-opacity-90 flex items-center justify-center">
              <div className="w-1 h-1 bg-current rounded-full" />
            </div>
          </div>

          {/* Selected location marker */}
          {selectedLocation && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                left: '50%',
                top: '50%'
              }}
            >
              <div className="bg-[hsl(14,100%,60%)] text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <MapPin className="h-4 w-4" />
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isGeocoding && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-3 py-2 rounded shadow-lg flex items-center space-x-2 z-10">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Getting location...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Event Locations</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          className="relative h-80 bg-slate-100 overflow-hidden"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Map overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          
          {/* Event markers */}
          {events.map((event, index) => (
            <div
              key={event.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${30 + (index % 3) * 25}%`,
                top: `${25 + Math.floor(index / 3) * 30}%`
              }}
            >
              <div className="bg-[hsl(14,100%,60%)] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg hover:scale-110 transition-transform cursor-pointer">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                {event.title}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
