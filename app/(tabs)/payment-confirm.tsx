import { CryptoIcon } from '@/components/CryptoIcon';
import { SlideToConfirm, SlideToConfirmHandle } from '@/components/SlideToConfirm';
import { Text as UIText } from '@/components/ui/text';
import { apiService } from '@/lib/services/api';
import { transferSpl } from '@/lib/solana/transferSpl';
import { storage } from '@/lib/storage/storage';
import { PublicKey } from '@solana/web3.js';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Lock } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
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
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const sliderText = status === 'processing' ? 'PROCESSING...' : 'SLIDE TO CONFIRM';

    const handleSlideToConfirm = async () => {
        if (status === 'processing') {
            return;
        }

        let didFail = false;
        setStatus('processing');
        setErrorMessage(null);
        try {
            let user = await storage.getUser();
            // let smartAccountAddress = "HYyxPRR5tR8PjHDXaQqDRxB8bQ4ScK2dynTeSqQLsCs1";
            let smartAccountAddress = user?.primary_address as string;

            console.log({ contactPhone });
            const normalizedPhone = (contactPhone as string).replace(/[^0-9+]/g, "");
            let recipientData = await apiService.getUserByPhoneNumber(normalizedPhone);
            let toAddress = "";
            if (recipientData.success) {
                toAddress = recipientData.data?.primary_address as string;
            } else {
                didFail = true;
                setStatus('failed');
                setErrorMessage('Payment failed. Please try again.');
                return;
            }
            let tokenAddress = coinAddress as string;
            let ownerPublicKey = await storage.getPublicKey() as string;
            let encodedTransaction = await transferSpl(Number(coinAmount) * (10 ** Number(coinDecimals)), smartAccountAddress, toAddress, tokenAddress, new PublicKey(ownerPublicKey));



            let response = await apiService.transferSpl(encodedTransaction, user?.user_id as string, recipientData.data?.user_id as string, Number(coinAmount), [{ amount: coinAmount as string, token_address: tokenAddress }]);

            console.log({ response });


            // Navigate to payment success screen
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
                    coinSymbol,
                    currencyCode,
                    currencyFlag,
                },
            });
        } catch (e) {
            console.log(e);
            didFail = true;
            setStatus('failed');
            setErrorMessage('Payment failed. Please try again.');
        } finally {
            sliderRef.current?.reset();
            if (!didFail) {
                setStatus('idle');
            }
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

    useEffect(() => {
        setErrorMessage(null);
    }, [])

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
                                    <View className="w-4 h-4 bg-[#4A3DFF] rounded mr-2" />
                                    <UIText className="text-black font-sans text-base font-semibold">
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
                    key={`${contactId}-${amount}`}
                    ref={sliderRef}
                    text={sliderText}
                    disabled={status === 'processing'}
                    onConfirm={handleSlideToConfirm}
                />
            </View>
        </SafeAreaView>
    );
}
