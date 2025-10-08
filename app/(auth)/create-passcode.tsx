import CodeInput from '@/components/CodeInput';
import { useRouter } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function CreatePasscodeScreen() {
    const router = useRouter();
    const [error, setError] = useState(false);

    const handlePasscodeComplete = (passcode: string) => {
        setError(false);
        router.push({
            pathname: '/(auth)/confirm-passcode',
            params: { passcode }
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Lock size={32} color="#fff" strokeWidth={2} />
                    </View>
                    <Text style={styles.title}>Create Your Passcode</Text>
                    <Text style={styles.subtitle}>
                        Enter a 4-digit passcode to secure your account
                    </Text>
                </View>

                <View style={styles.codeContainer}>
                    <CodeInput length={4} onComplete={handlePasscodeComplete} error={error} />
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        Your passcode will be used to access your account securely
                    </Text>
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
    infoBox: {
        backgroundColor: '#2a2a3e',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#0f3460',
    },
    infoText: {
        fontSize: 14,
        color: '#a0a0a0',
        lineHeight: 20,
    },
});
