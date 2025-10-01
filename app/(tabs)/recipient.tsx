import { router, useLocalSearchParams } from 'expo-router';
import { CircleCheck as CheckCircle, ChevronLeft, ChevronRight, MoveVertical as MoreVertical, Phone, Send } from 'lucide-react-native';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockContacts, mockTransactions } from '../../data/mockData';

export default function RecipientScreen() {
    const { contactId } = useLocalSearchParams();
    const contact = mockContacts.find(c => c.id === contactId);
    const transactions = mockTransactions.filter(t => t.contactId === contactId);

    if (!contact) {
        return null;
    }

    const handlePayPress = () => {
        router.push({
            pathname: './payment-initiate' as any,
            params: { contactId },
        });
    };

    const formatDate = (date: Date) => {
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'short' });
        const time = date.toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        return `${day} ${month}, ${time}`;
    };

    const formatAmount = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN')}`;
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
                    style={styles.backButton}
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <ChevronLeft size={28} color="#fff" pointerEvents="none" />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    {renderAvatar()}
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerName}>{contact.name}</Text>
                        <Text style={styles.headerPhone}>{contact.phone}</Text>
                    </View>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Phone size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <MoreVertical size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={styles.statusBadge}>
                <CheckCircle size={20} color="#4CAF50" fill="#4CAF50" />
                <Text style={styles.statusText}>Paid · 8 Sept</Text>
                <ChevronRight size={20} color="#8E8E93" />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                {transactions.map((transaction, index) => (
                    <View key={transaction.id}>
                        <Text style={styles.dateHeader}>{formatDate(transaction.createdAt)}</Text>
                        <TouchableOpacity style={styles.transactionCard}>
                            <View style={styles.transactionContent}>
                                <Text style={styles.transactionLabel}>
                                    {transaction.type === 'received' ? 'Payment to you' : `Payment to ${contact.name}`}
                                </Text>
                                <Text style={styles.transactionAmount}>
                                    {formatAmount(transaction.amount)}
                                </Text>
                                <View style={styles.transactionFooter}>
                                    <CheckCircle size={16} color="#4CAF50" fill="#4CAF50" />
                                    <Text style={styles.transactionStatus}>
                                        Paid · {transaction.createdAt.getDate()} {transaction.createdAt.toLocaleString('en-US', { month: 'short' })}
                                    </Text>
                                    <ChevronRight size={16} color="#8E8E93" />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.payButton} onPress={handlePayPress}>
                    <Send size={20} color="#000" pointerEvents="none" />
                    <Text style={styles.payButtonText}>Pay</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.messageButton}>
                    <Text style={styles.messageButtonText}>Message...</Text>
                    <Send size={20} color="#8E8E93" pointerEvents="none" />
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 8,
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    headerInfo: {
        marginLeft: 12,
        flex: 1,
    },
    headerName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    headerPhone: {
        color: '#8E8E93',
        fontSize: 14,
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        padding: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1C1C1E',
        marginHorizontal: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 8,
    },
    statusText: {
        color: '#fff',
        fontSize: 16,
        flex: 1,
    },
    content: {
        flex: 1,
        marginTop: 24,
    },
    dateHeader: {
        color: '#8E8E93',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    transactionCard: {
        backgroundColor: '#2C2C2E',
        marginHorizontal: 16,
        marginBottom: 24,
        borderRadius: 16,
        padding: 20,
    },
    transactionContent: {
        gap: 12,
    },
    transactionLabel: {
        color: '#fff',
        fontSize: 16,
    },
    transactionAmount: {
        color: '#fff',
        fontSize: 40,
        fontWeight: '600',
    },
    transactionFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    transactionStatus: {
        color: '#fff',
        fontSize: 14,
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        backgroundColor: '#000',
        borderTopWidth: 1,
        borderTopColor: '#1C1C1E',
    },
    payButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#A8D5FF',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 24,
        gap: 8,
    },
    payButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    messageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        backgroundColor: '#1C1C1E',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 24,
        gap: 8,
    },
    messageButtonText: {
        color: '#8E8E93',
        fontSize: 16,
        flex: 1,
    },
});
