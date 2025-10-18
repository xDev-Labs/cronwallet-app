import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { User } from '@/lib/types/user.types';

// Storage Keys
export const STORAGE_KEYS = {
  USER_PROFILE: 'cron_user_profile',
  HAS_COMPLETED_ONBOARDING: 'cron_onboarding_complete',
  PASSCODE: 'cron_passcode', // Secure
} as const;

// AsyncStorage utilities for non-sensitive data
export const storage = {
  // User Profile
  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to storage:', error);
      throw error;
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting user from storage:', error);
      return null;
    }
  },

  async updateUser(updates: Partial<User>): Promise<void> {
    try {
      const currentUser = await this.getUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updates };
        await this.saveUser(updatedUser);
      }
    } catch (error) {
      console.error('Error updating user in storage:', error);
      throw error;
    }
  },

  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    } catch (error) {
      console.error('Error removing user from storage:', error);
      throw error;
    }
  },

  // Onboarding Status
  async setOnboardingComplete(value: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.HAS_COMPLETED_ONBOARDING,
        JSON.stringify(value)
      );
    } catch (error) {
      console.error('Error setting onboarding status:', error);
      throw error;
    }
  },

  async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
      return value ? JSON.parse(value) : false;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  },

  // Clear all AsyncStorage data (non-sensitive)
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.HAS_COMPLETED_ONBOARDING,
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
};

// SecureStore utilities for sensitive data
export const secureStorage = {
  async savePasscode(passcode: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.PASSCODE, passcode);
    } catch (error) {
      console.error('Error saving passcode to secure storage:', error);
      throw error;
    }
  },

  async getPasscode(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.PASSCODE);
    } catch (error) {
      console.error('Error getting passcode from secure storage:', error);
      return null;
    }
  },

  async removePasscode(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.PASSCODE);
    } catch (error) {
      console.error('Error removing passcode from secure storage:', error);
      throw error;
    }
  },
};

// Clear ALL storage (both AsyncStorage and SecureStore)
export async function clearAllStorage(): Promise<void> {
  try {
    await Promise.all([
      storage.clearAll(),
      secureStorage.removePasscode(),
    ]);
    console.log('All storage cleared successfully');
  } catch (error) {
    console.error('Error clearing all storage:', error);
    throw error;
  }
}
