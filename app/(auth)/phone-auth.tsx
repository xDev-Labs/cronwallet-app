import { CountryPicker } from "@/components/CountryPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { countries, type Country } from "@/lib/constants/countries";
import { whiteInset } from "@/lib/constants/theme";
import auth from "@react-native-firebase/auth";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
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

export default function PhoneAuthScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find((c) => c.code === "IN") || countries[0]
  );
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneNumberChange = (text: string) => {
    // Only allow digits
    const digitsOnly = text.replace(/[^0-9]/g, "");
    setPhoneNumber(digitsOnly);
  };

  const isValidPhoneNumber = () => {
    return selectedCountry.regex.test(phoneNumber);
  }

  const getPhoneMaxLength = (regex: RegExp): number => {
    const source = regex.source;

    // Match patterns like {9,12} or {10}
    const matches = [...source.matchAll(/\{(\d+)(?:,(\d+))?\}/g)];

    if (matches.length === 0) {
      // fallback: count \d occurrences if no quantifier found
      const digitCount = (source.match(/\\d/g) || []).length;
      return digitCount || 0;
    }

    // Extract all upper bounds (or lower if no upper)
    const lengths = matches.map(([_, min, max]) => Number(max || min));
    console.log(lengths)

    // Return the maximum upper bound found
    return Math.max(...lengths);
  };

  const generatePlaceHolder = (length: number): string => {
    if (length <= 4) return "0".repeat(length);

    let groupSize = 3;
    if (length % 4 === 0) groupSize = 4;
    else if (length === 10) groupSize = 5;
    else if (length === 8) groupSize = 4;

    const zeros = "0".repeat(length);
    return zeros.match(new RegExp(`.{1,${groupSize}}`, "g"))!.join("-");
  }

  const maxLength = getPhoneMaxLength(selectedCountry.regex);
  const placeHolder = generatePlaceHolder(maxLength);


  const handleNext = async () => {
    setIsLoading(true);
    try {
      // Construct phone number with country code
      const phone = `${selectedCountry.dialCode}${phoneNumber}`;
      console.log("Sending OTP to:", phone);

      // Send OTP using React Native Firebase
      const confirmation = await auth().signInWithPhoneNumber(phone);
      console.log("Verification ID:", confirmation.verificationId);

      // Navigate to OTP verification screen
      router.push({
        pathname: "/(auth)/otp-verification",
        params: {
          countryCode: selectedCountry.dialCode,
          phoneNumber,
          verificationId: confirmation.verificationId,
        },
      });
    } catch (error) {
      console.error("Phone authentication error:", error);
      setIsLoading(false);
      Alert.alert(
        "Authentication Error",
        "Failed to send OTP. Please check your phone number and try again.",
        [{ text: "OK" }]
      );
    }
  };

  const isButtonEnabled = isValidPhoneNumber() && !isLoading;

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
          <View className="flex-1 bg-background-light">

            {/* Content Area */}
            <View className="flex-1 px-6 mt-20">
              <Text variant="h1" className="font-sans font-semibold text-foreground-dark">
                Connect your phone
              </Text>
              <Text
                variant="muted"
                className="text-[#979797] mb-4 font-sans text-lg"
              >
                Enter you phone number to continue
              </Text>

              {/* Phone Input Field Container */}
              <View
                className={`flex-row items-center h-14 rounded-xl border px-2.5 ${isFocused
                  ? "border-border-focus bg-background-light"
                  : "border-border-light"
                  }`}
              >
                {/* Country Code Selector */}
                <CountryPicker
                  selectedCountry={selectedCountry}
                  onSelectCountry={setSelectedCountry}
                />

                {/* Separator Line */}
                <View className="w-px h-3/5 bg-gray-300 mx-2" />

                {/* Phone Number Input */}
                <Input
                  className="font-sans border-0 flex-1 -mt-2 bg-transparent px-2 text-foreground-dark "
                  placeholder={placeHolder}
                  placeholderTextColor="#A0A0A0"
                  keyboardType="phone-pad"
                  maxLength={maxLength}
                  value={phoneNumber}
                  onChangeText={handlePhoneNumberChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </View>
            </View>

            {/* Next Button Container */}
            <View
              className={`px-6 pt-2.5 ${Platform.OS === "ios" ? "pb-7.5" : "pb-5"}`}
            >
              <Button
                onPress={handleNext}
                loading={isLoading}
                disabled={!isButtonEnabled}
                className="shadow-lg font-bold rounded-full shadow-primary/20 mb-4"
                style={whiteInset}
              >
                <Text className="text-white text-lg font-bold font-sans">
                  Get OTP
                </Text>
              </Button>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
