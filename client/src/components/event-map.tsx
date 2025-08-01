import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";
import type { EventWithParticipants } from "@shared/schema";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface EventMapProps {
  events: EventWithParticipants[];
  interactive?: boolean;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  className?: string;
}

export default function EventMap({ events, interactive = false, onLocationSelect, className }: EventMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Default to Sydney, Australia
  const defaultCenter: [number, number] = [-33.8688, 151.2093];

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Fix Leaflet default icon issue
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    // Initialize map with custom controls (matching homepage style)
    const map = L.map(mapRef.current, {
      zoomControl: false, // We'll add a custom zoom control
      attributionControl: true
    }).setView(defaultCenter, 12);

    // Add custom zoom control positioned in top-right
    L.control.zoom({
      position: 'topright'
    }).addTo(map);
    
    // Add modern Carto tiles with clean, contemporary styling (matching homepage)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add click handler for interactive maps
    if (interactive && onLocationSelect) {
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setSelectedLocation({ lat, lng });
        setIsGeocoding(true);

        // Remove existing marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        // Create custom orange marker to match homepage style
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background: #F97316;
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

        // Add new marker with custom styling
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        markerRef.current = marker;

        // Simple reverse geocoding using coordinates
        try {
          const address = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          setIsGeocoding(false);
          onLocationSelect({ lat, lng, address });
        } catch (error) {
          setIsGeocoding(false);
          onLocationSelect({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
        }
      });
    }

    // Add event markers for display maps
    if (!interactive && events.length > 0) {
      events.forEach((event) => {
        if (event.lat && event.lng) {
          const lat = parseFloat(event.lat);
          const lng = parseFloat(event.lng);
          
          // Create custom orange marker for consistency
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background: #F97316;
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

          L.marker([lat, lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`<strong>${event.title}</strong><br/>${event.location}`);
        }
      });

      // Fit map to show all events
      if (events.length > 0) {
        const validEvents = events.filter(e => e.lat && e.lng);
        if (validEvents.length > 0) {
          const bounds = L.latLngBounds(
            validEvents.map(e => [parseFloat(e.lat), parseFloat(e.lng)])
          );
          map.fitBounds(bounds, { padding: [20, 20] });
        }
      }
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [events, interactive, onLocationSelect]);

  const handleMapClick = useCallback(() => {
    // This is now handled by Leaflet's click event
  }, []);

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
        <div className="relative">
          <div 
            ref={mapRef}
            className="h-full w-full rounded-lg border"
            style={{ minHeight: '300px' }}
          />
          
          {/* Loading indicator */}
          {isGeocoding && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-3 py-2 rounded shadow-lg flex items-center space-x-2 z-[1000]">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Getting location...</span>
            </div>
          )}
          
          {/* Instructions overlay */}
          {!selectedLocation && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-3 py-2 rounded shadow-lg text-sm text-slate-600 z-[1000]">
              Click on the map to select start location
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
          ref={mapRef}
          className="h-80 w-full"
        />
      </CardContent>
    </Card>
  );
}
