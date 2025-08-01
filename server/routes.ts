import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertEventParticipantSchema, recurringEventSchema, updateAttendanceSchema, insertRunclubSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupStravaAuth, getStravaActivities } from "./stravaAuth";
import { setupEmailAuth } from "./emailAuth";
import { stravaClubSyncService } from "./stravaClubSync";
import { registerLocationRoutes } from "./routes/location";
import { BuddyMatchingService } from "./buddyMatching";
import { getUserStats, getUserProgress, getUserAchievements, updateProgress } from "./progressTracking";
import { notificationService } from "./notificationService";
import { z } from "zod";

// Define authenticated request interface
interface AuthenticatedRequest extends Request {
  user: {
    claims: {
      sub: string;
      email?: string;
    };
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  setupStravaAuth(app);
  setupEmailAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile management routes
  app.patch('/api/auth/profile', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = req.body;
      
      // Validate and filter out undefined values
      const cleanedData = Object.fromEntries(
        Object.entries(profileData).filter(([_, value]) => value !== undefined && value !== null)
      );
      
      if (Object.keys(cleanedData).length === 0) {
        return res.status(400).json({ message: "No valid profile data provided" });
      }
      
      const updatedUser = await storage.updateUserProfile(userId, cleanedData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get user's events for calendar
  app.get('/api/events/user', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const userEvents = await storage.getUserEvents(userId);
      res.json(userEvents);
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ message: "Failed to fetch user events" });
    }
  });

  // Push notification management
  app.post('/api/notifications/register-token', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { pushToken } = req.body;
      
      if (!pushToken) {
        return res.status(400).json({ message: 'Push token is required' });
      }
      
      await storage.updateUserPushToken(userId, pushToken);
      res.json({ message: 'Push token registered successfully' });
    } catch (error) {
      console.error('Error registering push token:', error);
      res.status(500).json({ message: 'Failed to register push token' });
    }
  });

  app.delete('/api/notifications/unregister-token', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      await storage.updateUserPushToken(userId, null);
      res.json({ message: 'Push token unregistered successfully' });
    } catch (error) {
      console.error('Error unregistering push token:', error);
      res.status(500).json({ message: 'Failed to unregister push token' });
    }
  });

  app.post('/api/notifications/test', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { title, body } = req.body;
      
      // Send test notification
      const success = await notificationService.sendPushNotification({
        userId,
        title: title || 'Test Notification',
        body: body || 'This is a test notification from The Social Runner',
        data: { type: 'test' }
      });
      
      if (success) {
        res.json({ message: 'Test notification sent successfully' });
      } else {
        res.status(400).json({ message: 'Failed to send test notification' });
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      res.status(500).json({ message: 'Failed to send test notification' });
    }
  });

  // Strava integration routes
  app.get('/api/strava/activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.stravaAccessToken) {
        return res.status(400).json({ message: "Strava not connected" });
      }
      
      const activities = await getStravaActivities(user.stravaAccessToken);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching Strava activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post('/api/strava/disconnect', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.updateUserStravaTokens(userId, {
        stravaAccessToken: null,
        stravaRefreshToken: null,
        stravaAthlete: null
      });
      res.json({ message: "Strava disconnected successfully" });
    } catch (error) {
      console.error("Error disconnecting Strava:", error);
      res.status(500).json({ message: "Failed to disconnect Strava" });
    }
  });

  // Events routes
  app.get("/api/events", async (req: any, res) => {
    try {
      const currentUserId = req.user?.claims?.sub;
      const events = await storage.getAllEvents(currentUserId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Get events by location
  app.get("/api/events/search/location", async (req, res) => {
    try {
      const { lat, lng, radius = "10", hours = "48" } = req.query as {
        lat: string;
        lng: string;
        radius?: string;
        hours?: string;
      };

      if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }

      const currentUserId = (req as any).user?.claims?.sub;
      const events = await storage.getEventsByLocation(
        lat,
        lng,
        parseInt(radius),
        parseInt(hours),
        currentUserId
      );
      
      res.json(events);
    } catch (error) {
      console.error("Error fetching events by location:", error);
      res.status(500).json({ message: "Failed to fetch events by location" });
    }
  });

  app.get("/api/events/:id", async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const currentUserId = req.user?.claims?.sub;
      const event = await storage.getEvent(id, currentUserId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post("/api/events", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate basic required fields first
      if (!req.body.title || !req.body.date || !req.body.time || !req.body.location) {
        return res.status(400).json({ 
          message: "Missing required fields: title, date, time, and location are required" 
        });
      }
      
      // Check if this is a recurring event
      if (req.body.isRecurring) {
        const validatedData = recurringEventSchema.parse(req.body);
        const events = await storage.createRecurringEvents(validatedData, userId);
        res.status(201).json({ 
          message: `Created ${events.length} events`, 
          parentEvent: events[0], 
          totalEvents: events.length,
          events: events
        });
      } else {
        const validatedData = insertEventSchema.parse(req.body);
        const event = await storage.createEvent(validatedData, userId);
        res.status(201).json(event);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid event data", 
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.post("/api/events/:id/join", isAuthenticated, async (req: any, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      // Check if event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Check if already joined
      const participants = await storage.getEventParticipants(eventId);
      const alreadyJoined = participants.some(p => p.id === userId);
      if (alreadyJoined) {
        return res.status(400).json({ message: "Already joined this event" });
      }

      // Check if event is full
      if (event.status === "full" || event.participantCount >= event.maxParticipants) {
        return res.status(400).json({ message: "Event is full" });
      }

      const participant = await storage.joinEvent(eventId, userId);
      
      // Update user stats
      const user = await storage.getUser(userId);
      if (user) {
        await storage.updateUserStats(userId, {
          eventsJoined: user.eventsJoined + 1
        });
      }

      res.status(201).json({ message: "Successfully joined event", participant });
    } catch (error) {
      console.error("Error joining event:", error);
      res.status(500).json({ message: "Failed to join event" });
    }
  });

  app.delete("/api/events/:id/leave", isAuthenticated, async (req: any, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const success = await storage.leaveEvent(eventId, userId);
      if (!success) {
        return res.status(404).json({ message: "Not joined to this event" });
      }

      // Update user stats
      const user = await storage.getUser(userId);
      if (user && user.eventsJoined > 0) {
        await storage.updateUserStats(userId, {
          eventsJoined: user.eventsJoined - 1
        });
      }

      res.json({ message: "Successfully left event" });
    } catch (error) {
      console.error("Error leaving event:", error);
      res.status(500).json({ message: "Failed to leave event" });
    }
  });

  // Update attendance status
  app.patch("/api/events/:id/attendance", isAuthenticated, async (req: any, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const { attendanceStatus } = updateAttendanceSchema.parse(req.body);

      // Check if user is a participant
      const userAttendance = await storage.getUserAttendanceStatus(eventId, userId);
      if (!userAttendance) {
        return res.status(400).json({ message: "You must join the event first" });
      }

      const updatedParticipant = await storage.updateAttendanceStatus(eventId, userId, attendanceStatus);
      if (!updatedParticipant) {
        return res.status(400).json({ message: "Failed to update attendance status" });
      }

      res.json({ 
        message: "Attendance status updated successfully", 
        attendanceStatus: updatedParticipant.attendanceStatus 
      });
    } catch (error) {
      console.error("Error updating attendance:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid attendance status", 
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      res.status(500).json({ message: "Failed to update attendance status" });
    }
  });

  // Get user's attendance status for an event
  app.get("/api/events/:id/attendance", isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const attendanceStatus = await storage.getUserAttendanceStatus(eventId, userId);
      res.json({ attendanceStatus });
    } catch (error) {
      res.status(500).json({ message: "Failed to get attendance status" });
    }
  });

  // User routes - get current user's events
  app.get("/api/user/events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getUserEvents(userId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user events" });
    }
  });



  // Cancel event attendance (leave event) - Alternative route
  app.delete("/api/events/:id/attendance", isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      const success = await storage.leaveEvent(eventId, userId);
      
      if (!success) {
        return res.status(404).json({ message: "Event participation not found" });
      }

      // Update user stats
      const user = await storage.getUser(userId);
      if (user && user.eventsJoined > 0) {
        await storage.updateUserStats(userId, {
          eventsJoined: user.eventsJoined - 1
        });
      }

      res.json({ message: "Successfully cancelled attendance and left the event" });
    } catch (error) {
      console.error("Error cancelling attendance:", error);
      res.status(500).json({ message: "Failed to cancel attendance" });
    }
  });

  // Notification preferences endpoints

  app.get("/api/training-plans/current-week", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workouts = await storage.getCurrentWeekWorkouts(userId);
      res.json(workouts);
    } catch (error) {
      console.error("Error fetching current week workouts:", error);
      res.status(500).json({ message: "Failed to fetch current week workouts" });
    }
  });

  // Adaptive difficulty routes
  app.get("/api/training-plans/:id/adaptive-difficulty", isAuthenticated, async (req: any, res) => {
    try {
      const trainingPlanId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { adaptiveDifficultyEngine } = await import("./adaptiveDifficulty");
      const adaptiveData = await adaptiveDifficultyEngine.getAdaptiveData(userId, trainingPlanId);
      
      if (!adaptiveData) {
        return res.status(404).json({ message: "Training plan not found" });
      }

      res.json(adaptiveData);
    } catch (error) {
      console.error("Error fetching adaptive difficulty data:", error);
      res.status(500).json({ message: "Failed to fetch adaptive difficulty data" });
    }
  });

  app.post("/api/training-plans/:id/workout-feedback", isAuthenticated, async (req: any, res) => {
    try {
      const trainingPlanId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { adaptiveDifficultyEngine } = await import("./adaptiveDifficulty");
      await adaptiveDifficultyEngine.submitWorkoutFeedback({
        ...req.body,
        userId,
        trainingPlanId,
      });

      // Trigger auto-adjustment check
      const currentWeek = req.body.weekNumber || 1;
      await adaptiveDifficultyEngine.autoAdjustDifficulty(userId, trainingPlanId, currentWeek);

      res.json({ message: "Feedback submitted successfully" });
    } catch (error) {
      console.error("Error submitting workout feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  app.post("/api/training-plans/:id/adjust-difficulty", isAuthenticated, async (req: any, res) => {
    try {
      const trainingPlanId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { adjustmentType, weekNumber } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { adaptiveDifficultyEngine } = await import("./adaptiveDifficulty");
      const sessionVariance = await adaptiveDifficultyEngine.applyManualAdjustment(
        userId, 
        trainingPlanId, 
        adjustmentType, 
        weekNumber || 1
      );

      res.json({
        message: "Difficulty adjusted successfully",
        variance: sessionVariance
      });
    } catch (error) {
      console.error("Error adjusting difficulty:", error);
      res.status(500).json({ message: "Failed to adjust difficulty" });
    }
  });

  // Calendar sync routes
  app.get("/api/training-plans/:id/calendar-sync", isAuthenticated, async (req: any, res) => {
    try {
      const trainingPlanId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { calendarSyncService } = await import("./calendarSync");
      const summary = await calendarSyncService.getCalendarSyncSummary(userId, trainingPlanId);
      
      res.json(summary);
    } catch (error) {
      console.error("Error fetching calendar sync summary:", error);
      res.status(500).json({ message: "Failed to fetch calendar sync data" });
    }
  });

  app.get("/api/training-plans/:id/calendar/ical", isAuthenticated, async (req: any, res) => {
    try {
      const trainingPlanId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { calendarSyncService } = await import("./calendarSync");
      const icalData = await calendarSyncService.generateICalendar(userId, trainingPlanId);
      
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="training_plan.ics"');
      res.send(icalData);
    } catch (error) {
      console.error("Error generating iCal:", error);
      res.status(500).json({ message: "Failed to generate calendar file" });
    }
  });

  app.get("/api/training-plans/:id/calendar/google-url", isAuthenticated, async (req: any, res) => {
    try {
      const trainingPlanId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // For now, return the iCal URL - Google Calendar can import iCal files
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const icalUrl = `${baseUrl}/api/training-plans/${trainingPlanId}/calendar/ical`;
      const googleUrl = `https://calendar.google.com/calendar/u/0/r/settings/addbyurl?cid=${encodeURIComponent(icalUrl)}`;
      
      res.json({ url: googleUrl });
    } catch (error) {
      console.error("Error generating Google Calendar URL:", error);
      res.status(500).json({ message: "Failed to generate Google Calendar URL" });
    }
  });

  app.get("/api/training-plans/:id/calendar/outlook-url", isAuthenticated, async (req: any, res) => {
    try {
      const trainingPlanId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // For now, return the iCal URL - Outlook can import iCal files
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const icalUrl = `${baseUrl}/api/training-plans/${trainingPlanId}/calendar/ical`;
      const outlookUrl = `https://outlook.live.com/calendar/0/addcalendar?name=Training%20Plan&url=${encodeURIComponent(icalUrl)}`;
      
      res.json({ url: outlookUrl });
    } catch (error) {
      console.error("Error generating Outlook URL:", error);
      res.status(500).json({ message: "Failed to generate Outlook URL" });
    }
  });

  app.patch("/api/training-plans/:planId/workouts/:workoutId", isAuthenticated, async (req: any, res) => {
    try {
      const planId = parseInt(req.params.planId);
      const workoutId = req.params.workoutId;
      const { completed } = req.body;
      
      await storage.updateWorkoutCompletion(planId, workoutId, completed);
      res.json({ message: "Workout updated successfully" });
    } catch (error) {
      console.error("Error updating workout:", error);
      res.status(500).json({ message: "Failed to update workout" });
    }
  });

  // Pause training plan
  app.patch("/api/training-plans/:id/pause", isAuthenticated, async (req: any, res) => {
    try {
      const planId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      await storage.pauseTrainingPlan(planId, userId);
      res.json({ message: "Training plan paused successfully" });
    } catch (error) {
      console.error("Error pausing training plan:", error);
      res.status(500).json({ message: "Failed to pause training plan" });
    }
  });

  // Resume training plan
  app.patch("/api/training-plans/:id/resume", isAuthenticated, async (req: any, res) => {
    try {
      const planId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      await storage.resumeTrainingPlan(planId, userId);
      res.json({ message: "Training plan resumed successfully" });
    } catch (error) {
      console.error("Error resuming training plan:", error);
      res.status(500).json({ message: "Failed to resume training plan" });
    }
  });

  // Reset training plan
  app.patch("/api/training-plans/:id/reset", isAuthenticated, async (req: any, res) => {
    try {
      const planId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      await storage.resetTrainingPlan(planId, userId);
      res.json({ message: "Training plan reset successfully" });
    } catch (error) {
      console.error("Error resetting training plan:", error);
      res.status(500).json({ message: "Failed to reset training plan" });
    }
  });

  // Delete/Archive training plan
  app.delete("/api/training-plans/:id", isAuthenticated, async (req: any, res) => {
    try {
      const planId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      await storage.archiveTrainingPlan(planId, userId);
      res.json({ message: "Training plan archived successfully" });
    } catch (error) {
      console.error("Error archiving training plan:", error);
      res.status(500).json({ message: "Failed to archive training plan" });
    }
  });

  app.get('/api/notifications/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ notificationPreferences: user.notificationPreferences });
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ message: "Failed to fetch notification preferences" });
    }
  });

  app.patch('/api/notifications/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { notificationPreferences } = req.body;
      
      await storage.updateUserNotificationPreferences(userId, notificationPreferences);
      res.json({ message: "Notification preferences updated successfully" });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ message: "Failed to update notification preferences" });
    }
  });

  app.post('/api/notifications/test', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // For web testing, we'll simulate the test notification without requiring push tokens
      const testTitle = 'Test Notification';
      const testBody = 'This is a test notification from The Social Runner app! Your adaptive preferences are working correctly.';
      
      // In a real mobile environment, this would send an actual push notification
      // For now, we'll just log the test and return success
      console.log(`Test notification for user ${userId}: ${testTitle} - ${testBody}`);

      res.json({ 
        message: "Test notification sent successfully",
        debug: {
          userId,
          title: testTitle,
          body: testBody,
          hasPushToken: !!user?.pushToken,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({ message: "Failed to send test notification" });
    }
  });

  // Notification Management Routes
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const unreadOnly = req.query.unread_only === 'true';
      
      const notifications = await storage.getUserNotifications(userId, unreadOnly);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      await storage.markNotificationAsRead(notificationId, userId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch("/api/notifications/mark-all-read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.get("/api/notifications/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.getUserNotificationSettings(userId);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      res.status(500).json({ message: "Failed to fetch notification settings" });
    }
  });

  app.patch("/api/notifications/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = req.body;
      
      await storage.updateNotificationSettings(userId, settings);
      res.json({ message: "Notification settings updated" });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({ message: "Failed to update notification settings" });
    }
  });

  // Register location-based routes
  registerLocationRoutes(app);

  // Initialize buddy matching service
  const buddyMatchingService = new BuddyMatchingService();

  // Buddy Matching API Routes
  app.get('/api/buddy/preferences', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await buddyMatchingService.getBuddyPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching buddy preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.patch('/api/buddy/preferences', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await buddyMatchingService.updateBuddyPreferences(userId, req.body);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating buddy preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  app.get('/api/buddy/matches', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const matches = await buddyMatchingService.findPotentialMatches(userId);
      res.json(matches);
    } catch (error) {
      console.error("Error finding buddy matches:", error);
      res.status(500).json({ message: "Failed to find matches" });
    }
  });

  app.post('/api/buddy/request', isAuthenticated, async (req: any, res: Response) => {
    try {
      const requesterId = req.user.claims.sub;
      const { recipientId } = req.body;
      
      if (!recipientId) {
        return res.status(400).json({ message: "Recipient ID is required" });
      }

      await buddyMatchingService.sendBuddyRequest(requesterId, recipientId);
      res.json({ message: "Buddy request sent successfully" });
    } catch (error: any) {
      console.error("Error sending buddy request:", error);
      res.status(400).json({ message: error.message || "Failed to send buddy request" });
    }
  });

  app.patch('/api/buddy/request/:matchId', isAuthenticated, async (req: any, res: Response) => {
    try {
      const matchId = parseInt(req.params.matchId);
      const { status } = req.body;
      
      if (!["accepted", "declined"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      await buddyMatchingService.respondToBuddyRequest(matchId, status);
      res.json({ message: "Response recorded successfully" });
    } catch (error) {
      console.error("Error responding to buddy request:", error);
      res.status(500).json({ message: "Failed to respond to request" });
    }
  });

  app.get('/api/buddy/connections', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const connections = await buddyMatchingService.getBuddyConnections(userId);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching buddy connections:", error);
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  // Strava Club Sync Routes
  app.post('/api/strava/club-sync', isAuthenticated, async (req: any, res) => {
    try {
      const { clubId, clubName, syncIntervalHours = 24 } = req.body;
      
      if (!clubId || !clubName) {
        return res.status(400).json({ message: "Club ID and name are required" });
      }

      const syncId = await stravaClubSyncService.addClubSync(clubId, clubName, syncIntervalHours);
      res.json({ syncId, message: "Club sync added successfully" });
    } catch (error) {
      console.error("Error adding club sync:", error);
      res.status(500).json({ message: "Failed to add club sync" });
    }
  });

  app.get('/api/strava/club-syncs', isAuthenticated, async (req: any, res) => {
    try {
      const clubSyncs = await stravaClubSyncService.getActiveClubSyncs();
      res.json(clubSyncs);
    } catch (error) {
      console.error("Error fetching club syncs:", error);
      res.status(500).json({ message: "Failed to fetch club syncs" });
    }
  });

  app.post('/api/strava/sync-club/:syncId', isAuthenticated, async (req: any, res) => {
    try {
      const { syncId } = req.params;
      const userId = req.user.claims.sub;
      
      // Get user's Strava access token
      const user = await storage.getUser(userId);
      if (!user?.stravaAccessToken) {
        return res.status(400).json({ message: "Strava authentication required" });
      }

      const result = await stravaClubSyncService.syncClubEvents(syncId, user.stravaAccessToken);
      res.json(result);
    } catch (error) {
      console.error("Error syncing club events:", error);
      res.status(500).json({ message: "Failed to sync club events" });
    }
  });

  app.post('/api/strava/sync-all-clubs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user's Strava access token
      const user = await storage.getUser(userId);
      if (!user?.stravaAccessToken) {
        return res.status(400).json({ message: "Strava authentication required" });
      }

      const result = await stravaClubSyncService.syncAllActiveClubs(user.stravaAccessToken);
      res.json(result);
    } catch (error) {
      console.error("Error syncing all clubs:", error);
      res.status(500).json({ message: "Failed to sync all clubs" });
    }
  });

  app.delete('/api/strava/club-sync/:syncId', isAuthenticated, async (req: any, res) => {
    try {
      const { syncId } = req.params;
      const success = await stravaClubSyncService.removeClubSync(syncId);
      
      if (success) {
        res.json({ message: "Club sync removed successfully" });
      } else {
        res.status(404).json({ message: "Club sync not found" });
      }
    } catch (error) {
      console.error("Error removing club sync:", error);
      res.status(500).json({ message: "Failed to remove club sync" });
    }
  });

  // News API routes
  app.get('/api/news', async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      
      const articles = await storage.getNewsArticles(limit, offset);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching news articles:", error);
      res.status(500).json({ message: "Failed to fetch news articles" });
    }
  });

  app.get('/api/news/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const article = await storage.getNewsArticleBySlug(slug);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      // Increment view count
      await storage.incrementArticleViews(article.id);
      res.json(article);
    } catch (error) {
      console.error("Error fetching news article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Event Reaction API endpoints
  app.post("/api/events/:id/reactions", isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { emoji } = req.body;

      if (!emoji || typeof emoji !== 'string' || emoji.length > 10) {
        return res.status(400).json({ message: "Valid emoji is required" });
      }

      await storage.addEventReaction(eventId, userId, emoji);
      const reactions = await storage.getEventReactions(eventId, userId);
      res.json({ reactions });
    } catch (error) {
      console.error("Error adding event reaction:", error);
      res.status(500).json({ message: "Failed to add reaction" });
    }
  });

  app.delete("/api/events/:id/reactions/:emoji", isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const emoji = decodeURIComponent(req.params.emoji);

      await storage.removeEventReaction(eventId, userId, emoji);
      const reactions = await storage.getEventReactions(eventId, userId);
      res.json({ reactions });
    } catch (error) {
      console.error("Error removing event reaction:", error);
      res.status(500).json({ message: "Failed to remove reaction" });
    }
  });

  app.get("/api/events/:id/reactions", async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user?.claims?.sub;
      const reactions = await storage.getEventReactions(eventId, userId);
      res.json({ reactions });
    } catch (error) {
      console.error("Error fetching event reactions:", error);
      res.status(500).json({ message: "Failed to fetch reactions" });
    }
  });

  // Simple logout route that clears session and redirects to home
  app.get('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.redirect('/'); // Redirect to home page
    });
  });

  // Progress tracking routes (public for testing)
  app.get("/api/stats/:userId", getUserStats);
  app.get("/api/progress/:userId", getUserProgress);
  app.get("/api/achievements/:userId", getUserAchievements);
  app.patch("/api/progress/:goalId", updateProgress);

  // Goals routes
  app.get("/api/goals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goals = await storage.getUserGoals(userId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goalData = { ...req.body, userId };
      
      const goal = await storage.createUserGoal(goalData);
      res.status(201).json(goal);
    } catch (error) {
      console.error("Error creating goal:", error);
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  app.patch("/api/goals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const updates = req.body;
      
      const goal = await storage.updateUserGoal(goalId, updates);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.json(goal);
    } catch (error) {
      console.error("Error updating goal:", error);
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const success = await storage.deleteUserGoal(goalId, userId);
      if (!success) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.json({ message: "Goal deleted successfully" });
    } catch (error) {
      console.error("Error deleting goal:", error);
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Training partners search route
  app.get("/api/training-partners", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { distance, difficulty } = req.query;
      
      const partners = await storage.findUsersWithSimilarGoals(
        userId,
        distance as string,
        difficulty as string
      );
      
      res.json(partners);
    } catch (error) {
      console.error("Error finding training partners:", error);
      res.status(500).json({ message: "Failed to find training partners" });
    }
  });

  // Training Plans routes
  app.get("/api/training-plans", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const plans = await storage.getUserTrainingPlans(userId);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching training plans:", error);
      res.status(500).json({ message: "Failed to fetch training plans" });
    }
  });

  app.post("/api/training-plans", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wizardData = req.body;
      
      // Import the training plan generator
      console.log("Importing training plan generator...");
      const trainingPlanModule = await import('./trainingPlanGenerator');
      console.log("Module imported:", Object.keys(trainingPlanModule));
      const { generateTrainingPlan, calculatePlanName } = trainingPlanModule;
      
      // Transform wizard data to generator input
      const generatorInput = {
        goal: {
          type: wizardData.goal?.objective || "general_fitness",
          raceType: wizardData.goal?.raceType,
          raceDate: wizardData.goal?.raceDate,
          targetDistance: wizardData.goal?.targetDistance
        },
        fitness: {
          currentLevel: wizardData.fitness?.currentLevel || "beginner",
          weeklyDistance: parseInt(wizardData.fitness?.weeklyDistance) || 10,
          longestRun: parseInt(wizardData.fitness?.longestRun) || 5,
          experience: wizardData.fitness?.experience || "new"
        },
        preferences: {
          daysPerWeek: parseInt(wizardData.preferences?.daysPerWeek) || 3,
          preferredDays: wizardData.preferences?.preferredDays || ["tuesday", "thursday", "saturday"],
          timeAvailable: wizardData.preferences?.timePerSession || "45min",
          location: wizardData.preferences?.location || "outdoor",
          adaptToPace: wizardData.preferences?.adaptToPace || true
        },
        schedule: {
          duration: parseInt(wizardData.schedule?.duration) || 12,
          startDate: wizardData.schedule?.startDate || new Date().toISOString().split('T')[0]
        }
      };
      
      // Generate the detailed weekly schedule
      console.log("About to generate training plan with input:", JSON.stringify(generatorInput, null, 2));
      
      let weeklySchedule, planName;
      try {
        weeklySchedule = generateTrainingPlan(generatorInput);
        planName = calculatePlanName(generatorInput);
        console.log("Generated plan name:", planName);
        console.log("Weekly schedule keys:", Object.keys(weeklySchedule));
      } catch (error) {
        console.error("Error generating training plan:", error);
        throw error;
      }
      
      // Calculate end date
      const startDate = new Date(generatorInput.schedule.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (generatorInput.schedule.duration * 7));
      
      // Ensure we have a valid plan name
      const finalPlanName = planName || `${generatorInput.goal.type || 'Custom'} Training Plan (${generatorInput.schedule.duration} weeks)`;
      console.log("Final plan name:", finalPlanName);
      
      // Create the training plan with generated schedule
      const planData = {
        userId,
        planName: finalPlanName,
        planType: generatorInput.goal.raceType || generatorInput.goal.type,
        duration: generatorInput.schedule.duration,
        startDate: generatorInput.schedule.startDate,
        endDate: endDate.toISOString().split('T')[0],
        currentWeek: 1,
        status: "active",
        weeklySchedule,
        preferences: {
          daysPerWeek: generatorInput.preferences.daysPerWeek,
          preferredDays: generatorInput.preferences.preferredDays,
          maxDistancePerWeek: generatorInput.fitness.weeklyDistance * 2,
          restDays: ["sunday", "wednesday"].filter(day => !generatorInput.preferences.preferredDays.includes(day)),
          focusAreas: [],
          adaptToFitness: generatorInput.preferences.adaptToPace
        },
        progressData: {
          completedWeeks: 0,
          totalRuns: 0,
          totalDistance: 0,
          averagePace: "0:00",
          missedSessions: 0,
          improvements: []
        }
      };
      
      const plan = await storage.createTrainingPlan(planData);
      res.status(201).json(plan);
    } catch (error) {
      console.error("Error creating training plan:", error);
      res.status(500).json({ message: "Failed to create training plan" });
    }
  });

  function getfokusAreas(goalType: string): string[] {
    switch (goalType) {
      case "race_prep":
        return ["endurance", "speed", "recovery"];
      case "fitness_improvement":
        return ["endurance", "strength"];
      case "weight_loss":
        return ["endurance", "recovery"];
      default:
        return ["endurance"];
    }
  }

  // Get all workouts for active training plan (for calendar sync)
  app.get("/api/training-plans/all-workouts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const plans = await storage.getUserTrainingPlans(userId);
      const activePlan = plans.find(plan => plan.status === "active");
      
      if (!activePlan) {
        return res.json([]);
      }
      
      const startDate = new Date(activePlan.startDate);
      const allWorkouts: any[] = [];
      
      // Generate all workouts across all weeks
      Object.keys(activePlan.weeklySchedule).forEach(weekKey => {
        const weekNum = parseInt(weekKey);
        const weekData = activePlan.weeklySchedule[weekNum];
        const weekStartDate = new Date(startDate);
        weekStartDate.setDate(startDate.getDate() + ((weekNum - 1) * 7));
        
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach((day, index) => {
          const workout = weekData[day as keyof typeof weekData];
          if (workout && workout.type !== 'rest') {
            const workoutDate = new Date(weekStartDate);
            workoutDate.setDate(weekStartDate.getDate() + index);
            
            allWorkouts.push({
              id: `${activePlan.id}_${weekNum}_${day}`,
              planId: activePlan.id,
              week: weekNum,
              day,
              date: workoutDate.toISOString().split('T')[0],
              originalIndex: index,
              ...workout
            });
          }
        });
      });
      
      res.json(allWorkouts);
    } catch (error) {
      console.error("Error fetching all workouts:", error);
      res.status(500).json({ message: "Failed to fetch all workouts" });
    }
  });

  // Get current week's workouts for active training plan
  app.get("/api/training-plans/current-week", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const plans = await storage.getUserTrainingPlans(userId);
      const activePlan = plans.find(plan => plan.status === "active");
      
      if (!activePlan) {
        return res.json([]);
      }
      
      const currentWeek = activePlan.currentWeek || 1;
      const weekData = activePlan.weeklySchedule[currentWeek];
      
      if (!weekData) {
        return res.json([]);
      }
      
      // Convert week data to array format with dates
      const startDate = new Date(activePlan.startDate);
      const weekStartDate = new Date(startDate);
      weekStartDate.setDate(startDate.getDate() + ((currentWeek - 1) * 7));
      
      const workouts: any[] = [];
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      days.forEach((day, index) => {
        const workout = weekData[day as keyof typeof weekData];
        if (workout && typeof workout === 'object') {
          const workoutDate = new Date(weekStartDate);
          workoutDate.setDate(weekStartDate.getDate() + index);
          
          workouts.push({
            id: `${activePlan.id}_${currentWeek}_${day}`,
            planId: activePlan.id,
            week: currentWeek,
            day,
            date: workoutDate.toISOString().split('T')[0],
            ...workout
          });
        }
      });
      
      res.json(workouts);
    } catch (error) {
      console.error("Error fetching current week workouts:", error);
      res.status(500).json({ message: "Failed to fetch current week workouts" });
    }
  });

  // Mark workout as completed
  app.patch("/api/training-plans/:planId/workouts/:workoutIndex", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const planId = parseInt(req.params.planId);
      const workoutIndex = parseInt(req.params.workoutIndex);
      const { completed, notes } = req.body;
      
      const plans = await storage.getUserTrainingPlans(userId);
      const plan = plans.find(p => p.id === planId);
      
      if (!plan) {
        return res.status(404).json({ message: "Training plan not found" });
      }
      
      // Update the specific workout in the weekly schedule
      const currentWeek = plan.currentWeek || 1;
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const day = days[workoutIndex];
      
      if (plan.weeklySchedule[currentWeek] && plan.weeklySchedule[currentWeek][day]) {
        plan.weeklySchedule[currentWeek][day].completed = completed;
        if (notes) {
          plan.weeklySchedule[currentWeek][day].notes = notes;
        }
        
        // Update the plan in storage
        await storage.updateTrainingPlan(planId, {
          weeklySchedule: plan.weeklySchedule,
          progressData: {
            ...plan.progressData,
            totalRuns: plan.progressData.totalRuns + (completed ? 1 : -1)
          }
        });
        
        res.json({ message: "Workout updated successfully" });
      } else {
        res.status(404).json({ message: "Workout not found" });
      }
    } catch (error) {
      console.error("Error updating workout:", error);
      res.status(500).json({ message: "Failed to update workout" });
    }
  });

  // Runclub API endpoints
  app.get('/api/runclubs', async (req, res) => {
    try {
      const runclubs = await storage.getAllRunclubs();
      res.json(runclubs);
    } catch (error) {
      console.error("Error fetching runclubs:", error);
      res.status(500).json({ message: "Failed to fetch runclubs" });
    }
  });

  app.get('/api/runclubs/search/location', async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = parseFloat(req.query.radius as string) || 10;

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ message: "Valid latitude and longitude are required" });
      }

      const runclubs = await storage.searchRunclubsByLocation(lat, lng, radius);
      res.json(runclubs);
    } catch (error) {
      console.error("Error searching runclubs by location:", error);
      res.status(500).json({ message: "Failed to search runclubs" });
    }
  });

  app.get('/api/runclubs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const runclub = await storage.getRunclubById(id);
      
      if (!runclub) {
        return res.status(404).json({ message: "Runclub not found" });
      }
      
      res.json(runclub);
    } catch (error) {
      console.error("Error fetching runclub:", error);
      res.status(500).json({ message: "Failed to fetch runclub" });
    }
  });

  app.post('/api/runclubs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const runclubData = insertRunclubSchema.parse(req.body);
      
      const newRunclub = await storage.createRunclub(runclubData, userId);
      res.status(201).json(newRunclub);
    } catch (error) {
      console.error("Error creating runclub:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid runclub data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create runclub" });
    }
  });

  app.put('/api/runclubs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const updates = req.body;
      
      // Check if user is the creator or admin
      const runclub = await storage.getRunclubById(id);
      if (!runclub || runclub.createdBy !== userId) {
        return res.status(403).json({ message: "Not authorized to update this runclub" });
      }
      
      const updatedRunclub = await storage.updateRunclub(id, updates);
      if (!updatedRunclub) {
        return res.status(404).json({ message: "Runclub not found" });
      }
      
      res.json(updatedRunclub);
    } catch (error) {
      console.error("Error updating runclub:", error);
      res.status(500).json({ message: "Failed to update runclub" });
    }
  });

  app.delete('/api/runclubs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const success = await storage.deleteRunclub(id, userId);
      if (!success) {
        return res.status(404).json({ message: "Runclub not found or not authorized" });
      }
      
      res.json({ message: "Runclub deleted successfully" });
    } catch (error) {
      console.error("Error deleting runclub:", error);
      res.status(500).json({ message: "Failed to delete runclub" });
    }
  });

  app.post('/api/runclubs/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const runclubId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const membership = await storage.joinRunclub(runclubId, userId);
      res.status(201).json(membership);
    } catch (error) {
      console.error("Error joining runclub:", error);
      res.status(500).json({ message: "Failed to join runclub" });
    }
  });

  app.delete('/api/runclubs/:id/leave', isAuthenticated, async (req: any, res) => {
    try {
      const runclubId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const success = await storage.leaveRunclub(runclubId, userId);
      if (!success) {
        return res.status(404).json({ message: "Membership not found" });
      }
      
      res.json({ message: "Left runclub successfully" });
    } catch (error) {
      console.error("Error leaving runclub:", error);
      res.status(500).json({ message: "Failed to leave runclub" });
    }
  });

  app.get('/api/runclubs/:id/members', async (req, res) => {
    try {
      const runclubId = parseInt(req.params.id);
      const members = await storage.getRunclubMembers(runclubId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching runclub members:", error);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.get('/api/user/runclubs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userRunclubs = await storage.getUserRunclubs(userId);
      res.json(userRunclubs);
    } catch (error) {
      console.error("Error fetching user runclubs:", error);
      res.status(500).json({ message: "Failed to fetch user runclubs" });
    }
  });

  // Event comments routes
  app.get("/api/events/:id/comments", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      if (!eventId || isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const comments = await storage.getEventComments(eventId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching event comments:", error);
      res.status(500).json({ message: "Failed to fetch event comments" });
    }
  });

  app.post("/api/events/:id/comments", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = (req as AuthenticatedRequest).user.claims.sub;
      const { content, isQuickComment } = req.body;
      
      if (!eventId || isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Comment content is required" });
      }

      if (content.length > 500) {
        return res.status(400).json({ message: "Comment too long (max 500 characters)" });
      }

      const comment = await storage.addEventComment(eventId, userId, content.trim(), isQuickComment);
      
      // Get the comment with user data for response
      const comments = await storage.getEventComments(eventId);
      const newComment = comments.find(c => c.id === comment.id);
      
      res.status(201).json(newComment);
    } catch (error) {
      console.error("Error adding event comment:", error);
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  app.put("/api/comments/:id", isAuthenticated, async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      const userId = (req as AuthenticatedRequest).user.claims.sub;
      const { content } = req.body;
      
      if (!commentId || isNaN(commentId)) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Comment content is required" });
      }

      if (content.length > 500) {
        return res.status(400).json({ message: "Comment too long (max 500 characters)" });
      }

      const comment = await storage.updateEventComment(commentId, userId, content.trim());
      
      if (!comment) {
        return res.status(404).json({ message: "Comment not found or unauthorized" });
      }

      res.json(comment);
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({ message: "Failed to update comment" });
    }
  });

  app.delete("/api/comments/:id", isAuthenticated, async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      const userId = (req as AuthenticatedRequest).user.claims.sub;
      
      if (!commentId || isNaN(commentId)) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }

      const deleted = await storage.deleteEventComment(commentId, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Comment not found or unauthorized" });
      }

      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
