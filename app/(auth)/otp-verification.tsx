import CodeInput from "@/components/CodeInput";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ApiError, apiService } from "@/lib/services/api";
import { storage } from "@/lib/storage/storage";
import { fetchAndStoreUserTransactions } from "@/lib/utils/transactionService";
import { mapBackendUserToUser } from "@/lib/utils/userMapping";
import auth from "@react-native-firebase/auth";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  TouchableWithoutFeedback,
  View,
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

export default function OTPVerificationScreen() {
  const router = useRouter();
  const { countryCode, phoneNumber, verificationId } = useLocalSearchParams();
  const { saveUser } = useAuth();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
      return undefined;
    }
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResend = () => {
    if (canResend) {
      setCountdown(30);
      setCanResend(false);
      setOtp("");
      setError(false);
      console.log("Resending OTP to:", phoneNumber);
    }
  };

  function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
  }

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        handleRegistrationError(
          "Permission not granted to get push token for push notification!"
        );
        return;
      }
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        handleRegistrationError("Project ID not found");
      }
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log(pushTokenString);
        return pushTokenString;
      } catch (e: unknown) {
        handleRegistrationError(`${e}`);
      }
    } else {
      handleRegistrationError(
        "Must use physical device for push notifications"
      );
    }
  }

  const handleVerify = async () => {
    if (otp.length !== 6 || isVerifying) return;

    setError(false);
    setIsVerifying(true);

    try {
      if (verificationId) {
        // Real Firebase OTP verification
        const credential = auth.PhoneAuthProvider.credential(
          verificationId as string,
          otp
        );
        const userCredential = await auth().signInWithCredential(credential);

        console.log("OTP verification successful:", userCredential.user);

        // Create user in backend after successful OTP verification
        const fullPhoneNumber = `${countryCode}${phoneNumber}`;
        const response = await apiService.createUser(fullPhoneNumber);

        if (response.success && response.data) {
          console.log("Backend response:", response.data);

          // Handle different response structures
          const userData = response.data.user || response.data;
          console.log("User data to map:", userData);

          let token = null;
          try {
            token = await registerForPushNotificationsAsync();
          } catch (e) {
            console.log("Registering notification failed");
          }

          const updatedUserData = await apiService.updateUser(
            userData.user_id,
            {
              expo_push_token: token,
            }
          );
          console.log("Updated user data:", updatedUserData);

          // Map backend response to our user model
          const mappedUserData = mapBackendUserToUser(userData);

          console.log("Mapped user data:", mappedUserData);

          // Save user data to local storage
          await saveUser(mappedUserData);

          console.log("User created/found:", userData);
          console.log("Is new user:", response.data.isNewUser);

          // Check if user is new or returning
          const isNewUser = response.data.isNewUser;

          if (
            !isNewUser &&
            mappedUserData.cron_id &&
            mappedUserData.cron_id !== ""
          ) {
            await storage.setOnboardingComplete(true);
            await storage.savePublicKey(mappedUserData.primary_address);

            // Fetch and store user's last 10 transactions
            try {
              await fetchAndStoreUserTransactions(mappedUserData.user_id);
              console.log("Transactions fetched and stored for returning user");
            } catch (error) {
              console.warn(
                "Failed to fetch transactions for returning user:",
                error
              );
              // Continue even if transaction fetch fails
            }

            // Returning user with cron_id - go directly to tabs
            router.replace("/(tabs)");
            return;
          }
        }

        // New user or user without cron_id - continue with onboarding
        router.replace({
          pathname: "/(auth)/biometric-setup",
          params: {
            phoneNumber,
            countryCode,
          },
        });
      } else {
        // Fallback to simulation for testing
        if (otp === "123456") {
          // Simulate backend call for testing
          const fullPhoneNumber = `${countryCode}${phoneNumber}`;
          try {
            const response = await apiService.createUser(fullPhoneNumber);

            if (response.success && response.data) {
              // Handle different response structures
              const userData = response.data.user || response.data;

              // Map backend response to our user model
              const mappedUserData = mapBackendUserToUser(userData);

              await saveUser(mappedUserData);

              // Check if user is new or returning
              const isNewUser = response.data.isNewUser;

              if (
                !isNewUser &&
                mappedUserData.cron_id &&
                mappedUserData.cron_id !== ""
              ) {
                // Fetch and store user's last 10 transactions
                try {
                  await fetchAndStoreUserTransactions(mappedUserData.user_id);
                  console.log(
                    "Transactions fetched and stored for returning user (test mode)"
                  );
                } catch (error) {
                  console.warn(
                    "Failed to fetch transactions for returning user (test mode):",
                    error
                  );
                  // Continue even if transaction fetch fails
                }

                // Returning user with cron_id - go directly to tabs
                router.replace("/(tabs)");
                return;
              }
            }
          } catch (apiError) {
            console.warn(
              "API call failed in test mode, continuing with mock data"
            );
            // Continue with mock data if API fails in test mode
          }

          router.replace({
            pathname: "/(auth)/biometric-setup",
            params: {
              phoneNumber,
              countryCode,
            },
          });
        } else {
          setError(true);
        }
      }
    } catch (error) {
      console.error("OTP verification error:", error);

      if (error instanceof ApiError) {
        Alert.alert(
          "Verification Failed",
          error.message ||
            "An error occurred during verification. Please try again.",
          [{ text: "OK" }]
        );
      } else {
        setError(true);
        Alert.alert(
          "Verification Failed",
          "Invalid OTP. Please check the code and try again.",
          [{ text: "OK" }]
        );
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const isVerifyEnabled = otp.length === 6 && !isVerifying;

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-background-light"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-between bg-background-light mt-20">
            {/* Header (Logo) */}
            <View className="items-start px-6 pt-15 pb-10">
              <CronLogo />
            </View>

            {/* Content Area */}
            <View className="flex-1 px-6 justify-between">
              <View className="mt-5">
                {/* Header */}
                <Text variant="h3" className="text-foreground-dark">
                  OTP Verification
                </Text>
                <Text
                  variant="caption"
                  className="text-foreground-tertiary mb-8 font-sans"
                >
                  We&apos;ve sent you a 6 digit code on{" "}
                  <Text className="text-foreground-dark font-medium">
                    {countryCode} {phoneNumber}
                  </Text>
                </Text>

                {/* OTP Input */}
                <View className="items-center mb-8">
                  <CodeInput
                    length={6}
                    value={otp}
                    onChange={setOtp}
                    error={error}
                  />
                  {error && (
                    <Text className="text-error text-sm mt-4 text-center font-sans">
                      Invalid code. Please try again.
                    </Text>
                  )}
                </View>

                {/* Timer and Resend */}
                <View className="flex-row items-center justify-center mt-6">
                  <Text className="text-sm text-foreground-tertiary font-sans">
                    {formatTime(countdown)}
                  </Text>
                  <Text className="text-sm text-foreground-tertiary font-sans mx-2">
                    |
                  </Text>
                  <Pressable onPress={handleResend} disabled={!canResend}>
                    <Text
                      className={`text-sm font-semibold font-sans ${
                        canResend ? "text-primary" : "text-foreground-tertiary"
                      }`}
                    >
                      Resend OTP
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Verify Button Container */}
              <View
                className={`pt-2.5 ${Platform.OS === "ios" ? "pb-7.5" : "pb-5"}`}
              >
                <Button
                  onPress={handleVerify}
                  disabled={!isVerifyEnabled}
                  loading={isVerifying}
                  className="shadow-lg shadow-primary/20 font-medium mb-4"
                >
                  Verify OTP
                </Button>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
