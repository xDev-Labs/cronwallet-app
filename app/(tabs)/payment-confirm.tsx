import { CryptoIcon } from '@/components/CryptoIcon';
import { SlideToConfirm } from '@/components/SlideToConfirm';
import { Text as UIText } from '@/components/ui/text';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Lock } from 'lucide-react-native';
import { Image, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockContacts } from '../../data/mockData';

export default function PaymentConfirmScreen() {
    const { contactId, amount } = useLocalSearchParams();
    const contact = mockContacts.find(c => c.id === contactId);

    if (!contact) {
        return null;
    }

    const handleSlideToConfirm = () => {
        // Navigate to payment success screen
        router.push({
            pathname: './payment-success' as any,
            params: { contactId, amount },
        });
    };

    const renderAvatar = () => {
        if (contact.avatarUrl) {
            return (
                <Image
                    source={{ uri: contact.avatarUrl }}
                    className="w-12 h-12 rounded-full"
                />
            );
        }

        const initial = contact.name.charAt(0).toUpperCase();
        const colors = ['#E91E63', '#9C27B0', '#FF5722', '#2196F3', '#4CAF50'];
        const colorIndex = contact.name.charCodeAt(0) % colors.length;

        return (
            <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: colors[colorIndex] }}
            >
                <UIText className="text-white text-xl font-bold">{initial}</UIText>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center px-4 py-4">
                <Pressable
                    onPress={() => router.push({ pathname: '/(tabs)/payment-initiate' as any, params: { contactId } })}
                    className="p-2"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <ChevronLeft size={24} color="#000" />
                </Pressable>
                <UIText className="text-xl font-sans font-bold text-foreground-dark ml-4">
                    Transfer Summary
                </UIText>
            </View>

            <View className="flex-1 px-4">
                {/* Receiver Details */}
                <View className="mb-6">
                    <UIText className="text-lg font-sans font-semibold text-foreground-dark mb-3">
                        Receiver Details
                    </UIText>
                    <View className="bg-white rounded-xl p-4 border border-gray-100">
                        <View className="flex-row items-center">
                            {renderAvatar()}
                            <View className="ml-3 flex-1">
                                <View className="flex-row items-center mb-1">
                                    <View className="w-4 h-4 bg-[#4A3DFF] rounded mr-2" />
                                    <UIText className="text-black font-sans text-base font-semibold">
                                        {contact.name}@1341
                                    </UIText>
                                </View>
                                <UIText className="text-foreground-secondary text-sm font-sans">
                                    {contact.phone}
                                </UIText>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Transfer Details */}
                <View className="mb-6">
                    <UIText className="text-lg font-semibold text-foreground-dark mb-3">
                        Transfer Details
                    </UIText>
                    <View className="bg-white rounded-xl p-4 border border-gray-100">
                        {/* You Send */}
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <Image
                                    source={{ uri: 'https://flagcdn.com/w20/us.png' }}
                                    className="w-6 h-4 mr-2"
                                />
                                <UIText className="text-black font-sans ml-2">USD</UIText>
                            </View>
                            <UIText className="text-[#4A3DFF] text-3xl font-bold">
                                {amount || '100.00'}
                            </UIText>
                        </View>

                        {/* Receiver Gets */}
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <CryptoIcon symbol="solana" size={32} variant="branded" />
                                <UIText className="text-black font-sans ml-2">SOL</UIText>
                            </View>
                            <UIText className="text-[#4A3DFF] text-3xl font-bold">
                                0.40
                            </UIText>
                        </View>

                        {/* Fees Section */}
                        <View className="border-2 border-dashed border-green-500 rounded-xl p-3">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-1">
                                        <Lock size={16} color="#000" />
                                        <UIText className="text-foreground-secondary font-sans text-sm ml-2">
                                            Estimated fees
                                        </UIText>
                                    </View>
                                    <UIText className="text-black font-sans text-sm">
                                        Included in USD amount:
                                    </UIText>
                                </View>
                                <UIText className="text-green-500 font-bold text-lg">
                                    FREE
                                </UIText>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Slide to Confirm Button */}
            <View className="px-4 pb-4">
                <SlideToConfirm
                    key={`${contactId}-${amount}`}
                    onConfirm={handleSlideToConfirm}
                />
            </View>
        </SafeAreaView>
    );
}