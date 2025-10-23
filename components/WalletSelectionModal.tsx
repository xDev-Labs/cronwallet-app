import { Text } from "@/components/ui/text";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Pressable,
  View,
} from "react-native";

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

// Dummy wallet address for testing
const DUMMY_WALLET_ADDRESS = "3DPRv8DgXhDvAge2WJuub3ZXnkdCPmxp2HSVJKTCJ7LW";

const WALLETS: Wallet[] = [
  {
    id: "phantom",
    name: "Phantom",
    icon: require("@/assets/icons/phantom.png"),
    deepLink: "https://phantom.app/ul",
    scheme: "phantom://",
  },
  {
    id: "backpack",
    name: "Backpack",
    icon: require("@/assets/icons/backpack.png"),
    deepLink: "https://backpack.app/ul",
    scheme: "backpack-ul://",
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
        // Use a more reliable detection method
        const isInstalled = await checkIfWalletIsInstalled(wallet);
        if (isInstalled) {
          installed.push(wallet);
        }
      } catch (error) {
        console.log(`Error checking ${wallet.name}:`, error);
      }
    }

    setInstalledWallets(installed);
    setIsLoading(false);
  };

  const checkIfWalletIsInstalled = async (wallet: Wallet): Promise<boolean> => {
    try {
      // Check if the scheme can be opened
      const canOpen = await Linking.canOpenURL(wallet.scheme);
      return canOpen;
    } catch (error) {
      console.log(`Error checking ${wallet.name}:`, error);
      return false;
    }
  };

  const handleWalletPress = async (wallet: Wallet) => {
    try {
      // Try to open the wallet app first with the pre-filled address
      const canOpen = await Linking.canOpenURL(wallet.scheme);
      if (canOpen) {
        // Create deep link with the wallet address pre-filled
        const deepLinkWithAddress = `solana:${DUMMY_WALLET_ADDRESS}`;
        console.log(
          `Opening ${wallet.name} with deep link:`,
          deepLinkWithAddress
        );
        await Linking.openURL(deepLinkWithAddress);
      } else {
        // If the app is not installed, open the app store
        await Linking.openURL(wallet.deepLink);
      }
    } catch (error) {
      console.log(`Error opening ${wallet.name}:`, error);
      // Fallback to deep link
      try {
        await Linking.openURL(wallet.deepLink);
      } catch (fallbackError) {
        console.log(`Fallback error for ${wallet.name}:`, fallbackError);
      }
    }
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
              <View className="flex-row justify-center">
                {installedWallets.map((wallet, index) => (
                  <Pressable
                    key={wallet.id}
                    onPress={() => handleWalletPress(wallet)}
                    className="bg-gray-50 rounded-xl p-4 items-center active:opacity-70"
                    style={{
                      width: 120,
                      marginLeft: index > 0 ? 12 : 0,
                    }}
                  >
                    <View className="w-12 h-12 mb-2 items-center justify-center">
                      <Image
                        source={wallet.icon}
                        className="w-8 h-8"
                        resizeMode="contain"
                      />
                    </View>
                    <Text className="font-medium text-gray-900 text-center text-sm">
                      {wallet.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View className="py-8 items-center">
                <Text className="text-gray-500 text-center">
                  Install a supported wallet to add funds
                </Text>
                <Text className="text-gray-400 text-center mt-2 text-sm">
                  Download Phantom or Backpack wallet from your app store
                </Text>
                <View className="mt-6 flex-row justify-center">
                  {WALLETS.map((wallet, index) => (
                    <Pressable
                      key={wallet.id}
                      onPress={() => handleWalletPress(wallet)}
                      className="bg-gray-50 rounded-xl p-4 items-center"
                      style={{
                        width: 120,
                        marginLeft: index > 0 ? 12 : 0,
                      }}
                    >
                      <View className="w-12 h-12 mb-2 items-center justify-center">
                        <Image
                          source={wallet.icon}
                          className="w-8 h-8"
                          resizeMode="contain"
                        />
                      </View>
                      <Text className="font-medium text-gray-900 text-center text-sm">
                        {wallet.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
