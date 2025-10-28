import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/contexts/AuthContext";
import { apiService } from "@/lib/services/api";
import type { Transaction } from "@/lib/types/transaction.types";
import { mapBackendTransactionToTransaction } from "@/lib/utils/transactionMapping";
import { router } from "expo-router";
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);

  const loadTransactions = async (
    page: number = 1,
    isRefresh: boolean = false
  ) => {
    if (!user?.user_id) return;

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await apiService.getTransactionsByUserId(
        user.user_id,
        page,
        10
      );

      if (response.success && response.data) {
        const newTransactions = response.data.transactions.map(
          (backendTx: any) => mapBackendTransactionToTransaction(backendTx)
        );

        if (page === 1 || isRefresh) {
          setTransactions(newTransactions);
        } else {
          setTransactions((prev) => [...prev, ...newTransactions]);
        }

        setCurrentPage(page);
        setHasMoreData(page < response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    await loadTransactions(1, true);
  };

  const loadMoreTransactions = async () => {
    if (!isLoadingMore && hasMoreData && user?.user_id) {
      await loadTransactions(currentPage + 1);
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

  const getTransactionDirection = (item: Transaction) => {
    return item.sender_uid === user?.user_id ? "sent" : "received";
  };

  const handleTransactionPress = (item: Transaction) => {
    router.push({
      pathname: "/(tabs)/transaction-details",
      params: {
        transactionData: JSON.stringify(item),
        userId: user?.user_id,
      },
    });
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const direction = getTransactionDirection(item);
    const isSent = direction === "sent";

    return (
      <Pressable onPress={() => handleTransactionPress(item)}>
        <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Text
                  className={`text-lg font-bold ${isSent ? "text-red-600" : "text-green-600"}`}
                >
                  {isSent ? "-" : "+"}
                </Text>
                <Text
                  className={`text-lg font-bold ml-1 ${isSent ? "text-red-600" : "text-green-600"}`}
                >
                  {formatAmount(item.amount)}
                </Text>
              </View>
              <Text className="text-sm text-foreground-tertiary">
                {isSent ? "Sent to" : "Received from"}{" "}
                {item.receiver?.phone_number || "Unknown"}
              </Text>
            </View>
            <View className="items-end">
              <View
                className={`px-2 py-1 rounded-full ${getStatusColor(item.status)} bg-opacity-10`}
              >
                <Text
                  className={`text-xs font-medium ${getStatusColor(item.status)}`}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
              <Text className="text-xs text-foreground-tertiary mt-1">
                {formatDate(item.created_at)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

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
          onEndReached={loadMoreTransactions}
          onEndReachedThreshold={0.1}
          ListFooterComponent={() => {
            if (isLoadingMore) {
              return (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color="#4A3DFF" />
                  <Text className="text-sm text-foreground-tertiary mt-2">
                    Loading more transactions...
                  </Text>
                </View>
              );
            }
            if (!hasMoreData && transactions.length > 0) {
              return (
                <View className="py-4 items-center">
                  <Text className="text-sm text-foreground-tertiary">
                    No more transactions
                  </Text>
                </View>
              );
            }
            return null;
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </SafeAreaView>
  );
}
