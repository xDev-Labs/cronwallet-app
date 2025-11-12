import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { apiService } from "./services/api";

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
export function normalizePhoneNumber(phone: string | null | undefined): string {
  // Handle null, undefined, or non-string values
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // First, check if the phone starts with +
  const hasPlus = phone.startsWith('+');

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/[^0-9]/g, '');

  // Add back the + if it was there originally
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
}

export const shortenTxnHash = (hash: string) => {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}


export const logDebug = async (level: string) => {
  await apiService.logDebug(level);
}