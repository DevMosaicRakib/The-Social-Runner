import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bell, Clock, CheckCircle, Settings, Home } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import NotificationSettings from "@/components/notification-settings";
import { useState } from "react";
import { Link } from "wouter";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  eventId?: number;
}

export default function NotificationsPage() {
  const [showSettings, setShowSettings] = useState(false);

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    retry: false,
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event_reminder':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'attendance_reminder':
        return <Bell className="h-5 w-5 text-orange-500" />;
      case 'attendance_update':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'event_reminder':
        return 'Event Reminder';
      case 'attendance_reminder':
        return 'Attendance Reminder';
      case 'attendance_update':
        return 'Attendance Update';
      case 'event_update':
        return 'Event Update';
      default:
        return 'Notification';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (showSettings) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Return Home
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setShowSettings(false)}
              >
                Back to Notifications
              </Button>
            </div>
          </div>
          <NotificationSettings />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {notifications.filter(n => !n.isRead).length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {notifications.filter(n => !n.isRead).length} unread
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Return Home
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                <p className="text-gray-500">
                  When you join events or receive updates, they'll appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <Card key={notification.id} className={`${!notification.isRead ? 'ring-2 ring-orange-500/20 bg-orange-50/30' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Badge variant="outline" className="text-xs">
                            {getNotificationTypeLabel(notification.type)}
                          </Badge>
                          <span>
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}