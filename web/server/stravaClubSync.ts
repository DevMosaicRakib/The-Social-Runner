import { nanoid } from "nanoid";
import { db } from "./db";
import { stravaClubSync, stravaEventImport, events, type InsertStravaClubSync } from "@shared/schema";
import { eq, and, gte } from "drizzle-orm";

interface StravaClubEvent {
  id: string;
  name: string;
  description?: string;
  local_date_time: string; // ISO string
  timezone: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latlng?: [number, number];
  activity_type: string;
  distance?: number; // in meters
  club: {
    id: string;
    name: string;
  };
}

interface StravaClubEventsResponse {
  data: StravaClubEvent[];
}

export class StravaClubSyncService {
  private async makeStravaRequest(endpoint: string, accessToken: string): Promise<any> {
    const response = await fetch(`https://www.strava.com/api/v3${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Strava API error (${response.status}): ${error}`);
    }

    return response.json();
  }

  async addClubSync(clubId: string, clubName: string, syncIntervalHours: number = 24): Promise<string> {
    const syncId = nanoid();
    
    await db.insert(stravaClubSync).values({
      id: syncId,
      clubId,
      clubName,
      syncIntervalHours,
      isActive: true,
    });

    return syncId;
  }

  async getActiveClubSyncs() {
    return await db
      .select()
      .from(stravaClubSync)
      .where(eq(stravaClubSync.isActive, true));
  }

  async syncClubEvents(clubSyncId: string, accessToken: string): Promise<{ imported: number; updated: number; skipped: number; errors: string[] }> {
    const clubSync = await db
      .select()
      .from(stravaClubSync)
      .where(eq(stravaClubSync.id, clubSyncId))
      .limit(1);

    if (!clubSync[0]) {
      throw new Error(`Club sync not found: ${clubSyncId}`);
    }

    const { clubId, clubName } = clubSync[0];
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    try {
      // Fetch club events from Strava API
      const eventsResponse: StravaClubEventsResponse = await this.makeStravaRequest(
        `/clubs/${clubId}/group_events`,
        accessToken
      );

      for (const stravaEvent of eventsResponse.data) {
        try {
          // Check if event already imported by Strava ID
          const existingImport = await db
            .select()
            .from(stravaEventImport)
            .where(eq(stravaEventImport.stravaEventId, stravaEvent.id))
            .limit(1);

          const eventDate = new Date(stravaEvent.local_date_time);
          const formattedDate = eventDate.toISOString().split('T')[0];
          const formattedTime = eventDate.toTimeString().substring(0, 5);
          const eventLocation = this.formatEventLocation(stravaEvent);

          // Check for duplicate events by title, date, time, and location
          // to prevent creating duplicates from different sources
          const duplicateEvent = await db
            .select()
            .from(events)
            .where(and(
              eq(events.title, stravaEvent.name),
              eq(events.date, formattedDate),
              eq(events.time, formattedTime),
              eq(events.location, eventLocation)
            ))
            .limit(1);

          const eventData = {
            title: stravaEvent.name,
            description: stravaEvent.description || `${clubName} club event`,
            date: formattedDate,
            time: formattedTime,
            location: eventLocation,
            lat: stravaEvent.latlng?.[0]?.toString() || "0",
            lng: stravaEvent.latlng?.[1]?.toString() || "0",
            distance: this.formatDistance(stravaEvent.distance),
            maxParticipants: 50, // Default for club events
            createdBy: "strava-sync",
            status: "open" as const,
            isClubEvent: true,
          };

          // Skip if duplicate event exists (not imported from Strava but same details)
          if (duplicateEvent[0] && !existingImport[0]) {
            // Skipping duplicate event to prevent duplicates
            skipped++;
            continue;
          }

          if (existingImport[0]) {
            // Update existing event
            const existingEvent = await db
              .select()
              .from(events)
              .where(eq(events.id, existingImport[0].eventId!))
              .limit(1);

            if (existingEvent[0]) {
              await db
                .update(events)
                .set({
                  ...eventData,
                  updatedAt: new Date(),
                })
                .where(eq(events.id, existingImport[0].eventId!));

              // Update import record
              await db
                .update(stravaEventImport)
                .set({ lastUpdatedAt: new Date() })
                .where(eq(stravaEventImport.id, existingImport[0].id));

              updated++;
            }
          } else {
            // Create new event
            const [newEvent] = await db
              .insert(events)
              .values([eventData])
              .returning();

            // Create import record
            await db.insert(stravaEventImport).values({
              id: nanoid(),
              stravaEventId: stravaEvent.id,
              clubSyncId,
              eventId: newEvent.id,
            });

            imported++;
          }
        } catch (eventError) {
          console.error(`Error processing event ${stravaEvent.id}:`, eventError);
          errors.push(`Event ${stravaEvent.name}: ${String(eventError)}`);
        }
      }

      // Update last sync time
      await db
        .update(stravaClubSync)
        .set({ lastSyncAt: new Date() })
        .where(eq(stravaClubSync.id, clubSyncId));

    } catch (apiError) {
      console.error(`Strava API error for club ${clubId}:`, apiError);
      errors.push(`API Error: ${apiError}`);
    }

    return { imported, updated, skipped, errors };
  }

  async syncAllActiveClubs(accessToken: string): Promise<{ results: any[]; totalImported: number; totalUpdated: number; totalSkipped: number }> {
    const activeClubs = await this.getActiveClubSyncs();
    const results = [];
    let totalImported = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;

    for (const club of activeClubs) {
      try {
        const result = await this.syncClubEvents(club.id, accessToken);
        results.push({
          clubId: club.clubId,
          clubName: club.clubName,
          ...result,
        });
        totalImported += result.imported;
        totalUpdated += result.updated;
        totalSkipped += result.skipped;
      } catch (error: any) {
        results.push({
          clubId: club.clubId,
          clubName: club.clubName,
          error: error?.message || String(error),
        });
      }
    }

    return { results, totalImported, totalUpdated, totalSkipped };
  }

  async removeClubSync(clubSyncId: string): Promise<boolean> {
    const result = await db
      .update(stravaClubSync)
      .set({ isActive: false })
      .where(eq(stravaClubSync.id, clubSyncId));

    return (result.rowCount ?? 0) > 0;
  }

  private formatEventLocation(event: StravaClubEvent): string {
    const parts = [event.address, event.city, event.state, event.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Location TBD';
  }

  private formatDistance(distanceMeters?: number): string {
    if (!distanceMeters) return 'Various distances';
    
    const km = distanceMeters / 1000;
    if (km >= 42) return 'Marathon';
    if (km >= 21) return 'Half Marathon';
    if (km >= 10) return '10K';
    if (km >= 5) return '5K';
    return `${km.toFixed(1)}K`;
  }

  async getClubSyncStatus(clubSyncId: string) {
    const clubSync = await db
      .select()
      .from(stravaClubSync)
      .where(eq(stravaClubSync.id, clubSyncId))
      .limit(1);

    if (!clubSync[0]) {
      return null;
    }

    const importCount = await db
      .select({ count: stravaEventImport.id })
      .from(stravaEventImport)
      .where(eq(stravaEventImport.clubSyncId, clubSyncId));

    return {
      ...clubSync[0],
      totalImports: importCount.length,
    };
  }
}

export const stravaClubSyncService = new StravaClubSyncService();