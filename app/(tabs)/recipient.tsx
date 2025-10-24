import { Checks } from "@/components/icons/Checks";
import { DotsVertical } from "@/components/icons/DotsVertical";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/contexts/AuthContext";
import type { Transaction } from "@/lib/types/transaction.types";
import { getTransactionsBetweenUsers } from "@/lib/utils/transactionService";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RecipientScreen() {
  const { user } = useAuth();
  const {
    contactId,
    contactName,
    contactPhone,
    contactAvatarUrl,
    contactCronId,
    contactJoinedDate,
  } = useLocalSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const loadTransactions = async () => {
    if (!user?.user_id || !contactPhone) {
      setIsLoading(false);
      return;
    }

    // Clear previous transactions and show loading
    setTransactions([]);
    setIsLoading(true);

    try {
      const userTransactions = await getTransactionsBetweenUsers(
        user.user_id,
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

  useEffect(() => {
    loadTransactions();
  }, [user?.user_id, contactPhone]);

  const handlePayPress = () => {
    router.push({
      pathname: "/(tabs)/payment-initiate" as any,
      params: {
        contactId,
        contactName,
        contactPhone,
        contactAvatarUrl,
        contactCronId,
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
    if (transaction.sender_uid === user?.user_id) {
      return "sent";
    } else {
      return "received";
    }
  };

  const renderAvatar = () => {
    if (
      contactAvatarUrl &&
      typeof contactAvatarUrl === "string" &&
      contactAvatarUrl.trim()
    ) {
      return (
        <Image
          source={{ uri: contactAvatarUrl }}
          className="w-12 h-12 rounded-full"
        />
      );
    }

    const name = typeof contactName === "string" ? contactName : "Unknown";
    const initial = name.charAt(0).toUpperCase();
    const colors = ["#E91E63", "#9C27B0", "#FF5722", "#2196F3", "#4CAF50"];
    const colorIndex = name.charCodeAt(0) % colors.length;

    return (
      <View
        className="w-12 h-12 rounded-full items-center justify-center"
        style={{ backgroundColor: colors[colorIndex] }}
      >
        <Text className="text-white text-xl font-bold">{initial}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white font-sans">
      <View className="flex-row items-center px-4 py-3 justify-between">
        <TouchableOpacity
          className="p-2"
          onPress={() => router.push("/(tabs)/pay-anyone")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={28} color="#000" pointerEvents="none" />
        </TouchableOpacity>

        <View className="flex-row items-center flex-1 ml-3">
          {renderAvatar()}
          <View className="ml-3 flex-1">
            <Text className="text-black text-lg font-semibold">
              {contactName || "Unknown"}
            </Text>
            <Text className="text-foreground-secondary text-sm mt-0.5">
              {contactPhone || "No phone"}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2">
          <TouchableOpacity className="p-1">
            <DotsVertical size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        className="px-4"
      >
        {/* Centered Profile Section */}
        <View className="items-center px-4 py-6">
          {renderAvatar()}
          <Text className="text-black text-2xl font-semibold mt-4">
            {contactName || "Unknown"}
          </Text>

          {contactCronId && (
            <View className="flex-row items-center mt-2">
              <Text className="text-black text-base font-sans">
                CRON ID : {contactCronId}
              </Text>
            </View>
          )}

          <Text className="text-black text-base mt-2 font-sans">
            {contactPhone || "No phone"}
          </Text>

          {contactJoinedDate && (
            <Text className="text-foreground-secondary text-sm mt-1 font-sans">
              Joined {contactJoinedDate}
            </Text>
          )}
        </View>

        <View className="mt-6 px-4">
          {isLoading ? (
            <View className="flex-1 items-center justify-center py-8">
              <ActivityIndicator size="large" color="#4A3DFF" />
              <Text className="text-base text-foreground-tertiary mt-4">
                Loading transactions...
              </Text>
            </View>
          ) : transactions.length === 0 ? (
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-lg font-semibold text-foreground-dark mb-2">
                No transactions yet
              </Text>
              <Text className="text-base text-foreground-tertiary text-center">
                Start a conversation with {contactName} by sending a payment
              </Text>
            </View>
          ) : (
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
                      className={`rounded-2xl w-3/5 overflow-hidden ${
                        transactionType === "sent"
                          ? "bg-[#4A3DFF0F]"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      <View className="border-b-[3px] border-[#12062B]">
                        <View className="border-b-[3px] border-[#4A3DFF] p-5">
                          <View className="flex-row items-end gap-2">
                            <Text className="text-3xl font-bold text-black">
                              {formatAmount(transaction.amount)}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-2">
                            <Checks size={16} color="#00CD63" />
                            <Text className="text-sm flex-1 text-black">
                              {transactionType === "received"
                                ? "Received"
                                : "Paid"}
                            </Text>
                          </View>
                          {transactionType === "sent" && (
                            <View className="self-start bg-white border border-primary px-3 py-1 rounded-full mt-3">
                              <Text className="text-primary text-xs">
                                Pay Again
                              </Text>
                            </View>
                          )}
                          <Text className="text-sm text-right text-foreground-secondary">
                            {formatTime(transaction.created_at)}
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

      <View
        className="flex-row justify-center p-4 gap-3 bg-white"
        style={{
          shadowColor: "#4A3DFF",
          shadowOffset: { width: 0, height: -1 },
          shadowRadius: 13.5,
          shadowOpacity: 0.078,
          elevation: 8,
        }}
      >
        <Button className="w-full" onPress={handlePayPress}>
          Pay
        </Button>
      </View>
    </SafeAreaView>
  );
}
