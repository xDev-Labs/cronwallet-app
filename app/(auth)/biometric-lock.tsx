import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/contexts/AuthContext';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { ScanFace, Shield, Smartphone } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { AppState, Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CronLogo = () => (
    <View className="flex-1 w-full items-center justify-center">
        <Image
            source={require('@/assets/images/cron-black-logo.png')}
            className="w-[100px] h-8"
            resizeMode="contain"
        />
    </View>
);

export default function BiometricLockScreen() {
    const { user, setBiometricAuthenticated, isBiometricAuthenticated } = useAuth();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [biometricType, setBiometricType] = useState<'faceId' | 'fingerprint' | 'none'>('none');
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);

    useEffect(() => {
        checkBiometricAvailability();
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

    const handleRetry = () => {
        setError(null);
        handleBiometricAuth();
    };

    const handleUsePhoneNumber = () => {
        // Navigate back to phone auth
        router.replace('/(auth)/phone-auth');
    };

    const getBiometricIcon = () => {
        if (biometricType === 'faceId') {
            return <ScanFace size={80} color="#4A3DFF" strokeWidth={1.5} />;
        } else if (biometricType === 'fingerprint') {
            return <Smartphone size={80} color="#4A3DFF" strokeWidth={1.5} />;
        } else {
            return <Shield size={80} color="#4A3DFF" strokeWidth={1.5} />;
        }
    };

    const getBiometricTitle = () => {
        if (biometricType === 'faceId') {
            return 'Unlock with Face ID';
        } else if (biometricType === 'fingerprint') {
            return 'Unlock with Touch ID';
        } else {
            return 'Unlock Account';
        }
    };

    const getBiometricDescription = () => {
        if (biometricType === 'faceId') {
            return 'Use Face ID to securely access your account';
        } else if (biometricType === 'fingerprint') {
            return 'Use Touch ID to securely access your account';
        } else {
            return 'Use biometric authentication to access your account';
        }
    };

    // If biometric is not available or not enrolled, show a message and allow direct access
    if (!isAvailable || !isEnrolled) {
        return (
            <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background-light">
                <View className="flex-1 justify-between bg-background-light">
                    {/* Header (Logo) */}
                    <View className="items-start px-6 pt-15 pb-10">
                        <CronLogo />
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
        <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background-light">
            <View className="flex-1 justify-between bg-background-light">
                {/* Header (Logo) */}
                <View className="items-start px-6 pt-15 pb-10">
                    <CronLogo />
                </View>

                {/* Content Area */}
                <View className="flex-1 px-6 justify-center">
                    <View className="items-center mb-12">
                        <View className="w-32 h-32 rounded-full bg-primary/10 items-center justify-center mb-8">
                            {getBiometricIcon()}
                        </View>

                        <Text variant="h3" className="text-foreground-dark mb-4 text-center">
                            Welcome Back
                        </Text>

                        <Text variant="caption" className="text-foreground-tertiary text-center leading-6 mb-8">
                            {getBiometricDescription()}
                        </Text>

                        {error && (
                            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 w-full">
                                <Text className="text-red-800 text-sm text-center">
                                    {error}
                                </Text>
                            </View>
                        )}

                        {isAuthenticating && (
                            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 w-full">
                                <Text className="text-blue-800 text-sm text-center">
                                    Authenticating...
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="space-y-4">
                        {error && (
                            <Button
                                onPress={handleRetry}
                                className="shadow-lg shadow-primary/20"
                            >
                                Try Again
                            </Button>
                        )}

                        <Button
                            onPress={handleUsePhoneNumber}
                            variant="outline"
                            className="border-gray-300"
                        >
                            Use Phone Number
                        </Button>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
