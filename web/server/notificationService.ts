import { Expo } from 'expo-server-sdk';
import { storage } from './storage';

// Initialize Expo SDK
const expo = new Expo();

export interface PushNotificationData {
  userId: string;
  title: string;
  body: string;
  data?: any;
  sound?: 'default' | null;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
  categoryId?: string;
}

export interface EventNotificationData extends PushNotificationData {
  eventId: string;
  eventType: 'reminder' | 'update' | 'cancellation' | 'new_participant';
}

export interface SocialNotificationData extends PushNotificationData {
  fromUserId: string;
  socialType: 'friend_request' | 'message' | 'reaction' | 'mention';
}

export interface AchievementNotificationData extends PushNotificationData {
  achievementId: string;
  achievementType: 'distance' | 'streak' | 'events' | 'milestone';
}

class NotificationService {
  private static instance: NotificationService;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async sendPushNotification(data: PushNotificationData): Promise<boolean> {
    try {
      // Get user's push token from storage
      const user = await storage.getUser(data.userId);
      if (!user?.pushToken) {
        console.log(`No push token found for user ${data.userId}`);
        return false;
      }

      // Check if push token is valid
      if (!Expo.isExpoPushToken(user.pushToken)) {
        console.log(`Invalid push token for user ${data.userId}:`, user.pushToken);
        return false;
      }

      // Create the push message
      const message = {
        to: user.pushToken,
        sound: data.sound || 'default',
        title: data.title,
        body: data.body,
        data: {
          ...data.data,
          userId: data.userId,
          timestamp: new Date().toISOString(),
        },
        badge: data.badge,
        priority: data.priority || 'default',
        channelId: data.channelId,
        categoryId: data.categoryId,
      };

      // Send the notification
      const chunks = expo.chunkPushNotifications([message]);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending push notification chunk:', error);
        }
      }

      // Handle tickets and errors
      for (const ticket of tickets) {
        if (ticket.status === 'error') {
          console.error('Push notification error:', ticket.message);
          
          // Handle invalid tokens
          if (ticket.details?.error === 'DeviceNotRegistered') {
            await this.handleInvalidToken(data.userId, user.pushToken);
          }
        }
      }

      return tickets.some(ticket => ticket.status === 'ok');
    } catch (error) {
      console.error('Error in sendPushNotification:', error);
      return false;
    }
  }

  private async handleInvalidToken(userId: string, invalidToken: string): Promise<void> {
    try {
      // Remove invalid token from user record
      await storage.updateUserPushToken(userId, null);
      console.log(`Removed invalid push token for user ${userId}`);
    } catch (error) {
      console.error('Error removing invalid token:', error);
    }
  }

  async sendEventReminder(data: EventNotificationData): Promise<boolean> {
    return await this.sendPushNotification({
      ...data,
      channelId: 'events',
      categoryId: 'event_reminder',
      data: {
        ...data.data,
        eventId: data.eventId,
        type: 'event_reminder',
        url: `/events/${data.eventId}`,
      },
    });
  }

  async sendEventUpdate(data: EventNotificationData): Promise<boolean> {
    return await this.sendPushNotification({
      ...data,
      channelId: 'events',
      categoryId: 'event_update',
      data: {
        ...data.data,
        eventId: data.eventId,
        type: 'event_update',
        url: `/events/${data.eventId}`,
      },
    });
  }

  async sendSocialNotification(data: SocialNotificationData): Promise<boolean> {
    return await this.sendPushNotification({
      ...data,
      channelId: 'social',
      categoryId: 'social_interaction',
      data: {
        ...data.data,
        fromUserId: data.fromUserId,
        type: 'social',
        url: data.socialType === 'friend_request' 
          ? '/profile/friends'
          : `/profile/${data.fromUserId}`,
      },
    });
  }

  async sendAchievementNotification(data: AchievementNotificationData): Promise<boolean> {
    return await this.sendPushNotification({
      ...data,
      channelId: 'achievements',
      categoryId: 'achievement',
      priority: 'high',
      data: {
        ...data.data,
        achievementId: data.achievementId,
        type: 'achievement',
        url: '/profile/progress',
      },
    });
  }

  // Convenience methods for common scenarios
  async notifyEventStartingSoon(
    userId: string, 
    eventId: string, 
    eventTitle: string, 
    minutesUntil: number
  ): Promise<boolean> {
    return await this.sendEventReminder({
      userId,
      eventId,
      eventType: 'reminder',
      title: 'Event Starting Soon! 🏃‍♂️',
      body: `${eventTitle} starts in ${minutesUntil} minutes`,
      priority: 'high',
      data: { minutesUntil },
    });
  }

  async notifyNewParticipant(
    userId: string,
    eventId: string,
    eventTitle: string,
    participantName: string
  ): Promise<boolean> {
    return await this.sendEventUpdate({
      userId,
      eventId,
      eventType: 'new_participant',
      title: 'New Participant Joined!',
      body: `${participantName} joined ${eventTitle}`,
      data: { participantName },
    });
  }

  async notifyEventCancelled(
    userId: string,
    eventId: string,
    eventTitle: string
  ): Promise<boolean> {
    return await this.sendEventUpdate({
      userId,
      eventId,
      eventType: 'cancellation',
      title: 'Event Cancelled',
      body: `${eventTitle} has been cancelled by the organiser`,
      priority: 'high',
      data: { cancelled: true },
    });
  }

  async notifyAchievementUnlocked(
    userId: string,
    achievementId: string,
    achievementTitle: string,
    description: string
  ): Promise<boolean> {
    return await this.sendAchievementNotification({
      userId,
      achievementId,
      achievementType: 'milestone',
      title: '🏆 Achievement Unlocked!',
      body: `${achievementTitle}: ${description}`,
      priority: 'high',
      data: { unlocked: true },
    });
  }

  async notifyStreakMilestone(userId: string, days: number): Promise<boolean> {
    return await this.sendAchievementNotification({
      userId,
      achievementId: `streak_${days}`,
      achievementType: 'streak',
      title: `🔥 ${days} Day Streak!`,
      body: `You've been consistently active for ${days} days. Keep it up!`,
      priority: 'high',
      data: { streakDays: days },
    });
  }

  async notifyFriendRequest(
    userId: string,
    fromUserId: string,
    senderName: string
  ): Promise<boolean> {
    return await this.sendSocialNotification({
      userId,
      fromUserId,
      socialType: 'friend_request',
      title: 'New Friend Request',
      body: `${senderName} wants to connect with you`,
      data: { senderName },
    });
  }

  async notifyEventReaction(
    userId: string,
    fromUserId: string,
    eventTitle: string,
    reactionEmoji: string,
    reactorName: string
  ): Promise<boolean> {
    return await this.sendSocialNotification({
      userId,
      fromUserId,
      socialType: 'reaction',
      title: 'Someone reacted to your event',
      body: `${reactorName} reacted ${reactionEmoji} to ${eventTitle}`,
      data: { reactionEmoji, eventTitle },
    });
  }

  // Batch notification methods
  async sendBulkEventReminders(
    eventId: string,
    eventTitle: string,
    participantUserIds: string[],
    minutesUntil: number
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const promises = participantUserIds.map(async (userId) => {
      const result = await this.notifyEventStartingSoon(userId, eventId, eventTitle, minutesUntil);
      if (result) success++;
      else failed++;
    });

    await Promise.all(promises);
    return { success, failed };
  }

  async sendBulkNewParticipantNotifications(
    eventId: string,
    eventTitle: string,
    existingParticipants: string[],
    newParticipantName: string
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const promises = existingParticipants.map(async (userId) => {
      const result = await this.notifyNewParticipant(userId, eventId, eventTitle, newParticipantName);
      if (result) success++;
      else failed++;
    });

    await Promise.all(promises);
    return { success, failed };
  }
}

export const notificationService = NotificationService.getInstance();
export default notificationService;