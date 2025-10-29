import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import React from "react";
import { Modal, Pressable, View } from "react-native";
import { CryptoIcon } from "./CryptoIcon";

interface WelcomeRewardModalProps {
    visible: boolean;
    onClose: () => void;
}

export const WelcomeRewardModal: React.FC<WelcomeRewardModalProps> = ({
    visible,
    onClose,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50">
                <Pressable className="flex-1" onPress={onClose} />
                <View className="bg-white rounded-t-3xl pb-8">

                    {/* Content */}
                    <View className="px-6 pt-12 pb-8">

                        {/* Congratulatory Text */}
                        <View className="items-center mb-6">
                            <Text className="text-[#4A3DFF] font-sans text-4xl font-semibold mb-2">
                                Congrats!
                            </Text>
                            <View className="flex-row  items-center font-semibold font-sans text-2xl text-center my-2">
                                <CryptoIcon symbol="usdc" size={28} />
                                <Text className="text-[#4A3DFF] text-2xl font-sans font-semibold ml-2">10 </Text>
                                <Text className="text-[#4A3DFF] text-2xl font-sans font-semibold">USDC</Text>
                            </View>
                            <Text className="text-[#4A3DFF] font-sans text-lg text-center">
                                Deposited to your wallet
                            </Text>
                        </View>

                        {/* Claim Button */}
                        <View className="pt-4">
                            <Button className="w-full" onPress={onClose}>
                                Close
                            </Button>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

