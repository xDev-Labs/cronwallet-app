import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/contexts/AuthContext";
import { apiService } from "@/lib/services/api";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StatusBar,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const CronLogo = () => (
  <View className="items-center justify-center">
    <Image
      source={require("@/assets/images/cron-black-logo.png")}
      className="w-[120px] h-10"
      resizeMode="contain"
    />
  </View>
);

export default function SettingUpScreen() {
  const { completeOnboarding, user } = useAuth();
  const [status, setStatus] = useState("Setting up account...");

  useEffect(() => {
    const setupAccount = async () => {
      try {
        setStatus("Finalizing your profile...");

       // TODO: Make an setup required

        // Simulate final setup process
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Complete onboarding locally
        await completeOnboarding();

        // Navigate to home
        router.replace("/(tabs)");
      } catch (err) {
        console.error("Error completing setup:", err);
        setStatus("Setup complete!");

        // Complete onboarding locally even if backend fails
        try {
          await completeOnboarding();
        } catch (localError) {
          console.error("Error completing local onboarding:", localError);
        }

        // Navigate to home
        router.replace("/(tabs)");
      }
    };

    setupAccount();
  }, [user?.user_id, completeOnboarding]);

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-background-light"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View className="flex-1 justify-center items-center px-6">
        {/* Centered Logo */}
        <View className="flex-1 justify-center items-center">
          <CronLogo />
        </View>

        {/* Bottom Loading Section */}
        <View className="pb-20 items-center">
          <ActivityIndicator size="small" color="#4A3DFF" />
          <Text
            variant="caption"
            className="text-foreground-tertiary mt-4 font-sans"
          >
            {status}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
