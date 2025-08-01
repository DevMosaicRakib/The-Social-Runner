import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calendar, 
  Download, 
  ExternalLink, 
  Smartphone, 
  CheckCircle, 
  Clock, 
  MapPin,
  Share2,
  Info,
  Copy,
  Mail
} from "lucide-react";

interface CalendarSyncProps {
  trainingPlanId: number;
  planName: string;
  className?: string;
}

interface CalendarSyncSummary {
  planName: string;
  totalWorkouts: number;
  weeklyWorkouts: number;
  duration: number;
  startDate: string;
  endDate: string;
  eventCount: number;
  syncOptions: {
    ical: boolean;
    google: boolean;
    outlook: boolean;
    apple: boolean;
    android: boolean;
  };
}

export default function CalendarSync({ trainingPlanId, planName, className }: CalendarSyncProps) {
  const [syncDialog, setSyncDialog] = useState(false);
  const [activeSync, setActiveSync] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch calendar sync summary
  const { data: syncSummary, isLoading } = useQuery<CalendarSyncSummary>({
    queryKey: [`/api/training-plans/${trainingPlanId}/calendar-sync`],
    enabled: !!trainingPlanId,
  });

  // Download iCal file mutation
  const downloadICalMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/training-plans/${trainingPlanId}/calendar/ical`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${planName.replace(/\s+/g, '_')}_training_plan.ics`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Calendar Downloaded",
        description: "Your training plan has been downloaded as an iCal file. Import it into your preferred calendar app.",
      });
    },
    onError: (error) => {
      toast({
        title: "Download Failed",
        description: "Failed to download calendar file. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate Google Calendar URL
  const openGoogleCalendar = async () => {
    try {
      setActiveSync('google');
      const response = await apiRequest(`/api/training-plans/${trainingPlanId}/calendar/google-url`);
      window.open(response.url, '_blank');
      
      toast({
        title: "Opening Google Calendar",
        description: "Your training plan events are being added to Google Calendar.",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync with Google Calendar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActiveSync(null);
    }
  };

  // Generate Outlook Calendar URL
  const openOutlookCalendar = async () => {
    try {
      setActiveSync('outlook');
      const response = await apiRequest(`/api/training-plans/${trainingPlanId}/calendar/outlook-url`);
      window.open(response.url, '_blank');
      
      toast({
        title: "Opening Outlook Calendar",
        description: "Your training plan events are being added to Outlook.",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync with Outlook. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActiveSync(null);
    }
  };

  // Copy calendar URL for sharing
  const copyCalendarUrl = async () => {
    try {
      const url = `${window.location.origin}/api/training-plans/${trainingPlanId}/calendar/ical`;
      await navigator.clipboard.writeText(url);
      
      toast({
        title: "URL Copied",
        description: "Calendar URL copied to clipboard. You can share this with calendar apps.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (!syncSummary) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Calendar Sync Unavailable</AlertTitle>
        <AlertDescription>
          Unable to load calendar sync options for this training plan.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Calendar Sync Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendar Synchronisation
          </CardTitle>
          <CardDescription>
            Sync your training plan to your favourite calendar app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{syncSummary.totalWorkouts}</div>
              <div className="text-sm text-gray-600">Total Workouts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{syncSummary.weeklyWorkouts}</div>
              <div className="text-sm text-gray-600">Per Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{syncSummary.duration}</div>
              <div className="text-sm text-gray-600">Weeks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{syncSummary.eventCount}</div>
              <div className="text-sm text-gray-600">Calendar Events</div>
            </div>
          </div>

          {/* Quick Sync Buttons */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={openGoogleCalendar}
                disabled={activeSync === 'google'}
                className="flex-1 min-w-[200px]"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {activeSync === 'google' ? 'Syncing...' : 'Add to Google Calendar'}
              </Button>
              
              <Button 
                onClick={openOutlookCalendar}
                disabled={activeSync === 'outlook'}
                variant="outline"
                className="flex-1 min-w-[200px]"
              >
                <Mail className="h-4 w-4 mr-2" />
                {activeSync === 'outlook' ? 'Syncing...' : 'Add to Outlook'}
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => downloadICalMutation.mutate()}
                disabled={downloadICalMutation.isPending}
                variant="outline"
                className="flex-1 min-w-[200px]"
              >
                <Download className="h-4 w-4 mr-2" />
                {downloadICalMutation.isPending ? 'Downloading...' : 'Download .ics File'}
              </Button>

              <Dialog open={syncDialog} onOpenChange={setSyncDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1 min-w-[200px]">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Mobile & More Options
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Calendar Sync Options</DialogTitle>
                    <DialogDescription>
                      Choose how you'd like to sync your training plan to your calendar
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Tabs defaultValue="mobile" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="mobile">Mobile Devices</TabsTrigger>
                      <TabsTrigger value="desktop">Desktop Apps</TabsTrigger>
                      <TabsTrigger value="share">Share & Export</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="mobile" className="space-y-4">
                      <Alert>
                        <Smartphone className="h-4 w-4" />
                        <AlertTitle>Mobile Calendar Sync</AlertTitle>
                        <AlertDescription>
                          For iPhone and Android devices, download the .ics file and open it with your default calendar app.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-3">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-semibold">iPhone (iOS)</h4>
                                <p className="text-sm text-gray-600">Syncs with Apple Calendar, Outlook, Google Calendar</p>
                              </div>
                              <Button 
                                onClick={() => downloadICalMutation.mutate()}
                                disabled={downloadICalMutation.isPending}
                                size="sm"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-semibold">Android</h4>
                                <p className="text-sm text-gray-600">Syncs with Google Calendar, Samsung Calendar, Outlook</p>
                              </div>
                              <Button 
                                onClick={() => downloadICalMutation.mutate()}
                                disabled={downloadICalMutation.isPending}
                                size="sm"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">📱 Mobile Setup Instructions</h4>
                        <ol className="text-sm text-blue-700 space-y-1">
                          <li>1. Download the .ics file to your phone</li>
                          <li>2. Tap the downloaded file</li>
                          <li>3. Choose "Add to Calendar" or "Import"</li>
                          <li>4. Select your preferred calendar app</li>
                          <li>5. Your training plan workouts will appear in your calendar</li>
                        </ol>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="desktop" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <Calendar className="h-8 w-8 text-blue-600" />
                              <div>
                                <h4 className="font-semibold">Apple Calendar</h4>
                                <p className="text-sm text-gray-600">macOS built-in calendar</p>
                              </div>
                            </div>
                            <Button 
                              onClick={() => downloadICalMutation.mutate()}
                              disabled={downloadICalMutation.isPending}
                              size="sm" 
                              className="w-full"
                            >
                              Download & Import
                            </Button>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <Mail className="h-8 w-8 text-blue-600" />
                              <div>
                                <h4 className="font-semibold">Outlook Desktop</h4>
                                <p className="text-sm text-gray-600">Microsoft Outlook app</p>
                              </div>
                            </div>
                            <Button 
                              onClick={() => downloadICalMutation.mutate()}
                              disabled={downloadICalMutation.isPending}
                              size="sm" 
                              className="w-full"
                            >
                              Download & Import
                            </Button>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <Calendar className="h-8 w-8 text-red-600" />
                              <div>
                                <h4 className="font-semibold">Thunderbird</h4>
                                <p className="text-sm text-gray-600">Mozilla calendar app</p>
                              </div>
                            </div>
                            <Button 
                              onClick={() => downloadICalMutation.mutate()}
                              disabled={downloadICalMutation.isPending}
                              size="sm" 
                              className="w-full"
                            >
                              Download & Import
                            </Button>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <Calendar className="h-8 w-8 text-green-600" />
                              <div>
                                <h4 className="font-semibold">Other Apps</h4>
                                <p className="text-sm text-gray-600">Any iCal-compatible app</p>
                              </div>
                            </div>
                            <Button 
                              onClick={() => downloadICalMutation.mutate()}
                              disabled={downloadICalMutation.isPending}
                              size="sm" 
                              className="w-full"
                            >
                              Download & Import
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="share" className="space-y-4">
                      <Alert>
                        <Share2 className="h-4 w-4" />
                        <AlertTitle>Share Calendar</AlertTitle>
                        <AlertDescription>
                          Share your training plan calendar with coaches, training partners, or family members.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold">Calendar URL</h4>
                              <Button onClick={copyCalendarUrl} size="sm" variant="outline">
                                <Copy className="h-4 w-4 mr-2" />
                                Copy URL
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              Share this URL to allow others to subscribe to your training calendar
                            </p>
                            <div className="bg-gray-100 p-3 rounded text-sm font-mono break-all">
                              {`${window.location.origin}/api/training-plans/${trainingPlanId}/calendar/ical`}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-2">Export Options</h4>
                            <div className="space-y-2">
                              <Button 
                                onClick={() => downloadICalMutation.mutate()}
                                disabled={downloadICalMutation.isPending}
                                variant="outline" 
                                className="w-full justify-start"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download iCal (.ics) file
                              </Button>
                              <div className="text-sm text-gray-600 pl-6">
                                Universal format supported by all calendar applications
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Features */}
      <Card>
        <CardHeader>
          <CardTitle>What Gets Synced</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Workout Details
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Workout type (Easy Run, Intervals, etc.)</li>
                <li>• Distance and target pace</li>
                <li>• Estimated workout duration</li>
                <li>• Training intensity level</li>
                <li>• Week number and training notes</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Smart Scheduling
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Optimal workout times based on type</li>
                <li>• Automatic duration calculation</li>
                <li>• Timezone support (Australia/Sydney)</li>
                <li>• Collision detection with existing events</li>
                <li>• Reminder notifications setup</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-orange-50 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2">💡 Pro Tip</h4>
            <p className="text-sm text-orange-700">
              Your calendar events update automatically as you complete workouts. 
              Enable notifications in your calendar app to get reminded before each training session.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}