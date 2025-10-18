import { router, useLocalSearchParams } from 'expo-router';
import { CircleCheck as CheckCircle, ChevronLeft, ChevronRight, MoveVertical as MoreVertical, Phone, Send } from 'lucide-react-native';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
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
                    className="w-12 h-12 rounded-full"
                />
            );
        }

        const initial = contact.name.charAt(0).toUpperCase();
        return (
            <View className="w-12 h-12 rounded-full justify-center items-center bg-[#4CAF50]">
                <Text className="text-foreground text-xl font-bold">{initial}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-row items-center px-4 py-3 justify-between">
                <TouchableOpacity
                    className="p-2"
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <ChevronLeft size={28} color="#fff" pointerEvents="none" />
                </TouchableOpacity>

                <View className="flex-row items-center flex-1 ml-3">
                    {renderAvatar()}
                    <View className="ml-3 flex-1">
                        <Text className="text-foreground text-lg font-semibold">{contact.name}</Text>
                        <Text className="text-foreground-secondary text-sm mt-0.5">{contact.phone}</Text>
                    </View>
                </View>

                <View className="flex-row gap-2">
                    <TouchableOpacity className="p-1">
                        <Phone size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-1">
                        <MoreVertical size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity className="flex-row items-center bg-[#1C1C1E] mx-4 py-3 px-4 rounded-xl gap-2">
                <CheckCircle size={20} color="#4CAF50" fill="#4CAF50" />
                <Text className="text-foreground text-base flex-1">Paid · 8 Sept</Text>
                <ChevronRight size={20} color="#8E8E93" />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 mt-6">
                {transactions.map((transaction, index) => (
                    <View key={transaction.id}>
                        <Text className="text-foreground-secondary text-sm text-center mb-4">{formatDate(transaction.createdAt)}</Text>
                        <TouchableOpacity className="bg-[#2C2C2E] mx-4 mb-6 rounded-2xl p-5">
                            <View className="gap-3">
                                <Text className="text-foreground text-base">
                                    {transaction.type === 'received' ? 'Payment to you' : `Payment to ${contact.name}`}
                                </Text>
                                <Text className="text-foreground text-[40px] font-semibold">
                                    {formatAmount(transaction.amount)}
                                </Text>
                                <View className="flex-row items-center gap-2">
                                    <CheckCircle size={16} color="#4CAF50" fill="#4CAF50" />
                                    <Text className="text-foreground text-sm flex-1">
                                        Paid · {transaction.createdAt.getDate()} {transaction.createdAt.toLocaleString('en-US', { month: 'short' })}
                                    </Text>
                                    <ChevronRight size={16} color="#8E8E93" />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            <View className="flex-row justify-center p-4 gap-3 bg-background border-t border-[#1C1C1E]">
                <TouchableOpacity className="flex-row items-center justify-center bg-[#A8D5FF] py-3.5 px-8 rounded-3xl gap-2" onPress={handlePayPress}>
                    <Send size={20} color="#000" pointerEvents="none" />
                    <Text className="text-background text-base font-semibold">Pay</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
