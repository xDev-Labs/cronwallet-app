import { OnBoardingPages } from "@/components/OnBoardingPages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ApiError, apiService } from "@/lib/services/api";
import { mapBackendUserToUser } from "@/lib/utils/userMapping";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CronLogo = () => (
  <View className="flex-1 w-full items-center justify-center">
    <Image
      source={require("@/assets/images/cron-black-logo.png")}
      className="w-[100px] h-8"
      resizeMode="contain"
    />
  </View>
);

export default function UsernameScreen() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const { updateUserProfile, user } = useAuth();

  // Skip this page if user already has a cron_id (only check on mount)
  useEffect(() => {
    if (user?.cron_id && !hasNavigated) {
      console.log('User already has cron_id:', user.cron_id);
      setHasNavigated(true);
      // User already has a username, skip to next step
      router.replace("/(onboarding)/setting-up");
    }
  }, []); // Empty dependency array - only run on mount

  const validateUsername = (text: string): string | null => {
    if (text.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (text.length > 20) {
      return "Username must be less than 20 characters";
    }
    if (/^\d+$/.test(text)) {
      return "Username cannot be only numbers";
    }
    if (/^\d/.test(text)) {
      return "Username cannot start with a number";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(text)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    return null;
  };

  const handleUsernameChange = (text: string) => {
    // Remove spaces and special characters except underscore
    const cleaned = text.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(cleaned);
    setError("");
    setAvailabilityMessage("");
    setIsAvailable(false);
  };

  // Check username validation and cron ID availability with debounce
  useEffect(() => {
    if (username.length >= 3) {
      const timeoutId = setTimeout(async () => {
        // First validate the username
        const validationError = validateUsername(username);

        if (validationError) {
          // If validation fails, show error and don't check availability
          setError(validationError);
          setAvailabilityMessage("");
          setIsAvailable(false);
        } else {
          // If validation passes, clear error and check availability
          setError("");
          await checkCronIdAvailability(username);
        }
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    } else {
      // Clear everything if username is too short
      setError("");
      setAvailabilityMessage("");
      setIsAvailable(false);
      return undefined;
    }
  }, [username]);

  const checkCronIdAvailability = async (cronId: string) => {
    if (cronId.length < 3) return;

    setIsCheckingAvailability(true);
    setAvailabilityMessage("");

    try {
      const response = await apiService.checkCronIdAvailability(cronId);

      if (response.success && response.data) {
        setIsAvailable(response.data.available);
        setAvailabilityMessage(response.message);
      }
    } catch (error) {
      console.error("Error checking cron ID availability:", error);
      if (error instanceof ApiError) {
        setAvailabilityMessage(error.message);
      } else {
        setAvailabilityMessage(
          "Unable to check availability. Please try again."
        );
      }
      setIsAvailable(false);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleContinue = async () => {
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!isAvailable) {
      setError("Please select an available username.");
      return;
    }
    console.log(user);
    if (!user?.user_id) {
      setError("User not found. Please try logging in again.");
      return;
    }

    setIsLoading(true);
    setHasNavigated(true); // Prevent double navigation

    try {
      // Register the cron ID with the backend
      const response = await apiService.registerCronId(user.user_id, username);

      if (response.success && response.data) {
        console.log("Register response data:", response.data);

        // Handle different response structures
        const userData = response.data.user || response.data;
        console.log("User data to map:", userData);

        // Map the updated user data from backend
        const updatedUserData = mapBackendUserToUser(userData);

        // Update local user profile with the complete updated data
        await updateUserProfile(updatedUserData);
        router.push("/(onboarding)/setting-up");
      } else {
        setError("Failed to register username. Please try again.");
        setIsLoading(false);
        setHasNavigated(false); // Reset on error
      }
    } catch (err) {
      console.error("Error registering username:", err);
      setIsLoading(false);
      setHasNavigated(false); // Reset on error
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to register username. Please try again.");
      }
    }
  };

  const isButtonEnabled =
    username.length >= 3 &&
    isAvailable &&
    !isCheckingAvailability &&
    !isLoading;

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-background-light"
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-between bg-background-light">
            {/* Content Area */}
            <View className="flex-1 px-6 justify-center">
              <OnBoardingPages selected="username" />
              <Text variant="h4" className="text-foreground-dark">
                Claim your username
              </Text>
              <Text
                variant="muted"
                className="text-[#C0C0C0] mb-8 font-sans text-sm"
              >
                This cannot be changed later.
              </Text>

              <Input
                className="h-14  font-sans rounded-lg border-[#ECECEC] border bg-transparent text-foreground-dark"
                placeholderTextColor="#A0A0A0"
                value={username}
                onChangeText={handleUsernameChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />

              {/* Validation Error and Availability Status */}
              {username.length >= 3 && (
                <View className="mt-2">
                  {error ? (
                    <Text className="text-error text-sm font-sans">
                      {error}
                    </Text>
                  ) : isCheckingAvailability ? (
                    <Text className="text-foreground-tertiary text-sm font-sans">
                      Checking availability...
                    </Text>
                  ) : availabilityMessage ? (
                    <Text
                      className={`text-sm font-sans ${isAvailable ? "text-green-600" : "text-error"
                        }`}
                    >
                      {availabilityMessage}
                    </Text>
                  ) : null}
                </View>
              )}
            </View>

            {/* Continue Button Container */}
            <View
              className={`px-6 pt-2.5 ${Platform.OS === "ios" ? "pb-7.5" : "pb-5"}`}
            >
              <Button
                onPress={handleContinue}
                disabled={!isButtonEnabled}
                loading={isLoading}
                className="shadow-lg shadow-primary/20 font-medium mb-4"
              >
                Claim Username
              </Button>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView >
  );
}
