import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, Clock, Users, Search, Route, Home, DollarSign } from "lucide-react";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import SmoothMobileNav from "@/components/smooth-mobile-nav";
import Footer from "@/components/footer";
import LocationSearch from "@/components/location-search";
import SEOHead from "@/components/seo-head";

// Type for runclub with member data
interface RunclubWithMembers {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  annualCost?: string;
  location: string;
  lat: string;
  lng: string;
  runDays: string[];
  distances: string[];
  abilityLevels: string[];
  comments?: string;
  createdBy: string;
  status: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function FindRunclub() {
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedRadius, setSelectedRadius] = useState("10");
  const [searchDistance, setSearchDistance] = useState("");
  const [searchAbility, setSearchAbility] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { data: runclubs, isLoading } = useQuery<RunclubWithMembers[]>({
    queryKey: ["/api/runclubs"],
  });

  const { data: nearbyRunclubs, isLoading: isLoadingNearby } = useQuery<RunclubWithMembers[]>({
    queryKey: ["/api/runclubs/search/location", userLocation?.lat, userLocation?.lng, selectedRadius],
    enabled: !!userLocation,
  });

  // Set default location to Sydney (matching events functionality)
  useEffect(() => {
    if (!userLocation) {
      setUserLocation({ lat: -33.8688, lng: 151.2093 }); // Sydney
    }
  }, [userLocation]);

  const handleLocationSelect = (location: any) => {
    setUserLocation({ lat: location.lat, lng: location.lng });
    setSearchLocation(location.name || location.address || location.suburb);
  };

  const filteredRunclubs = runclubs?.filter(runclub => {
    if (searchDistance && searchDistance !== "all" && !runclub.distances.includes(searchDistance)) {
      return false;
    }
    if (searchAbility && searchAbility !== "all" && !runclub.abilityLevels.includes(searchAbility)) {
      return false;
    }
    return true;
  }) ?? [];

  const displayRunclubs = userLocation ? (nearbyRunclubs || []) : filteredRunclubs;

  const formatCurrency = (amount?: string) => {
    if (!amount || amount === "0" || amount === "0.00") return "Free";
    return `$${parseFloat(amount).toFixed(0)}/year`;
  };

  const formatRunDays = (days: string[]) => {
    const dayMap: { [key: string]: string } = {
      'monday': 'Mon',
      'tuesday': 'Tue', 
      'wednesday': 'Wed',
      'thursday': 'Thu',
      'friday': 'Fri',
      'saturday': 'Sat',
      'sunday': 'Sun'
    };
    return days.map(day => dayMap[day] || day).join(', ');
  };

  const formatDistances = (distances: string[]) => {
    const distanceMap: { [key: string]: string } = {
      '5k': '5K',
      '10k': '10K', 
      '15k': '15K',
      'half_marathon': 'Half',
      'marathon': 'Full',
      'ultra': 'Ultra',
      'fun_run': 'Fun',
      'other': 'Other'
    };
    return distances.map(d => distanceMap[d] || d);
  };

  const formatAbilityLevels = (levels: string[]) => {
    const levelMap: { [key: string]: string } = {
      'beginner': 'Beginner',
      'intermediate': 'Intermediate',
      'advanced': 'Advanced', 
      'elite': 'Elite'
    };
    return levels.map(level => levelMap[level] || level);
  };

  return (
    <>
      <SEOHead
        title="Find Running Clubs Near You - Join Local Run Clubs"
        description="Discover and join running clubs across Australia. Find local run clubs with map search, filter by distance, ability level, and membership cost. Connect with running communities in your area."
        keywords="find running clubs Australia, local run clubs, running groups near me, join running club, running community search, training partners"
        ogType="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Find Running Clubs",
          "description": "Discover and join running clubs across Australia with advanced search and filtering",
          "mainEntity": {
            "@type": "ItemList",
            "name": "Running Clubs",
            "numberOfItems": runclubs?.length || 0,
            "itemListElement": runclubs?.slice(0, 5).map((club, index) => ({
              "@type": "SportsClub",
              "position": index + 1,
              "name": club.name,
              "description": club.description,
              "location": {
                "@type": "Place",
                "name": club.location
              },
              "membershipType": "Free",
              "sport": "Running"
            })) || []
          }
        }}
      />
      <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="container mx-auto py-6 px-4 mobile-content-padding">
        <div className="max-w-6xl mx-auto">
          {/* Return Home Button */}
          <div className="mb-6">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Return Home</span>
                <span className="sm:hidden">Home</span>
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Find Run Clubs</h1>
            <p className="text-gray-600">
              Discover local Run Clubs that match your pace, schedule, and goals.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Location Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <LocationSearch
                  onLocationSelect={handleLocationSelect}
                  placeholder="Search suburbs, postcodes..."
                  defaultValue={searchLocation}
                />
              </div>

              {/* Radius Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Radius</label>
                <Select value={selectedRadius} onValueChange={setSelectedRadius}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select radius" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5km</SelectItem>
                    <SelectItem value="10">10km</SelectItem>
                    <SelectItem value="20">20km</SelectItem>
                    <SelectItem value="50">50km</SelectItem>
                    <SelectItem value="100">100km</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Distance Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Distance Focus</label>
                <Select value={searchDistance} onValueChange={setSearchDistance}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any distance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any distance</SelectItem>
                    <SelectItem value="5k">5K</SelectItem>
                    <SelectItem value="10k">10K</SelectItem>
                    <SelectItem value="15k">15K</SelectItem>
                    <SelectItem value="half_marathon">Half Marathon</SelectItem>
                    <SelectItem value="marathon">Marathon</SelectItem>
                    <SelectItem value="ultra">Ultra</SelectItem>
                    <SelectItem value="fun_run">Fun Run</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ability Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ability Level</label>
                <Select value={searchAbility} onValueChange={setSearchAbility}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any level</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="elite">Elite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  List View
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                >
                  Map View
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                {displayRunclubs.length} clubs found
              </div>
            </div>
          </div>

          {/* Results */}
          {isLoading || isLoadingNearby ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <div className="flex gap-2 mb-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : displayRunclubs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No running clubs found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search location to find more clubs.
                </p>
                <Link href="/create-runclub">
                  <Button>
                    Create a Running Club
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : viewMode === "list" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayRunclubs.map((runclub) => (
                <Card key={runclub.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {runclub.logoUrl ? (
                          <img
                            src={runclub.logoUrl}
                            alt={runclub.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                            <Users className="h-6 w-6 text-orange-600" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg leading-tight">{runclub.name}</CardTitle>
                          <p className="text-sm text-gray-600">{runclub.memberCount} members</p>
                        </div>
                      </div>
                      <Badge variant={runclub.annualCost && parseFloat(runclub.annualCost) > 0 ? "default" : "secondary"}>
                        {formatCurrency(runclub.annualCost)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{runclub.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>{formatRunDays(runclub.runDays)}</span>
                    </div>

                    {runclub.description && (
                      <p className="text-sm text-gray-700 line-clamp-2">{runclub.description}</p>
                    )}

                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {formatDistances(runclub.distances).map((distance, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {distance}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {formatAbilityLevels(runclub.abilityLevels).map((level, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {level}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {runclub.comments && (
                      <p className="text-xs text-gray-600 italic line-clamp-2">
                        "{runclub.comments}"
                      </p>
                    )}

                    <div className="pt-2 border-t">
                      <Button size="sm" className="w-full">
                        <Users className="h-4 w-4 mr-2" />
                        Join Club
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-4 border">
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-600">Map view coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <SmoothMobileNav />
      <Footer />
      </div>
    </>
  );
}