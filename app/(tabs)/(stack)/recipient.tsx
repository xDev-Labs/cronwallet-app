import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { whiteInset } from "@/lib/constants/theme";
import { useAuth } from "@/lib/contexts/AuthContext";
import { apiService } from "@/lib/services/api";
import type { Transaction } from "@/lib/types/transaction.types";
import { normalizePhoneNumber } from "@/lib/utils";
import { getTransactionsBetweenUsers, getTransactionsByWalletAddress } from "@/lib/utils/transactionService";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface RecipientData {
  user_id: string;
  phone_number: string;
  cron_id: string;
  primary_address: string;
  avatar_url?: string;
}


export default function RecipientScreen() {
  const { user } = useAuth();
  const {
    contactName,
    contactPhone,
    contactAvatarUrl,
    contactCronId,
    contactJoinedDate,
    type,
    walletAddress,
    newTransaction,
  } = useLocalSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingRecipient, setIsCheckingRecipient] = useState(true);
  const [recipientExists, setRecipientExists] = useState(false);
  const [recipientData, setRecipientData] = useState<RecipientData | null>(
    null
  );
  const [showNotCronUserModal, setShowNotCronUserModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Mask sensitive data based on payment type
  const maskPhoneNumber = (phone: string | string[] | undefined): string => {
    if (!phone) return "No phone";
    const phoneStr = Array.isArray(phone) ? phone[0] : phone;

    // Mask wallet address
    if (type === "walletAddress" && phoneStr && phoneStr.length > 20) {
      // Show first 8 and last 8 characters for wallet addresses
      const firstPart = phoneStr.slice(0, 8);
      const lastPart = phoneStr.slice(-8);
      return `${firstPart}...${lastPart}`;
    }

    // Mask phone number
    if (type === "cronId" && phoneStr && phoneStr.length > 6) {
      // Show first 3 and last 4 digits, mask the rest
      const firstPart = phoneStr.slice(0, 3);
      const lastPart = phoneStr.slice(-4);
      const maskedLength = phoneStr.length - 7;
      const masked = "*".repeat(Math.max(maskedLength, 4));
      return `${firstPart}${masked}${lastPart}`;
    }

    return phoneStr || "No phone";
  };

  // Mask display name when it's a wallet address
  const maskDisplayName = (name: string | string[] | undefined): string => {
    if (!name) return "Unknown";
    const nameStr = Array.isArray(name) ? name[0] : name;

    // Mask wallet address in name
    if (type === "walletAddress" && nameStr && nameStr.length > 20) {
      const firstPart = nameStr.slice(0, 8);
      const lastPart = nameStr.slice(-8);
      return `${firstPart}...${lastPart}`;
    }

    return nameStr || "Unknown";
  };

  const loadTransactions = async () => {
    console.log("Loading transactions for user:", user?.user_id);
    console.log("Contact phone:", contactPhone);
    console.log("Type:", type);
    console.log("Wallet address:", walletAddress);

    // For wallet/sol payments, load by wallet address
    if ((type === "walletAddress" || type === "solName") && walletAddress) {
      setTransactions([]);
      setIsLoading(true);

      try {
        const walletTransactions = await getTransactionsByWalletAddress(
          walletAddress as string
        );
        setTransactions(walletTransactions);

        // Scroll to bottom after transactions are loaded
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }, 10);
      } catch (error) {
        console.error("Error loading wallet transactions:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // For regular contacts, use phone-based loading
    if (!user?.user_id || !contactPhone) {
      setIsLoading(false);
      return;
    }

    // Clear previous transactions and show loading
    setTransactions([]);
    setIsLoading(true);

    try {
      const userTransactions = await getTransactionsBetweenUsers(
        user.primary_address,
        contactPhone as string
      );
      setTransactions(userTransactions);

      // Scroll to bottom after transactions are loaded
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 10);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkRecipientExists = async () => {
    try {
      const normalizedPhone = normalizePhoneNumber(contactPhone as string);
      console.log("Normalized phone:", normalizedPhone);
      const response = await apiService.getUserByPhoneNumber(normalizedPhone);

      if (response.success && response.data) {
        // Store recipient data in state
        setRecipientData(response.data);
        console.log("Recipient data loaded:", response.data);
      }

      return response.success;
    } catch (error) {
      console.error("Error checking recipient:", error);
      return false;
    }
  };

  useEffect(() => {
    const initializeRecipient = async () => {
      // For wallet addresses and .sol domains, skip recipient checking
      if (type === "walletAddress" || type === "solName") {
        setIsCheckingRecipient(false);
        setRecipientExists(true); // Allow payment to proceed
        await loadTransactions();
        setIsLoading(false);
        return;
      }

      if (!contactPhone) {
        setIsCheckingRecipient(false);
        return;
      }

      setIsCheckingRecipient(true);
      const exists = await checkRecipientExists();

      if (exists) {
        setRecipientExists(true);
        await loadTransactions();
      } else {
        setRecipientExists(false);
        setShowNotCronUserModal(true);
        // Still load page but with no transactions
        setIsLoading(false);
      }

      setIsCheckingRecipient(false);
    };

    initializeRecipient();
  }, [user?.user_id, contactPhone, type]);

  // Handle new transaction from payment success
  useEffect(() => {
    if (newTransaction) {
      try {
        const parsedTransaction = JSON.parse(newTransaction as string);
        setTransactions((prevTransactions) => [
          ...prevTransactions,
          parsedTransaction,
        ]);

        // Scroll to bottom to show the new transaction
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error) {
        console.error("Error parsing new transaction:", error);
      }
    }
  }, [newTransaction]);

  const handlePayPress = () => {
    router.push({
      pathname: "/(tabs)/payment-initiate" as any,
      params: {
        contactId: recipientData?.user_id || contactName,
        contactName,
        contactPhone,
        // Use recipient data from state if available, otherwise fallback to params
        contactAvatarUrl: recipientData?.avatar_url || contactAvatarUrl,
        contactCronId: recipientData?.cron_id || contactCronId,
        type,
        walletAddress, // Pass wallet address for wallet/sol payments
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getTransactionType = (transaction: Transaction) => {
    // Check if current user is the sender or receiver
    if (transaction.sender_addr === user?.primary_address) {
      return "sent";
    } else {
      return "received";
    }
  };

  const renderAvatar = () => {
    // Use recipient data avatar if available, otherwise fallback to params
    const avatarUrl = recipientData?.avatar_url || contactAvatarUrl;

    if (avatarUrl && typeof avatarUrl === "string" && avatarUrl.trim()) {
      return (
        <Image source={{ uri: avatarUrl }} className="w-12 h-12 rounded-full" />
      );
    }

    const name = typeof contactName === "string" ? contactName : "Unknown";
    return (
      <Image source={require("../../../assets/images/user.png")} className="w-12 h-12 rounded-full" />
    );
  };

  // Show loading while checking recipient
  if (isCheckingRecipient) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-white font-sans">
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity
            className="p-2"
            onPress={() => router.push("./pay-anyone")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={28} color="#000" pointerEvents="none" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4A3DFF" />
          <Text className="text-base text-foreground-tertiary mt-4">
            Checking recipient...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white font-sans">
      <View className="flex-row items-center px-4 py-3 justify-between">
        <TouchableOpacity
          className="p-2"
          onPress={() => router.push("./pay-anyone")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={28} color="#000" pointerEvents="none" />
        </TouchableOpacity>

        {
          transactions.length > 0 &&
          (<View className="flex-row items-center flex-1 ml-3">
            {renderAvatar()}
            <View className="ml-3 flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-black text-lg font-semibold">
                  {maskDisplayName(contactName)}
                </Text>
                <Image source={require("../../../assets/images/logo-white.png")} className="w-5 h-5" />
              </View>
              {type !== "walletAddress" && type !== "solName" && (
                <Text className="text-foreground-secondary text-sm mt-0.5">
                  {maskPhoneNumber(contactPhone)}
                </Text>
              )}
            </View>
          </View>
          )
        }


        {/* <View className="flex-row gap-2">
          <TouchableOpacity className="p-1">
            <DotsVertical size={24} color="#000" />
          </TouchableOpacity>
        </View> */}
      </View>


      {
        transactions.length == 0 ? (
          <View className="flex-1 items-center justify-center py-8">
            <View className="items-center px-4 py-6">
              {type !== "walletAddress" && type !== "solName" && renderAvatar()}
              <Text
                className={`text-black text-2xl font-semibold ${type !== "walletAddress" && type !== "solName" ? "mt-4" : ""}`}
              >
                {maskDisplayName(contactName)}
              </Text>

              {/* Only show Cron ID for regular contacts */}
              {type !== "walletAddress" && type !== "solName" && (recipientData?.cron_id || contactCronId) && (
                <View className="flex-row items-center mt-1">
                  <Image source={require("../../../assets/images/logo-white.png")} className="w-5 h-5 mr-2" />
                  <Text className="text-black text-base font-sans">
                    Cron ID : {recipientData?.cron_id || contactCronId}
                  </Text>
                </View>
              )}

              {/* Only show phone for non-wallet/sol types */}
              {type !== "walletAddress" && type !== "solName" && (
                <Text className="text-black text-base mt-4 font-sans">
                  {maskPhoneNumber(contactPhone)}
                </Text>
              )}

              {/* Show wallet address for wallet/sol payments */}
              {(type === "walletAddress" || type === "solName") && walletAddress && (
                <Text className="text-foreground-secondary text-sm font-sans mt-1">
                  {`${(walletAddress as string).slice(0, 4)}...${(walletAddress as string).slice(-4)}`}
                </Text>
              )}

              {/* Only show joined date for regular contacts */}
              {type !== "walletAddress" && type !== "solName" && (
                <Text className="text-[#A5A5A5] text-sm mt-1 font-sans">
                  Joined Dec 2025
                </Text>
              )}
            </View>
          </View>
        ) :
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            className={`px-4`}
          >
            {/* Centered Profile Section */}
            <View className="items-center px-4 py-6">
              {type !== "walletAddress" && type !== "solName" && renderAvatar()}
              <Text
                className={`text-black text-2xl font-semibold ${type !== "walletAddress" && type !== "solName" ? "mt-4" : ""}`}
              >
                {maskDisplayName(contactName)}
              </Text>

              {/* Only show Cron ID for regular contacts */}
              {type !== "walletAddress" && type !== "solName" && (recipientData?.cron_id || contactCronId) && (
                <View className="flex-row items-center mt-1">
                  <Image source={require("../../../assets/images/logo-white.png")} className="w-5 h-5 mr-2" />
                  <Text className="text-black text-base font-sans">
                    Cron ID : {recipientData?.cron_id || contactCronId}
                  </Text>
                </View>
              )}

              {/* Only show phone for non-wallet/sol types */}
              {type !== "walletAddress" && type !== "solName" && (
                <Text className="text-black text-base mt-4 font-sans">
                  {maskPhoneNumber(contactPhone)}
                </Text>
              )}

              {/* Show wallet address for wallet/sol payments */}
              {(type === "walletAddress" || type === "solName") && walletAddress && (
                <Text className="text-foreground-secondary text-sm font-sans mt-1">
                  {`${(walletAddress as string).slice(0, 4)}...${(walletAddress as string).slice(-4)}`}
                </Text>
              )}

              {/* Only show joined date for regular contacts */}
              {type !== "walletAddress" && type !== "solName" && (
                <Text className="text-[#A5A5A5] text-sm mt-1 font-sans">
                  Joined Dec 2025
                </Text>
              )}
            </View>

            <View className="px-4">
              {/* Show loading or transactions for all payment types */}
              {isLoading ? (
                <View className="flex-1 items-center justify-center py-8">
                  <ActivityIndicator size="large" color="#4A3DFF" />
                  <Text className="text-base text-foreground-tertiary mt-4">
                    Loading transactions...
                  </Text>
                </View>
              ) : transactions.length === 0 ? "" : (
                transactions.map((transaction, index) => {
                  const transactionType = getTransactionType(transaction);
                  const isNewDate =
                    index === 0 ||
                    formatDate(transaction.created_at) !==
                    formatDate(transactions[index - 1].created_at);

                  return (
                    <View key={transaction.transaction_hash} className="mb-3">
                      {isNewDate && (
                        <View className="flex justify-center items-center my-8">
                          <View className="w-full h-[1px] bg-gray-200 rounded-full" />
                          <View className="absolute -top-2.5 bg-white border border-gray-200 rounded-full px-3 py-0.5">
                            <Text className="text-foreground-secondary text-sm font-sans">
                              {formatDate(transaction.created_at)}
                            </Text>
                          </View>
                        </View>
                      )}
                      <View
                        className={`flex-row ${transactionType === "sent" ? "justify-end" : "justify-start"}`}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            router.push({
                              pathname: "./transaction-details",
                              params: {
                                transactionData: JSON.stringify(transaction),
                                fromRecipient: "true",
                                contactName,
                                contactPhone,
                                contactAvatarUrl,
                                contactCronId,
                                contactJoinedDate,
                                type,
                              },
                            });
                          }}
                          className={`rounded-b-2xl w-3/5 overflow-hidden border border-[#E2E2E2] ${transactionType === "received" ? "rounded-tr-2xl" : "rounded-tl-2xl"}`}
                        >
                          <View className="p-5">
                            <View className="flex-row items-end gap-2">
                              <Text className="text-xl font-semibold text-black">
                                {transaction.token[0].amount} {transaction.token[0].token_address === "DMC3nUVXBLNrB8f97wLqwkNw9DD7EXgqhPgev8gVTv7g" ? "USDC" : "SOL"}
                              </Text>
                            </View>
                            <View className="flex-row items-center gap-2 mt-2">
                              <Image source={require("../../../assets/icons/success.png")} className="w-4 h-4" />
                              <Text className="text-sm flex-1 text-black font-sans">
                                {transactionType === "received"
                                  ? "Received"
                                  : "Paid"} • {formatTime(transaction.created_at)}
                              </Text>
                            </View>

                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>
      }


      <View className="flex-row justify-center p-4 gap-3 bg-white mb-8">
        <Button
          className="w-fit rounded-full px-6"
          onPress={handlePayPress}
          disabled={!recipientExists}
          style={whiteInset}
        >
          Send
        </Button>
      </View>

      {/* Modal for Non-Cron Users */}
      <Modal
        visible={showNotCronUserModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotCronUserModal(false)}
      >
        <View className="flex-1 bg-black/50">
          <Pressable
            className="flex-1"
            onPress={() => setShowNotCronUserModal(false)}
          />
          <View className="bg-white rounded-t-3xl pb-8">
            {/* Header */}
            <View className="p-6">
              <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />
              <Text
                variant="h3"
                className="text-foreground-dark text-center mb-2"
              >
                User Not Found
              </Text>
              <Text
                variant="body"
                className="text-foreground-secondary text-center"
              >
                User does not use Cron
              </Text>
            </View>

            {/* OK Button */}
            <View className="px-6">
              <Button
                className="w-full"
                onPress={() => {
                  setShowNotCronUserModal(false);
                  router.push("./pay-anyone");
                }}
              >
                OK
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
