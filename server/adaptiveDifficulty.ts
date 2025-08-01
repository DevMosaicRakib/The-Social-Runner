import { db } from "./db";
import { workoutFeedback, trainingAdjustments, trainingPlans } from "@shared/schema";
import { eq, desc, and, gte, avg, count, sql } from "drizzle-orm";

interface PerformanceMetrics {
  completionRate: number;
  averageDifficultyRating: number;
  averageEffortRating: number;
  consistencyScore: number;
  improvementTrend: number;
}

interface AdjustmentRecommendation {
  type: 'difficulty_increase' | 'difficulty_decrease' | 'volume_increase' | 'volume_decrease' | 'pace_adjustment' | 'schedule_change';
  suggestion: string;
  confidence: number;
  reason: string;
}

export class AdaptiveDifficultyEngine {
  
  /**
   * Analyze recent workout feedback to calculate performance metrics
   */
  async analyzePerformance(userId: string, trainingPlanId: number, weeksPeriod: number = 2): Promise<PerformanceMetrics> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (weeksPeriod * 7));

    const recentFeedback = await db
      .select()
      .from(workoutFeedback)
      .where(
        and(
          eq(workoutFeedback.userId, userId),
          eq(workoutFeedback.trainingPlanId, trainingPlanId),
          gte(workoutFeedback.workoutDate, cutoffDate.toISOString().split('T')[0])
        )
      )
      .orderBy(desc(workoutFeedback.workoutDate));

    if (recentFeedback.length === 0) {
      return {
        completionRate: 1.0,
        averageDifficultyRating: 5.0,
        averageEffortRating: 5.0,
        consistencyScore: 1.0,
        improvementTrend: 0.0,
      };
    }

    // Calculate completion rate
    const completedWorkouts = recentFeedback.filter(f => f.completed).length;
    const completionRate = completedWorkouts / recentFeedback.length;

    // Calculate average ratings (only for completed workouts)
    const completedFeedback = recentFeedback.filter(f => f.completed);
    const avgDifficulty = completedFeedback.length > 0 
      ? completedFeedback.reduce((sum, f) => sum + (f.difficultyRating || 5), 0) / completedFeedback.length 
      : 5.0;
    const avgEffort = completedFeedback.length > 0 
      ? completedFeedback.reduce((sum, f) => sum + (f.effortRating || 5), 0) / completedFeedback.length 
      : 5.0;

    // Calculate consistency score (lower variance = higher consistency)
    const difficultyVariance = this.calculateVariance(completedFeedback.map(f => f.difficultyRating || 5));
    const consistencyScore = Math.max(0, 1 - (difficultyVariance / 10)); // Normalize to 0-1

    // Calculate improvement trend (comparing first half to second half of period)
    const midpoint = Math.floor(completedFeedback.length / 2);
    const firstHalf = completedFeedback.slice(midpoint);
    const secondHalf = completedFeedback.slice(0, midpoint);
    
    const firstHalfAvg = firstHalf.length > 0 
      ? firstHalf.reduce((sum, f) => sum + (f.effortRating || 5), 0) / firstHalf.length 
      : 5.0;
    const secondHalfAvg = secondHalf.length > 0 
      ? secondHalf.reduce((sum, f) => sum + (f.effortRating || 5), 0) / secondHalf.length 
      : 5.0;
    
    const improvementTrend = secondHalfAvg - firstHalfAvg; // Positive = getting easier (improving fitness)

    return {
      completionRate,
      averageDifficultyRating: avgDifficulty,
      averageEffortRating: avgEffort,
      consistencyScore,
      improvementTrend,
    };
  }

  /**
   * Generate AI-powered adjustment recommendations
   */
  async generateRecommendations(
    userId: string, 
    trainingPlanId: number, 
    metrics: PerformanceMetrics
  ): Promise<AdjustmentRecommendation[]> {
    const recommendations: AdjustmentRecommendation[] = [];

    // High completion rate + low difficulty rating = increase difficulty
    if (metrics.completionRate >= 0.9 && metrics.averageDifficultyRating <= 3.5) {
      recommendations.push({
        type: 'difficulty_increase',
        suggestion: 'Your completion rate is excellent and workouts feel too easy. Consider increasing training intensity.',
        confidence: 85,
        reason: 'high_completion_low_difficulty'
      });
    }

    // Low completion rate + high difficulty rating = decrease difficulty
    if (metrics.completionRate <= 0.6 && metrics.averageDifficultyRating >= 7.5) {
      recommendations.push({
        type: 'difficulty_decrease',
        suggestion: 'Workouts seem too challenging with low completion rates. Consider reducing intensity.',
        confidence: 90,
        reason: 'low_completion_high_difficulty'
      });
    }

    // High effort with improving trend = potentially increase volume
    if (metrics.averageEffortRating <= 6.0 && metrics.improvementTrend > 1.0) {
      recommendations.push({
        type: 'volume_increase',
        suggestion: 'You\'re adapting well to current training. Consider adding more training volume.',
        confidence: 75,
        reason: 'improving_fitness_trend'
      });
    }

    // Inconsistent performance = adjust schedule
    if (metrics.consistencyScore <= 0.5) {
      recommendations.push({
        type: 'schedule_change',
        suggestion: 'Your performance varies significantly. Consider adjusting your training schedule or rest days.',
        confidence: 70,
        reason: 'inconsistent_performance'
      });
    }

    // Very high effort ratings consistently = pace adjustment needed
    if (metrics.averageEffortRating >= 8.5) {
      recommendations.push({
        type: 'pace_adjustment',
        suggestion: 'Your effort levels are consistently very high. Consider adjusting target paces for easier workouts.',
        confidence: 80,
        reason: 'consistently_high_effort'
      });
    }

    return recommendations;
  }

  /**
   * Automatically adjust training plan difficulty based on performance
   */
  async autoAdjustDifficulty(userId: string, trainingPlanId: number, currentWeek: number): Promise<boolean> {
    const metrics = await this.analyzePerformance(userId, trainingPlanId);
    const recommendations = await this.generateRecommendations(userId, trainingPlanId, metrics);

    // Check if we should make an automatic adjustment
    const highConfidenceRecs = recommendations.filter(r => r.confidence >= 80);
    
    if (highConfidenceRecs.length === 0) {
      return false; // No high-confidence recommendations
    }

    // Get current plan difficulty
    const [currentPlan] = await db
      .select()
      .from(trainingPlans)
      .where(eq(trainingPlans.id, trainingPlanId));

    if (!currentPlan) {
      return false;
    }

    // Check if we've made an adjustment recently (within last week)
    const recentAdjustments = await db
      .select()
      .from(trainingAdjustments)
      .where(
        and(
          eq(trainingAdjustments.trainingPlanId, trainingPlanId),
          gte(trainingAdjustments.adjustmentDate, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        )
      );

    if (recentAdjustments.length > 0) {
      return false; // Don't adjust too frequently
    }

    // Apply the highest confidence recommendation
    const topRec = highConfidenceRecs[0];
    let newMultiplier = 1.0;
    let adjustmentType = topRec.type;

    switch (topRec.type) {
      case 'difficulty_increase':
        newMultiplier = Math.min(1.2, 1.0 + (0.1 * (1 - metrics.averageDifficultyRating / 10)));
        break;
      case 'difficulty_decrease':
        newMultiplier = Math.max(0.8, 1.0 - (0.1 * (metrics.averageDifficultyRating / 10)));
        break;
      case 'volume_increase':
        newMultiplier = Math.min(1.15, 1.0 + (0.05 * metrics.improvementTrend));
        break;
      case 'volume_decrease':
        newMultiplier = Math.max(0.85, 1.0 - (0.1 * (1 - metrics.completionRate)));
        break;
      default:
        newMultiplier = 1.0;
    }

    // Calculate performance score
    const performanceScore = (
      metrics.completionRate * 0.4 +
      (1 - Math.abs(metrics.averageDifficultyRating - 5.5) / 10) * 0.3 +
      metrics.consistencyScore * 0.2 +
      Math.max(0, 1 + metrics.improvementTrend / 10) * 0.1
    );

    // Record the adjustment
    await db.insert(trainingAdjustments).values({
      userId,
      trainingPlanId,
      adjustmentType,
      reason: topRec.reason,
      previousValue: "1.00",
      newValue: newMultiplier.toFixed(2),
      difficultyMultiplier: newMultiplier.toFixed(2),
      performanceScore: performanceScore.toFixed(2),
      automaticAdjustment: true,
      weekNumber: currentWeek,
      notes: `Auto-adjustment: ${topRec.suggestion}`,
    });

    return true;
  }

  /**
   * Get adaptive difficulty data for dashboard display
   */
  async getAdaptiveData(userId: string, trainingPlanId: number) {
    // Get current plan
    const [currentPlan] = await db
      .select()
      .from(trainingPlans)
      .where(eq(trainingPlans.id, trainingPlanId));

    if (!currentPlan) {
      return null;
    }

    // Get performance metrics
    const metrics = await this.analyzePerformance(userId, trainingPlanId);
    
    // Get recommendations
    const recommendations = await this.generateRecommendations(userId, trainingPlanId, metrics);

    // Get recent adjustments
    const recentAdjustments = await db
      .select()
      .from(trainingAdjustments)
      .where(eq(trainingAdjustments.trainingPlanId, trainingPlanId))
      .orderBy(desc(trainingAdjustments.adjustmentDate))
      .limit(5);

    // Calculate weekly stats
    const weeklyStats = {
      completionRate: metrics.completionRate,
      averageDifficulty: metrics.averageDifficultyRating,
      averageEffort: metrics.averageEffortRating,
      totalWorkouts: await this.getWeeklyWorkoutCount(userId, trainingPlanId),
    };

    // Calculate current difficulty multiplier from recent adjustments
    const latestAdjustment = recentAdjustments[0];
    const currentDifficulty = latestAdjustment 
      ? parseFloat(latestAdjustment.difficultyMultiplier) 
      : 1.0;

    // Calculate performance score
    const performanceScore = (
      metrics.completionRate * 0.4 +
      (1 - Math.abs(metrics.averageDifficultyRating - 5.5) / 10) * 0.3 +
      metrics.consistencyScore * 0.2 +
      Math.max(0, 1 + metrics.improvementTrend / 10) * 0.1
    );

    return {
      currentDifficulty,
      performanceScore,
      recentAdjustments: recentAdjustments.map(adj => ({
        date: this.formatDate(adj.adjustmentDate),
        type: this.formatAdjustmentType(adj.adjustmentType),
        reason: this.formatAdjustmentReason(adj.reason),
        multiplier: parseFloat(adj.difficultyMultiplier),
        description: this.getAdjustmentDescription(adj.adjustmentType, parseFloat(adj.difficultyMultiplier))
      })),
      recommendations: recommendations.slice(0, 3), // Top 3 recommendations
      weeklyStats,
    };
  }

  /**
   * Submit workout feedback
   */
  async submitWorkoutFeedback(feedbackData: any) {
    return await db.insert(workoutFeedback).values(feedbackData);
  }

  /**
   * Apply manual difficulty adjustment and return session variance details
   */
  async applyManualAdjustment(
    userId: string, 
    trainingPlanId: number, 
    adjustmentType: string, 
    weekNumber: number
  ) {
    // Get current training plan
    const [currentPlan] = await db
      .select()
      .from(trainingPlans)
      .where(eq(trainingPlans.id, trainingPlanId));

    if (!currentPlan) {
      throw new Error("Training plan not found");
    }

    let multiplier = 1.0;
    let reason = "manual_adjustment";

    switch (adjustmentType) {
      case 'difficulty_increase':
        multiplier = 1.15;
        reason = "user_requested_increase";
        break;
      case 'difficulty_decrease':
        multiplier = 0.85;
        reason = "user_requested_decrease";
        break;
      default:
        multiplier = 1.0;
    }

    // Get the weekly schedule and calculate session changes
    const weeklySchedule = currentPlan.weeklySchedule as any;
    const sessionChanges = [];

    // Calculate changes for current and future weeks
    const totalWeeks = currentPlan.duration;
    const currentWeekNumber = currentPlan.currentWeek || 1;

    for (let week = currentWeekNumber; week <= totalWeeks; week++) {
      const weekData = weeklySchedule[week];
      if (!weekData) continue;

      const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      for (const day of daysOfWeek) {
        const session = weekData[day];
        if (!session) continue;

        const originalDistance = this.parseDistance(session.distance);
        const originalPace = this.parsePace(session.pace);
        
        if (originalDistance > 0) {
          const newDistance = Math.round(originalDistance * multiplier * 10) / 10;
          const newPace = this.adjustPace(originalPace, multiplier);
          
          sessionChanges.push({
            week,
            day: day.charAt(0).toUpperCase() + day.slice(1),
            sessionType: session.type,
            changes: {
              distance: {
                original: `${originalDistance}km`,
                new: `${newDistance}km`,
                change: newDistance - originalDistance
              },
              pace: {
                original: this.formatPace(originalPace),
                new: this.formatPace(newPace),
                change: adjustmentType === 'difficulty_increase' ? 'Faster' : 'Easier'
              }
            }
          });

          // Update the session in the weekly schedule
          weekData[day] = {
            ...session,
            distance: `${newDistance}km`,
            pace: this.formatPace(newPace)
          };
        }
      }
    }

    // Update the training plan with modified schedule
    await db
      .update(trainingPlans)
      .set({ 
        weeklySchedule: weeklySchedule,
        updatedAt: new Date()
      })
      .where(eq(trainingPlans.id, trainingPlanId));

    // Record the adjustment
    await db.insert(trainingAdjustments).values({
      userId,
      trainingPlanId,
      adjustmentType,
      reason,
      previousValue: "1.00",
      newValue: multiplier.toFixed(2),
      difficultyMultiplier: multiplier.toFixed(2),
      performanceScore: "1.00",
      automaticAdjustment: false,
      weekNumber,
      notes: `Manual adjustment: ${sessionChanges.length} sessions modified`,
    });

    // Return user-friendly session variance details
    const averageDistanceChange = sessionChanges.length > 0 
      ? (sessionChanges.reduce((sum, change) => sum + change.changes.distance.change, 0) / sessionChanges.length)
      : 0;

    const percentageChange = Math.round(Math.abs((multiplier - 1) * 100));
    const adjustmentVerb = adjustmentType === 'difficulty_increase' ? 'harder' : 'easier';
    
    return {
      title: `Training Made ${adjustmentVerb.charAt(0).toUpperCase() + adjustmentVerb.slice(1)}`,
      description: adjustmentType === 'difficulty_increase' 
        ? `Your training has been increased by ${percentageChange}% to provide more challenge`
        : `Your training has been reduced by ${percentageChange}% to make it more manageable`,
      
      sessionsModified: sessionChanges.length,
      weeksAffected: Math.max(0, totalWeeks - currentWeekNumber + 1),
      
      changes: sessionChanges.slice(0, 8).map(change => ({
        session: `Week ${change.week} ${change.day}: ${change.sessionType}`,
        distanceChange: `${change.changes.distance.original} → ${change.changes.distance.new}`,
        paceChange: `${change.changes.pace.original} → ${change.changes.pace.new} per km`,
        impact: change.changes.distance.change > 0 
          ? `+${change.changes.distance.change.toFixed(1)}km longer`
          : `${Math.abs(change.changes.distance.change).toFixed(1)}km shorter`
      })),
      
      summary: {
        totalSessions: sessionChanges.length,
        averageChange: averageDistanceChange > 0 
          ? `+${averageDistanceChange.toFixed(1)}km average increase per session`
          : `${Math.abs(averageDistanceChange).toFixed(1)}km average decrease per session`,
        nextSteps: adjustmentType === 'difficulty_increase'
          ? "Focus on gradual progression and listen to your body"
          : "Use this time to build consistency and confidence"
      }
    };
  }

  /**
   * Helper function to calculate variance
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Get weekly workout count
   */
  private async getWeeklyWorkoutCount(userId: string, trainingPlanId: number): Promise<number> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const result = await db
      .select({ count: count() })
      .from(workoutFeedback)
      .where(
        and(
          eq(workoutFeedback.userId, userId),
          eq(workoutFeedback.trainingPlanId, trainingPlanId),
          gte(workoutFeedback.workoutDate, oneWeekAgo.toISOString().split('T')[0])
        )
      );

    return result[0]?.count || 0;
  }

  /**
   * Helper function to parse distance from string
   */
  private parseDistance(distanceStr: string): number {
    if (!distanceStr) return 0;
    const match = distanceStr.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Helper function to parse pace from string (min:sec per km)
   */
  private parsePace(paceStr: string): number {
    if (!paceStr) return 360; // Default 6:00 min/km in seconds
    const match = paceStr.match(/(\d+):(\d+)/);
    if (match) {
      return parseInt(match[1]) * 60 + parseInt(match[2]);
    }
    return 360;
  }

  /**
   * Helper function to adjust pace based on difficulty multiplier
   */
  private adjustPace(paceInSeconds: number, multiplier: number): number {
    // Higher multiplier = more difficult = faster pace (lower seconds per km)
    // Lower multiplier = easier = slower pace (higher seconds per km)
    const adjustment = multiplier > 1 ? 1 / multiplier : multiplier;
    return Math.round(paceInSeconds * adjustment);
  }

  /**
   * Helper function to format pace back to min:sec string
   */
  private formatPace(paceInSeconds: number): string {
    const minutes = Math.floor(paceInSeconds / 60);
    const seconds = paceInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Format date for user display
   */
  private formatDate(date: Date | null): string {
    if (!date) return 'Unknown';
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-AU', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  }

  /**
   * Format adjustment type for user display
   */
  private formatAdjustmentType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'difficulty_increase': 'Made Harder',
      'difficulty_decrease': 'Made Easier', 
      'volume_increase': 'Increased Volume',
      'volume_decrease': 'Reduced Volume',
      'pace_adjustment': 'Pace Adjusted',
      'schedule_change': 'Schedule Changed'
    };
    return typeMap[type] || 'Adjusted';
  }

  /**
   * Format adjustment reason for user display
   */
  private formatAdjustmentReason(reason: string): string {
    const reasonMap: { [key: string]: string } = {
      'user_requested_increase': 'You requested to make it harder',
      'user_requested_decrease': 'You requested to make it easier',
      'manual_adjustment': 'Manual adjustment',
      'performance_based': 'Based on your performance',
      'completion_rate_low': 'To help with completion',
      'difficulty_too_high': 'Training was too challenging',
      'difficulty_too_low': 'Training was too easy'
    };
    return reasonMap[reason] || 'System adjustment';
  }

  /**
   * Get user-friendly adjustment description
   */
  private getAdjustmentDescription(type: string, multiplier: number): string {
    const change = multiplier > 1 ? 'increased' : 'decreased';
    const percentage = Math.round(Math.abs((multiplier - 1) * 100));
    
    if (type === 'difficulty_increase') {
      return `Training intensity increased by ${percentage}% - distances and paces are more challenging`;
    } else if (type === 'difficulty_decrease') {
      return `Training intensity reduced by ${percentage}% - distances and paces are more manageable`;
    }
    return `Training plan ${change} by ${percentage}%`;
  }
}

export const adaptiveDifficultyEngine = new AdaptiveDifficultyEngine();