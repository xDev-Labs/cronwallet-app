import * as Contacts from 'expo-contacts';
import { router, Stack } from 'expo-router';
import { ArrowLeft, User, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      <TouchableOpacity style={styles.contactItem}>
        <View
          style={[
            styles.avatarPlaceholder,
            { backgroundColor: colors[colorIndex] },
          ]}
        >
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactPhone}>{phoneNumber}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={28} color="#fff" pointerEvents="none" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Contacts</Text>
          </View>
          <View style={styles.centerContent}>
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
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace('/(tabs)/' as any)}
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Contacts</Text>
          </View>
          <View style={styles.centerContent}>
            <User size={64} color="#8E8E93" />
            <Text style={styles.permissionTitle}>Contacts Permission Required</Text>
            <Text style={styles.permissionDescription}>
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
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={28} color="#fff" pointerEvents="none" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contacts</Text>
        </View>

        {contacts.length === 0 ? (
          <View style={styles.centerContent}>
            <User size={64} color="#8E8E93" />
            <Text style={styles.emptyText}>No contacts found</Text>
          </View>
        ) : (
          <FlatList
            data={contacts}
            renderItem={renderContact}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  permissionDescription: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 16,
  },
  listContent: {
    padding: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactPhone: {
    color: '#8E8E93',
    fontSize: 14,
  },
});
