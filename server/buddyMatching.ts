import { eq, and, or, not, sql, desc, asc, inArray } from "drizzle-orm";
import { db } from "./db";
import { users, buddyMatches, buddyPreferences } from "@shared/schema";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  location: string;
  dateOfBirth: Date;
  sex: string;
  experienceLevel: string;
  preferredDistance: string;
  preferredPace: string;
  runningGoals: string[];
  availabilityDays: string[];
  preferredTime: string;
  bio?: string;
}

interface BuddyMatch {
  user: UserProfile;
  compatibilityScore: number;
  matchReasons: string[];
  distance: number;
}

interface BuddyPreferencesType {
  maxDistance: number;
  ageRangeMin: number;
  ageRangeMax: number;
  paceFlexibility: string;
  experienceLevelPreference: string[];
  genderPreference: string;
  communicationStyle: string;
  runningGoalAlignment: boolean;
  scheduleFlexibility: string;
  isActive: boolean;
}

// Calculate age from date of birth
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Calculate compatibility score between two users
function calculateCompatibilityScore(user1: UserProfile, user2: UserProfile, preferences: BuddyPreferencesType): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const maxScore = 100;

  // Age compatibility (15 points)
  const user2Age = calculateAge(user2.dateOfBirth);
  if (user2Age >= preferences.ageRangeMin && user2Age <= preferences.ageRangeMax) {
    score += 15;
    reasons.push(`Age compatible (${user2Age} years old)`);
  }

  // Gender preference (10 points)
  if (preferences.genderPreference === "any" || preferences.genderPreference === user2.sex) {
    score += 10;
    if (preferences.genderPreference !== "any") {
      reasons.push("Gender preference match");
    }
  }

  // Experience level compatibility (20 points)
  const experienceMatch = preferences.experienceLevelPreference.includes("any") || 
                         preferences.experienceLevelPreference.includes(user2.experienceLevel);
  if (experienceMatch) {
    score += 20;
    if (!preferences.experienceLevelPreference.includes("any")) {
      reasons.push(`Similar experience level (${user2.experienceLevel})`);
    }
  }

  // Pace compatibility (25 points)
  const paceCompatible = calculatePaceCompatibility(user1.preferredPace, user2.preferredPace, preferences.paceFlexibility);
  score += paceCompatible.score;
  if (paceCompatible.reason) {
    reasons.push(paceCompatible.reason);
  }

  // Distance compatibility (15 points)
  if (user1.preferredDistance === user2.preferredDistance) {
    score += 15;
    reasons.push(`Both prefer ${user1.preferredDistance} distances`);
  } else if (isCompatibleDistance(user1.preferredDistance, user2.preferredDistance)) {
    score += 10;
    reasons.push("Compatible distance preferences");
  }

  // Running goals alignment (15 points)
  if (preferences.runningGoalAlignment && user1.runningGoals && user2.runningGoals) {
    const commonGoals = user1.runningGoals.filter(goal => user2.runningGoals.includes(goal));
    if (commonGoals.length > 0) {
      score += 15;
      reasons.push(`Shared goals: ${commonGoals.slice(0, 2).join(", ")}`);
    }
  } else if (!preferences.runningGoalAlignment) {
    score += 15; // No penalty if goal alignment isn't important
  }

  return { score: Math.min(score, maxScore), reasons };
}

// Calculate pace compatibility
function calculatePaceCompatibility(pace1: string, pace2: string, flexibility: string): { score: number; reason?: string } {
  const paceOrder = ["easy", "moderate", "fast", "very_fast"];
  const pace1Index = paceOrder.indexOf(pace1);
  const pace2Index = paceOrder.indexOf(pace2);
  
  if (pace1Index === -1 || pace2Index === -1) {
    return { score: 10 }; // Default score if pace is unknown
  }

  const difference = Math.abs(pace1Index - pace2Index);

  switch (flexibility) {
    case "strict":
      if (difference === 0) {
        return { score: 25, reason: "Exact pace match" };
      }
      return { score: 0 };
    
    case "moderate":
      if (difference === 0) {
        return { score: 25, reason: "Same preferred pace" };
      } else if (difference === 1) {
        return { score: 15, reason: "Similar pace preferences" };
      } else if (difference === 2) {
        return { score: 5, reason: "Somewhat compatible pace" };
      }
      return { score: 0 };
    
    case "flexible":
      if (difference === 0) {
        return { score: 25, reason: "Same preferred pace" };
      } else if (difference <= 2) {
        return { score: 20, reason: "Compatible pace range" };
      }
      return { score: 15, reason: "Flexible pace compatibility" };
    
    default:
      return { score: 10 };
  }
}

// Check if distances are compatible
function isCompatibleDistance(distance1: string, distance2: string): boolean {
  const shortDistances = ["5k", "fun_run"];
  const mediumDistances = ["10k", "15k"];
  const longDistances = ["half_marathon", "marathon", "ultra"];

  const isShort1 = shortDistances.includes(distance1);
  const isShort2 = shortDistances.includes(distance2);
  const isMedium1 = mediumDistances.includes(distance1);
  const isMedium2 = mediumDistances.includes(distance2);
  const isLong1 = longDistances.includes(distance1);
  const isLong2 = longDistances.includes(distance2);

  // Compatible if in same category or adjacent categories
  return (isShort1 && (isShort2 || isMedium2)) ||
         (isMedium1 && (isShort2 || isMedium2 || isLong2)) ||
         (isLong1 && (isMedium2 || isLong2));
}

// Mock distance calculation (in real app, would use geocoding API)
function calculateDistance(location1: string, location2: string): number {
  // Simple mock calculation - in real app would use Google Maps API
  // For now, return random distance between 1-50km
  return Math.floor(Math.random() * 50) + 1;
}

export class BuddyMatchingService {
  // Get user's buddy preferences
  async getBuddyPreferences(userId: string): Promise<BuddyPreferencesType | null> {
    const [preferences] = await db
      .select()
      .from(buddyPreferences)
      .where(eq(buddyPreferences.userId, userId));

    return preferences || null;
  }

  // Update or create buddy preferences
  async updateBuddyPreferences(userId: string, data: Partial<BuddyPreferencesType>): Promise<BuddyPreferencesType> {
    const existingPreferences = await this.getBuddyPreferences(userId);

    if (existingPreferences) {
      const [updated] = await db
        .update(buddyPreferences)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(buddyPreferences.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(buddyPreferences)
        .values({ userId, ...data })
        .returning();
      return created;
    }
  }

  // Find potential buddy matches for a user
  async findPotentialMatches(userId: string): Promise<BuddyMatch[]> {
    // Get user's profile
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Get user's preferences
    let preferences = await this.getBuddyPreferences(userId);
    
    // Use default preferences if none exist
    if (!preferences) {
      preferences = {
        maxDistance: 25,
        ageRangeMin: 18,
        ageRangeMax: 65,
        paceFlexibility: "moderate",
        experienceLevelPreference: ["any"],
        genderPreference: "any",
        communicationStyle: "any",
        runningGoalAlignment: true,
        scheduleFlexibility: "moderate",
        isActive: true,
      };
    }

    // Get existing matches to exclude
    const existingMatches = await db
      .select()
      .from(buddyMatches)
      .where(
        or(
          eq(buddyMatches.requesterId, userId),
          eq(buddyMatches.recipientId, userId)
        )
      );

    const excludedUserIds = existingMatches.map(match => 
      match.requesterId === userId ? match.recipientId : match.requesterId
    );

    // Get potential matches
    const potentialUsers = await db
      .select()
      .from(users)
      .where(
        and(
          not(eq(users.id, userId)), // Exclude self
          excludedUserIds.length > 0 ? not(inArray(users.id, excludedUserIds)) : sql`true` // Exclude existing matches
        )
      )
      .limit(50); // Limit for performance

    // Calculate compatibility scores
    const matches: BuddyMatch[] = [];

    for (const user of potentialUsers) {
      if (!user.dateOfBirth) continue; // Skip users without birth date

      const userProfile: UserProfile = {
        id: user.id,
        firstName: user.firstName || "Unknown",
        lastName: user.lastName || "",
        profileImageUrl: user.profileImageUrl || undefined,
        location: user.location || "Unknown location",
        dateOfBirth: user.dateOfBirth,
        sex: user.sex || "prefer-not-to-say",
        experienceLevel: user.experienceLevel || "beginner",
        preferredDistance: user.preferredDistance || "5k",
        preferredPace: user.preferredPace || "moderate",
        runningGoals: user.runningGoals || [],
        availabilityDays: user.availabilityDays || [],
        preferredTime: user.preferredTime || "morning",
        bio: user.bio || undefined,
      };

      const currentUserProfile: UserProfile = {
        id: currentUser.id,
        firstName: currentUser.firstName || "Unknown",
        lastName: currentUser.lastName || "",
        profileImageUrl: currentUser.profileImageUrl || undefined,
        location: currentUser.location || "Unknown location",
        dateOfBirth: currentUser.dateOfBirth!,
        sex: currentUser.sex || "prefer-not-to-say",
        experienceLevel: currentUser.experienceLevel || "beginner",
        preferredDistance: currentUser.preferredDistance || "5k",
        preferredPace: currentUser.preferredPace || "moderate",
        runningGoals: currentUser.runningGoals || [],
        availabilityDays: currentUser.availabilityDays || [],
        preferredTime: currentUser.preferredTime || "morning",
        bio: currentUser.bio || undefined,
      };

      const compatibility = calculateCompatibilityScore(currentUserProfile, userProfile, preferences);
      const distance = calculateDistance(currentUser.location || "", user.location || "");

      // Only include matches within distance range and with reasonable compatibility
      if (distance <= preferences.maxDistance && compatibility.score >= 30) {
        matches.push({
          user: {
            ...userProfile,
            age: calculateAge(userProfile.dateOfBirth),
          },
          compatibilityScore: compatibility.score,
          matchReasons: compatibility.reasons,
          distance,
        });
      }
    }

    // Sort by compatibility score (highest first)
    return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }

  // Send buddy request
  async sendBuddyRequest(requesterId: string, recipientId: string): Promise<void> {
    // Check if request already exists
    const existingRequest = await db
      .select()
      .from(buddyMatches)
      .where(
        or(
          and(eq(buddyMatches.requesterId, requesterId), eq(buddyMatches.recipientId, recipientId)),
          and(eq(buddyMatches.requesterId, recipientId), eq(buddyMatches.recipientId, requesterId))
        )
      );

    if (existingRequest.length > 0) {
      throw new Error("Buddy request already exists");
    }

    // Calculate compatibility score
    const [requester] = await db.select().from(users).where(eq(users.id, requesterId));
    const [recipient] = await db.select().from(users).where(eq(users.id, recipientId));

    if (!requester || !recipient) {
      throw new Error("User not found");
    }

    const preferences = await this.getBuddyPreferences(requesterId) || {
      maxDistance: 25,
      ageRangeMin: 18,
      ageRangeMax: 65,
      paceFlexibility: "moderate",
      experienceLevelPreference: ["any"],
      genderPreference: "any",
      communicationStyle: "any",
      runningGoalAlignment: true,
      scheduleFlexibility: "moderate",
      isActive: true,
    };

    const requesterProfile: UserProfile = {
      id: requester.id,
      firstName: requester.firstName || "Unknown",
      lastName: requester.lastName || "",
      profileImageUrl: requester.profileImageUrl || undefined,
      location: requester.location || "Unknown location",
      dateOfBirth: requester.dateOfBirth!,
      sex: requester.sex || "prefer-not-to-say",
      experienceLevel: requester.experienceLevel || "beginner",
      preferredDistance: requester.preferredDistance || "5k",
      preferredPace: requester.preferredPace || "moderate",
      runningGoals: requester.runningGoals || [],
      availabilityDays: requester.availabilityDays || [],
      preferredTime: requester.preferredTime || "morning",
      bio: requester.bio || undefined,
    };

    const recipientProfile: UserProfile = {
      id: recipient.id,
      firstName: recipient.firstName || "Unknown",
      lastName: recipient.lastName || "",
      profileImageUrl: recipient.profileImageUrl || undefined,
      location: recipient.location || "Unknown location",
      dateOfBirth: recipient.dateOfBirth!,
      sex: recipient.sex || "prefer-not-to-say",
      experienceLevel: recipient.experienceLevel || "beginner",
      preferredDistance: recipient.preferredDistance || "5k",
      preferredPace: recipient.preferredPace || "moderate",
      runningGoals: recipient.runningGoals || [],
      availabilityDays: recipient.availabilityDays || [],
      preferredTime: recipient.preferredTime || "morning",
      bio: recipient.bio || undefined,
    };

    const compatibility = calculateCompatibilityScore(requesterProfile, recipientProfile, preferences);

    await db.insert(buddyMatches).values({
      requesterId,
      recipientId,
      status: "pending",
      compatibilityScore: compatibility.score,
    });
  }

  // Respond to buddy request
  async respondToBuddyRequest(matchId: number, response: "accepted" | "declined"): Promise<void> {
    await db
      .update(buddyMatches)
      .set({
        status: response,
        respondedAt: new Date(),
      })
      .where(eq(buddyMatches.id, matchId));
  }

  // Get user's buddy connections
  async getBuddyConnections(userId: string): Promise<any[]> {
    const connections = await db
      .select({
        id: buddyMatches.id,
        matchedAt: buddyMatches.matchedAt,
        compatibilityScore: buddyMatches.compatibilityScore,
        otherUserId: sql<string>`CASE WHEN ${buddyMatches.requesterId} = ${userId} THEN ${buddyMatches.recipientId} ELSE ${buddyMatches.requesterId} END`,
      })
      .from(buddyMatches)
      .where(
        and(
          or(
            eq(buddyMatches.requesterId, userId),
            eq(buddyMatches.recipientId, userId)
          ),
          eq(buddyMatches.status, "accepted")
        )
      );

    // Get user details for each connection
    const connectionsWithUsers = [];
    for (const connection of connections) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, connection.otherUserId));

      if (user) {
        connectionsWithUsers.push({
          ...connection,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl,
            location: user.location,
            experienceLevel: user.experienceLevel,
          },
        });
      }
    }

    return connectionsWithUsers;
  }
}