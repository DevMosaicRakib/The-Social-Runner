import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Bell, BellOff, Mail, Clock, AlertCircle } from "lucide-react";

interface NotificationSettings {
  emailReminders: boolean;
  browserNotifications: boolean;
  reminderHours: number;
  attendanceReminders: boolean;
  eventUpdates: boolean;
}

export default function NotificationSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<NotificationSettings>({
    emailReminders: true,
    browserNotifications: true,
    reminderHours: 24,
    attendanceReminders: true,
    eventUpdates: true,
  });

  const { data: userSettings, isLoading } = useQuery({
    queryKey: ["/api/notifications/settings"],
    retry: false,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<NotificationSettings>) => {
      await apiRequest("PATCH", "/api/notifications/settings", updatedSettings);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/settings"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update notification settings.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (userSettings) {
      setSettings(prevSettings => ({ ...prevSettings, ...userSettings }));
    }
  }, [userSettings]);

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean | number) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    updateSettingsMutation.mutate({ [key]: value });
  };

  const requestBrowserNotifications = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        handleSettingChange("browserNotifications", true);
        toast({
          title: "Browser Notifications Enabled",
          description: "You'll now receive browser notifications for running events.",
        });
      } else {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Reminders
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive email notifications for event reminders and updates
            </p>
          </div>
          <Switch
            checked={settings.emailReminders}
            onCheckedChange={(checked) => handleSettingChange("emailReminders", checked)}
            disabled={updateSettingsMutation.isPending}
          />
        </div>

        {/* Browser Notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Browser Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Show desktop notifications for important events
            </p>
          </div>
          {settings.browserNotifications ? (
            <Switch
              checked={settings.browserNotifications}
              onCheckedChange={(checked) => handleSettingChange("browserNotifications", checked)}
              disabled={updateSettingsMutation.isPending}
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={requestBrowserNotifications}
              disabled={updateSettingsMutation.isPending}
            >
              Enable
            </Button>
          )}
        </div>

        {/* Reminder Timing */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Reminder Timing
          </Label>
          <p className="text-sm text-muted-foreground">
            How far in advance to remind you about events
          </p>
          <Select
            value={settings.reminderHours.toString()}
            onValueChange={(value) => handleSettingChange("reminderHours", parseInt(value))}
            disabled={updateSettingsMutation.isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 hour before</SelectItem>
              <SelectItem value="2">2 hours before</SelectItem>
              <SelectItem value="6">6 hours before</SelectItem>
              <SelectItem value="12">12 hours before</SelectItem>
              <SelectItem value="24">24 hours before</SelectItem>
              <SelectItem value="48">48 hours before</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Attendance Reminders */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Attendance Reminders</Label>
            <p className="text-sm text-muted-foreground">
              Get reminders to confirm your attendance for events
            </p>
          </div>
          <Switch
            checked={settings.attendanceReminders}
            onCheckedChange={(checked) => handleSettingChange("attendanceReminders", checked)}
            disabled={updateSettingsMutation.isPending}
          />
        </div>

        {/* Event Updates */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Event Updates</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications when event details change
            </p>
          </div>
          <Switch
            checked={settings.eventUpdates}
            onCheckedChange={(checked) => handleSettingChange("eventUpdates", checked)}
            disabled={updateSettingsMutation.isPending}
          />
        </div>

        {/* Turn Off All Notifications */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              const allOff = {
                emailReminders: false,
                browserNotifications: false,
                attendanceReminders: false,
                eventUpdates: false,
              };
              setSettings(prev => ({ ...prev, ...allOff }));
              updateSettingsMutation.mutate(allOff);
            }}
            disabled={updateSettingsMutation.isPending}
            className="w-full flex items-center gap-2"
          >
            <BellOff className="h-4 w-4" />
            Turn Off All Notifications
          </Button>
        </div>

        {updateSettingsMutation.isPending && (
          <div className="text-center text-sm text-muted-foreground">
            Saving changes...
          </div>
        )}
      </CardContent>
    </Card>
  );
}