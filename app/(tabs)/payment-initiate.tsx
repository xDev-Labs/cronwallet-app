import { CoinSelectionItem } from '@/components/CoinSelectionItem';
import { CryptoIcon } from '@/components/CryptoIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TOKEN_API_URL } from '@/lib/config/environment';
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
    const { contactId } = useLocalSearchParams();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState({ name: 'Solana', symbol: 'sol', rate: 0.40 });
    const slideAnim = useRef(new Animated.Value(0)).current;

    const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState({ name: 'USD', code: 'USD', flag: 'us' });
    const currencySlideAnim = useRef(new Animated.Value(0)).current;

    const [amount, setAmount] = useState('');
    const [convertedAmount, setConvertedAmount] = useState('0.00');
    const [isLoading, setIsLoading] = useState(false);

    const coins = [
        { name: 'Solana', symbol: 'sol', rate: 0.20 },
        { name: 'USDT', symbol: 'usdt', rate: 100 },
        { name: 'USDC', symbol: 'usdc', rate: 100 }
    ];

    const currencies = [
        { name: 'US Dollar', code: 'USD', flag: 'us' },
        { name: 'Indian Rupee', code: 'INR', flag: 'in' },
        { name: 'UAE Dirham', code: 'AED', flag: 'ae' }
    ];

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

    const selectCoin = (coin: any) => {
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

    const convertAmount = async (inputAmount: string, currency: string, token: string) => {
        if (!inputAmount || parseFloat(inputAmount) === 0) {
            setConvertedAmount('0.00');
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
                `${TOKEN_API_URL}/token?from=usdc&to=${token.toLowerCase()}&amount=${usdAmount}`
            );
            const tokenData = await tokenResponse.json();
            const finalAmount = tokenData.convertedAmount || tokenData.result || '0.00';

            setConvertedAmount(parseFloat(finalAmount).toFixed(2));
        } catch (error) {
            console.error('Conversion error:', error);
            setConvertedAmount('0.00');
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced conversion effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (amount) {
                convertAmount(amount, selectedCurrency.code, selectedCoin.symbol.toLowerCase());
            } else {
                setConvertedAmount('0.00');
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [amount, selectedCurrency.code, selectedCoin.name]);

    const handlePayPress = () => {
        router.push({
            pathname: './payment-confirm' as any,
            params: { contactId, amount: amount || '0.00' },
        });
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
                            <TouchableOpacity className="p-2" onPress={() => router.push({ pathname: '/(tabs)/recipient' as any, params: { contactId } })}>
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
                                                <CryptoIcon symbol={selectedCoin.name.toLowerCase()} size={24} variant="branded" />
                                                <Text className="text-black font-medium ml-2">{selectedCoin.symbol.toUpperCase()}</Text>
                                            </View>
                                            <ChevronDown size={16} color="#000" />
                                        </TouchableOpacity>
                                    </View>
                                    <View className="w-1/3 items-end justify-center">
                                        {isLoading ? (
                                            <ActivityIndicator size="small" color="#4A3DFF" />
                                        ) : (
                                            <Text className="text-right text-[#4A3DFF] text-4xl font-bold">{convertedAmount}</Text>
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
                            <Button className='w-full' onPress={handlePayPress}>Make Transfer</Button>
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

                            {coins.map((coin, index) => (
                                <CoinSelectionItem
                                    key={index}
                                    coin={coin}
                                    amount={amount}
                                    currency={selectedCurrency.code}
                                    onPress={() => selectCoin(coin)}
                                    isSelected={selectedCoin.symbol === coin.symbol}
                                />
                            ))}
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
