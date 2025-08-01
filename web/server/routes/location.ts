import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";

export function registerLocationRoutes(app: Express) {
  // Simple location-based events search
  app.get('/api/events/search/location', isAuthenticated, async (req: any, res) => {
    try {
      const { lat, lng, radius = 10, hours = 48 } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ 
          message: "Latitude and longitude are required" 
        });
      }

      const userId = req.user.claims.sub;
      
      // Get all events first
      const allEvents = await storage.getAllEvents(userId);
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const radiusKm = parseInt(radius);
      const hoursAhead = parseInt(hours);
      
      // Filter by time window
      const now = new Date();
      const endTime = new Date(now.getTime() + (hoursAhead * 60 * 60 * 1000));
      
      const recentEvents = allEvents.filter(event => {
        const eventDate = new Date(`${event.date}T${event.time}`);
        return eventDate >= now && eventDate <= endTime;
      });
      
      // Calculate distances and filter by radius
      const nearbyEvents = recentEvents
        .map(event => {
          const eventLat = parseFloat(event.lat);
          const eventLng = parseFloat(event.lng);
          
          if (isNaN(eventLat) || isNaN(eventLng)) {
            return null;
          }
          
          const distance = calculateDistance(userLat, userLng, eventLat, eventLng);
          
          return {
            ...event,
            distance,
            latitude: eventLat,
            longitude: eventLng
          };
        })
        .filter(event => event !== null && event.distance <= radiusKm)
        .sort((a, b) => a!.distance - b!.distance)
        .slice(0, 20);
      
      res.json(nearbyEvents);
    } catch (error) {
      console.error("Error fetching events by location:", error);
      res.status(500).json({ message: "Failed to fetch events by location" });
    }
  });
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}