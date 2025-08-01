import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Check, X, Clock, Star, ChevronDown } from "lucide-react";

type AttendanceStatus = "interested" | "attending" | "maybe" | "not_attending";

interface AttendanceStatusProps {
  eventId: number;
  currentStatus?: AttendanceStatus | null;
  isJoined: boolean;
  onJoin?: () => void;
}

const statusConfig = {
  interested: {
    label: "Interested",
    icon: Star,
    variant: "secondary" as const,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  attending: {
    label: "Attending",
    icon: Check,
    variant: "default" as const,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  maybe: {
    label: "Maybe",
    icon: Clock,
    variant: "outline" as const,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  not_attending: {
    label: "Can't Attend",
    icon: X,
    variant: "destructive" as const,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
};

export default function AttendanceStatus({ eventId, currentStatus, isJoined, onJoin }: AttendanceStatusProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateAttendanceMutation = useMutation({
    mutationFn: async (status: AttendanceStatus) => {
      const response = await apiRequest("PATCH", `/api/events/${eventId}/attendance`, {
        attendanceStatus: status,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Attendance Updated",
        description: "Your attendance status has been updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
    },
    onError: (error) => {
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
        title: "Error",
        description: "Failed to update attendance status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const cancelAttendanceMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/events/${eventId}/attendance`);
    },
    onSuccess: () => {
      toast({
        title: "Attendance Cancelled",
        description: "You have successfully left this event.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
    },
    onError: (error) => {
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
        title: "Cancel Failed",
        description: "Failed to cancel attendance. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!isJoined) {
    return (
      <Button onClick={onJoin} size="sm" variant="outline">
        Join Event
      </Button>
    );
  }

  const currentConfig = currentStatus ? statusConfig[currentStatus] : statusConfig.interested;
  const CurrentIcon = currentConfig.icon;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={currentConfig.variant}
            size="sm"
            className="min-w-[120px] justify-between"
            disabled={updateAttendanceMutation.isPending}
          >
            <div className="flex items-center gap-2">
              <CurrentIcon className="h-4 w-4" />
              <span>{currentConfig.label}</span>
            </div>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon;
            return (
              <DropdownMenuItem
                key={status}
                onClick={() => updateAttendanceMutation.mutate(status as AttendanceStatus)}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <span>{config.label}</span>
                </div>
                {currentStatus === status && <Check className="h-4 w-4 ml-auto text-green-600" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {currentStatus && currentStatus !== "not_attending" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => cancelAttendanceMutation.mutate()}
          disabled={cancelAttendanceMutation.isPending}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
        >
          {cancelAttendanceMutation.isPending ? "Leaving..." : "Leave"}
        </Button>
      )}
    </div>
  );
}

// Component to display attendance badges for participants
export function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  const config = statusConfig[status] || statusConfig.interested;
  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={`${config.bgColor} ${config.color} border-0`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}