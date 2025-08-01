import { User } from "@shared/schema";

export function isProfileComplete(user: any): boolean {
  if (!user) return false;
  
  return !!(
    user.firstName && 
    user.lastName && 
    user.location && 
    user.dateOfBirth &&
    user.email
  );
}

export function getProfileCompletionMessage(user: any): string {
  if (!user) return "Please complete your profile to get started.";
  
  const missing = [];
  if (!user.firstName) missing.push("first name");
  if (!user.lastName) missing.push("last name");
  if (!user.location) missing.push("location");
  if (!user.dateOfBirth) missing.push("date of birth");
  
  if (missing.length === 0) return "Your profile is complete!";
  
  return `Please add your ${missing.join(", ")} to complete your profile.`;
}