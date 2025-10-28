import { CryptoIcon } from '@/components/CryptoIcon';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TOKEN_API_URL } from '@/lib/config/environment';
import { useAuth } from '@/lib/contexts/AuthContext';
import { apiService } from '@/lib/services/api';
import { Token } from '@/lib/types/user.types';
import { cn } from '@/lib/utils';
import * as LocalAuthentication from 'expo-local-authentication';
import { router, useFocusEffect } from 'expo-router';
import { ChevronLeft, Eye, EyeOff, RefreshCw, Wallet } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BalanceScreen() {
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [balancesHidden, setBalancesHidden] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [balances, setBalances] = useState<Token[]>([]);
  const [tokenUSDValues, setTokenUSDValues] = useState<Record<string, number>>({});
  const [totalValueUSD, setTotalValueUSD] = useState(0);

  // Re-authenticate every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reset authentication state
      setIsAuthenticated(false);
      setIsAuthenticating(false);

      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        if (user?.face_id_enabled) {
          authenticateUser();
        } else {
          setIsAuthenticated(true);
        }
      }, 100);

      return () => clearTimeout(timer);
    }, [user?.face_id_enabled])
  );

  const authenticateUser = async () => {
    try {
      setIsAuthenticating(true);
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        setIsAuthenticated(true);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to view balance',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        setIsAuthenticated(true);
      } else {
        router.back();
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      router.back();
    } finally {
      setIsAuthenticating(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTokens();
    setRefreshing(false);
  };

  const formatValue = (value: number, decimals: number = 2) => {
    if (balancesHidden) return '****';
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const convertTokenToUSD = async (token: Token): Promise<number> => {
    try {
      const tokenAmount = token.balance / Math.pow(10, token.decimals);
      
      if (tokenAmount === 0) return 0;

      // Convert token to USDC (which is 1:1 with USD)
      const response = await fetch(
        `${TOKEN_API_URL}/token?from=${token.symbol.toLowerCase()}&to=usdc&amount=${tokenAmount}`
      );
      const data = await response.json();
      
      return parseFloat(data.convertedAmount || data.result || '0');
    } catch (error) {
      console.error(`Error converting ${token.symbol} to USD:`, error);
      return 0;
    }
  };

  const loadTokens = async () => {
    let tokens = await apiService.getTokensByUserId(user?.user_id as string);
    if (tokens.success && tokens.data) {
      setBalances(tokens.data);
      
      // Calculate USD values for all tokens in parallel
      const usdValuePromises = tokens.data.map(async (token) => {
        const usdValue = await convertTokenToUSD(token);
        return { mintAddr: token.mintAddr, usdValue };
      });
      
      const usdValues = await Promise.all(usdValuePromises);
      
      // Create a map of token address to USD value
      const usdValueMap: Record<string, number> = {};
      let totalUSD = 0;
      
      usdValues.forEach(({ mintAddr, usdValue }) => {
        usdValueMap[mintAddr] = usdValue;
        totalUSD += usdValue;
      });
      
      setTokenUSDValues(usdValueMap);
      setTotalValueUSD(totalUSD);
    }
  }

  useEffect(() => {
    if (user?.user_id && isAuthenticated) {
      loadTokens();
    }
  }, [user?.user_id, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticating) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.timing(opacityAnim, {
        toValue: 1,
        delay: 200,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [isAuthenticating]);

  if (!isAuthenticated || isAuthenticating) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6">
            <Wallet size={40} color="#4A3DFF" />
          </View>
          <Text variant="h2" className="text-center mb-4 text-foreground-dark">Authentication Required</Text>
          <Text className="text-gray-500 text-center mb-8">
            Please authenticate to view your balance
          </Text>
          <Button onPress={authenticateUser} variant="default" size="lg" className="w-full max-w-xs">
            <Text className="text-white font-semibold">Try Again</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="">
        <View className="flex-row items-center px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="p-2 -ml-2 active:opacity-70"
          >
            <ChevronLeft size={24} color="#000" />
          </Pressable>
          <Text variant="h3" className="flex-1 text-black text-center mr-8 font-semibold">Wallet Balance</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4A3DFF"]} tintColor="#4A3DFF" />
        }
      >
        <View className="px-4 py-6">

          <View className="bg-primary flex-row justify-between  rounded-3xl p-6 mb-8 shadow-lg" style={{
            shadowColor: '#4A3DFF',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 8,
          }}>
            <View>
              <Text className="text-white/80 mb-2 text-sm font-medium">Total Portfolio Value</Text>
              <Text variant="h1" className="text-white font-bold">
                ${formatValue(totalValueUSD)}
              </Text>
              <Text className="text-white/60 mt-1">
                ≈ ₹{formatValue(totalValueUSD * 83.50)}
              </Text>
            </View>

            <View className="flex-row items-center justify-end gap-2">
              <Pressable
                className="p-2 active:opacity-70"
                onPress={() => setBalancesHidden(!balancesHidden)}
              >
                {balancesHidden ? (
                  <EyeOff size={22} color="#FFFFFF" />
                ) : (
                  <Eye size={22} color="#FFFFFF" />
                )}
              </Pressable>
              <Pressable
                className="p-2 active:opacity-70"
                onPress={onRefresh}
              >
                <RefreshCw size={22} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          <Text variant="h4" className="mb-4 font-semibold text-foreground-dark">Your Assets</Text>

          {balances.map((token, index) => (
            <View
              key={token.symbol}
              className={cn(
                'bg-white rounded-2xl p-4 mb-3 shadow-sm',
                index === balances.length - 1 && 'mb-0'
              )}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-15 h-15 items-center justify-center">
                    <CryptoIcon symbol={token.name.toLowerCase()} size={32} variant="branded" />
                  </View>
                  <View>
                    <Text className="font-semibold text-foreground-dark">{token.name}</Text>
                    <Text className="text-gray-500 text-sm">
                      {token.symbol}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="font-semibold text-foreground-dark">
                    {formatValue(token.balance / Math.pow(10, token.decimals), 4)} {token.symbol}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    ${formatValue(tokenUSDValues[token.mintAddr] || 0)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}