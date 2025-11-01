import { CheckSquared } from "@/components/icons/CheckSquared";
import { Logo } from "@/components/icons/Logo";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { apiService } from "@/lib/services/api";
import { transferSol } from "@/lib/solana/transferSol";
import { transferSpl } from "@/lib/solana/transferSpl";
import { storage } from "@/lib/storage/storage";
import { useFocusEffect } from "@react-navigation/native";
import { PublicKey } from "@solana/web3.js";
import { Audio } from "expo-av";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentSuccessScreen() {
  const {
    contactId,
    amount,
    contactName,
    contactPhone,
    contactAvatarUrl,
    contactCronId,
    currencyCode,
    currencyFlag,
    coinAmount,
    coinName,
    coinAddress,
    coinDecimals,
    coinSymbol,
    toAddress,
  } = useLocalSearchParams();
  const successScreenRef = useRef<View>(null);
  const hasProcessedRef = useRef(false);
  const hasPlayedAudioRef = useRef(false);

  // Transaction processing state
  const [isProcessing, setIsProcessing] = useState(true);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);

  // Use the passed contact data directly instead of looking up from mockContacts
  const contact = {
    name: (contactName as string) || "Unknown",
    bankingName: (contactCronId as string) || "N/A",
    avatarUrl: contactAvatarUrl as string,
  };

  // Process transaction when screen comes into focus
  const processTransaction = useCallback(async () => {
    // Prevent duplicate processing if already processing
    if (hasProcessedRef.current) {
      return;
    }

    try {
      hasProcessedRef.current = true;
      hasPlayedAudioRef.current = false; // Reset audio flag for new transaction
      setIsProcessing(true);
      setTransactionError(null);

      // Get user data and public key
      const user = await storage.getUser();
      const smartAccountAddress = user?.primary_address as string;
      const ownerPublicKey = (await storage.getPublicKey()) as string;

      if (
        !smartAccountAddress ||
        !ownerPublicKey ||
        !toAddress ||
        !coinAddress ||
        !coinDecimals ||
        !coinAmount
      ) {
        throw new Error("Missing required transaction parameters");
      }
      let encodedTransaction = null;

      if (coinSymbol === "SOL") {
        encodedTransaction = await transferSol(
          Number(coinAmount) * 10 ** Number(coinDecimals),
          smartAccountAddress,
          toAddress as string,
          new PublicKey(ownerPublicKey)
        );
      } else {

        // Create encoded transaction
        encodedTransaction = await transferSpl(
          Number(coinAmount) * 10 ** Number(coinDecimals),
          smartAccountAddress,
          toAddress as string,
          coinAddress as string,
          new PublicKey(ownerPublicKey)
        );
      }

      // Execute transaction
      const response = await apiService.transferSpl(
        encodedTransaction,
        user?.user_id as string,
        contactId as string, // Using contactId as recipient user ID
        Number(coinAmount),
        [{ amount: coinAmount as string, token_address: coinAddress as string }]
      );

      console.log("Transaction response:", response);

      if (response.success) {
        // Construct full transaction object for display
        const newTransaction = {
          transaction_hash: response.data.signature,
          sender_uid: user?.user_id as string,
          receiver_uid: contactId as string,
          amount: Number(amount),
          token: [
            {
              amount: coinAmount as string,
              token_address: coinAddress as string,
            },
          ],
          chain_id: 101, // Solana mainnet
          status: "completed" as const,
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          receiver: {
            phone_number: contactPhone as string,
          },
        };

        setTransactionData(newTransaction);
        setIsProcessing(false);
      } else {
        throw new Error(response.message || "Transaction failed");
      }
    } catch (error) {
      console.error("Transaction error:", error);
      setTransactionError(
        error instanceof Error ? error.message : "Transaction failed"
      );
      setIsProcessing(false);
    }
  }, [toAddress, coinAmount, coinAddress, contactId, amount, contactPhone]);

  useFocusEffect(
    useCallback(() => {
      processTransaction();

      // Reset the processing flag when screen loses focus
      return () => {
        hasProcessedRef.current = false;
      };
    }, [processTransaction])
  );

  // Reset audio flag when starting a new transaction
  useEffect(() => {
    if (isProcessing) {
      hasPlayedAudioRef.current = false;
    }
  }, [isProcessing]);

  // Play success sound when transaction completes
  useEffect(() => {
    let soundObject: Audio.Sound | null = null;

    async function playSuccessSound() {
      // Only play sound if transaction is successful (not processing and no error) and hasn't been played yet
      if (isProcessing || transactionError || hasPlayedAudioRef.current) {
        return;
      }

      try {
        // Set audio mode for playback
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        // Load and play the sound
        const { sound } = await Audio.Sound.createAsync(
          require("@/assets/audio/payment-success.wav"),
          { shouldPlay: true }
        );

        soundObject = sound;
        hasPlayedAudioRef.current = true; // Mark audio as played

        // Unload sound from memory after it finishes playing
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      } catch (error) {
        console.error("Error playing success sound:", error);
      }
    }

    playSuccessSound();

    // Cleanup function to unload sound when effect re-runs or component unmounts
    return () => {
      if (soundObject) {
        soundObject.unloadAsync().catch((error) => {
          console.error("Error unloading sound:", error);
        });
      }
    };
  }, [isProcessing, transactionError]);

  if (!contactName || !amount) {
    return null;
  }

  const handleRetry = () => {
    // Navigate back to payment-confirm to retry
    router.push({
      pathname: "/(tabs)/payment-confirm" as any,
      params: {
        contactId,
        contactName,
        contactPhone,
        contactAvatarUrl,
        contactCronId,
        amount,
        coinAmount,
        coinName,
        coinAddress,
        coinDecimals,
        coinSymbol,
        currencyCode,
        currencyFlag,
      },
    });
  };

  const handleDone = () => {
    console.log("handleDone");
    // Use replace to ensure this screen is removed from the stack
    // This helps ensure proper cleanup and re-initialization on next visit
    router.replace({
      pathname: "./recipient" as any,
      params: {
        contactId,
        contactName,
        contactPhone,
        contactAvatarUrl,
        contactCronId,
        newTransaction: transactionData
          ? JSON.stringify(transactionData)
          : undefined,
      },
    });
  };

  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString("en-US", { month: "long" })} ${currentDate.getFullYear()}, ${currentDate.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;

  // Render loading state
  if (isProcessing) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-4">
          <ActivityIndicator size="large" color="#4A3DFF" />
          <Text className="text-black text-lg font-medium font-sans mt-6 text-center">
            Processing transaction...
          </Text>
          <Text className="text-gray-500 text-sm font-sans mt-2 text-center">
            Please wait while we complete your payment
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (transactionError) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-4">
          <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-6">
            <Text className="text-red-500 text-4xl">⚠️</Text>
          </View>
          <Text className="text-black text-xl font-semibold font-sans mb-2 text-center">
            Transaction Failed
          </Text>
          <Text className="text-gray-500 text-base font-sans text-center mb-6">
            {transactionError}
          </Text>
          <TouchableOpacity
            className="bg-[#4A3DFF] py-3.5 px-8 rounded-3xl"
            onPress={handleRetry}
          >
            <Text className="text-white text-base font-semibold font-sans">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render success state
  return (
    <SafeAreaView edges={["top"]} className="flex-1 justify-center bg-white">
      <View
        ref={successScreenRef}
        collapsable={false}
        className="flex-1 px-4 pt-[60px] bg-white justify-center"
      >
        <View className="items-center mb-10">
          <View className="mb-4">
            <CheckSquared size={40} color="#4CAF50" />
          </View>

          <Text className="text-black text-2xl font-semibold font-sans mb-6">
            Payment Completed
          </Text>

          <Text className="text-black text-2xl font-normal font-sans mb-6">
            {amount} {coinSymbol}
          </Text>

          <Text className="text-gray-500 text-base font-sans mb-2">
            Paid to
          </Text>
          <Text className="text-black text-xl font-semibold font-sans mb-3">
            {contact.name.split(" ")[0]}
          </Text>

          <View className="flex-row items-center gap-1.5 mb-2">
            <Logo size={12} color="#000000" fill="#000000" />
            <Text className="text-gray-500 text-sm font-sans">
              Cron ID: {contactCronId}
            </Text>
          </View>

          <Text className="text-gray-500 text-sm font-sans">
            {formattedDate}
          </Text>
        </View>
      </View>

      <View className="p-4 gap-3 bg-white mb-6">
        <Pressable>
          <Button onPress={handleDone} className="w-full">
            Done
          </Button>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
