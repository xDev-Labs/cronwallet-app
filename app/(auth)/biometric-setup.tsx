import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ApiError, apiService } from "@/lib/services/api";
import { mapBackendUserToUser } from "@/lib/utils/userMapping";

import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { ScanFace, Shield, Smartphone } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

global.Buffer = global.Buffer || require("buffer").Buffer;

const CronLogo = () => (
  <View className="flex-1 w-full items-center justify-center">
    <Image
      source={require("@/assets/images/cron-black-logo.png")}
      className="w-[100px] h-8"
      resizeMode="contain"
    />
  </View>
);

export default function BiometricSetupScreen() {
  const router = useRouter();
  const { user, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [biometricType, setBiometricType] = useState<
    "faceId" | "fingerprint" | "none"
  >("none");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      setIsAvailable(hasHardware);
      setIsEnrolled(isEnrolled);

      if (
        supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        )
      ) {
        setBiometricType("faceId");
      } else if (
        supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FINGERPRINT
        )
      ) {
        setBiometricType("fingerprint");
      } else {
        setBiometricType("none");
      }
    } catch (error) {
      console.error("Error checking biometric availability:", error);
    }
  };

  const handleEnableBiometric = async () => {
    if (!isAvailable || !isEnrolled) {
      Alert.alert(
        "Biometric Not Available",
        "Please set up Face ID or Touch ID in your device settings first.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to enable biometric login",
        fallbackLabel: "Use Passcode",
        cancelLabel: "Cancel",
      });

      if (result.success) {
        // Update user in backend with face_id_enabled = true
        if (user?.user_id) {
          try {
            const response = await apiService.updateUser(user.user_id, {
              face_id_enabled: true,
            });

            if (response.success && response.data) {
              console.log("Biometric update response:", response.data);

              // Handle different response structures
              const userData = response.data.user || response.data;
              console.log("User data to map:", userData);

              // Map the updated user data from backend
              const updatedUserData = mapBackendUserToUser(userData);

              // Update local user profile with the complete updated data
              await updateUserProfile(updatedUserData);
            }
          } catch (err) {
            console.error("Error updating biometric status:", err);
            if (err instanceof ApiError) {
              Alert.alert("Error", err.message);
            } else {
              Alert.alert(
                "Error",
                "Failed to update biometric settings. Please try again."
              );
            }
            return;
          }
        }

        router.replace("/(onboarding)/username");
      } else {
        Alert.alert(
          "Authentication Failed",
          "Biometric authentication was not successful. Please try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Biometric authentication error:", error);
      Alert.alert(
        "Error",
        "An error occurred during biometric authentication.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      // Save user without biometric enabled
      // const newUser: User = {
      //     id: Date.now().toString(),
      //     phoneNumber: (phoneNumber as string) || '',
      //     countryCode: (countryCode as string) || '',
      //     hasCompletedOnboarding: false,
      //     biometricEnabled: false,
      //     createdAt: new Date().toISOString(),
      // };

      // await saveUser(newUser);
      router.replace("/(onboarding)/username");
    } catch (error) {
      console.error("Error saving user:", error);
      Alert.alert("Error", "Failed to create account. Please try again.");
    }
  };

  const getBiometricIcon = () => {
    if (biometricType === "faceId") {
      return <ScanFace size={80} color="#4A3DFF" strokeWidth={1.5} />;
    } else if (biometricType === "fingerprint") {
      return <Smartphone size={80} color="#4A3DFF" strokeWidth={1.5} />;
    } else {
      return <Shield size={80} color="#4A3DFF" strokeWidth={1.5} />;
    }
  };

  const getBiometricTitle = () => {
    if (biometricType === "faceId") {
      return "Enable Face ID";
    } else if (biometricType === "fingerprint") {
      return "Enable Touch ID";
    } else {
      return "Enable Biometric";
    }
  };

  const getBiometricDescription = () => {
    if (biometricType === "faceId") {
      return "Use Face ID for quick and secure access to your account";
    } else if (biometricType === "fingerprint") {
      return "Use Touch ID for quick and secure access to your account";
    } else {
      return "Use biometric authentication for quick and secure access";
    }
  };

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-background-light"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-between bg-background-light mt-20">
          {/* Header (Logo) */}
          <View className="items-start px-6 pt-15 pb-10">
            <CronLogo />
          </View>

          {/* Content Area */}
          <View className="flex-1 px-6 justify-center">
            <View className="items-center mb-12">
              <View className="w-32 h-32 rounded-full bg-primary/10 items-center justify-center mb-8">
                {getBiometricIcon()}
              </View>

              <Text
                variant="h3"
                className="text-foreground-dark mb-4 text-center"
              >
                Secure Your Account
              </Text>

              <Text
                variant="caption"
                className="font-sans text-foreground-tertiary text-center leading-6 mb-8"
              >
                {getBiometricDescription()}
              </Text>

              {!isAvailable && (
                <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <Text className="text-yellow-800 text-sm text-center">
                    Biometric authentication is not available on this device
                  </Text>
                </View>
              )}

              {isAvailable && !isEnrolled && (
                <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <Text className="text-blue-800 text-sm text-center">
                    Please set up{" "}
                    {biometricType === "faceId" ? "Face ID" : "Touch ID"} in
                    your device settings first
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-col gap-4">
              <Button
                onPress={handleEnableBiometric}
                disabled={!isAvailable || !isEnrolled || isLoading}
                loading={isLoading}
                className="shadow-lg shadow-primary/20"
              >
                {getBiometricTitle()}
              </Button>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
