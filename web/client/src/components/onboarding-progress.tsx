import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Trophy, ArrowRight } from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Link } from "wouter";

interface OnboardingProgressProps {
  className?: string;
}

export default function OnboardingProgress({ className = "" }: OnboardingProgressProps) {
  const { onboardingSteps, isOnboardingComplete, getNextStep, getCompletionPercentage } = useOnboarding();
  
  const nextStep = getNextStep();
  const completionPercentage = getCompletionPercentage();

  if (isOnboardingComplete) {
    return (
      <Card className={`border-green-200 bg-green-50 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-display font-bold text-green-900">Welcome to the Community!</h3>
              <p className="text-green-700 text-sm">You've completed your onboarding. Start connecting with fellow runners!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-orange-200 bg-orange-50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display font-bold text-gray-900">
            Getting Started
          </CardTitle>
          <span className="text-sm font-medium text-orange-600">
            {completionPercentage}% Complete
          </span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {nextStep && (
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <div className="flex items-start gap-3">
              <Circle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{nextStep.title}</h4>
                <p className="text-gray-600 text-sm mb-3">{nextStep.description}</p>
                {nextStep.href && (
                  <Link href={nextStep.href}>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                      {nextStep.action}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700">All Steps:</h5>
          {onboardingSteps.map((step) => (
            <div key={step.id} className="flex items-center gap-2 text-sm">
              {step.completed ? (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
              <span className={step.completed ? 'text-green-700' : 'text-gray-600'}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}