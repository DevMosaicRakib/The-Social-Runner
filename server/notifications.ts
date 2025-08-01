import { db } from "./db";
import { notifications, userNotificationSettings, users, events, eventParticipants } from "@shared/schema";
import { eq, and, lt, isNull } from "drizzle-orm";
import { MailService } from '@sendgrid/mail';

// Initialize SendGrid if API key is available
let mailService: MailService | null = null;
if (process.env.SENDGRID_API_KEY) {
  mailService = new MailService();
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface NotificationService {
  createNotification(notification: {
    userId: string;
    eventId?: number;
    type: string;
    title: string;
    message: string;
    scheduledFor?: Date;
  }): Promise<void>;

  sendImmediateNotification(notification: {
    userId: string;
    eventId?: number;
    type: string;
    title: string;
    message: string;
  }): Promise<void>;

  scheduleEventReminders(eventId: number): Promise<void>;
  processPendingNotifications(): Promise<void>;
  getUserNotifications(userId: string, unreadOnly?: boolean): Promise<any[]>;
  markNotificationAsRead(notificationId: number, userId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  getUserNotificationSettings(userId: string): Promise<any>;
  updateNotificationSettings(userId: string, settings: any): Promise<void>;
}

export class DatabaseNotificationService implements NotificationService {
  async createNotification(notification: {
    userId: string;
    eventId?: number;
    type: string;
    title: string;
    message: string;
    scheduledFor?: Date;
  }): Promise<void> {
    await db.insert(notifications).values({
      userId: notification.userId,
      eventId: notification.eventId || null,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      scheduledFor: notification.scheduledFor || null,
    });
  }

  async sendImmediateNotification(notification: {
    userId: string;
    eventId?: number;
    type: string;
    title: string;
    message: string;
  }): Promise<void> {
    // Create notification record
    const [created] = await db.insert(notifications).values({
      userId: notification.userId,
      eventId: notification.eventId || null,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      scheduledFor: null,
      sentAt: new Date(),
    }).returning();

    // Get user and their notification settings
    const user = await db.select().from(users).where(eq(users.id, notification.userId));
    const settings = await this.getUserNotificationSettings(notification.userId);

    if (user[0] && settings.emailReminders && mailService) {
      await this.sendEmailNotification(user[0], notification);
    }
  }

  async scheduleEventReminders(eventId: number): Promise<void> {
    // Get event details
    const event = await db.select().from(events).where(eq(events.id, eventId));
    if (!event[0]) return;

    // Get all participants who are "attending" or "maybe"
    const participants = await db
      .select({
        userId: eventParticipants.userId,
        attendanceStatus: eventParticipants.attendanceStatus
      })
      .from(eventParticipants)
      .where(eq(eventParticipants.eventId, eventId));

    const eventDateTime = new Date(`${event[0].date} ${event[0].time}`);
    
    for (const participant of participants) {
      if (participant.attendanceStatus === 'not_attending') continue;

      const settings = await this.getUserNotificationSettings(participant.userId);
      const reminderTime = new Date(eventDateTime.getTime() - (settings.reminderHours * 60 * 60 * 1000));

      // Only schedule if reminder time is in the future
      if (reminderTime > new Date()) {
        await this.createNotification({
          userId: participant.userId,
          eventId: eventId,
          type: 'event_reminder',
          title: `Upcoming Run: ${event[0].title}`,
          message: `Don't forget about your ${event[0].distance} run at ${event[0].location} tomorrow at ${this.formatTime(event[0].time)}!`,
          scheduledFor: reminderTime
        });

        // Additional attendance confirmation reminder if status is "maybe"
        if (participant.attendanceStatus === 'maybe') {
          await this.createNotification({
            userId: participant.userId,
            eventId: eventId,
            type: 'attendance_reminder',
            title: `Confirm your attendance: ${event[0].title}`,
            message: `Please confirm if you'll be joining the ${event[0].distance} run at ${event[0].location}. Other runners are counting on you!`,
            scheduledFor: new Date(reminderTime.getTime() + (2 * 60 * 60 * 1000)) // 2 hours after first reminder
          });
        }
      }
    }
  }

  async processPendingNotifications(): Promise<void> {
    const pendingNotifications = await db
      .select({
        id: notifications.id,
        userId: notifications.userId,
        eventId: notifications.eventId,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
      })
      .from(notifications)
      .where(
        and(
          lt(notifications.scheduledFor, new Date()),
          isNull(notifications.sentAt)
        )
      );

    for (const notification of pendingNotifications) {
      const user = await db.select().from(users).where(eq(users.id, notification.userId));
      const settings = await this.getUserNotificationSettings(notification.userId);

      if (user[0] && settings.emailReminders && mailService) {
        await this.sendEmailNotification(user[0], {
          title: notification.title,
          message: notification.message,
          type: notification.type
        });
      }

      // Mark as sent
      await db
        .update(notifications)
        .set({ sentAt: new Date() })
        .where(eq(notifications.id, notification.id));
    }
  }

  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<any[]> {
    let query = db
      .select({
        id: notifications.id,
        eventId: notifications.eventId,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
        sentAt: notifications.sentAt,
      })
      .from(notifications)
      .where(eq(notifications.userId, userId));

    if (unreadOnly) {
      query = query.where(eq(notifications.isRead, false));
    }

    const results = await query.orderBy(notifications.createdAt);
    return results;
  }

  async markNotificationAsRead(notificationId: number, userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      );
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  async getUserNotificationSettings(userId: string): Promise<any> {
    const [settings] = await db
      .select()
      .from(userNotificationSettings)
      .where(eq(userNotificationSettings.userId, userId));

    if (!settings) {
      // Create default settings
      const [newSettings] = await db
        .insert(userNotificationSettings)
        .values({
          userId,
          emailReminders: true,
          browserNotifications: true,
          reminderHours: 24,
          attendanceReminders: true,
          eventUpdates: true,
        })
        .returning();
      
      return newSettings;
    }

    return settings;
  }

  async updateNotificationSettings(userId: string, settings: any): Promise<void> {
    await db
      .update(userNotificationSettings)
      .set({
        ...settings,
        updatedAt: new Date(),
      })
      .where(eq(userNotificationSettings.userId, userId));
  }

  private async sendEmailNotification(user: any, notification: { title: string; message: string; type: string }): Promise<void> {
    if (!mailService || !user.email) return;

    try {
      await mailService.send({
        to: user.email,
        from: 'noreply@socialrunner.app', // Replace with your verified sender
        subject: notification.title,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f97316; padding: 20px; color: white;">
              <h2 style="margin: 0;">🏃‍♂️ The Social Runner</h2>
            </div>
            <div style="padding: 20px; background: #f9fafb;">
              <h3 style="color: #1f2937;">${notification.title}</h3>
              <p style="color: #4b5563; line-height: 1.6;">${notification.message}</p>
              <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #f97316;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  Visit The Social Runner app to manage your running events and update your attendance status.
                </p>
              </div>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  private formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }
}

export const notificationService = new DatabaseNotificationService();