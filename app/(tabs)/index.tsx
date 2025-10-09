import { router } from 'expo-router';
import { Building2, CircleDot, QrCode, Search, Send, Smartphone, Users } from 'lucide-react-native';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockContacts } from '../../data/mockData';

export default function PaymentHome() {
  const handleContactPress = (contactId: string) => {
    router.push({
      pathname: './recipient' as any,
      params: { contactId },
    });
  };

  const renderContactAvatar = (contact: typeof mockContacts[0]) => {
    if (contact.avatarUrl) {
      return (
        <Image
          source={{ uri: contact.avatarUrl }}
          style={styles.avatar}
        />
      );
    }

    const initial = contact.name.charAt(0).toUpperCase();
    const colors = ['#E91E63', '#9C27B0', '#FF5722', '#2196F3', '#4CAF50'];
    const colorIndex = contact.name.charCodeAt(0) % colors.length;

    return (
      <View style={[styles.avatarPlaceholder, { backgroundColor: colors[colorIndex] }]}>
        <Text style={styles.avatarInitial}>{initial}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pay by name or phone number"
            placeholderTextColor="#8E8E93"
          />
          <TouchableOpacity style={styles.profileButton}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.promoCard}>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Laddoos are tick-ing!</Text>
            <Text style={styles.promoSubtitle}>A new challenge unlocks</Text>
            <Text style={styles.promoSubtitle}>up to ₹1,001 and more</Text>
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Join the Tick Squad</Text>
              <Text style={styles.promoArrow}>→</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.promoIllustration}>
            <View style={styles.characterOrange}>
              <Text style={styles.characterEmoji}>🥚</Text>
            </View>
            <View style={styles.characterPink}>
              <Text style={styles.characterEmoji}>🎀</Text>
            </View>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <QrCode size={28} color="#fff" strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Scan any</Text>
            <Text style={styles.actionLabel}>QR code</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Send size={28} color="#fff" strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Pay</Text>
            <Text style={styles.actionLabel}>anyone</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Building2 size={28} color="#fff" strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Bank</Text>
            <Text style={styles.actionLabel}>transfer</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Smartphone size={28} color="#fff" strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Mobile</Text>
            <Text style={styles.actionLabel}>recharge</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('./contacts' as any)}>
            <View style={styles.actionIcon}>
              <Users size={28} color="#fff" strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Contacts</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <CircleDot size={20} color="#fff" />
            <Text style={styles.quickActionText}>Tap & Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButtonOutline}>
            <Text style={styles.quickActionTextOutline}>+ Activate UPI Lite</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.peopleSection}>
          <Text style={styles.sectionTitle}>People</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.peopleList}>
            {mockContacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={styles.personItem}
                onPress={() => handleContactPress(contact.id)}
              >
                {renderContactAvatar(contact)}
                <Text style={styles.personName} numberOfLines={1}>
                  {contact.name}
                </Text>
                {contact.id === '1' && <View style={styles.newBadge} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.personItem}>
              <View style={styles.moreButton}>
                <Text style={styles.moreButtonText}>✓</Text>
              </View>
              <Text style={styles.personName}>More</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  profileButton: {
    marginLeft: 8,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  promoCard: {
    backgroundColor: '#1a237e',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  promoSubtitle: {
    color: '#B3B3FF',
    fontSize: 14,
    marginBottom: 2,
  },
  promoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  promoArrow: {
    color: '#fff',
    fontSize: 16,
  },
  promoIllustration: {
    position: 'relative',
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterOrange: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
  },
  characterPink: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF4081',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 20,
    top: -10,
  },
  characterEmoji: {
    fontSize: 32,
  },
  checkmark: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    width: '23%',
    marginBottom: 16,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#1565C0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
    gap: 12,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  quickActionButtonOutline: {
    borderWidth: 1,
    borderColor: '#3C3C3E',
    borderStyle: 'dashed',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  quickActionTextOutline: {
    color: '#8E8E93',
    fontSize: 14,
  },
  upiId: {
    color: '#8E8E93',
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  peopleSection: {
    paddingBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  peopleList: {
    paddingLeft: 16,
  },
  personItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  personName: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  newBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
    position: 'absolute',
    top: 0,
    right: 20,
  },
  moreButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  moreButtonText: {
    color: '#fff',
    fontSize: 24,
  },
});
