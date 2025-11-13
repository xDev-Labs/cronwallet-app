import { Buffer } from 'buffer';
global.Buffer = Buffer;

import { CronLogo } from "@/components/common/CronLogo";
import { useAuth } from "@/lib/contexts/AuthContext";
import { storage } from "@/lib/storage/storage";
import "@react-native-firebase/app";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";

export default function SplashScreen() {
  const router = useRouter();
  const { user, isLoading, isBiometricAuthenticated } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(opacityAnim, {
      toValue: 1,
      delay: 200,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Check onboarding status
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const isComplete = await storage.hasCompletedOnboarding();
        setOnboardingComplete(isComplete);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setOnboardingComplete(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        // Route based on user state
        if (user) {
          if (onboardingComplete) {
            // Onboarding is complete - user can access the app
            // Check if biometric is enabled and not already authenticated in this session
            if (user.face_id_enabled && !isBiometricAuthenticated) {
              router.replace("/(auth)/biometric-lock");
            } else {
              router.replace("/(tabs)");
            }
          } else {
            // Onboarding not complete - determine where in the flow they are
            if (!user.cron_id) {
              // No cron_id yet - start from biometric setup (which will route to username)
              router.replace("/(auth)/biometric-setup");
            } else {
              // Has cron_id but onboarding not marked complete
              // Skip biometric setup and username, go to setting-up to complete
              router.replace("/(onboarding)/setting-up");
            }
          }
        } else {
          // No user - start authentication flow
          router.replace("/(auth)/phone-auth");
        }
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, user, isBiometricAuthenticated, onboardingComplete]);

  return (
    <View className=" bg-white justify-center items-center h-full">
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          alignItems: "center",
        }}
      >
        <View className="justify-center items-center shadow-lg">
          <CronLogo className="w-[150px]" />
        </View>
      </Animated.View>
    </View>
  );
}
