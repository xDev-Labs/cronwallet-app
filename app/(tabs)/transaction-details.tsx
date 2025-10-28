import { Checks } from "@/components/icons/Checks";
import { Text } from "@/components/ui/text";
import { Transaction } from "@/lib/types";
import { shortenTxnHash } from "@/lib/utils";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Copy } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TransactionDetailsScreen() {
    const params = useLocalSearchParams();
    const [transaction, setTransaction] = useState<Transaction | null>(null);

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
                Alert.alert("Copied", "Order ID copied to clipboard");
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
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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
                return "text-green-600";
            case "pending":
                return "text-yellow-600";
            case "failed":
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    };

    const getCryptoAmount = () => {
        if (transaction?.token && transaction.token.length > 0) {
            return transaction.token[0].amount;
        }
        return "0.0000000";
    };

    const getCryptoSymbol = () => {
        if (transaction?.token && transaction.token.length > 0 && transaction.token[0].token_address === "DMC3nUVXBLNrB8f97wLqwkNw9DD7EXgqhPgev8gVTv7g") {
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

    const isSent = transaction.sender_uid === params.userId;

    return (
        <SafeAreaView edges={["top"]} className="flex-1 bg-background-light">
            {/* Header */}
            <View className="flex-row items-center px-4 py-4 bg-white">
                <Pressable onPress={handleBackPress} className="mr-4">
                    <ChevronLeft size={24} color="#000" />
                </Pressable>
                <Text className="text-xl font-sans text-black">
                    Payment Details
                </Text>
            </View>

            <View className="flex-1 px-4 py-6">
                {/* Amount Section */}
                <View className="bg-white rounded-xl p-6 mb-6 border-b border-[#DDDDDD]">
                    <Text className="text-center font-sans text-base text-foreground-tertiary mb-2">
                        Amount
                    </Text>
                    <Text className="text-center text-3xl font-sans font-semibold text-foreground-dark mb-2">
                        {formatAmount(transaction.amount)}
                    </Text>
                    <Text className="text-center font-sans text-sm text-foreground-tertiary mb-4">
                        {getCryptoAmount()} {getCryptoSymbol()}
                    </Text>

                    {/* Status Badge */}
                    <View className="flex-row items-center justify-center">
                        <View className="w-4 h-4 bg-green-600 rounded-sm items-center justify-center mr-2">
                            <Checks size={12} color="white" />
                        </View>
                        <Text className={`text-sm font-medium ${getStatusColor(transaction.status)}`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </Text>
                    </View>
                </View>

                {/* Transaction Details */}
                <View className="bg-white rounded-xl p-4 ">
                    {/* To */}
                    <View className="flex-row justify-between items-center py-3">
                        <Text className="text-base text-foreground-tertiary font-sans">To</Text>
                        <Text className="text-base text-foreground-dark font-medium">
                            {transaction.receiver?.phone_number || "Unknown"}
                        </Text>
                    </View>

                    {/* Date */}
                    <View className="flex-row justify-between items-center py-3 ">
                        <Text className="text-base text-foreground-tertiary font-sans">Date</Text>
                        <Text className="text-base text-foreground-dark font-medium">
                            {formatDate(transaction.created_at)}
                        </Text>
                    </View>

                    {/* Time */}
                    <View className="flex-row justify-between items-center py-3 ">
                        <Text className="text-base text-foreground-tertiary font-sans">Time</Text>
                        <Text className="text-base text-foreground-dark font-medium">
                            {formatTime(transaction.created_at)}
                        </Text>
                    </View>

                    {/* Order ID */}
                    <View className="flex-row justify-between items-center py-3">
                        <Text className="text-base text-foreground-tertiary font-sans">Order ID</Text>
                        <View className="flex-row items-center">
                            <Text className="text-base text-foreground-dark font-medium mr-2">
                                {shortenTxnHash(transaction.transaction_hash)}
                            </Text>
                            <Pressable onPress={handleCopyOrderId}>
                                <Copy size={16} color="#6B7280" />
                            </Pressable>
                        </View>
                    </View>

                    {/* Paid with */}
                    <View className="flex-row justify-between items-center py-3">
                        <Text className="text-base text-foreground-tertiary font-sans">Paid with</Text>
                        <Text className="text-base text-foreground-dark font-medium">
                            {getCryptoAmount()} {getCryptoSymbol()}
                        </Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
