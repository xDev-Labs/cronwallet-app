import { Text } from '@/components/ui/text';
import { Contact } from '@/lib/types';
import { router, Stack } from 'expo-router';
import { ChevronLeft, User } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockContacts } from '../../data/mockData';

export default function PayAnyoneScreen() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredContacts = useMemo(() => {
        if (!searchQuery.trim()) {
            return mockContacts;
        }

        const query = searchQuery.toLowerCase();
        return mockContacts.filter(contact =>
            contact.name.toLowerCase().includes(query) ||
            contact.phone.toLowerCase().includes(query) ||
            contact.bankingName.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const handleContactPress = (contact: Contact) => {
        router.push({
            pathname: './recipient' as any,
            params: { contactId: contact.id },
        });
    };

    const renderAvatar = (contact: Contact) => {
        if (contact.avatarUrl) {
            return (
                <Image
                    source={{ uri: contact.avatarUrl }}
                    className="w-12 h-12 rounded-full"
                />
            );
        }

        const initial = contact.name.charAt(0).toUpperCase();
        const colors = ['#E91E63', '#9C27B0', '#FF5722', '#2196F3', '#4CAF50'];
        const colorIndex = contact.name.charCodeAt(0) % colors.length;

        return (
            <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: colors[colorIndex] }}
            >
                <Text className="text-white text-xl font-bold">{initial}</Text>
            </View>
        );
    };

    const renderContact = ({ item }: { item: Contact }) => (
        <Pressable
            onPress={() => handleContactPress(item)}
            className="flex-row items-center white rounded-xl py-2 active:opacity-80"
        >
            {renderAvatar(item)}
            <View className="flex-1 ml-3">
                <Text className="text-black text-base font-semibold ">
                    {item.name}
                </Text>
                <Text className="text-foreground-secondary text-sm">
                    {item.phone}
                </Text>
            </View>
        </Pressable>
    );

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView edges={['top']} className="flex-1 bg-background-light">
                <KeyboardAvoidingView
                    className="flex-1"
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View className="flex-1 justify-between bg-background-light">
                        <Pressable onPress={() => router.back()} className="px-4 py-3">
                            <ChevronLeft size={24} color="#000" />
                        </Pressable>

                        {/* Content Area */}
                        <View className="flex-1 px-6">
                            <Text variant="h3" className="text-foreground-dark">
                                Pay anyone
                            </Text>
                            <Text variant="caption" className="text-foreground-tertiary mb-8 font-sans">
                                Pay any Cron user using number or username
                            </Text>

                            {/* Search Input */}
                            <View className="pb-4">
                                <View className="relative">
                                    <TextInput
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        placeholder="Enter phone number"
                                        className="h-14 rounded-xl border-2 border-gray-200 bg-gray-50 px-4 pr-12 text-base text-foreground"
                                        placeholderTextColor="#8E8E93"
                                    />
                                    <View className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <User size={20} color="#8E8E93" />
                                    </View>
                                </View>
                            </View>

                            {/* Contact List */}
                            <View className="flex-1">
                                <Text className="text-lg font-semibold text-foreground-dark mb-4">
                                    Your Contacts
                                </Text>

                                <FlatList
                                    data={filteredContacts}
                                    renderItem={renderContact}
                                    keyExtractor={(item) => item.id}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                />
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
}
