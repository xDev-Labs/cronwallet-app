import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/contexts/AuthContext";
import { apiService } from "@/lib/services/api";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useFocusEffect } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StatusBar,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScanQRScreen() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [canScan, setCanScan] = useState(false); // Start as false
  const isHandlingRef = useRef(false);
  const isMountedRef = useRef(true);

  // Reset states when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      isMountedRef.current = true;

      // Small delay to ensure camera is ready
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          setScanned(false);
          setIsProcessing(false);
          setCanScan(true);
          isHandlingRef.current = false;
        }
      }, 300);

      return () => {
        isMountedRef.current = false;
        setCanScan(false);
        clearTimeout(timer);
      };
    }, [])
  );

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    // Immediate check with ref to prevent multiple scans
    if (isHandlingRef.current || !canScan || scanned || isProcessing) return;

    isHandlingRef.current = true;
    setCanScan(false);
    setScanned(true);
    setIsProcessing(true);

    try {
      // The data should be a wallet address
      const address = data.trim();

      if (!address) {
        if (!isMountedRef.current) return;
        setIsProcessing(false);
        Alert.alert("Invalid QR Code", "No address found in QR code", [
          {
            text: "OK",
            onPress: () => {
              if (!isMountedRef.current) return;
              setScanned(false);
              setCanScan(true);
              isHandlingRef.current = false;
            },
          },
        ]);
        return;
      }

      // Check if scanning own address
      if (address === user?.primary_address) {
        if (!isMountedRef.current) return;
        setIsProcessing(false);
        Alert.alert(
          "Cannot Pay Yourself",
          "You cannot make a payment to your own wallet address",
          [
            {
              text: "OK",
              onPress: () => {
                if (!isMountedRef.current) return;
                setScanned(false);
                setCanScan(true);
                isHandlingRef.current = false;
              },
            },
          ]
        );
        return;
      }

      // Fetch user details by address
      const response = await apiService.getUserByAddress(address);

      // Check if component is still mounted before updating state or navigating
      if (!isMountedRef.current) return;

      if (response.success && response.data) {
        const recipient = response.data;

        // Reset states before navigation
        setScanned(false);
        setIsProcessing(false);
        setCanScan(false);
        isHandlingRef.current = false;

        // Navigate to recipient page with user details
        router.push({
          pathname: "/(tabs)/payment-initiate",
          params: {
            contactId: recipient.user_id,
            contactName: recipient.cron_id,
            contactPhone: recipient.phone_number,
            contactAvatarUrl: recipient.avatar_url || "",
            contactCronId: recipient.cron_id,
            contactJoinedDate: "",
          },
        });
      } else {
        if (!isMountedRef.current) return;
        setIsProcessing(false);
        Alert.alert(
          "User Not Found",
          "No Cron Wallet user found with this address. Please try again.",
          [
            {
              text: "OK",
              onPress: () => {
                if (!isMountedRef.current) return;
                setScanned(false);
                setCanScan(true);
                isHandlingRef.current = false;
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error processing QR code:", error);
      if (!isMountedRef.current) return;
      setIsProcessing(false);
      Alert.alert("Error", "Failed to process QR code. Please try again.", [
        {
          text: "OK",
          onPress: () => {
            if (!isMountedRef.current) return;
            setScanned(false);
            setCanScan(true);
            isHandlingRef.current = false;
          },
        },
      ]);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4A3DFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center"
          >
            <ArrowLeft size={24} color="#000000" strokeWidth={2} />
          </Pressable>
          <Text className="text-lg font-semibold text-foreground-dark">
            Scan QR Code
          </Text>
          <View className="w-6" />
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-2xl font-bold text-foreground-dark mb-4 text-center">
            Camera Permission Required
          </Text>
          <Text className="text-base text-foreground-tertiary mb-8 text-center">
            Please grant camera permission to scan QR codes
          </Text>
          <Pressable
            onPress={requestPermission}
            className="bg-primary rounded-2xl px-8 py-4 active:opacity-90"
          >
            <Text className="text-white font-semibold text-base">
              Grant Permission
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <SafeAreaView edges={["top"]}>
        <View className="flex-row items-center justify-between px-6 py-4">
          <Pressable
            onPress={() => router.back()}
            className="active:opacity-70"
          >
            <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2} />
          </Pressable>
          <Text className="text-lg font-semibold text-white">Scan QR Code</Text>
          <View className="w-6" />
        </View>
      </SafeAreaView>

      {/* Camera View */}
      <View className="flex-1">
        {canScan && (
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          >
            {/* Scanning Overlay */}
            <View className="flex-1 items-center justify-center">
              {/* Top overlay */}
              <View className="absolute top-0 left-0 right-0 h-1/4 bg-black/60" />

              {/* Bottom overlay */}
              <View className="absolute bottom-0 left-0 right-0 h-1/4 bg-black/60" />

              {/* Left overlay */}
              <View className="absolute left-0 top-1/4 bottom-1/4 w-12 bg-black/60" />

              {/* Right overlay */}
              <View className="absolute right-0 top-1/4 bottom-1/4 w-12 bg-black/60" />

              {/* Scanning frame */}
              <View className="w-72 h-72 border-4 border-primary rounded-3xl">
                {/* Corner indicators */}
                <View className="absolute -top-1 -left-1 w-12 h-12 border-t-8 border-l-8 border-white rounded-tl-3xl" />
                <View className="absolute -top-1 -right-1 w-12 h-12 border-t-8 border-r-8 border-white rounded-tr-3xl" />
                <View className="absolute -bottom-1 -left-1 w-12 h-12 border-b-8 border-l-8 border-white rounded-bl-3xl" />
                <View className="absolute -bottom-1 -right-1 w-12 h-12 border-b-8 border-r-8 border-white rounded-br-3xl" />
              </View>

              {/* Instructions */}
              <View className="absolute bottom-24 left-0 right-0 px-6">
                <View className="bg-black/70 rounded-2xl px-6 py-4">
                  <Text className="text-white text-center text-base font-medium">
                    {isProcessing
                      ? "Processing QR code..."
                      : "Position the QR code within the frame"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Processing indicator */}
            {isProcessing && (
              <View className="absolute inset-0 bg-black/80 items-center justify-center">
                <ActivityIndicator size="large" color="#4A3DFF" />
                <Text className="text-white text-lg font-semibold mt-4">
                  Loading recipient details...
                </Text>
              </View>
            )}
          </CameraView>
        )}
      </View>
    </View>
  );
}
