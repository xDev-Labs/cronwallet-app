# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cron Wallet App** - A React Native payment application built with Expo Router that integrates with Solana blockchain. The app handles phone-based authentication with Firebase, username/avatar onboarding, passcode security, Face ID/biometric authentication, and peer-to-peer crypto payments with live currency conversion.

## Development Commands

This project uses **Bun** as the package manager (not npm/yarn).

```bash
# Install dependencies
bun install

# Start development server
bun start
# or
expo start

# Run on specific platforms
bun run ios          # iOS simulator
bun run android      # Android emulator
bun run web          # Web browser

# Linting
bun run lint
```

## Architecture

### Routing Structure (Expo Router v6)
File-based routing using Expo Router with typed routes enabled:

- **`/app/index.tsx`** - Splash screen with authentication routing logic
- **`/app/(auth)/`** - Authentication flow (phone → OTP → create passcode → confirm passcode)
- **`/app/(onboarding)/`** - Onboarding flow (username → avatar → setting-up)
- **`/app/(tabs)/`** - Main app screens after authentication (payment home, contacts, payment flows)
- **`/app/_layout.tsx`** - Root layout with AuthProvider and navigation theme

Routes use parentheses `(auth)`, `(onboarding)`, and `(tabs)` for route groups without affecting URL structure.

**Flow Sequence:**
1. Auth: phone-auth → otp-verification → create-passcode → confirm-passcode
2. Onboarding: username → avatar → setting-up
3. Main app: (tabs)

### Styling System - NativeWind v4

**CRITICAL**: This project uses NativeWind (Tailwind CSS for React Native) exclusively. **Never use `StyleSheet.create()`** - all styling must use `className` props with Tailwind classes.

**Configuration Files:**
- `tailwind.config.js` - Design tokens and theme configuration
- `babel.config.js` - NativeWind babel preset
- `metro.config.js` - Configured with `withNativeWind()` wrapper
- `app/global.css` - Tailwind directives

**Design Tokens** (defined in `tailwind.config.js`):
```javascript
// Colors
primary: '#4A3DFF'           // Main brand color
secondary: '#0f3460'         // Secondary actions
accent: '#1565C0'            // Accent/highlights
error: '#e94560'             // Error states
background: '#000000'        // Main background
background-secondary: '#1a1a2e'
background-tertiary: '#2a2a3e'
foreground: '#FFFFFF'        // Text color
foreground-secondary: '#8E8E93'
```

**Utility Function:**
- Use `cn()` from `@/lib/utils` to merge Tailwind classes conditionally
- Example: `className={cn('base-classes', condition && 'conditional-classes')}`

### Component Library

**UI Components** (`/components/ui/`):
- All use `className` props and NativeWind
- Built with `class-variance-authority` for variants
- Components: Button, Input, Text, Card, Avatar, Badge

**Custom Components:**
- `CodeInput.tsx` - OTP/passcode input with auto-focus
- `haptic-tab.tsx` - Tab bar with haptic feedback

**Component Patterns:**
```tsx
// Always use the custom Text component from /components/ui/text
import { Text } from '@/components/ui/text';

// Text variants: h1, h2, h3, h4, body, caption, muted
<Text variant="h2">Title</Text>
<Text variant="caption" className="text-foreground-secondary">Subtitle</Text>

// Button variants: default, secondary, outline, ghost, destructive
<Button variant="secondary" size="lg">Submit</Button>
```

### Type System

**Centralized in `/lib/types/`:**
- `auth.types.ts` - Authentication related types
- `payment.types.ts` - Payment, contacts, transactions
- `common.types.ts` - Shared utility types
- `index.ts` - Re-exports all types

**Import Convention:**
```typescript
import { User, Contact, Transaction } from '@/lib/types';
```

### Folder Structure

```
/app/                  # Expo Router screens
  /(auth)/            # Auth flow screens
  /(tabs)/            # Main app screens
  _layout.tsx         # Root layout
  index.tsx           # Splash screen

/components/
  /ui/                # Reusable UI components (Button, Input, etc.)
  CodeInput.tsx       # Custom components
  haptic-tab.tsx

/lib/
  /constants/         # App constants (theme.ts)
  /types/             # TypeScript type definitions
  utils.ts            # Utility functions (cn)

/data/                # Mock data for development
/hooks/               # Custom React hooks
/assets/              # Images, fonts, etc.
```

## Key Technical Patterns

### Input Validation
Phone numbers and passcodes require digit-only validation:

```typescript
const handlePhoneNumberChange = (text: string) => {
  // Only allow digits - strip everything else
  const digitsOnly = text.replace(/[^0-9]/g, '');
  setPhoneNumber(digitsOnly);
};

// Use keyboardType="phone-pad" for number inputs
<Input
  keyboardType="phone-pad"
  onChangeText={handlePhoneNumberChange}
  maxLength={10}
/>
```

### Authentication & State Management

**AuthContext** (`/lib/contexts/AuthContext.tsx`) - Global authentication state:
- Manages user session with `expo-secure-store`
- Provides: `user`, `isAuthenticated`, `isLoading`, `isBiometricAuthenticated`
- Methods: `saveUser()`, `updateUserProfile()`, `completeOnboarding()`, `logout()`, `setBiometricAuthenticated()`
- User data persists across app restarts
- Biometric auth is session-based (not persisted)

**Authentication Flow:**
1. Firebase phone authentication via SMS OTP
2. Backend user creation/retrieval (`apiService.createUser()`)
3. Local passcode setup (4-digit PIN stored in secure storage)
4. Onboarding: Username availability check → Avatar selection → Account setup
5. Main app with biometric authentication for payments

**API Service** (`/lib/services/api.ts`):
- Singleton pattern with timeout handling (10s)
- Base URL from environment: `EXPO_PUBLIC_API_BASE_URL`
- Endpoints: `createUser`, `getUserById`, `checkCronIdAvailability`, `registerCronId`, `updateUser`
- Custom `ApiError` class for error handling
- User mapping: Backend format → Frontend format (`mapBackendUserToUser()`)

### Biometric Authentication
Uses `expo-local-authentication` for Face ID/fingerprint on payment confirmation screen. State is session-based and cleared on app restart.

### Navigation
```typescript
import { router } from 'expo-router';

// Navigate with type safety
router.push('/(tabs)/contacts');
router.replace('/(auth)/phone-auth');

// Navigate with params
router.push({
  pathname: './recipient',
  params: { contactId: '123' }
});
```

## Important Constraints

1. **No StyleSheet.create()** - Use NativeWind className only
2. **Use Bun, not npm** - All package management via `bun` commands
3. **Strict TypeScript** - `tsconfig.json` has strict rules enabled
4. **Import paths** - Always use `@/*` alias (configured in tsconfig.json)
5. **SafeAreaView** - Prefer `SafeAreaView` from `react-native-safe-area-context`, not `react-native`

### Payment & Currency Conversion

**Live Token Conversion** (`payment-initiate.tsx`):
- Token API base URL: `EXPO_PUBLIC_TOKEN_API_URL` (from environment)
- Conversion flow: Currency → USD → Token (via USDC)
- 500ms debounce on amount input to reduce API calls
- Parallel conversion for all tokens in modal using `Promise.all()`
- Endpoints:
  - `/currency?from={currency}&to=usd&amount={amount}` - Currency conversion
  - `/token?from=usdc&to={token}&amount={usdAmount}` - Token conversion
- Supported currencies: USD, INR, AED
- Supported tokens: SOL, USDT, USDC
- Error handling: Shows "0.00" on API failure

**Pattern for API calls:**
```typescript
// Step 1: Convert currency to USD (if not USD)
const currencyResponse = await fetch(`${TOKEN_API_URL}/currency?from=inr&to=usd&amount=100`);

// Step 2: Convert USD to token via USDC
const tokenResponse = await fetch(`${TOKEN_API_URL}/token?from=usdc&to=sol&amount=100`);
```

## Blockchain Integration

- Solana Web3.js (`@solana/web3.js`) and SPL Token libraries included
- Payment transaction logic to be implemented
- Crypto icons from `@web3icons/core` with CryptoIcon component

## Environment Variables

Required in `.env` or Expo environment:
- `EXPO_PUBLIC_API_BASE_URL` - Backend API base URL
- `EXPO_PUBLIC_TOKEN_API_URL` - Token conversion API URL

## Testing Credentials

- **OTP Code**: `1234` (hardcoded for development in Firebase)
- **Username**: Must be unique, checked against backend via `/user/cron-id/check/{cronId}`
