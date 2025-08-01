import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import MobileNav from "@/components/mobile-nav";
import { 
  Users, 
  Heart, 
  MapPin, 
  Clock, 
  Target, 
  MessageCircle,
  UserCheck,
  UserX,
  Settings,
  Search,
  Filter,
  Star,
  ChevronRight
} from "lucide-react";

interface BuddyMatch {
  id: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    location: string;
    experienceLevel: string;
    preferredDistance: string;
    preferredPace: string;
    runningGoals: string[];
    bio?: string;
    age?: number;
  };
  compatibilityScore: number;
  matchReasons: string[];
  distance: number; // km away
}

interface BuddyPreferences {
  maxDistance: number;
  ageRangeMin: number;
  ageRangeMax: number;
  paceFlexibility: string;
  experienceLevelPreference: string[];
  genderPreference: string;
  communicationStyle: string;
  runningGoalAlignment: boolean;
  scheduleFlexibility: string;
  isActive: boolean;
}

export default function BuddyMatching() {
  const [activeTab, setActiveTab] = useState("discover");
  const [showPreferences, setShowPreferences] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  // Fetch user's buddy preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery<BuddyPreferences>({
    queryKey: ["/api/buddy/preferences"],
    enabled: isAuthenticated,
  });

  // Fetch potential buddy matches
  const { data: potentialMatches, isLoading: matchesLoading } = useQuery<BuddyMatch[]>({
    queryKey: ["/api/buddy/matches"],
    enabled: isAuthenticated,
  });

  // Fetch existing buddy connections
  const { data: myBuddies, isLoading: buddiesLoading } = useQuery<any[]>({
    queryKey: ["/api/buddy/connections"],
    enabled: isAuthenticated,
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: Partial<BuddyPreferences>) => {
      return apiRequest("/api/buddy/preferences", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buddy/preferences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/buddy/matches"] });
      toast({
        title: "Preferences Updated",
        description: "Your buddy matching preferences have been saved.",
      });
      setShowPreferences(false);
    },
    onError: (error) => {
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
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send buddy request mutation
  const sendBuddyRequestMutation = useMutation({
    mutationFn: async (recipientId: string) => {
      return apiRequest("/api/buddy/request", {
        method: "POST",
        body: JSON.stringify({ recipientId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buddy/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/buddy/connections"] });
      toast({
        title: "Buddy Request Sent",
        description: "Your running buddy request has been sent!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send buddy request.",
        variant: "destructive",
      });
    },
  });

  // Handle buddy request response mutation
  const respondToBuddyRequestMutation = useMutation({
    mutationFn: async ({ matchId, response }: { matchId: number; response: "accepted" | "declined" }) => {
      return apiRequest(`/api/buddy/request/${matchId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: response }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buddy/connections"] });
      toast({
        title: "Response Sent",
        description: "Your response has been recorded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to respond to request.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || preferencesLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading buddy matching...</p>
            </div>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getExperienceBadgeColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-blue-100 text-blue-800";
      case "advanced": return "bg-purple-100 text-purple-800";
      case "elite": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Find Your Running Buddy</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Connect with compatible runners in your area. Our intelligent matching algorithm considers your pace, 
            schedule, experience level, and goals to find your perfect running partner.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="connections">My Buddies</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Potential Running Buddies</h2>
                <p className="text-slate-600 text-sm">Based on your preferences and compatibility</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowPreferences(!showPreferences)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Preferences
              </Button>
            </div>

            {/* Preferences Panel */}
            {showPreferences && (
              <Card>
                <CardHeader>
                  <CardTitle>Buddy Matching Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Search Radius: {preferences?.maxDistance || 25} km</Label>
                        <Slider
                          value={[preferences?.maxDistance || 25]}
                          onValueChange={(value) => updatePreferencesMutation.mutate({ maxDistance: value[0] })}
                          max={100}
                          min={5}
                          step={5}
                          className="mt-2"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Min Age</Label>
                          <Input
                            type="number"
                            value={preferences?.ageRangeMin || 18}
                            onChange={(e) => updatePreferencesMutation.mutate({ ageRangeMin: parseInt(e.target.value) })}
                            min="18"
                            max="80"
                          />
                        </div>
                        <div>
                          <Label>Max Age</Label>
                          <Input
                            type="number"
                            value={preferences?.ageRangeMax || 65}
                            onChange={(e) => updatePreferencesMutation.mutate({ ageRangeMax: parseInt(e.target.value) })}
                            min="18"
                            max="80"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Pace Flexibility</Label>
                        <Select 
                          value={preferences?.paceFlexibility || "moderate"} 
                          onValueChange={(value) => updatePreferencesMutation.mutate({ paceFlexibility: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="strict">Strict - Exact pace match</SelectItem>
                            <SelectItem value="moderate">Moderate - Similar pace</SelectItem>
                            <SelectItem value="flexible">Flexible - Any pace</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Gender Preference</Label>
                        <Select 
                          value={preferences?.genderPreference || "any"} 
                          onValueChange={(value) => updatePreferencesMutation.mutate({ genderPreference: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="non-binary">Non-binary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Label>Match Similar Running Goals</Label>
                      <p className="text-sm text-slate-600">Find runners with similar objectives</p>
                    </div>
                    <Switch
                      checked={preferences?.runningGoalAlignment || false}
                      onCheckedChange={(checked) => updatePreferencesMutation.mutate({ runningGoalAlignment: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Potential Matches */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchesLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-200 rounded w-full"></div>
                        <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : potentialMatches?.length ? (
                potentialMatches.map((match) => (
                  <Card key={match.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={match.user.profileImageUrl} />
                            <AvatarFallback>
                              {match.user.firstName[0]}{match.user.lastName?.[0] || ''}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {match.user.firstName} {match.user.lastName?.[0]}.
                            </h3>
                            <div className="flex items-center text-sm text-slate-600">
                              <MapPin className="h-3 w-3 mr-1" />
                              {match.distance.toFixed(1)} km away
                            </div>
                          </div>
                        </div>
                        <Badge className={`${getCompatibilityColor(match.compatibilityScore)} border-0`}>
                          {match.compatibilityScore}% match
                        </Badge>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Experience:</span>
                          <Badge className={getExperienceBadgeColor(match.user.experienceLevel)}>
                            {match.user.experienceLevel}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Preferred Distance:</span>
                          <span className="font-medium">{match.user.preferredDistance}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Preferred Pace:</span>
                          <span className="font-medium">{match.user.preferredPace}</span>
                        </div>
                      </div>

                      {match.user.runningGoals?.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-slate-600 mb-2">Goals:</p>
                          <div className="flex flex-wrap gap-1">
                            {match.user.runningGoals.slice(0, 3).map((goal) => (
                              <Badge key={goal} variant="outline" className="text-xs">
                                {goal.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {match.matchReasons?.length > 0 && (
                        <div className="mb-4 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-800 mb-1">Why you're compatible:</p>
                          <ul className="text-xs text-green-700 space-y-1">
                            {match.matchReasons.slice(0, 2).map((reason, i) => (
                              <li key={i}>• {reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Button 
                        className="w-full" 
                        onClick={() => sendBuddyRequestMutation.mutate(match.user.id)}
                        disabled={sendBuddyRequestMutation.isPending}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        {sendBuddyRequestMutation.isPending ? "Sending..." : "Send Buddy Request"}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No matches found</h3>
                  <p className="text-slate-600 mb-4">
                    Try adjusting your preferences to find more potential running buddies.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPreferences(true)}
                  >
                    Update Preferences
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* My Buddies Tab */}
          <TabsContent value="connections" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Your Running Buddies</h2>
              <p className="text-slate-600 text-sm">Runners you've connected with</p>
            </div>

            {buddiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : myBuddies?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myBuddies.map((buddy: any) => (
                  <Card key={buddy.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={buddy.user.profileImageUrl} />
                            <AvatarFallback>
                              {buddy.user.firstName[0]}{buddy.user.lastName?.[0] || ''}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {buddy.user.firstName} {buddy.user.lastName}
                            </h3>
                            <p className="text-sm text-slate-600">{buddy.user.location}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <Heart className="h-3 w-3 mr-1" />
                          Buddies
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-slate-600">
                          Connected {new Date(buddy.matchedAt).toLocaleDateString()}
                        </div>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No running buddies yet</h3>
                <p className="text-slate-600 mb-4">
                  Start by discovering potential matches and sending buddy requests.
                </p>
                <Button onClick={() => setActiveTab("discover")}>
                  <Search className="h-4 w-4 mr-2" />
                  Find Buddies
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Buddy Requests</h2>
              <p className="text-slate-600 text-sm">Pending requests from other runners</p>
            </div>

            {/* Implementation for requests would go here */}
            <div className="text-center py-12">
              <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <UserCheck className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No pending requests</h3>
              <p className="text-slate-600">
                When other runners send you buddy requests, they'll appear here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <MobileNav />
    </div>
  );
}