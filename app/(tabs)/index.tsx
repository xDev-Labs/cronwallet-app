import { ArrowLeftRight, DollarSign, Maximize2, MoveHorizontal as MoreHorizontal, QrCode, Search, Send } from 'lucide-react-native';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Token {
  id: string;
  name: string;
  symbol: string;
  amount: string;
  value: string;
  change: string;
  icon: string;
}

const tokens: Token[] = [
  {
    id: '1',
    name: 'Solana',
    symbol: 'SOL',
    amount: '0.32153 SOL',
    value: '$66.68',
    change: '-$1.32',
    icon: '◈',
  },
  {
    id: '2',
    name: 'Peepo',
    symbol: 'PEEP',
    amount: '1m PEEP',
    value: '$6.28',
    change: '-$0.05',
    icon: '🐸',
  },
  {
    id: '3',
    name: 'Blaze',
    symbol: 'BLZE',
    amount: '6,157.80328 BLZE',
    value: '$1.26',
    change: '-$0.05',
    icon: '🔥',
  },
  {
    id: '4',
    name: 'Bonk',
    symbol: 'Bonk',
    amount: '63,163.43798 Bonk',
    value: '$1.19',
    change: '-$0.02',
    icon: '🐕',
  },
];

export default function WalletScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.accountBadge}>
          <Text style={styles.accountBadgeText}>A1</Text>
        </View>
        <Text style={styles.accountName}>Account 1</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Maximize2 size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.balanceSection}>
          <Text style={styles.balanceAmount}>$75.48</Text>
          <View style={styles.changeContainer}>
            <Text style={styles.changeAmount}>-$1.45</Text>
            <View style={styles.changePercentBadge}>
              <Text style={styles.changePercent}>-1.89%</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <QrCode size={32} color="#8B7FFF" strokeWidth={2} />
            </View>
            <Text style={styles.actionText}>Receive</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Send size={32} color="#8B7FFF" strokeWidth={2} />
            </View>
            <Text style={styles.actionText}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <ArrowLeftRight size={32} color="#8B7FFF" strokeWidth={2} />
            </View>
            <Text style={styles.actionText}>Swap</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <DollarSign size={32} color="#8B7FFF" strokeWidth={2} />
            </View>
            <Text style={styles.actionText}>Buy</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <Text style={styles.tabActive}>Tokens</Text>
          <Text style={styles.tabInactive}>Collectibles</Text>
          <TouchableOpacity style={styles.moreButton}>
            <MoreHorizontal size={24} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <View style={styles.tokensList}>
          {tokens.map((token) => (
            <TouchableOpacity key={token.id} style={styles.tokenItem}>
              <View style={styles.tokenLeft}>
                <View style={styles.tokenIcon}>
                  <Text style={styles.tokenIconText}>{token.icon}</Text>
                </View>
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenName}>{token.name}</Text>
                  <Text style={styles.tokenAmount}>{token.amount}</Text>
                </View>
              </View>
              <View style={styles.tokenRight}>
                <Text style={styles.tokenValue}>{token.value}</Text>
                <Text style={styles.tokenChange}>{token.change}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  accountBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountBadgeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  accountName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    marginLeft: 16,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  balanceSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 64,
    fontWeight: '600',
    letterSpacing: -2,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  changeAmount: {
    color: '#FF453A',
    fontSize: 20,
    fontWeight: '500',
  },
  changePercentBadge: {
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changePercent: {
    color: '#FF453A',
    fontSize: 16,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  tabActive: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginRight: 24,
  },
  tabInactive: {
    color: '#8E8E93',
    fontSize: 28,
    fontWeight: '700',
    flex: 1,
  },
  moreButton: {
    padding: 4,
  },
  tokensList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
  },
  tokenLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tokenIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenIconText: {
    fontSize: 24,
  },
  tokenInfo: {
    marginLeft: 12,
    flex: 1,
  },
  tokenName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  tokenAmount: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '400',
  },
  tokenRight: {
    alignItems: 'flex-end',
  },
  tokenValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  tokenChange: {
    color: '#FF453A',
    fontSize: 14,
    fontWeight: '500',
  },
});
