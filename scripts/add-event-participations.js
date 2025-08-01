#!/usr/bin/env node

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure Neon for Node.js environment
neonConfig.webSocketConstructor = ws;

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Sample Sydney suburbs with coordinates for matching users
const sydneySuburbs = [
  { name: "Bondi", lat: -33.8908, lng: 151.2743 },
  { name: "Manly", lat: -33.7969, lng: 151.2840 },
  { name: "Surry Hills", lat: -33.8886, lng: 151.2094 },
  { name: "Paddington", lat: -33.8848, lng: 151.2299 },
  { name: "Newtown", lat: -33.8959, lng: 151.1794 },
  { name: "Glebe", lat: -33.8777, lng: 151.1832 },
  { name: "Balmain", lat: -33.8622, lng: 151.1799 },
  { name: "Leichhardt", lat: -33.8839, lng: 151.1544 },
  { name: "Rozelle", lat: -33.8618, lng: 151.1715 },
  { name: "Coogee", lat: -33.9249, lng: 151.2578 },
  { name: "Randwick", lat: -33.9139, lng: 151.2417 },
  { name: "Woollahra", lat: -33.8847, lng: 151.2378 },
  { name: "Double Bay", lat: -33.8777, lng: 151.2408 },
  { name: "Rose Bay", lat: -33.8693, lng: 151.2710 },
  { name: "Vaucluse", lat: -33.8593, lng: 151.2777 },
  { name: "Mosman", lat: -33.8283, lng: 151.2438 },
  { name: "Neutral Bay", lat: -33.8339, lng: 151.2196 },
  { name: "North Sydney", lat: -33.8403, lng: 151.2065 },
  { name: "McMahons Point", lat: -33.8463, lng: 151.2002 },
  { name: "Kirribilli", lat: -33.8468, lng: 151.2170 },
  { name: "St Peters", lat: -33.9118, lng: 151.1752 },
  { name: "Marrickville", lat: -33.9114, lng: 151.1550 },
  { name: "Dulwich Hill", lat: -33.9019, lng: 151.1387 },
  { name: "Stanmore", lat: -33.8975, lng: 151.1630 },
  { name: "Petersham", lat: -33.8950, lng: 151.1520 }
];

// Sample Melbourne suburbs with coordinates
const melbourneSuburbs = [
  { name: "Fitzroy", lat: -37.7982, lng: 144.9784 },
  { name: "Collingwood", lat: -37.8049, lng: 144.9894 },
  { name: "Richmond", lat: -37.8197, lng: 144.9988 },
  { name: "South Yarra", lat: -37.8397, lng: 144.9917 },
  { name: "Toorak", lat: -37.8433, lng: 145.0083 },
  { name: "Prahran", lat: -37.8519, lng: 144.9950 },
  { name: "St Kilda", lat: -37.8677, lng: 144.9797 },
  { name: "Elwood", lat: -37.8794, lng: 144.9897 },
  { name: "Brighton", lat: -37.9062, lng: 144.9990 },
  { name: "Caulfield", lat: -37.8773, lng: 145.0254 },
  { name: "Carnegie", lat: -37.8881, lng: 145.0581 },
  { name: "Malvern", lat: -37.8574, lng: 145.0284 },
  { name: "Armadale", lat: -37.8556, lng: 145.0133 },
  { name: "Windsor", lat: -37.8580, lng: 144.9894 },
  { name: "Carlton", lat: -37.7987, lng: 144.9631 },
  { name: "Brunswick", lat: -37.7694, lng: 144.9581 },
  { name: "Footscray", lat: -37.7994, lng: 144.9008 },
  { name: "Williamstown", lat: -37.8650, lng: 144.8997 },
  { name: "Port Melbourne", lat: -37.8404, lng: 144.9397 },
  { name: "South Melbourne", lat: -37.8316, lng: 144.9581 },
  { name: "Albert Park", lat: -37.8441, lng: 144.9631 },
  { name: "Middle Park", lat: -37.8497, lng: 144.9597 },
  { name: "Hawthorn", lat: -37.8186, lng: 145.0289 },
  { name: "Kew", lat: -37.8067, lng: 145.0353 },
  { name: "Camberwell", lat: -37.8236, lng: 145.0581 }
];

async function addEventParticipations() {
  const client = await pool.connect();
  
  try {
    // Get sample users (created by our script)
    const usersResult = await client.query(`
      SELECT id, first_name, last_name, location 
      FROM users 
      WHERE auth_provider = 'email' AND id LIKE 'sample_user_%'
    `);
    
    const users = usersResult.rows;
    console.log(`Found ${users.length} sample users`);
    
    if (users.length === 0) {
      console.log('No sample users found. Please run create-sample-users.js first.');
      return;
    }
    
    // Get existing parkrun events
    const eventsResult = await client.query(`
      SELECT id, title, location, lat, lng 
      FROM events 
      WHERE created_by = 'system' AND title ILIKE '%parkrun%' 
      ORDER BY location
    `);
    
    const parkrunEvents = eventsResult.rows;
    console.log(`Found ${parkrunEvents.length} parkrun events`);
    
    if (parkrunEvents.length === 0) {
      console.log('No parkrun events found. Please import parkrun events first.');
      return;
    }
    
    console.log('Adding event participations...');
    let participantCount = 0;
    
    for (const user of users) {
      // Extract user location coordinates (approximate)
      const userLocation = user.location.split(',')[0];
      const isUserInSydney = user.location.includes('NSW');
      const userSuburbs = isUserInSydney ? sydneySuburbs : melbourneSuburbs;
      const userSuburb = userSuburbs.find(s => s.name === userLocation);
      
      if (!userSuburb) {
        console.log(`No suburb coordinates found for ${userLocation}, using random events`);
      }
      
      // Find nearby parkrun events (within reasonable distance)
      let nearbyEvents = [];
      
      if (userSuburb) {
        nearbyEvents = parkrunEvents.filter(event => {
          const eventLat = parseFloat(event.lat);
          const eventLng = parseFloat(event.lng);
          
          if (isNaN(eventLat) || isNaN(eventLng)) return false;
          
          // Calculate rough distance (simplified)
          const latDiff = Math.abs(eventLat - userSuburb.lat);
          const lngDiff = Math.abs(eventLng - userSuburb.lng);
          const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
          
          // Include events within approximately 100km (rough calculation)
          return distance < 1.0;
        });
      }
      
      // If no nearby events, select some random ones
      const eventsToJoin = nearbyEvents.length > 0 
        ? nearbyEvents.slice(0, Math.floor(Math.random() * 3) + 1)
        : parkrunEvents.slice(0, Math.floor(Math.random() * 2) + 1);
      
      console.log(`${user.first_name} ${user.last_name} (${userLocation}) joining ${eventsToJoin.length} events`);
      
      // Add user to selected events
      for (const event of eventsToJoin) {
        const attendanceStatus = getRandomElement(['attending', 'maybe', 'interested']);
        
        try {
          // Check if participation already exists
          const existingResult = await client.query(`
            SELECT id FROM event_participants WHERE user_id = $1 AND event_id = $2
          `, [user.id, event.id]);
          
          if (existingResult.rows.length === 0) {
            await client.query(`
              INSERT INTO event_participants (user_id, event_id, attendance_status, joined_at)
              VALUES ($1, $2, $3, NOW())
            `, [user.id, event.id, attendanceStatus]);
            
            participantCount++;
          }
        } catch (error) {
          console.error(`Error adding participant for ${user.first_name}:`, error.message);
        }
      }
      
      // Update user's events_joined count
      try {
        await client.query(`
          UPDATE users SET events_joined = $1 WHERE id = $2
        `, [eventsToJoin.length, user.id]);
      } catch (error) {
        console.error(`Error updating events_joined for ${user.first_name}:`, error.message);
      }
    }
    
    console.log(`Added ${participantCount} event participations`);
    console.log('Event participation assignment completed successfully!');
    
  } catch (error) {
    console.error('Error adding event participations:', error);
  } finally {
    client.release();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  addEventParticipations()
    .then(() => {
      console.log('Event participation assignment completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Event participation assignment failed:', error);
      process.exit(1);
    });
}