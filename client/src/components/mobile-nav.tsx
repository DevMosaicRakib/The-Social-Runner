import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { Home, Map, User, Bell, Activity, Target, Users } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function MobileNav() {
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();
  const [isHome] = useRoute("/");
  const [isNotifications] = useRoute("/notifications");
  const [isProfile] = useRoute("/profile");
  const [isTraining] = useRoute("/training-plan-dashboard");
  const [isCreate] = useRoute("/create-visual");
  const [isRunclub] = useRoute("/find-runclub");
  const [isCreateRunclub] = useRoute("/create-runclub");

  // Fetch notifications to get unread count
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Calculate unread notifications count
  const unreadNotificationsCount = (notifications as any[]).filter((notification: any) => 
    !notification.isRead
  ).length;

  if (!isMobile || !isAuthenticated) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-40 shadow-lg">
      <div className="grid grid-cols-5 py-2">
        <a href="/#events-near-me">
          <Button
            variant="ghost"
            className={`flex flex-col items-center py-2 h-auto ${
              isHome ? "text-orange-500" : "text-slate-400"
            }`}
          >
            <Home className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Events</span>
          </Button>
        </a>
        
        <Link href="/notifications">
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center py-2 h-auto relative ${
              isNotifications ? "text-orange-500" : "text-slate-400"
            }`}
          >
            <div className="relative">
              <Bell className="h-5 w-5 mb-1" />
              {unreadNotificationsCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs bg-red-500 text-white min-w-4"
                >
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </Badge>
              )}
            </div>
            <span className="text-xs font-medium">Alerts</span>
          </Button>
        </Link>
        
        <Link href="/find-runclub">
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center py-2 h-auto ${
              isRunclub || isCreateRunclub ? "text-orange-500" : "text-slate-400"
            }`}
          >
            <Users className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Clubs</span>
          </Button>
        </Link>
        
        <Link href="/training-plan-dashboard">
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center py-2 h-auto ${
              isTraining ? "text-orange-500" : "text-slate-400"
            }`}
          >
            <Target className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Training</span>
          </Button>
        </Link>
        
        <Link href="/create-visual">
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center py-2 h-auto ${
              isCreate ? "text-orange-500" : "text-slate-400"
            }`}
          >
            <Map className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Create</span>
          </Button>
        </Link>
        
        <Link href="/profile">
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center py-2 h-auto ${
              isProfile ? "text-orange-500" : "text-slate-400"
            }`}
          >
            <User className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Profile</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
