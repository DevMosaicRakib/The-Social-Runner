import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, Clock, Route, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import RunnerLoading, { RunnerLoadingCompact } from "@/components/runner-loading";
import Navigation from "@/components/navigation";
import MobileNav from "@/components/mobile-nav";
import EventCard from "@/components/event-card";
import EventMap from "@/components/event-map";
import InteractiveMap from "@/components/interactive-map";
import StatsSidebar from "@/components/stats-sidebar";
import EventsNearMe from "@/components/events-near-me";
import EventsNearMeMap from "@/components/events-near-me-map";
import AnimatedRunningTrack from "@/components/animated-running-track";
import ContextualHelp from "@/components/contextual-help";
import OnboardingProgress from "@/components/onboarding-progress";
import { useOnboarding } from "@/hooks/useOnboarding";

import type { EventWithParticipants } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchDate, setSearchDate] = useState("");
  const [searchTime, setSearchTime] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const { markStepCompleted, isOnboardingComplete } = useOnboarding();

  const { data: events, isLoading } = useQuery<EventWithParticipants[]>({
    queryKey: ["/api/events"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Mark events viewed step as completed
  useEffect(() => {
    if (events && events.length > 0) {
      markStepCompleted('first-event-view');
    }
  }, [events, markStepCompleted]);

  const filteredEvents = events?.filter(event => {
    if (searchDate && event.date !== searchDate) {
      return false;
    }
    if (searchTime && searchTime !== "all") {
      const eventTime = parseInt(event.time.split(':')[0]);
      switch (searchTime) {
        case "morning":
          return eventTime >= 6 && eventTime < 12;
        case "afternoon":
          return eventTime >= 12 && eventTime < 18;
        case "evening":
          return eventTime >= 18 && eventTime < 22;
        default:
          return true;
      }
    }
    return true;
  }) ?? [];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Animated Running Track Background */}
      <AnimatedRunningTrack />
      
      <Navigation />
      
      {/* Hero Section with Our Purpose */}
      <div className="hero-section relative z-10 bg-gradient-to-br from-orange-50 to-green-50 py-20 mb-8 overflow-hidden">
        {/* Mountain Trail Running Graphic Behind Text */}
        <div className="absolute inset-0 flex items-center justify-center opacity-12 pointer-events-none">
          <svg width="800" height="400" viewBox="0 0 800 400" className="w-full h-full max-w-6xl">
            {/* Mountain silhouettes in background */}
            <g opacity="0.6">
              {/* Back mountains */}
              <path d="M 0 300 L 150 180 L 250 220 L 350 160 L 450 200 L 550 140 L 650 180 L 750 160 L 800 200 L 800 400 L 0 400 Z" 
                    fill="#10b981" opacity="0.3"/>
              
              {/* Mid mountains */}
              <path d="M 0 350 L 100 250 L 200 280 L 300 220 L 400 260 L 500 200 L 600 240 L 700 190 L 800 230 L 800 400 L 0 400 Z" 
                    fill="#059669" opacity="0.4"/>
              
              {/* Front mountains */}
              <path d="M 0 380 L 80 300 L 160 320 L 240 280 L 320 310 L 400 270 L 480 300 L 560 260 L 640 290 L 720 250 L 800 280 L 800 400 L 0 400 Z" 
                    fill="#047857" opacity="0.5"/>
            </g>
            
            {/* Winding trail path */}
            <path d="M 50 380 Q 150 350, 200 320 Q 300 280, 400 290 Q 500 300, 600 270 Q 700 240, 750 250" 
                  fill="none" stroke="#f97316" strokeWidth="8" opacity="0.6" strokeDasharray="20,10"/>
            
            {/* Trail markers/posts */}
            <g opacity="0.7">
              <rect x="148" y="348" width="4" height="25" fill="#8b5a3c"/>
              <rect x="398" y="288" width="4" height="25" fill="#8b5a3c"/>
              <rect x="598" y="268" width="4" height="25" fill="#8b5a3c"/>
            </g>
            
            {/* Running figures on the trail - silhouettes */}
            <g opacity="0.8">
              {/* Runner 1 - mid stride */}
              <g transform="translate(200,310)">
                <ellipse cx="0" cy="-15" rx="8" ry="12" fill="#f97316"/>
                <ellipse cx="-3" cy="-2" rx="12" ry="8" fill="#f97316"/>
                <ellipse cx="-8" cy="8" rx="4" ry="15" fill="#f97316"/>
                <ellipse cx="6" cy="5" rx="4" ry="12" fill="#f97316"/>
                <ellipse cx="-15" cy="-5" rx="3" ry="8" fill="#f97316"/>
                <ellipse cx="10" cy="-8" rx="3" ry="10" fill="#f97316"/>
              </g>
              
              {/* Runner 2 - different position */}
              <g transform="translate(450,280)">
                <ellipse cx="0" cy="-15" rx="8" ry="12" fill="#ea580c"/>
                <ellipse cx="-2" cy="-2" rx="12" ry="8" fill="#ea580c"/>
                <ellipse cx="-6" cy="10" rx="4" ry="15" fill="#ea580c"/>
                <ellipse cx="8" cy="6" rx="4" ry="12" fill="#ea580c"/>
                <ellipse cx="-12" cy="-3" rx="3" ry="8" fill="#ea580c"/>
                <ellipse cx="12" cy="-6" rx="3" ry="10" fill="#ea580c"/>
              </g>
            </g>
            
            {/* Trees scattered around */}
            <g opacity="0.4">
              <circle cx="120" cy="340" r="15" fill="#059669"/>
              <rect x="117" y="355" width="6" height="20" fill="#8b5a3c"/>
              
              <circle cx="320" cy="300" r="18" fill="#10b981"/>
              <rect x="316" y="318" width="8" height="25" fill="#8b5a3c"/>
              
              <circle cx="680" cy="280" r="12" fill="#047857"/>
              <rect x="677" y="292" width="6" height="18" fill="#8b5a3c"/>
            </g>
            
            {/* Trail dust/movement effects */}
            <g opacity="0.3">
              <circle cx="180" cy="325" r="2" fill="#f97316"/>
              <circle cx="175" cy="328" r="1.5" fill="#f97316"/>
              <circle cx="185" cy="322" r="1" fill="#f97316"/>
              
              <circle cx="430" cy="295" r="2" fill="#ea580c"/>
              <circle cx="425" cy="298" r="1.5" fill="#ea580c"/>
              <circle cx="435" cy="292" r="1" fill="#ea580c"/>
            </g>
          </svg>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-gray-900 mb-8 leading-tight tracking-tight">
              Building Australia's <span className="text-orange-600 relative">
                Biggest Running
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-orange-300 rounded-full opacity-60"></div>
              </span> Community
            </h1>
            <p className="text-2xl md:text-3xl lg:text-4xl text-gray-800 leading-relaxed mb-12 font-body font-medium max-w-4xl mx-auto">
              From what started as a <span className="font-bold text-gray-900 font-display">lonely runner</span>, whose schedule didn't conform to conventional running clubs, 
              sought <span className="font-bold text-orange-600 font-display">companionship</span> to achieve goals, meet like-minded people and improve 
              <span className="font-bold text-green-700 font-display">mental health and well-being</span> through <span className="font-black text-green-800 font-display text-3xl md:text-4xl lg:text-5xl">shared experiences</span>.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <button 
                className="group bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-orange-100 hover:shadow-2xl hover:bg-gradient-to-br hover:from-orange-50 hover:to-white hover:border-orange-200 hover:scale-105 transition-all duration-300 cursor-pointer text-center transform-gpu"
                onClick={() => {
                  const eventsSection = document.getElementById('events-near-me');
                  if (eventsSection) {
                    eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <MapPin className="w-6 h-6 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-800 transition-colors duration-300">Find Your Tribe</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">Find all events in your area</p>
              </button>
              <button 
                className="group bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-100 hover:shadow-2xl hover:bg-gradient-to-br hover:from-green-50 hover:to-white hover:border-green-200 hover:scale-105 transition-all duration-300 cursor-pointer text-center transform-gpu"
                onClick={() => setLocation("/create-visual")}
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <Plus className="w-6 h-6 text-green-600 group-hover:text-green-700 group-hover:rotate-90 transition-all duration-300" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-800 transition-colors duration-300">Create Your Events</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">Organise runs that fit your unique schedule and preferences</p>
              </button>
              <button 
                className="group bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-100 hover:shadow-2xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-white hover:border-blue-200 hover:scale-105 transition-all duration-300 cursor-pointer text-center transform-gpu"
                onClick={() => {
                  const eventsSection = document.getElementById('events-near-me');
                  if (eventsSection) {
                    eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                  <Route className="w-6 h-6 text-blue-600 group-hover:text-blue-700 group-hover:animate-pulse transition-all duration-300" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-800 transition-colors duration-300">Shared Experiences</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">Improve mental health through meaningful running connections</p>
              </button>
            </div>
            
            <br />
            
            {/* Get Started Section */}
            <div className="mt-16 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Started Today</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Ready to find your running community? Explore events happening near you or create your own.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="px-8 py-3 text-lg bg-orange-500 hover:bg-orange-600"
                  onClick={() => {
                    const eventsSection = document.getElementById('events-near-me');
                    if (eventsSection) {
                      eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  View Events
                </Button>
                <Link href="/create-visual">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="px-8 py-3 text-lg border-green-500 text-green-600 hover:bg-green-50"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Event
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Trail Illustration */}
      <div className="absolute inset-0 opacity-3 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 1200 800" className="absolute top-0 left-0">
          <path d="M0,400 Q300,200 600,300 T1200,250" fill="none" stroke="#22c55e" strokeWidth="40" opacity="0.2"/>
          <path d="M0,420 Q300,220 600,320 T1200,270" fill="none" stroke="#16a34a" strokeWidth="20" opacity="0.1"/>
          
          {/* Trail markers and nature elements */}
          <g opacity="0.4">
            {/* Trees */}
            <circle cx="150" cy="200" r="30" fill="#22c55e"/>
            <rect x="145" y="230" width="10" height="25" fill="#8b5a3c"/>
            <circle cx="400" cy="150" r="35" fill="#16a34a"/>
            <rect x="395" y="185" width="10" height="30" fill="#8b5a3c"/>
            <circle cx="800" cy="180" r="28" fill="#22c55e"/>
            <rect x="795" y="208" width="10" height="22" fill="#8b5a3c"/>
            <circle cx="1000" cy="200" r="32" fill="#16a34a"/>
            <rect x="995" y="232" width="10" height="28" fill="#8b5a3c"/>
            
            {/* Bushes */}
            <ellipse cx="250" cy="350" rx="25" ry="15" fill="#22c55e"/>
            <ellipse cx="550" cy="380" rx="30" ry="18" fill="#16a34a"/>
            <ellipse cx="900" cy="320" rx="28" ry="16" fill="#22c55e"/>
          </g>
          
          {/* Running figures scattered along trail */}
          <g opacity="0.5">
            {/* Runner 1 */}
            <g transform="translate(200,350)">
              <circle cx="0" cy="-15" r="10" fill="#fbbf24"/>
              <rect x="-4" y="-5" width="8" height="18" fill="#3b82f6" rx="4"/>
              <rect x="-7" y="13" width="3" height="15" fill="#1f2937" rx="1"/>
              <rect x="4" y="13" width="3" height="15" fill="#1f2937" rx="1"/>
            </g>
            
            {/* Runner 2 */}
            <g transform="translate(500,280)">
              <circle cx="0" cy="-15" r="10" fill="#f87171"/>
              <rect x="-4" y="-5" width="8" height="18" fill="#ef4444" rx="4"/>
              <rect x="-7" y="13" width="3" height="15" fill="#1f2937" rx="1"/>
              <rect x="4" y="13" width="3" height="15" fill="#1f2937" rx="1"/>
            </g>
            
            {/* Runner 3 */}
            <g transform="translate(750,200)">
              <circle cx="0" cy="-15" r="10" fill="#a78bfa"/>
              <rect x="-4" y="-5" width="8" height="18" fill="#8b5cf6" rx="4"/>
              <rect x="-7" y="13" width="3" height="15" fill="#1f2937" rx="1"/>
              <rect x="4" y="13" width="3" height="15" fill="#1f2937" rx="1"/>
            </g>
          </g>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mobile-content-padding relative z-10">
        {/* Onboarding Progress for new users */}
        {!isOnboardingComplete && (
          <OnboardingProgress className="mb-8" />
        )}

        {/* Events Section Header */}
        <div className="events-section mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Discover Running Events Near You
          </h2>
          <p className="text-gray-600">
            Join events created by your community or create your own
          </p>
        </div>

        {/* Community illustration */}
        <div className="mb-8 text-center">
          <div className="mb-6">
            <svg width="300" height="80" viewBox="0 0 300 80" className="mx-auto opacity-70">
              {/* Community group running together */}
              <g>
                {/* Runner 1 */}
                <g transform="translate(60,40)">
                  <circle cx="0" cy="-20" r="10" fill="#fbbf24"/>
                  <rect x="-4" y="-10" width="8" height="15" fill="#3b82f6" rx="4"/>
                  <rect x="-6" y="5" width="3" height="12" fill="#1f2937" rx="1"/>
                  <rect x="3" y="5" width="3" height="12" fill="#1f2937" rx="1"/>
                  <rect x="-10" y="-3" width="5" height="2" fill="#fbbf24" rx="1"/>
                  <rect x="5" y="-3" width="5" height="2" fill="#fbbf24" rx="1"/>
                </g>
                
                {/* Runner 2 */}
                <g transform="translate(120,40)">
                  <circle cx="0" cy="-20" r="10" fill="#f87171"/>
                  <rect x="-4" y="-10" width="8" height="15" fill="#ef4444" rx="4"/>
                  <rect x="-6" y="5" width="3" height="12" fill="#1f2937" rx="1"/>
                  <rect x="3" y="5" width="3" height="12" fill="#1f2937" rx="1"/>
                  <rect x="-10" y="-3" width="5" height="2" fill="#f87171" rx="1"/>
                  <rect x="5" y="-3" width="5" height="2" fill="#f87171" rx="1"/>
                </g>
                
                {/* Runner 3 */}
                <g transform="translate(180,40)">
                  <circle cx="0" cy="-20" r="10" fill="#a78bfa"/>
                  <rect x="-4" y="-10" width="8" height="15" fill="#8b5cf6" rx="4"/>
                  <rect x="-6" y="5" width="3" height="12" fill="#1f2937" rx="1"/>
                  <rect x="3" y="5" width="3" height="12" fill="#1f2937" rx="1"/>
                  <rect x="-10" y="-3" width="5" height="2" fill="#a78bfa" rx="1"/>
                  <rect x="5" y="-3" width="5" height="2" fill="#a78bfa" rx="1"/>
                </g>
                
                {/* Runner 4 */}
                <g transform="translate(240,40)">
                  <circle cx="0" cy="-20" r="10" fill="#34d399"/>
                  <rect x="-4" y="-10" width="8" height="15" fill="#10b981" rx="4"/>
                  <rect x="-6" y="5" width="3" height="12" fill="#1f2937" rx="1"/>
                  <rect x="3" y="5" width="3" height="12" fill="#1f2937" rx="1"/>
                  <rect x="-10" y="-3" width="5" height="2" fill="#34d399" rx="1"/>
                  <rect x="5" y="-3" width="5" height="2" fill="#34d399" rx="1"/>
                </g>
                
                {/* Motion effects */}
                <g opacity="0.4">
                  <line x1="30" y1="45" x2="20" y2="45" stroke="#94a3b8" strokeWidth="2"/>
                  <line x1="35" y1="50" x2="25" y2="50" stroke="#94a3b8" strokeWidth="1"/>
                  <line x1="90" y1="45" x2="80" y2="45" stroke="#94a3b8" strokeWidth="2"/>
                  <line x1="95" y1="50" x2="85" y2="50" stroke="#94a3b8" strokeWidth="1"/>
                  <line x1="150" y1="45" x2="140" y2="45" stroke="#94a3b8" strokeWidth="2"/>
                  <line x1="155" y1="50" x2="145" y2="50" stroke="#94a3b8" strokeWidth="1"/>
                  <line x1="210" y1="45" x2="200" y2="45" stroke="#94a3b8" strokeWidth="2"/>
                  <line x1="215" y1="50" x2="205" y2="50" stroke="#94a3b8" strokeWidth="1"/>
                </g>
              </g>
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Find Your Running Community</h1>
          <p className="text-slate-600">Discover local running events and connect with fellow runners in your area through The Social Runner.</p>
        </div>



        {/* Events Near Me - Prominent Section */}
        <div id="events-near-me" className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Discover Events Near You</h2>
            <p className="text-slate-600">Find running events happening in your area with interactive map search</p>
          </div>
          <EventsNearMeMap />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Events List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">Upcoming Events</h2>
              <div className="flex space-x-2">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="btn-primary"
                >
                  List
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                  className={viewMode === "map" ? "btn-primary" : ""}
                >
                  Map
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-6">
                <RunnerLoading count={3} showText={true} />
                {[1, 2, 3].map(i => (
                  <Card key={i} className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <RunnerLoadingCompact />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-4">
                {filteredEvents.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Route className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No events found</h3>
                      <p className="text-slate-600 mb-4">No running events match your search criteria.</p>
                      <Button onClick={() => setLocation("/create")} className="btn-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Event
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  filteredEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))
                )}
              </div>
            ) : viewMode === "map" ? (
              <InteractiveMap 
                events={filteredEvents} 
                onEventSelect={(event) => {
                  // Scroll to the event in the sidebar or show details
                  // Event selected for details view
                }}
              />
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <StatsSidebar user={user} />
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <Link href="/create">
        <Button
          size="lg"
          className="fixed bottom-20 md:bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all btn-primary"
          title="Create New Event"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </Link>

      <MobileNav />
      <ContextualHelp currentPage="home" />
    </div>
  );
}
