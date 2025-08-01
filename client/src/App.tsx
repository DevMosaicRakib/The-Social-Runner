import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/language-context";
import { HelmetProvider } from "react-helmet-async";
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
import TrainingPartners from "@/pages/training-partners";
import NotificationPreferences from "@/pages/notification-preferences";
import DragDropCreatePage from "@/pages/drag-drop-create";
import CalendarPage from "@/pages/calendar";
import ContactPage from "@/pages/contact";
import { News } from "@/pages/news";
import { NewsArticlePage } from "@/pages/news-article";
import BuddyMatching from "@/pages/buddy-matching";
import MyEvents from "@/pages/my-events";
import TrainingPlanWizard from "@/pages/training-plan-wizard";
import TrainingPlanDashboard from "@/pages/training-plan-dashboard";
import CommunityHeatMapPage from "@/pages/community-heat-map";
import FindRunclub from "@/pages/find-runclub";
import CreateRunclub from "@/pages/create-runclub";
import VerifyEmailPage from "@/pages/verify-email";
import RegistrationSuccessPage from "@/pages/registration-success";
import LoadingPage from "@/components/loading-page";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Initialize push notifications when user is authenticated
  React.useEffect(() => {
    if (isAuthenticated && user && window.isMobileApp) {
      // Register for push notifications in mobile app
      if (window.registerPushNotifications) {
        window.registerPushNotifications((user as any).id);
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
        <Route path="/verify-email/:token" component={VerifyEmailPage} />
        <Route path="/registration-success" component={RegistrationSuccessPage} />
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
      <Route path="/notification-preferences" component={NotificationPreferences} />
      <Route path="/training-partners" component={TrainingPartners} />
      <Route path="/training-plan-wizard" component={TrainingPlanWizard} />
      <Route path="/training-plan-dashboard" component={TrainingPlanDashboard} />
      <Route path="/community-heat-map" component={CommunityHeatMapPage} />
      <Route path="/find-runclub" component={FindRunclub} />
      <Route path="/create-runclub" component={CreateRunclub} />
      <Route path="/verify-email/:token" component={VerifyEmailPage} />
      <Route path="/registration-success" component={RegistrationSuccessPage} />
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
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
