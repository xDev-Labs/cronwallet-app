import { router, useLocalSearchParams } from 'expo-router';
import { ChevronDown, Clock, MoveVertical as MoreVertical, ShieldCheck, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { Text } from '@/components/ui/text';
import { mockContacts, mockUserAccount } from '../../data/mockData';

export default function PaymentConfirmScreen() {
    const { contactId, amount } = useLocalSearchParams();
    const contact = mockContacts.find(c => c.id === contactId);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!contact) {
        return null;
    }

    const handlePayment = async () => {
        try {
            // Check if biometric authentication is available
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            const authTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

            if (!hasHardware) {
                Alert.alert('Error', 'Biometric authentication is not available on this device.');
                return;
            }

            if (!isEnrolled) {
                Alert.alert('Error', 'No biometric authentication is enrolled on this device. Please set up Face ID or Touch ID in Settings.');
                return;
            }

            // Determine authentication method
            const hasFaceID = authTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
            const hasTouchID = authTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);

            const promptMessage = hasFaceID
                ? 'Scan your face to confirm payment'
                : hasTouchID
                ? 'Scan your fingerprint to confirm payment'
                : 'Authenticate to confirm payment';

            // Authenticate with Face ID
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage,
                fallbackLabel: 'Use Passcode',
                cancelLabel: 'Cancel',
                disableDeviceFallback: false,
            });

            if (!result.success) {
                Alert.alert('Authentication Failed', 'Payment cancelled. Please try again.');
                return;
            }

            // Proceed with payment after successful authentication
            setIsProcessing(true);
            setTimeout(() => {
                setIsProcessing(false);
                router.push({
                    pathname: './payment-success' as any,
                    params: { contactId, amount },
                });
            }, 2000);
        } catch (error) {
            Alert.alert('Error', 'An error occurred during authentication. Please try again.');
            console.error('Biometric authentication error:', error);
        }
    };

    const renderAvatar = () => {
        if (contact.avatarUrl) {
            return (
                <Image
                    source={{ uri: contact.avatarUrl }}
                    className="w-20 h-20 rounded-full mb-4"
                />
            );
        }

        const initial = contact.name.charAt(0).toUpperCase();
        return (
            <View className="w-20 h-20 rounded-full justify-center items-center mb-4 bg-[#4CAF50]">
                <Text className="text-foreground text-[32px] font-bold">{initial}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-row items-center justify-between px-4 py-3">
                <TouchableOpacity
                    className="p-2"
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <X size={28} color="#fff" pointerEvents="none" />
                </TouchableOpacity>
                <View className="flex-row gap-2">
                    <TouchableOpacity className="p-1">
                        <Clock size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-1">
                        <MoreVertical size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-1 items-center pt-10">
                <View className="items-center mb-10">
                    {renderAvatar()}
                    <Text className="text-foreground text-xl font-semibold mb-2">Paying {contact.bankingName}</Text>
                    <View className="flex-row items-center gap-1.5 mb-1">
                        <ShieldCheck size={16} color="#4CAF50" fill="#4CAF50" />
                        <Text className="text-foreground-secondary text-sm">Banking name: {contact.bankingName}</Text>
                    </View>
                    <Text className="text-foreground-secondary text-sm">{contact.phone}</Text>
                </View>

                <View className="flex-row items-center justify-center mb-6">
                    <Text className="text-foreground text-[64px] font-light">₹</Text>
                    <Text className="text-foreground text-[64px] font-light ml-2">{amount}</Text>
                </View>

                <TouchableOpacity className="py-2 px-5">
                    <Text className="text-foreground-secondary text-base">Add note</Text>
                </TouchableOpacity>
            </View>

            <View className="px-4 pb-6">
                <View className="mb-4">
                    <Text className="text-foreground text-base mb-3">Choose account to pay with</Text>
                    <TouchableOpacity className="flex-row items-center bg-[#1C1C1E] p-4 rounded-xl gap-3">
                        <Image
                            source={{ uri: 'https://images.pexels.com/photos/164501/pexels-photo-164501.jpeg?auto=compress&cs=tinysrgb&w=100' }}
                            className="w-10 h-10 rounded-lg"
                        />
                        <View className="flex-1">
                            <Text className="text-foreground text-base font-medium mb-1">{mockUserAccount.bankName} ····{mockUserAccount.accountNumber}</Text>
                            <Text className="text-[#2196F3] text-sm">Balance: Check now</Text>
                        </View>
                        <ChevronDown size={24} color="#8E8E93" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    className="bg-[#A8D5FF] py-4 rounded-[28px] items-center mb-4 min-h-[56px] justify-center"
                    onPress={handlePayment}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text className="text-background text-lg font-semibold">Pay ₹{amount}</Text>
                    )}
                </TouchableOpacity>

                <View className="items-center">
                    <Image
                        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/200px-UPI-Logo-vector.svg.png' }}
                        className="w-[100px] h-[30px] tint-[#8E8E93]"
                        resizeMode="contain"
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}
