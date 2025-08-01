const fs = require('fs');
const https = require('https');
const { Pool } = require('@neondatabase/serverless');

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// CSV parsing function
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  const events = [];

  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim()); // Add last value
    
    if (values.length >= headers.length) {
      const event = {};
      for (let k = 0; k < headers.length; k++) {
        event[headers[k]] = values[k];
      }
      events.push(event);
    }
  }
  
  return events;
}

// Extract coordinates from POINT geometry string
function extractCoordinates(geometryString) {
  const match = geometryString.match(/POINT \(([0-9.-]+) ([0-9.-]+)\)/);
  if (match) {
    return {
      lng: parseFloat(match[1]),
      lat: parseFloat(match[2])
    };
  }
  return null;
}

// Convert parkrun data to our event format
function convertParkrunToEvent(parkrun) {
  const coords = extractCoordinates(parkrun.geometry);
  
  if (!coords) {
    console.log(`Skipping ${parkrun.EventLongName} - invalid coordinates`);
    return null;
  }

  return {
    title: parkrun.EventLongName,
    description: `Join us for the ${parkrun.EventLongName} parkrun - a free, weekly, community event. All fitness levels welcome!`,
    date: getNextSaturday(), // Parkruns are typically on Saturday mornings
    time: '08:00',
    location: parkrun.EventLocation,
    lat: coords.lat.toString(),
    lng: coords.lng.toString(),
    distance: '5K', // Parkruns are always 5K
    max_participants: 500, // Large capacity for community events
    created_by: 'system', // System-created events
    status: 'open',
    is_recurring: true,
    recurring_type: 'weekly',
    recurring_end_date: getDateInMonths(12), // Recurring for 1 year
    recurring_days_of_week: [6] // Saturday (0=Sunday, 6=Saturday)
  };
}

// Helper function to get next Saturday
function getNextSaturday() {
  const today = new Date();
  const daysUntilSaturday = (6 - today.getDay()) % 7;
  const nextSaturday = new Date(today);
  nextSaturday.setDate(today.getDate() + (daysUntilSaturday || 7));
  return nextSaturday.toISOString().split('T')[0];
}

// Helper function to get date N months from now
function getDateInMonths(months) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
}

// Main import function
async function importParkrunEvents() {
  try {
    console.log('Fetching parkrun data...');
    
    // Fetch the CSV data
    const csvUrl = 'https://raw.githubusercontent.com/ZtheTrain/Australias-parkrun-capital/main/au-parkruns.csv';
    
    const csvData = await new Promise((resolve, reject) => {
      https.get(csvUrl, (response) => {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          resolve(data);
        });
        response.on('error', (error) => {
          reject(error);
        });
      });
    });

    console.log('Parsing CSV data...');
    const parkruns = parseCSV(csvData);
    console.log(`Found ${parkruns.length} parkrun events`);

    // Convert to our event format
    const events = parkruns
      .map(convertParkrunToEvent)
      .filter(event => event !== null);

    console.log(`Converting ${events.length} valid events...`);

    // Insert events into database
    const client = await pool.connect();
    let insertedCount = 0;
    let skippedCount = 0;

    for (const event of events) {
      try {
        const insertQuery = `
          INSERT INTO events (
            title, description, date, time, location, lat, lng, 
            distance, max_participants, created_by, status,
            is_recurring, recurring_type, recurring_end_date, recurring_days_of_week
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (title, date, location) DO NOTHING
          RETURNING id
        `;
        
        const result = await client.query(insertQuery, [
          event.title,
          event.description,
          event.date,
          event.time,
          event.location,
          event.lat,
          event.lng,
          event.distance,
          event.max_participants,
          event.created_by,
          event.status,
          event.is_recurring,
          event.recurring_type,
          event.recurring_end_date,
          JSON.stringify(event.recurring_days_of_week)
        ]);

        if (result.rows.length > 0) {
          insertedCount++;
          console.log(`✓ Added: ${event.title}`);
        } else {
          skippedCount++;
          console.log(`- Skipped: ${event.title} (already exists)`);
        }
      } catch (error) {
        console.error(`✗ Error adding ${event.title}:`, error.message);
        skippedCount++;
      }
    }

    await client.release();
    
    console.log(`\n--- Import Complete ---`);
    console.log(`Events added: ${insertedCount}`);
    console.log(`Events skipped: ${skippedCount}`);
    console.log(`Total processed: ${events.length}`);

  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  importParkrunEvents().then(() => {
    console.log('Import completed successfully!');
    process.exit(0);
  }).catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });
}

module.exports = { importParkrunEvents };