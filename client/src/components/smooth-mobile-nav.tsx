import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { 
  Home, 
  Bell, 
  Users, 
  User, 
  Plus,
  Calendar,
  Target,
  MapPin,
  Activity,
  ChevronUp,
  Search
} from "lucide-react";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  isActive?: boolean;
}

export default function SmoothMobileNav() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  // Fetch notifications for badge count
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
    staleTime: 30000,
  });

  // Fetch user events for badge count
  const { data: userEvents = [] } = useQuery({
    queryKey: ["/api/events/user"],
    enabled: isAuthenticated,
    staleTime: 60000,
  });

  const unreadNotificationsCount = (notifications as any[]).filter(
    (notification: any) => !notification.isRead
  ).length;

  const upcomingEventsCount = (userEvents as any[]).filter((event: any) => {
    const eventDate = new Date(`${event.date}T${event.time}`);
    return eventDate > new Date();
  }).length;

  // Animation values
  const y = useMotionValue(0);
  const opacity = useTransform(y, [-100, 0], [0, 1]);

  // Primary navigation items (always visible)
  const primaryNavItems: NavItem[] = [
    {
      href: "/#events-near-me",
      icon: <Home className="w-5 h-5" />,
      label: "Events",
      isActive: location === "/" || location.includes("events")
    },
    {
      href: "/notifications",
      icon: <Bell className="w-5 h-5" />,
      label: "Alerts",
      badge: unreadNotificationsCount,
      isActive: location.includes("notifications")
    },
    {
      href: "/find-runclub",
      icon: <Users className="w-5 h-5" />,
      label: "Clubs",
      isActive: location.includes("runclub")
    },
    {
      href: "/training-plan-dashboard",
      icon: <Target className="w-5 h-5" />,
      label: "Training",
      isActive: location.includes("training")
    },
    {
      href: "/profile",
      icon: <User className="w-5 h-5" />,
      label: "Profile",
      isActive: location.includes("profile")
    }
  ];

  // Secondary navigation items (shown when expanded)
  const secondaryNavItems: NavItem[] = [
    {
      href: "/create-visual",
      icon: <Plus className="w-5 h-5" />,
      label: "Create Event"
    },
    {
      href: "/my-events",
      icon: <Calendar className="w-5 h-5" />,
      label: "My Events",
      badge: upcomingEventsCount
    },
    {
      href: "/create-runclub",
      icon: <Plus className="w-5 h-5" />,
      label: "Create Club"
    }
  ];

  // Handle double tap to expand
  const handleDoubleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap;
    
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      setIsExpanded(!isExpanded);
    }
    
    setLastTap(now);
  };

  // Close expanded menu when navigating
  useEffect(() => {
    setIsExpanded(false);
  }, [location]);

  const navItemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.8
    },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: index * 0.05,
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }),
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  const containerVariants = {
    hidden: {
      height: "auto"
    },
    expanded: {
      height: "auto",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05
      }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const renderNavItem = (item: NavItem, index: number, isPrimary = true) => {
    const isCurrentPage = item.isActive;
    
    return (
      <motion.div
        key={item.href}
        custom={index}
        variants={navItemVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        whileHover={{ 
          scale: 1.05,
          transition: { type: "spring", stiffness: 400, damping: 25 }
        }}
        whileTap={{ 
          scale: 0.95,
          transition: { duration: 0.1 }
        }}
      >
        <Link href={item.href}>
          <Button
            variant="ghost"
            className={`
              relative flex flex-col items-center py-2 h-auto transition-all duration-300
              ${isCurrentPage 
                ? "text-orange-500 bg-orange-50" 
                : "text-slate-400 hover:text-slate-600"
              }
              ${isPrimary ? "min-w-[60px]" : "min-w-[80px] px-4"}
            `}
          >
            <motion.div 
              className="relative"
              animate={isCurrentPage ? {
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{ 
                duration: 0.6,
                repeat: isCurrentPage ? Infinity : 0,
                repeatDelay: 3
              }}
            >
              {item.icon}
              <AnimatePresence>
                {item.badge && item.badge > 0 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white min-w-5"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            <motion.span 
              className="text-xs font-medium mt-1"
              animate={isCurrentPage ? { 
                color: ["#f97316", "#ea580c", "#f97316"]
              } : {}}
              transition={{ 
                duration: 2,
                repeat: isCurrentPage ? Infinity : 0
              }}
            >
              {item.label}
            </motion.span>

            {/* Active indicator */}
            <AnimatePresence>
              {isCurrentPage && (
                <motion.div
                  className="absolute bottom-0 left-1/2 w-1 h-1 bg-orange-500 rounded-full"
                  initial={{ scale: 0, x: "-50%" }}
                  animate={{ 
                    scale: 1, 
                    x: "-50%",
                  }}
                  exit={{ scale: 0, x: "-50%" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </AnimatePresence>
          </Button>
        </Link>
      </motion.div>
    );
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Backdrop for expanded state */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black bg-opacity-25 z-30 md:hidden"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Navigation Container */}
      <motion.div
        style={{ y, opacity }}
        variants={containerVariants}
        animate={isExpanded ? "expanded" : "hidden"}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-40 shadow-lg"
        onDoubleClick={handleDoubleTap}
      >
        {/* Secondary Navigation (Expanded) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: "auto", 
                opacity: 1,
                transition: {
                  height: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { delay: 0.1, duration: 0.2 }
                }
              }}
              exit={{ 
                height: 0, 
                opacity: 0,
                transition: {
                  opacity: { duration: 0.1 },
                  height: { delay: 0.1, type: "spring", stiffness: 300, damping: 30 }
                }
              }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-2 p-3 border-b border-slate-100 bg-slate-50">
                {secondaryNavItems.map((item, index) => 
                  renderNavItem(item, index, false)
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary Navigation */}
        <div className="grid grid-cols-5 py-2 bg-white">
          {primaryNavItems.map((item, index) => 
            renderNavItem(item, index, true)
          )}
        </div>

        {/* Expand/Collapse Indicator */}
        <motion.div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="bg-white border border-slate-200 rounded-full p-1 shadow-sm">
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <ChevronUp className="w-4 h-4 text-slate-600" />
            </motion.div>
          </div>
        </motion.div>

        {/* Swipe indicator */}
        {!isExpanded && (
          <motion.div
            className="absolute top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-slate-300 rounded-full"
            animate={{ 
              opacity: [0.3, 0.7, 0.3],
              scaleX: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>

      {/* Quick Action Floating Button */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 30,
              delay: 0.2
            }}
            className="fixed bottom-20 right-4 z-30 md:hidden"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{ 
                boxShadow: [
                  "0 4px 20px rgba(249, 115, 22, 0.3)",
                  "0 8px 30px rgba(249, 115, 22, 0.4)",
                  "0 4px 20px rgba(249, 115, 22, 0.3)"
                ]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Link href="/create-visual">
                <Button
                  size="lg"
                  className="h-14 w-14 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg border-2 border-white"
                >
                  <Plus className="w-6 h-6" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}