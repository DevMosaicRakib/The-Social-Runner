#!/usr/bin/env node

import { Pool, neonConfig } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import ws from 'ws';

// Configure Neon for Node.js environment
neonConfig.webSocketConstructor = ws;

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Sample Sydney suburbs with coordinates
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

// Sample first names
const firstNames = [
  'James', 'Sarah', 'Michael', 'Emma', 'David', 'Jessica', 'Daniel', 'Ashley', 'Matthew', 'Emily',
  'Christopher', 'Samantha', 'Andrew', 'Amanda', 'Joshua', 'Stephanie', 'Ryan', 'Nicole', 'Nicholas', 'Elizabeth',
  'Jacob', 'Helen', 'Anthony', 'Rebecca', 'William', 'Rachel', 'Jonathan', 'Laura', 'Tyler', 'Catherine',
  'Noah', 'Sophie', 'Ethan', 'Grace', 'Nathan', 'Hannah', 'Samuel', 'Olivia', 'Christian', 'Megan',
  'Alexander', 'Lisa', 'Benjamin', 'Jennifer', 'Jack', 'Michelle', 'Luke', 'Amy', 'Henry', 'Claire'
];

// Sample last names
const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

// Sample running preferences
const preferredDistances = ['5k', '10k', '15k', 'half_marathon', 'marathon', 'fun_run'];
const preferredPaces = ['easy', 'moderate', 'fast'];
const experienceLevels = ['beginner', 'intermediate', 'advanced'];
const runningGoals = ['fitness', 'weight_loss', 'endurance', 'social', 'competition'];
const availabilityDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const preferredTimes = ['early_morning', 'morning', 'afternoon', 'evening'];
const sexOptions = ['male', 'female', 'non-binary'];

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, min = 1, max = 3) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generatePersonalBests(experienceLevel) {
  const baseRecords = {
    beginner: { '5k': 28, '10k': 58, 'half_marathon': 135, 'marathon': 280 },
    intermediate: { '5k': 24, '10k': 50, 'half_marathon': 115, 'marathon': 240 },
    advanced: { '5k': 20, '10k': 42, 'half_marathon': 95, 'marathon': 200 }
  };
  
  const base = baseRecords[experienceLevel];
  const records = {};
  
  for (const [distance, baseTime] of Object.entries(base)) {
    const variation = Math.floor(Math.random() * 20) - 10; // ±10 minutes variation
    const totalMinutes = baseTime + variation;
    const minutes = Math.floor(totalMinutes);
    const seconds = Math.floor((totalMinutes - minutes) * 60);
    records[distance] = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return records;
}

function generateAveragePace(experienceLevel) {
  const basePaces = {
    beginner: 6.5,
    intermediate: 5.5,
    advanced: 4.5
  };
  
  const basePace = basePaces[experienceLevel];
  const variation = (Math.random() - 0.5) * 1.0; // ±30 seconds variation
  const paceMinutes = Math.floor(basePace + variation);
  const paceSeconds = Math.floor(((basePace + variation) - paceMinutes) * 60);
  
  return `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`;
}

async function generateUsers() {
  const users = [];
  const client = await pool.connect();
  
  try {
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
    
    // Create 50 users (25 Sydney, 25 Melbourne)
    for (let i = 0; i < 50; i++) {
      const isSydney = i < 25;
      const suburbs = isSydney ? sydneySuburbs : melbourneSuburbs;
      const suburb = getRandomElement(suburbs);
      
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`;
      const id = `sample_user_${i + 1}_${Date.now()}`;
      
      // Generate user data
      const experienceLevel = getRandomElement(experienceLevels);
      const personalBests = generatePersonalBests(experienceLevel);
      const averagePace = generateAveragePace(experienceLevel);
      
      // Generate date of birth (25-45 years old)
      const birthYear = new Date().getFullYear() - (25 + Math.floor(Math.random() * 20));
      const birthDate = new Date(birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      
      const userData = {
        id,
        email,
        passwordHash: await bcrypt.hash('password123', 10), // Default password
        emailVerified: true,
        firstName,
        lastName,
        location: `${suburb.name}, ${isSydney ? 'NSW' : 'VIC'}`,
        dateOfBirth: birthDate.toISOString().split('T')[0],
        sex: getRandomElement(sexOptions),
        bio: `Passionate runner from ${suburb.name}. Love connecting with the local running community!`,
        preferredDistances: getRandomElements(preferredDistances, 2, 4),
        preferredPace: getRandomElement(preferredPaces),
        experienceLevel,
        runningGoals: getRandomElements(runningGoals, 2, 3),
        availabilityDays: getRandomElements(availabilityDays, 3, 5),
        preferredTime: getRandomElement(preferredTimes),
        totalRuns: Math.floor(Math.random() * 100) + 10,
        averagePace,
        personalBests,
        authProvider: 'email',
        eventsJoined: 0,
        totalDistance: Math.floor(Math.random() * 500000) + 50000, // 50-550km
        buddies: Math.floor(Math.random() * 20)
      };
      
      users.push(userData);
    }
    
    // Insert users into database
    console.log('Inserting users...');
    let insertedUsers = 0;
    
    for (const user of users) {
      try {
        await client.query(`
          INSERT INTO users (
            id, email, password_hash, email_verified, first_name, last_name,
            location, date_of_birth, sex, bio, preferred_distances, preferred_pace,
            experience_level, running_goals, availability_days, preferred_time,
            total_runs, average_pace, personal_bests, auth_provider, events_joined,
            total_distance, buddies, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22, $23, NOW(), NOW()
          )
        `, [
          user.id, user.email, user.passwordHash, user.emailVerified,
          user.firstName, user.lastName, user.location, user.dateOfBirth,
          user.sex, user.bio, user.preferredDistances, user.preferredPace,
          user.experienceLevel, user.runningGoals, user.availabilityDays,
          user.preferredTime, user.totalRuns, user.averagePace,
          JSON.stringify(user.personalBests), user.authProvider,
          user.eventsJoined, user.totalDistance, user.buddies
        ]);
        insertedUsers++;
      } catch (error) {
        console.error(`Error inserting user ${user.email}:`, error.message);
      }
    }
    
    console.log(`Inserted ${insertedUsers} users`);
    
    // Now assign users to nearby parkrun events
    console.log('Assigning users to parkrun events...');
    let participantCount = 0;
    
    for (const user of users) {
      // Extract user location coordinates (approximate)
      const userLocation = user.location.split(',')[0];
      const isUserInSydney = user.location.includes('NSW');
      const userSuburbs = isUserInSydney ? sydneySuburbs : melbourneSuburbs;
      const userSuburb = userSuburbs.find(s => s.name === userLocation);
      
      if (!userSuburb) continue;
      
      // Find nearby parkrun events (within reasonable distance)
      const nearbyEvents = parkrunEvents.filter(event => {
        const eventLat = parseFloat(event.lat);
        const eventLng = parseFloat(event.lng);
        
        if (isNaN(eventLat) || isNaN(eventLng)) return false;
        
        // Calculate rough distance (simplified)
        const latDiff = Math.abs(eventLat - userSuburb.lat);
        const lngDiff = Math.abs(eventLng - userSuburb.lng);
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
        
        // Include events within approximately 50km (rough calculation)
        return distance < 0.5;
      });
      
      // If no nearby events, select some random ones
      const eventsToJoin = nearbyEvents.length > 0 
        ? nearbyEvents.slice(0, Math.floor(Math.random() * 3) + 1)
        : parkrunEvents.slice(0, Math.floor(Math.random() * 2) + 1);
      
      // Add user to selected events
      for (const event of eventsToJoin) {
        const attendanceStatus = getRandomElement(['attending', 'maybe']);
        
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
          console.error(`Error adding participant:`, error.message);
        }
      }
      
      // Update user's events_joined count
      await client.query(`
        UPDATE users SET events_joined = $1 WHERE id = $2
      `, [eventsToJoin.length, user.id]);
    }
    
    console.log(`Added ${participantCount} event participations`);
    console.log('Sample users creation completed successfully!');
    
  } catch (error) {
    console.error('Error generating users:', error);
  } finally {
    client.release();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  generateUsers()
    .then(() => {
      console.log('User generation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('User generation failed:', error);
      process.exit(1);
    });
}