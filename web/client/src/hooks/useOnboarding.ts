import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import type { User } from '@shared/schema';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: string;
  href?: string;
}

export function useOnboarding() {
  const { user } = useAuth();
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([]);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  useEffect(() => {
    if (!user) return;

    const steps: OnboardingStep[] = [
      {
        id: 'profile-complete',
        title: 'Complete Your Profile',
        description: 'Add your running preferences and personal details',
        completed: !!((user as User)?.firstName && (user as User)?.lastName && (user as User)?.location && (user as User)?.dateOfBirth),
        action: 'Complete Profile',
        href: '/profile'
      },
      {
        id: 'first-event-view',
        title: 'Explore Running Events',
        description: 'Browse events near you and see what others are organising',
        completed: localStorage.getItem('tsr-viewed-events') === 'true',
        action: 'View Events',
        href: '/'
      },
      {
        id: 'create-first-event',
        title: 'Create Your First Event',
        description: 'Start building your running community by organising an event',
        completed: localStorage.getItem('tsr-created-event') === 'true',
        action: 'Create Event',
        href: '/create-visual'
      },
      {
        id: 'find-buddies',
        title: 'Find Running Buddies',
        description: 'Use our matching system to connect with compatible runners',
        completed: localStorage.getItem('tsr-used-buddy-matching') === 'true',
        action: 'Find Buddies',
        href: '/buddy-matching'
      },
      {
        id: 'join-event',
        title: 'Join Your First Event',
        description: 'Connect with the community by joining an event',
        completed: localStorage.getItem('tsr-joined-event') === 'true',
        action: 'Browse Events',
        href: '/'
      }
    ];

    setOnboardingSteps(steps);
    setIsOnboardingComplete(steps.every(step => step.completed));
  }, [user]);

  const markStepCompleted = (stepId: string) => {
    localStorage.setItem(`tsr-${stepId.replace('-', '_')}`, 'true');
    setOnboardingSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };

  const getNextStep = () => {
    return onboardingSteps.find(step => !step.completed);
  };

  const getCompletionPercentage = () => {
    if (onboardingSteps.length === 0) return 0;
    const completedSteps = onboardingSteps.filter(step => step.completed).length;
    return Math.round((completedSteps / onboardingSteps.length) * 100);
  };

  return {
    onboardingSteps,
    isOnboardingComplete,
    markStepCompleted,
    getNextStep,
    getCompletionPercentage
  };
}