import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock, Users } from "lucide-react";
import type { EventWithParticipants } from "@shared/schema";

interface EventCalendarProps {
  className?: string;
}

interface CalendarEvent extends EventWithParticipants {
  userAttendanceStatus: string;
}

export default function EventCalendar({ className }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Fetch user's events
  const { data: userEvents, isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/events/user"],
    retry: false,
  });

  // Get events for current month (already filtered by backend to only attending/maybe)
  const getEventsForMonth = () => {
    if (!userEvents) return [];
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    return userEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
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

  const getEventsForDay = (day: number) => {
    const events = getEventsForMonth();
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

  const monthEvents = getEventsForMonth();
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
            My Events Calendar
          </CardTitle>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold text-lg">
            {formatMonthYear(currentDate)}
          </h3>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-xs font-medium text-gray-600">
              {day}
            </div>
          ))}
          
          {/* Padding days from previous month */}
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
                className={`p-2 min-h-[80px] border border-gray-100 rounded-lg ${todayClass} ${
                  hasEvents ? 'bg-blue-50' : ''
                }`}
              >
                <div className="text-sm font-medium mb-1">{day}</div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded text-white truncate ${
                        event.userAttendanceStatus === 'attending' 
                          ? 'bg-green-500' 
                          : 'bg-yellow-500'
                      }`}
                      title={`${event.title} - ${event.time}`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Events List for Current Month */}
        {monthEvents.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">
              Events this month ({monthEvents.length})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {monthEvents.map(event => (
                <div
                  key={event.id}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-sm text-gray-900 truncate">
                        {event.title}
                      </h5>
                      <Badge 
                        variant={event.userAttendanceStatus === 'attending' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {event.userAttendanceStatus === 'attending' ? 'Attending' : 'Maybe'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 ml-2">
                    <Users className="h-3 w-3" />
                    <span>{event.participantCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading your events...</p>
          </div>
        ) : monthEvents.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No events this month</p>
            <p className="text-sm text-gray-500">
              Join some events to see them on your calendar
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}