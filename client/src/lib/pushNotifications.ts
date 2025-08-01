import { apiRequest } from './queryClient';

export interface PushNotificationConfig {
  token: string;
  permission: string;
  platform: string;
}

export class PushNotificationManager {
  private static instance: PushNotificationManager;
  private config: PushNotificationConfig | null = null;
  private isInitialized = false;

  public static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  initialize(config: PushNotificationConfig): void {
    this.config = config;
    this.isInitialized = true;
    
    // Register token with server if we have permission
    if (config.permission === 'granted' && config.token) {
      this.registerToken(config.token);
    }
  }

  async registerToken(token: string): Promise<void> {
    if (!token) return;
    
    try {
      await apiRequest('/api/notifications/register-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pushToken: token })
      });
      
      // Token registered successfully
    } catch (error) {
      // Failed to register push token - error handled gracefully
    }
  }

  async unregisterToken(): Promise<void> {
    try {
      await apiRequest('/api/notifications/unregister-token', {
        method: 'DELETE'
      });
      
      // Token unregistered successfully
    } catch (error) {
      // Failed to unregister push token - error handled gracefully
    }
  }

  async sendTestNotification(title?: string, body?: string): Promise<boolean> {
    try {
      await apiRequest('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body })
      });
      
      return true;
    } catch (error) {
      // Failed to send test notification - error handled gracefully
      return false;
    }
  }

  getConfig(): PushNotificationConfig | null {
    return this.config;
  }

  isSupported(): boolean {
    return this.isInitialized && this.config !== null;
  }

  hasPermission(): boolean {
    return this.config?.permission === 'granted';
  }

  // Handle different types of notification interactions
  handleNotificationReceived(data: any): void {
    // Notification received - processing based on type
    
    // You can add custom logic here based on notification type
    switch (data.type) {
      case 'event_reminder':
        this.handleEventReminder(data);
        break;
      case 'social':
        this.handleSocialNotification(data);
        break;
      case 'achievement':
        this.handleAchievementNotification(data);
        break;
      default:
        // Unknown notification type - handled gracefully
    }
  }

  private handleEventReminder(data: any): void {
    // Navigate to event if URL is provided
    if (data.url && window.location.pathname !== data.url) {
      window.history.pushState({}, '', data.url);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  private handleSocialNotification(data: any): void {
    // Handle social notifications (friend requests, messages, etc.)
    if (data.url) {
      window.history.pushState({}, '', data.url);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  private handleAchievementNotification(data: any): void {
    // Show achievement celebration or navigate to progress page
    if (data.url) {
      window.history.pushState({}, '', data.url);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }
}

// Global instance
export const pushNotificationManager = PushNotificationManager.getInstance();

// Web app integration functions
declare global {
  interface Window {
    isMobileApp?: boolean;
    registerPushNotifications?: (userId: string) => void;
    showLocalNotification?: (title: string, body: string, data?: any) => void;
    pushNotificationManager?: PushNotificationManager;
  }
}

// Expose to global scope for mobile app integration
if (typeof window !== 'undefined') {
  window.pushNotificationManager = pushNotificationManager;
  
  // Listen for mobile app messages
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'push_token') {
      pushNotificationManager.initialize({
        token: event.data.token,
        permission: event.data.permission,
        platform: event.data.platform || 'web'
      });
    } else if (event.data?.type === 'notification_tap') {
      pushNotificationManager.handleNotificationReceived(event.data.data);
    }
  });
}

export default pushNotificationManager;