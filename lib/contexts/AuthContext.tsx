import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, AuthState } from '@/lib/types/user.types';
import { storage, clearAllStorage } from '@/lib/storage/storage';

interface AuthContextType extends AuthState {
  saveUser: (user: User) => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await storage.getUser();
      setState({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const saveUser = async (user: User) => {
    try {
      await storage.saveUser(user);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    try {
      if (!state.user) {
        throw new Error('No user to update');
      }

      const updatedUser = { ...state.user, ...updates };
      await storage.saveUser(updatedUser);
      setState({
        ...state,
        user: updatedUser,
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const completeOnboarding = async () => {
    try {
      if (!state.user) {
        throw new Error('No user found');
      }

      await updateUserProfile({ hasCompletedOnboarding: true });
      await storage.setOnboardingComplete(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await clearAllStorage();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    await loadUserData();
  };

  const value: AuthContextType = {
    ...state,
    saveUser,
    updateUserProfile,
    completeOnboarding,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
