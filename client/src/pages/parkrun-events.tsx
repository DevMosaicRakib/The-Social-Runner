import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { 
  MapPin, 
  Clock, 
  Users, 
  Search,
  Calendar,
  Filter,
  Home
} from "lucide-react";
import Navigation from "@/components/navigation";
import SmoothMobileNav from "@/components/smooth-mobile-nav";
import { Link } from "wouter";
import SEOHead from "@/components/seo-head";
import type { EventWithParticipants } from "@shared/schema";

export default function ParkrunEventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("all");

  const { data: events, isLoading } = useQuery<EventWithParticipants[]>({
    queryKey: ["/api/events"],
  });

  // Filter parkrun events (created by system)
  const parkrunEvents = events?.filter(event => 
    event.createdBy === 'system' && 
    event.title.toLowerCase().includes('parkrun') &&
    (searchTerm === "" || 
     event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     event.location.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  // Group events by state/territory based on location
  const groupEventsByState = (events: EventWithParticipants[]) => {
    const stateGroups: { [key: string]: EventWithParticipants[] } = {};
    
    events.forEach(event => {
      let state = "Other";
      const location = event.location.toLowerCase();
      
      if (location.includes("nsw") || location.includes("sydney") || location.includes("newcastle")) {
        state = "New South Wales";
      } else if (location.includes("vic") || location.includes("melbourne") || location.includes("geelong")) {
        state = "Victoria";
      } else if (location.includes("qld") || location.includes("queensland") || location.includes("brisbane") || location.includes("gold coast")) {
        state = "Queensland";
      } else if (location.includes("wa") || location.includes("perth") || location.includes("western australia")) {
        state = "Western Australia";
      } else if (location.includes("sa") || location.includes("adelaide") || location.includes("south australia")) {
        state = "South Australia";
      } else if (location.includes("tas") || location.includes("tasmania") || location.includes("hobart") || location.includes("launceston")) {
        state = "Tasmania";
      } else if (location.includes("nt") || location.includes("northern territory") || location.includes("darwin")) {
        state = "Northern Territory";
      } else if (location.includes("act") || location.includes("canberra")) {
        state = "Australian Capital Territory";
      }
      
      if (!stateGroups[state]) {
        stateGroups[state] = [];
      }
      stateGroups[state].push(event);
    });
    
    return stateGroups;
  };

  const filteredEvents = filterState === "all" ? parkrunEvents : 
    groupEventsByState(parkrunEvents)[filterState] || [];

  const stateGroups = groupEventsByState(parkrunEvents);
  const states = Object.keys(stateGroups).sort();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="container mx-auto py-8 mobile-content-padding">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </div>
        <SmoothMobileNav />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Australian Parkrun Events - Free 5K Weekly Runs"
        description="Discover all 520+ Australian parkrun events across every state. Join free weekly 5K runs every Saturday morning. Find parkrun locations near you with search and filtering."
        keywords="parkrun Australia, free 5K run, weekly parkrun events, Saturday morning runs, parkrun locations, volunteer running events"
        ogType="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Australian Parkrun Events",
          "description": "Complete directory of Australian parkrun events with 520+ locations",
          "mainEntity": {
            "@type": "ItemList",
            "name": "Parkrun Events",
            "numberOfItems": parkrunEvents.length,
            "itemListElement": parkrunEvents.slice(0, 10).map((event, index) => ({
              "@type": "SportsEvent",
              "position": index + 1,
              "name": event.title,
              "location": {
                "@type": "Place",
                "name": event.location
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "AUD"
              },
              "sport": "Running"
            }))
          }
        }}
      />
      <div className="min-h-screen bg-slate-50">
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Australian Parkruns</h1>
            <p className="text-gray-600">
              Discover {parkrunEvents.length} free, weekly 5K community runs across Australia. 
              Every Saturday at 8:00 AM - all fitness levels welcome!
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search parkruns by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All States ({parkrunEvents.length})</option>
              {states.map(state => (
                <option key={state} value={state}>
                  {state} ({stateGroups[state].length})
                </option>
              ))}
            </select>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg leading-tight">
                      {event.title}
                    </CardTitle>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      {event.distance}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{event.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Every Saturday</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{event.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{event.participantCount} registered</span>
                  </div>

                  <div className="pt-2">
                    <Button className="w-full" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEvents.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No parkruns found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 
                  `No parkruns match "${searchTerm}"` : 
                  `No parkruns found in ${filterState}`
                }
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setFilterState("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}

          {/* Info Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                About Parkrun
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-600">
                Parkrun is a collection of 5-kilometer runs that take place every Saturday morning at 8:00 AM. 
                They are free, weekly, community events where people walk, jog, run, volunteer, or spectate.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-500">{parkrunEvents.length}</div>
                  <div className="text-sm text-gray-600">Parkrun Locations</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-500">5K</div>
                  <div className="text-sm text-gray-600">Every Event</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-500">Free</div>
                  <div className="text-sm text-gray-600">Always</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <SmoothMobileNav />
      </div>
    </>
  );
}