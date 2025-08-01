import { pgTable, text, varchar, timestamp, jsonb, index, serial, integer, date, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  // Email authentication fields
  passwordHash: varchar("password_hash"), // For email/password auth
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: varchar("email_verification_token"),
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  pushToken: varchar("push_token"),
  location: varchar("location"),
  dateOfBirth: date("date_of_birth"),
  sex: varchar("sex", { enum: ["male", "female", "non-binary", "prefer-not-to-say"] }),
  bio: text("bio"),
  // Running preferences
  preferredDistances: varchar("preferred_distances").array(), // ["5k", "10k", "half_marathon", "marathon", "other"]
  preferredPace: varchar("preferred_pace"), // "easy", "moderate", "fast", "very_fast"
  experienceLevel: varchar("experience_level"), // "beginner", "intermediate", "advanced", "elite"
  runningGoals: varchar("running_goals").array(), // ["weight_loss", "endurance", "speed", "social", "competition"]
  availabilityDays: varchar("availability_days").array(), // ["monday", "tuesday", etc.]
  preferredTime: varchar("preferred_time"), // "early_morning", "morning", "afternoon", "evening"
  // Running statistics
  totalRuns: integer("total_runs").default(0),
  averagePace: varchar("average_pace"), // "MM:SS" format per kilometer
  personalBests: jsonb("personal_bests").default({}), // { "5k": "25:30", "10k": "52:15", etc. }
  // OAuth provider fields
  authProvider: varchar("auth_provider").notNull().default("replit"), // 'replit', 'strava', 'google'
  stravaId: varchar("strava_id"),
  stravaAccessToken: varchar("strava_access_token"),
  stravaRefreshToken: varchar("strava_refresh_token"),
  stravaTokenExpiry: timestamp("strava_token_expiry"),
  googleId: varchar("google_id"),
  // Strava-specific fields
  stravaAthlete: jsonb("strava_athlete"), // Store full Strava athlete profile
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  eventsJoined: integer("events_joined").notNull().default(0),
  totalDistance: integer("total_distance").notNull().default(0), // in meters
  buddies: integer("buddies").notNull().default(0),
  // Training goals and aspirations
  trainingGoals: jsonb("training_goals").default([]), // Array of goal objects with eventName, targetDate, targetTime, etc.
  // Adaptive notification preferences
  notificationPreferences: jsonb("notification_preferences").$type<{
    events: boolean;
    achievements: boolean;
    social: boolean;
    reminders: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
    quietHours: {
      enabled: boolean;
      start: string; // HH:mm format
      end: string;   // HH:mm format
    };
    deviceSettings: {
      sound: boolean;
      vibration: boolean;
      badge: boolean;
    };
    adaptiveSettings: {
      smartTiming: boolean;        // AI-powered optimal notification timing
      contextAware: boolean;       // Location/activity-based filtering
      engagementBased: boolean;    // Adjust frequency based on user interaction
      batteryOptimised: boolean;   // Reduce notifications when battery is low
    };
  }>().default({
    events: true,
    achievements: true,
    social: true,
    reminders: true,
    frequency: 'immediate',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    deviceSettings: {
      sound: true,
      vibration: true,
      badge: true
    },
    adaptiveSettings: {
      smartTiming: true,
      contextAware: true,
      engagementBased: true,
      batteryOptimised: true
    }
  }),
});

// Runclub table
export const runclubs = pgTable("runclubs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  logoUrl: varchar("logo_url"), // Club logo or profile picture
  annualCost: numeric("annual_cost", { precision: 10, scale: 2 }), // Annual cost (nullable for free clubs)
  location: text("location").notNull(), // Primary location address string
  lat: text("lat").notNull(), // latitude
  lng: text("lng").notNull(), // longitude
  runDays: varchar("run_days").array().notNull(), // ["monday", "tuesday", "wednesday", etc.]
  distances: varchar("distances").array().notNull(), // ["5k", "10k", "half_marathon", etc.]
  abilityLevels: varchar("ability_levels").array().notNull(), // ["beginner", "intermediate", "advanced", "elite"]
  comments: text("comments"), // Additional information about the club
  createdBy: varchar("created_by").notNull(), // User ID who created the club
  status: text("status").notNull().default("active"), // active, inactive, pending
  memberCount: integer("member_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Runclub members table (many-to-many relationship)
export const runclubMembers = pgTable("runclub_members", {
  id: serial("id").primaryKey(),
  runclubId: integer("runclub_id").notNull().references(() => runclubs.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role").default("member"), // member, admin, owner
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(), // ISO date string
  time: text("time").notNull(), // HH:MM format
  location: text("location").notNull(), // address string
  lat: text("lat").notNull(), // latitude
  lng: text("lng").notNull(), // longitude
  distance: text("distance").notNull(), // e.g., "5K", "10K"
  maxParticipants: integer("max_participants").notNull().default(15),
  createdBy: varchar("created_by").notNull(), // Changed to varchar to match user ID
  status: text("status").notNull().default("open"), // open, almost_full, full, cancelled
  // New event enhancement fields
  isClubEvent: boolean("is_club_event").default(false),
  clubName: text("club_name"), // Name of the club if it's a club event
  abilityLevels: varchar("ability_levels").array(), // ["beginner", "intermediate", "advanced", "all_welcome"]
  creatorComments: text("creator_comments"), // Additional comments from event creator
  // Recurring event fields
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurringType: text("recurring_type"), // 'daily', 'weekly', 'monthly'
  recurringEndDate: text("recurring_end_date"), // ISO date string
  recurringDaysOfWeek: jsonb("recurring_days_of_week"), // For weekly: [1,2,3,4,5] (Mon-Fri)
  parentEventId: integer("parent_event_id"), // Links generated events to original
  // Race fields
  isRace: boolean("is_race").default(false),
  raceCost: numeric("race_cost", { precision: 8, scale: 2 }),
  raceWebsite: text("race_website"),
  // Goal-related event tagging
  isGoalEvent: boolean("is_goal_event").default(false), // Whether this event is tagged as a goal for training
  goalCategory: varchar("goal_category"), // "marathon", "half_marathon", "10k", "5k", "triathlon", "fun_run", etc.
  difficultyLevel: varchar("difficulty_level"), // "beginner", "intermediate", "advanced", "elite"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: varchar("user_id").notNull(), // Changed to varchar to match user ID
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  attendanceStatus: varchar("attendance_status", { enum: ["interested", "attending", "maybe", "not_attending"] }).default("interested"),
  confirmedAt: timestamp("confirmed_at"),
});

// Event reactions system
export const eventReactions = pgTable("event_reactions", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: varchar("user_id").notNull(),
  emoji: varchar("emoji", { length: 10 }).notNull(), // Store emoji character
  createdAt: timestamp("created_at").defaultNow(),
});

// Event comments table for user comments on events
export const eventComments = pgTable("event_comments", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  isQuickComment: boolean("is_quick_comment").default(false), // For pre-defined quick comments
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Buddy matching system tables
export const buddyMatches = pgTable("buddy_matches", {
  id: serial("id").primaryKey(),
  requesterId: varchar("requester_id").notNull(), // User who sent the request
  recipientId: varchar("recipient_id").notNull(), // User who received the request
  status: varchar("status", { enum: ["pending", "accepted", "declined", "blocked"] }).notNull().default("pending"),
  compatibilityScore: integer("compatibility_score"), // 0-100 compatibility score
  matchedAt: timestamp("matched_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const buddyPreferences = pgTable("buddy_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  maxDistance: integer("max_distance").default(25), // km radius for buddy search
  ageRangeMin: integer("age_range_min").default(18),
  ageRangeMax: integer("age_range_max").default(65),
  paceFlexibility: varchar("pace_flexibility", { enum: ["strict", "moderate", "flexible"] }).default("moderate"),
  experienceLevelPreference: varchar("experience_level_preference").array(), // ["beginner", "intermediate", "advanced", "any"]
  genderPreference: varchar("gender_preference", { enum: ["male", "female", "non-binary", "any"] }).default("any"),
  communicationStyle: varchar("communication_style", { enum: ["chatty", "moderate", "quiet", "any"] }).default("any"),
  runningGoalAlignment: boolean("running_goal_alignment").default(true), // Match similar goals
  scheduleFlexibility: varchar("schedule_flexibility", { enum: ["strict", "moderate", "flexible"] }).default("moderate"),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User training goals table
export const userGoals = pgTable("user_goals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  eventName: varchar("event_name").notNull(), // "Sydney Marathon", "Melbourne Half Marathon", etc.
  eventDate: date("event_date"),
  targetTime: varchar("target_time"), // "3:30:00" for marathon, "1:45:00" for half, etc.
  distance: varchar("distance").notNull(), // "marathon", "half_marathon", "10k", "5k", etc.
  difficulty: varchar("difficulty", { enum: ["beginner", "intermediate", "advanced", "elite"] }).default("intermediate"),
  status: varchar("status", { enum: ["active", "completed", "paused", "cancelled"] }).default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Training plans table
export const trainingPlans = pgTable("training_plans", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  goalId: integer("goal_id"), // Reference to userGoals table
  planName: varchar("plan_name").notNull(),
  planType: varchar("plan_type", { enum: ["beginner", "intermediate", "advanced", "marathon", "half_marathon", "10k", "5k", "custom"] }).notNull(),
  duration: integer("duration").notNull(), // weeks
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  currentWeek: integer("current_week").default(1),
  status: varchar("status", { enum: ["active", "completed", "paused", "cancelled"] }).default("active"),
  weeklySchedule: jsonb("weekly_schedule").$type<{
    [week: number]: {
      monday?: { type: string; distance?: string; pace?: string; duration?: string; notes?: string; completed?: boolean; };
      tuesday?: { type: string; distance?: string; pace?: string; duration?: string; notes?: string; completed?: boolean; };
      wednesday?: { type: string; distance?: string; pace?: string; duration?: string; notes?: string; completed?: boolean; };
      thursday?: { type: string; distance?: string; pace?: string; duration?: string; notes?: string; completed?: boolean; };
      friday?: { type: string; distance?: string; pace?: string; duration?: string; notes?: string; completed?: boolean; };
      saturday?: { type: string; distance?: string; pace?: string; duration?: string; notes?: string; completed?: boolean; };
      sunday?: { type: string; distance?: string; pace?: string; duration?: string; notes?: string; completed?: boolean; };
    };
  }>().notNull(),
  preferences: jsonb("preferences").$type<{
    daysPerWeek: number;
    preferredDays: string[];
    maxDistancePerWeek: number;
    restDays: string[];
    focusAreas: string[]; // ["endurance", "speed", "strength", "recovery"]
    adaptToFitness: boolean;
  }>().notNull(),
  progressData: jsonb("progress_data").$type<{
    completedWeeks: number;
    totalRuns: number;
    totalDistance: number;
    averagePace: string;
    missedSessions: number;
    improvements: Array<{
      week: number;
      metric: string;
      value: string;
      improvement: string;
    }>;
  }>().default({
    completedWeeks: 0,
    totalRuns: 0,
    totalDistance: 0,
    averagePace: "0:00",
    missedSessions: 0,
    improvements: []
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Training plan templates
export const trainingPlanTemplates = pgTable("training_plan_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  category: varchar("category", { enum: ["marathon", "half_marathon", "10k", "5k", "beginner", "weight_loss", "speed"] }).notNull(),
  difficulty: varchar("difficulty", { enum: ["beginner", "intermediate", "advanced"] }).notNull(),
  duration: integer("duration").notNull(), // weeks
  daysPerWeek: integer("days_per_week").notNull(),
  weeklyStructure: jsonb("weekly_structure").$type<{
    [week: number]: {
      focus: string;
      totalDistance: string;
      keyWorkouts: Array<{
        day: string;
        type: string;
        distance?: string;
        pace?: string;
        duration?: string;
        description: string;
      }>;
    };
  }>().notNull(),
  targetRaces: varchar("target_races").array(), // Compatible race distances
  prerequisites: text("prerequisites"),
  tips: text("tips").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workout feedback and performance tracking for adaptive difficulty
export const workoutFeedback = pgTable("workout_feedback", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  trainingPlanId: integer("training_plan_id").notNull(),
  workoutDate: date("workout_date").notNull(),
  workoutType: varchar("workout_type").notNull(), // "easy_run", "tempo_run", "long_run", etc.
  plannedDistance: numeric("planned_distance", { precision: 5, scale: 2 }), // km
  actualDistance: numeric("actual_distance", { precision: 5, scale: 2 }), // km
  plannedDuration: integer("planned_duration"), // minutes
  actualDuration: integer("actual_duration"), // minutes
  completed: boolean("completed").notNull().default(false),
  difficultyRating: integer("difficulty_rating"), // 1-10 scale (1=too easy, 10=too hard)
  effortRating: integer("effort_rating"), // 1-10 scale (perceived exertion)
  enjoymentRating: integer("enjoyment_rating"), // 1-10 scale
  paceAchieved: varchar("pace_achieved"), // actual pace in MM:SS format
  notes: text("notes"),
  weatherConditions: varchar("weather_conditions"),
  energyLevel: integer("energy_level"), // 1-10 scale before workout
  recoveryRating: integer("recovery_rating"), // 1-10 scale after workout
  createdAt: timestamp("created_at").defaultNow(),
});

// Training plan adjustments log
export const trainingAdjustments = pgTable("training_adjustments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  trainingPlanId: integer("training_plan_id").notNull(),
  adjustmentDate: timestamp("adjustment_date").defaultNow(),
  adjustmentType: varchar("adjustment_type", { 
    enum: ["difficulty_increase", "difficulty_decrease", "volume_increase", "volume_decrease", "pace_adjustment", "schedule_change"] 
  }).notNull(),
  reason: varchar("reason").notNull(), // "high_completion_rate", "consistent_low_ratings", etc.
  previousValue: varchar("previous_value"),
  newValue: varchar("new_value"),
  difficultyMultiplier: varchar("difficulty_multiplier").notNull(),
  performanceScore: varchar("performance_score"),
  automaticAdjustment: boolean("automatic_adjustment").default(true),
  weekNumber: integer("week_number").notNull(),
  notes: text("notes"),
});

export const upsertUserSchema = createInsertSchema(users);
export const insertGoalSchema = createInsertSchema(userGoals).omit({ id: true, createdAt: true, updatedAt: true });
export const updateGoalSchema = insertGoalSchema.partial();
export const insertTrainingPlanSchema = createInsertSchema(trainingPlans).omit({ id: true, createdAt: true, updatedAt: true });
export const updateTrainingPlanSchema = insertTrainingPlanSchema.partial();
export const insertWorkoutFeedbackSchema = createInsertSchema(workoutFeedback).omit({ id: true, createdAt: true });
export const insertTrainingAdjustmentSchema = createInsertSchema(trainingAdjustments).omit({ id: true });

// Email authentication schemas
export const registerUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  // Mandatory profile fields
  sex: z.enum(["male", "female", "non-binary", "prefer-not-to-say"], {
    required_error: "Please select your sex"
  }),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  location: z.string().min(1, "Location is required"),
});

export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdBy: true,
  status: true,
  parentEventId: true,
  createdAt: true,
  updatedAt: true,
});

export const recurringEventSchema = insertEventSchema.extend({
  isRecurring: z.boolean(),
  recurringType: z.enum(['daily', 'weekly', 'monthly']).optional(),
  recurringEndDate: z.string().optional(),
  recurringDaysOfWeek: z.array(z.number().min(0).max(6)).optional(), // 0=Sunday, 6=Saturday
  // Enhanced event fields validation with conditional requirements
  isClubEvent: z.boolean().optional(),
  clubName: z.string().optional(),
  abilityLevels: z.array(z.enum(['beginner', 'intermediate', 'advanced', 'all_welcome'])).default([]),
  creatorComments: z.string().optional(),
}).refine((data) => {
  // If it's a club event, club name is required
  if (data.isClubEvent && (!data.clubName || data.clubName.trim().length === 0)) {
    return false;
  }
  // If it's recurring, require recurring type and end date
  if (data.isRecurring && (!data.recurringType || !data.recurringEndDate)) {
    return false;
  }
  return true;
}, {
  message: "Club events require a club name, and recurring events require type and end date",
  path: ["clubName", "recurringType", "recurringEndDate"],
});

export const insertEventParticipantSchema = createInsertSchema(eventParticipants).omit({
  id: true,
  joinedAt: true,
  confirmedAt: true,
});

export const updateAttendanceSchema = z.object({
  attendanceStatus: z.enum(["interested", "attending", "maybe", "not_attending"]),
});

// Notification system schemas
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  eventId: integer("event_id").references(() => events.id),
  type: varchar("type").notNull(), // 'event_reminder', 'event_update', 'event_cancelled', 'attendance_reminder'
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userNotificationSettings = pgTable("user_notification_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  emailReminders: boolean("email_reminders").default(true),
  browserNotifications: boolean("browser_notifications").default(true),
  reminderHours: integer("reminder_hours").default(24), // Hours before event to send reminder
  attendanceReminders: boolean("attendance_reminders").default(true),
  eventUpdates: boolean("event_updates").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  sentAt: true,
  createdAt: true,
});

export const insertUserNotificationSettingsSchema = createInsertSchema(userNotificationSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Runclub schemas
export const insertRunclubSchema = createInsertSchema(runclubs).omit({
  id: true,
  createdBy: true,
  status: true,
  memberCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRunclubMemberSchema = createInsertSchema(runclubMembers).omit({
  id: true,
  joinedAt: true,
});

// Runclub types
export type Runclub = typeof runclubs.$inferSelect;
export type InsertRunclub = typeof runclubs.$inferInsert;
export type RunclubMember = typeof runclubMembers.$inferSelect;
export type InsertRunclubMember = typeof runclubMembers.$inferInsert;

export type RunclubWithMembers = Runclub & {
  memberCount: number;
};

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserGoal = typeof userGoals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type UpdateGoal = z.infer<typeof updateGoalSchema>;

// Event reactions types
export type EventReaction = typeof eventReactions.$inferSelect;
export type InsertEventReaction = typeof eventReactions.$inferInsert;

// Strava club sync table for tracking imported events
export const stravaClubSync = pgTable("strava_club_sync", {
  id: text("id").primaryKey(),
  clubId: text("club_id").notNull(),
  clubName: text("club_name").notNull(),
  lastSyncAt: timestamp("last_sync_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  syncIntervalHours: integer("sync_interval_hours").default(24),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Track individual Strava events that have been imported
export const stravaEventImport = pgTable("strava_event_import", {
  id: text("id").primaryKey(),
  stravaEventId: text("strava_event_id").notNull().unique(),
  clubSyncId: text("club_sync_id").references(() => stravaClubSync.id),
  eventId: integer("event_id").references(() => events.id),
  importedAt: timestamp("imported_at").defaultNow(),
  lastUpdatedAt: timestamp("last_updated_at").defaultNow(),
});

export type StravaClubSync = typeof stravaClubSync.$inferSelect;
export type InsertStravaClubSync = typeof stravaClubSync.$inferInsert;
export type StravaEventImport = typeof stravaEventImport.$inferSelect;
export type InsertStravaEventImport = typeof stravaEventImport.$inferInsert;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type RecurringEvent = z.infer<typeof recurringEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEventParticipant = z.infer<typeof insertEventParticipantSchema>;
export type EventParticipant = typeof eventParticipants.$inferSelect;

export type EventWithParticipants = Event & {
  participantCount: number;
  participants: (User & { attendanceStatus?: string; joinedAt?: string })[];
  creator: User;
  userAttendanceStatus?: string; // Current user's attendance status
  reactions?: { emoji: string; count: number; userReacted: boolean }[];
};

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type UserNotificationSettings = typeof userNotificationSettings.$inferSelect;
export type InsertUserNotificationSettings = z.infer<typeof insertUserNotificationSettingsSchema>;

// News Articles table for blog-like news content
export const newsArticles = pgTable("news_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: varchar("slug").notNull().unique(), // URL-friendly version of title
  content: text("content").notNull(), // Full article content (markdown/HTML)
  excerpt: text("excerpt"), // Short summary for previews
  authorId: varchar("author_id").notNull(), // Reference to users.id
  status: varchar("status").notNull().default("published"), // "draft", "published", "archived"
  featuredImage: varchar("featured_image"), // URL to featured image
  tags: varchar("tags").array().default([]), // Article tags for categorization
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  viewCount: integer("view_count").default(0),
  isSticky: boolean("is_sticky").default(false), // Pin to top of news feed
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  publishedAt: true,
  viewCount: true
});
export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type NewsArticle = typeof newsArticles.$inferSelect;

// Event comments schema exports
export const insertEventCommentSchema = createInsertSchema(eventComments).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertEventComment = z.infer<typeof insertEventCommentSchema>;
export type EventComment = typeof eventComments.$inferSelect;

export type EventCommentWithUser = EventComment & {
  user: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
};
