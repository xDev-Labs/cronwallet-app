import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { CountryPicker } from '@/components/CountryPicker';
import { countries, type Country } from '@/lib/constants/countries';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    View
} from 'react-native';

const CronLogo = () => (
    <View className="flex-1 w-full items-center justify-center">
        <Image
            source={require('@/assets/images/cron-black-logo.png')}
            className="w-[100px] h-8"
            resizeMode="contain"
        />
    </View>
);

export default function PhoneAuthScreen() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<Country>(
        countries.find((c) => c.code === 'IN') || countries[0]
    );
    const [isFocused, setIsFocused] = useState(false);

    const handlePhoneNumberChange = (text: string) => {
        // Only allow digits
        const digitsOnly = text.replace(/[^0-9]/g, '');
        setPhoneNumber(digitsOnly);
    };

    const handleNext = () => {
        console.log('Sending OTP to:', selectedCountry.dialCode, phoneNumber);
        router.push({
            pathname: '/(auth)/otp-verification',
            params: {
                phoneNumber: selectedCountry.dialCode + phoneNumber
            }
        });
    };

    const isButtonEnabled = phoneNumber.length >= 10;

    return (
        <SafeAreaView className="flex-1 bg-background-light">
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View className="flex-1 justify-between bg-background-light mt-20">
                    {/* Header (Logo) */}
                    <View className="items-start px-6 pt-15 pb-10">
                        <CronLogo />
                    </View>

                    {/* Content Area */}
                    <View className="flex-1 px-6 mt-5">
                        <Text variant="h3" className="text-foreground-dark">
                            Phone Number
                        </Text>
                        <Text variant="caption" className="text-foreground-tertiary mb-8 font-sans">
                            What is your phone number
                        </Text>

                        {/* Phone Input Field Container */}
                        <View className={`flex-row items-center h-14 rounded-xl border-2 px-2.5 ${isFocused
                            ? 'border-border-focus bg-background-light'
                            : 'border-border-light bg-gray-100'
                            }`}>
                            {/* Country Code Selector */}
                            <CountryPicker
                                selectedCountry={selectedCountry}
                                onSelectCountry={setSelectedCountry}
                            />

                            {/* Separator Line */}
                            <View className="w-px h-3/5 bg-gray-300 mx-2" />

                            {/* Phone Number Input */}
                            <Input
                                className="flex-1 h-full border-0 bg-transparent px-2 text-foreground-dark"
                                placeholder="00000 00000"
                                placeholderTextColor="#A0A0A0"
                                keyboardType="phone-pad"
                                maxLength={10}
                                value={phoneNumber}
                                onChangeText={handlePhoneNumberChange}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                            />
                        </View>
                    </View>

                    {/* Next Button Container */}
                    <View className={`px-6 pt-2.5 ${Platform.OS === 'ios' ? 'pb-7.5' : 'pb-5'}`}>
                        <Button
                            onPress={handleNext}
                            disabled={!isButtonEnabled}
                            className="shadow-lg shadow-primary/20 font-medium"
                        >
                            Next
                        </Button>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
