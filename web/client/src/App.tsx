import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/language-context";
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { pushNotificationManager } from "@/lib/pushNotifications";
import { isProfileComplete } from "@/lib/profileUtils";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CreateEvent from "@/pages/create-event";
import Landing from "@/pages/landing";
import ProfileSetup from "@/pages/profile-setup";
import Auth from "@/pages/auth";
import NotificationsPage from "@/pages/notifications";
import ProfilePage from "@/pages/profile";
import ParkrunEventsPage from "@/pages/parkrun-events";
import AboutPage from "@/pages/about";
import StravaClubSync from "@/pages/strava-club-sync";
import DragDropCreatePage from "@/pages/drag-drop-create";
import CalendarPage from "@/pages/calendar";
import ContactPage from "@/pages/contact";
import { News } from "@/pages/news";
import { NewsArticlePage } from "@/pages/news-article";
import BuddyMatching from "@/pages/buddy-matching";
import MyEvents from "@/pages/my-events";
import LoadingPage from "@/components/loading-page";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Initialize push notifications when user is authenticated
  React.useEffect(() => {
    if (isAuthenticated && user && window.isMobileApp) {
      // Register for push notifications in mobile app
      if (window.registerPushNotifications) {
        window.registerPushNotifications(user.id);
      }
    }
  }, [isAuthenticated, user]);

  // Show loading page while checking authentication
  if (isLoading) {
    return <LoadingPage />;
  }

  // Show authentication page for unauthenticated users
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/auth" component={Auth} />
        <Route component={Landing} />
      </Switch>
    );
  }

  // Show profile setup if profile is incomplete
  if (user && !isProfileComplete(user)) {
    return (
      <Switch>
        <Route path="/profile-setup" component={ProfileSetup} />
        <Route component={ProfileSetup} />
      </Switch>
    );
  }

  // Show full app for authenticated users with complete profiles
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={CreateEvent} />
      <Route path="/create-visual" component={DragDropCreatePage} />
      <Route path="/my-events" component={MyEvents} />
      <Route path="/calendar" component={CalendarPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/notifications" component={NotificationsPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/parkruns" component={ParkrunEventsPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/strava-sync" component={StravaClubSync} />
      <Route path="/profile-setup" component={ProfileSetup} />
      <Route path="/news" component={News} />
      <Route path="/news/:slug" component={NewsArticlePage} />
      <Route path="/buddy-matching" component={BuddyMatching} />
      <Route component={NotFound} />
    </Switch>
  );

  // Original authentication flow (disabled for development)
  /*
  // Show landing page for unauthenticated users
  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Show profile setup if profile is incomplete
  if (!isProfileComplete(user)) {
    return (
      <Switch>
        <Route path="/profile-setup" component={ProfileSetup} />
        <Route component={ProfileSetup} />
      </Switch>
    );
  }

  // Show full app for authenticated users with complete profiles
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={CreateEvent} />
      <Route path="/profile-setup" component={ProfileSetup} />
      <Route component={NotFound} />
    </Switch>
  );
  */
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
