import { Text } from "@/components/ui/text";
import { WalletSelectionModal } from "@/components/WalletSelectionModal";
import { useAuth } from "@/lib/contexts/AuthContext";
import { clearAllStorage } from "@/lib/storage/storage";
import { router } from "expo-router";
import { History, QrCode, Send, Wallet } from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
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
  description,
}: {
  icon: any;
  title: string;
  onPress?: () => void;
  description?: string;
}) => {
  // Convert CSS gradient angle (151.19deg) to React Native coordinates
  // CSS: 0deg = to top, 90deg = to right, 151.19deg = southeast direction
  const angle = 151.19;
  const radians = (angle * Math.PI) / 180;
  // Convert CSS angle to React Native coordinates (CSS uses clockwise from top, React Native uses unit circle)
  const x = Math.sin(radians);
  const y = -Math.cos(radians);
  // Normalize to 0-1 range, centered at 0.5
  const startX = Math.max(0, Math.min(1, 0.5 - x / 2));
  const startY = Math.max(0, Math.min(1, 0.5 - y / 2));
  const endX = Math.max(0, Math.min(1, 0.5 + x / 2));
  const endY = Math.max(0, Math.min(1, 0.5 + y / 2));

  return (
    <Pressable
      onPress={onPress}
      className="w-full bg-[#F9F6FF] rounded-2xl p-5 justify-center shadow-md active:opacity-80"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className="w-12 h-12  rounded-full items-center justify-center mb-3">
        <LinearGradient
          colors={["#4A3DFF", "#ABA5FF"]}
          locations={[0.0887, 0.929]}
          start={{ x: startX, y: startY }}
          end={{ x: endX, y: endY }}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} color="#ffffff" strokeWidth={2} />
        </LinearGradient>
      </View>
      <Text className="text-lg font-semibold text-foreground-dark">
        {title}
      </Text>
      <Text className="text-sm font-sans text-foreground-secondary">
        {description}
      </Text>
    </Pressable>
  );
};

export default function HomeScreen() {
  const [isWalletModalVisible, setIsWalletModalVisible] = useState(false);
  const { user } = useAuth();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">

      <View className="px-4 py-6 ">
        <View className="p-8 bg-[#12062B] rounded-2xl">
          {/* Top Row: Avatar + User Info | QR + Copy */}
          <View className="flex-row items-center justify-between">
            {/* Left Side: Avatar + User Info */}
            <View className="flex-row items-center">
              <Pressable
                onPress={() => clearAllStorage()}
              >
                <Image
                  source={{ uri: "https://visual-lime-chickadee.myfilebase.com/ipfs/QmS4qaqwEuQnDyQAAZ5Ghm6KzAoW2m9YRnQ1ku4Q23JX98" }}
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  resizeMode="cover"
                />
              </Pressable>
              <View>
                <Text className="text-white text-lg font-semibold">
                  {user?.cron_id}mohd
                </Text>
              </View>
            </View>

            {/* Right Side: QR + Copy */}
            <View className="flex-row items-center">
              <Pressable
                className="mr-3"
                onPress={() => router.push("/qr-code")}
              >
                <QrCode size={20} color="#FFFFFF" strokeWidth={2} />
              </Pressable>
            </View>
          </View>

        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Action Cards */}
        <View className="px-4 py-4">
          <View className="flex-row flex-wrap -mx-2">
            <View className="w-1/2 px-2 mb-4">
              <ActionCard
                icon={Send}
                title="Pay anyone"
                description="Send money to anyone using Phone Number"
                onPress={() => router.push("/(tabs)/pay-anyone")}
              />
            </View>
            <View className="w-1/2 px-2 mb-4">
              <ActionCard
                icon={Wallet}
                title="Balances"
                description="Check your assets on Solana"
                onPress={() => router.push("/(tabs)/balance")}
              />
            </View>
            <View className="w-1/2 px-2 mb-4">
              <ActionCard
                icon={History}
                title="Transfer History"
                description="View your transfer history"
                onPress={() => router.push("/(tabs)/history")}
              />
            </View>
            <View className="w-1/2 px-2 mb-4">
              <ActionCard
                icon={QrCode}
                title="Scan QR"
                description="Scan QR to send money"
                onPress={() => router.push("/(tabs)/scan-qr")}
              />
            </View>
          </View>
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
