import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Users, 
  Target, 
  Clock,
  DollarSign,
  MapPin,
  Calendar,
  MessageCircle,
  Award,
  Zap,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Home
} from "lucide-react";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import SmoothMobileNav from "@/components/smooth-mobile-nav";
import Footer from "@/components/footer";
import JigsawConnection, { JigsawConnectionMini } from "@/components/jigsaw-connection";
import SEOHead from "@/components/seo-head";

export default function AboutPage() {
  return (
    <>
      <SEOHead
        title="About The Social Runner - Our Story & Mission"
        description="Learn about The Social Runner's mission to connect runners across Australia through local events, training plans, and community building. Discover our founder's inspiring journey and vision."
        keywords="about social runner, running community Australia, founder story, mission, vision, local running events, community building"
        ogType="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About The Social Runner",
          "description": "The story behind Australia's premier running community platform",
          "mainEntity": {
            "@type": "Organization",
            "name": "The Social Runner",
            "description": "Australia's premier running community connecting runners through events, training plans, and social networking",
            "foundingDate": "2025",
            "founder": {
              "@type": "Person",
              "name": "Founder"
            },
            "mission": "To connect runners across Australia and build inclusive communities through organized running events and social connections",
            "areaServed": {
              "@type": "Country",
              "name": "Australia"
            }
          }
        }}
      />
      <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="container mx-auto py-6 px-4 mobile-content-padding">
        <div className="max-w-4xl mx-auto">
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
          
          {/* Hero Section */}
          <div className="text-center mb-12 relative">
            {/* Jigsaw Connection Visual in corner */}
            <div className="absolute top-0 right-0 w-24 h-18 opacity-20">
              <JigsawConnection opacity={0.3} className="w-full h-full" showIcons={false} />
            </div>
            
            <div className="mb-6">
              <Badge variant="secondary" className="mb-4 px-4 py-2">
                Our Purpose
              </Badge>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Creating Change Through Community
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Building a supportive community of runners who uplift, encourage, and inspire each other to achieve their goals while fostering genuine connections that extend beyond running
              </p>
            </div>
          </div>

          {/* Origin Story */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Heart className="h-6 w-6 text-red-500" />
                The Vision for Change
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Running has the power to transform lives, but it's even more powerful when we don't run alone. 
                We believe that every runner deserves a supportive community where they feel welcomed, encouraged, 
                and valued regardless of their pace, distance, or experience level.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                The change we're creating starts with breaking down barriers - the intimidation of joining established groups, 
                the pressure of keeping up, and the isolation that many runners face. We're building something different: 
                a space where vulnerability is strength, where celebrating small victories matters as much as big achievements, 
                and where genuine friendships form through shared miles and mutual support.
              </p>
              <p className="text-gray-700 leading-relaxed">
                This isn't just about finding running partners - it's about creating lasting positive change in people's lives. 
                When runners support each other, they build confidence, resilience, and connections that extend far beyond the trail. 
                Together, we're proving that community can transform not just how we run, but how we live.
              </p>
            </CardContent>
          </Card>

          {/* Why We Need This */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Time Flexibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Not everyone can commit to fixed club schedules. Work, family, and life happen. 
                  We make it easy to find running partners when it works for you.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  No Financial Barriers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Running should be accessible to everyone. No membership fees, no joining costs - 
                  just a community of runners supporting each other.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Inclusive Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Whether you're a beginner taking your first steps or an experienced marathoner, 
                  everyone belongs here. All paces, all distances, all goals.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  Local Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Find runners in your neighborhood, discover new routes, and build friendships 
                  that extend beyond running.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Our Impact */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Target className="h-6 w-6 text-orange-500" />
                The Change We're Making
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6 text-lg font-medium">
                  Creating a movement where every runner has access to a supportive community, 
                  fostering personal growth, mental wellbeing, and meaningful connections through the power of running together.
                </p>
                {/* The Connection Illustration */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    <JigsawConnection opacity={0.8} className="w-80 h-60" showIcons={true} />
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <JigsawConnectionMini size="sm" className="mx-auto" />
                    </div>
                  </div>
                  <p className="text-center text-gray-600 mt-4 max-w-md">
                    Running, mental health, and community - three essential pieces that fit together to create positive change
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <MessageCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Building Confidence</h4>
                    <p className="text-sm text-gray-600">
                      Empowering runners of all levels to believe in themselves through community support and encouragement
                    </p>
                  </div>
                  <div className="text-center">
                    <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Mental Wellbeing</h4>
                    <p className="text-sm text-gray-600">
                      Creating positive mental health impacts through social connection, shared achievement, and belonging
                    </p>
                  </div>
                  <div className="text-center">
                    <Award className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Lasting Change</h4>
                    <p className="text-sm text-gray-600">
                      Fostering personal growth and resilience that extends beyond running into all areas of life
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What Makes Us Different */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">What Makes The Social Runner Different</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    Create Your Own Events
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Design runs that fit your schedule and invite others to join. 
                    From early morning coffee runs to weekend trail adventures - you decide.
                  </p>
                  
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    Community-Driven
                  </h4>
                  <p className="text-gray-600">
                    Every event is created by runners like you. Share your favorite routes, 
                    explore new areas, and build the running community you want to be part of.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-500" />
                    All Abilities
                  </h4>
                  <p className="text-gray-600 mb-4">
                    From 5K beginners to ultra marathoners, create events that welcome everyone 
                    and help you find your perfect training partners.
                  </p>
                  
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-orange-500" />
                    Community First
                  </h4>
                  <p className="text-gray-600">
                    Built by runners, for runners. We understand the unique needs and 
                    challenges of the running community.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Mail className="h-6 w-6 text-orange-500" />
                Get in Touch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-6">
                  Have questions, suggestions, or want to share your running story? We'd love to hear from you!
                </p>
                
                {/* Email Contact */}
                <div className="mb-8">
                  <a 
                    href="mailto:ian@thesocialrunner.com.au" 
                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors font-medium text-lg"
                  >
                    <Mail className="h-5 w-5" />
                    ian@thesocialrunner.com.au
                  </a>
                </div>

                {/* Social Media Links */}
                <div className="flex justify-center gap-6">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 cursor-not-allowed opacity-60"
                    disabled
                  >
                    <Facebook className="h-5 w-5 text-blue-600" />
                    Facebook
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="flex items-center gap-2 hover:bg-pink-50 hover:border-pink-300 cursor-not-allowed opacity-60"
                    disabled
                  >
                    <Instagram className="h-5 w-5 text-pink-600" />
                    Instagram
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 cursor-not-allowed opacity-60"
                    disabled
                  >
                    <Twitter className="h-5 w-5 text-blue-500" />
                    Twitter
                  </Button>
                </div>
                
                <p className="text-sm text-gray-500 mt-4">
                  Social media profiles coming soon!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="text-center">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold mb-4">Join the Movement for Positive Change</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Be part of building a supportive running community where every runner belongs. 
                Create events, connect with others, and help us prove that together we can achieve more 
                than we ever could alone.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/">
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                    Explore Events
                  </Button>
                </Link>
                <Link href="/create">
                  <Button size="lg" variant="outline">
                    Create Your First Event
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <SmoothMobileNav />
      <Footer />
    </div>
    </>
  );
}