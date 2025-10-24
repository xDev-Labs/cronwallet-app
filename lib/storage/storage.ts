import type { Transaction } from "@/lib/types/transaction.types";
import type { User } from "@/lib/types/user.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

// Storage Keys
export const STORAGE_KEYS = {
  USER_PROFILE: "cron_user_profile",
  HAS_COMPLETED_ONBOARDING: "cron_onboarding_complete",
  LATEST_TRANSACTIONS: "cron_latest_transactions",
  PUBLIC_KEY: "cron_public_key",
  PASSCODE: "cron_passcode", // Secure
  BIOMETRIC_ENABLED: "cron_biometric_enabled", // Secure
} as const;

// AsyncStorage utilities for non-sensitive data
export const storage = {
  // User Profile
  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(user)
      );
    } catch (error) {
      console.error("Error saving user to storage:", error);
      throw error;
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error("Error getting user from storage:", error);
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
      console.error("Error updating user in storage:", error);
      throw error;
    }
  },

  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    } catch (error) {
      console.error("Error removing user from storage:", error);
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
      console.error("Error setting onboarding status:", error);
      throw error;
    }
  },

  async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(
        STORAGE_KEYS.HAS_COMPLETED_ONBOARDING
      );
      return value ? JSON.parse(value) : false;
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      return false;
    }
  },

  // Latest Transactions
  async saveLatestTransactions(transactions: Transaction[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.LATEST_TRANSACTIONS,
        JSON.stringify(transactions)
      );
    } catch (error) {
      console.error("Error saving latest transactions:", error);
      throw error;
    }
  },

  async getLatestTransactions(): Promise<Transaction[]> {
    try {
      const transactionsJson = await AsyncStorage.getItem(
        STORAGE_KEYS.LATEST_TRANSACTIONS
      );
      return transactionsJson ? JSON.parse(transactionsJson) : [];
    } catch (error) {
      console.error("Error getting latest transactions:", error);
      return [];
    }
  },

  async addTransaction(transaction: Transaction): Promise<void> {
    try {
      const currentTransactions = await this.getLatestTransactions();
      const updatedTransactions = [transaction, ...currentTransactions];
      // Keep only the latest 50 transactions
      const limitedTransactions = updatedTransactions.slice(0, 50);
      await this.saveLatestTransactions(limitedTransactions);
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }
  },

  async clearTransactions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.LATEST_TRANSACTIONS);
    } catch (error) {
      console.error("Error clearing transactions:", error);
      throw error;
    }
  },

  // Public Key
  async savePublicKey(publicKey: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PUBLIC_KEY, publicKey);
    } catch (error) {
      console.error("Error saving public key:", error);
      throw error;
    }
  },

  async getPublicKey(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.PUBLIC_KEY);
    } catch (error) {
      console.error("Error getting public key:", error);
      return null;
    }
  },

  async removePublicKey(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PUBLIC_KEY);
    } catch (error) {
      console.error("Error removing public key:", error);
      throw error;
    }
  },

  // Clear all AsyncStorage data (non-sensitive)
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.HAS_COMPLETED_ONBOARDING,
        STORAGE_KEYS.LATEST_TRANSACTIONS,
      ]);
    } catch (error) {
      console.error("Error clearing storage:", error);
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
      console.error("Error saving passcode to secure storage:", error);
      throw error;
    }
  },

  async getPasscode(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.PASSCODE);
    } catch (error) {
      console.error("Error getting passcode from secure storage:", error);
      return null;
    }
  },

  async removePasscode(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.PASSCODE);
    } catch (error) {
      console.error("Error removing passcode from secure storage:", error);
      throw error;
    }
  },

  // Biometric Settings
  async saveBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        STORAGE_KEYS.BIOMETRIC_ENABLED,
        enabled.toString()
      );
    } catch (error) {
      console.error("Error saving biometric setting to secure storage:", error);
      throw error;
    }
  },

  async getBiometricEnabled(): Promise<boolean> {
    try {
      const value = await SecureStore.getItemAsync(
        STORAGE_KEYS.BIOMETRIC_ENABLED
      );
      return value === "true";
    } catch (error) {
      console.error(
        "Error getting biometric setting from secure storage:",
        error
      );
      return false;
    }
  },

  async removeBiometricSetting(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED);
    } catch (error) {
      console.error(
        "Error removing biometric setting from secure storage:",
        error
      );
      throw error;
    }
  },
};

// Clear ALL storage (both AsyncStorage and SecureStore)
export async function clearAllStorage(): Promise<void> {
  try {
    await Promise.all([storage.clearAll(), secureStorage.removePasscode()]);
    console.log("All storage cleared successfully");
  } catch (error) {
    console.error("Error clearing all storage:", error);
    throw error;
  }
}
