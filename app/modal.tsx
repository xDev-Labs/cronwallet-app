import { Link } from 'expo-router';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center p-5 bg-background">
      <Text variant="h2" className="text-foreground">
        This is a modal
      </Text>
      <Link href="/" dismissTo className="mt-4 py-4">
        <Text className="text-primary font-semibold">Go to home screen</Text>
      </Link>
    </View>
  );
}
