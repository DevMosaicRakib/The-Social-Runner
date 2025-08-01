import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Filter,
  Eye,
  Grid3x3,
  List,
  TrendingUp
} from "lucide-react";
import type { EventWithParticipants } from "@shared/schema";

interface CalendarEvent extends EventWithParticipants {
  userAttendanceStatus?: string;
}

interface InteractiveCalendarProps {
  className?: string;
  showFilters?: boolean;
  showStats?: boolean;
}

export default function InteractiveCalendar({ 
  className, 
  showFilters = true, 
  showStats = true 
}: InteractiveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [distanceFilter, setDistanceFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [attendanceFilter, setAttendanceFilter] = useState<string>("all");

  // Fetch all events
  const { data: allEvents, isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/events"],
    retry: false,
  });

  // Fetch user events for attendance status
  const { data: userEvents } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/events/user"],
    retry: false,
  });

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToPreviousWeek = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const goToNextWeek = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    if (!allEvents) return [];

    return allEvents.filter(event => {
      // Distance filter
      if (distanceFilter !== "all") {
        const eventDistance = parseFloat(event.distance.replace(/[^\d.]/g, ''));
        const maxDistance = parseInt(distanceFilter);
        if (eventDistance > maxDistance) return false;
      }

      // Time filter
      if (timeFilter !== "all") {
        const now = new Date();
        const eventDate = new Date(event.date);
        const hoursDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        switch (timeFilter) {
          case "24h":
            if (hoursDiff > 24) return false;
            break;
          case "week":
            if (hoursDiff > 168) return false;
            break;
          case "month":
            if (hoursDiff > 720) return false;
            break;
        }
      }

      // Attendance filter
      if (attendanceFilter !== "all") {
        const userEvent = userEvents?.find(ue => ue.id === event.id);
        const attendanceStatus = userEvent?.userAttendanceStatus;
        
        switch (attendanceFilter) {
          case "attending":
            if (attendanceStatus !== "attending") return false;
            break;
          case "maybe":
            if (attendanceStatus !== "maybe") return false;
            break;
          case "not_joined":
            if (attendanceStatus) return false;
            break;
        }
      }

      return true;
    });
  }, [allEvents, userEvents, distanceFilter, timeFilter, attendanceFilter]);

  // Get events for current view period
  const getEventsForPeriod = () => {
    if (!filteredEvents) return [];
    
    if (viewMode === "month") {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      return filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() === year && eventDate.getMonth() === month;
      });
    } else if (viewMode === "week") {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
      });
    }
    
    return filteredEvents;
  };

  // Calendar utilities
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  };

  const formatWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return `${startOfWeek.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${endOfWeek.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;
  };

  const getEventsForDay = (day: number) => {
    const events = getEventsForPeriod();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day;
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getFullYear() === currentDate.getFullYear() &&
           today.getMonth() === currentDate.getMonth() &&
           today.getDate() === day;
  };

  // Event color coding based on attendance status
  const getEventColor = (event: CalendarEvent) => {
    const userEvent = userEvents?.find(ue => ue.id === event.id);
    const attendanceStatus = userEvent?.userAttendanceStatus;
    
    switch (attendanceStatus) {
      case "attending":
        return "bg-green-500";
      case "maybe":
        return "bg-yellow-500";
      case "not_attending":
        return "bg-gray-400";
      default:
        return "bg-blue-500";
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const events = getEventsForPeriod();
    const userAttendingEvents = userEvents?.filter(ue => ue.userAttendanceStatus === "attending") || [];
    
    return {
      totalEvents: events.length,
      attendingEvents: userAttendingEvents.length,
      upcomingEvents: events.filter(e => new Date(e.date) > new Date()).length,
      averageDistance: events.length > 0 
        ? (events.reduce((sum, e) => sum + parseFloat(e.distance.replace(/[^\d.]/g, '')), 0) / events.length).toFixed(1)
        : "0"
    };
  }, [getEventsForPeriod(), userEvents]);

  const periodEvents = getEventsForPeriod();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDay }, (_, i) => null);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Interactive Event Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">
                  <div className="flex items-center gap-2">
                    <Grid3x3 className="h-4 w-4" />
                    Month
                  </div>
                </SelectItem>
                <SelectItem value="week">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Week
                  </div>
                </SelectItem>
                <SelectItem value="list">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    List
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium mb-2 block">Distance</label>
              <Select value={distanceFilter} onValueChange={setDistanceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All distances</SelectItem>
                  <SelectItem value="5">Within 5km</SelectItem>
                  <SelectItem value="10">Within 10km</SelectItem>
                  <SelectItem value="20">Within 20km</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Time</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="24h">Next 24 hours</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Attendance</label>
              <Select value={attendanceFilter} onValueChange={setAttendanceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All events</SelectItem>
                  <SelectItem value="attending">Attending</SelectItem>
                  <SelectItem value="maybe">Maybe attending</SelectItem>
                  <SelectItem value="not_joined">Not joined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Statistics */}
        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalEvents}</div>
              <div className="text-sm text-blue-800">Total Events</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.attendingEvents}</div>
              <div className="text-sm text-green-800">Attending</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.upcomingEvents}</div>
              <div className="text-sm text-orange-800">Upcoming</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.averageDistance}km</div>
              <div className="text-sm text-purple-800">Avg Distance</div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={viewMode === "month" ? goToPreviousMonth : goToPreviousWeek}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold text-lg">
            {viewMode === "month" ? formatMonthYear(currentDate) : formatWeekRange(currentDate)}
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={viewMode === "month" ? goToNextMonth : goToNextWeek}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Views */}
        {viewMode === "month" && (
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-xs font-medium text-gray-600">
                {day}
              </div>
            ))}
            
            {/* Padding days */}
            {paddingDays.map((_, index) => (
              <div key={`padding-${index}`} className="p-2" />
            ))}
            
            {/* Days of the month */}
            {days.map(day => {
              const dayEvents = getEventsForDay(day);
              const hasEvents = dayEvents.length > 0;
              const todayClass = isToday(day) ? 'bg-orange-100 text-orange-800 font-semibold' : '';
              
              return (
                <div
                  key={day}
                  className={`p-2 min-h-[100px] border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 ${todayClass} ${
                    hasEvents ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="text-sm font-medium mb-1">{day}</div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <Dialog key={event.id}>
                        <DialogTrigger asChild>
                          <div
                            className={`text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 ${getEventColor(event)}`}
                            title={`${event.title} - ${event.time}`}
                          >
                            {event.title}
                          </div>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{event.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span>{new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })} at {event.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span>{event.participantCount} participants</span>
                            </div>
                            {event.description && (
                              <p className="text-gray-600">{event.description}</p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-2">
            {periodEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No events found</p>
              </div>
            ) : (
              periodEvents.map(event => {
                const userEvent = userEvents?.find(ue => ue.id === event.id);
                const attendanceStatus = userEvent?.userAttendanceStatus;
                
                return (
                  <div key={event.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{event.title}</h4>
                          {attendanceStatus && (
                            <Badge variant={attendanceStatus === 'attending' ? 'default' : 'secondary'}>
                              {attendanceStatus === 'attending' ? 'Attending' : 
                               attendanceStatus === 'maybe' ? 'Maybe' : 'Not Attending'}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })} at {event.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.participantCount} participants
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading events...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}