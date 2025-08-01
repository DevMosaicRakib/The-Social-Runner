import https from 'https';
import { storage } from '../server/storage';

// CSV parsing function
function parseCSV(csvText: string) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  const events = [];

  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
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
      const event: any = {};
      for (let k = 0; k < headers.length; k++) {
        event[headers[k]] = values[k];
      }
      events.push(event);
    }
  }
  
  return events;
}

// Extract coordinates from POINT geometry string
function extractCoordinates(geometryString: string) {
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
function convertParkrunToEvent(parkrun: any) {
  const coords = extractCoordinates(parkrun.geometry);
  
  if (!coords) {
    console.log(`Skipping ${parkrun.EventLongName} - invalid coordinates`);
    return null;
  }

  return {
    title: parkrun.EventLongName,
    description: `Join us for the ${parkrun.EventLongName} parkrun - a free, weekly, community event where people of all fitness levels can walk, jog, run, or volunteer. Parkruns happen every Saturday at 8:00 AM and are always 5 kilometers long.`,
    date: getNextSaturday(),
    time: '08:00',
    location: parkrun.EventLocation,
    lat: coords.lat.toString(),
    lng: coords.lng.toString(),
    distance: '5K',
    maxParticipants: 500,
    status: 'open',
    isRecurring: true,
    recurringType: 'weekly' as const,
    recurringEndDate: getDateInMonths(12),
    recurringDaysOfWeek: [6] // Saturday
  };
}

// Helper function to get next Saturday
function getNextSaturday(): string {
  const today = new Date();
  const daysUntilSaturday = (6 - today.getDay()) % 7;
  const nextSaturday = new Date(today);
  nextSaturday.setDate(today.getDate() + (daysUntilSaturday || 7));
  return nextSaturday.toISOString().split('T')[0];
}

// Helper function to get date N months from now
function getDateInMonths(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
}

// Main import function
export async function importParkrunEvents() {
  try {
    console.log('Fetching Australian parkrun data...');
    
    // Fetch the CSV data
    const csvUrl = 'https://raw.githubusercontent.com/ZtheTrain/Australias-parkrun-capital/main/au-parkruns.csv';
    
    const csvData = await new Promise<string>((resolve, reject) => {
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
    let insertedCount = 0;
    let skippedCount = 0;

    for (const event of events) {
      try {
        await storage.createSystemEvent(event);
        insertedCount++;
        console.log(`✓ Added: ${event.title} in ${event.location}`);
      } catch (error: any) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          skippedCount++;
          console.log(`- Skipped: ${event.title} (already exists)`);
        } else {
          console.error(`✗ Error adding ${event.title}:`, error.message);
          skippedCount++;
        }
      }
    }
    
    console.log(`\n--- Australian Parkrun Import Complete ---`);
    console.log(`Events added: ${insertedCount}`);
    console.log(`Events skipped: ${skippedCount}`);
    console.log(`Total processed: ${events.length}`);

    return {
      added: insertedCount,
      skipped: skippedCount,
      total: events.length
    };

  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importParkrunEvents()
    .then((result) => {
      console.log('Import completed successfully!', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Import failed:', error);
      process.exit(1);
    });
}