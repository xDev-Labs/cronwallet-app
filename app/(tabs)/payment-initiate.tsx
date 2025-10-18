import { router, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Clock, MoveVertical as MoreVertical, ShieldCheck, X } from 'lucide-react-native';
import { useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
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
                    className="w-20 h-20 rounded-full mb-4"
                />
            );
        }

        const initial = contact.name.charAt(0).toUpperCase();
        return (
            <View className="w-20 h-20 rounded-full justify-center items-center mb-4 bg-[#4CAF50]">
                <Text className="text-foreground text-[32px] font-bold">{initial}</Text>
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
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-row items-center justify-between px-4 py-3">
                <TouchableOpacity
                    className="p-2"
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <X size={28} color="#fff" pointerEvents="none" />
                </TouchableOpacity>
                <View className="flex-row gap-2">
                    <TouchableOpacity className="p-1">
                        <Clock size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-1">
                        <MoreVertical size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-1 items-center pt-10">
                <View className="items-center mb-10">
                    {renderAvatar()}
                    <Text className="text-foreground text-xl font-semibold mb-2">Paying {contact.bankingName}</Text>
                    <View className="flex-row items-center gap-1.5 mb-1">
                        <ShieldCheck size={16} color="#4CAF50" fill="#4CAF50" />
                        <Text className="text-foreground-secondary text-sm">Banking name: {contact.bankingName}</Text>
                    </View>
                    <Text className="text-foreground-secondary text-sm">{contact.phone}</Text>
                </View>

                <View className="flex-row items-center justify-center mb-6">
                    <Text className="text-foreground text-[64px] font-light">₹</Text>
                    <Text className="text-foreground text-[64px] font-light ml-2">{amount}</Text>
                </View>

                <TouchableOpacity className="py-2 px-5">
                    <Text className="text-foreground-secondary text-base">Add note</Text>
                </TouchableOpacity>
            </View>

            <View className="items-end justify-center mb-6 mx-4">
                <TouchableOpacity
                    className={`w-16 h-16 rounded-full bg-[#A8D5FF] justify-center items-center ${(amount === '0' || parseFloat(amount) === 0) && 'opacity-40'}`}
                    onPress={handleNext}
                    disabled={amount === '0' || parseFloat(amount) === 0}
                >
                    <ArrowRight size={28} color="#000" strokeWidth={2.5} pointerEvents="none" />
                </TouchableOpacity>
            </View>

            <View className="px-4 pb-4">
                {numberPad.map((row, rowIndex) => (
                    <View key={rowIndex} className="flex-row justify-between mb-2">
                        {row.map((key) => (
                            <TouchableOpacity
                                key={key}
                                className="w-[31%] aspect-[2.4] bg-[#3C3C3E] rounded-lg justify-center items-center"
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
                                    <Text className="text-foreground text-[28px]">⌫</Text>
                                ) : (
                                    <>
                                        <Text className="text-foreground text-[28px] font-normal">{key}</Text>
                                        {key !== '.' && (
                                            <Text className="text-foreground-secondary text-[11px] mt-0.5">
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


        </SafeAreaView>
    );
}
