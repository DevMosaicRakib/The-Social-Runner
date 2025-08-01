import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Cloud, MapPin, TrendingUp, Users, Route, Calendar } from "lucide-react";
import EventMap from "./event-map";

interface StatsSidebarProps {
  user?: any;
}

export default function StatsSidebar({ user }: StatsSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Map */}
      <EventMap events={[]} />

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Your Running Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events Joined
            </span>
            <span className="font-semibold text-slate-900">
              {user?.eventsJoined || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600 flex items-center gap-2">
              <Route className="h-4 w-4" />
              Total Distance
            </span>
            <span className="font-semibold text-slate-900">
              {((user?.totalDistance || 0) / 1000).toFixed(1)} km
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Running Buddies
            </span>
            <span className="font-semibold text-slate-900">
              {user?.buddies || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              This Month
            </span>
            <span className="font-semibold text-[hsl(14,100%,60%)]">
              {Math.floor((user?.eventsJoined || 0) / 3)} runs
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Weather */}
      <Card>
        <CardHeader>
          <CardTitle>Running Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sun className="text-yellow-500 h-5 w-5" />
              <span className="text-slate-600">Today</span>
            </div>
            <span className="font-medium text-slate-900">22°C</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cloud className="text-slate-400 h-5 w-5" />
              <span className="text-slate-600">Tomorrow</span>
            </div>
            <span className="font-medium text-slate-900">18°C</span>
          </div>
          <div className="text-xs text-slate-500 mt-2 p-2 bg-green-50 rounded">
            Perfect running weather! ☀️
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
