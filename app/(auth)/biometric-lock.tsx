import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/contexts/AuthContext';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { Shield } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, AppState, Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimatedCronLogo = ({ scaleAnim, opacityAnim }: { scaleAnim: Animated.Value, opacityAnim: Animated.Value }) => (
    <View className="justify-center items-center h-full">
        <Animated.View
            style={{
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
                alignItems: "center",
            }}
        >
            <View className="justify-center items-center shadow-lg">
                <Image
                    source={require('@/assets/images/cron-black-logo.png')}
                    className="w-[150px]"
                    resizeMode="contain"
                />
            </View>
        </Animated.View>
    </View>
);

export default function BiometricLockScreen() {
    const { user, setBiometricAuthenticated, isBiometricAuthenticated } = useAuth();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [biometricType, setBiometricType] = useState<'faceId' | 'fingerprint' | 'none'>('none');
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        checkBiometricAvailability();
    }, []);

    // Logo animation effect
    useEffect(() => {
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

        Animated.timing(opacityAnim, {
            toValue: 1,
            delay: 200,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        // Auto-trigger authentication when screen mounts
        if (isAvailable && isEnrolled && !isAuthenticating && !isBiometricAuthenticated) {
            handleBiometricAuth();
        }
    }, [isAvailable, isEnrolled, isAuthenticating, isBiometricAuthenticated]);

    useEffect(() => {
        // Re-trigger authentication when app comes to foreground
        const handleAppStateChange = (nextAppState: string) => {
            if (nextAppState === 'active' && isAvailable && isEnrolled && !isAuthenticating && !isBiometricAuthenticated) {
                handleBiometricAuth();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
    }, [isAvailable, isEnrolled, isAuthenticating, isBiometricAuthenticated]);

    const checkBiometricAvailability = async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

            setIsAvailable(hasHardware);
            setIsEnrolled(isEnrolled);

            if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                setBiometricType('faceId');
            } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                setBiometricType('fingerprint');
            } else {
                setBiometricType('none');
            }
        } catch (error) {
            console.error('Error checking biometric availability:', error);
            // If biometric is not available, allow direct access
            router.replace('/(tabs)');
        }
    };

    const handleBiometricAuth = async () => {
        if (!isAvailable || !isEnrolled) {
            // If biometric is not available or not enrolled, allow direct access
            router.replace('/(tabs)');
            return;
        }

        setIsAuthenticating(true);
        setError(null);

        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Unlock your account',
                fallbackLabel: 'Use Passcode',
                cancelLabel: 'Cancel',
            });

            if (result.success) {
                // Authentication successful, set session state and navigate to main app
                setBiometricAuthenticated(true);
                router.replace('/(tabs)');
            } else {
                setError('Authentication failed. Please try again.');
            }
        } catch (error) {
            console.error('Biometric authentication error:', error);
            setError('An error occurred during authentication.');
        } finally {
            setIsAuthenticating(false);
        }
    };

    // If biometric is not available or not enrolled, show a message and allow direct access
    if (!isAvailable || !isEnrolled) {
        return (
            <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white">
                <View className="flex-1 bg-white">
                    {/* Animated Logo Header */}
                    <View className="h-1/3">
                        <AnimatedCronLogo scaleAnim={scaleAnim} opacityAnim={opacityAnim} />
                    </View>

                    {/* Content Area */}
                    <View className="flex-1 px-6 justify-center">
                        <View className="items-center mb-12">
                            <View className="w-32 h-32 rounded-full bg-gray-100 items-center justify-center mb-8">
                                <Shield size={80} color="#9CA3AF" strokeWidth={1.5} />
                            </View>

                            <Text variant="h3" className="text-foreground-dark mb-4 text-center">
                                Welcome Back
                            </Text>

                            <Text variant="caption" className="text-foreground-tertiary text-center leading-6 mb-8">
                                Biometric authentication is not available. You can access your account directly.
                            </Text>
                        </View>

                        <Button
                            onPress={() => router.replace('/(tabs)')}
                            className="shadow-lg shadow-primary/20"
                        >
                            Continue to App
                        </Button>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-primary">
            <View className="flex-1 justify-center items-center">
                <Logo size={60} color="white" />
            </View>
        </SafeAreaView>
    );
}
