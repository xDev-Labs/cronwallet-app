import { SvgXml } from 'react-native-svg';
import { TokenBrandedSOL, TokenBrandedUSDT, TokenBrandedUSDC } from '@web3icons/core';

interface CryptoIconProps {
  symbol: string;
  size?: number;
  variant?: 'mono' | 'branded';
}

// Map of crypto symbols to their SVG content from @web3icons/core
const iconMap: Record<string, any> = {
  'solana': TokenBrandedSOL,
  'usdt': TokenBrandedUSDT,
  'usdc': TokenBrandedUSDC,
};

export const CryptoIcon = ({ symbol, size = 24 }: CryptoIconProps) => {
  const iconModule = iconMap[symbol.toLowerCase()];

  if (!iconModule?.default) {
    console.warn(`Icon not found for symbol: ${symbol}`);
    return null;
  }

  return (
    <SvgXml
      xml={iconModule.default}
      width={size}
      height={size}
    />
  );
};
