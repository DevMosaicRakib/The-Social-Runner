import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Calendar, Clock } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Background Running Track SVG */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" viewBox="0 0 800 600" className="absolute top-0 left-0">
          {/* Running Track */}
          <ellipse cx="400" cy="300" rx="350" ry="200" fill="none" stroke="#22c55e" strokeWidth="30" strokeDasharray="50,20" opacity="0.3"/>
          <ellipse cx="400" cy="300" rx="280" ry="130" fill="none" stroke="#16a34a" strokeWidth="20" strokeDasharray="30,15" opacity="0.2"/>
          
          {/* Trees around the track */}
          <g opacity="0.4">
            <circle cx="100" cy="150" r="25" fill="#22c55e"/>
            <rect x="95" y="175" width="10" height="20" fill="#8b5a3c"/>
            <circle cx="150" cy="120" r="30" fill="#16a34a"/>
            <rect x="145" y="150" width="10" height="25" fill="#8b5a3c"/>
            <circle cx="650" cy="180" r="28" fill="#22c55e"/>
            <rect x="645" y="208" width="10" height="22" fill="#8b5a3c"/>
            <circle cx="700" cy="450" r="32" fill="#16a34a"/>
            <rect x="695" y="482" width="10" height="28" fill="#8b5a3c"/>
          </g>
          
          {/* Running figures */}
          <g opacity="0.6">
            {/* Runner 1 */}
            <g transform="translate(200,250)">
              <circle cx="0" cy="-15" r="8" fill="#fbbf24"/> {/* head */}
              <rect x="-3" y="-7" width="6" height="15" fill="#3b82f6" rx="3"/> {/* body */}
              <rect x="-6" y="8" width="3" height="12" fill="#1f2937" rx="1"/> {/* legs */}
              <rect x="3" y="8" width="3" height="12" fill="#1f2937" rx="1"/>
            </g>
            
            {/* Runner 2 */}
            <g transform="translate(350,200)">
              <circle cx="0" cy="-15" r="8" fill="#f87171"/> {/* head */}
              <rect x="-3" y="-7" width="6" height="15" fill="#ef4444" rx="3"/> {/* body */}
              <rect x="-6" y="8" width="3" height="12" fill="#1f2937" rx="1"/> {/* legs */}
              <rect x="3" y="8" width="3" height="12" fill="#1f2937" rx="1"/>
            </g>
            
            {/* Runner 3 */}
            <g transform="translate(550,380)">
              <circle cx="0" cy="-15" r="8" fill="#a78bfa"/> {/* head */}
              <rect x="-3" y="-7" width="6" height="15" fill="#8b5cf6" rx="3"/> {/* body */}
              <rect x="-6" y="8" width="3" height="12" fill="#1f2937" rx="1"/> {/* legs */}
              <rect x="3" y="8" width="3" height="12" fill="#1f2937" rx="1"/>
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
            {/* Community Running Illustration */}
            <svg width="200" height="120" viewBox="0 0 200 120" className="mx-auto mb-6 opacity-80">
              {/* Group of cartoon runners */}
              <g>
                {/* Runner 1 - Leading */}
                <g transform="translate(50,60)">
                  <circle cx="0" cy="-25" r="12" fill="#fbbf24"/> {/* head */}
                  <rect x="-5" y="-13" width="10" height="20" fill="#3b82f6" rx="5"/> {/* body */}
                  <rect x="-8" y="7" width="4" height="18" fill="#1f2937" rx="2"/> {/* legs */}
                  <rect x="4" y="7" width="4" height="18" fill="#1f2937" rx="2"/>
                  <rect x="-12" y="-5" width="6" height="3" fill="#fbbf24" rx="1"/> {/* arms */}
                  <rect x="6" y="-5" width="6" height="3" fill="#fbbf24" rx="1"/>
                </g>
                
                {/* Runner 2 - Middle */}
                <g transform="translate(100,65)">
                  <circle cx="0" cy="-25" r="12" fill="#f87171"/> {/* head */}
                  <rect x="-5" y="-13" width="10" height="20" fill="#ef4444" rx="5"/> {/* body */}
                  <rect x="-8" y="7" width="4" height="18" fill="#1f2937" rx="2"/> {/* legs */}
                  <rect x="4" y="7" width="4" height="18" fill="#1f2937" rx="2"/>
                  <rect x="-12" y="-5" width="6" height="3" fill="#f87171" rx="1"/> {/* arms */}
                  <rect x="6" y="-5" width="6" height="3" fill="#f87171" rx="1"/>
                </g>
                
                {/* Runner 3 - Following */}
                <g transform="translate(150,70)">
                  <circle cx="0" cy="-25" r="12" fill="#a78bfa"/> {/* head */}
                  <rect x="-5" y="-13" width="10" height="20" fill="#8b5cf6" rx="5"/> {/* body */}
                  <rect x="-8" y="7" width="4" height="18" fill="#1f2937" rx="2"/> {/* legs */}
                  <rect x="4" y="7" width="4" height="18" fill="#1f2937" rx="2"/>
                  <rect x="-12" y="-5" width="6" height="3" fill="#a78bfa" rx="1"/> {/* arms */}
                  <rect x="6" y="-5" width="6" height="3" fill="#a78bfa" rx="1"/>
                </g>
                
                {/* Motion lines */}
                <g opacity="0.5">
                  <line x1="20" y1="70" x2="10" y2="70" stroke="#94a3b8" strokeWidth="2"/>
                  <line x1="25" y1="75" x2="15" y2="75" stroke="#94a3b8" strokeWidth="2"/>
                  <line x1="70" y1="75" x2="60" y2="75" stroke="#94a3b8" strokeWidth="2"/>
                  <line x1="75" y1="80" x2="65" y2="80" stroke="#94a3b8" strokeWidth="2"/>
                  <line x1="120" y1="80" x2="110" y2="80" stroke="#94a3b8" strokeWidth="2"/>
                  <line x1="125" y1="85" x2="115" y2="85" stroke="#94a3b8" strokeWidth="2"/>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
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
    </div>
  );
}