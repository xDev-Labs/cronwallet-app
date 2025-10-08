import CodeInput from '@/components/CodeInput';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, Lock } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export default function ConfirmPasscodeScreen() {
    const router = useRouter();
    const { passcode } = useLocalSearchParams();
    const [error, setError] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const scaleAnim = useRef(new Animated.Value(0)).current;
    const checkScaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const handlePasscodeComplete = (confirmPasscode: string) => {
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

            setTimeout(() => {
                router.replace('/(tabs)');
            }, 2000);
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
                        <CheckCircle2 size={100} color="#4ecca3" strokeWidth={2} />
                    </Animated.View>
                    <Animated.Text style={[styles.successTitle, { opacity: opacityAnim }]}>
                        All Set!
                    </Animated.Text>
                    <Animated.Text style={[styles.successSubtitle, { opacity: opacityAnim }]}>
                        Your account is now secure
                    </Animated.Text>
                </Animated.View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Lock size={32} color="#fff" strokeWidth={2} />
                    </View>
                    <Text style={styles.title}>Confirm Your Passcode</Text>
                    <Text style={styles.subtitle}>
                        Re-enter your passcode to confirm
                    </Text>
                </View>

                <View style={styles.codeContainer}>
                    <CodeInput length={4} onComplete={handlePasscodeComplete} error={error} />
                    {error && (
                        <Text style={styles.errorText}>
                            Passcodes don't match. Please try again.
                        </Text>
                    )}
                </View>
            </View>
        </View>
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
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    successTitle: {
        fontSize: 36,
        fontWeight: '700',
        color: '#4ecca3',
        marginTop: 32,
    },
    successSubtitle: {
        fontSize: 16,
        color: '#a0a0a0',
        marginTop: 12,
    },
});
