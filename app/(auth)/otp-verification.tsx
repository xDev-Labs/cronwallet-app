import CodeInput from '@/components/CodeInput';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
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

export default function OTPVerificationScreen() {
    const router = useRouter();
    const { countryCode, phoneNumber } = useLocalSearchParams();
    const [otp, setOtp] = useState('');
    const [error, setError] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
        setCanResend(true);
    }, [countdown]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleResend = () => {
        if (canResend) {
            setCountdown(30);
            setCanResend(false);
            setOtp('');
            setError(false);
            console.log('Resending OTP to:', phoneNumber);
        }
    };

    const handleVerify = () => {
        if (otp.length !== 6) return;

        setError(false);

        // Simulate OTP verification (use 123456 as correct OTP)
        if (otp === '123456') {
            router.replace({
                pathname: '/(auth)/create-passcode',
                params: {
                    phoneNumber,
                    countryCode
                }
            });
        } else {
            setError(true);
        }
    };

    const isVerifyEnabled = otp.length === 6;

    return (
        <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background-light">
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
                        <View className="flex-1 px-6 justify-between">
                            <View className="mt-5">
                                {/* Header */}
                                <Text variant="h3" className="text-foreground-dark">
                                    OTP Verification
                                </Text>
                                <Text variant="caption" className="text-foreground-tertiary mb-8 font-sans">
                                    We've sent you a 6 digit code on{' '}
                                    <Text className="text-foreground-dark font-medium">{countryCode} {phoneNumber}</Text>
                                </Text>

                                {/* OTP Input */}
                                <View className="items-center mb-8">
                                    <CodeInput
                                        length={6}
                                        value={otp}
                                        onChange={setOtp}
                                        error={error}
                                    />
                                    {error && (
                                        <Text className="text-error text-sm mt-4 text-center font-sans">
                                            Invalid code. Please try again.
                                        </Text>
                                    )}
                                </View>

                                {/* Timer and Resend */}
                                <View className="flex-row items-center justify-center mt-6">
                                    <Text className="text-sm text-foreground-tertiary font-sans">
                                        {formatTime(countdown)}
                                    </Text>
                                    <Text className="text-sm text-foreground-tertiary font-sans mx-2">
                                        |
                                    </Text>
                                    <Pressable onPress={handleResend} disabled={!canResend}>
                                        <Text
                                            className={`text-sm font-semibold font-sans ${canResend ? 'text-primary' : 'text-foreground-tertiary'
                                                }`}
                                        >
                                            Resend OTP
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>

                            {/* Verify Button Container */}
                            <View className={`pt-2.5 ${Platform.OS === 'ios' ? 'pb-7.5' : 'pb-5'}`}>
                                <Button
                                    onPress={handleVerify}
                                    disabled={!isVerifyEnabled}
                                    className="shadow-lg shadow-primary/20 font-medium"
                                >
                                    Verify
                                </Button>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
