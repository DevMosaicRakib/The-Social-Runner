import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Calendar, Clock, Target } from "lucide-react";
import Footer from "@/components/footer";
import { JigsawConnectionMini } from "@/components/jigsaw-connection";
import SEOHead from "@/components/seo-head";

export default function Landing() {
  return (
    <>
      <SEOHead
        title="Welcome to Australia's Premier Running Community"
        description="Join thousands of runners across Australia. Discover local running events, create your own runs, find training partners, and build lasting friendships through our social running platform."
        keywords="running events Australia, find running groups, social running, running community, parkrun, marathon training, running clubs Australia, fitness events"
        ogType="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "The Social Runner",
          "description": "Australia's premier running community connecting runners through events, training plans, and social networking",
          "url": "https://the-social-runner.replit.app",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://the-social-runner.replit.app/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          },
          "audience": {
            "@type": "Audience",
            "audienceType": "Runners, Fitness Enthusiasts, Sports Community"
          },
          "about": [
            {
              "@type": "Thing",
              "name": "Running Events"
            },
            {
              "@type": "Thing", 
              "name": "Social Running"
            },
            {
              "@type": "Thing",
              "name": "Fitness Community"
            }
          ]
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Enhanced Background Running Environment */}
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%" viewBox="0 0 800 600" className="absolute top-0 left-0">
          {/* Professional Running Track with Lane Lines */}
          <defs>
            <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4"/>
              <stop offset="50%" stopColor="#16a34a" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.4"/>
            </linearGradient>
          </defs>
          
          {/* Main track surface */}
          <ellipse cx="400" cy="300" rx="350" ry="200" fill="url(#trackGradient)" opacity="0.6"/>
          
          {/* Track lanes */}
          <ellipse cx="400" cy="300" rx="350" ry="200" fill="none" stroke="#047857" strokeWidth="3" opacity="0.8"/>
          <ellipse cx="400" cy="300" rx="320" ry="170" fill="none" stroke="#047857" strokeWidth="2" opacity="0.6"/>
          <ellipse cx="400" cy="300" rx="290" ry="140" fill="none" stroke="#047857" strokeWidth="2" opacity="0.6"/>
          <ellipse cx="400" cy="300" rx="260" ry="110" fill="none" stroke="#047857" strokeWidth="2" opacity="0.6"/>
          
          {/* Starting line and finish markers */}
          <rect x="398" y="100" width="4" height="40" fill="#dc2626" opacity="0.8"/>
          <rect x="378" y="105" width="44" height="2" fill="#dc2626" opacity="0.8"/>
          <rect x="378" y="130" width="44" height="2" fill="#dc2626" opacity="0.8"/>
          
          {/* Realistic stadium environment */}
          <g opacity="0.7">
            {/* Stadium lights/poles */}
            <g>
              <rect x="48" y="180" width="4" height="80" fill="#6b7280"/>
              <circle cx="50" cy="175" r="8" fill="#fbbf24" opacity="0.8"/>
              <rect x="748" y="380" width="4" height="80" fill="#6b7280"/>
              <circle cx="750" cy="375" r="8" fill="#fbbf24" opacity="0.8"/>
            </g>
            
            {/* Landscaping around track */}
            <g>
              {/* Tree clusters */}
              <g>
                <circle cx="100" cy="150" r="28" fill="#059669" opacity="0.9"/>
                <circle cx="95" cy="145" r="22" fill="#22c55e" opacity="0.8"/>
                <circle cx="105" cy="142" r="18" fill="#4ade80" opacity="0.7"/>
                <rect x="97" y="175" width="6" height="25" fill="#8b5a3c"/>
                <ellipse cx="100" cy="198" rx="15" ry="4" fill="#a3a3a3" opacity="0.4"/>
              </g>
              
              <g>
                <circle cx="150" cy="120" r="32" fill="#16a34a" opacity="0.9"/>
                <circle cx="145" cy="115" r="26" fill="#22c55e" opacity="0.8"/>
                <circle cx="155" cy="112" r="20" fill="#4ade80" opacity="0.7"/>
                <rect x="147" y="148" width="6" height="28" fill="#8b5a3c"/>
                <ellipse cx="150" cy="174" rx="18" ry="5" fill="#a3a3a3" opacity="0.4"/>
              </g>
              
              <g>
                <circle cx="650" cy="180" r="30" fill="#047857" opacity="0.9"/>
                <circle cx="645" cy="175" r="24" fill="#059669" opacity="0.8"/>
                <circle cx="655" cy="172" r="19" fill="#22c55e" opacity="0.7"/>
                <rect x="647" y="205" width="6" height="24" fill="#8b5a3c"/>
                <ellipse cx="650" cy="227" rx="16" ry="4" fill="#a3a3a3" opacity="0.4"/>
              </g>
              
              <g>
                <circle cx="700" cy="450" r="35" fill="#15803d" opacity="0.9"/>
                <circle cx="695" cy="445" r="28" fill="#16a34a" opacity="0.8"/>
                <circle cx="705" cy="442" r="22" fill="#22c55e" opacity="0.7"/>
                <rect x="697" y="478" width="6" height="30" fill="#8b5a3c"/>
                <ellipse cx="700" cy="506" rx="20" ry="5" fill="#a3a3a3" opacity="0.4"/>
              </g>
            </g>
            
            {/* Stadium seating suggestion */}
            <g opacity="0.3">
              <rect x="50" y="50" width="100" height="20" fill="#6b7280" rx="10"/>
              <rect x="55" y="55" width="90" height="3" fill="#9ca3af"/>
              <rect x="55" y="62" width="90" height="3" fill="#9ca3af"/>
              
              <rect x="650" y="530" width="100" height="20" fill="#6b7280" rx="10"/>
              <rect x="655" y="535" width="90" height="3" fill="#9ca3af"/>
              <rect x="655" y="542" width="90" height="3" fill="#9ca3af"/>
            </g>
          </g>
          
          {/* Realistic running athletes */}
          <g opacity="0.9">
            {/* Runner 1 - Professional stride */}
            <g transform="translate(200,250)">
              <circle cx="0" cy="-18" r="9" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1"/>
              <ellipse cx="0" cy="-3" rx="7" ry="14" fill="#3b82f6"/>
              <ellipse cx="-10" cy="-6" rx="2.5" ry="10" fill="#fbbf24" transform="rotate(-25)"/>
              <ellipse cx="9" cy="-8" rx="2.5" ry="10" fill="#fbbf24" transform="rotate(20)"/>
              <ellipse cx="-4" cy="12" rx="3.5" ry="16" fill="#1f2937" transform="rotate(-12)"/>
              <ellipse cx="5" cy="10" rx="3.5" ry="14" fill="#1f2937" transform="rotate(18)"/>
              <ellipse cx="-6" cy="26" rx="5" ry="2.5" fill="#dc2626" transform="rotate(-12)"/>
              <ellipse cx="8" cy="22" rx="5" ry="2.5" fill="#dc2626" transform="rotate(18)"/>
              {/* Athletic wear details */}
              <rect x="-1" y="-1" width="2" height="8" fill="#1e40af"/> {/* Racing stripe */}
              <circle cx="0" cy="-18" r="3" fill="#374151" opacity="0.3"/> {/* Running cap */}
            </g>
            
            {/* Runner 2 - Mid-pack runner */}
            <g transform="translate(350,200)">
              <circle cx="0" cy="-18" r="9" fill="#f87171" stroke="#ef4444" strokeWidth="1"/>
              <ellipse cx="0" cy="-3" rx="7" ry="14" fill="#ef4444"/>
              <ellipse cx="-8" cy="-5" rx="2.5" ry="9" fill="#f87171" transform="rotate(15)"/>
              <ellipse cx="10" cy="-7" rx="2.5" ry="9" fill="#f87171" transform="rotate(-20)"/>
              <ellipse cx="-3" cy="11" rx="3.5" ry="15" fill="#1f2937" transform="rotate(-8)"/>
              <ellipse cx="6" cy="13" rx="3.5" ry="17" fill="#1f2937" transform="rotate(15)"/>
              <ellipse cx="-5" cy="25" rx="5" ry="2.5" fill="#7c3aed" transform="rotate(-8)"/>
              <ellipse cx="9" cy="28" rx="5" ry="2.5" fill="#7c3aed" transform="rotate(15)"/>
              {/* Water bottle */}
              <ellipse cx="12" cy="-2" rx="1.5" ry="4" fill="#60a5fa" transform="rotate(-20)"/>
            </g>
            
            {/* Runner 3 - Recreational runner */}
            <g transform="translate(550,380)">
              <circle cx="0" cy="-18" r="9" fill="#a78bfa" stroke="#8b5cf6" strokeWidth="1"/>
              <ellipse cx="0" cy="-3" rx="7" ry="14" fill="#8b5cf6"/>
              <ellipse cx="-9" cy="-4" rx="2.5" ry="8" fill="#a78bfa" transform="rotate(10)"/>
              <ellipse cx="8" cy="-6" rx="2.5" ry="8" fill="#a78bfa" transform="rotate(-15)"/>
              <ellipse cx="-3" cy="12" rx="3.5" ry="14" fill="#1f2937" transform="rotate(-5)"/>
              <ellipse cx="4" cy="14" rx="3.5" ry="16" fill="#1f2937" transform="rotate(12)"/>
              <ellipse cx="-4" cy="25" rx="5" ry="2.5" fill="#22c55e" transform="rotate(-5)"/>
              <ellipse cx="6" cy="28" rx="5" ry="2.5" fill="#22c55e" transform="rotate(12)"/>
              {/* Headphones */}
              <ellipse cx="-7" cy="-18" rx="2" ry="1" fill="#374151"/>
              <ellipse cx="7" cy="-18" rx="2" ry="1" fill="#374151"/>
              <path d="M -5 -25 Q 0 -28 5 -25" fill="none" stroke="#374151" strokeWidth="1"/>
            </g>
            
            {/* Runner 4 - Distance runner */}
            <g transform="translate(450,320)" opacity="0.8">
              <circle cx="0" cy="-16" r="8" fill="#34d399"/>
              <ellipse cx="0" cy="-2" rx="6" ry="12" fill="#10b981"/>
              <ellipse cx="-7" cy="-4" rx="2" ry="7" fill="#34d399" transform="rotate(8)"/>
              <ellipse cx="7" cy="-5" rx="2" ry="7" fill="#34d399" transform="rotate(-12)"/>
              <ellipse cx="-2" cy="10" rx="3" ry="13" fill="#1f2937"/>
              <ellipse cx="3" cy="12" rx="3" ry="15" fill="#1f2937" transform="rotate(8)"/>
              <ellipse cx="-3" cy="22" rx="4" ry="2" fill="#f59e0b"/>
              <ellipse cx="5" cy="25" rx="4" ry="2" fill="#f59e0b" transform="rotate(8)"/>
            </g>
          </g>
          
          {/* Clouds */}
          <g opacity="0.3">
            <ellipse cx="150" cy="80" rx="25" ry="15" fill="white"/>
            <ellipse cx="140" cy="85" rx="20" ry="12" fill="white"/>
            <ellipse cx="160" cy="85" rx="20" ry="12" fill="white"/>
            
            <ellipse cx="600" cy="60" rx="30" ry="18" fill="white"/>
            <ellipse cx="590" cy="65" rx="25" ry="15" fill="white"/>
            <ellipse cx="610" cy="65" rx="25" ry="15" fill="white"/>
          </g>
        </svg>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            {/* Enhanced Community Running Illustration */}
            <svg width="280" height="160" viewBox="0 0 280 160" className="mx-auto mb-6 opacity-90">
              {/* Realistic community running group */}
              <g>
                {/* Running path/ground */}
                <ellipse cx="140" cy="130" rx="120" ry="20" fill="#22c55e" opacity="0.3"/>
                <path d="M 20 130 Q 140 125 260 130" fill="none" stroke="#16a34a" strokeWidth="4" opacity="0.5"/>
                
                {/* Runner 1 - Group leader */}
                <g transform="translate(60,80)">
                  <circle cx="0" cy="-28" r="14" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1"/>
                  <ellipse cx="0" cy="-8" rx="8" ry="18" fill="#3b82f6"/>
                  <ellipse cx="-12" cy="-12" rx="3" ry="12" fill="#fbbf24" transform="rotate(-30)"/>
                  <ellipse cx="11" cy="-15" rx="3" ry="12" fill="#fbbf24" transform="rotate(25)"/>
                  <ellipse cx="-6" cy="12" rx="4" ry="20" fill="#1f2937" transform="rotate(-20)"/>
                  <ellipse cx="7" cy="8" rx="4" ry="18" fill="#1f2937" transform="rotate(30)"/>
                  <ellipse cx="-9" cy="30" rx="6" ry="3" fill="#dc2626" transform="rotate(-20)"/>
                  <ellipse cx="11" cy="24" rx="6" ry="3" fill="#dc2626" transform="rotate(30)"/>
                  {/* Athletic details */}
                  <rect x="-1" y="-6" width="2" height="12" fill="#1e40af"/>
                  <circle cx="0" cy="-28" r="4" fill="#374151" opacity="0.4"/> {/* Running cap */}
                </g>
                
                {/* Runner 2 - Following close */}
                <g transform="translate(120,85)">
                  <circle cx="0" cy="-28" r="14" fill="#f87171" stroke="#ef4444" strokeWidth="1"/>
                  <ellipse cx="0" cy="-8" rx="8" ry="18" fill="#ef4444"/>
                  <ellipse cx="-10" cy="-10" rx="3" ry="11" fill="#f87171" transform="rotate(18)"/>
                  <ellipse cx="12" cy="-13" rx="3" ry="11" fill="#f87171" transform="rotate(-28)"/>
                  <ellipse cx="-4" cy="14" rx="4" ry="19" fill="#1f2937" transform="rotate(-15)"/>
                  <ellipse cx="8" cy="10" rx="4" ry="17" fill="#1f2937" transform="rotate(25)"/>
                  <ellipse cx="-7" cy="31" rx="6" ry="3" fill="#7c3aed" transform="rotate(-15)"/>
                  <ellipse cx="12" cy="25" rx="6" ry="3" fill="#7c3aed" transform="rotate(25)"/>
                  {/* Water bottle in hand */}
                  <ellipse cx="14" cy="-8" rx="2" ry="5" fill="#60a5fa" transform="rotate(-28)"/>
                </g>
                
                {/* Runner 3 - Recreational pace */}
                <g transform="translate(180,90)">
                  <circle cx="0" cy="-28" r="14" fill="#a78bfa" stroke="#8b5cf6" strokeWidth="1"/>
                  <ellipse cx="0" cy="-8" rx="8" ry="18" fill="#8b5cf6"/>
                  <ellipse cx="-11" cy="-8" rx="3" ry="10" fill="#a78bfa" transform="rotate(12)"/>
                  <ellipse cx="9" cy="-11" rx="3" ry="10" fill="#a78bfa" transform="rotate(-18)"/>
                  <ellipse cx="-3" cy="16" rx="4" ry="18" fill="#1f2937" transform="rotate(-8)"/>
                  <ellipse cx="6" cy="12" rx="4" ry="16" fill="#1f2937" transform="rotate(20)"/>
                  <ellipse cx="-4" cy="32" rx="6" ry="3" fill="#22c55e" transform="rotate(-8)"/>
                  <ellipse cx="9" cy="26" rx="6" ry="3" fill="#22c55e" transform="rotate(20)"/>
                  {/* Wireless earbuds */}
                  <circle cx="-10" cy="-28" r="2" fill="#374151"/>
                  <circle cx="10" cy="-28" r="2" fill="#374151"/>
                </g>
                
                {/* Runner 4 - Keeping up */}
                <g transform="translate(240,95)" opacity="0.9">
                  <circle cx="0" cy="-26" r="12" fill="#34d399"/>
                  <ellipse cx="0" cy="-6" rx="7" ry="16" fill="#10b981"/>
                  <ellipse cx="-9" cy="-8" rx="2.5" ry="9" fill="#34d399" transform="rotate(15)"/>
                  <ellipse cx="8" cy="-10" rx="2.5" ry="9" fill="#34d399" transform="rotate(-20)"/>
                  <ellipse cx="-2" cy="12" rx="3.5" ry="16" fill="#1f2937" transform="rotate(-5)"/>
                  <ellipse cx="5" cy="14" rx="3.5" ry="18" fill="#1f2937" transform="rotate(15)"/>
                  <ellipse cx="-3" cy="27" rx="5" ry="2.5" fill="#f59e0b" transform="rotate(-5)"/>
                  <ellipse cx="7" cy="30" rx="5" ry="2.5" fill="#f59e0b" transform="rotate(15)"/>
                </g>
                
                {/* Enhanced motion effects */}
                <g opacity="0.6">
                  {/* Speed lines behind runners */}
                  <g>
                    <line x1="35" y1="90" x2="25" y2="88" stroke="#3b82f6" strokeWidth="3"/>
                    <line x1="40" y1="95" x2="30" y2="93" stroke="#3b82f6" strokeWidth="2"/>
                    <line x1="45" y1="100" x2="35" y2="98" stroke="#3b82f6" strokeWidth="2"/>
                  </g>
                  <g>
                    <line x1="95" y1="95" x2="85" y2="93" stroke="#ef4444" strokeWidth="3"/>
                    <line x1="100" y1="100" x2="90" y2="98" stroke="#ef4444" strokeWidth="2"/>
                    <line x1="105" y1="105" x2="95" y2="103" stroke="#ef4444" strokeWidth="2"/>
                  </g>
                  <g>
                    <line x1="155" y1="100" x2="145" y2="98" stroke="#8b5cf6" strokeWidth="3"/>
                    <line x1="160" y1="105" x2="150" y2="103" stroke="#8b5cf6" strokeWidth="2"/>
                    <line x1="165" y1="110" x2="155" y2="108" stroke="#8b5cf6" strokeWidth="2"/>
                  </g>
                  
                  {/* Dust clouds */}
                  <ellipse cx="50" cy="110" rx="8" ry="3" fill="#d4d4d4" opacity="0.5"/>
                  <ellipse cx="110" cy="115" rx="8" ry="3" fill="#d4d4d4" opacity="0.5"/>
                  <ellipse cx="170" cy="120" rx="8" ry="3" fill="#d4d4d4" opacity="0.5"/>
                  <ellipse cx="230" cy="125" rx="6" ry="2" fill="#d4d4d4" opacity="0.4"/>
                </g>
              </g>
            </svg>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            The Social Runner
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            What started as a lonely runner's journey has become a platform for finding companionship, achieving goals, and improving mental health through shared running experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="px-8 py-3 text-lg bg-orange-500 hover:bg-orange-600"
              onClick={() => window.location.href = '/auth?mode=register'}
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="px-8 py-3 text-lg border-orange-500 text-orange-600 hover:bg-orange-50"
              onClick={() => window.location.href = '/auth'}
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <MapPin className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Location-Based</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Find running events near you with interactive map integration
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Calendar className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Schedule Events</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create and organise running events with specific dates and times
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="w-12 h-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>Build Community</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect with runners who share your pace and interests
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Clock className="w-12 h-12 mx-auto text-orange-600 mb-4" />
              <CardTitle>Flexible Timing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Join events that fit your schedule, from early morning to evening runs
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Target className="w-12 h-12 mx-auto text-red-600 mb-4" />
              <CardTitle>Training Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Build your own running plan powered by professionals, tailored to your goals and targets
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Start Running Together?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Join our community of runners and never run alone again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="px-8 py-3 text-lg bg-orange-500 hover:bg-orange-600"
              onClick={() => window.location.href = '/auth?mode=register'}
            >
              Join Now
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="px-8 py-3 text-lg"
              onClick={() => window.location.href = '/auth'}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
      <Footer />
      </div>
    </>
  );
}