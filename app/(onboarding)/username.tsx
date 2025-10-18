import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/contexts/AuthContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    TouchableWithoutFeedback,
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

export default function UsernameScreen() {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const { updateUserProfile } = useAuth();

    const validateUsername = (text: string): string | null => {
        if (text.length < 3) {
            return 'Username must be at least 3 characters';
        }
        if (text.length > 20) {
            return 'Username must be less than 20 characters';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(text)) {
            return 'Username can only contain letters, numbers, and underscores';
        }
        return null;
    };

    const handleUsernameChange = (text: string) => {
        // Remove spaces and special characters except underscore
        const cleaned = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
        setUsername(cleaned);
        setError('');
    };

    const handleContinue = async () => {
        const validationError = validateUsername(username);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            await updateUserProfile({ username });
            router.push('/(onboarding)/avatar');
        } catch (err) {
            setError('Failed to save username. Please try again.');
            console.error('Error saving username:', err);
        }
    };

    const isButtonEnabled = username.length >= 3;

    return (
        <SafeAreaView className="flex-1 bg-background-light">
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View className="flex-1 justify-between bg-background-light mt-20">
                        {/* Header (Logo) */}
                        <View className="items-start px-6 pt-15 pb-10">
                            <CronLogo />
                        </View>

                        {/* Content Area */}
                        <View className="flex-1 px-6 mt-5">
                            <Text variant="h3" className="text-foreground-dark">
                                Claim your username
                            </Text>
                            <Text variant="caption" className="text-foreground-tertiary mb-8 font-sans">
                                Create a unique username for your CRON account
                            </Text>

                            {/* Username Input Field */}
                            <View className={`flex-row items-center h-14 rounded-xl border-2 px-4 ${isFocused
                                ? 'border-border-focus bg-background-light'
                                : 'border-border-light bg-gray-100'
                                }`}>
                                <Text className="text-base font-semibold text-foreground-tertiary mr-1">
                                    @
                                </Text>
                                <Input
                                    className="flex-1 h-full border-0 bg-transparent px-2 text-foreground-dark"
                                    placeholder="username"
                                    placeholderTextColor="#A0A0A0"
                                    value={username}
                                    onChangeText={handleUsernameChange}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    maxLength={20}
                                />
                            </View>

                            {error ? (
                                <Text className="text-error text-sm mt-2 font-sans">
                                    {error}
                                </Text>
                            ) : null}
                        </View>

                        {/* Continue Button Container */}
                        <View className={`px-6 pt-2.5 ${Platform.OS === 'ios' ? 'pb-7.5' : 'pb-5'}`}>
                            <Button
                                onPress={handleContinue}
                                disabled={!isButtonEnabled}
                                className="shadow-lg shadow-primary/20 font-medium"
                            >
                                Continue
                            </Button>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
