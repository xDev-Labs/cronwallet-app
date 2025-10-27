import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ApiError, apiService } from "@/lib/services/api";
import { generateFileName, validateImageFile } from "@/lib/utils/fileValidation";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Camera } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CronLogo = () => (
  <View className="flex-1 w-full items-center justify-center">
    <Image
      source={require("@/assets/images/cron-black-logo.png")}
      className="w-[100px] h-8"
      resizeMode="contain"
    />
  </View>
);


export default function AvatarScreen() {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const { updateUserProfile, user } = useAuth();

  const pickImage = async () => {
    try {
      setError('');

      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1.0, // Use max quality to avoid compression issues
        base64: false, // Don't need base64 for FormData upload
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const imageUri = asset.uri;

        // Validate the selected file
        const validation = validateImageFile(imageUri);
        if (!validation.isValid) {
          setError(validation.error || 'Invalid file selected');
          return;
        }

        setSelectedAvatar(imageUri);
        setSelectedFile(asset);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      setError('Failed to pick image. Please try again.');
    }
  };

  const handleGetStarted = async () => {
    if (!selectedAvatar || !selectedFile) {
      setError("Please select an avatar image.");
      return;
    }

    if (!user?.user_id) {
      setError("User not found. Please try logging in again.");
      return;
    }

    setIsUpdating(true);
    setIsUploading(true);
    setError("");

    try {
      // Use the original file name from the asset or generate one
      let fileName = selectedFile.fileName || `avatar_${user.user_id}_${Date.now()}.jpg`;

      // Upload to backend API
      const uploadResponse = await apiService.uploadAvatar(
        user.user_id,
        selectedAvatar,
        fileName
      );

      if (!uploadResponse.success || !uploadResponse.data?.avatarUrl) {
        throw new Error(uploadResponse.message || 'Failed to upload avatar');
      }

      const avatarUrl = uploadResponse.data.avatarUrl;
      setIsUploading(false);

      // Update user profile with new avatar URL
      const updatedUserData = {
        ...user,
        avatar_url: avatarUrl
      };

      // Update local user profile
      await updateUserProfile(updatedUserData);

      // Navigate to next screen
      router.push("/(onboarding)/setting-up");

    } catch (err) {
      console.error("Error uploading avatar:", err);
      setIsUploading(false);

      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to upload avatar. Please try again.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const isButtonEnabled = selectedAvatar !== null && !isUpdating && !isUploading;

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-background-light"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 justify-between bg-background-light mt-20">
          {/* Header (Logo) */}
          <View className="items-start px-6 pt-15 pb-10">
            <CronLogo />
          </View>

          {/* Content Area */}
          <View className="flex-1 px-6 mt-5">
            <Text
              variant="h3"
              className="text-foreground-dark mb-2 text-center"
            >
              Choose your avatar
            </Text>
            <Text variant="caption" className="text-foreground-tertiary mb-8 font-sans text-center">
              Upload a photo to personalize your profile
            </Text>

            {/* Large Preview Avatar with Edit Icon */}
            <View className="items-center mb-12">
              <View className="relative">
                <Avatar size="lg" className="border-4 border-primary">
                  {selectedAvatar ? (
                    <AvatarImage source={{ uri: selectedAvatar }} />
                  ) : (
                    <AvatarFallback>{user?.cron_id?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  )}
                </Avatar>

                {/* Edit Icon Button */}
                <Pressable
                  onPress={pickImage}
                  className="absolute bottom-0 right-0 bg-primary rounded-full p-2 shadow-lg"
                  style={{ transform: [{ translateX: 5 }, { translateY: 5 }] }}
                >
                  <Camera size={20} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>

            {/* Upload Status */}
            {/* {isUploading && (
              <View className="items-center mb-4">
                <ActivityIndicator size="small" color="#4A3DFF" />
                <Text className="text-foreground-tertiary text-sm mt-2 font-sans">
                  Uploading avatar...
                </Text>
              </View>
            )} */}

            {/* File Info
            {selectedFile && !isUploading && (
              <View className="items-center mb-4">
                <Text className="text-foreground-secondary text-sm font-sans">
                  Image selected
                </Text>
              </View>
            )} */}

            {/* Error Message */}
            {error ? (
              <Text className="text-error text-sm mt-4 text-center font-sans">
                {error}
              </Text>
            ) : null}
          </View>

          {/* Get Started Button Container */}
          <View
            className={`px-6 pt-2.5 ${Platform.OS === "ios" ? "pb-7.5" : "pb-5"}`}
          >
            <Button
              onPress={handleGetStarted}
              disabled={!isButtonEnabled}
              loading={isUpdating || isUploading}
              className="shadow-lg shadow-primary/20 font-medium"
            >
              Upload Avatar
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
