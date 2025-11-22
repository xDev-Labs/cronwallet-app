import { ClaimRewardModal } from "@/components/ClaimRewardModal";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { whiteInset } from "@/lib/constants/theme";
import { useAuth } from "@/lib/contexts/AuthContext";
import { hapticFeedback } from "@/lib/utils";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, View } from "react-native";


export default function HomeScreen() {
  const { user } = useAuth();
  const [showClaimModal, setShowClaimModal] = useState(false);

  const ACTION_CARDS = [
    {
      icon: require("../../../assets/icons/scan.png"),
      title: `Scan any${'\n'}QR code`,
      url: "./scan-qr"
    },
    {
      icon: require("../../../assets/icons/profile.png"),
      title: `Pay${'\n'}anyone`,
      url: "./pay-anyone"
    },
    {
      icon: require("../../../assets/icons/history.png"),
      title: `Transfer${'\n'}History`,
      url: "./history"
    },
    {
      icon: require("../../../assets/icons/wallet.png"),
      title: "Balance",
      url: "./balance"
    },
  ];

  const handleActionCardPress = (url: string) => {
    hapticFeedback();
    router.push(url as any);
  }

  const handleProfilePress = () => {
    hapticFeedback();
    router.push("./profile");
  }

  const handleClaimModalPress = () => {
    hapticFeedback();
    setShowClaimModal(true);
  }

  return (
    <View className="flex-1 bg-white">

      <Image
        source={require("../../../assets/images/home-bg.png")}
        className="w-full h-1/3 absolute top-0 left-0 "
      />

      <View className="w-full h-10 mt-24 flex-row items-center justify-between px-8">
        <Image source={require("../../../assets/icons/logo-3d.png")} className="w-10 h-10" />
        <Pressable className="w-12 h-12 bg-[#FFFFFF9C] rounded-xl items-center justify-center p-2" onPress={handleProfilePress}>
          <Image source={require("../../../assets/icons/user.png")} className="w-6 h-6" />
        </Pressable>
      </View>

      <View className="w-full h-fit mt-20 flex-row items-start justify-between px-8 ">
        {ACTION_CARDS.map((card, index) => (
          <Pressable key={index} className="flex items-center" onPress={() => handleActionCardPress(card.url)}>
            <View className="w-20 h-20 bg-[#F3F2FF] rounded-xl items-center justify-center p-2" >
              <Image source={card.icon} className="w-12 h-12" />
            </View>
            <Text className="text-sm font-sans text-black mt-1 text-center">{card.title}</Text>
          </Pressable>
        ))}
      </View>

      <View className="w-full h-fit px-8 mt-10">
        <View className="w-full h-fit flex-row items-center gap-4 p-2 border border-[#E2E2E2] rounded-full">
          <View className="bg-[#EBF3FF] w-fit p-3 rounded-full">
            <Image source={require("../../../assets/icons/logo-transparent.png")} className="w-4 h-4" />
          </View>
          <View className="">
            <Text className="text-sm font-sans text-black">CRON ID</Text>
            <Text className="text-sm font-sans font-semibold text-black">{user?.cron_id}</Text>
          </View>
        </View>
      </View>

      <View className="w-full h-fit px-8 mt-8">
        <Text className="text-2xl font-sans font-medium text-black">Offers & Rewards</Text>
      </View>

      <View className="w-full h-fit px-8 mt-4">
        <View className="w-full h-fit bg-[#F8F9FD] rounded-xl p-4 pb-12 flex items-start overflow-hidden">
          <View className="bg-[#EDEBFF] w-fit p-3 rounded-full">
            <Image source={require("../../../assets/icons/prize.png")} className="w-4 h-4" />
          </View>
          <View className="w-full flex-row">
            <View className="mt-2 w-1/2">
              <Text className="text-lg font-sans text-black font-semibold">Claim Your Reward</Text>
              <Text className="text-sm font-sans text-black">Before it vanishes 👀</Text>
            </View>
            <View className="w-1/2 flex items-end justify-start">
              <Button
                className="w-fit h-fit rounded-full flex justify-center items-center gap-2 px- py-3 z-10"
                style={whiteInset}
                onPress={handleClaimModalPress}
              >
                <Text className=" font-sans text-white ">Claim Now</Text>
              </Button>
            </View>
          </View>
          <Image source={require("../../../assets/images/gift.png")} className="w-36 h-36 absolute bottom-0 right-0" />
        </View>
      </View>

      <View className="absolute bottom-20 w-full h-fit px-8 mt-8 flex items-center justify-center">
        <Button className="w-fit rounded-full flex justify-center items-center gap-2 px-8 " style={whiteInset}>
          <Image source={require("../../../assets/icons/add.png")} className="w-6 h-6 " />
          <Text className="text-lg font-sans text-white ">Add Money</Text>
        </Button>
      </View>

      <ClaimRewardModal
        visible={showClaimModal}
        onClose={() => setShowClaimModal(false)}
      />
    </View>
  );
}
