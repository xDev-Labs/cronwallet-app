import { CryptoIcon } from '@/components/CryptoIcon';
import { Token } from '@/lib/types/user.types';
import { Text, TouchableOpacity, View } from 'react-native';

interface CoinSelectionItemProps {
    coin: Token;
    onPress: () => void;
    isSelected: boolean;
}

export function CoinSelectionItem({
    coin,
    onPress,
}: CoinSelectionItemProps) {


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
        </TouchableOpacity>
    );
}
