import { CryptoIcon } from '@/components/CryptoIcon';
import { TOKEN_API_URL } from '@/lib/config/environment';
import { Token } from '@/lib/types/user.types';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface CoinSelectionItemProps {
    coin: Token;
    amount: string;
    currency: string;
    onPress: () => void;
    isSelected: boolean;
}

export function CoinSelectionItem({
    coin,
    amount,
    currency,
    onPress,
}: CoinSelectionItemProps) {
    const [rate, setRate] = useState<string>('0.00');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const convertToToken = async () => {
            if (!amount || parseFloat(amount) === 0) {
                setRate('0.00');
                return;
            }

            setIsLoading(true);
            try {
                let usdAmount = amount;

                // Step 1: Convert to USD if currency is not USD
                if (currency.toLowerCase() !== 'usd') {
                    const currencyResponse = await fetch(
                        `${TOKEN_API_URL}/currency?from=${currency.toLowerCase()}&to=usd&amount=${amount}`
                    );
                    const currencyData = await currencyResponse.json();
                    usdAmount = currencyData.convertedAmount || currencyData.result || amount;
                }

                // Step 2: Convert USD to token via USDC
                const tokenResponse = await fetch(
                    `${TOKEN_API_URL}/token?from=usdc&to=${coin.symbol.toLowerCase()}&amount=${usdAmount}`
                );
                const tokenData = await tokenResponse.json();
                const finalAmount = tokenData.convertedAmount || tokenData.result || '0.00';

                setRate(parseFloat(finalAmount).toFixed(2));
            } catch (error) {
                console.error(`Error converting to ${coin.symbol}:`, error);
                setRate('0.00');
            } finally {
                setIsLoading(false);
            }
        };

        // Debounce the conversion
        const timer = setTimeout(() => {
            convertToToken();
        }, 500);

        return () => clearTimeout(timer);
    }, [amount, currency, coin.symbol]);

    return (
        <TouchableOpacity
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
            onPress={onPress}
        >
            <View className="flex-row items-center flex-1">
                <CryptoIcon symbol={coin.name.toLowerCase()} size={32} variant="branded" />
                <View className="ml-3 flex-1">
                    <Text className="text-black text-base font-medium">{coin.name}</Text>
                    <Text className="text-gray-500 text-sm">
                        Balance: {coin.balance.toFixed(4)} {coin.symbol.toUpperCase()}
                    </Text>
                </View>
            </View>
            {isLoading ? (
                <ActivityIndicator size="small" color="#4A3DFF" />
            ) : amount && parseFloat(amount) > 0 ? (
                <Text className="text-[#4A3DFF] text-base font-medium">≈ {rate}</Text>
            ) : (
                <Text className="text-gray-400 text-base font-medium">-</Text>
            )}
        </TouchableOpacity>
    );
}
