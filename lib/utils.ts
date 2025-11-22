import { clsx, type ClassValue } from "clsx";
import * as Haptics from 'expo-haptics';
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



export function hapticFeedback(style?: "light" | "medium" | "heavy" | "soft" | "rigid") {
  switch (style) {
    case "light":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case "medium":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case "heavy":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
    case "soft":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      break;
    case "rigid":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      break;
    default:
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
  }
}