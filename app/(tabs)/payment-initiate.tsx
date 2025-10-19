import { CryptoIcon } from '@/components/CryptoIcon';
import { Button } from '@/components/ui/button';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronDown, ChevronLeft } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Animated, Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentInitiateScreen() {
    const { contactId } = useLocalSearchParams();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState({ name: 'SOL', symbol: 'solana', rate: 0.40 });
    const slideAnim = useRef(new Animated.Value(0)).current;

    const coins = [
        { name: 'Solana', symbol: 'solana', rate: 0.20 },
        { name: 'USDT', symbol: 'usdt', rate: 100 },
        { name: 'USDC', symbol: 'usdc', rate: 100 }
    ];

    const openModal = () => {
        setIsModalVisible(true);
        Animated.timing(slideAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setIsModalVisible(false);
        });
    };

    const selectCoin = (coin: any) => {
        setSelectedCoin(coin);
        closeModal();
    };

    const handlePayPress = () => {
        router.push({
            pathname: './payment-confirm' as any,
            params: { contactId, amount: '100.00' },
        });
    };

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center px-4 py-3">
                <TouchableOpacity className="p-2" onPress={() => router.push({ pathname: '/(tabs)/recipient' as any, params: { contactId } })}>
                    <ChevronLeft size={28} color="#000" pointerEvents="none" />
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View className="flex-1 px-4">
                {/* You send exactly section */}
                <View className="mb-8">
                    <Text className="font-sans text-black text-base mb-3">You send exactly</Text>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1 mr-4">
                            <TouchableOpacity className="w-2/3 bg-gray-100 rounded-xl p-4 flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <Image
                                        source={{ uri: 'https://flagcdn.com/w20/us.png' }}
                                        className="w-6 h-4 mr-2"
                                    />
                                    <Text className="text-black font-medium">USD</Text>
                                </View>
                                <ChevronDown size={16} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <Text className="w-1/3 text-right text-[#4A3DFF] text-4xl font-bold">100.00</Text>
                    </View>
                </View>

                {/* Recipient gets section */}
                <View className="mb-8">
                    <Text className="text-black text-base mb-3">Recipient gets</Text>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1 mr-4">
                            <TouchableOpacity
                                className="w-2/3 bg-gray-100 rounded-xl p-4 flex-row items-center justify-between"
                                onPress={openModal}
                            >
                                <View className="flex-row items-center">
                                    <CryptoIcon symbol={selectedCoin.symbol} size={24} variant="branded" />
                                    <Text className="text-black font-medium ml-2">{selectedCoin.name}</Text>
                                </View>
                                <ChevronDown size={16} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <Text className="w-1/3 text-right text-[#4A3DFF] text-4xl font-bold">{selectedCoin.rate}</Text>
                    </View>
                </View>

                {/* Estimated fees section */}
                <View className="border-2 border-dashed border-green-500 rounded-xl p-4 mb-8">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                            <View className="flex-row items-center mb-2">
                                <View className="w-5 h-5 bg-black rounded items-center justify-center mr-2">
                                    <Text className="text-white text-xs">$</Text>
                                </View>
                                <Text className="font-sans text-gray-500 text-sm">Estimated fees</Text>
                            </View>
                            <Text className="font-sans text-black text-sm">Included in USD amount:</Text>
                        </View>
                        <Text className="text-green-500 font-bold text-lg">FREE</Text>
                    </View>
                </View>
            </View>

            {/* Bottom Button */}
            <View
                className="flex-row justify-center p-4 gap-3 bg-white"
                style={{
                    shadowColor: '#4A3DFF',
                    shadowOffset: { width: 0, height: -1 },
                    shadowRadius: 13.5,
                    shadowOpacity: 0.078,
                    elevation: 8
                }}
            >
                <Button className='w-full' onPress={handlePayPress}>Make Transfer</Button>
            </View>

            {/* Coin Selection Modal */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="none"
                onRequestClose={closeModal}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <TouchableOpacity
                        className="flex-1"
                        onPress={closeModal}
                        activeOpacity={1}
                    />
                    <Animated.View
                        className="bg-white rounded-t-3xl"
                        style={{
                            transform: [{
                                translateY: slideAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [400, 0]
                                })
                            }]
                        }}
                    >
                        <View className="p-6">
                            <Text className="text-black text-xl font-bold mb-6">Select Coin</Text>

                            {coins.map((coin, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className="flex-row items-center justify-between py-4 border-b border-gray-100"
                                    onPress={() => selectCoin(coin)}
                                >
                                    <View className="flex-row items-center">
                                        <CryptoIcon symbol={coin.symbol} size={32} variant="branded" />
                                        <Text className="text-black text-base font-medium ml-3">{coin.name}</Text>
                                    </View>
                                    <Text className="text-[#4A3DFF] text-base font-medium">≈ {coin.rate}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
