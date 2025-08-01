import { useState } from "react";
import Navigation from "@/components/navigation";
import SmoothMobileNav from "@/components/smooth-mobile-nav";
import CommunityHeatMap from "@/components/community-heat-map";
import Footer from "@/components/footer";
import AnimatedRunningTrack from "@/components/animated-running-track";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Users, MapPin, Info } from "lucide-react";

export default function CommunityHeatMapPage() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Animated Running Track Background */}
      <AnimatedRunningTrack />
      
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mobile-content-padding relative z-10">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Community Heat Map
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the most active running zones in your community. See where runners gather, 
              when they run, and find your perfect training spots.
            </p>
          </div>

          {/* Feature Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6 text-center">
                <Activity className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-blue-900 mb-2">Activity Zones</h3>
                <p className="text-sm text-blue-700">
                  Visualise running activity density across different areas
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-900 mb-2">Trends & Insights</h3>
                <p className="text-sm text-green-700">
                  Track community running patterns and popular times
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6 text-center">
                <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold text-orange-900 mb-2">Discover Spots</h3>
                <p className="text-sm text-orange-700">
                  Find the best running locations based on community activity
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How to Use Guide */}
          <Card className="mb-8 border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                How to Use the Heat Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Understanding the Zones</h4>
                  <ul className="space-y-1 text-slate-600">
                    <li>• <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mr-1">Green</Badge> Low activity areas</li>
                    <li>• <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 mr-1">Yellow</Badge> Medium activity areas</li>
                    <li>• <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 mr-1">Orange</Badge> High activity areas</li>
                    <li>• <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 mr-1">Red</Badge> Very high activity areas</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Interactive Features</h4>
                  <ul className="space-y-1 text-slate-600">
                    <li>• Click zones to see detailed statistics</li>
                    <li>• Filter by time period to see trends</li>
                    <li>• Switch between event count and participant metrics</li>
                    <li>• View popular running times for each area</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Heat Map Component */}
        <CommunityHeatMap className="mb-8" />

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Community Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Peak Running Times</h4>
                  <p className="text-slate-600 mb-2">Most active periods across all zones:</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">Morning (6-12am)</Badge>
                    <Badge variant="outline">Evening (6-8pm)</Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Popular Distances</h4>
                  <p className="text-slate-600 mb-2">Most common running distances:</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">5km</Badge>
                    <Badge variant="outline">10km</Badge>
                    <Badge variant="outline">Half Marathon</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Activity Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Growing Areas</h4>
                  <p className="text-slate-600 mb-2">Zones with increasing activity:</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Parramatta Region</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">+25%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Eastern Suburbs</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">+18%</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Most Active Zones</h4>
                  <p className="text-slate-600 mb-2">Top performing areas this month:</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Sydney Harbour</span>
                      <Badge variant="secondary">45 events</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Central Park</span>
                      <Badge variant="secondary">38 events</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SmoothMobileNav />
      <Footer />
    </div>
  );
}