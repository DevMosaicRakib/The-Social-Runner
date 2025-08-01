import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/language-context";
import { LanguageSelector } from "@/components/language-selector";
import { Menu, TrainTrack, LogOut, User, Calendar, Bell, MapPin, Info, Mail, Home, Plus, Newspaper, Users, Target, Activity, ChevronDown, Search, Settings } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import TSRLogo from "@/components/tsr-logo";

export default function Navigation() {
  const isMobile = useIsMobile();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

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

  // Fetch user's events to get upcoming count
  const { data: userEvents = [] } = useQuery({
    queryKey: ["/api/events/user"],
    enabled: isAuthenticated,
    staleTime: 60000, // Cache for 1 minute
  });

  // Calculate upcoming events count
  const upcomingEventsCount = (userEvents as any[]).filter((event: any) => {
    const eventDate = new Date(`${event.date}T${event.time}`);
    return eventDate > new Date();
  }).length;

  // Event menu items for nested dropdown
  const eventMenuItems = [
    { href: "/create-visual", label: "Create Events", icon: Plus },
    { href: "/#events-near-me", label: "Find Events", icon: Home },
    { href: "/my-events", label: "My Events", icon: Calendar, count: upcomingEventsCount || 0 },
    { href: "/community-heat-map", label: "Event Heat Map", icon: Activity },
  ];

  // Check if user has active training plan to show management options
  const { data: trainingPlans = [] } = useQuery({
    queryKey: ["/api/training-plans"],
    enabled: isAuthenticated,
    staleTime: 60000,
  });
  
  const hasActivePlan = (trainingPlans as any[]).some((plan: any) => plan.status === "active");

  // Training menu items for nested dropdown
  const trainingMenuItems = [
    { href: "/training-plan-wizard", label: "Create a Training Plan", icon: Plus },
    { href: "/training-plan-dashboard", label: "Training Plans", icon: Target },
    ...(hasActivePlan ? [
      { href: "/training-plan-dashboard#settings", label: "Adjust Plan", icon: Settings },
    ] : []),
    { href: "/calendar", label: "Calendar", icon: Calendar },
  ];

  // Run Club menu items for nested dropdown
  const runclubMenuItems = [
    { href: "/find-runclub", label: "Find a Run Club", icon: Search },
    { href: "/create-runclub", label: "Create a Run Club", icon: Plus },
  ];



  const menuItems = [
    { href: "/news", label: t('nav.news'), icon: Newspaper },
    { href: "/about", label: t('nav.about'), icon: Info },
    { href: "/contact", label: t('nav.contact'), icon: Mail },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
              <TSRLogo size={40} />
            </Link>
            <span className="text-xl font-bold text-slate-900 font-display">The Social Runner</span>
          </div>
          
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-6">
              {/* Events Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-slate-600 hover:text-slate-900 text-sm font-medium flex items-center gap-1 px-2">
                    Events
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {eventMenuItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center gap-2 cursor-pointer">
                        <item.icon className="h-4 w-4" />
                        <span className="flex items-center gap-2">
                          {item.href === "/my-events" ? "My Events" : item.label}
                          {item.href === "/my-events" && (item.count ?? 0) > 0 && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                              {item.count}
                            </Badge>
                          )}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Training Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-slate-600 hover:text-slate-900 text-sm font-medium flex items-center gap-1 px-2">
                    Training
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {trainingMenuItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center gap-2 cursor-pointer">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Run Clubs Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-slate-600 hover:text-slate-900 text-sm font-medium flex items-center gap-1 px-2">
                    Run Clubs
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {runclubMenuItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center gap-2 cursor-pointer">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/news" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                News
              </Link>
              <Link href="/about" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                About
              </Link>
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            {/* Language Selector - Desktop */}
            {!isMobile && <LanguageSelector />}
            {/* Notifications Bell - Desktop */}
            {!isMobile && (
              <Link href="/notifications" className="relative">
                <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100">
                  <Bell className="h-5 w-5 text-gray-600 hover:text-gray-900" />
                  {unreadNotificationsCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600"
                    >
                      {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <TSRLogo size={24} />
                      Menu
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {/* Events Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 px-3">Events</h3>
                      {eventMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link key={item.href} href={item.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors ml-3">
                            <Icon className="h-5 w-5 text-gray-600" />
                            <span className="font-medium text-gray-900 flex items-center gap-2">
                              {item.href === "/my-events" ? "My Events" : item.label}
                              {item.href === "/my-events" && (item.count ?? 0) > 0 && (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                                  {item.count}
                                </Badge>
                              )}
                            </span>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Training Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 px-3">Training</h3>
                      {trainingMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link key={item.href} href={item.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors ml-3">
                            <Icon className="h-5 w-5 text-gray-600" />
                            <span className="font-medium text-gray-900">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Run Clubs Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 px-3">Run Clubs</h3>
                      {runclubMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link key={item.href} href={item.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors ml-3">
                            <Icon className="h-5 w-5 text-gray-600" />
                            <span className="font-medium text-gray-900">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                    
                    {/* Other Menu Items */}
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.href} href={item.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                          <Icon className="h-5 w-5 text-gray-600" />
                          <span className="font-medium text-gray-900">{item.label}</span>
                        </Link>
                      );
                    })}
                    
                    {/* Language Selector - Mobile */}
                    <div className="pt-4 border-t border-gray-200">
                      <LanguageSelector variant="mobile" className="mb-4" />
                    </div>
                    
                    {/* User Section */}
                    <div className="pt-4 border-t border-gray-200 space-y-2">
                      <Link href="/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                        <Avatar className="w-10 h-10 border-2 border-black ring-2 ring-gray-300">
                          <AvatarImage src={(user as any)?.profileImageUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=runner"} />
                          <AvatarFallback>
                            {(user as any)?.firstName?.[0] || (user as any)?.email?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                            {(user as any)?.firstName && (user as any)?.lastName 
                              ? `${(user as any).firstName} ${(user as any).lastName}`
                              : (user as any)?.email || "User"
                            }
                          </p>
                          <p className="text-sm text-gray-500">{(user as any)?.location || "Location not set"}</p>
                          <p className="text-xs text-blue-600">View Profile →</p>
                        </div>
                      </Link>
                      
                      <button 
                        onClick={() => window.location.href = '/api/logout'}
                        className="flex items-center gap-3 p-3 w-full rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {/* Desktop User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto w-auto flex items-center gap-1">
                  <Avatar className="w-8 h-8 cursor-pointer hidden md:block border-2 border-black ring-2 ring-gray-300 hover:ring-gray-400 transition-all">
                    <AvatarImage src={(user as any)?.profileImageUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=runner"} />
                    <AvatarFallback>
                      {(user as any)?.firstName?.[0] || (user as any)?.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3 w-3 text-gray-500 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
