import CodeInput from '@/components/CodeInput';
import { Text } from '@/components/ui/text';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, ShieldCheck } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Animated, Keyboard, TouchableWithoutFeedback, View } from 'react-native';

export default function OTPVerificationScreen() {
    const router = useRouter();
    const { phoneNumber } = useLocalSearchParams();
    const [error, setError] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const checkScaleAnim = useRef(new Animated.Value(0)).current;

    const handleOTPComplete = (otp: string) => {
        setError(false);

        if (otp === '1234') {
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
                useNativeDriver: true,
            }).start();

            setTimeout(() => {
                router.replace('/(auth)/create-passcode');
            }, 1500);
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
                        <CheckCircle size={80} color="#4ecca3" strokeWidth={2} />
                    </Animated.View>
                    <Text className="text-[32px] font-bold text-green-500 mt-6">
                        Verified!
                    </Text>
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
                            <ShieldCheck size={32} color="#fff" strokeWidth={2} />
                        </View>
                        <Text variant="h3" className="text-foreground mb-3 text-center">
                            Enter Verification Code
                        </Text>
                        <Text variant="caption" className="text-foreground-secondary text-center leading-6">
                            We've sent a 4-digit code to{'\n'}
                            <Text className="text-secondary font-semibold">+1 {phoneNumber}</Text>
                        </Text>
                    </View>

                    <View className="items-center mb-8">
                        <CodeInput length={4} onComplete={handleOTPComplete} error={error} />
                        {error && (
                            <Text className="text-error text-sm mt-4 text-center">
                                Invalid code. Please try again. (Hint: use 1234)
                            </Text>
                        )}
                    </View>

                    <Text className="text-sm text-foreground-secondary text-center">
                        Didn't receive the code?{' '}
                        <Text className="text-secondary font-semibold">Resend</Text>
                    </Text>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}
