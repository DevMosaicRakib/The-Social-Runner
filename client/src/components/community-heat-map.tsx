import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Activity, Users, TrendingUp, Map, Calendar, Clock } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { EventWithParticipants } from "@shared/schema";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface HeatMapZone {
  id: string;
  center: [number, number];
  radius: number;
  eventCount: number;
  participantCount: number;
  averageDistance: number;
  popularTimes: string[];
  intensity: "low" | "medium" | "high" | "very-high";
  color: string;
}

interface CommunityHeatMapProps {
  className?: string;
}

export default function CommunityHeatMap({ className = "" }: CommunityHeatMapProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30");
  const [selectedMetric, setSelectedMetric] = useState("events");
  const [radiusFilter, setRadiusFilter] = useState([5000]); // meters
  const [selectedZone, setSelectedZone] = useState<HeatMapZone | null>(null);

  const { data: events, isLoading } = useQuery<EventWithParticipants[]>({
    queryKey: ["/api/events"],
  });

  // Generate heat map zones from event data
  const heatMapZones = useMemo(() => {
    if (!events) return [];

    // Filter events based on timeframe
    const timeframeDays = parseInt(selectedTimeframe);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);

    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= cutoffDate;
    });

    // Group events by proximity (within 2km radius)
    const zones: HeatMapZone[] = [];
    const processedEvents = new Set<number>();

    filteredEvents.forEach(event => {
      if (processedEvents.has(event.id)) return;

      const nearbyEvents = filteredEvents.filter(otherEvent => {
        if (processedEvents.has(otherEvent.id)) return false;
        
        // Calculate distance between events
        const distance = calculateDistance(
          parseFloat(event.lat),
          parseFloat(event.lng),
          parseFloat(otherEvent.lat),
          parseFloat(otherEvent.lng)
        );
        
        return distance <= 2000; // 2km radius for grouping
      });

      // Mark events as processed
      nearbyEvents.forEach(e => processedEvents.add(e.id));

      // Calculate zone metrics
      const totalParticipants = nearbyEvents.reduce((sum, e) => sum + (e.participants?.length || 0), 0);
      const averageDistance = nearbyEvents.reduce((sum, e) => {
        const dist = typeof e.distance === 'string' ? parseFloat(e.distance.replace(/[^\d.]/g, '')) : e.distance;
        return sum + (dist || 5);
      }, 0) / nearbyEvents.length;
      
      // Extract popular times
      const timeFrequency: { [key: string]: number } = {};
      nearbyEvents.forEach(e => {
        const hour = parseInt(e.time.split(':')[0]);
        let timeSlot = "morning";
        if (hour >= 12 && hour < 18) timeSlot = "afternoon";
        else if (hour >= 18) timeSlot = "evening";
        
        timeFrequency[timeSlot] = (timeFrequency[timeSlot] || 0) + 1;
      });
      
      const popularTimes = Object.entries(timeFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .map(([time]) => time);

      // Calculate center point
      const centerLat = nearbyEvents.reduce((sum, e) => sum + parseFloat(e.lat), 0) / nearbyEvents.length;
      const centerLng = nearbyEvents.reduce((sum, e) => sum + parseFloat(e.lng), 0) / nearbyEvents.length;

      // Determine intensity and color
      let intensity: HeatMapZone['intensity'] = "low";
      let color = "#10b981"; // green
      
      if (selectedMetric === "events") {
        if (nearbyEvents.length >= 15) { intensity = "very-high"; color = "#dc2626"; }
        else if (nearbyEvents.length >= 8) { intensity = "high"; color = "#ea580c"; }
        else if (nearbyEvents.length >= 3) { intensity = "medium"; color = "#f59e0b"; }
      } else {
        if (totalParticipants >= 100) { intensity = "very-high"; color = "#dc2626"; }
        else if (totalParticipants >= 50) { intensity = "high"; color = "#ea580c"; }
        else if (totalParticipants >= 20) { intensity = "medium"; color = "#f59e0b"; }
      }

      zones.push({
        id: `zone-${zones.length}`,
        center: [centerLat, centerLng],
        radius: Math.min(2000, Math.max(500, nearbyEvents.length * 100)),
        eventCount: nearbyEvents.length,
        participantCount: totalParticipants,
        averageDistance: Math.round(averageDistance * 10) / 10,
        popularTimes,
        intensity,
        color
      });
    });

    return zones.sort((a, b) => {
      if (selectedMetric === "events") return b.eventCount - a.eventCount;
      return b.participantCount - a.participantCount;
    });
  }, [events, selectedTimeframe, selectedMetric]);

  // Calculate distance between two coordinates
  function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Get intensity statistics
  const intensityStats = useMemo(() => {
    const stats = {
      low: heatMapZones.filter(z => z.intensity === "low").length,
      medium: heatMapZones.filter(z => z.intensity === "medium").length,
      high: heatMapZones.filter(z => z.intensity === "high").length,
      "very-high": heatMapZones.filter(z => z.intensity === "very-high").length,
    };
    
    const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    return { ...stats, total };
  }, [heatMapZones]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Community Heat Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-slate-100 animate-pulse rounded-lg flex items-center justify-center">
            <div className="text-slate-500">Loading community data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Community Heat Map
        </CardTitle>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-600" />
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="events">Event Count</SelectItem>
                <SelectItem value="participants">Participants</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Intensity Legend */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Low ({intensityStats.low})
          </Badge>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Medium ({intensityStats.medium})
          </Badge>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            High ({intensityStats.high})
          </Badge>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Very High ({intensityStats["very-high"]})
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-96 rounded-lg overflow-hidden border">
          <MapContainer
            center={[-33.8688, 151.2093]} // Sydney center
            zoom={11}
            style={{ height: "100%", width: "100%" }}
            className="leaflet-container"
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            {/* Heat map zones */}
            {heatMapZones.map((zone) => (
              <Circle
                key={zone.id}
                center={zone.center}
                radius={zone.radius}
                pathOptions={{
                  fillColor: zone.color,
                  color: zone.color,
                  weight: 2,
                  opacity: 0.8,
                  fillOpacity: 0.3,
                }}
                eventHandlers={{
                  click: () => setSelectedZone(zone),
                }}
              >
                <Popup>
                  <div className="p-2 min-w-48">
                    <div className="font-semibold mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Running Zone
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Events:</span>
                        <Badge variant="secondary">{zone.eventCount}</Badge>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Participants:</span>
                        <Badge variant="secondary">{zone.participantCount}</Badge>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Avg Distance:</span>
                        <Badge variant="secondary">{zone.averageDistance}km</Badge>
                      </div>
                      
                      {zone.popularTimes.length > 0 && (
                        <div>
                          <span className="text-slate-600">Popular Times:</span>
                          <div className="flex gap-1 mt-1">
                            {zone.popularTimes.map(time => (
                              <Badge key={time} variant="outline" className="text-xs">
                                {time}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        </div>

        {/* Zone Statistics */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-900">{intensityStats.total}</div>
            <div className="text-sm text-slate-600">Active Zones</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {heatMapZones.reduce((sum, zone) => sum + zone.eventCount, 0)}
            </div>
            <div className="text-sm text-green-700">Total Events</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {heatMapZones.reduce((sum, zone) => sum + zone.participantCount, 0)}
            </div>
            <div className="text-sm text-blue-700">Total Participants</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {heatMapZones.length > 0 ? 
                Math.round(heatMapZones.reduce((sum, zone) => sum + zone.averageDistance, 0) / heatMapZones.length * 10) / 10 
                : 0}km
            </div>
            <div className="text-sm text-orange-700">Avg Distance</div>
          </div>
        </div>

        {/* Selected Zone Details */}
        {selectedZone && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Map className="w-4 h-4" />
                Zone Details
              </h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedZone(null)}
              >
                ×
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Activity Level:</span>
                <Badge className="ml-2" style={{ backgroundColor: selectedZone.color, color: 'white' }}>
                  {selectedZone.intensity.replace('-', ' ')}
                </Badge>
              </div>
              
              <div>
                <span className="text-slate-600">Zone Radius:</span>
                <span className="ml-2 font-medium">{Math.round(selectedZone.radius)}m</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}