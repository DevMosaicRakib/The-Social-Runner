import Navigation from "@/components/navigation";
import MobileNav from "@/components/mobile-nav";
import InteractiveCalendar from "@/components/interactive-calendar";
import { useAuth } from "@/hooks/useAuth";

export default function CalendarPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Event Calendar</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Discover and manage running events with our interactive calendar visualization
          </p>
        </div>

        {/* Interactive Calendar */}
        <InteractiveCalendar 
          className="mb-8"
          showFilters={true}
          showStats={true}
        />
      </div>

      <MobileNav />
    </div>
  );
}