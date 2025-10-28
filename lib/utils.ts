import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes a phone number by keeping only digits and the leading + sign
 * @param phone - The phone number to normalize
 * @returns The normalized phone number
 * @example
 * normalizePhoneNumber("+1 (555) 123-4567") // "+15551234567"
 * normalizePhoneNumber("555-123-4567") // "5551234567"
 */
export function normalizePhoneNumber(phone: string): string {
  // First, check if the phone starts with +
  const hasPlus = phone.startsWith('+');
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  
  // Add back the + if it was there originally
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
}
