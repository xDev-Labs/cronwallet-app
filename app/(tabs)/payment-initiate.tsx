import { router, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Clock, MoveVertical as MoreVertical, ShieldCheck, X } from 'lucide-react-native';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockContacts } from '../../data/mockData';

export default function PaymentInitiateScreen() {
    const { contactId } = useLocalSearchParams();
    const contact = mockContacts.find(c => c.id === contactId);
    const [amount, setAmount] = useState('0');

    if (!contact) {
        return null;
    }

    const handleNumberPress = (num: string) => {
        if (amount === '0') {
            setAmount(num);
        } else {
            setAmount(amount + num);
        }
    };

    const handleBackspace = () => {
        if (amount.length === 1) {
            setAmount('0');
        } else {
            setAmount(amount.slice(0, -1));
        }
    };

    const handleDecimal = () => {
        if (!amount.includes('.')) {
            setAmount(amount + '.');
        }
    };

    const handleNext = () => {
        if (amount !== '0' && parseFloat(amount) > 0) {
            router.push({
                pathname: './payment-confirm' as any,
                params: { contactId, amount },
            });
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

    const numberPad = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['.', '0', 'back'],
    ];

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

            <View style={styles.keypad}>
                {numberPad.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.keypadRow}>
                        {row.map((key) => (
                            <TouchableOpacity
                                key={key}
                                style={styles.keypadButton}
                                onPress={() => {
                                    if (key === 'back') {
                                        handleBackspace();
                                    } else if (key === '.') {
                                        handleDecimal();
                                    } else {
                                        handleNumberPress(key);
                                    }
                                }}
                            >
                                {key === 'back' ? (
                                    <Text style={styles.keypadBackspace}>⌫</Text>
                                ) : (
                                    <>
                                        <Text style={styles.keypadNumber}>{key}</Text>
                                        {key !== '.' && (
                                            <Text style={styles.keypadLetters}>
                                                {
                                                    {
                                                        '2': 'ABC',
                                                        '3': 'DEF',
                                                        '4': 'GHI',
                                                        '5': 'JKL',
                                                        '6': 'MNO',
                                                        '7': 'PQRS',
                                                        '8': 'TUV',
                                                        '9': 'WXYZ',
                                                    }[key]
                                                }
                                            </Text>
                                        )}
                                    </>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>

            <TouchableOpacity
                style={[
                    styles.nextButton,
                    (amount === '0' || parseFloat(amount) === 0) && styles.nextButtonDisabled,
                ]}
                onPress={handleNext}
                disabled={amount === '0' || parseFloat(amount) === 0}
            >
                <ArrowRight size={28} color="#000" strokeWidth={2.5} pointerEvents="none" />
            </TouchableOpacity>
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
    keypad: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    keypadRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    keypadButton: {
        width: '31%',
        aspectRatio: 2.4,
        backgroundColor: '#3C3C3E',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    keypadNumber: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '400',
    },
    keypadLetters: {
        color: '#8E8E93',
        fontSize: 11,
        marginTop: 2,
    },
    keypadBackspace: {
        color: '#fff',
        fontSize: 28,
    },
    nextButton: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#A8D5FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextButtonDisabled: {
        opacity: 0.4,
    },
});
