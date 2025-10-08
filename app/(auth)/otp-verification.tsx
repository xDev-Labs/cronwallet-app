import CodeInput from '@/components/CodeInput';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, ShieldCheck } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Animated, Keyboard, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

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
            <View style={styles.container}>
                <Animated.View style={[
                    styles.successContainer,
                    { transform: [{ scale: scaleAnim }] },
                ]}>
                    <Animated.View style={{ transform: [{ scale: checkScaleAnim }] }}>
                        <CheckCircle size={80} color="#4ecca3" strokeWidth={2} />
                    </Animated.View>
                    <Text style={styles.successText}>Verified!</Text>
                </Animated.View>
            </View>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <ShieldCheck size={32} color="#fff" strokeWidth={2} />
                        </View>
                        <Text style={styles.title}>Enter Verification Code</Text>
                        <Text style={styles.subtitle}>
                            We've sent a 4-digit code to{'\n'}
                            <Text style={styles.phoneText}>+1 {phoneNumber}</Text>
                        </Text>
                    </View>

                    <View style={styles.codeContainer}>
                        <CodeInput length={4} onComplete={handleOTPComplete} error={error} />
                        {error && (
                            <Text style={styles.errorText}>
                                Invalid code. Please try again. (Hint: use 1234)
                            </Text>
                        )}
                    </View>

                    <Text style={styles.resendText}>
                        Didn't receive the code?{' '}
                        <Text style={styles.resendLink}>Resend</Text>
                    </Text>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#0f3460',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#a0a0a0',
        textAlign: 'center',
        lineHeight: 24,
    },
    phoneText: {
        color: '#0f3460',
        fontWeight: '600',
    },
    codeContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    errorText: {
        color: '#e94560',
        fontSize: 14,
        marginTop: 16,
        textAlign: 'center',
    },
    resendText: {
        fontSize: 14,
        color: '#a0a0a0',
        textAlign: 'center',
    },
    resendLink: {
        color: '#0f3460',
        fontWeight: '600',
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    successText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#4ecca3',
        marginTop: 24,
    },
});
