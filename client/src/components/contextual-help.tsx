import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ChevronRight, ChevronLeft, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface HelpStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
  page: string; // Which page this help step applies to
}

const helpSteps: HelpStep[] = [
  {
    id: "welcome",
    title: "Welcome to The Social Runner!",
    description: "This platform was born from a lonely runner's journey. Let us help you find your running tribe and create meaningful connections.",
    target: ".hero-section",
    position: "bottom",
    page: "home"
  },
  {
    id: "create-event",
    title: "Create Your First Event",
    description: "Start building your community by creating a running event. Set your schedule, distance, and meet like-minded runners.",
    target: "[href='/create-visual']",
    position: "bottom",
    page: "home"
  },
  {
    id: "event-form",
    title: "Fill Out Event Details",
    description: "Provide all the essential information for your event. Include title, date, time, location, and distance to help runners find and join your event.",
    target: ".event-form",
    position: "top",
    page: "create-event"
  },
  {
    id: "visual-create",
    title: "Visual Event Creation",
    description: "Use our drag-and-drop interface to design your event visually. Choose templates and customise your event details with ease.",
    target: ".visual-canvas",
    position: "left",
    page: "create-visual"
  },
  {
    id: "buddy-search",
    title: "Find Compatible Running Partners",
    description: "Our intelligent algorithm matches you with runners based on pace, distance preferences, location, and running goals.",
    target: ".buddy-search",
    position: "top",
    page: "buddy-matching"
  },
  {
    id: "find-buddies",
    title: "Find Running Buddies",
    description: "Use our intelligent matching system to connect with runners who share your pace, distance preferences, and goals.",
    target: "[href='/buddy-matching']",
    position: "bottom",
    page: "home"
  },
  {
    id: "events-near-me",
    title: "Discover Events Near You",
    description: "Browse running events in your area. Filter by date, time, and distance to find the perfect runs for your schedule.",
    target: ".events-section",
    position: "top",
    page: "home"
  },
  {
    id: "profile-setup",
    title: "Complete Your Profile",
    description: "Add your running preferences, location, and goals to get better event recommendations and buddy matches.",
    target: "[href='/profile']",
    position: "left",
    page: "home"
  }
];

interface ContextualHelpProps {
  currentPage: string;
}

export default function ContextualHelp({ currentPage }: ContextualHelpProps) {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenHelp, setHasSeenHelp] = useState(false);

  const relevantSteps = helpSteps.filter(step => step.page === currentPage);

  useEffect(() => {
    // Check if user has seen help before (localStorage)
    const helpSeen = localStorage.getItem('tsr-help-seen');
    setHasSeenHelp(!!helpSeen);

    // Show help for new users after a short delay
    if (!helpSeen && user && relevantSteps.length > 0) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, relevantSteps.length]);

  const handleNext = () => {
    if (currentStep < relevantSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('tsr-help-seen', 'true');
    setHasSeenHelp(true);
  };

  const handleSkip = () => {
    handleComplete();
  };

  const showHelp = () => {
    setCurrentStep(0);
    setIsVisible(true);
  };

  const currentHelpStep = relevantSteps[currentStep];

  if (!user || relevantSteps.length === 0) {
    return null;
  }

  return (
    <>
      {/* Help Toggle Button */}
      {hasSeenHelp && !isVisible && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={showHelp}
            className="rounded-full w-12 h-12 bg-orange-500 hover:bg-orange-600 shadow-lg"
            size="sm"
          >
            <Lightbulb className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Help Overlay */}
      {isVisible && currentHelpStep && (
        <>
          {/* Dark overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
          
          {/* Help Card */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white shadow-2xl border-2 border-orange-200">
              <CardHeader className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleComplete}
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-orange-600 font-medium">
                    Step {currentStep + 1} of {relevantSteps.length}
                  </span>
                </div>
                <CardTitle className="text-xl font-display font-bold text-gray-900">
                  {currentHelpStep.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <CardDescription className="text-gray-700 leading-relaxed">
                  {currentHelpStep.description}
                </CardDescription>
                
                {/* Progress indicators */}
                <div className="flex justify-center space-x-2">
                  {relevantSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentStep ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Skip Tour
                  </Button>
                  
                  <div className="flex gap-2">
                    {currentStep > 0 && (
                      <Button
                        variant="outline"
                        onClick={handlePrevious}
                        size="sm"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                    )}
                    <Button
                      onClick={handleNext}
                      className="bg-orange-500 hover:bg-orange-600"
                      size="sm"
                    >
                      {currentStep === relevantSteps.length - 1 ? 'Finish' : 'Next'}
                      {currentStep < relevantSteps.length - 1 && (
                        <ChevronRight className="w-4 h-4 ml-1" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
}