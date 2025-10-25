import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/contexts/AuthContext";
import * as Clipboard from "expo-clipboard";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import { ArrowLeft, Copy, Download, Share2 } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  Share,
  StatusBar,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";

export default function QRCodeScreen() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<View>(null);

  const primaryAddress =
    user?.primary_address || user?.wallet_address?.[0] || "";
  const cronId = user?.cron_id || "";

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(cronId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert("Error", "Failed to copy to clipboard");
    }
  };

  const handleDownload = async () => {
    try {
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to save images to your gallery"
        );
        return;
      }

      // Capture the QR code view
      if (!qrRef.current) return;

      const uri = await captureRef(qrRef, {
        format: "png",
        quality: 1,
      });

      // Save to media library
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Success", "QR code saved to gallery");
    } catch (error) {
      console.error("Error saving QR code:", error);
      Alert.alert("Error", "Failed to save QR code");
    }
  };

  const handleShare = async () => {
    try {
      if (!qrRef.current) return;

      // Capture the QR code view
      const uri = await captureRef(qrRef, {
        format: "png",
        quality: 1,
      });

      // Share the image with message
      await Share.share({
        message: `My Cron ID: @${cronId}\nScan to pay me on Cron Wallet`,
        url: Platform.OS === "ios" ? uri : `file://${uri}`,
      });
    } catch (error) {
      console.error("Error sharing QR code:", error);
      // Don't show alert if user cancelled the share
      if ((error as any).message !== "User did not share") {
        Alert.alert("Error", "Failed to share QR code");
      }
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background-light">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center"
        >
          <ArrowLeft size={24} color="#000000" strokeWidth={2} />
        </Pressable>

        <View className="flex-row items-center gap-4">
          <Pressable onPress={handleDownload} className="active:opacity-70">
            <Download size={24} color="#000000" strokeWidth={2} />
          </Pressable>
          <Pressable onPress={handleShare} className="active:opacity-70">
            <Share2 size={24} color="#000000" strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 items-center justify-center px-6">
        {/* QR Code Container */}
        <View
          ref={qrRef}
          className="bg-white rounded-3xl p-8 items-center shadow-lg"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          {/* Title */}
          <View className="mb-6 items-center">
            <Text className="text-3xl font-bold text-primary mb-3">
              Cron QR
            </Text>
            <Pressable
              onPress={handleCopy}
              className="flex-row items-center gap-2 bg-gray-100 px-4 py-2 rounded-full active:opacity-70"
            >
              <Text className="text-md text-foreground-tertiary">
                Cron ID: {cronId ? `@${cronId}` : ""}
              </Text>
              <Copy
                size={16}
                color={copied ? "#22C55E" : "#4A3DFF"}
                strokeWidth={2}
              />
            </Pressable>
          </View>

          {/* QR Code */}
          <View className="mb-6">
            {primaryAddress ? (
              <QRCode
                value={`solana:${primaryAddress}`}
                size={280}
                color="#000000"
                backgroundColor="#FFFFFF"
                logo={require("@/assets/images/icon.png")}
                logoSize={60}
                logoBackgroundColor="#FFFFFF"
                logoMargin={2}
                logoBorderRadius={15}
                enableLinearGradient={false}
                ecl="M"
              />
            ) : (
              <View className="w-[280px] h-[280px] bg-gray-200 rounded-lg items-center justify-center">
                <Text className="text-gray-500">No address available</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
