import { db } from "./db";
import { trainingPlans } from "@shared/schema";
import { eq } from "drizzle-orm";
import { addDays, format, parseISO } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  location?: string;
  category: string;
  allDay: boolean;
}

interface WorkoutEvent {
  type: string;
  distance?: string;
  pace?: string;
  duration?: string;
  notes?: string;
  intensity: 'low' | 'moderate' | 'high';
  completed?: boolean;
}

export class CalendarSyncService {
  
  /**
   * Generate iCal format string for training plan
   */
  async generateICalendar(userId: string, trainingPlanId: number): Promise<string> {
    const [plan] = await db
      .select()
      .from(trainingPlans)
      .where(eq(trainingPlans.id, trainingPlanId));

    if (!plan || plan.userId !== userId) {
      throw new Error("Training plan not found");
    }

    const events = this.extractCalendarEvents(plan);
    
    let ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//The Social Runner//Training Plan//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${plan.planName}`,
      'X-WR-CALDESC:Training plan workouts and schedule',
      'X-WR-TIMEZONE:Australia/Sydney'
    ];

    events.forEach(event => {
      ical.push(
        'BEGIN:VEVENT',
        `UID:${event.id}@thesocialrunner.com`,
        `DTSTART:${this.formatICalDate(event.start)}`,
        `DTEND:${this.formatICalDate(event.end)}`,
        `SUMMARY:${this.escapeICalText(event.title)}`,
        `DESCRIPTION:${this.escapeICalText(event.description)}`,
        `CATEGORIES:${event.category}`,
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        event.location ? `LOCATION:${this.escapeICalText(event.location)}` : '',
        `CREATED:${this.formatICalDate(new Date())}`,
        `LAST-MODIFIED:${this.formatICalDate(new Date())}`,
        'END:VEVENT'
      );
    });

    ical.push('END:VCALENDAR');
    
    return ical.filter(line => line !== '').join('\r\n');
  }

  /**
   * Generate Google Calendar URL for adding events
   */
  generateGoogleCalendarUrl(event: CalendarEvent): string {
    const baseUrl = 'https://calendar.google.com/calendar/render';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${this.formatGoogleDate(event.start)}/${this.formatGoogleDate(event.end)}`,
      details: event.description,
      location: event.location || '',
      ctz: 'Australia/Sydney'
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Generate Outlook calendar URL
   */
  generateOutlookUrl(event: CalendarEvent): string {
    const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
    const params = new URLSearchParams({
      subject: event.title,
      startdt: event.start.toISOString(),
      enddt: event.end.toISOString(),
      body: event.description,
      location: event.location || ''
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Generate calendar events from training plan
   */
  private extractCalendarEvents(plan: any): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const startDate = parseISO(plan.startDate);
    
    Object.entries(plan.weeklySchedule).forEach(([weekStr, weekData]: [string, any]) => {
      const weekNumber = parseInt(weekStr);
      const weekStartDate = addDays(startDate, (weekNumber - 1) * 7);

      // Days of the week mapping
      const dayMap = {
        monday: 0,
        tuesday: 1,
        wednesday: 2,
        thursday: 3,
        friday: 4,
        saturday: 5,
        sunday: 6
      };

      Object.entries(dayMap).forEach(([dayName, dayOffset]) => {
        const workout = weekData[dayName] as WorkoutEvent;
        if (workout) {
          const workoutDate = addDays(weekStartDate, dayOffset);
          const eventId = `${plan.id}-w${weekNumber}-${dayName}`;
          
          // Determine workout time based on intensity and type
          const startTime = this.getWorkoutStartTime(workout);
          const duration = this.getWorkoutDuration(workout);
          
          const startDateTime = new Date(workoutDate);
          startDateTime.setHours(startTime.hour, startTime.minute, 0, 0);
          
          const endDateTime = new Date(startDateTime);
          endDateTime.setMinutes(endDateTime.getMinutes() + duration);

          events.push({
            id: eventId,
            title: this.formatWorkoutTitle(workout),
            description: this.formatWorkoutDescription(workout, weekNumber),
            start: startDateTime,
            end: endDateTime,
            location: 'Running Route',
            category: 'Training',
            allDay: false
          });
        }
      });
    });

    return events;
  }

  /**
   * Get optimal workout start time based on type and intensity
   */
  private getWorkoutStartTime(workout: WorkoutEvent): { hour: number; minute: number } {
    // Morning times for different workout types
    const timeMap = {
      'easy_run': { hour: 6, minute: 30 },
      'tempo_run': { hour: 6, minute: 0 },
      'long_run': { hour: 7, minute: 0 },
      'intervals': { hour: 6, minute: 0 },
      'recovery_run': { hour: 7, minute: 0 },
      'hill_training': { hour: 6, minute: 15 },
      'fartlek': { hour: 6, minute: 30 }
    };

    return timeMap[workout.type as keyof typeof timeMap] || { hour: 6, minute: 30 };
  }

  /**
   * Estimate workout duration in minutes
   */
  private getWorkoutDuration(workout: WorkoutEvent): number {
    if (workout.duration) {
      // Extract duration from string like "45 minutes" or "1 hour 15 minutes"
      const durationStr = workout.duration.toLowerCase();
      let minutes = 0;
      
      const hourMatch = durationStr.match(/(\d+)\s*hour/);
      const minuteMatch = durationStr.match(/(\d+)\s*min/);
      
      if (hourMatch) minutes += parseInt(hourMatch[1]) * 60;
      if (minuteMatch) minutes += parseInt(minuteMatch[1]);
      
      return minutes || 45; // Default 45 minutes
    }

    // Estimate based on distance and workout type
    if (workout.distance) {
      const distanceKm = parseFloat(workout.distance.replace(/[^\d.]/g, ''));
      const paceMinutesPerKm = this.estimatePaceMinutes(workout.pace, workout.type);
      const workoutTime = distanceKm * paceMinutesPerKm;
      const warmupCooldown = workout.type === 'long_run' ? 15 : 10;
      
      return Math.round(workoutTime + warmupCooldown);
    }

    // Default durations by workout type
    const defaultDurations = {
      'easy_run': 45,
      'tempo_run': 50,
      'long_run': 90,
      'intervals': 60,
      'recovery_run': 30,
      'hill_training': 55,
      'fartlek': 50
    };

    return defaultDurations[workout.type as keyof typeof defaultDurations] || 45;
  }

  /**
   * Estimate pace in minutes per km
   */
  private estimatePaceMinutes(pace?: string, workoutType?: string): number {
    if (pace && pace.includes(':')) {
      const [minutes, seconds] = pace.split(':').map(Number);
      return minutes + (seconds / 60);
    }

    // Default paces by workout type (minutes per km)
    const defaultPaces = {
      'easy_run': 6.0,
      'tempo_run': 4.5,
      'long_run': 6.5,
      'intervals': 4.0,
      'recovery_run': 7.0,
      'hill_training': 5.5,
      'fartlek': 5.0
    };

    return defaultPaces[workoutType as keyof typeof defaultPaces] || 6.0;
  }

  /**
   * Format workout title for calendar
   */
  private formatWorkoutTitle(workout: WorkoutEvent): string {
    const typeFormatted = workout.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const distance = workout.distance ? ` - ${workout.distance}` : '';
    const intensity = workout.intensity === 'high' ? ' 🔥' : workout.intensity === 'low' ? ' 🟢' : ' 🟡';
    
    return `${typeFormatted}${distance}${intensity}`;
  }

  /**
   * Format workout description for calendar
   */
  private formatWorkoutDescription(workout: WorkoutEvent, weekNumber: number): string {
    const lines = [
      `Training Week ${weekNumber}`,
      `Workout: ${workout.type.replace(/_/g, ' ').toUpperCase()}`,
      workout.distance ? `Distance: ${workout.distance}` : '',
      workout.pace ? `Target Pace: ${workout.pace}` : '',
      workout.duration ? `Duration: ${workout.duration}` : '',
      `Intensity: ${workout.intensity}`,
      '',
      workout.notes || 'Focus on form and consistent effort.',
      '',
      'Generated by The Social Runner training plan system.'
    ];

    return lines.filter(line => line !== '').join('\n');
  }

  /**
   * Format date for iCal format
   */
  private formatICalDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  /**
   * Format date for Google Calendar
   */
  private formatGoogleDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  /**
   * Escape text for iCal format
   */
  private escapeICalText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
  }

  /**
   * Generate calendar sync summary
   */
  async getCalendarSyncSummary(userId: string, trainingPlanId: number) {
    const [plan] = await db
      .select()
      .from(trainingPlans)
      .where(eq(trainingPlans.id, trainingPlanId));

    if (!plan || plan.userId !== userId) {
      throw new Error("Training plan not found");
    }

    const events = this.extractCalendarEvents(plan);
    const totalWorkouts = events.length;
    const weeklyWorkouts = Math.round(totalWorkouts / plan.duration);
    
    return {
      planName: plan.planName,
      totalWorkouts,
      weeklyWorkouts,
      duration: plan.duration,
      startDate: plan.startDate,
      endDate: plan.endDate,
      eventCount: events.length,
      syncOptions: {
        ical: true,
        google: true,
        outlook: true,
        apple: true,
        android: true
      }
    };
  }
}

export const calendarSyncService = new CalendarSyncService();