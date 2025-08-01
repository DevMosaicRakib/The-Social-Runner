import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Route, MapPin, Users, MessageCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import AttendanceStatus, { AttendanceBadge } from "@/components/attendance-status";
import SocialShareButton from "@/components/social-share-button";
import EventReactions from "@/components/event-reactions";
import { EventComments } from "@/components/event-comments";
import type { EventWithParticipants } from "@shared/schema";

interface EventCardProps {
  event: EventWithParticipants;
}

export default function EventCard({ event }: EventCardProps) {
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const joinEventMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/events/${event.id}/join`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Joined Event",
        description: `You've successfully joined "${event.title}"!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Failed to Join",
        description: error.message || "Unable to join this event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="status-open">Open</Badge>;
      case "almost_full":
        return <Badge className="status-almost-full">Almost Full</Badge>;
      case "full":
        return <Badge className="status-full">Full</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { 
      day: "2-digit", 
      month: "short", 
      year: "2-digit" 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{event.title}</h3>
            <div className="flex items-center space-x-4 text-sm text-slate-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(event.time)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Route className="h-4 w-4" />
                <span>{event.distance}</span>
              </div>
            </div>
          </div>
          <div className="text-right flex items-center gap-2">
            <SocialShareButton event={event} />
            {getStatusBadge(event.status)}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="h-4 w-4 text-slate-400" />
          <span className="text-slate-600">{event.location}</span>
        </div>

        {event.description && (
          <p className="text-slate-600 text-sm mb-4">{event.description}</p>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex -space-x-2">
                {event.participants.slice(0, 3).map((participant) => (
                  <div key={participant.id} className="relative">
                    <Avatar className="w-8 h-8 border-2 border-white ring-2 ring-gray-300">
                      <AvatarImage src={participant.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.id}`} />
                      <AvatarFallback className="text-xs">
                        {participant.firstName?.charAt(0).toUpperCase() || participant.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ))}
                {event.participantCount > 3 && (
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                    +{event.participantCount - 3}
                  </div>
                )}
              </div>
              <span className="text-sm text-slate-600 flex items-center gap-1">
                <Users className="h-4 w-4" />
                {event.participantCount} runner{event.participantCount !== 1 ? 's' : ''} joined
              </span>
            </div>

            <AttendanceStatus 
              eventId={event.id}
              currentStatus={event.userAttendanceStatus as any}
              isJoined={!!event.userAttendanceStatus}
              onJoin={() => joinEventMutation.mutate()}
            />
          </div>

          {/* Event Reactions */}
          <div className="pt-3 border-t border-gray-100">
            <EventReactions 
              eventId={event.id} 
              initialReactions={event.reactions || []} 
            />
          </div>

          {/* Comments Toggle */}
          <div className="pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600"
            >
              <MessageCircle className="h-4 w-4" />
              {showComments ? "Hide Comments" : "View Comments"}
            </Button>
          </div>

          {/* Show participant attendance badges if there are participants */}
          {event.participants.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-3">
              {event.participants.slice(0, 6).map((participant) => (
                <div key={participant.id} className="flex items-center gap-1 text-xs">
                  <span className="text-slate-600">{participant.firstName || "Runner"}</span>
                  {participant.attendanceStatus && (
                    <AttendanceBadge status={participant.attendanceStatus as any} />
                  )}
                </div>
              ))}
              {event.participants.length > 6 && (
                <span className="text-xs text-slate-500">+{event.participants.length - 6} more</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Comments Section */}
      {showComments && (
        <EventComments eventId={event.id} />
      )}
    </Card>
  );
}
