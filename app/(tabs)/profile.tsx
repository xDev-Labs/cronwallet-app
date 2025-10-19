import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { UserIcon } from '@/components/icons/UserIcon';
import { useAuth } from '@/lib/contexts/AuthContext';
import { router } from 'expo-router';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background-light">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center py-8">
          {/* Avatar */}
          {user?.avatar ? (
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-4 shadow-lg"
              style={{ backgroundColor: user.avatar }}
            >
              <UserIcon size={48} color="#FFFFFF" />
            </View>
          ) : (
            <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-4">
              <UserIcon size={48} color="#9CA3AF" />
            </View>
          )}

          {/* Username */}
          <Text className="text-2xl font-bold text-foreground-dark mb-1">
            {user?.username ? `@${user.username}` : 'Guest'}
          </Text>

          {/* Phone Number */}
          <Text className="text-base text-foreground-tertiary">
            {user?.countryCode} {user?.phoneNumber}
          </Text>
        </View>

        {/* Profile Info */}
        <View className="px-6 mt-4">
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-sm text-foreground-tertiary">User ID</Text>
              <Text className="text-sm font-medium text-foreground-dark">
                {user?.id}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-3">
              <Text className="text-sm text-foreground-tertiary">Member since</Text>
              <Text className="text-sm font-medium text-foreground-dark">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Logout Button */}
          <Button
            onPress={handleLogout}
            variant="outline"
            className="mt-4"
          >
            Logout
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
