# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cron Wallet App** - A React Native payment application built with Expo Router that integrates with Solana blockchain. The app handles phone-based authentication, passcode security, Face ID/biometric authentication, and peer-to-peer payments.

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

- **`/app/index.tsx`** - Splash screen, navigates to auth
- **`/app/(auth)/`** - Authentication flow (phone → OTP → create passcode → confirm passcode)
- **`/app/(tabs)/`** - Main app screens after authentication (payment home, contacts, payment flows)
- **`/app/_layout.tsx`** - Root layout with navigation theme provider

Routes use parentheses `(auth)` and `(tabs)` for route groups without affecting URL structure.

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

### Authentication Flow
1. Phone number entry (`phone-auth.tsx`)
2. OTP verification (`otp-verification.tsx`) - accepts "1234" for testing
3. Create 4-digit passcode (`create-passcode.tsx`)
4. Confirm passcode (`confirm-passcode.tsx`)
5. Navigate to main app (`/(tabs)`)

### Biometric Authentication
Uses `expo-local-authentication` for Face ID/fingerprint on payment confirmation screen.

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

## Blockchain Integration

- Solana Web3.js (`@solana/web3.js`) and SPL Token libraries included
- Payment transaction logic to be implemented
- Mock data currently in `/data/mockData.ts`

## Testing Credentials

- **OTP Code**: `1234` (hardcoded for development)
- **Mock contacts**: Defined in `/data/mockData.ts`
