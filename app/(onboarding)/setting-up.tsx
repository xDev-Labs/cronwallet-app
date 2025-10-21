import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/contexts/AuthContext';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    StatusBar,
    View
} from 'react-native';

const CronLogo = () => (
    <View className="items-center justify-center">
        <Image
            source={require('@/assets/images/cron-black-logo.png')}
            className="w-[120px] h-10"
            resizeMode="contain"
        />
    </View>
);

export default function SettingUpScreen() {
    const { completeOnboarding } = useAuth();

    useEffect(() => {
        const setupAccount = async () => {
            try {
                // Simulate account setup process
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Complete onboarding
                await completeOnboarding();

                // Navigate to home
                router.replace('/(tabs)');
            } catch (err) {
                console.error('Error completing setup:', err);
                // Navigate anyway on error
                router.replace('/(tabs)');
            }
        };

        setupAccount();
    }, []);

    return (
        <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background-light">
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <View className="flex-1 justify-center items-center px-6">
                {/* Centered Logo */}
                <View className="flex-1 justify-center items-center">
                    <CronLogo />
                </View>

                {/* Bottom Loading Section */}
                <View className="pb-20 items-center">
                    <ActivityIndicator size="small" color="#4A3DFF" />
                    <Text variant="caption" className="text-foreground-tertiary mt-4 font-sans">
                        Setting up account
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}
