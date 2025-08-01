import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Plus } from "lucide-react";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import MobileNav from "@/components/mobile-nav";
import { format } from "date-fns";
import type { EventWithParticipants } from "@shared/schema";

export default function MyEvents() {
  const { user, isAuthenticated } = useAuth();

  const { data: userEvents = [], isLoading } = useQuery({
    queryKey: ["/api/events/user"],
    enabled: isAuthenticated,
  });

  const now = new Date();
  const upcomingEvents = userEvents.filter(event => {
    const eventDate = new Date(`${event.date}T${event.time}`);
    return eventDate > now;
  });

  const pastEvents = userEvents.filter(event => {
    const eventDate = new Date(`${event.date}T${event.time}`);
    return eventDate <= now;
  });

  const formatEventDate = (date: string, time: string) => {
    const eventDate = new Date(`${date}T${time}`);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (eventDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return format(eventDate, "MMM d, yyyy");
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case 'attending': return 'bg-green-100 text-green-800';
      case 'maybe': return 'bg-yellow-100 text-yellow-800';
      case 'interested': return 'bg-blue-100 text-blue-800';
      case 'not_attending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in to view your events</h1>
            <Link href="/auth">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">My Events</h1>
              <p className="text-slate-600">
                Manage your registered events and discover new ones
              </p>
            </div>
            <Link href="/create-visual">
              <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </Link>
          </div>

          {/* Upcoming Events */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Upcoming Events</h2>
              {upcomingEvents.length > 0 && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  {upcomingEvents.length}
                </Badge>
              )}
            </div>
            
            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-slate-200 rounded mb-4"></div>
                      <div className="h-4 bg-slate-200 rounded mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No upcoming events</h3>
                  <p className="text-slate-600 mb-4">
                    You haven't registered for any upcoming events yet.
                  </p>
                  <Link href="/">
                    <Button variant="outline">Browse Events</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {upcomingEvents.map((event: EventWithParticipants) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {event.title}
                          </h3>
                          <p className="text-slate-600 text-sm mb-3">{event.description}</p>
                        </div>
                        <Badge className={getAttendanceStatusColor(event.userAttendanceStatus || 'registered')}>
                          {event.userAttendanceStatus || 'Registered'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatEventDate(event.date, event.time)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(event.time)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{event.participants.length} joined</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Past Events</h2>
              <div className="grid gap-4">
                {pastEvents.slice(0, 5).map((event: EventWithParticipants) => (
                  <Card key={event.id} className="opacity-75">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-700 mb-2">
                            {event.title}
                          </h3>
                          <p className="text-slate-500 text-sm mb-3">{event.description}</p>
                        </div>
                        <Badge variant="outline" className="text-slate-500">
                          Completed
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatEventDate(event.date, event.time)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(event.time)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{event.participants.length} joined</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <MobileNav />
    </div>
  );
}