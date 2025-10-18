import { Text } from '@/components/ui/text';
import { UserIcon } from '@/components/icons/UserIcon';
import { mockContacts } from '@/data/mockData';
import { useAuth } from '@/lib/contexts/AuthContext';
import { clearAllStorage } from '@/lib/storage/storage';
import { router } from 'expo-router';
import { Building2, CircleDot, QrCode, Search, Send, Smartphone, Users } from 'lucide-react-native';
import { Image, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentHome() {
  const { user } = useAuth();

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
          className="w-16 h-16 rounded-full mb-2"
        />
      );
    }

    const initial = contact.name.charAt(0).toUpperCase();
    const colors = ['#E91E63', '#9C27B0', '#FF5722', '#2196F3', '#4CAF50'];
    const colorIndex = contact.name.charCodeAt(0) % colors.length;

    return (
      <View
        className="w-16 h-16 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: colors[colorIndex] }}
      >
        <Text className="text-foreground text-2xl font-bold">{initial}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 pt-2 pb-4">
        <View className="flex-row items-center bg-background-tertiary rounded-xl px-4 h-13">
          <Search size={20} color="#8E8E93" className="mr-2" />
          <TextInput
            className="flex-1 text-foreground text-base"
            placeholder="Pay by name or phone number"
            placeholderTextColor="#8E8E93"
          />
          <TouchableOpacity className="ml-2">
            {user?.avatar ? (
              <View
                className="w-9 h-9 rounded-full items-center justify-center"
                style={{ backgroundColor: user.avatar }}
              >
                <UserIcon size={20} color="#FFFFFF" />
              </View>
            ) : (
              <Image
                source={{ uri: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100' }}
                className="w-9 h-9 rounded-full"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Promo Card */}
        <View className="bg-[#1a237e] mx-4 mb-6 rounded-2xl p-5 flex-row justify-between overflow-hidden">
          <View className="flex-1">
            <Text className="text-foreground text-2xl font-bold mb-2">
              Laddoos are tick-ing!
            </Text>
            <Text className="text-[#B3B3FF] text-sm mb-0.5">
              A new challenge unlocks
            </Text>
            <Text className="text-[#B3B3FF] text-sm mb-0.5">
              up to ₹1,001 and more
            </Text>
            <TouchableOpacity className="flex-row items-center bg-white/20 px-4 py-2 rounded-full mt-3 self-start">
              <Text className="text-foreground text-sm font-semibold mr-2">
                Join the Tick Squad
              </Text>
              <Text className="text-foreground text-base">→</Text>
            </TouchableOpacity>
          </View>
          <View className="relative w-30 justify-center items-center">
            <View className="w-15 h-15 rounded-full bg-[#FF9800] items-center justify-center absolute left-0">
              <Text className="text-[32px]">🥚</Text>
            </View>
            <View className="w-15 h-15 rounded-full bg-[#FF4081] items-center justify-center absolute right-5 -top-2.5">
              <Text className="text-[32px]">🎀</Text>
            </View>
            <View className="w-12 h-12 rounded-full bg-accent-light items-center justify-center absolute right-0 bottom-0">
              <Text className="text-foreground text-[28px] font-bold">✓</Text>
            </View>
          </View>
        </View>

        {/* Actions Grid */}
        <View className="flex-row flex-wrap px-4 mb-6 justify-between">
          <TouchableOpacity className="items-center w-[23%] mb-4" onPress={() => clearAllStorage()}>
            <View className="w-16 h-16 rounded-2xl bg-accent items-center justify-center mb-2">
              <QrCode size={28} color="#fff" strokeWidth={2} />
            </View>
            <Text className="text-foreground text-xs text-center">Scan any</Text>
            <Text className="text-foreground text-xs text-center">QR code</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center w-[23%] mb-4">
            <View className="w-16 h-16 rounded-2xl bg-accent items-center justify-center mb-2">
              <Send size={28} color="#fff" strokeWidth={2} />
            </View>
            <Text className="text-foreground text-xs text-center">Pay</Text>
            <Text className="text-foreground text-xs text-center">anyone</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center w-[23%] mb-4">
            <View className="w-16 h-16 rounded-2xl bg-accent items-center justify-center mb-2">
              <Building2 size={28} color="#fff" strokeWidth={2} />
            </View>
            <Text className="text-foreground text-xs text-center">Bank</Text>
            <Text className="text-foreground text-xs text-center">transfer</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center w-[23%] mb-4">
            <View className="w-16 h-16 rounded-2xl bg-accent items-center justify-center mb-2">
              <Smartphone size={28} color="#fff" strokeWidth={2} />
            </View>
            <Text className="text-foreground text-xs text-center">Mobile</Text>
            <Text className="text-foreground text-xs text-center">recharge</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center w-[23%] mb-4"
            onPress={() => router.push('./contacts' as any)}
          >
            <View className="w-16 h-16 rounded-2xl bg-accent items-center justify-center mb-2">
              <Users size={28} color="#fff" strokeWidth={2} />
            </View>
            <Text className="text-foreground text-xs text-center">Contacts</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View className="flex-row px-4 mb-6 items-center gap-3">
          <TouchableOpacity className="flex-row items-center bg-background-tertiary px-4 py-2.5 rounded-full gap-2">
            <CircleDot size={20} color="#fff" />
            <Text className="text-foreground text-sm font-medium">Tap & Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity className="border border-dashed border-[#3C3C3E] px-4 py-2.5 rounded-full">
            <Text className="text-foreground-secondary text-sm">+ Activate UPI Lite</Text>
          </TouchableOpacity>
        </View>

        {/* People Section */}
        <View className="pb-6">
          <Text variant="h3" className="text-foreground px-4 mb-4">
            People
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
            {mockContacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                className="items-center mr-4 w-20"
                onPress={() => handleContactPress(contact.id)}
              >
                {renderContactAvatar(contact)}
                <Text className="text-foreground text-xs text-center" numberOfLines={1}>
                  {contact.name}
                </Text>
                {contact.id === '1' && (
                  <View className="w-2 h-2 rounded-full bg-accent-light absolute top-0 right-5" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity className="items-center mr-4 w-20">
              <View className="w-16 h-16 rounded-full bg-background-tertiary items-center justify-center mb-2">
                <Text className="text-foreground text-2xl">✓</Text>
              </View>
              <Text className="text-foreground text-xs text-center">More</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
