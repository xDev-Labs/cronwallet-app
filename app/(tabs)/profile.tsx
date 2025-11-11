import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/contexts/AuthContext";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { ChevronLeft, Copy } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [copied, setCopied] = useState(false);
  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/(auth)/phone-auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(user?.primary_address || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert("Error", "Failed to copy to clipboard");
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background-light">
      <View className="px-4 pt-4">
        <View className="flex-row justify-between items-center">
          <Pressable
            onPress={() => router.back()}
            className="p-2 -ml-2 active:opacity-70"
          >
            <ChevronLeft size={24} color="#000" />
          </Pressable>
          {/* <Text variant="h3" className="text-black text-center font-semibold">
            Profile
          </Text> */}
          {/* <View className="w-10" /> */}
        </View>
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center py-8">
          {/* Avatar */}
          <View className="mb-4">
            <Avatar size="lg" className="shadow-lg">
              {user?.avatar_url ? (
                <AvatarImage source={{ uri: user.avatar_url }} />
              ) : (
                <AvatarFallback>
                  {user?.cron_id?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              )}
            </Avatar>
          </View>

          {/* Username */}
          <Text className="text-2xl font-bold text-foreground-dark mb-1">
            {user?.cron_id ? `@${user.cron_id}` : "Guest"}
          </Text>

          {/* Phone Number */}
          <Text className="text-base text-foreground-tertiary">
            {user?.phone_number}
          </Text>
        </View>

        {/* Profile Info */}
        <View className="px-6 mt-4">
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-sm text-foreground-tertiary">
                Wallet Address
              </Text>
              <Pressable
                onPress={handleCopy}
                className="flex-row items-center gap-2 bg-gray-100 px-4 py-2 rounded-full active:opacity-70"
              >
                <Text className="text-sm font-medium text-foreground-dark">
                  {user?.primary_address
                    ? `${user.primary_address.slice(0, 10)}...${user.primary_address.slice(-5)}`
                    : "N/A"}
                </Text>

                <Copy
                  size={16}
                  color={copied ? "#22C55E" : "#4A3DFF"}
                  strokeWidth={2}
                />
              </Pressable>
            </View>
            <View className="flex-row justify-between items-center py-3">
              <Text className="text-sm text-foreground-tertiary">
                Member since
              </Text>
              <Text className="text-sm font-medium text-foreground-dark">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>
          </View>

          {/* Logout Button */}
          <Button onPress={handleLogout} variant="outline" className="mt-4">
            Logout
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
