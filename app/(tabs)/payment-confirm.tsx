import { router, useLocalSearchParams } from 'expo-router';
import { ChevronDown, Clock, MoveVertical as MoreVertical, ShieldCheck, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { mockContacts, mockUserAccount } from '../../data/mockData';

export default function PaymentConfirmScreen() {
    const { contactId, amount } = useLocalSearchParams();
    const contact = mockContacts.find(c => c.id === contactId);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!contact) {
        return null;
    }

    const handlePayment = async () => {
        try {
            // Check if biometric authentication is available
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            const authTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

            if (!hasHardware) {
                Alert.alert('Error', 'Biometric authentication is not available on this device.');
                return;
            }

            if (!isEnrolled) {
                Alert.alert('Error', 'No biometric authentication is enrolled on this device. Please set up Face ID or Touch ID in Settings.');
                return;
            }

            // Determine authentication method
            const hasFaceID = authTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
            const hasTouchID = authTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);

            const promptMessage = hasFaceID
                ? 'Scan your face to confirm payment'
                : hasTouchID
                ? 'Scan your fingerprint to confirm payment'
                : 'Authenticate to confirm payment';

            // Authenticate with Face ID
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage,
                fallbackLabel: 'Use Passcode',
                cancelLabel: 'Cancel',
                disableDeviceFallback: false,
            });

            if (!result.success) {
                Alert.alert('Authentication Failed', 'Payment cancelled. Please try again.');
                return;
            }

            // Proceed with payment after successful authentication
            setIsProcessing(true);
            setTimeout(() => {
                setIsProcessing(false);
                router.push({
                    pathname: './payment-success' as any,
                    params: { contactId, amount },
                });
            }, 2000);
        } catch (error) {
            Alert.alert('Error', 'An error occurred during authentication. Please try again.');
            console.error('Biometric authentication error:', error);
        }
    };

    const renderAvatar = () => {
        if (contact.avatarUrl) {
            return (
                <Image
                    source={{ uri: contact.avatarUrl }}
                    style={styles.avatar}
                />
            );
        }

        const initial = contact.name.charAt(0).toUpperCase();
        return (
            <View style={[styles.avatarPlaceholder, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <X size={28} color="#fff" pointerEvents="none" />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Clock size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <MoreVertical size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.recipientInfo}>
                    {renderAvatar()}
                    <Text style={styles.payingText}>Paying {contact.bankingName}</Text>
                    <View style={styles.verifiedBadge}>
                        <ShieldCheck size={16} color="#4CAF50" fill="#4CAF50" />
                        <Text style={styles.bankingName}>Banking name: {contact.bankingName}</Text>
                    </View>
                    <Text style={styles.phoneNumber}>{contact.phone}</Text>
                </View>

                <View style={styles.amountSection}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <Text style={styles.amountDisplay}>{amount}</Text>
                </View>

                <TouchableOpacity style={styles.addNoteButton}>
                    <Text style={styles.addNoteText}>Add note</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <View style={styles.accountSection}>
                    <Text style={styles.accountLabel}>Choose account to pay with</Text>
                    <TouchableOpacity style={styles.accountCard}>
                        <Image
                            source={{ uri: 'https://images.pexels.com/photos/164501/pexels-photo-164501.jpeg?auto=compress&cs=tinysrgb&w=100' }}
                            style={styles.bankIcon}
                        />
                        <View style={styles.accountInfo}>
                            <Text style={styles.bankName}>{mockUserAccount.bankName} ····{mockUserAccount.accountNumber}</Text>
                            <Text style={styles.accountBalance}>Balance: Check now</Text>
                        </View>
                        <ChevronDown size={24} color="#8E8E93" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.payButton}
                    onPress={handlePayment}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.payButtonText}>Pay ₹{amount}</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.poweredBy}>
                    <Image
                        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/200px-UPI-Logo-vector.svg.png' }}
                        style={styles.upiLogo}
                        resizeMode="contain"
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    closeButton: {
        padding: 8,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 40,
    },
    recipientInfo: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 16,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarInitial: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '700',
    },
    payingText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    bankingName: {
        color: '#8E8E93',
        fontSize: 14,
    },
    phoneNumber: {
        color: '#8E8E93',
        fontSize: 14,
    },
    amountSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    currencySymbol: {
        color: '#fff',
        fontSize: 64,
        fontWeight: '300',
    },
    amountDisplay: {
        color: '#fff',
        fontSize: 64,
        fontWeight: '300',
        marginLeft: 8,
    },
    addNoteButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
    },
    addNoteText: {
        color: '#8E8E93',
        fontSize: 16,
    },
    footer: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    accountSection: {
        marginBottom: 16,
    },
    accountLabel: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 12,
    },
    accountCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1C1C1E',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    bankIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
    },
    accountInfo: {
        flex: 1,
    },
    bankName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    accountBalance: {
        color: '#2196F3',
        fontSize: 14,
    },
    payButton: {
        backgroundColor: '#A8D5FF',
        paddingVertical: 16,
        borderRadius: 28,
        alignItems: 'center',
        marginBottom: 16,
        minHeight: 56,
        justifyContent: 'center',
    },
    payButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '600',
    },
    poweredBy: {
        alignItems: 'center',
    },
    upiLogo: {
        width: 100,
        height: 30,
        tintColor: '#8E8E93',
    },
});
