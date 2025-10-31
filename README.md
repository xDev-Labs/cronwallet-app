<div align="center">
  <img src="./assets/images/icon.png" alt="Cron Logo" width="120" height="120">

  # CRON

  **Where crypto finally feels like payments**

  [![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)](https://expo.dev)
  [![Built with Expo](https://img.shields.io/badge/Built%20with-Expo-000020.svg?style=flat&logo=expo)](https://expo.dev)
  [![Solana](https://img.shields.io/badge/Blockchain-Solana-9945FF.svg?style=flat&logo=solana)](https://solana.com)
</div>

---

## Overview

Cron is a payments-first smart wallet built on Solana. Send crypto using phone numbers or @CronID — no wallet addresses, no typos, no lost funds. Simple, secure peer-to-peer payments powered by account abstraction and social recovery.


## Key Features

- **Pay with Phone Numbers/CronID** — No more copying wallet addresses
- **Social Recovery** — Trusted guardians protect your wallet
- **Multi-Token Support** — SOL, USDT, USDC with live fiat conversion (USD, INR, AED)
- **Biometric Security** — Face ID/fingerprint for payment confirmations
- **Account Abstraction** — No seed phrases to manage
-  **Zero Transaction Fees** — We've eliminated fees and complexity for a gasless experience

## Tech Stack

- **Frontend:** React Native, Expo Router v6, NativeWind v4 (Tailwind CSS), TypeScript
- **Backend:** Firebase Auth (OTP), NestJS Backend, Token Price API
- **Security:** Biometrics (expo-local-authentication), Secure Storage (expo-secure-store)

## Project Structure

```
app/
├── (auth)/         # Phone → OTP → Passcode flow
├── (onboarding)/   # Username → Avatar → Setup
└── (tabs)/         # Home, Contacts, History, Profile, Payment flows

components/
├── ui/             # Button, Input, Text, Card (NativeWind styled)
└── CodeInput.tsx   # OTP/Passcode input

lib/
├── contexts/       # AuthContext (global state)
├── services/       # API services (backend, token conversion)
├── types/          # TypeScript definitions
└── utils.ts        # Helper functions (cn)
```

**Flows:**
- Auth: `OTP Verification → Biometric Registration`
- Onboarding: `Cron ID Setup → Wallet Generation`
- Payment: `Pay Anyone → Phone/Cron ID/.sol/Address → Pay`

## Getting Started

### Installation

```bash
# Clone repository
git clone https://github.com/xDev-Labs/cronwallet-app.git
cd cronwallet-app

# Install dependencies 
bun install

# Copy the example environment variables and set your own values
cp .env.example .env
# Open the .env file and replace values as needed (Base URLs, RPC URL)


# Prebuild the app
bunx expo prebuild

# Run on platform
bunx expo run:ios       # iOS 
bunx expo run:android   # Android 
```

## API Endpoints

**Backend API** (`lib/services/api.ts`)
- `POST /user` — Create user
- `GET /user/:userId` — Get user
- `GET /user/cron-id/check/:cronId` — Check username
- `POST /user/cron-id/register` — Register CronID
- `PATCH /user/:userId` — Update profile

**Token Conversion API**
- `GET /currency?from={currency}&to=usd&amount={amount}` — Fiat conversion
- `GET /token?from=usdc&to={token}&amount={usdAmount}` — Token conversion

## Related Repositories

| Repository | Description | Link |
|------------|-------------|------|
| **Backend API** | NestJS Backend for user and transaction management, CronID registry, authentication | [xDev-Labs/cron-backend](https://github.com/xDev-Labs/cron-backend) |
| **Smart Contracts** | Solana programs for smart wallet, social recovery, session keys | [xDev-Labs/cron-wallet-program](https://github.com/xDev-Labs/cron-wallet-program) |
| **Token Price API** | Real-time crypto/fiat currency conversion service | [xDev-Labs/token-price-api](https://github.com/xDev-Labs/token-price-api) |


---

<div align="center">

**Built with ❤️ by the Cron team**

Making crypto payments as simple as they should be.

</div>
