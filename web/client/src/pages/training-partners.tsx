import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Target, MapPin, Users, Clock, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface TrainingPartner {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  location: string;
  preferredDistances?: string[];
  experienceLevel?: string;
  goals?: Array<{
    eventName: string;
    distance: string;
    difficulty: string;
    eventDate?: string;
    targetTime?: string;
  }>;
}

const DISTANCE_OPTIONS = [
  { value: "", label: "All Distances" },
  { value: "5k", label: "5K" },
  { value: "10k", label: "10K" },
  { value: "half_marathon", label: "Half Marathon" },
  { value: "marathon", label: "Marathon" },
  { value: "ultra_marathon", label: "Ultra Marathon" },
  { value: "triathlon", label: "Triathlon" },
];

const DIFFICULTY_OPTIONS = [
  { value: "", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "elite", label: "Elite" },
];

export default function TrainingPartners() {
  const { user } = useAuth();
  const [selectedDistance, setSelectedDistance] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: partners = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/training-partners", selectedDistance, selectedDifficulty],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedDistance) params.append("distance", selectedDistance);
      if (selectedDifficulty) params.append("difficulty", selectedDifficulty);
      
      const response = await fetch(`/api/training-partners?${params}`);
      if (!response.ok) throw new Error("Failed to fetch training partners");
      return response.json();
    },
    enabled: !!user,
  });

  const { data: userGoals = [] } = useQuery({
    queryKey: ["/api/goals"],
    enabled: !!user,
  });

  // Filter partners based on search term
  const filteredPartners = partners.filter((partner: TrainingPartner) => {
    if (!searchTerm) return true;
    const fullName = `${partner.firstName} ${partner.lastName}`.toLowerCase();
    const location = partner.location?.toLowerCase() || "";
    return fullName.includes(searchTerm.toLowerCase()) || 
           location.includes(searchTerm.toLowerCase());
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-blue-100 text-blue-800";
      case "advanced": return "bg-orange-100 text-orange-800";
      case "elite": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDistanceColor = (distance: string) => {
    switch (distance?.toLowerCase()) {
      case "5k": case "10k": return "bg-emerald-100 text-emerald-800";
      case "half_marathon": return "bg-yellow-100 text-yellow-800";
      case "marathon": case "ultra_marathon": return "bg-purple-100 text-purple-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          <Users className="h-8 w-8 text-orange-600" />
          Training Partners
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find like-minded runners training for similar goals. Connect with training partners who share your ambitions and can help you achieve your running goals.
        </p>
      </div>

      {/* User's Goals Summary */}
      {userGoals.length > 0 && (
        <Card className="mb-6 border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Your Training Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userGoals.slice(0, 3).map((goal: any, index: number) => (
                <Badge key={index} variant="secondary" className={getDistanceColor(goal.distance)}>
                  {goal.eventName} ({goal.distance})
                </Badge>
              ))}
              {userGoals.length > 3 && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                  +{userGoals.length - 3} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedDistance} onValueChange={setSelectedDistance}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by distance" />
              </SelectTrigger>
              <SelectContent>
                {DISTANCE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={() => refetch()} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPartners.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No training partners found</h3>
            <p className="text-gray-600 mb-4">
              {selectedDistance || selectedDifficulty 
                ? "Try adjusting your filters to find more training partners"
                : "No one is currently training for similar goals. Be the first to set your training goals!"
              }
            </p>
            <Button variant="outline" onClick={() => { setSelectedDistance(""); setSelectedDifficulty(""); }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPartners.map((partner: TrainingPartner) => (
            <Card key={partner.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-12 h-12 border-2 border-black/10">
                    <AvatarImage src={partner.profileImageUrl} alt={`${partner.firstName} ${partner.lastName}`} />
                    <AvatarFallback className="bg-orange-100 text-orange-800 font-medium">
                      {partner.firstName?.[0]}{partner.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {partner.firstName} {partner.lastName}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {partner.location}
                    </div>
                  </div>
                </div>

                {/* Experience Level */}
                {partner.experienceLevel && (
                  <div className="mb-4">
                    <Badge variant="secondary" className={getDifficultyColor(partner.experienceLevel)}>
                      {partner.experienceLevel.charAt(0).toUpperCase() + partner.experienceLevel.slice(1)}
                    </Badge>
                  </div>
                )}

                {/* Preferred Distances */}
                {partner.preferredDistances && partner.preferredDistances.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preferred Distances:</p>
                    <div className="flex flex-wrap gap-1">
                      {partner.preferredDistances.slice(0, 3).map((distance, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {distance.replace('_', ' ').toUpperCase()}
                        </Badge>
                      ))}
                      {partner.preferredDistances.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{partner.preferredDistances.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Training Goals */}
                {partner.goals && partner.goals.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Training Goals:</p>
                    <div className="space-y-2">
                      {partner.goals.slice(0, 2).map((goal, index) => (
                        <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                          <div className="font-medium text-gray-900">{goal.eventName}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className={getDistanceColor(goal.distance)}>
                              {goal.distance.replace('_', ' ')}
                            </Badge>
                            <Badge variant="secondary" className={getDifficultyColor(goal.difficulty)}>
                              {goal.difficulty}
                            </Badge>
                          </div>
                          {goal.eventDate && (
                            <div className="flex items-center text-xs text-gray-600 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(goal.eventDate).toLocaleDateString()}
                            </div>
                          )}
                          {goal.targetTime && (
                            <div className="flex items-center text-xs text-gray-600 mt-1">
                              <Trophy className="h-3 w-3 mr-1" />
                              Target: {goal.targetTime}
                            </div>
                          )}
                        </div>
                      ))}
                      {partner.goals.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{partner.goals.length - 2} more goals
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button className="w-full" variant="outline">
                  Connect
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}