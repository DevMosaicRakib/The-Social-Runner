import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/language-context";
import { LanguageSelector } from "@/components/language-selector";
import { Menu, TrainTrack, LogOut, User, Calendar, Bell, MapPin, Info, Mail, Home, Plus, Newspaper, Users } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import TSRLogo from "@/components/tsr-logo";

export default function Navigation() {
  const isMobile = useIsMobile();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

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

  const menuItems = [
    { href: "/#events-near-me", label: t('nav.findEvents'), icon: Home },
    { href: "/create-visual", label: t('nav.createEvent'), icon: Plus },
    { href: "/my-events", label: `${t('nav.myEvents')}${upcomingEventsCount > 0 ? ` (${upcomingEventsCount})` : ''}`, icon: Calendar, count: upcomingEventsCount },
    { href: "/news", label: t('nav.news'), icon: Newspaper },
    { href: "/notifications", label: t('nav.notifications'), icon: Bell },
    { href: "/profile", label: t('nav.profile'), icon: User },
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
              <a href="/#events-near-me" className="text-slate-600 hover:text-slate-900 font-medium">
                {t('nav.findEvents')}
              </a>
              <Link href="/create-visual" className="text-slate-600 hover:text-slate-900 font-medium">
                Create Event
              </Link>
              <Link href="/my-events" className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1">
                My Events
                {upcomingEventsCount > 0 && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                    {upcomingEventsCount}
                  </Badge>
                )}
              </Link>
              <Link href="/notifications" className="text-slate-600 hover:text-slate-900 font-medium">
                Notifications
              </Link>
              <Link href="/profile" className="text-slate-600 hover:text-slate-900 font-medium">
                Profile
              </Link>
              <Link href="/news" className="text-slate-600 hover:text-slate-900 font-medium">
                News
              </Link>
              <Link href="/about" className="text-slate-600 hover:text-slate-900 font-medium">
                About
              </Link>
              
              {/* Language Selector - Desktop */}
              <LanguageSelector />
            </div>
          )}
          
          <div className="flex items-center space-x-4">
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
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.href} href={item.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                          <Icon className="h-5 w-5 text-gray-600" />
                          <span className="font-medium text-gray-900 flex items-center gap-2">
                            {item.href === "/my-events" ? "My Events" : item.label}
                            {item.href === "/my-events" && item.count > 0 && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                                {item.count}
                              </Badge>
                            )}
                          </span>
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
                <Avatar className="w-8 h-8 cursor-pointer hidden md:block border-2 border-black ring-2 ring-gray-300 hover:ring-gray-400 transition-all">
                  <AvatarImage src={(user as any)?.profileImageUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=runner"} />
                  <AvatarFallback>
                    {(user as any)?.firstName?.[0] || (user as any)?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
