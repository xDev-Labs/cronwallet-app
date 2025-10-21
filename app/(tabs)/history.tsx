import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/contexts/AuthContext";
import type { Transaction } from "@/lib/types/transaction.types";
import {
  getUserTransactions,
  refreshUserTransactions,
} from "@/lib/utils/transactionService";
import { Clock, RefreshCw } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadTransactions = async () => {
    if (!user?.user_id) return;

    try {
      const userTransactions = await getUserTransactions(user.user_id);
      setTransactions(userTransactions);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!user?.user_id) return;

    setIsRefreshing(true);
    try {
      const refreshedTransactions = await refreshUserTransactions(user.user_id);
      setTransactions(refreshedTransactions);
    } catch (error) {
      console.error("Error refreshing transactions:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [user?.user_id]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground-dark">
            {formatAmount(item.amount)}
          </Text>
          <Text className="text-sm text-foreground-tertiary">
            {item.transaction_hash.slice(0, 8)}...
            {item.transaction_hash.slice(-8)}
          </Text>
        </View>
        <View className="items-end">
          <Text
            className={`text-sm font-medium ${getStatusColor(item.status)}`}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
          <Text className="text-xs text-foreground-tertiary">
            {formatDate(item.created_at)}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-xs text-foreground-tertiary">From</Text>
          <Text className="text-sm text-foreground-dark">
            {item.sender_uid.slice(0, 8)}...
          </Text>
        </View>
        <View>
          <Text className="text-xs text-foreground-tertiary">To</Text>
          <Text className="text-sm text-foreground-dark">
            {item.receiver_uid.slice(0, 8)}...
          </Text>
        </View>
        <View>
          <Text className="text-xs text-foreground-tertiary">Chain</Text>
          <Text className="text-sm text-foreground-dark">{item.chain_id}</Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background-light">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4A3DFF" />
          <Text className="text-base text-foreground-tertiary mt-4">
            Loading transactions...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (transactions.length === 0) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background-light">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Clock size={40} color="#9CA3AF" strokeWidth={1.5} />
          </View>
          <Text className="text-xl font-bold text-foreground-dark mb-2">
            No transaction history
          </Text>
          <Text className="text-base text-foreground-tertiary text-center mb-6">
            Your payment history will appear here
          </Text>
          <Pressable
            onPress={handleRefresh}
            className="bg-primary px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Refresh</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background-light">
      <View className="flex-1 px-4 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-foreground-dark">
            Transaction History
          </Text>
          <Pressable
            onPress={handleRefresh}
            disabled={isRefreshing}
            className="p-2"
          >
            <RefreshCw
              size={20}
              color="#4A3DFF"
              className={isRefreshing ? "animate-spin" : ""}
            />
          </Pressable>
        </View>

        <FlatList
          data={transactions}
          keyExtractor={(item) => item.transaction_hash}
          renderItem={renderTransaction}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#4A3DFF"]}
              tintColor="#4A3DFF"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </SafeAreaView>
  );
}
