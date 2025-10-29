import 'react-native-get-random-values';

import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import slip10 from 'micro-key-producer/slip10.js';
import * as Keychain from 'react-native-keychain';

import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/contexts/AuthContext";
import { apiService } from '@/lib/services/api';
import { initSmartAccountInstruction } from '@/lib/solana/initSmartAccount';
import { storage } from "@/lib/storage/storage";
import { mapBackendUserToUser } from '@/lib/utils/userMapping';
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const CronLogo = () => (
  <View className="items-center justify-center">
    <Image
      source={require("@/assets/images/cron-black-logo.png")}
      className="w-[120px] h-10"
      resizeMode="contain"
    />
  </View>
);

export default function SettingUpScreen() {
  const { completeOnboarding, updateUserProfile, user } = useAuth();
  const [status, setStatus] = useState("Setting up account...");

  useEffect(() => {
    setupAccount();
  }, []);


  const generatePublicKeyandStoreSeedPhrase = async () => {
    try {
      // Store the seed phrase securely with biometric protection
      const options = {
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
        authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS,
        securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
        service: 'bip39_seed_phrase',
      };
      // Generate a 128-bit (12-word) BIP39 seed phrase
      let mnemonic = bip39.generateMnemonic();

      // Store the mnemonic in keychain
      const result = await Keychain.setGenericPassword(
        'bip39_seed_phrase',
        mnemonic,
        options
      );

      // Verify storage was successful
      if (result) {
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const hdMaster = slip10.fromMasterSeed(new Uint8Array(seed));
        const derived = hdMaster.derive("m/44'/501'/0'/0'");
        const privateKey = Uint8Array.from(derived.privateKey);
        const keypair = Keypair.fromSeed(privateKey);
        const publicKey = keypair.publicKey.toString();
        return publicKey;
      }
      return null;
    } catch (error) {
      console.error('Error generating or storing seed phrase:', error);
      return null;
    }
  }

  const setupAccount = async () => {
    try {
      if (!user?.user_id) {
        return;
      }
      setStatus("Finalizing your profile...");

      const publicKey = await generatePublicKeyandStoreSeedPhrase();
      if (!publicKey) {
        router.push('/(onboarding)/username')
        return;
      }
      const initAccount = await initSmartAccountInstruction(publicKey);
      const onboardUserResponse = await apiService.onboardUser(user.user_id, publicKey, initAccount.smartAccountAddress, initAccount.encodedTransaction)
      if (!onboardUserResponse.success) {
        router.push('/(onboarding)/username')
        return;
      }

      const backendUserData = onboardUserResponse.data!.user;
      const userData = mapBackendUserToUser(backendUserData);
      await updateUserProfile(userData);


      try {
        await storage.savePublicKey(publicKey);
      } catch (err) {
        console.log(err)
      }

      await apiService.getAirdrop(user.user_id, 10);


      // Complete onboarding locally
      await completeOnboarding();
      try {
        await storage.saveLatestTransactions([]);
        console.log("Transactions fetched and stored for returning user");
      } catch (error) {
        console.warn(
          "Failed to fetch transactions for returning user:",
          error
        );
        // Continue even if transaction fetch fails
      }
      // Navigate to home
      router.replace("/(tabs)");
    } catch (err) {
      console.error("Error completing setup:", err);
      setStatus("Setup complete!");

      // Complete onboarding locally even if backend fails
      try {
        await completeOnboarding();
      } catch (localError) {
        console.error("Error completing local onboarding:", localError);
      }

      // Navigate to home
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-background-light"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View className="flex-1 justify-center items-center px-6">
        {/* Centered Logo */}
        <View className="flex-1 justify-center items-center">
          <CronLogo />
        </View>

        {/* Bottom Loading Section */}
        <View className="pb-20 items-center">
          <ActivityIndicator size="small" color="#4A3DFF" />
          <Text
            variant="caption"
            className="text-foreground-tertiary mt-4 font-sans"
          >
            {status}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
