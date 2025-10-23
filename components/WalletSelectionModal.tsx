import { Text } from '@/components/ui/text';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Linking,
    Modal,
    Pressable,
    View,
} from 'react-native';

interface Wallet {
    id: string;
    name: string;
    icon: any;
    deepLink: string;
    scheme: string;
}

interface WalletSelectionModalProps {
    visible: boolean;
    onClose: () => void;
}

const WALLETS: Wallet[] = [
    {
        id: 'phantom',
        name: 'Phantom',
        icon: require('@/assets/icons/phantom.png'),
        deepLink: 'https://phantom.app/ul',
        scheme: 'phantom://',
    },
    {
        id: 'backpack',
        name: 'Backpack',
        icon: require('@/assets/icons/backpack.png'),
        deepLink: 'https://backpack.app/ul',
        scheme: 'backpack-ul://',
    },
];

export const WalletSelectionModal: React.FC<WalletSelectionModalProps> = ({
    visible,
    onClose,
}) => {
    const [installedWallets, setInstalledWallets] = useState<Wallet[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (visible) {
            checkInstalledWallets();
        }
    }, [visible]);

    const checkInstalledWallets = async () => {
        setIsLoading(true);
        const installed: Wallet[] = [];

        for (const wallet of WALLETS) {
            try {
                const canOpen = await Linking.canOpenURL(wallet.deepLink);
                if (canOpen) {
                    installed.push(wallet);
                }
            } catch (error) {
                console.log(`Error checking ${wallet.name}:`, error);
            }
        }

        setInstalledWallets(installed);
        setIsLoading(false);
    };

    const handleWalletPress = (wallet: Wallet) => {
        // Ready for future implementation
        console.log(`Selected wallet: ${wallet.name}`);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50">
                <Pressable className="flex-1" onPress={onClose} />
                <View className="bg-white rounded-t-3xl pb-8">
                    {/* Header */}
                    <View className="p-6 border-b border-gray-200">
                        <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
                        <Text variant="h3" className="text-foreground-dark text-center">
                            Add Funds
                        </Text>
                    </View>

                    {/* Wallet List */}
                    <View className="px-6 pt-4">
                        {isLoading ? (
                            <View className="py-8 items-center">
                                <ActivityIndicator size="large" color="#4A3DFF" />
                                <Text className="text-gray-500 mt-4">
                                    Checking installed wallets...
                                </Text>
                            </View>
                        ) : installedWallets.length > 0 ? (
                            <View className="flex-row flex-wrap">
                                {installedWallets.map((wallet) => (
                                    <Pressable
                                        key={wallet.id}
                                        onPress={() => handleWalletPress(wallet)}
                                        className="active:opacity-70"
                                        style={{ width: '25%', marginBottom: 16 }}
                                    >
                                        <View className="items-center">
                                            <View className="w-16 h-16 bg-gray-50 rounded-2xl items-center justify-center">
                                                <Image
                                                    source={wallet.icon}
                                                    className="w-10 h-10"
                                                    resizeMode="contain"
                                                />
                                            </View>
                                        </View>
                                    </Pressable>
                                ))}
                            </View>
                        ) : (
                            <View className="py-8 items-center">
                                <Text className="text-gray-500 text-center">
                                    No supported wallets installed
                                </Text>
                                <Text className="text-gray-400 text-center mt-2 text-sm">
                                    Please install Phantom or Backpack wallet
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

