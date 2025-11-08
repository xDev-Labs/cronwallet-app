/**
 * Microsoft Clarity SDK Type Definitions
 * @see https://learn.microsoft.com/en-us/clarity/mobile-sdk/react-native-sdk
 */

/**
 * Clarity SDK Configuration
 */
export interface ClarityConfig {
  projectId: string;
  logLevel?: 'None' | 'Error' | 'Warning' | 'Info' | 'Verbose';
  allowMeteredNetworkUsage?: boolean;
  enableWebViewCapture?: boolean;
  networkCaptureConfig?: NetworkCaptureConfig;
}

/**
 * Network Capture Configuration
 */
export interface NetworkCaptureConfig {
  enableNetworkCapture?: boolean;
  maxUrlSize?: number;
  maxHeaderSize?: number;
  maxBodySize?: number;
}

/**
 * Custom Event Properties
 */
export interface ClarityCustomEvent {
  [key: string]: string | number | boolean;
}

/**
 * User Identification
 */
export interface ClarityUser {
  userId: string;
  sessionId?: string;
  customTag?: string;
}

/**
 * Clarity SDK Methods
 */
export interface ClaritySDK {
  /**
   * Initialize Clarity with project ID
   */
  initialize(projectId: string): void;

  /**
   * Set custom user ID
   */
  setCustomUserId(userId: string): void;

  /**
   * Set custom tag for the session
   */
  setCustomTag(tag: string, value: string): void;

  /**
   * Pause session recording
   */
  pause(): void;

  /**
   * Resume session recording
   */
  resume(): void;

  /**
   * Get current session ID
   */
  getCurrentSessionId(): Promise<string | null>;

  /**
   * Get current session URL
   */
  getCurrentSessionUrl(): Promise<string | null>;
}
