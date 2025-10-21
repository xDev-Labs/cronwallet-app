import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen name="username" options={{ headerShown: false }} />
      <Stack.Screen name="avatar" options={{ headerShown: false }} />
      <Stack.Screen name="setting-up" options={{ headerShown: false }} />
    </Stack>
  );
}
