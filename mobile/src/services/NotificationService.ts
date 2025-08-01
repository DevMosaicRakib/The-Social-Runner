import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BACKGROUND_NOTIFICATION_TASK = 'background-notification-task';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: any;
  channelId?: string;
  sound?: boolean;
  badge?: number;
  priority?: 'default' | 'high' | 'max';
  categoryId?: string;
}

export interface EventNotification extends NotificationPayload {
  eventId: string;
  eventType: 'reminder' | 'update' | 'cancellation' | 'new_participant';
  scheduledTime?: Date;
}

export interface SocialNotification extends NotificationPayload {
  userId: string;
  socialType: 'friend_request' | 'message' | 'reaction' | 'mention';
}

export interface AchievementNotification extends NotificationPayload {
  achievementId: string;
  achievementType: 'distance' | 'streak' | 'events' | 'milestone';
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data;
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: data.sound !== false,
      shouldSetBadge: data.badge !== false,
    };
  },
});

// Background task for checking notifications
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  try {
    // Check for pending notifications from server
    const userId = await AsyncStorage.getItem('userId');
    const pushToken = await AsyncStorage.getItem('pushToken');
    
    if (!userId || !pushToken) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // In a real app, you'd fetch from your API here
    // const response = await fetch(`${API_BASE_URL}/notifications/pending/${userId}`);
    // const pendingNotifications = await response.json();
    
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.log('Background notification task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;
  private pushToken: string | null = null;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Setup notification categories for iOS
      if (Platform.OS === 'ios') {
        await this.setupNotificationCategories();
      }

      // Register background task
      await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
        minimumInterval: 15 * 60 * 1000, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });

      this.isInitialized = true;
    } catch (error) {
      console.log('Failed to initialize notification service:', error);
    }
  }

  private async setupNotificationCategories(): Promise<void> {
    await Notifications.setNotificationCategoryAsync('event_reminder', [
      {
        identifier: 'view_event',
        buttonTitle: 'View Event',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'snooze',
        buttonTitle: 'Remind Later',
        options: { opensAppToForeground: false },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('social_interaction', [
      {
        identifier: 'reply',
        buttonTitle: 'Reply',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'view_profile',
        buttonTitle: 'View Profile',
        options: { opensAppToForeground: true },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('achievement', [
      {
        identifier: 'share',
        buttonTitle: 'Share',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'view_progress',
        buttonTitle: 'View Progress',
        options: { opensAppToForeground: true },
      },
    ]);
  }

  async setPushToken(token: string): Promise<void> {
    this.pushToken = token;
    await AsyncStorage.setItem('pushToken', token);
  }

  async scheduleEventReminder(notification: EventNotification): Promise<string> {
    const trigger = notification.scheduledTime 
      ? { date: notification.scheduledTime }
      : null;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: {
          ...notification.data,
          eventId: notification.eventId,
          type: 'event_reminder',
          url: `/events/${notification.eventId}`,
        },
        sound: notification.sound !== false ? 'default' : undefined,
        badge: notification.badge,
        categoryIdentifier: 'event_reminder',
      },
      trigger,
    });

    // Store notification ID for later cancellation if needed
    await AsyncStorage.setItem(
      `notification_${notification.eventId}`, 
      notificationId
    );

    return notificationId;
  }

  async showSocialNotification(notification: SocialNotification): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: {
          ...notification.data,
          userId: notification.userId,
          type: 'social',
          url: notification.socialType === 'friend_request' 
            ? '/profile/friends'
            : `/profile/${notification.userId}`,
        },
        sound: notification.sound !== false ? 'default' : undefined,
        categoryIdentifier: 'social_interaction',
      },
      trigger: null, // Show immediately
    });
  }

  async showAchievementNotification(notification: AchievementNotification): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: {
          ...notification.data,
          achievementId: notification.achievementId,
          type: 'achievement',
          url: '/profile/progress',
        },
        sound: notification.sound !== false ? 'default' : undefined,
        categoryIdentifier: 'achievement',
      },
      trigger: null,
    });
  }

  async cancelEventNotification(eventId: string): Promise<void> {
    const notificationId = await AsyncStorage.getItem(`notification_${eventId}`);
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await AsyncStorage.removeItem(`notification_${eventId}`);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  async getNotificationPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.getPermissionsAsync();
  }

  async requestPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
        allowCriticalAlerts: false,
        provideAppNotificationSettings: true,
        allowProvisional: false,
      },
    });
  }

  // Helper methods for common notification scenarios
  async notifyEventStartingSoon(eventTitle: string, eventId: string, minutesUntil: number): Promise<void> {
    await this.scheduleEventReminder({
      title: 'Event Starting Soon! 🏃‍♂️',
      body: `${eventTitle} starts in ${minutesUntil} minutes`,
      eventId,
      eventType: 'reminder',
      data: { minutesUntil },
      channelId: 'events',
      priority: 'high'
    });
  }

  async notifyNewParticipant(eventTitle: string, eventId: string, participantName: string): Promise<void> {
    await this.scheduleEventReminder({
      title: 'New Participant Joined!',
      body: `${participantName} joined ${eventTitle}`,
      eventId,
      eventType: 'new_participant',
      data: { participantName },
      channelId: 'social',
      priority: 'default'
    });
  }

  async notifyEventCancelled(eventTitle: string, eventId: string): Promise<void> {
    await this.scheduleEventReminder({
      title: 'Event Cancelled',
      body: `${eventTitle} has been cancelled by the organiser`,
      eventId,
      eventType: 'cancellation',
      data: { cancelled: true },
      channelId: 'events',
      priority: 'high'
    });
  }

  async notifyAchievementUnlocked(achievementTitle: string, achievementId: string, description: string): Promise<void> {
    await this.showAchievementNotification({
      title: '🏆 Achievement Unlocked!',
      body: `${achievementTitle}: ${description}`,
      achievementId,
      achievementType: 'milestone',
      data: { unlocked: true },
      priority: 'high'
    });
  }

  async notifyStreakMilestone(days: number): Promise<void> {
    await this.showAchievementNotification({
      title: `🔥 ${days} Day Streak!`,
      body: `You've been consistently active for ${days} days. Keep it up!`,
      achievementId: `streak_${days}`,
      achievementType: 'streak',
      data: { streakDays: days },
      priority: 'high'
    });
  }

  async notifyFriendRequest(senderName: string, senderId: string): Promise<void> {
    await this.showSocialNotification({
      title: 'New Friend Request',
      body: `${senderName} wants to connect with you`,
      userId: senderId,
      socialType: 'friend_request',
      data: { senderName },
      priority: 'default'
    });
  }

  async scheduleWeeklyRunReminder(dayOfWeek: number, hour: number): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to Run! 🏃‍♀️',
        body: 'Your weekly running session is coming up. Check out local events!',
        data: { type: 'weekly_reminder', url: '/' },
        sound: 'default',
      },
      trigger: {
        weekday: dayOfWeek,
        hour: hour,
        minute: 0,
        repeats: true,
      },
    });
  }
}

export default NotificationService;