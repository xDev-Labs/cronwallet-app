import * as Contacts from 'expo-contacts';
import { router, Stack } from 'expo-router';
import { ArrowLeft, User, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface PhoneContact {
  id: string;
  name: string;
  phoneNumbers?: Array<{ number?: string }>;
}

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<PhoneContact[]>([]);
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
          setContacts(data);
        }
      }
      setLoading(false);
    })();
  }, []);

  const renderContact = ({ item }: { item: PhoneContact }) => {
    const phoneNumber = item.phoneNumbers?.[0]?.number || 'No phone number';
    const initial = item.name?.charAt(0)?.toUpperCase() || '?';
    const colors = ['#E91E63', '#9C27B0', '#FF5722', '#2196F3', '#4CAF50'];
    const colorIndex = item.name ? item.name.charCodeAt(0) % colors.length : 0;

    return (
      <TouchableOpacity className="flex-row items-center bg-[#1C1C1E] rounded-xl p-3 mb-2">
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: colors[colorIndex] }}
        >
          <Text className="text-foreground text-xl font-bold">{initial}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-foreground text-base font-semibold mb-1">
            {item.name}
          </Text>
          <Text className="text-foreground-secondary text-sm">
            {phoneNumber}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-row items-center px-4 py-4 border-b border-border">
            <TouchableOpacity
              className="mr-4"
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={28} color="#fff" pointerEvents="none" />
            </TouchableOpacity>
            <Text variant="h3">Contacts</Text>
          </View>
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2196F3" />
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (hasPermission === false) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-row items-center px-4 py-4 border-b border-border">
            <TouchableOpacity
              className="mr-4"
              onPress={() => router.replace('/(tabs)/' as any)}
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <Text variant="h3">Contacts</Text>
          </View>
          <View className="flex-1 justify-center items-center px-8">
            <User size={64} color="#8E8E93" />
            <Text variant="h4" className="text-foreground mt-4 text-center">
              Contacts Permission Required
            </Text>
            <Text variant="caption" className="text-foreground-secondary mt-2 text-center">
              Please grant access to your contacts to view and select them.
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row items-center px-4 py-4 border-b border-border">
          <TouchableOpacity
            className="mr-4"
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={28} color="#fff" pointerEvents="none" />
          </TouchableOpacity>
          <Text variant="h3">Contacts</Text>
        </View>

        {contacts.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <User size={64} color="#8E8E93" />
            <Text className="text-foreground-secondary text-base mt-4">
              No contacts found
            </Text>
          </View>
        ) : (
          <FlatList
            data={contacts}
            renderItem={renderContact}
            keyExtractor={(item) => item.id}
            contentContainerClassName="p-4"
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </>
  );
}
