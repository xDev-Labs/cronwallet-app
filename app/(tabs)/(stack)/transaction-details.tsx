import { Checks } from "@/components/icons/Checks";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Transaction } from "@/lib/types";
import { shortenTxnHash } from "@/lib/utils";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Copy } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TransactionDetailsScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Parse transaction data from params
    if (params.transactionData) {
      try {
        const parsedData = JSON.parse(params.transactionData as string);
        setTransaction(parsedData);
      } catch (error) {
        console.error("Error parsing transaction data:", error);
      }
    }
  }, [params.transactionData]);

  const handleBackPress = () => {
    router.back();
  };

  const handleCopyOrderId = async () => {
    if (transaction?.transaction_hash) {
      try {
        await Clipboard.setStringAsync(transaction.transaction_hash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Error copying to clipboard:", error);
        Alert.alert("Error", "Failed to copy Order ID");
      }
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear().toString();

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return {
          text: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-200",
        };
      case "pending":
        return {
          text: "text-yellow-600",
          bg: "bg-yellow-50",
          border: "border-yellow-200",
        };
      case "failed":
        return {
          text: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
        };
      default:
        return {
          text: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-200",
        };
    }
  };

  const getCryptoAmount = () => {
    if (transaction?.token && transaction.token.length > 0) {
      return transaction.token[0].amount;
    }
    return "0.0000000";
  };

  const getCryptoSymbol = () => {
    if (
      transaction?.token &&
      transaction.token.length > 0 &&
      transaction.token[0].token_address ===
      "DMC3nUVXBLNrB8f97wLqwkNw9DD7EXgqhPgev8gVTv7g"
    ) {
      // Assuming ETH for now, could be made dynamic based on token_address
      return "USDC";
    }
    return "SOL";
  };

  if (!transaction) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background-light">
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-foreground-tertiary">
            Loading transaction details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusColors = getStatusColor(transaction.status);
  const isSent = transaction.sender_addr === user?.primary_address;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background-light">
      {/* Header */}
      <View className="px-4 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Pressable
            onPress={handleBackPress}
            className="p-2 -ml-2 active:opacity-70"
          >
            <ChevronLeft size={24} color="#000" />
          </Pressable>
          <Text variant="h3" className="text-black text-center font-semibold">
            Payment Details
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="px-4 pt-2">
          {/* Amount Section */}
          <View
            className="bg-white rounded-2xl p-8 mb-4 shadow-sm"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text className="text-center text-sm text-foreground-tertiary mb-3">
              Amount
            </Text>
            <Text className="text-center text-4xl font-bold text-foreground-dark mb-3">
              {isSent ? "-" : "+"}
              {getCryptoAmount()} {getCryptoSymbol()}
            </Text>

            {/* Status Badge */}
            <View className="items-center">
              <View
                className={`flex-row items-center px-4 py-2 rounded-full border ${statusColors.bg} ${statusColors.border}`}
              >
                {transaction.status === "completed" && (
                  <View className="w-3 h-3 bg-green-600 rounded-full items-center justify-center mr-2">
                    <Checks size={8} color="white" />
                  </View>
                )}
                <Text className={`text-sm font-semibold ${statusColors.text}`}>
                  {transaction.status.charAt(0).toUpperCase() +
                    transaction.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>

          {/* Transaction Details */}
          <View
            className="bg-white rounded-2xl p-5 shadow-sm"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            {/* To */}
            <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
              <Text className="text-sm text-foreground-tertiary font-medium">
                To
              </Text>
              <Text className="text-base text-foreground-dark font-semibold">
                {transaction.receiver?.phone_number ||
                  shortenTxnHash(transaction.receiver_addr)}
              </Text>
            </View>

            {/* Date */}
            <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
              <Text className="text-sm text-foreground-tertiary font-medium">
                Date
              </Text>
              <Text className="text-base text-foreground-dark font-semibold">
                {formatDate(transaction.created_at)}
              </Text>
            </View>

            {/* Time */}
            <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
              <Text className="text-sm text-foreground-tertiary font-medium">
                Time
              </Text>
              <Text className="text-base text-foreground-dark font-semibold">
                {formatTime(transaction.created_at)}
              </Text>
            </View>

            {/* Order ID */}
            <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
              <Text className="text-sm text-foreground-tertiary font-medium">
                Transaction ID
              </Text>
              <Pressable
                onPress={handleCopyOrderId}
                className="flex-row items-center gap-2 active:opacity-70"
              >
                <Text className="text-base text-foreground-dark font-semibold">
                  {shortenTxnHash(transaction.transaction_hash)}
                </Text>
                <Copy
                  size={18}
                  color={copied ? "#22C55E" : "#4A3DFF"}
                  strokeWidth={2}
                />
              </Pressable>
            </View>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
