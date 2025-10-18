export interface User {
  id: string;
  phoneNumber: string;
  countryCode: string;
  username?: string;
  avatar?: string; // Emoji avatar
  hasCompletedOnboarding: boolean;
  createdAt: string;
}

export interface OnboardingState {
  hasCompletedOnboarding: boolean;
  currentStep?: 'username' | 'avatar' | 'complete';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
