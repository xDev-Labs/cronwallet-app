import PrimaryButton from '@/components/PrimaryButton';
import { useRouter } from 'expo-router';
import { Phone } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

export default function PhoneAuthScreen() {
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validatePhoneNumber = (phone: string) => {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    };

    const formatPhoneNumber = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length <= 10) {
            setPhoneNumber(cleaned);
            setError('');
        }
    };

    const handleSendOTP = async () => {
        if (!validatePhoneNumber(phoneNumber)) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        setLoading(true);
        setError('');

        setTimeout(() => {
            setLoading(false);
            router.push({
                pathname: '/(auth)/otp-verification',
                params: { phoneNumber }
            });
        }, 1500);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Phone size={32} color="#fff" strokeWidth={2} />
                    </View>
                    <Text style={styles.title}>Enter Your Phone Number</Text>
                    <Text style={styles.subtitle}>
                        We'll send you a verification code to confirm your number
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.prefix}>+1</Text>
                        <TextInput
                            style={styles.input}
                            value={phoneNumber}
                            onChangeText={formatPhoneNumber}
                            placeholder="(555) 123-4567"
                            placeholderTextColor="#666"
                            keyboardType="phone-pad"
                            maxLength={10}
                            accessible={true}
                            accessibilityLabel="Phone number input"
                        />
                    </View>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>

                <View style={styles.buttonContainer}>
                    <PrimaryButton
                        title="Send OTP"
                        onPress={handleSendOTP}
                        disabled={phoneNumber.length !== 10}
                        loading={loading}
                    />
                </View>
            </View>
        </KeyboardAvoidingView>
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
    form: {
        marginBottom: 32,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a3e',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 2,
        borderColor: '#2a2a3e',
    },
    prefix: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 56,
        fontSize: 18,
        color: '#fff',
        fontWeight: '500',
    },
    errorText: {
        color: '#e94560',
        fontSize: 14,
        marginTop: 8,
        marginLeft: 4,
    },
    buttonContainer: {
        marginTop: 16,
    },
});
