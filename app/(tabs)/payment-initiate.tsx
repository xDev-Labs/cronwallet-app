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

    const [amount, setAmount] = useState('0.00');
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
                        setSelectedCoin(tokens[0]);
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

    const selectCurrency = (currency: any) => {
        setSelectedCurrency(currency);
        closeCurrencyModal();
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
                        <View className="flex-1 px-4">
                            {/* You send exactly section */}
                            <View className="mb-8">
                                <Text className="font-sans text-black text-base mb-3">You send exactly</Text>
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-1 mr-4">
                                        <TouchableOpacity
                                            className="w-2/3 bg-gray-100 rounded-xl p-4 flex-row items-center justify-between"
                                            onPress={openCurrencyModal}
                                        >
                                            <View className="flex-row items-center">
                                                <Image
                                                    source={{ uri: `https://flagcdn.com/w20/${selectedCurrency.flag}.png` }}
                                                    className="w-6 h-4 mr-2"
                                                />
                                                <Text className="text-black font-medium">{selectedCurrency.code}</Text>
                                            </View>
                                            <ChevronDown size={16} color="#000" />
                                        </TouchableOpacity>
                                    </View>
                                    <Input
                                        className="w-1/3 text-right text-[#4A3DFF] text-4xl font-bold bg-white border-0"
                                        placeholder="0.00"
                                        value={amount}
                                        onChangeText={setAmount}
                                        keyboardType="decimal-pad"
                                    />
                                </View>
                                {hasInsufficientBalance && selectedCoin && (
                                    <Text className=" font-sans text-red-500 text-sm text-right mt-2">
                                        Insufficient balance (Available: {(selectedCoin.balance)} {selectedCoin.symbol.toUpperCase()})
                                    </Text>
                                )}
                            </View>

                            {/* Recipient gets section */}
                            <View className="mb-8">
                                <Text className="text-black font-sans text-base mb-3">Recipient gets</Text>
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-1 mr-4">
                                        <TouchableOpacity
                                            className="w-2/3 bg-gray-100 rounded-xl p-4 flex-row items-center justify-between"
                                            onPress={openModal}
                                        >
                                            <View className="flex-row items-center">
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
                                    <View className="w-1/3 items-end justify-center">
                                        {isLoading ? (
                                            <ActivityIndicator size="small" color="#4A3DFF" />
                                        ) : (
                                            <Text className="text-right text-[#4A3DFF] text-4xl font-bold">{coinAmount.toFixed(2)}</Text>
                                        )}
                                    </View>
                                </View>
                            </View>

                            {/* Estimated fees section */}
                            <View className="border-2 border-dashed border-green-500 rounded-xl p-4 mb-8">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-1">
                                        <View className="flex-row items-center mb-2">
                                            <View className="w-5 h-5 bg-black rounded items-center justify-center mr-2">
                                                <Text className="text-white text-xs">$</Text>
                                            </View>
                                            <Text className="font-sans text-gray-500 text-sm">Estimated fees</Text>
                                        </View>
                                        <Text className="font-sans text-black text-sm">Included in USD amount:</Text>
                                    </View>
                                    <Text className="text-green-500 font-bold text-lg">FREE</Text>
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
                                userTokens.map((token, index) => (
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

            {/* Currency Selection Modal */}
            <Modal
                visible={isCurrencyModalVisible}
                transparent={true}
                animationType="none"
                onRequestClose={closeCurrencyModal}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <TouchableOpacity
                        className="flex-1"
                        onPress={closeCurrencyModal}
                        activeOpacity={1}
                    />
                    <Animated.View
                        className="bg-white rounded-t-3xl"
                        style={{
                            transform: [{
                                translateY: currencySlideAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [400, 0]
                                })
                            }]
                        }}
                    >
                        <View className="p-6">
                            <Text className="text-black text-xl font-bold mb-6">Select Currency</Text>

                            {currencies.map((currency, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className="flex-row items-center justify-between py-4 border-b border-gray-100"
                                    onPress={() => selectCurrency(currency)}
                                >
                                    <View className="flex-row items-center">
                                        <Image
                                            source={{ uri: `https://flagcdn.com/w40/${currency.flag}.png` }}
                                            className="w-8 h-6 mr-3"
                                        />
                                        <View>
                                            <Text className="text-black text-base font-medium">{currency.code}</Text>
                                            <Text className="text-gray-500 text-sm">{currency.name}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
