import { CoinSelectionItem } from '@/components/CoinSelectionItem';
import { CryptoIcon } from '@/components/CryptoIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TOKEN_API_URL } from '@/lib/config/environment';
import { useAuth } from '@/lib/contexts/AuthContext';
import { apiService } from '@/lib/services/api';
import { Token } from '@/lib/types/user.types';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronDown, ChevronLeft } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentInitiateScreen() {
    const { contactId, contactName, contactPhone, contactAvatarUrl, contactCronId, type, walletAddress } = useLocalSearchParams();
    const { user } = useAuth();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState<Token | null>(null);
    const slideAnim = useRef(new Animated.Value(0)).current;

    const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState({ name: 'USD', code: 'USD', flag: 'us' });
    const currencySlideAnim = useRef(new Animated.Value(0)).current;
    const amountInputRef = useRef<TextInput>(null);

    const [amount, setAmount] = useState('');
    const [coinAmount, setCoinAmount] = useState(0.00);
    const [isLoading, setIsLoading] = useState(false);
    const [userTokens, setUserTokens] = useState<Token[]>([]);
    const [isLoadingTokens, setIsLoadingTokens] = useState(true);
    const [hasInsufficientBalance, setHasInsufficientBalance] = useState(false);

    const currencies = [
        { name: 'US Dollar', code: 'USD', flag: 'us' },
        { name: 'Indian Rupee', code: 'INR', flag: 'in' },
        { name: 'UAE Dirham', code: 'AED', flag: 'ae' }
    ];

    // Fetch user tokens on mount
    useEffect(() => {
        const fetchUserTokens = async () => {
            if (!user?.user_id) return;

            try {
                setIsLoadingTokens(true);
                const response = await apiService.getTokensByUserId(user.user_id);

                if (response.data) {
                    let tokens = response.data.map((token: Token) => ({
                        ...token,
                        balance: token.balance / Math.pow(10, token.decimals)
                    }));
                    setUserTokens(tokens);
                    // Set default selected coin to the first token if available
                    if (tokens.length > 0 && !selectedCoin) {
                        setSelectedCoin(tokens[tokens.length - 1]);
                    }
                }
            } catch (error) {
                console.error('Error fetching tokens:', error);
            } finally {
                setIsLoadingTokens(false);
            }
        };

        fetchUserTokens();
    }, [user?.user_id]);

    const openModal = () => {
        setIsModalVisible(true);
        Animated.timing(slideAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setIsModalVisible(false);
        });
    };

    const selectCoin = (coin: Token) => {
        setSelectedCoin(coin);
        closeModal();
    };

    const openCurrencyModal = () => {
        setIsCurrencyModalVisible(true);
        Animated.timing(currencySlideAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeCurrencyModal = () => {
        Animated.timing(currencySlideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setIsCurrencyModalVisible(false);
        });
    };

    const renderAvatar = () => {
        if (contactAvatarUrl && typeof contactAvatarUrl === 'string' && contactAvatarUrl.trim()) {
            return (
                <Image
                    source={{ uri: contactAvatarUrl }}
                    className="w-12 h-12 rounded-full"
                />
            );
        }

        const name = typeof contactName === 'string' ? contactName : 'Unknown';
        const initial = name.charAt(0).toUpperCase();
        const colors = ['#E91E63', '#9C27B0', '#FF5722', '#2196F3', '#4CAF50'];
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

    const convertAmount = async (inputAmount: string, currency: string, token: Token | null) => {
        if (!inputAmount || parseFloat(inputAmount) === 0 || !token) {
            setCoinAmount(0.00);
            setHasInsufficientBalance(false);
            return;
        }

        setIsLoading(true);
        try {
            let usdAmount = inputAmount;

            // Step 1: Convert to USD if currency is not USD
            if (currency.toLowerCase() !== 'usd') {
                const currencyResponse = await fetch(
                    `${TOKEN_API_URL}/currency?from=${currency.toLowerCase()}&to=usd&amount=${inputAmount}`
                );
                const currencyData = await currencyResponse.json();
                usdAmount = currencyData.convertedAmount || currencyData.result || inputAmount;
            }

            // Step 2: Convert USD to selected token using USDC
            const tokenResponse = await fetch(
                `${TOKEN_API_URL}/token?from=usdc&to=${token.symbol.toLowerCase()}&amount=${usdAmount}`
            );
            const tokenData = await tokenResponse.json();
            const finalAmount = parseFloat(tokenData.convertedAmount || tokenData.result || '0.00');

            setCoinAmount(finalAmount);

            // Check if user has sufficient balance
            if (finalAmount > token.balance) {
                setHasInsufficientBalance(true);
            } else {
                setHasInsufficientBalance(false);
            }
        } catch (error) {
            console.error('Conversion error:', error);
            setCoinAmount(0.00);
            setHasInsufficientBalance(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced conversion effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (amount && selectedCoin) {
                convertAmount(amount, selectedCurrency.code, selectedCoin);
            } else {
                setCoinAmount(0.00);
                setHasInsufficientBalance(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [amount, selectedCurrency.code, selectedCoin]);

    // Auto-focus input when screen loads
    useEffect(() => {
        const timer = setTimeout(() => {
            amountInputRef.current?.focus();
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const numericAmount = parseFloat(amount);
    const isTransferDisabled = !amount || Number.isNaN(numericAmount) || numericAmount <= 0 || isLoading || hasInsufficientBalance || !selectedCoin;

    const handlePayPress = () => {
        if (isTransferDisabled) {
            return;
        }

        console.log("contactId", contactId);
        console.log("contactName", contactName);
        console.log("contactPhone", contactPhone);
        console.log("contactAvatarUrl", contactAvatarUrl);
        console.log("contactCronId", contactCronId);
        console.log("amount", amount);
        console.log("coinAmount", coinAmount);
        console.log("selectedCoin", selectedCoin);
        console.log("selectedCurrency", selectedCurrency);

        router.push({
            pathname: './payment-confirm' as any,
            params: {
                contactId,
                contactName,
                contactPhone,
                contactAvatarUrl,
                contactCronId,
                amount: amount || '0.00',
                coinAmount: coinAmount,
                coinDecimals: selectedCoin!.decimals,
                coinName: selectedCoin!.name,
                coinSymbol: selectedCoin!.symbol,
                coinAddress: selectedCoin!.mintAddr,
                currencyCode: selectedCurrency.code,
                currencyFlag: selectedCurrency.flag,
                type,
                walletAddress,
            },
        });
        setAmount('');
        setCoinAmount(0.00);
    };

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

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-white">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View className="flex-1">
                        {/* Header */}
                        <View className="flex-row items-center px-4 py-3">
                            <TouchableOpacity className="p-2" onPress={() => router.push({ pathname: '/(tabs)/recipient' as any, params: { contactId, contactName, contactPhone, contactAvatarUrl, contactCronId, type, walletAddress } })}>
                                <ChevronLeft size={28} color="#000" pointerEvents="none" />
                            </TouchableOpacity>
                        </View>

                        {/* Main Content */}
                        <View className="flex-1 px-4 justify-center items-center ">

                            <View className="flex items-center justify-center mb-12">
                                {renderAvatar()}
                                <View className="">
                                    <Text className="text-black text-lg font-semibold">
                                        {maskDisplayName(contactName)}
                                    </Text>
                                    {type !== "walletAddress" && type !== "solName" && (
                                        <Text className="text-foreground-secondary text-center text-sm mt-0.5">
                                            {maskPhoneNumber(contactPhone)}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {/* Recipient gets section */}
                            <View className="mb-8 flex items-center">
                                <Input
                                    ref={amountInputRef}
                                    className="border-0 h-20 text-[#4A3DFF] text-6xl font-bold bg-white text-center"
                                    placeholder="0"
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="decimal-pad"
                                />
                                <View className="flex-row items-center mt-4">
                                    <View className="">
                                        <TouchableOpacity
                                            className=" bg-gray-100 rounded-xl p-4 flex-row items-center justify-between"
                                            onPress={openModal}
                                        >
                                            <View className="flex-row items-center ">
                                                {selectedCoin && (
                                                    <>
                                                        <CryptoIcon symbol={selectedCoin.name.toLowerCase()} size={24} variant="branded" />
                                                        <Text className="text-black font-medium ml-2">{selectedCoin.symbol.toUpperCase()}</Text>
                                                    </>
                                                )}
                                            </View>
                                            <ChevronDown size={16} color="#000" />
                                        </TouchableOpacity>
                                    </View>

                                </View>
                            </View>
                        </View>

                        {/* Bottom Button */}
                        <View
                            className="flex-row justify-center p-4 gap-3 bg-white"
                            style={{
                                shadowColor: '#4A3DFF',
                                shadowOffset: { width: 0, height: -1 },
                                shadowRadius: 13.5,
                                shadowOpacity: 0.078,
                                elevation: 8
                            }}
                        >
                            <Button
                                className='w-full'
                                onPress={handlePayPress}
                                disabled={isTransferDisabled}
                            >
                                Make Transfer
                            </Button>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            {/* Coin Selection Modal */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="none"
                onRequestClose={closeModal}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <TouchableOpacity
                        className="flex-1"
                        onPress={closeModal}
                        activeOpacity={1}
                    />
                    <Animated.View
                        className="bg-white rounded-t-3xl"
                        style={{
                            transform: [{
                                translateY: slideAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [400, 0]
                                })
                            }]
                        }}
                    >
                        <View className="p-6">
                            <Text className="text-black text-xl font-bold mb-6">Select Coin</Text>

                            {isLoadingTokens ? (
                                <View className="py-8 items-center">
                                    <ActivityIndicator size="large" color="#4A3DFF" />
                                    <Text className="text-gray-500 mt-4">Loading tokens...</Text>
                                </View>
                            ) : userTokens.length === 0 ? (
                                <Text className="text-gray-500 text-center py-8">No tokens available</Text>
                            ) : (
                                userTokens.map((token) => (
                                    <CoinSelectionItem
                                        key={token.mintAddr}
                                        coin={token}
                                        amount={amount}
                                        currency={selectedCurrency.code}
                                        onPress={() => selectCoin(token)}
                                        isSelected={selectedCoin?.mintAddr === token.mintAddr}
                                    />
                                ))
                            )}
                        </View>
                    </Animated.View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}
