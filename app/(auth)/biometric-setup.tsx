import { OnBoardingPages } from "@/components/OnBoardingPages";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ApiError, apiService } from "@/lib/services/api";
import { mapBackendUserToUser } from "@/lib/utils/userMapping";

import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  View
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

    setIsLoading(true);

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to enable biometric login",
        fallbackLabel: "Use Passcode",
        cancelLabel: "Cancel",
      });

      console.log("Biometric result:", result);

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

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-background-light"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-between bg-background-light">

          {/* Content Area */}
          <View className="flex-1 px-6 justify-center">
            <OnBoardingPages selected="biometric" />
            <Text variant="h4" className="text-foreground-dark">
              Secure your wallet
            </Text>
            <Text
              variant="muted"
              className="text-[#C0C0C0] mb-8 font-sans text-sm"
            >
              Your Device Key is safely stored on your phone and protected by your biometrics.
            </Text>
          </View>

          <View
            className={`px-6 pt-2.5 ${Platform.OS === "ios" ? "pb-7.5" : "pb-5"}`}
          >
            <Button
              onPress={handleEnableBiometric}
              loading={isLoading}
              className="shadow-lg shadow-primary/20 font-medium mb-4"
            >
              Create Device Key
            </Button>
          </View>


        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
