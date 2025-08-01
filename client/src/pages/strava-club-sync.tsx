import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  RefreshCw, 
  Trash2, 
  Clock, 
  Users, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import Navigation from "@/components/navigation";
import SmoothMobileNav from "@/components/smooth-mobile-nav";
import { apiRequest } from "@/lib/queryClient";
import type { StravaClubSync } from "@shared/schema";

interface SyncResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export default function StravaClubSyncPage() {
  const [clubId, setClubId] = useState("");
  const [clubName, setClubName] = useState("");
  const [syncIntervalHours, setSyncIntervalHours] = useState(24);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch club syncs
  const { data: clubSyncs, isLoading } = useQuery<StravaClubSync[]>({
    queryKey: ["/api/strava/club-syncs"],
  });

  // Add club sync mutation
  const addClubSyncMutation = useMutation({
    mutationFn: async (data: { clubId: string; clubName: string; syncIntervalHours: number }) => 
      apiRequest("/api/strava/club-sync", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/strava/club-syncs"] });
      setClubId("");
      setClubName("");
      setSyncIntervalHours(24);
      toast({
        title: "Success",
        description: "Club sync added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sync individual club mutation
  const syncClubMutation = useMutation({
    mutationFn: async (syncId: string) => 
      apiRequest(`/api/strava/sync-club/${syncId}`, {
        method: "POST",
      }),
    onSuccess: (data: SyncResult) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Sync Complete",
        description: `Imported ${data.imported} new events, updated ${data.updated} events, skipped ${data.skipped} duplicates`,
      });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sync all clubs mutation
  const syncAllClubsMutation = useMutation({
    mutationFn: async () => 
      apiRequest("/api/strava/sync-all-clubs", {
        method: "POST",
      }),
    onSuccess: (data: { totalImported: number; totalUpdated: number; totalSkipped: number }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "All Clubs Synced",
        description: `Imported ${data.totalImported} new events, updated ${data.totalUpdated} events, skipped ${data.totalSkipped} duplicates`,
      });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove club sync mutation
  const removeClubSyncMutation = useMutation({
    mutationFn: async (syncId: string) => 
      apiRequest(`/api/strava/club-sync/${syncId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/strava/club-syncs"] });
      toast({
        title: "Success",
        description: "Club sync removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddClubSync = () => {
    if (!clubId.trim() || !clubName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter both Club ID and Club Name",
        variant: "destructive",
      });
      return;
    }

    addClubSyncMutation.mutate({ clubId, clubName, syncIntervalHours });
  };

  const formatLastSync = (lastSyncAt: string | null) => {
    if (!lastSyncAt) return "Never";
    const date = new Date(lastSyncAt);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="container mx-auto py-6 px-4 mobile-content-padding">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Strava Club Sync</h1>
            <p className="text-slate-600">
              Automatically import running events from Strava clubs into The Social Runner
            </p>
          </div>

          {/* Add New Club Sync */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-orange-500" />
                Add Club Sync
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="clubId">Strava Club ID</Label>
                  <Input
                    id="clubId"
                    placeholder="Enter Strava Club ID"
                    value={clubId}
                    onChange={(e) => setClubId(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="clubName">Club Name</Label>
                  <Input
                    id="clubName"
                    placeholder="Enter club name"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="syncInterval">Sync Interval (hours)</Label>
                  <Input
                    id="syncInterval"
                    type="number"
                    min="1"
                    max="168"
                    value={syncIntervalHours}
                    onChange={(e) => setSyncIntervalHours(parseInt(e.target.value) || 24)}
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button 
                  onClick={handleAddClubSync}
                  disabled={addClubSyncMutation.isPending}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {addClubSyncMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Club Sync
                </Button>
                <Button 
                  onClick={() => syncAllClubsMutation.mutate()}
                  disabled={syncAllClubsMutation.isPending || !clubSyncs?.length}
                  variant="outline"
                >
                  {syncAllClubsMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Sync All Clubs
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Club Syncs List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Active Club Syncs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  <span className="ml-2">Loading club syncs...</span>
                </div>
              ) : clubSyncs?.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No club syncs configured yet</p>
                  <p className="text-sm">Add a Strava club above to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clubSyncs?.map((sync) => (
                    <div key={sync.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{sync.clubName}</h3>
                            <Badge variant={sync.isActive ? "default" : "secondary"}>
                              {sync.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Club ID: {sync.clubId}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Every {sync.syncIntervalHours}h
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Last sync: {formatLastSync(sync.lastSyncAt)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => syncClubMutation.mutate(sync.id)}
                            disabled={syncClubMutation.isPending}
                            variant="outline"
                          >
                            {syncClubMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => removeClubSyncMutation.mutate(sync.id)}
                            disabled={removeClubSyncMutation.isPending}
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                          >
                            {removeClubSyncMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                How to Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p>Find your Strava club ID in the club's URL (e.g., strava.com/clubs/123456)</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p>Make sure you have connected your Strava account in your profile</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p>Events will automatically sync based on the interval you set</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p>Imported events will appear in the main events list with other running events</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <SmoothMobileNav />
    </div>
  );
}