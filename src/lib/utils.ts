import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind classes with standard clsx logic.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitizes user input to prevent XSS and ensure data integrity.
 * @param input The raw string input from a form field.
 * @returns A cleaned string with HTML tags removed and whitespace trimmed.
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .trim();                   // Remove leading/trailing whitespace
}
