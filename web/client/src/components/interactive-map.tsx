import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EventWithParticipants } from "@shared/schema";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Create custom modern marker icons
const createCustomIcon = (color: string = '#F97316') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50% 50% 50% 0;
        border: 2px solid white;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          color: white;
          font-size: 10px;
          font-weight: bold;
          transform: rotate(45deg);
        ">
          🏃
        </div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -20]
  });
};

// Fix for default markers in Leaflet with CDN URLs (fallback)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface InteractiveMapProps {
  events: EventWithParticipants[];
  className?: string;
  onEventSelect?: (event: EventWithParticipants) => void;
  centerLocation?: {
    lat: number;
    lng: number;
    label: string;
  };
}

// Function to geocode location names to coordinates
async function geocodeLocation(location: string): Promise<[number, number] | null> {
  try {
    // Use Nominatim (OpenStreetMap's geocoding service)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location + ', Australia')}&limit=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  
  // Return null if geocoding fails
  return null;
}

// Default coordinates for major Australian cities
const cityCoordinates: Record<string, [number, number]> = {
  'Sydney': [-33.8688, 151.2093],
  'Melbourne': [-37.8136, 144.9631],
  'Brisbane': [-27.4698, 153.0251],
  'Perth': [-31.9505, 115.8605],
  'Adelaide': [-34.9285, 138.6007],
  'Gold Coast': [-28.0167, 153.4000],
  'Newcastle': [-32.9283, 151.7817],
  'Canberra': [-35.2809, 149.1300],
  'Sunshine Coast': [-26.6500, 153.0667],
  'Wollongong': [-34.4278, 150.8931],
  'Hobart': [-42.8821, 147.3272],
  'Geelong': [-38.1499, 144.3617],
  'Townsville': [-19.2590, 146.8169],
  'Cairns': [-16.9186, 145.7781],
  'Darwin': [-12.4634, 130.8456],
  'Launceston': [-41.4332, 147.1441],
  'Bendigo': [-36.7570, 144.2794],
  'Albury': [-36.0737, 146.9135],
  'Ballarat': [-37.5622, 143.8503],
  'Bunbury': [-33.3267, 115.6441]
};

function getCoordinatesForLocation(location: string): [number, number] {
  // Check if location matches any known city
  const cityName = Object.keys(cityCoordinates).find(city => 
    location.toLowerCase().includes(city.toLowerCase())
  );
  
  if (cityName) {
    return cityCoordinates[cityName];
  }
  
  // Default to Sydney if no match found
  return cityCoordinates['Sydney'];
}

export default function InteractiveMap({ events, className, onEventSelect, centerLocation }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on provided location or default to Sydney with appropriate zoom for 10km radius
    const defaultCenter: [number, number] = centerLocation ? [centerLocation.lat, centerLocation.lng] : [-33.8688, 151.2093];
    const map = L.map(mapRef.current, {
      zoomControl: false, // We'll add a custom zoom control
      attributionControl: true
    }).setView(defaultCenter, 13);

    // Add custom zoom control positioned in top-right
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // Add modern Carto tiles with clean, contemporary styling
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map center when centerLocation changes
  useEffect(() => {
    if (mapInstanceRef.current && centerLocation) {
      mapInstanceRef.current.setView([centerLocation.lat, centerLocation.lng], 13);
    }
  }, [centerLocation]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add markers for events - use actual lat/lng from events if available
    const eventsWithCoords = events.map(event => {
      // Check if event has latitude/longitude properties (from location search API)
      const hasLatLngProps = 'latitude' in event && 'longitude' in event && 
                            typeof (event as any).latitude === 'number' && typeof (event as any).longitude === 'number';
      
      // Check if event has lat/lng as strings (from database)
      const hasStringCoords = event.lat && event.lng;
      
      const coords: [number, number] = hasLatLngProps 
        ? [(event as any).latitude, (event as any).longitude]
        : hasStringCoords
          ? [parseFloat(event.lat), parseFloat(event.lng)]
          : getCoordinatesForLocation(event.location);
      
      return { ...event, coords };
    });

    if (eventsWithCoords.length > 0) {
      // Create markers with custom styling
      eventsWithCoords.forEach(event => {
        const customIcon = createCustomIcon('#F97316'); // Orange color for running events
        const marker = L.marker(event.coords, { icon: customIcon }).addTo(mapInstanceRef.current!);
        
        // Create popup content
        const popupContent = `
          <div class="p-2 min-w-[200px]">
            <h3 class="font-semibold text-sm mb-1">${event.title}</h3>
            <p class="text-xs text-gray-600 mb-1">${event.location}</p>
            <p class="text-xs text-gray-600 mb-2">${new Date(event.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })} at ${event.time}</p>
            <p class="text-xs text-gray-600 mb-2">${event.distance} • ${event.participantCount}/${event.maxParticipants || '∞'} participants</p>
            <button 
              onclick="window.selectEvent(${event.id})" 
              class="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs py-1 px-2 rounded font-medium"
            >
              View Details
            </button>
          </div>
        `;
        
        marker.bindPopup(popupContent);
        markersRef.current.push(marker);
      });

      // Improved map bounds and centering logic
      if (centerLocation && eventsWithCoords.length > 0) {
        // When we have a center location (from search), fit bounds to show both center and all events
        const allPoints = [
          ...eventsWithCoords.map(event => event.coords),
          [centerLocation.lat, centerLocation.lng] as [number, number]
        ];
        
        // Create bounds from all points
        const bounds = L.latLngBounds(allPoints);
        
        // Fit to bounds with padding, ensuring minimum zoom for 10km radius visibility
        mapInstanceRef.current.fitBounds(bounds, { 
          padding: [20, 20],
          maxZoom: 14 // Prevent zooming in too much for small areas
        });
      } else if (eventsWithCoords.length > 1) {
        // Multiple events without center location - fit to all events
        const group = new L.FeatureGroup(markersRef.current);
        mapInstanceRef.current.fitBounds(group.getBounds(), { 
          padding: [20, 20],
          maxZoom: 14
        });
      } else if (eventsWithCoords.length === 1) {
        // Single event - center on it with appropriate zoom for 10km radius
        mapInstanceRef.current.setView(eventsWithCoords[0].coords, 13);
      }
    } else {
      // No events found - center on search location if available
      if (centerLocation) {
        mapInstanceRef.current.setView([centerLocation.lat, centerLocation.lng], 13);
      }
    }

    // Global function for popup button clicks
    (window as any).selectEvent = (eventId: number) => {
      const event = events.find(e => e.id === eventId);
      if (event && onEventSelect) {
        onEventSelect(event);
      }
    };

    return () => {
      delete (window as any).selectEvent;
    };
  }, [events, onEventSelect, centerLocation]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Event Locations</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={mapRef} 
          className="h-80 w-full"
          style={{ minHeight: '320px' }}
        />
      </CardContent>
    </Card>
  );
}