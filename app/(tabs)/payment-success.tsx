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
    contactName,
    contactPhone,
    contactAvatarUrl,
    contactCronId,
    coinAmount,
    coinName,
    coinAddress,
    coinDecimals,
    coinSymbol,
    toAddress,
    type,
    walletAddress,
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

      const missingParams = [];
      if (!smartAccountAddress) missingParams.push("smartAccountAddress");
      if (!ownerPublicKey) missingParams.push("ownerPublicKey");
      if (!toAddress) missingParams.push("toAddress");
      if (!coinAddress) missingParams.push("coinAddress");
      if (!coinDecimals) missingParams.push("coinDecimals");
      if (!coinAmount) missingParams.push("coinAmount");

      if (missingParams.length > 0) {
        throw new Error(
          `Missing required transaction parameters: ${missingParams.join(", ")}`
        );
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
        smartAccountAddress,
        toAddress as string, // Using contactId as recipient user ID
        Number(coinAmount),
        [{ amount: coinAmount as string, token_address: coinAddress as string }]
      );

      console.log("Transaction response:", response);

      if (response.success) {
        // Construct full transaction object for display
        const newTransaction = {
          transaction_hash: response.data.signature,
          sender_addr: user?.primary_address as string,
          receiver_addr: toAddress as string,
          amount: Number(coinAmount),
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
  }, [toAddress, coinAmount, coinAddress, contactId, contactPhone]);

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

  if (!contactName || !coinAmount) {
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
        coinAmount,
        coinName,
        coinAddress,
        coinDecimals,
        coinSymbol,
        type,
        walletAddress,
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
        type,
        walletAddress,
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
      <SafeAreaView edges={["top"]} className="flex-1 bg-background-light">
        <View className="flex-1 items-center justify-center px-4">
          <View className="mb-6">
            <ActivityIndicator size="large" color="#4A3DFF" />
          </View>
          <Text className="text-foreground-dark text-xl font-semibold mt-4 text-center mb-2">
            Processing transaction...
          </Text>
          <Text className="text-foreground-tertiary text-base text-center px-8">
            Please wait while we complete your payment
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (transactionError) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background-light">
        <View className="flex-1 items-center justify-center px-4">
          <View
            className="w-24 h-24 bg-red-50 rounded-full items-center justify-center mb-6 border-2 border-red-200"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text className="text-red-500 text-5xl">⚠️</Text>
          </View>
          <Text className="text-foreground-dark text-2xl font-bold mb-3 text-center">
            Transaction Failed
          </Text>
          <View
            className="bg-white rounded-2xl p-6 mb-8 mx-4 shadow-sm"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text className="text-foreground-tertiary text-base text-center">
              {transactionError}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-[#4A3DFF] py-4 px-12 rounded-2xl active:opacity-80"
            onPress={handleRetry}
            style={{
              shadowColor: "#4A3DFF",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-white text-base font-semibold">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render success state
  const recipientName =
    type === "solName"
      ? contact.name
      : type === "walletAddress"
        ? `${(walletAddress as string).slice(0, 4)}...${(walletAddress as string).slice(-4)}`
        : contact.name.split(" ")[0];

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background-light">
      <View ref={successScreenRef} collapsable={false} className="flex-1">
        {/* Success Header Card */}
        <View className="px-4 pt-8 pb-6">
          <View
            className="bg-white rounded-2xl p-8 items-center shadow-sm"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            {/* Success Icon */}
            <View className="w-20 h-20 bg-green-50 rounded-full items-center justify-center mb-6 border-2 border-green-200">
              <CheckSquared size={48} color="#22C55E" />
            </View>

            {/* Success Title */}
            <Text className="text-foreground-dark text-3xl font-bold mb-2 text-center">
              Payment Completed
            </Text>

            {/* Amount */}
            <View className="items-center mb-6">
              <Text className="text-foreground-tertiary text-sm mb-2">
                Amount Sent
              </Text>
              <Text className="text-foreground-dark text-4xl font-bold">
                {coinAmount} {coinSymbol}
              </Text>
            </View>
          </View>
        </View>

        {/* Transaction Details Card */}
        <View className="px-4 pb-6">
          <View
            className="bg-white rounded-2xl p-6 shadow-sm"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            {/* Paid to */}
            <View className="mb-5 pb-5 border-b border-gray-100">
              <Text className="text-foreground-tertiary text-sm font-medium mb-2">
                Paid to
              </Text>
              <Text className="text-foreground-dark text-xl font-bold">
                {recipientName}
              </Text>
            </View>

            {/* Cron ID or Wallet Address */}
            {type !== "walletAddress" &&
              type !== "solName" &&
              contactCronId && (
                <View className="mb-5 pb-5 border-b border-gray-100">
                  <Text className="text-foreground-tertiary text-sm font-medium mb-2">
                    Cron ID
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Logo size={16} color="#000000" fill="#000000" />
                    <Text className="text-foreground-dark text-base font-semibold">
                      {contactCronId}
                    </Text>
                  </View>
                </View>
              )}

            {(type === "walletAddress" || type === "solName") &&
              walletAddress && (
                <View className="mb-5 pb-5 border-b border-gray-100">
                  <Text className="text-foreground-tertiary text-sm font-medium mb-2">
                    Wallet Address
                  </Text>
                  <Text className="text-foreground-dark text-base font-semibold font-mono">
                    {`${(walletAddress as string).slice(0, 8)}...${(walletAddress as string).slice(-8)}`}
                  </Text>
                </View>
              )}

            {/* Date and Time */}
            <View>
              <Text className="text-foreground-tertiary text-sm font-medium mb-2">
                Date & Time
              </Text>
              <Text className="text-foreground-dark text-base font-semibold">
                {formattedDate}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Done Button */}
      <View className="px-4 pb-6 pt-2">
        <Pressable>
          <Button
            onPress={handleDone}
            className="w-full"
            style={{
              shadowColor: "#4A3DFF",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            Done
          </Button>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
