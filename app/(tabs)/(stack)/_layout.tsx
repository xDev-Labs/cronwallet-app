import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="history" />
      <Stack.Screen name="balance" />
      <Stack.Screen name="payment-confirm" />
      <Stack.Screen name="payment-initiate" />
      <Stack.Screen name="payment-success" />
      <Stack.Screen name="recipient" />
      <Stack.Screen name="pay-anyone" />
      <Stack.Screen name="qr-code" />
      <Stack.Screen name="scan-qr" />
      <Stack.Screen name="transaction-details" />
    </Stack>
  );
}