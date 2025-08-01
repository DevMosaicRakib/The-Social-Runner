import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, Clock, Route, Plus, Target } from "lucide-react";
import { Link, useLocation } from "wouter";
import RunnerLoading, { RunnerLoadingCompact } from "@/components/runner-loading";
import Navigation from "@/components/navigation";
import SmoothMobileNav from "@/components/smooth-mobile-nav";
import EventCard from "@/components/event-card";
import EventMap from "@/components/event-map";
import InteractiveMap from "@/components/interactive-map";
import StatsSidebar from "@/components/stats-sidebar";
import EventsNearMe from "@/components/events-near-me";
import EventsNearMeMap from "@/components/events-near-me-map";
import AnimatedRunningTrack from "@/components/animated-running-track";

import Footer from "@/components/footer";
import JigsawConnection from "@/components/jigsaw-connection";
import SEOHead from "@/components/seo-head";

import type { EventWithParticipants } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchDate, setSearchDate] = useState("");
  const [searchTime, setSearchTime] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");


  const { data: events, isLoading } = useQuery<EventWithParticipants[]>({
    queryKey: ["/api/events"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });



  const filteredEvents = events?.filter(event => {
    // Only show future events
    const now = new Date();
    const eventDateTime = new Date(`${event.date}T${event.time}`);
    if (eventDateTime <= now) {
      return false;
    }

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
    <>
      <SEOHead
        title="Home"
        description="Find and join running events near you in Australia. Connect with local runners, discover parkruns, training groups, and social running opportunities in your area."
        keywords="running events near me, local running groups, parkrun Australia, running community, find running partners, social running events"
        ogType="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Running Events Dashboard",
          "description": "Discover and join local running events across Australia",
          "mainEntity": {
            "@type": "ItemList",
            "name": "Running Events",
            "numberOfItems": events?.length || 0,
            "itemListElement": events?.slice(0, 5).map((event, index) => ({
              "@type": "Event",
              "position": index + 1,
              "name": event.title,
              "description": event.description,
              "startDate": `${event.date}T${event.time}`,
              "location": {
                "@type": "Place",
                "name": event.location
              }
            })) || []
          }
        }}
      />
      <div className="min-h-screen bg-slate-50 relative overflow-hidden pb-20 md:pb-0">
      {/* Animated Running Track Background */}
      <AnimatedRunningTrack />
      
      <Navigation />
      
      {/* Hero Section with Our Purpose */}
      <div className="hero-section relative z-10 bg-gradient-to-br from-orange-50 to-green-50 py-20 mb-8 overflow-hidden">
        {/* Jigsaw Connection Visual */}
        <div className="absolute top-8 right-8 w-32 h-24">
          <JigsawConnection opacity={0.15} className="w-full h-full" />
        </div>
        
        {/* Enhanced Mountain Trail Running Graphic Behind Text */}
        <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
          <svg width="800" height="400" viewBox="0 0 800 400" className="w-full h-full max-w-6xl">
            {/* Realistic layered mountains with depth */}
            <defs>
              <linearGradient id="mountainGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#16a34a" stopOpacity="0.8"/>
              </linearGradient>
              <linearGradient id="mountainGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#16a34a" stopOpacity="0.7"/>
                <stop offset="100%" stopColor="#15803d" stopOpacity="0.9"/>
              </linearGradient>
              <linearGradient id="mountainGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#15803d" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#166534" stopOpacity="1"/>
              </linearGradient>
            </defs>
            
            {/* Distant mountains with atmospheric perspective */}
            <g opacity="0.9">
              {/* Far back mountains - lighter and more blue */}
              <path d="M 0 320 L 180 160 L 280 200 L 380 140 L 480 180 L 580 120 L 680 160 L 800 180 L 800 400 L 0 400 Z" 
                    fill="url(#mountainGradient1)" opacity="0.6"/>
              
              {/* Mid mountains with more definition */}
              <path d="M 0 360 L 120 240 L 220 270 L 320 210 L 420 250 L 520 190 L 620 230 L 720 180 L 800 220 L 800 400 L 0 400 Z" 
                    fill="url(#mountainGradient2)" opacity="0.8"/>
              
              {/* Foreground mountains with sharp detail */}
              <path d="M 0 385 L 90 290 L 170 315 L 250 275 L 330 305 L 410 265 L 490 295 L 570 255 L 650 285 L 730 245 L 800 275 L 800 400 L 0 400 Z" 
                    fill="url(#mountainGradient3)" opacity="1"/>
              
              {/* Mountain peaks and ridges details */}
              <path d="M 180 160 L 185 155 L 190 165 M 380 140 L 385 135 L 390 145 M 580 120 L 585 115 L 590 125" 
                    stroke="#047857" strokeWidth="2" opacity="0.7"/>
            </g>
            
            {/* Realistic winding trail with depth and texture */}
            <defs>
              <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.8"/>
                <stop offset="50%" stopColor="#fb923c" stopOpacity="0.9"/>
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.8"/>
              </linearGradient>
            </defs>
            
            {/* Main trail path with realistic curves */}
            <path d="M 50 380 Q 150 350, 200 320 Q 300 280, 400 290 Q 500 300, 600 270 Q 700 240, 750 250" 
                  fill="none" stroke="url(#trailGradient)" strokeWidth="12" opacity="0.9"/>
            
            {/* Trail edges for depth */}
            <path d="M 50 384 Q 150 354, 200 324 Q 300 284, 400 294 Q 500 304, 600 274 Q 700 244, 750 254" 
                  fill="none" stroke="#ea580c" strokeWidth="2" opacity="0.7"/>
            <path d="M 50 376 Q 150 346, 200 316 Q 300 276, 400 286 Q 500 296, 600 266 Q 700 236, 750 246" 
                  fill="none" stroke="#ea580c" strokeWidth="2" opacity="0.7"/>
                  
            {/* Trail texture marks */}
            <g opacity="0.6">
              <line x1="100" y1="365" x2="105" y2="360" stroke="#dc2626" strokeWidth="1"/>
              <line x1="200" y1="320" x2="205" y2="315" stroke="#dc2626" strokeWidth="1"/>
              <line x1="350" y1="285" x2="355" y2="280" stroke="#dc2626" strokeWidth="1"/>
              <line x1="500" y1="300" x2="505" y2="295" stroke="#dc2626" strokeWidth="1"/>
              <line x1="650" y1="260" x2="655" y2="255" stroke="#dc2626" strokeWidth="1"/>
            </g>
            
            {/* Trail markers/posts */}
            <g opacity="0.7">
              <rect x="148" y="348" width="4" height="25" fill="#8b5a3c"/>
              <rect x="398" y="288" width="4" height="25" fill="#8b5a3c"/>
              <rect x="598" y="268" width="4" height="25" fill="#8b5a3c"/>
            </g>
            
            {/* Realistic running figures with detailed anatomy */}
            <g opacity="1">
              {/* Runner 1 - Detailed mid-stride pose */}
              <g transform="translate(200,310)">
                {/* Head */}
                <circle cx="0" cy="-20" r="10" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1"/>
                {/* Torso */}
                <ellipse cx="-1" cy="-5" rx="8" ry="15" fill="#3b82f6"/>
                {/* Arms in running motion */}
                <ellipse cx="-12" cy="-8" rx="3" ry="12" fill="#fbbf24" transform="rotate(-20)"/>
                <ellipse cx="10" cy="-12" rx="3" ry="12" fill="#fbbf24" transform="rotate(30)"/>
                {/* Legs in running stride */}
                <ellipse cx="-6" cy="12" rx="4" ry="18" fill="#1f2937" transform="rotate(-15)"/>
                <ellipse cx="4" cy="8" rx="4" ry="16" fill="#1f2937" transform="rotate(25)"/>
                {/* Running shoes */}
                <ellipse cx="-8" cy="28" rx="6" ry="3" fill="#dc2626" transform="rotate(-15)"/>
                <ellipse cx="8" cy="22" rx="6" ry="3" fill="#dc2626" transform="rotate(25)"/>
                {/* Movement blur effect */}
                <g opacity="0.3">
                  <ellipse cx="-2" cy="-5" rx="9" ry="16" fill="#3b82f6"/>
                  <ellipse cx="-3" cy="-5" rx="10" ry="17" fill="#3b82f6"/>
                </g>
              </g>
              
              {/* Runner 2 - Dynamic running pose */}
              <g transform="translate(450,280)">
                {/* Head */}
                <circle cx="0" cy="-20" r="10" fill="#f87171" stroke="#ef4444" strokeWidth="1"/>
                {/* Torso */}
                <ellipse cx="0" cy="-5" rx="8" ry="15" fill="#ef4444"/>
                {/* Arms pumping */}
                <ellipse cx="-10" cy="-6" rx="3" ry="11" fill="#f87171" transform="rotate(15)"/>
                <ellipse cx="12" cy="-10" rx="3" ry="11" fill="#f87171" transform="rotate(-25)"/>
                {/* Legs in full stride */}
                <ellipse cx="-4" cy="10" rx="4" ry="17" fill="#1f2937" transform="rotate(-10)"/>
                <ellipse cx="6" cy="12" rx="4" ry="19" fill="#1f2937" transform="rotate(20)"/>
                {/* Running shoes */}
                <ellipse cx="-6" cy="26" rx="6" ry="3" fill="#7c3aed" transform="rotate(-10)"/>
                <ellipse cx="10" cy="29" rx="6" ry="3" fill="#7c3aed" transform="rotate(20)"/>
                {/* Speed lines */}
                <g opacity="0.4">
                  <line x1="-20" y1="-10" x2="-15" y2="-8" stroke="#ef4444" strokeWidth="2"/>
                  <line x1="-18" y1="-5" x2="-13" y2="-3" stroke="#ef4444" strokeWidth="2"/>
                  <line x1="-16" y1="0" x2="-11" y2="2" stroke="#ef4444" strokeWidth="2"/>
                </g>
              </g>
              
              {/* Runner 3 - Approaching in distance */}
              <g transform="translate(600,260)" opacity="0.8">
                {/* Smaller figure for perspective */}
                <circle cx="0" cy="-15" r="7" fill="#a78bfa"/>
                <ellipse cx="0" cy="-2" rx="6" ry="12" fill="#8b5cf6"/>
                <ellipse cx="-8" cy="-4" rx="2" ry="8" fill="#a78bfa" transform="rotate(-10)"/>
                <ellipse cx="8" cy="-6" rx="2" ry="8" fill="#a78bfa" transform="rotate(20)"/>
                <ellipse cx="-3" cy="8" rx="3" ry="12" fill="#1f2937"/>
                <ellipse cx="3" cy="10" rx="3" ry="14" fill="#1f2937"/>
              </g>
            </g>
            
            {/* Detailed forest environment */}
            <g opacity="0.7">
              {/* Large foreground trees with detail */}
              <g>
                {/* Tree 1 - Pine tree */}
                <polygon points="120,320 105,340 135,340" fill="#047857"/>
                <polygon points="120,330 108,345 132,345" fill="#059669"/>
                <polygon points="120,340 110,355 130,355" fill="#10b981"/>
                <rect x="117" y="355" width="6" height="25" fill="#8b5a3c"/>
                <rect x="115" y="365" width="10" height="8" fill="#a3a3a3"/> {/* Tree base */}
              </g>
              
              <g>
                {/* Tree 2 - Deciduous tree */}
                <circle cx="320" cy="295" r="22" fill="#16a34a" opacity="0.9"/>
                <circle cx="315" cy="290" r="18" fill="#22c55e" opacity="0.8"/>
                <circle cx="325" cy="288" r="16" fill="#4ade80" opacity="0.7"/>
                <rect x="316" y="315" width="8" height="28" fill="#8b5a3c"/>
                <ellipse cx="320" cy="340" rx="12" ry="4" fill="#a3a3a3" opacity="0.6"/> {/* Shadow */}
              </g>
              
              <g>
                {/* Tree 3 - Background cluster */}
                <circle cx="680" cy="275" r="15" fill="#047857"/>
                <circle cx="690" cy="278" r="12" fill="#059669"/>
                <circle cx="670" cy="282" r="10" fill="#10b981"/>
                <rect x="677" y="290" width="6" height="20" fill="#8b5a3c"/>
                <rect x="687" y="292" width="4" height="15" fill="#8b5a3c"/>
                <rect x="668" y="294" width="4" height="12" fill="#8b5a3c"/>
              </g>
              
              {/* Bushes and undergrowth */}
              <ellipse cx="180" cy="360" rx="20" ry="12" fill="#22c55e" opacity="0.6"/>
              <ellipse cx="380" cy="350" rx="25" ry="15" fill="#16a34a" opacity="0.7"/>
              <ellipse cx="540" cy="320" rx="18" ry="10" fill="#059669" opacity="0.6"/>
              <ellipse cx="720" cy="310" rx="22" ry="14" fill="#10b981" opacity="0.8"/>
              
              {/* Rocks and trail details */}
              <ellipse cx="250" cy="330" rx="8" ry="5" fill="#6b7280" opacity="0.8"/>
              <ellipse cx="420" cy="295" rx="6" ry="4" fill="#9ca3af" opacity="0.7"/>
              <ellipse cx="580" cy="275" rx="10" ry="6" fill="#6b7280" opacity="0.8"/>
            </g>
            
            {/* Enhanced movement and atmospheric effects */}
            <g opacity="0.6">
              {/* Dust clouds from runners */}
              <g>
                <ellipse cx="180" cy="325" rx="8" ry="3" fill="#d97706" opacity="0.4"/>
                <ellipse cx="175" cy="328" rx="6" ry="2" fill="#f97316" opacity="0.3"/>
                <ellipse cx="185" cy="322" rx="4" ry="2" fill="#fb923c" opacity="0.5"/>
              </g>
              
              <g>
                <ellipse cx="430" cy="295" rx="9" ry="4" fill="#dc2626" opacity="0.4"/>
                <ellipse cx="425" cy="298" rx="7" ry="3" fill="#ef4444" opacity="0.3"/>
                <ellipse cx="435" cy="292" rx="5" ry="2" fill="#f87171" opacity="0.5"/>
              </g>
              
              {/* Footprint marks on trail */}
              <g opacity="0.4">
                <ellipse cx="160" cy="340" rx="3" ry="6" fill="#8b4513" transform="rotate(15)"/>
                <ellipse cx="165" cy="335" rx="3" ry="6" fill="#8b4513" transform="rotate(-10)"/>
                <ellipse cx="170" cy="330" rx="3" ry="6" fill="#8b4513" transform="rotate(20)"/>
                
                <ellipse cx="410" cy="300" rx="3" ry="6" fill="#8b4513" transform="rotate(10)"/>
                <ellipse cx="415" cy="295" rx="3" ry="6" fill="#8b4513" transform="rotate(-15)"/>
                <ellipse cx="420" cy="290" rx="3" ry="6" fill="#8b4513" transform="rotate(25)"/>
              </g>
              
              {/* Wind effect through leaves */}
              <g opacity="0.3">
                <path d="M 100 320 Q 110 315 120 320 Q 130 325 140 320" fill="none" stroke="#22c55e" strokeWidth="1"/>
                <path d="M 300 280 Q 310 275 320 280 Q 330 285 340 280" fill="none" stroke="#16a34a" strokeWidth="1"/>
                <path d="M 660 270 Q 670 265 680 270 Q 690 275 700 270" fill="none" stroke="#047857" strokeWidth="1"/>
              </g>
              
              {/* Birds in the sky */}
              <g opacity="0.5">
                <path d="M 200 180 Q 205 175 210 180 Q 215 185 220 180" fill="none" stroke="#374151" strokeWidth="1"/>
                <path d="M 500 160 Q 505 155 510 160 Q 515 165 520 160" fill="none" stroke="#374151" strokeWidth="1"/>
                <path d="M 650 140 Q 655 135 660 140 Q 665 145 670 140" fill="none" stroke="#374151" strokeWidth="1"/>
              </g>
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
              What started as a <span className="font-bold text-gray-900 font-display">lonely runner</span>, whose schedule didn't conform to conventional running clubs, 
              has become a platform for finding <span className="font-bold text-orange-600 font-display">companionship</span> to achieve goals, meet like-minded people, and improve{" "}
              <span className="font-bold text-green-700 font-display">mental health and well-being</span> through <span className="font-black text-green-800 font-display text-3xl md:text-4xl lg:text-5xl">shared experiences</span>.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-6xl mx-auto">
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
                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">Discover running events happening in your local area</p>
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
                onClick={() => setLocation("/training-plan-wizard")}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Target className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-800 transition-colors duration-300">Create Your Training Plan</h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">Get a personalised training plan and share your progress with friends</p>
              </button>
            </div>
            
            <br />
            
            {/* Get Started Section */}
            <div className="mt-16 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Started Today</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Ready to find your running community? Create events, build training plans, and share your journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/create-visual">
                  <Button 
                    size="lg" 
                    className="px-8 py-3 text-lg bg-orange-500 hover:bg-orange-600"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Event
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-8 py-3 text-lg border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() => {
                    const eventsSection = document.getElementById('events-near-me');
                    if (eventsSection) {
                      eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Find Events Near Me
                </Button>
                <Link href="/training-plan-wizard">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="px-8 py-3 text-lg border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    Create Training Plan
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

      <SmoothMobileNav />
      <Footer />
    </div>
    </>
  );
}
