import { CryptoIcon } from '@/components/CryptoIcon';
import { Logo } from '@/components/icons/Logo';
import { SlideToConfirm, SlideToConfirmHandle } from '@/components/SlideToConfirm';
import { Text as UIText } from '@/components/ui/text';
import { apiService } from '@/lib/services/api';
import { normalizePhoneNumber } from '@/lib/utils';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Lock } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentConfirmScreen() {
    const {
        contactId,
        contactName,
        contactPhone,
        contactAvatarUrl,
        contactCronId,
        amount,
        coinAmount,
        coinName,
        coinAddress,
        coinDecimals,
        coinSymbol,
        currencyCode,
        currencyFlag,
    } = useLocalSearchParams();
    const sliderRef = useRef<SlideToConfirmHandle>(null);
    const [status, setStatus] = useState<'idle' | 'processing' | 'failed'>('idle');
    const sliderText = status === 'processing' ? 'PROCESSING...' : 'SLIDE TO CONFIRM';

    const handleSlideToConfirm = async () => {
        if (status === 'processing') {
            return;
        }

        setStatus('processing');

        try {
            // Validate recipient exists before proceeding
            const normalizedPhone = normalizePhoneNumber(contactPhone as string);
            const recipientData = await apiService.getUserByPhoneNumber(normalizedPhone);

            if (!recipientData.success || !recipientData.data?.primary_address) {
                setStatus('failed');
                sliderRef.current?.reset();
                return;
            }

            // Navigate to payment success screen with all necessary transaction details
            router.push({
                pathname: './payment-success' as any,
                params: {
                    contactId,
                    contactName,
                    contactPhone,
                    contactAvatarUrl,
                    contactCronId,
                    amount,
                    coinAmount,
                    coinName,
                    coinAddress,
                    coinDecimals,
                    coinSymbol,
                    currencyCode,
                    currencyFlag,
                    toAddress: recipientData.data.primary_address,
                },
            });
        } catch (e) {
            console.log('Error validating recipient:', e);
            setStatus('failed');
            sliderRef.current?.reset();
        }
    };

    const renderAvatar = () => {
        if (contactAvatarUrl && typeof contactAvatarUrl === 'string' && contactAvatarUrl.trim()) {
            return (
                <Image
                    source={{ uri: contactAvatarUrl }}
                    className="w-12 h-12 rounded-full"
                />
            );
        }

        const name = typeof contactName === 'string' ? contactName : 'Unknown';
        const initial = name.charAt(0).toUpperCase();
        const colors = ['#E91E63', '#9C27B0', '#FF5722', '#2196F3', '#4CAF50'];
        const colorIndex = name.charCodeAt(0) % colors.length;

        return (
            <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: colors[colorIndex] }}
            >
                <UIText className="text-white text-xl font-bold">{initial}</UIText>
            </View>
        );
    };

    // Reset status and slider when screen gains focus
    useFocusEffect(
        useCallback(() => {
            setStatus('idle');
            sliderRef.current?.reset();
        }, [])
    );

    useEffect(() => {
        sliderRef.current?.reset();
    }, [contactId, amount]);
    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center px-4 py-4">
                <Pressable
                    onPress={() => router.push({
                        pathname: '/(tabs)/payment-initiate' as any,
                        params: {
                            contactId,
                            contactName,
                            contactPhone,
                            contactAvatarUrl,
                            contactCronId,
                        }
                    })}
                    className="p-2"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <ChevronLeft size={24} color="#000" />
                </Pressable>

                <Pressable onPress={handleSlideToConfirm}>

                    <UIText className="text-xl font-sans font-bold text-foreground-dark ml-4">
                        Transfer Summary
                    </UIText>
                </Pressable>
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
                                    <Logo size={12} color="#000000" fill="#000000" />
                                    <UIText className="text-black font-sans text-base font-semibold ml-2">
                                        {contactCronId || `${contactName}`}
                                    </UIText>
                                </View>
                                <UIText className="text-foreground-secondary text-sm font-sans">
                                    {contactPhone || 'No phone'}
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
                                    source={{ uri: `https://flagcdn.com/w20/${currencyFlag || 'us'}.png` }}
                                    className="w-6 h-4 mr-2"
                                />
                                <UIText className="text-black font-sans ml-2">{currencyCode || 'USD'}</UIText>
                            </View>
                            <UIText className="text-[#4A3DFF] text-3xl font-bold">
                                {amount || '0.00'}
                            </UIText>
                        </View>

                        {/* Receiver Gets */}
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <CryptoIcon symbol={(coinName as string)?.toLowerCase() || 'solana'} size={32} variant="branded" />
                                <UIText className="text-black font-sans ml-2">{(coinSymbol as string)?.toUpperCase() || 'SOL'}</UIText>
                            </View>
                            <UIText className="text-[#4A3DFF] text-3xl font-bold">
                                {coinAmount || '0.00'}
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
                    key={`${contactId}-${amount}-${coinAmount}`}
                    ref={sliderRef}
                    text={sliderText}
                    disabled={status === 'processing'}
                    onConfirm={handleSlideToConfirm}
                />
            </View>
        </SafeAreaView>
    );
}
