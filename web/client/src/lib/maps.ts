// Utility functions for map-related operations

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

// Simulate geocoding (in real app, would use Google Places API)
export async function geocodeAddress(address: string): Promise<Location | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock geocoding results for common locations
  const mockResults: Record<string, Location> = {
    "Central Park": { lat: 40.7829, lng: -73.9654, address: "Central Park, New York, NY" },
    "Brooklyn Bridge": { lat: 40.7061, lng: -73.9969, address: "Brooklyn Bridge, New York, NY" },
    "Hudson River": { lat: 40.7589, lng: -73.9851, address: "Hudson River Greenway, Manhattan, NY" },
  };

  const key = Object.keys(mockResults).find(k => 
    address.toLowerCase().includes(k.toLowerCase())
  );

  if (key) {
    return mockResults[key];
  }

  // Default to NYC area for any other address
  return {
    lat: 40.7580 + (Math.random() - 0.5) * 0.1,
    lng: -73.9855 + (Math.random() - 0.5) * 0.1,
    address: address
  };
}

// Simulate reverse geocoding
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock reverse geocoding
  return `Location near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

// Calculate distance between two points (simplified)
export function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
