import { Text } from '@/components/ui/text';
import { Gift } from 'lucide-react-native';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RewardsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-4">
          <Gift size={40} color="#9CA3AF" strokeWidth={1.5} />
        </View>
        <Text className="text-xl font-bold text-foreground-dark mb-2">
          No rewards yet
        </Text>
        <Text className="text-base text-foreground-tertiary text-center">
          Complete payments to earn rewards
        </Text>
      </View>
    </SafeAreaView>
  );
}
