import { ChevronRight } from "@/components/icons/ChevronRight";
import { RosetteDiscount } from "@/components/icons/RosetteDiscount";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { WalletSelectionModal } from "@/components/WalletSelectionModal";
import { useAuth } from "@/lib/contexts/AuthContext";
import { clearAllStorage } from "@/lib/storage/storage";
import { router } from "expo-router";
import { Bell, QrCode, Send, Smartphone } from "lucide-react-native";
import { useState } from "react";
import { Image, Linking, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CronLogo = () => (
  <Image
    source={require("@/assets/images/cron-black-logo.png")}
    className="w-[100px] h-8"
    resizeMode="contain"
  />
);

const ActionCard = ({
  icon: Icon,
  title,
  onPress,
}: {
  icon: any;
  title: string;
  onPress?: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className="flex-1 bg-white rounded-2xl p-5 items-center justify-center mx-2 shadow-md active:opacity-80"
    style={{
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    }}
  >
    <View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center mb-3">
      <Icon size={28} color="#4A3DFF" strokeWidth={2} />
    </View>
    <Text className="text-sm font-medium text-foreground-dark text-center">
      {title}
    </Text>
  </Pressable>
);

export default function HomeScreen() {
  const hasNotifications = true; // Change this based on actual notification state
  const [isWalletModalVisible, setIsWalletModalVisible] = useState(false);
  const { user } = useAuth();
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background-light">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white">
        <CronLogo />
        <Pressable className="relative">
          <Bell size={24} color="#000000" strokeWidth={2} />
          {hasNotifications && (
            <View className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          )}
        </Pressable>
      </View>

      <View className="px-4 py-6 ">
        <View className="p-8 bg-[#12062B] rounded-xl">
          {/* Top Row: Avatar + User Info | QR + Copy */}
          <View className="flex-row items-center justify-between mb-6">
            {/* Left Side: Avatar + User Info */}
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 rounded-full items-center justify-center border mr-4"
                style={{
                  backgroundColor: "#F8F8F8",
                  borderColor: "#12062B26",
                }}
              />
              <View>
                <Text className="text-white text-lg font-semibold">
                  christopaul322
                </Text>
                <Text className="text-white text-sm opacity-80">
                  +91 98639 19301
                </Text>
              </View>
            </View>

            {/* Right Side: QR + Copy */}
            <View className="flex-row items-center">
              <Pressable className="mr-3">
                <QrCode size={20} color="#FFFFFF" strokeWidth={2} />
              </Pressable>
            </View>
          </View>

          {/* Add Funds Button */}
          <Button
            className="w-full align-center"
            size="icon"
            onPress={async () => {
              try {
                  const userWalletAddress =
                    user?.primary_address || user?.wallet_address?.[0];

                  if (!userWalletAddress) {
                    console.log("No wallet address found for user");
                    return;
                  }
                await Linking.openURL(
                  `solana:${userWalletAddress}`
                );
              } catch (error) {
                console.log(error);
              }
            }}
          >
            Add Funds
          </Button>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Action Cards */}
        <View className="px-4 py-6">
          <View className="flex-row">
            <ActionCard
              icon={Send}
              title="Pay anyone"
              onPress={() => router.push("/(tabs)/pay-anyone")}
            />
            <ActionCard
              icon={QrCode}
              title="Scan QR"
              onPress={() => console.log("Scan QR")}
            />
            <ActionCard
              icon={Smartphone}
              title="Balance"
              onPress={() => console.log("Check balance")}
            />
          </View>
        </View>

        {/* Offer */}
        <View className="px-4 py-4">
          <Pressable
            className="bg-[#4A3DFF] flex-row items-center justify-between rounded-xl px-6 py-4"
            onPress={() => clearAllStorage()}
          >
            <View className="flex-row items-center">
              <Text className="text-white font-bold text-base mr-2">
                FIRST TRANSFER FREE
              </Text>
              <ChevronRight size={16} color="#FFFFFF" strokeWidth={2} />
            </View>
            <View className="w-8 h-8 rounded-full  items-center justify-center">
              <RosetteDiscount size={24} color="#fff" />
            </View>
          </Pressable>
        </View>
      </ScrollView>

      {/* Wallet Selection Modal */}
      <WalletSelectionModal
        visible={isWalletModalVisible}
        onClose={() => setIsWalletModalVisible(false)}
      />
    </SafeAreaView>
  );
}
