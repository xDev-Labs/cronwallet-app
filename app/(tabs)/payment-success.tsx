import { router, useLocalSearchParams } from 'expo-router';
import { CircleCheck as CheckCircle, Share2, ShieldCheck } from 'lucide-react-native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockContacts } from '../../data/mockData';

export default function PaymentSuccessScreen() {
    const { contactId, amount } = useLocalSearchParams();
    const contact = mockContacts.find(c => c.id === contactId);

    if (!contact) {
        return null;
    }

    const handleDone = () => {
        router.push({
            pathname: './recipient' as any,
            params: { contactId },
        });
    };

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString('en-US', { month: 'long' })} ${currentDate.getFullYear()}, ${currentDate.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.successSection}>
                    <View style={styles.checkmarkContainer}>
                        <CheckCircle size={80} color="#2196F3" fill="#2196F3" strokeWidth={0} />
                    </View>

                    <Text style={styles.amountText}>₹{amount}.00</Text>

                    <Text style={styles.paidToLabel}>Paid to</Text>
                    <Text style={styles.recipientName}>{contact.name.split(' ')[0]}</Text>

                    <View style={styles.verifiedBadge}>
                        <ShieldCheck size={16} color="#4CAF50" fill="#4CAF50" />
                        <Text style={styles.bankingName}>Banking name: {contact.bankingName}</Text>
                    </View>

                    <Text style={styles.timestamp}>{formattedDate}</Text>
                </View>

                <View style={styles.rewardsCard}>
                    <View style={styles.rewardsContent}>
                        <Text style={styles.rewardsTitle}>You have unopened</Text>
                        <Text style={styles.rewardsTitle}>rewards</Text>
                        <TouchableOpacity style={styles.openNowButton}>
                            <Text style={styles.openNowText}>Open now</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.rewardsIllustration}>
                        <View style={styles.giftBox}>
                            <Text style={styles.giftEmoji}>🎁</Text>
                        </View>
                        <View style={styles.confettiRed} />
                        <View style={styles.confettiBlue} />
                        <View style={styles.confettiGreen} />
                        <View style={styles.confettiYellow} />
                    </View>
                </View>

                <View style={styles.poweredBy}>
                    <Text style={styles.poweredByText}>POWERED BY</Text>
                    <Image
                        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/200px-UPI-Logo-vector.svg.png' }}
                        style={styles.upiLogo}
                        resizeMode="contain"
                    />
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.shareButton}>
                    <Share2 size={20} color="#fff" />
                    <Text style={styles.shareButtonText}>Share screenshot</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                    <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 60,
    },
    successSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    checkmarkContainer: {
        marginBottom: 32,
    },
    amountText: {
        color: '#fff',
        fontSize: 48,
        fontWeight: '400',
        marginBottom: 24,
    },
    paidToLabel: {
        color: '#8E8E93',
        fontSize: 16,
        marginBottom: 8,
    },
    recipientName: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 12,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    bankingName: {
        color: '#8E8E93',
        fontSize: 14,
    },
    timestamp: {
        color: '#8E8E93',
        fontSize: 14,
    },
    rewardsCard: {
        backgroundColor: '#1C1C1E',
        borderRadius: 16,
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    rewardsContent: {
        flex: 1,
    },
    rewardsTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '500',
        lineHeight: 24,
    },
    openNowButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginTop: 12,
    },
    openNowText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    rewardsIllustration: {
        position: 'relative',
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    giftBox: {
        width: 70,
        height: 70,
        backgroundColor: '#2196F3',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ rotate: '-10deg' }],
    },
    giftEmoji: {
        fontSize: 36,
    },
    confettiRed: {
        position: 'absolute',
        width: 8,
        height: 8,
        backgroundColor: '#FF5252',
        borderRadius: 4,
        top: 10,
        right: 20,
    },
    confettiBlue: {
        position: 'absolute',
        width: 6,
        height: 6,
        backgroundColor: '#2196F3',
        borderRadius: 3,
        bottom: 20,
        left: 10,
    },
    confettiGreen: {
        position: 'absolute',
        width: 7,
        height: 7,
        backgroundColor: '#4CAF50',
        borderRadius: 3.5,
        top: 15,
        left: 15,
    },
    confettiYellow: {
        position: 'absolute',
        width: 8,
        height: 8,
        backgroundColor: '#FFC107',
        borderRadius: 4,
        bottom: 15,
        right: 15,
    },
    poweredBy: {
        alignItems: 'center',
        gap: 8,
    },
    poweredByText: {
        color: '#8E8E93',
        fontSize: 11,
        letterSpacing: 1,
    },
    upiLogo: {
        width: 100,
        height: 30,
        tintColor: '#8E8E93',
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        backgroundColor: '#000',
        borderTopWidth: 1,
        borderTopColor: '#1C1C1E',
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1C1C1E',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 24,
        gap: 8,
        flex: 1,
    },
    shareButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    doneButton: {
        backgroundColor: '#A8D5FF',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    doneButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
});
