import { Text } from "@/components/ui/text";
import { useAuth } from "@/lib/contexts/AuthContext";
import { apiService } from "@/lib/services/api";
import type { Transaction } from "@/lib/types/transaction.types";
import { shortenTxnHash } from "@/lib/utils";
import { mapBackendTransactionToTransaction } from "@/lib/utils/transactionMapping";
import { router } from "expo-router";
import { ChevronLeft, Clock, RefreshCw } from "lucide-react-native";
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
        user.primary_address,
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

  const getTransactionDirection = (item: Transaction) => {
    return item.sender_addr === user?.primary_address ? "sent" : "received";
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
      <Pressable
        onPress={() => handleTransactionPress(item)}
        className="active:opacity-80"
      >
        <View
          className="bg-white rounded-2xl p-5 mb-3 shadow-sm"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Text
                  className={`text-xl font-bold ${isSent ? "text-red-600" : "text-green-600"}`}
                >
                  {isSent ? "-" : "+"}
                </Text>
                <Text
                  className={`text-xl font-bold ml-1 ${isSent ? "text-red-600" : "text-green-600"}`}
                >
                  {formatAmount(item.amount)}
                </Text>
              </View>
              <Text className="text-sm text-foreground-tertiary mb-3">
                {isSent ? "Sent to" : "Received from"}{" "}
                {item.receiver?.phone_number || shortenTxnHash(item.receiver_addr)}
              </Text>
              <Text className="text-xs text-foreground-tertiary">
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
        <View className="px-4 pt-4">
          <View className="flex-row justify-between items-center mb-4">
            <Pressable
              onPress={() => router.back()}
              className="p-2 -ml-2 active:opacity-70"
            >
              <ChevronLeft size={24} color="#000" />
            </Pressable>
            <Text variant="h3" className="text-black text-center font-semibold">
              Transaction History
            </Text>
            <View className="w-10" />
          </View>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4A3DFF" />
          <Text className="text-xl text-foreground-dark font-semibold mt-6 mb-2">
            Loading transactions...
          </Text>
          <Text className="text-base text-foreground-tertiary text-center px-8">
            Please wait while we fetch your transaction history
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (transactions.length === 0) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background-light">
        <View className="px-4 pt-4">
          <View className="flex-row justify-between items-center mb-4">
            <Pressable
              onPress={() => router.back()}
              className="p-2 -ml-2 active:opacity-70"
            >
              <ChevronLeft size={24} color="#000" />
            </Pressable>
            <Text variant="h3" className="text-black text-center font-semibold">
              Transaction History
            </Text>
            <View className="w-10" />
          </View>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <View
            className="w-24 h-24 rounded-full bg-gray-50 items-center justify-center mb-6 border-2 border-gray-200"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Clock size={48} color="#9CA3AF" strokeWidth={1.5} />
          </View>
          <Text className="text-2xl font-bold text-foreground-dark mb-3 text-center">
            No transaction history
          </Text>
          <Text className="text-base text-foreground-tertiary text-center mb-8 px-4">
            Your payment history will appear here once you make your first
            transaction
          </Text>
          <Pressable
            onPress={handleRefresh}
            className="bg-[#4A3DFF] px-8 py-4 rounded-2xl active:opacity-80"
            style={{
              shadowColor: "#4A3DFF",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-white font-semibold text-base">Refresh</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background-light">
      <View className="px-4 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Pressable
            onPress={() => router.back()}
            className="p-2 -ml-2 active:opacity-70"
          >
            <ChevronLeft size={24} color="#000" />
          </Pressable>
          <Text variant="h3" className="text-black text-center font-semibold">
            Transaction History
          </Text>
          <Pressable
            onPress={handleRefresh}
            disabled={isRefreshing}
            className="p-2 active:opacity-70"
          >
            <RefreshCw
              size={22}
              color={isRefreshing ? "#9CA3AF" : "#4A3DFF"}
              className={isRefreshing ? "animate-spin" : ""}
            />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.transaction_hash}
        renderItem={renderTransaction}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
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
              <View className="py-6 items-center">
                <ActivityIndicator size="small" color="#4A3DFF" />
                <Text className="text-sm text-foreground-tertiary mt-3">
                  Loading more transactions...
                </Text>
              </View>
            );
          }
          if (!hasMoreData && transactions.length > 0) {
            return (
              <View className="py-6 items-center">
                <Text className="text-sm text-foreground-tertiary">
                  No more transactions
                </Text>
              </View>
            );
          }
          return null;
        }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
