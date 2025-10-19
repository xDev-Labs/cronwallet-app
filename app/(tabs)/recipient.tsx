import { Checks } from '@/components/icons/Checks';
import { DotsVertical } from '@/components/icons/DotsVertical';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
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
            pathname: '/(tabs)/payment-initiate' as any,
            params: { contactId },
        });
    };

    const formatDate = (date: Date) => {
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
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
                <Text className="text-white text-xl font-bold">{initial}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-white font-sans">
            <View className="flex-row items-center px-4 py-3 justify-between">
                <TouchableOpacity
                    className="p-2"
                    onPress={() => router.push('/(tabs)/pay-anyone')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <ChevronLeft size={28} color="#000" pointerEvents="none" />
                </TouchableOpacity>

                <View className="flex-row items-center flex-1 ml-3">
                    {renderAvatar()}
                    <View className="ml-3 flex-1">
                        <Text className="text-black text-lg font-semibold">{contact.name}</Text>
                        <Text className="text-foreground-secondary text-sm mt-0.5">{contact.phone}</Text>
                    </View>
                </View>

                <View className="flex-row gap-2">
                    <TouchableOpacity className="p-1">
                        <DotsVertical size={24} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Centered Profile Section */}
            <View className="items-center px-4 py-6">
                {renderAvatar()}
                <Text className="text-black text-2xl font-semibold mt-4">{contact.name}</Text>

                {contact.cronId && (
                    <View className="flex-row items-center mt-2 ">
                        <Text className="text-black text-base font-sans">CRON ID : {contact.cronId}</Text>
                    </View>
                )}

                <Text className="text-black text-base mt-2 font-sans">{contact.phone}</Text>

                {contact.joinedDate && (
                    <Text className="text-foreground-secondary text-sm mt-1 font-sans">Joined {contact.joinedDate}</Text>
                )}
            </View>


            <ScrollView showsVerticalScrollIndicator={false} className="mt-6 px-4">
                {transactions.map((transaction) => (
                    <View key={transaction.id}>
                        <View className='flex justify-center items-center my-8'>
                            <View className="w-full h-[1px] bg-gray-200 rounded-full" />
                            <View className=" absolute -top-2.5 bg-white border border-gray-200 rounded-full px-3 py-0.5">
                                <Text className="text-foreground-secondary text-sm font-sans">{formatDate(transaction.createdAt)}</Text>
                            </View>
                        </View>
                        <View className={` flex-row ${transaction.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                            <TouchableOpacity
                                className={`rounded-2xl w-3/5 overflow-hidden  ${transaction.type === 'sent'
                                    ? 'bg-[#4A3DFF0F]'
                                    : 'bg-white border border-gray-200'
                                    }`}
                            >
                                <View className=" border-b-[3px] border-[#12062B]">
                                    <View className=" border-b-[3px] border-[#4A3DFF] p-5">
                                        <View className="flex-row items-end gap-2">
                                            <Text className="text-3xl font-bold text-black">
                                                100
                                            </Text>
                                            <Text className="text-xl pb-0.5 text-black">
                                                USDT
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center gap-2">
                                            <Checks size={16} color="#00CD63" />
                                            <Text className="text-sm flex-1 text-black">
                                                {transaction.type === 'received' ? 'Received' : 'Paid'}
                                            </Text>
                                        </View>
                                        {transaction.type === 'sent' && (
                                            <View className="self-start bg-white border border-primary px-3 py-1 rounded-full mt-3">
                                                <Text className="text-primary text-xs">Pay Again</Text>
                                            </View>
                                        )}
                                        <Text className="text-sm text-right text-foreground-secondary">
                                            10:00 AM
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
                }
            </ScrollView >

            <View
                className="flex-row justify-center p-4 gap-3 bg-white"
                style={{
                    shadowColor: '#4A3DFF',
                    shadowOffset: { width: 0, height: -1 },
                    shadowRadius: 13.5,
                    shadowOpacity: 0.078,
                    elevation: 8
                }}
            >
                <Button className='w-full' onPress={handlePayPress}>Pay</Button>
            </View>
        </SafeAreaView >
    );
}
