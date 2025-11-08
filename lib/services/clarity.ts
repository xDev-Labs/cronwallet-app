/**
 * Microsoft Clarity Service
 * Helper functions for tracking custom events and user actions
 */

import { Platform } from 'react-native';

// Import Clarity conditionally for native platforms
let Clarity: any = null;
try {
  Clarity = require('@microsoft/react-native-clarity').default;
} catch (e) {
  // Clarity module not available (web platform or not installed)
}

/**
 * Check if Clarity is available (only on native platforms)
 */
const isClarityAvailable = (): boolean => {
  return Platform.OS !== 'web' && Clarity !== null;
};

/**
 * Set custom user ID for tracking
 */
export const setClarityUserId = (userId: string): void => {
  if (!isClarityAvailable()) return;

  try {
    Clarity.setCustomUserId(userId);
  } catch (error) {
    console.error('[Clarity] Failed to set user ID:', error);
  }
};

/**
 * Set custom tag for the session
 */
export const setClarityTag = (tag: string, value: string): void => {
  if (!isClarityAvailable()) return;

  try {
    Clarity.setCustomTag(tag, value);
  } catch (error) {
    console.error('[Clarity] Failed to set custom tag:', error);
  }
};

/**
 * Pause session recording
 */
export const pauseClarityRecording = (): void => {
  if (!isClarityAvailable()) return;

  try {
    Clarity.pause();
  } catch (error) {
    console.error('[Clarity] Failed to pause recording:', error);
  }
};

/**
 * Resume session recording
 */
export const resumeClarityRecording = (): void => {
  if (!isClarityAvailable()) return;

  try {
    Clarity.resume();
  } catch (error) {
    console.error('[Clarity] Failed to resume recording:', error);
  }
};

/**
 * Get current session ID
 */
export const getClaritySessionId = async (): Promise<string | null> => {
  if (!isClarityAvailable()) return null;

  try {
    const sessionId = await Clarity.getCurrentSessionId();
    return sessionId ?? null;
  } catch (error) {
    console.error('[Clarity] Failed to get session ID:', error);
    return null;
  }
};

/**
 * Get current session URL
 */
export const getClaritySessionUrl = async (): Promise<string | null> => {
  if (!isClarityAvailable()) return null;

  try {
    const sessionUrl = await Clarity.getCurrentSessionUrl();
    return sessionUrl ?? null;
  } catch (error) {
    console.error('[Clarity] Failed to get session URL:', error);
    return null;
  }
};

/**
 * Track custom events (predefined events for common actions)
 */
export const clarityEvents = {
  // Authentication events
  phoneAuthStarted: () => setClarityTag('event', 'phone_auth_started'),
  otpVerified: () => setClarityTag('event', 'otp_verified'),
  passcodeCreated: () => setClarityTag('event', 'passcode_created'),
  biometricEnabled: () => setClarityTag('event', 'biometric_enabled'),
  loginSuccess: () => setClarityTag('event', 'login_success'),
  logoutSuccess: () => setClarityTag('event', 'logout_success'),

  // Onboarding events
  usernameCreated: (username: string) => {
    setClarityTag('event', 'username_created');
    setClarityTag('username', username);
  },
  avatarSelected: () => setClarityTag('event', 'avatar_selected'),
  onboardingCompleted: () => setClarityTag('event', 'onboarding_completed'),

  // Payment events
  paymentInitiated: (currency: string, token: string) => {
    setClarityTag('event', 'payment_initiated');
    setClarityTag('currency', currency);
    setClarityTag('token', token);
  },
  paymentConfirmed: (amount: string, token: string) => {
    setClarityTag('event', 'payment_confirmed');
    setClarityTag('amount', amount);
    setClarityTag('token', token);
  },
  paymentSuccess: (txHash: string) => {
    setClarityTag('event', 'payment_success');
    setClarityTag('tx_hash', txHash);
  },
  paymentFailed: (error: string) => {
    setClarityTag('event', 'payment_failed');
    setClarityTag('error', error);
  },

  // Contact events
  contactAdded: () => setClarityTag('event', 'contact_added'),
  contactSelected: () => setClarityTag('event', 'contact_selected'),

  // App lifecycle
  appOpened: () => setClarityTag('event', 'app_opened'),
  screenViewed: (screenName: string) => {
    setClarityTag('event', 'screen_viewed');
    setClarityTag('screen', screenName);
  },
};

/**
 * Clarity Service - exported object for easy access
 */
export const clarityService = {
  setUserId: setClarityUserId,
  setTag: setClarityTag,
  pause: pauseClarityRecording,
  resume: resumeClarityRecording,
  getSessionId: getClaritySessionId,
  getSessionUrl: getClaritySessionUrl,
  events: clarityEvents,
};

export default clarityService;
