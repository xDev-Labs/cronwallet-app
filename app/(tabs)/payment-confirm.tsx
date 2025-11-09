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
import { Alert, Image, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentConfirmScreen() {
    const params = useLocalSearchParams();
    
    // Safely extract and validate params
    const contactId = Array.isArray(params.contactId) ? params.contactId[0] : params.contactId;
    const contactName = Array.isArray(params.contactName) ? params.contactName[0] : params.contactName;
    const contactPhone = Array.isArray(params.contactPhone) ? params.contactPhone[0] : params.contactPhone;
    const contactAvatarUrl = Array.isArray(params.contactAvatarUrl) ? params.contactAvatarUrl[0] : params.contactAvatarUrl;
    const contactCronId = Array.isArray(params.contactCronId) ? params.contactCronId[0] : params.contactCronId;
    const coinAmount = Array.isArray(params.coinAmount) ? params.coinAmount[0] : params.coinAmount;
    const coinName = Array.isArray(params.coinName) ? params.coinName[0] : params.coinName;
    const coinAddress = Array.isArray(params.coinAddress) ? params.coinAddress[0] : params.coinAddress;
    const coinDecimals = Array.isArray(params.coinDecimals) ? params.coinDecimals[0] : params.coinDecimals;
    const coinSymbol = Array.isArray(params.coinSymbol) ? params.coinSymbol[0] : params.coinSymbol;
    const currencyCode = Array.isArray(params.currencyCode) ? params.currencyCode[0] : params.currencyCode;
    const currencyFlag = Array.isArray(params.currencyFlag) ? params.currencyFlag[0] : params.currencyFlag;
    const type = Array.isArray(params.type) ? params.type[0] : params.type;
    const walletAddress = Array.isArray(params.walletAddress) ? params.walletAddress[0] : params.walletAddress;
    
    const sliderRef = useRef<SlideToConfirmHandle>(null);
    const isMountedRef = useRef(true);
    const isProcessingRef = useRef(false);
    const [status, setStatus] = useState<'idle' | 'processing' | 'failed'>('idle');
    const sliderText = status === 'processing' ? 'PROCESSING...' : 'SLIDE TO CONFIRM';

    const handleSlideToConfirm = async () => {
        // Prevent concurrent executions
        if (isProcessingRef.current || status === 'processing') {
            return;
        }

        // Validate required params based on type
        if (type === 'walletAddress' || type === 'solName') {
            if (!walletAddress || typeof walletAddress !== 'string') {
                Alert.alert('Error', 'Invalid wallet address');
                return;
            }
        } else {
            if (!contactPhone || typeof contactPhone !== 'string') {
                Alert.alert('Error', 'Contact phone number is required');
                return;
            }
        }

        // Validate coin params
        if (!coinAmount || !coinName || !coinAddress) {
            Alert.alert('Error', 'Payment details are incomplete');
            return;
        }

        isProcessingRef.current = true;
        if (isMountedRef.current) {
            setStatus('processing');
        }

        try {
            let toAddress: string;

            // For wallet addresses and .sol domains, use the walletAddress directly
            if (type === 'walletAddress' || type === 'solName') {
                toAddress = walletAddress;
            } else {
                // For regular contacts, validate recipient exists
                const normalizedPhone = normalizePhoneNumber(contactPhone);
                
                try {
                    const recipientData = await apiService.getUserByPhoneNumber(normalizedPhone);

                    if (!recipientData.success || !recipientData.data?.primary_address) {
                        throw new Error('Recipient not found or has no wallet address');
                    }
                    toAddress = recipientData.data.primary_address;
                } catch (apiError) {
                    // Handle specific API errors
                    if (apiError instanceof Error) {
                        if (apiError.message.includes('timeout')) {
                            throw new Error('Connection timeout. Please check your internet and try again.');
                        } else if (apiError.message.includes('Recipient not found')) {
                            throw new Error('Recipient is not registered on CronWallet');
                        }
                    }
                    throw apiError;
                }
            }

            // Validate toAddress before navigation
            if (!toAddress || typeof toAddress !== 'string') {
                throw new Error('Invalid recipient address');
            }

            // Navigate to payment success screen with validated params
            if (isMountedRef.current) {
                router.push({
                    pathname: './payment-success' as any,
                    params: {
                        contactId: contactId || '',
                        contactName: contactName || '',
                        contactPhone: contactPhone || '',
                        contactAvatarUrl: contactAvatarUrl || '',
                        contactCronId: contactCronId || '',
                        coinAmount: coinAmount,
                        coinName: coinName,
                        coinAddress: coinAddress,
                        coinDecimals: coinDecimals || '',
                        coinSymbol: coinSymbol || '',
                        currencyCode: currencyCode || '',
                        currencyFlag: currencyFlag || '',
                        toAddress: toAddress,
                        type: type || '',
                        walletAddress: walletAddress || '',
                    },
                });
            }
        } catch (error) {
            console.error('Payment confirmation error:', error);
            
            if (isMountedRef.current) {
                setStatus('failed');
                
                // Show user-friendly error message
                const errorMessage = error instanceof Error 
                    ? error.message 
                    : 'Payment confirmation failed. Please try again.';
                
                Alert.alert('Payment Error', errorMessage);
                
                // Reset slider after a delay to show error state
                setTimeout(() => {
                    if (isMountedRef.current && sliderRef.current) {
                        sliderRef.current.reset();
                    }
                }, 500);
            }
        } finally {
            isProcessingRef.current = false;
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
            isMountedRef.current = true;
            isProcessingRef.current = false;
            setStatus('idle');
            sliderRef.current?.reset();
            
            return () => {
                isMountedRef.current = false;
            };
        }, [])
    );

    useEffect(() => {
        if (isMountedRef.current && sliderRef.current) {
            sliderRef.current.reset();
        }
    }, [contactId, coinAmount]);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);
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
                            type,
                            walletAddress,
                        }
                    })}
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
                                {type !== "walletAddress" && type !== "solName" ? (
                                    <>
                                        <View className="flex-row items-center mb-1">
                                            <Logo size={12} color="#000000" fill="#000000" />
                                            <UIText className="text-black font-sans text-base font-semibold ml-2">
                                                {contactCronId || `${contactName}`}
                                            </UIText>
                                        </View>
                                        <UIText className="text-foreground-secondary text-sm font-sans">
                                            {contactPhone || 'No phone'}
                                        </UIText>
                                    </>
                                ) : (
                                    <>
                                        <UIText className="text-black font-sans text-base font-semibold mb-1">
                                            {contactName}
                                        </UIText>
                                        <UIText className="text-foreground-secondary text-sm font-sans">
                                            {walletAddress && `${(walletAddress as string).slice(0, 4)}...${(walletAddress as string).slice(-4)}`}
                                        </UIText>
                                    </>
                                )}
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
                    key={`${contactId}-${coinAmount}`}
                    ref={sliderRef}
                    text={sliderText}
                    disabled={status === 'processing'}
                    onConfirm={handleSlideToConfirm}
                />
            </View>
        </SafeAreaView>
    );
}
