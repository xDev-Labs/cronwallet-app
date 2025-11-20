import { Button } from "@/components/ui/button";
import { router } from "expo-router";
import { Dimensions, Image, ImageBackground, Text, View } from "react-native";

export default function GetStartedScreen() {
    const screenHeight = Dimensions.get('window').height;

    return (
        <View className="flex-1 justify-end">
            <View className="h-1/2">
                <Text>Get Started</Text>
            </View>
            <ImageBackground
                source={require("@/assets/images/onboarding-bg.png")}
                style={{ height: screenHeight / 2 }}
                className="px-5 py-16 flex justify-end gap-4"
                resizeMode="cover"
            >
                <Image source={require("../../assets/images/logo-white.png")} className="w-10 h-10 z-10" />
                <Text className="text-white text-4xl font-bold font-sans">Crypto finally feels,{'\n'}like payments</Text>
                <Text className="text-white/90 text-base font-sans leading-6 mb-6">Pay anyone, anytime along with {'\n'}private transaction, built in Solana</Text>
                <Button className="w-full bg-white rounded-full" onPress={() => router.push("/(auth)/phone-auth")}>
                    <Text className="text-black text-lg font-semibold">Get Started</Text>
                </Button>
            </ImageBackground>
        </View>
    );
}