import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  useFonts,
} from '@expo-google-fonts/montserrat';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import './global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import '@react-native-firebase/app';
import 'expo-crypto';
import 'react-native-get-random-values';

import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Import Clarity conditionally for native platforms
let Clarity: any = null;
try {
  Clarity = require("@microsoft/react-native-clarity");
  Clarity = Clarity.default || Clarity;
} catch (e) {
  console.warn('[Clarity] Module not available:', e);
}

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Initialize Microsoft Clarity
  useEffect(() => {
    const initClarity = async () => {
      // Only initialize on native platforms (iOS/Android)
      if (Platform.OS === 'web') {
        return;
      }

      // Check if Clarity module is available
      if (!Clarity) {
        console.warn('[Clarity] Module not loaded. Make sure to rebuild the app.');
        return;
      }

      const clarityProjectId = Constants.expoConfig?.extra?.clarityProjectId ||
        process.env.EXPO_PUBLIC_CLARITY_PROJECT_ID;

      if (!clarityProjectId) {
        console.warn(
          '[Clarity] Project ID not found. Please set EXPO_PUBLIC_CLARITY_PROJECT_ID in your .env file.'
        );
        return;
      }

      try {
        if (Clarity && typeof Clarity.initialize === 'function') {
          Clarity.initialize(clarityProjectId);
          console.log('[Clarity] Initialized successfully');
        } else {
          console.warn('[Clarity] Initialize method not available');
        }
      } catch (error) {
        console.error('[Clarity] Failed to initialize:', error);
      }
    };

    initClarity();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
