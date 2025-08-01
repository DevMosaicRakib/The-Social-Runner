import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// UK date formatting utility (DD Month YY)
export function formatDateUK(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString("en-GB", { 
    day: "2-digit", 
    month: "short", 
    year: "2-digit" 
  });
}
