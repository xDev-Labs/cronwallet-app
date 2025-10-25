import { Text } from "@/components/ui/text";
import { router, useLocalSearchParams } from "expo-router";
import { CheckCircle, CircleCheckBig, Share2, ShieldCheck } from "lucide-react-native";
import { useRef } from "react";
import {
  Alert,
  Image,
  Platform,
  Share,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";

export default function PaymentSuccessScreen() {
  const {
    contactId,
    amount,
    contactName,
    contactPhone,
    contactAvatarUrl,
    contactCronId,
    currencyCode,
  } = useLocalSearchParams();
  const successScreenRef = useRef<View>(null);

  // Use the passed contact data directly instead of looking up from mockContacts
  const contact = {
    name: (contactName as string) || "Unknown",
    bankingName: (contactCronId as string) || "N/A",
    avatarUrl: contactAvatarUrl as string,
  };

  if (!contactName || !amount) {
    return null;
  }

  const handleShare = async () => {
    try {
      if (!successScreenRef.current) {
        Alert.alert("Error", "Unable to capture screen. Please try again.");
        return;
      }

      // Capture the success screen view
      const uri = await captureRef(successScreenRef, {
        format: "png",
        quality: 1,
      });

      // Share the image with message
      await Share.share({
        message: `Payment successful! Paid ${amount} ${currencyCode} to ${contact.name}`,
        url: Platform.OS === "ios" ? uri : `file://${uri}`,
      });
    } catch (error) {
      console.error("Error sharing screenshot:", error);
      // Don't show alert if user cancelled the share
      if ((error as any).message !== "User did not share") {
        Alert.alert("Error", "Failed to share screenshot. Please try again.");
      }
    }
  };

  const handleDone = () => {
    router.push({
      pathname: "./recipient" as any,
      params: {
        contactId,
        contactName,
        contactPhone,
        contactAvatarUrl,
        contactCronId,
      },
    });
  };

  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString("en-US", { month: "long" })} ${currentDate.getFullYear()}, ${currentDate.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View
        ref={successScreenRef}
        collapsable={false}
        className="flex-1 px-4 pt-[60px] bg-background"
      >
        <View className="items-center mb-10">
          <View className="mb-8">
            <CircleCheckBig size={80} color="#2196F3" strokeWidth={2.5} />
          </View>

          <Text className="text-foreground text-5xl font-normal mb-6">
            {amount} {currencyCode}
          </Text>

          <Text className="text-foreground-secondary text-base mb-2">
            Paid to
          </Text>
          <Text className="text-foreground text-[28px] font-semibold mb-3">
            {contact.name.split(" ")[0]}
          </Text>

          <View className="flex-row items-center gap-1.5 mb-2">
            <ShieldCheck size={16} color="#4CAF50" fill="#4CAF50" />
            <Text className="text-foreground-secondary text-sm">
              Cron ID: {contactCronId}
            </Text>
          </View>

          <Text className="text-foreground-secondary text-sm">
            {formattedDate}
          </Text>
        </View>

        <View className="bg-[#1C1C1E] rounded-2xl p-6 flex-row justify-between items-center mb-6">
          <View className="flex-1">
            <Text className="text-foreground text-lg font-medium leading-6">
              You have unopened
            </Text>
            <Text className="text-foreground text-lg font-medium leading-6">
              rewards
            </Text>
            <TouchableOpacity className="bg-[rgba(255,255,255,0.1)] py-2 px-4 rounded-[20px] self-start mt-3">
              <Text className="text-foreground text-sm font-medium">
                Open now
              </Text>
            </TouchableOpacity>
          </View>
          <View className="relative w-[100px] h-[100px] justify-center items-center">
            <View
              className="w-[70px] h-[70px] bg-[#2196F3] rounded-xl justify-center items-center"
              style={{ transform: [{ rotate: "-10deg" }] }}
            >
              <Text className="text-[36px]">🎁</Text>
            </View>
            <View className="absolute w-2 h-2 bg-[#FF5252] rounded-full top-2.5 right-5" />
            <View className="absolute w-1.5 h-1.5 bg-[#2196F3] rounded-full bottom-5 left-2.5" />
            <View className="absolute w-[7px] h-[7px] bg-[#4CAF50] rounded-full top-[15px] left-[15px]" />
            <View className="absolute w-2 h-2 bg-[#FFC107] rounded-full bottom-[15px] right-[15px]" />
          </View>
        </View>

        <View className="items-center gap-2">
          <Text className="text-foreground-secondary text-[11px] tracking-wider">
            POWERED BY
          </Text>
          <Image
            source={{
              uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/200px-UPI-Logo-vector.svg.png",
            }}
            className="w-[100px] h-[30px] tint-[#8E8E93]"
            resizeMode="contain"
          />
        </View>
      </View>

      <View className="flex-row p-4 gap-3 bg-background border-t border-[#1C1C1E] mb-10">
        <TouchableOpacity
          className="flex-row items-center justify-center bg-[#1C1C1E] py-3.5 px-6 rounded-3xl gap-2 flex-1"
          onPress={handleShare}
        >
          <Share2 size={20} color="#fff" />
          <Text className="text-foreground text-base font-medium">
            Share screenshot
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-[#A8D5FF] py-3.5 px-10 rounded-3xl justify-center items-center"
          onPress={handleDone}
        >
          <Text className="text-background text-base font-semibold">Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
