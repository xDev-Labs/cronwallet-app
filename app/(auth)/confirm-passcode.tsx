import CodeInput from '@/components/CodeInput';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/contexts/AuthContext';
import type { User } from '@/lib/types/user.types';
import { secureStorage } from '@/lib/storage/storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, Lock } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Animated, Keyboard, TouchableWithoutFeedback, View } from 'react-native';

export default function ConfirmPasscodeScreen() {
    const router = useRouter();
    const { passcode, phoneNumber, countryCode } = useLocalSearchParams();
    const { saveUser } = useAuth();
    const [error, setError] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const scaleAnim = useRef(new Animated.Value(0)).current;
    const checkScaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const handlePasscodeComplete = async (confirmPasscode: string) => {
        if (confirmPasscode === passcode) {
            setError(false);
            setShowSuccess(true);

            Animated.sequence([
                Animated.spring(scaleAnim, {
                    toValue: 1.2,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                }),
            ]).start();

            Animated.spring(checkScaleAnim, {
                toValue: 1,
                delay: 200,
                useNativeDriver: true,
            }).start();

            Animated.timing(opacityAnim, {
                toValue: 1,
                delay: 400,
                duration: 500,
                useNativeDriver: true,
            }).start();

            // Save passcode to secure storage
            try {
                await secureStorage.savePasscode(passcode as string);

                // Create user profile
                const newUser: User = {
                    id: Date.now().toString(),
                    phoneNumber: (phoneNumber as string) || '',
                    countryCode: (countryCode as string) || '',
                    hasCompletedOnboarding: false,
                    createdAt: new Date().toISOString(),
                };

                await saveUser(newUser);

                setTimeout(() => {
                    router.replace('/(onboarding)/username');
                }, 2000);
            } catch (err) {
                console.error('Error saving user data:', err);
                setError(true);
            }
        } else {
            setError(true);
        }
    };

    if (showSuccess) {
        return (
            <View className="flex-1 bg-background-secondary">
                <Animated.View
                    className="flex-1 justify-center items-center"
                    style={{ transform: [{ scale: scaleAnim }] }}
                >
                    <Animated.View style={{ transform: [{ scale: checkScaleAnim }] }}>
                        <CheckCircle2 size={100} color="#4ecca3" strokeWidth={2} />
                    </Animated.View>
                    <Animated.Text
                        className="text-4xl font-bold text-green-500 mt-8"
                        style={{ opacity: opacityAnim }}
                    >
                        All Set!
                    </Animated.Text>
                    <Animated.Text
                        className="text-base text-foreground-secondary mt-3"
                        style={{ opacity: opacityAnim }}
                    >
                        Your account is now secure
                    </Animated.Text>
                </Animated.View>
            </View>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 bg-background-secondary">
                <View className="flex-1 px-6 justify-center">
                    <View className="items-center mb-12">
                        <View className="w-20 h-20 rounded-xl bg-secondary items-center justify-center mb-6">
                            <Lock size={32} color="#fff" strokeWidth={2} />
                        </View>
                        <Text variant="h3" className="text-foreground mb-3 text-center">
                            Confirm Your Passcode
                        </Text>
                        <Text variant="caption" className="text-foreground-secondary text-center leading-6">
                            Re-enter your passcode to confirm
                        </Text>
                    </View>

                    <View className="items-center mb-8">
                        <CodeInput length={4} onComplete={handlePasscodeComplete} error={error} />
                        {error && (
                            <Text className="text-error text-sm mt-4 text-center">
                                Passcodes don't match. Please try again.
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}
