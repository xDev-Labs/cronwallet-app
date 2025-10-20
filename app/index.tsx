import { CronLogo } from '@/components/common/CronLogo';
import { useAuth } from '@/lib/contexts/AuthContext';
import '@react-native-firebase/app';
import { useRouter } from 'expo-router';
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
    <View className=" bg-white justify-center items-center h-full">
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          alignItems: 'center',
        }}
      >
        <View className="justify-center items-center shadow-lg">
          <CronLogo className="w-[150px]" />
        </View>
      </Animated.View>
    </View>
  );
}
