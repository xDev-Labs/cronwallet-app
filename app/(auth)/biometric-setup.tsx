import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { whiteInset } from "@/lib/constants/theme";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ApiError, apiService } from "@/lib/services/api";
import { mapBackendUserToUser } from "@/lib/utils/userMapping";

import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  View
} from "react-native";

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
  const screenHeight = Dimensions.get('window').height;

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

        // Check if user already has a cron_id
        if (user?.cron_id) {
          // User already has username, go to setting-up
          router.replace("/(onboarding)/setting-up");
        } else {
          // User needs to claim username
          router.replace("/(onboarding)/username");
        }
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
    <View
      className="flex-1 bg-white"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-between bg-white">

          <Image
            source={require("@/assets/images/onboarding-bg.png")}
            style={{ height: screenHeight * 0.5, }}
            className="w-full rotate-180"
            resizeMode="cover"
          />


          <View
            className="px-5 py-16 flex justify-end gap-4 h-1/2"
          >
            <Image source={require("../../assets/images/face-id-icon.png")} className="w-10 h-10 z-10" />
            <Text className="text-black text-4xl font-bold font-sans">Save Passkey</Text>
            <Text className="text-[#979797] text-base font-sans leading-6 mb-16">Passkeys are a secure alternative to {'\n'}passwords saved on your device</Text>
            <Button className="w-full bg-primary rounded-full" onPress={handleEnableBiometric} style={whiteInset}>
              <Image source={require("../../assets/icons/face-id.png")} className="w-6 h-6 z-10 mr-4" />
              <Text className="text-white text-lg font-semibold">Setup Passkey</Text>
            </Button>
          </View>




        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}
