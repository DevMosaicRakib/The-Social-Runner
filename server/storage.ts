import {
  users,
  events,
  eventParticipants,
  eventReactions,
  eventComments,
  newsArticles,
  userGoals,
  trainingPlans,
  runclubs,
  runclubMembers,
  type User,
  type UpsertUser,
  type Event,
  type InsertEvent,
  type EventParticipant,
  type InsertEventParticipant,
  type EventWithParticipants,
  type EventReaction,
  type InsertEventReaction,
  type EventComment,
  type InsertEventComment,
  type EventCommentWithUser,
  type Notification,
  type UserNotificationSettings,
  type NewsArticle,
  type InsertNewsArticle,
  type UserGoal,
  type InsertGoal,
  type UpdateGoal,
  type Runclub,
  type InsertRunclub,
  type RunclubMember,
  type InsertRunclubMember,
  type RunclubWithMembers,
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, and, or, desc, asc, inArray, isNull, count, ne } from "drizzle-orm";
import { notificationService } from "./notifications";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPushToken(userId: string, pushToken: string | null): Promise<void>;
  updateUserProfile(id: string, profileData: { firstName: string; lastName: string; location: string; dateOfBirth: string }): Promise<User | undefined>;
  updateUserStats(id: string, stats: Partial<Pick<User, 'eventsJoined' | 'totalDistance' | 'buddies'>>): Promise<User | undefined>;
  
  // OAuth operations
  getUserByStravaId(stravaId: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUserFromStrava(data: {
    stravaId: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    location?: string;
    stravaAccessToken: string;
    stravaRefreshToken: string;
    stravaAthlete: any;
  }): Promise<User>;
  createUserFromGoogle(data: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  }): Promise<User>;
  updateUserStravaTokens(id: string, tokens: {
    stravaAccessToken: string | null;
    stravaRefreshToken: string | null;
    stravaAthlete: any | null;
  }): Promise<User | undefined>;
  
  // Email authentication operations
  getUserByEmail(email: string): Promise<User | undefined>;
  createUserFromEmail(data: { 
    email: string; 
    passwordHash: string; 
    firstName: string; 
    lastName: string; 
    sex: string;
    dateOfBirth: string;
    location: string;
    emailVerificationToken?: string 
  }): Promise<User>;
  verifyEmail(token: string): Promise<User | undefined>;
  updatePassword(userId: string, passwordHash: string): Promise<User | undefined>;
  setPasswordResetToken(email: string, token: string, expires: Date): Promise<User | undefined>;
  getUserByPasswordResetToken(token: string): Promise<User | undefined>;
  
  // Profile management operations
  updateUserProfile(userId: string, data: Partial<User>): Promise<User | undefined>;

  // Events
  getAllEvents(currentUserId?: string): Promise<EventWithParticipants[]>;
  getEvent(id: number, currentUserId?: string): Promise<EventWithParticipants | undefined>;
  getEventsByLocation(lat: string, lng: string, radius?: number, hours?: number, currentUserId?: string): Promise<EventWithParticipants[]>;
  createEvent(event: InsertEvent, userId: string): Promise<Event>;
  createSystemEvent(event: Omit<InsertEvent, 'createdBy'>): Promise<Event>;
  updateEventStatus(id: number, status: string): Promise<Event | undefined>;

  // Event Participants
  joinEvent(eventId: number, userId: string): Promise<EventParticipant>;
  leaveEvent(eventId: number, userId: string): Promise<boolean>;
  getEventParticipants(eventId: number): Promise<User[]>;
  getUserEvents(userId: string): Promise<EventWithParticipants[]>;
  getUserAttendanceStatus(eventId: number, userId: string): Promise<string | null>;
  updateAttendanceStatus(eventId: number, userId: string, status: string): Promise<EventParticipant | undefined>;
  
  // Notification Management
  getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationAsRead(notificationId: number, userId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  getUserNotificationSettings(userId: string): Promise<UserNotificationSettings | null>;
  updateNotificationSettings(userId: string, settings: Partial<UserNotificationSettings>): Promise<void>;
  
  // News Article operations
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  getNewsArticles(limit?: number, offset?: number): Promise<NewsArticle[]>;
  getNewsArticleBySlug(slug: string): Promise<NewsArticle | undefined>;
  updateNewsArticle(id: number, updates: Partial<InsertNewsArticle>): Promise<NewsArticle | undefined>;
  deleteNewsArticle(id: number): Promise<boolean>;
  incrementArticleViews(id: number): Promise<void>;
  
  // Event reaction operations
  addEventReaction(eventId: number, userId: string, emoji: string): Promise<void>;
  removeEventReaction(eventId: number, userId: string, emoji: string): Promise<void>;
  
  // Event comment operations
  addEventComment(eventId: number, userId: string, content: string, isQuickComment?: boolean): Promise<EventComment>;
  getEventComments(eventId: number): Promise<EventCommentWithUser[]>;
  updateEventComment(commentId: number, userId: string, content: string): Promise<EventComment | undefined>;
  deleteEventComment(commentId: number, userId: string): Promise<boolean>;
  getEventReactions(eventId: number, userId?: string): Promise<{ emoji: string; count: number; userReacted: boolean }[]>;

  // Goals operations
  getUserGoals(userId: string): Promise<UserGoal[]>;
  createUserGoal(goal: InsertGoal): Promise<UserGoal>;
  updateUserGoal(goalId: number, updates: UpdateGoal): Promise<UserGoal | undefined>;
  deleteUserGoal(goalId: number, userId: string): Promise<boolean>;
  findUsersWithSimilarGoals(userId: string, goalDistance?: string, goalDifficulty?: string): Promise<User[]>;
  
  // Notification preferences
  updateUserNotificationPreferences(userId: string, preferences: any): Promise<void>;
  
  // Training plans operations
  getUserTrainingPlans(userId: string): Promise<any[]>;
  createTrainingPlan(plan: any): Promise<any>;
  updateTrainingPlan(planId: number, updates: any): Promise<any>;
  getCurrentWeekWorkouts(userId: string): Promise<any[]>;
  updateWorkoutCompletion(planId: number, workoutId: string, completed: boolean): Promise<void>;
  pauseTrainingPlan(planId: number, userId: string): Promise<void>;
  resumeTrainingPlan(planId: number, userId: string): Promise<void>;
  resetTrainingPlan(planId: number, userId: string): Promise<void>;
  archiveTrainingPlan(planId: number, userId: string): Promise<void>;
  
  // Runclub operations
  getAllRunclubs(): Promise<RunclubWithMembers[]>;
  getRunclubById(id: number): Promise<RunclubWithMembers | undefined>;
  createRunclub(runclub: InsertRunclub, createdBy: string): Promise<Runclub>;
  updateRunclub(id: number, updates: Partial<InsertRunclub>): Promise<Runclub | undefined>;
  deleteRunclub(id: number, userId: string): Promise<boolean>;
  searchRunclubsByLocation(lat: number, lng: number, radius: number): Promise<RunclubWithMembers[]>;
  joinRunclub(runclubId: number, userId: string): Promise<RunclubMember>;
  leaveRunclub(runclubId: number, userId: string): Promise<boolean>;
  getRunclubMembers(runclubId: number): Promise<User[]>;
  getUserRunclubs(userId: string): Promise<RunclubWithMembers[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserPushToken(userId: string, pushToken: string | null): Promise<void> {
    await db
      .update(users)
      .set({ 
        pushToken: pushToken,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  }

  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // OAuth operations
  async getUserByStravaId(stravaId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stravaId, stravaId));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async createUserFromStrava(data: any): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        id: `strava_${data.stravaId}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        profileImageUrl: data.profileImageUrl,
        location: data.location,
        authProvider: 'strava',
        stravaId: data.stravaId,
        stravaAccessToken: data.stravaAccessToken,
        stravaRefreshToken: data.stravaRefreshToken,
        stravaAthlete: data.stravaAthlete,
      })
      .returning();
    return user;
  }

  async createUserFromGoogle(data: any): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        id: `google_${data.googleId}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        profileImageUrl: data.profileImageUrl,
        authProvider: 'google',
        googleId: data.googleId,
      })
      .returning();
    return user;
  }

  async updateUserStravaTokens(id: string, tokens: any): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        stravaAccessToken: tokens.stravaAccessToken,
        stravaRefreshToken: tokens.stravaRefreshToken,
        stravaAthlete: tokens.stravaAthlete,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUserStats(id: string, stats: Partial<Pick<User, 'eventsJoined' | 'totalDistance' | 'buddies'>>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...stats, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Email authentication operations
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUserFromEmail(data: { 
    email: string; 
    passwordHash: string; 
    firstName: string; 
    lastName: string; 
    sex: string;
    dateOfBirth: string;
    location: string;
    emailVerificationToken?: string 
  }): Promise<User> {
    const userId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        sex: data.sex as any,
        dateOfBirth: data.dateOfBirth,
        location: data.location,
        authProvider: 'email',
        emailVerified: false,
        emailVerificationToken: data.emailVerificationToken,
        // Set default values for other fields
        eventsJoined: 0,
        totalDistance: 0,
        buddies: 0,
      })
      .returning();
    return user;
  }

  async verifyEmail(token: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        updatedAt: new Date(),
      })
      .where(eq(users.emailVerificationToken, token))
      .returning();
    return user;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async setPasswordResetToken(email: string, token: string, expires: Date): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        passwordResetToken: token,
        passwordResetExpires: expires,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email))
      .returning();
    return user;
  }

  async getUserByPasswordResetToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.passwordResetToken, token),
        sql`${users.passwordResetExpires} > NOW()`
      ));
    return user;
  }

  // Events
  async getAllEvents(currentUserId?: string): Promise<EventWithParticipants[]> {
    const allEvents = await db.select().from(events);
    const eventsWithParticipants = await Promise.all(
      allEvents.map(async (event) => {
        const participants = await this.getEventParticipants(event.id);
        const creator = await this.getUser(event.createdBy);
        let userAttendanceStatus = null;
        
        if (currentUserId) {
          userAttendanceStatus = await this.getUserAttendanceStatus(event.id, currentUserId);
        }
        
        return {
          ...event,
          participantCount: participants.length,
          participants,
          creator: creator!,
          userAttendanceStatus: userAttendanceStatus || undefined
        };
      })
    );
    return eventsWithParticipants.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getEvent(id: number, currentUserId?: string): Promise<EventWithParticipants | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    if (!event) return undefined;

    const participants = await this.getEventParticipants(event.id);
    const creator = await this.getUser(event.createdBy);
    let userAttendanceStatus = null;
    
    if (currentUserId) {
      userAttendanceStatus = await this.getUserAttendanceStatus(event.id, currentUserId);
    }
    
    return {
      ...event,
      participantCount: participants.length,
      participants,
      creator: creator!,
      userAttendanceStatus: userAttendanceStatus || undefined
    };
  }

  async getEventsByLocation(lat: string, lng: string, radius: number = 10, hours: number = 48, currentUserId?: string): Promise<EventWithParticipants[]> {
    // Get all events and filter by date range first
    const allEvents = await this.getAllEvents(currentUserId);
    
    const now = new Date();
    const endTime = new Date(now.getTime() + (hours * 60 * 60 * 1000));
    
    // Filter events by date range
    const recentEvents = allEvents.filter(event => {
      const eventDate = new Date(`${event.date}T${event.time}`);
      return eventDate >= now && eventDate <= endTime;
    });
    
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    
    const eventsWithDistance = recentEvents.map(event => {
      // Use actual coordinates from events (especially parkrun events which have real coordinates)
      const eventLat = parseFloat(event.lat);
      const eventLng = parseFloat(event.lng);
      
      const distance = this.calculateDistance(userLat, userLng, eventLat, eventLng);
      
      return {
        ...event,
        distance: distance, // Keep as number for sorting, will be handled by client
        latitude: eventLat,
        longitude: eventLng
      } as EventWithParticipants & { distance: number; latitude: number; longitude: number };
    });
    
    // Filter by radius and sort by distance
    return eventsWithDistance
      .filter(event => event.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20); // Limit to 20 nearest events
  }

  public calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

  async createEvent(event: InsertEvent, userId: string): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values({ 
        ...event, 
        createdBy: userId,
        status: "open",
        description: event.description || null,
        maxParticipants: event.maxParticipants || 15
      })
      .returning();
    return newEvent;
  }

  async createSystemEvent(eventData: Omit<InsertEvent, 'createdBy'>): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values({
        ...eventData,
        createdBy: 'system',
        status: "open",
        description: eventData.description || null,
        maxParticipants: eventData.maxParticipants || 500
      })
      .returning();
    return event;
  }

  // Create recurring events
  async createRecurringEvents(eventData: any, userId: string): Promise<Event[]> {
    const { isRecurring, recurringType, recurringEndDate, recurringDaysOfWeek, ...baseEventData } = eventData;
    
    if (!isRecurring) {
      const event = await this.createEvent(baseEventData, userId);
      return [event];
    }

    const createdEvents: Event[] = [];
    const startDate = new Date(baseEventData.date);
    const endDate = new Date(recurringEndDate);
    
    // Create parent event
    const [parentEvent] = await db
      .insert(events)
      .values({ 
        ...baseEventData, 
        createdBy: userId,
        status: "open",
        description: baseEventData.description || null,
        maxParticipants: baseEventData.maxParticipants || 15,
        isRecurring: true,
        recurringType,
        recurringEndDate,
        recurringDaysOfWeek 
      })
      .returning();
    
    createdEvents.push(parentEvent);
    
    // Generate recurring events
    let currentDate = new Date(startDate);
    const maxEvents = 100; // Safety limit
    let eventCount = 0;
    
    while (currentDate <= endDate && eventCount < maxEvents) {
      const nextOccurrence = this.getNextRecurrenceDate(currentDate, recurringType, recurringDaysOfWeek, startDate);
      
      if (nextOccurrence && nextOccurrence <= endDate) {
        const [recurringEvent] = await db
          .insert(events)
          .values({
            ...baseEventData,
            date: nextOccurrence.toISOString().split('T')[0],
            createdBy: userId,
            status: "open",
            description: baseEventData.description || null,
            maxParticipants: baseEventData.maxParticipants || 15,
            isRecurring: false,
            parentEventId: parentEvent.id
          })
          .returning();
        
        createdEvents.push(recurringEvent);
        eventCount++;
      }
      
      currentDate = nextOccurrence || new Date(endDate.getTime() + 1);
    }
    
    return createdEvents;
  }
  
  private getNextRecurrenceDate(currentDate: Date, recurringType: string, daysOfWeek?: number[], originalStartDate?: Date): Date | null {
    const nextDate = new Date(currentDate);
    
    switch (recurringType) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        return nextDate;
        
      case 'weekly':
        if (daysOfWeek && daysOfWeek.length > 0) {
          // Find next occurrence based on selected days
          for (let i = 1; i <= 7; i++) {
            const testDate = new Date(currentDate);
            testDate.setDate(testDate.getDate() + i);
            if (daysOfWeek.includes(testDate.getDay())) {
              return testDate;
            }
          }
        } else {
          // Default to weekly (same day of week)
          nextDate.setDate(nextDate.getDate() + 7);
          return nextDate;
        }
        break;
        
      case 'monthly':
        if (originalStartDate) {
          nextDate.setMonth(nextDate.getMonth() + 1);
          nextDate.setDate(originalStartDate.getDate());
          return nextDate;
        }
        break;
    }
    
    return null;
  }

  async getRecurringEventsByParent(parentId: number): Promise<Event[]> {
    const recurringEvents = await db.select().from(events).where(eq(events.parentEventId, parentId));
    return recurringEvents;
  }

  async updateEventStatus(id: number, status: string): Promise<Event | undefined> {
    const [updatedEvent] = await db
      .update(events)
      .set({ status })
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  // Event Participants
  async joinEvent(eventId: number, userId: string, attendanceStatus: string = "interested"): Promise<EventParticipant> {
    const [participant] = await db
      .insert(eventParticipants)
      .values({
        eventId,
        userId,
        attendanceStatus: attendanceStatus as "interested" | "attending" | "maybe" | "not_attending"
      })
      .returning();

    // Update event status if needed
    const participants = await this.getEventParticipants(eventId);
    const event = await db.select().from(events).where(eq(events.id, eventId));
    if (event[0] && participants.length >= event[0].maxParticipants * 0.8) {
      await this.updateEventStatus(eventId, "almost_full");
    }
    if (event[0] && participants.length >= event[0].maxParticipants) {
      await this.updateEventStatus(eventId, "full");
    }

    return participant;
  }

  async leaveEvent(eventId: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(eventParticipants)
      .where(and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.userId, userId)))
      .returning();

    if (result.length === 0) return false;

    // Update event status
    const participants = await this.getEventParticipants(eventId);
    const event = await db.select().from(events).where(eq(events.id, eventId));
    if (event[0] && participants.length < event[0].maxParticipants * 0.8) {
      await this.updateEventStatus(eventId, "open");
    }

    return true;
  }

  async getEventParticipants(eventId: number): Promise<(User & { attendanceStatus?: string; joinedAt?: string })[]> {
    const participantData = await db
      .select({ 
        userId: eventParticipants.userId,
        attendanceStatus: eventParticipants.attendanceStatus,
        joinedAt: eventParticipants.joinedAt
      })
      .from(eventParticipants)
      .where(eq(eventParticipants.eventId, eventId));

    const participants = [];
    for (const { userId, attendanceStatus, joinedAt } of participantData) {
      const user = await this.getUser(userId);
      if (user) {
        participants.push({
          ...user,
          attendanceStatus: attendanceStatus || "interested",
          joinedAt: joinedAt?.toISOString()
        });
      }
    }
    return participants;
  }

  async updateAttendanceStatus(eventId: number, userId: string, status: string): Promise<EventParticipant | undefined> {
    const [updated] = await db
      .update(eventParticipants)
      .set({ 
        attendanceStatus: status as "interested" | "attending" | "maybe" | "not_attending",
        confirmedAt: status === "attending" ? new Date() : null
      })
      .where(and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.userId, userId)))
      .returning();

    // Send notification for attendance changes
    if (updated) {
      const event = await this.getEvent(eventId);
      if (event) {
        let notificationTitle = "";
        let notificationMessage = "";
        
        switch (status) {
          case 'attending':
            notificationTitle = `Attendance Confirmed: ${event.title}`;
            notificationMessage = `Great! You've confirmed attendance for the ${event.distance} run at ${event.location}.`;
            break;
          case 'not_attending':
            notificationTitle = `Attendance Cancelled: ${event.title}`;
            notificationMessage = `You've cancelled your attendance for the ${event.distance} run at ${event.location}.`;
            break;
          case 'maybe':
            notificationTitle = `Tentative Attendance: ${event.title}`;
            notificationMessage = `You've marked your attendance as tentative for the ${event.distance} run at ${event.location}.`;
            break;
        }

        if (notificationTitle) {
          await notificationService.sendImmediateNotification({
            userId,
            eventId,
            type: 'attendance_update',
            title: notificationTitle,
            message: notificationMessage
          });
        }
      }
    }
    
    return updated;
  }

  async getUserAttendanceStatus(eventId: number, userId: string): Promise<string | null> {
    const [participant] = await db
      .select({ attendanceStatus: eventParticipants.attendanceStatus })
      .from(eventParticipants)
      .where(and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.userId, userId)));
    
    return participant?.attendanceStatus || null;
  }

  async getUserEvents(userId: string): Promise<EventWithParticipants[]> {
    const userEventData = await db
      .select({ 
        eventId: eventParticipants.eventId,
        attendanceStatus: eventParticipants.attendanceStatus 
      })
      .from(eventParticipants)
      .where(
        and(
          eq(eventParticipants.userId, userId),
          or(
            eq(eventParticipants.attendanceStatus, 'attending'),
            eq(eventParticipants.attendanceStatus, 'maybe')
          )
        )
      );

    const events = [];
    for (const { eventId, attendanceStatus } of userEventData) {
      const event = await this.getEvent(eventId);
      if (event) {
        // Add the user's attendance status to the event
        (event as any).userAttendanceStatus = attendanceStatus;
        events.push(event);
      }
    }
    return events;
  }

  // Notification Management Methods
  async getUserNotifications(userId: string, unreadOnly?: boolean): Promise<any[]> {
    return await notificationService.getUserNotifications(userId, unreadOnly);
  }

  async markNotificationAsRead(notificationId: number, userId: string): Promise<void> {
    await notificationService.markNotificationAsRead(notificationId, userId);
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await notificationService.markAllNotificationsAsRead(userId);
  }

  async getUserNotificationSettings(userId: string): Promise<any> {
    return await notificationService.getUserNotificationSettings(userId);
  }

  async updateNotificationSettings(userId: string, settings: any): Promise<void> {
    await notificationService.updateNotificationSettings(userId, settings);
  }

  // Updates user notification preferences
  async updateUserNotificationPreferences(userId: string, preferences: any): Promise<void> {
    await db.update(users)
      .set({ 
        notificationPreferences: preferences,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // News Article operations
  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const [newArticle] = await db
      .insert(newsArticles)
      .values(article)
      .returning();
    return newArticle;
  }

  async getNewsArticles(limit: number = 20, offset: number = 0): Promise<NewsArticle[]> {
    const articles = await db
      .select()
      .from(newsArticles)
      .where(eq(newsArticles.status, "published"))
      .orderBy(desc(newsArticles.isSticky), desc(newsArticles.publishedAt))
      .limit(limit)
      .offset(offset);
    return articles;
  }

  async getNewsArticleBySlug(slug: string): Promise<NewsArticle | undefined> {
    const [article] = await db
      .select()
      .from(newsArticles)
      .where(and(eq(newsArticles.slug, slug), eq(newsArticles.status, "published")));
    return article;
  }

  async updateNewsArticle(id: number, updates: Partial<InsertNewsArticle>): Promise<NewsArticle | undefined> {
    const [updatedArticle] = await db
      .update(newsArticles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(newsArticles.id, id))
      .returning();
    return updatedArticle;
  }

  async deleteNewsArticle(id: number): Promise<boolean> {
    const result = await db
      .delete(newsArticles)
      .where(eq(newsArticles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async incrementArticleViews(id: number): Promise<void> {
    await db
      .update(newsArticles)
      .set({ viewCount: sql`${newsArticles.viewCount} + 1` })
      .where(eq(newsArticles.id, id));
  }

  // Event reaction operations
  async addEventReaction(eventId: number, userId: string, emoji: string): Promise<void> {
    await db
      .insert(eventReactions)
      .values({
        eventId,
        userId,
        emoji,
      })
      .onConflictDoNothing(); // Prevent duplicate reactions
  }

  async removeEventReaction(eventId: number, userId: string, emoji: string): Promise<void> {
    await db
      .delete(eventReactions)
      .where(
        and(
          eq(eventReactions.eventId, eventId),
          eq(eventReactions.userId, userId),
          eq(eventReactions.emoji, emoji)
        )
      );
  }

  async getEventReactions(eventId: number, userId?: string): Promise<{ emoji: string; count: number; userReacted: boolean }[]> {
    // Get all reactions for this event with counts
    const reactionCounts = await db
      .select({
        emoji: eventReactions.emoji,
        count: sql<number>`count(*)::int`
      })
      .from(eventReactions)
      .where(eq(eventReactions.eventId, eventId))
      .groupBy(eventReactions.emoji);

    // If user is provided, check which reactions they've made
    let userReactions: string[] = [];
    if (userId) {
      const userReactionData = await db
        .select({ emoji: eventReactions.emoji })
        .from(eventReactions)
        .where(
          and(
            eq(eventReactions.eventId, eventId),
            eq(eventReactions.userId, userId)
          )
        );
      userReactions = userReactionData.map(r => r.emoji);
    }

    return reactionCounts.map(reaction => ({
      emoji: reaction.emoji,
      count: reaction.count,
      userReacted: userReactions.includes(reaction.emoji)
    }));
  }

  // Goals operations
  async getUserGoals(userId: string): Promise<UserGoal[]> {
    const goals = await db.select().from(userGoals).where(eq(userGoals.userId, userId)).orderBy(desc(userGoals.createdAt));
    return goals;
  }

  async createUserGoal(goal: InsertGoal): Promise<UserGoal> {
    const [newGoal] = await db.insert(userGoals).values(goal).returning();
    return newGoal;
  }

  async updateUserGoal(goalId: number, updates: UpdateGoal): Promise<UserGoal | undefined> {
    const [updatedGoal] = await db
      .update(userGoals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userGoals.id, goalId))
      .returning();
    return updatedGoal;
  }

  async deleteUserGoal(goalId: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(userGoals)
      .where(and(eq(userGoals.id, goalId), eq(userGoals.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async findUsersWithSimilarGoals(userId: string, goalDistance?: string, goalDifficulty?: string): Promise<User[]> {
    // Build where conditions
    const whereConditions = [
      ne(userGoals.userId, userId),
      eq(userGoals.status, "active")
    ];

    if (goalDistance) {
      whereConditions.push(eq(userGoals.distance, goalDistance));
    }

    if (goalDifficulty) {
      whereConditions.push(eq(userGoals.difficulty, goalDifficulty));
    }

    // Find users with similar goals who are not the current user
    const results = await db
      .select({ user: users })
      .from(userGoals)
      .innerJoin(users, eq(userGoals.userId, users.id))
      .where(and(...whereConditions));
    
    // Remove duplicates and return unique users
    const uniqueUsers = new Map();
    results.forEach(result => {
      if (!uniqueUsers.has(result.user.id)) {
        uniqueUsers.set(result.user.id, result.user);
      }
    });
    
    return Array.from(uniqueUsers.values());
  }

  // Training plans operations
  async getUserTrainingPlans(userId: string): Promise<any[]> {
    const plans = await db
      .select()
      .from(trainingPlans)
      .where(eq(trainingPlans.userId, userId))
      .orderBy(desc(trainingPlans.createdAt));
    return plans;
  }

  async createTrainingPlan(plan: any): Promise<any> {
    const [newPlan] = await db
      .insert(trainingPlans)
      .values(plan)
      .returning();
    return newPlan;
  }

  async updateTrainingPlan(planId: number, updates: any): Promise<any> {
    const [updatedPlan] = await db
      .update(trainingPlans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(trainingPlans.id, planId))
      .returning();
    return updatedPlan;
  }

  async getCurrentWeekWorkouts(userId: string): Promise<any[]> {
    // Get active plan for user
    const [activePlan] = await db
      .select()
      .from(trainingPlans)
      .where(and(eq(trainingPlans.userId, userId), eq(trainingPlans.status, "active")))
      .limit(1);
    
    if (!activePlan) return [];

    // Extract current week's workouts from weeklySchedule
    const currentWeek = activePlan.currentWeek || 1;
    const weekSchedule = activePlan.weeklySchedule[currentWeek] || {};
    
    // Convert schedule object to array format
    const workouts = Object.entries(weekSchedule).map(([day, workout]: [string, any]) => ({
      day,
      ...workout
    }));

    return workouts;
  }

  async updateWorkoutCompletion(planId: number, workoutId: string, completed: boolean): Promise<void> {
    // This would update the specific workout completion status in the weeklySchedule JSON
    // For now, we'll implement a basic version
    const [plan] = await db
      .select()
      .from(trainingPlans)
      .where(eq(trainingPlans.id, planId))
      .limit(1);
    
    if (plan) {
      const updatedSchedule = { ...plan.weeklySchedule };
      const currentWeek = plan.currentWeek || 1;
      
      if (updatedSchedule[currentWeek] && updatedSchedule[currentWeek][workoutId]) {
        updatedSchedule[currentWeek][workoutId].completed = completed;
        
        await db
          .update(trainingPlans)
          .set({ 
            weeklySchedule: updatedSchedule,
            updatedAt: new Date()
          })
          .where(eq(trainingPlans.id, planId));
      }
    }
  }

  async pauseTrainingPlan(planId: number, userId: string): Promise<void> {
    await db
      .update(trainingPlans)
      .set({ 
        status: "paused",
        updatedAt: new Date()
      })
      .where(and(eq(trainingPlans.id, planId), eq(trainingPlans.userId, userId)));
  }

  async resumeTrainingPlan(planId: number, userId: string): Promise<void> {
    // Get the current plan to calculate new dates
    const [plan] = await db
      .select()
      .from(trainingPlans)
      .where(and(eq(trainingPlans.id, planId), eq(trainingPlans.userId, userId)))
      .limit(1);

    if (!plan) return;

    // Calculate new start and end dates based on current week
    const weeksRemaining = plan.duration - (plan.currentWeek - 1);
    const newStartDate = new Date();
    const newEndDate = new Date();
    newEndDate.setDate(newStartDate.getDate() + (weeksRemaining * 7));

    await db
      .update(trainingPlans)
      .set({ 
        status: "active",
        startDate: newStartDate.toISOString().split('T')[0],
        endDate: newEndDate.toISOString().split('T')[0],
        updatedAt: new Date()
      })
      .where(and(eq(trainingPlans.id, planId), eq(trainingPlans.userId, userId)));
  }

  async resetTrainingPlan(planId: number, userId: string): Promise<void> {
    // Get the current plan to reset its schedule
    const [plan] = await db
      .select()
      .from(trainingPlans)
      .where(and(eq(trainingPlans.id, planId), eq(trainingPlans.userId, userId)))
      .limit(1);

    if (!plan) return;

    // Reset all workout completion status in the weekly schedule
    const resetSchedule = { ...plan.weeklySchedule };
    Object.keys(resetSchedule).forEach(weekKey => {
      const weekData = resetSchedule[parseInt(weekKey)];
      if (weekData) {
        Object.keys(weekData).forEach(dayKey => {
          if (weekData[dayKey as keyof typeof weekData] && typeof weekData[dayKey as keyof typeof weekData] === 'object') {
            (weekData[dayKey as keyof typeof weekData] as any).completed = false;
          }
        });
      }
    });

    // Calculate new dates starting from today
    const newStartDate = new Date();
    const newEndDate = new Date();
    newEndDate.setDate(newStartDate.getDate() + (plan.duration * 7));

    await db
      .update(trainingPlans)
      .set({ 
        currentWeek: 1,
        status: "active",
        startDate: newStartDate.toISOString().split('T')[0],
        endDate: newEndDate.toISOString().split('T')[0],
        weeklySchedule: resetSchedule,
        progressData: {
          completedWeeks: 0,
          totalRuns: 0,
          totalDistance: 0,
          averagePace: "0:00",
          missedSessions: 0,
          improvements: []
        },
        updatedAt: new Date()
      })
      .where(and(eq(trainingPlans.id, planId), eq(trainingPlans.userId, userId)));
  }

  async archiveTrainingPlan(planId: number, userId: string): Promise<void> {
    await db
      .update(trainingPlans)
      .set({ 
        status: "cancelled",
        updatedAt: new Date()
      })
      .where(and(eq(trainingPlans.id, planId), eq(trainingPlans.userId, userId)));
  }

  // Notification preferences
  async updateUserNotificationPreferences(userId: string, preferences: any): Promise<void> {
    await db
      .update(users)
      .set({ 
        notificationPreferences: preferences,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Runclub operations
  async getAllRunclubs(): Promise<RunclubWithMembers[]> {
    const runclubData = await db
      .select({
        runclub: runclubs,
        memberCount: sql<number>`count(${runclubMembers.id})::int`.as('memberCount')
      })
      .from(runclubs)
      .leftJoin(runclubMembers, eq(runclubs.id, runclubMembers.runclubId))
      .where(eq(runclubs.status, 'active'))
      .groupBy(runclubs.id)
      .orderBy(desc(runclubs.createdAt));

    return runclubData.map(item => ({
      ...item.runclub,
      memberCount: item.memberCount || 0
    }));
  }

  async getRunclubById(id: number): Promise<RunclubWithMembers | undefined> {
    const result = await db
      .select({
        runclub: runclubs,
        memberCount: sql<number>`count(${runclubMembers.id})::int`.as('memberCount')
      })
      .from(runclubs)
      .leftJoin(runclubMembers, eq(runclubs.id, runclubMembers.runclubId))
      .where(and(eq(runclubs.id, id), eq(runclubs.status, 'active')))
      .groupBy(runclubs.id);

    if (result.length === 0) return undefined;

    const item = result[0];
    return {
      ...item.runclub,
      memberCount: item.memberCount || 0
    };
  }

  async createRunclub(runclubData: InsertRunclub, createdBy: string): Promise<Runclub> {
    const [newRunclub] = await db
      .insert(runclubs)
      .values({
        ...runclubData,
        createdBy,
        status: 'active',
        memberCount: 0,
      })
      .returning();

    // Automatically add creator as owner
    await db
      .insert(runclubMembers)
      .values({
        runclubId: newRunclub.id,
        userId: createdBy,
        role: 'owner'
      });

    // Update member count
    await db
      .update(runclubs)
      .set({ memberCount: 1 })
      .where(eq(runclubs.id, newRunclub.id));

    return newRunclub;
  }

  async updateRunclub(id: number, updates: Partial<InsertRunclub>): Promise<Runclub | undefined> {
    const [updatedRunclub] = await db
      .update(runclubs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(runclubs.id, id))
      .returning();
    return updatedRunclub;
  }

  async deleteRunclub(id: number, userId: string): Promise<boolean> {
    // Only allow creator to delete
    const result = await db
      .update(runclubs)
      .set({ status: 'inactive', updatedAt: new Date() })
      .where(and(eq(runclubs.id, id), eq(runclubs.createdBy, userId)))
      .returning();
    return result.length > 0;
  }

  async searchRunclubsByLocation(lat: number, lng: number, radius: number): Promise<RunclubWithMembers[]> {
    // Convert radius from km to degrees (rough approximation)
    const radiusInDegrees = radius / 111;

    const runclubData = await db
      .select({
        runclub: runclubs,
        memberCount: sql<number>`count(${runclubMembers.id})::int`.as('memberCount'),
        distance: sql<number>`
          sqrt(
            power(cast(${runclubs.lat} as decimal) - ${lat}, 2) + 
            power(cast(${runclubs.lng} as decimal) - ${lng}, 2)
          ) * 111
        `.as('distance')
      })
      .from(runclubs)
      .leftJoin(runclubMembers, eq(runclubs.id, runclubMembers.runclubId))
      .where(
        and(
          eq(runclubs.status, 'active'),
          sql`
            sqrt(
              power(cast(${runclubs.lat} as decimal) - ${lat}, 2) + 
              power(cast(${runclubs.lng} as decimal) - ${lng}, 2)
            ) <= ${radiusInDegrees}
          `
        )
      )
      .groupBy(runclubs.id)
      .orderBy(sql`distance`);

    return runclubData.map(item => ({
      ...item.runclub,
      memberCount: item.memberCount || 0
    }));
  }

  async joinRunclub(runclubId: number, userId: string): Promise<RunclubMember> {
    const [member] = await db
      .insert(runclubMembers)
      .values({
        runclubId,
        userId,
        role: 'member'
      })
      .returning();

    // Update member count
    await db
      .update(runclubs)
      .set({ memberCount: sql`${runclubs.memberCount} + 1` })
      .where(eq(runclubs.id, runclubId));

    return member;
  }

  async leaveRunclub(runclubId: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(runclubMembers)
      .where(and(eq(runclubMembers.runclubId, runclubId), eq(runclubMembers.userId, userId)))
      .returning();

    if (result.length > 0) {
      // Update member count
      await db
        .update(runclubs)
        .set({ memberCount: sql`${runclubs.memberCount} - 1` })
        .where(eq(runclubs.id, runclubId));
      return true;
    }
    return false;
  }

  async getRunclubMembers(runclubId: number): Promise<User[]> {
    const members = await db
      .select({ user: users })
      .from(runclubMembers)
      .innerJoin(users, eq(runclubMembers.userId, users.id))
      .where(eq(runclubMembers.runclubId, runclubId))
      .orderBy(runclubMembers.joinedAt);

    return members.map(m => m.user);
  }

  async getUserRunclubs(userId: string): Promise<RunclubWithMembers[]> {
    const userRunclubs = await db
      .select({
        runclub: runclubs,
        memberCount: sql<number>`count(distinct ${runclubMembers.id})::int`.as('memberCount'),
        userRole: runclubMembers.role
      })
      .from(runclubMembers)
      .innerJoin(runclubs, eq(runclubMembers.runclubId, runclubs.id))
      .leftJoin(
        { otherMembers: runclubMembers }, 
        eq(runclubs.id, sql`${runclubMembers.runclubId}`)
      )
      .where(and(eq(runclubMembers.userId, userId), eq(runclubs.status, 'active')))
      .groupBy(runclubs.id, runclubMembers.role)
      .orderBy(runclubMembers.joinedAt);

    return userRunclubs.map(item => ({
      ...item.runclub,
      memberCount: item.memberCount || 0
    }));
  }
  // Event comment operations
  async addEventComment(eventId: number, userId: string, content: string, isQuickComment = false): Promise<EventComment> {
    const [comment] = await db.insert(eventComments)
      .values({
        eventId,
        userId,
        content,
        isQuickComment,
      })
      .returning();
    return comment;
  }

  async getEventComments(eventId: number): Promise<EventCommentWithUser[]> {
    const comments = await db.select({
      id: eventComments.id,
      eventId: eventComments.eventId,
      userId: eventComments.userId,
      content: eventComments.content,
      isQuickComment: eventComments.isQuickComment,
      createdAt: eventComments.createdAt,
      updatedAt: eventComments.updatedAt,
      user: {
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
      }
    })
    .from(eventComments)
    .innerJoin(users, eq(eventComments.userId, users.id))
    .where(eq(eventComments.eventId, eventId))
    .orderBy(desc(eventComments.createdAt));

    return comments;
  }

  async updateEventComment(commentId: number, userId: string, content: string): Promise<EventComment | undefined> {
    const [comment] = await db.update(eventComments)
      .set({ 
        content,
        updatedAt: new Date()
      })
      .where(and(
        eq(eventComments.id, commentId),
        eq(eventComments.userId, userId)
      ))
      .returning();
    return comment;
  }

  async deleteEventComment(commentId: number, userId: string): Promise<boolean> {
    const result = await db.delete(eventComments)
      .where(and(
        eq(eventComments.id, commentId),
        eq(eventComments.userId, userId)
      ));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
