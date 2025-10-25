import { Text } from '@/components/ui/text';
import { Contact } from '@/lib/types';
import * as Contacts from 'expo-contacts';
import { router, Stack } from 'expo-router';
import { ChevronLeft, User } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PayAnyoneScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    useEffect(() => {
        (async () => {
            const { status } = await Contacts.requestPermissionsAsync();
            setHasPermission(status === 'granted');

            if (status === 'granted') {
                const { data } = await Contacts.getContactsAsync({
                    fields: [Contacts.Fields.PhoneNumbers],
                });

                if (data.length > 0) {
                    // Convert phone contacts to app Contact format
                    const mappedContacts: Contact[] = data
                        .filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0)
                        .map(contact => ({
                            id: contact.id,
                            name: contact.name || 'Unknown',
                            phone: contact.phoneNumbers?.[0]?.number || '',
                            bankingName: contact.name || 'Unknown',
                        }));
                    let sortedContacts = mappedContacts.sort((a, b) => a.name.localeCompare(b.name));
                    setContacts(sortedContacts);
                }
            }
            setLoading(false);
        })();
    }, []);

    const filteredContacts = useMemo(() => {
        if (!searchQuery.trim()) {
            return contacts;
        }

        const query = searchQuery.toLowerCase();
        return contacts.filter(contact =>
            contact.name.toLowerCase().includes(query) ||
            contact.phone.toLowerCase().includes(query) ||
            (contact.bankingName && contact.bankingName.toLowerCase().includes(query))
        );
    }, [searchQuery, contacts]);

    const handleContactPress = (contact: Contact) => {
        router.push({
            pathname: '/(tabs)/recipient',
            params: {
                contactId: contact.id,
                contactName: contact.name,
                contactPhone: contact.phone,
                contactAvatarUrl: contact.avatarUrl || '',
                contactCronId: contact.cronId || '',
                contactJoinedDate: contact.joinedDate || '',
            },
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

    if (loading) {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView edges={['top']} className="flex-1 bg-background-light">
                    <Pressable onPress={() => router.back()} className="px-4 py-3">
                        <ChevronLeft size={24} color="#000" />
                    </Pressable>
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#4A3DFF" />
                    </View>
                </SafeAreaView>
            </>
        );
    }

    if (hasPermission === false) {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView edges={['top']} className="flex-1 bg-background-light">
                    <Pressable onPress={() => router.back()} className="px-4 py-3">
                        <ChevronLeft size={24} color="#000" />
                    </Pressable>
                    <View className="flex-1 justify-center items-center px-8">
                        <User size={64} color="#8E8E93" />
                        <Text variant="h4" className="text-foreground-dark mt-4 text-center">
                            Contacts Permission Required
                        </Text>
                        <Text variant="caption" className="text-foreground-secondary mt-2 text-center">
                            Please grant access to your contacts to view and select them for payments.
                        </Text>
                    </View>
                </SafeAreaView>
            </>
        );
    }

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
                                        className="h-14 font-sans rounded-xl border-2 border-gray-200 bg-gray-50 px-4 pr-12 text-base text-black"
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
