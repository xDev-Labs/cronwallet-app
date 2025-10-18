export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

export interface User {
  id: string;
  phone: string;
  countryCode: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface PhoneAuthData {
  phone: string;
  countryCode: string;
}

export interface OTPVerificationData {
  phone: string;
  countryCode: string;
  otp: string;
}

export interface PasscodeData {
  passcode: string;
}

export interface BiometricAuthData {
  enabled: boolean;
  type?: 'fingerprint' | 'faceId';
}
