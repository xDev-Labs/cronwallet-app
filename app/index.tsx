import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Smartphone } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();
  const { user, isLoading, isBiometricAuthenticated } = useAuth();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(opacityAnim, {
      toValue: 1,
      delay: 200,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        // Route based on user state
        if (user) {
          if (user.hasCompletedOnboarding) {
            // Check if biometric is enabled and not already authenticated in this session
            if (user.biometricEnabled && !isBiometricAuthenticated) {
              router.replace('/(auth)/biometric-lock');
            } else {
              router.replace('/(tabs)');
            }
          } else {
            router.replace('/(onboarding)/username');
          }
        } else {
          router.replace('/(auth)/phone-auth');
        }
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, user, isBiometricAuthenticated]);

  return (
    <View className="flex-1 bg-background-secondary justify-center items-center">
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          alignItems: 'center',
        }}
      >
        <View className="w-30 h-30 rounded-[30px] bg-secondary justify-center items-center mb-6 shadow-lg">
          <Smartphone size={64} color="#fff" strokeWidth={2} />
        </View>
        <Text className="text-4xl font-bold text-foreground mb-2">
          Welcome to Cron!
        </Text>
        <Text className="text-base text-foreground-secondary font-normal">
          Payments, simplified.
        </Text>
      </Animated.View>
    </View>
  );
}
