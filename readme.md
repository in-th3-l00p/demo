# Panoplia - MPC-Secured Multi-Chain Wallet

Panoplia is a non-custodial web3 wallet built on **2-of-2 MPC threshold signatures** via the Vultisig SDK. Neither the user nor the server can sign alone - both key shares are required for every transaction.

This repository contains both a **web demo** and an **Electron desktop app**, both connecting to the same MPC server backend.

## Architecture

```
panoplia/
  demo/                          <-- This directory (web demo + orchestration)
    app/                         <-- React web demo (Vite + Tailwind)
    submodules/
      panoplia.mpc/              <-- MPC server (Express + SQLite + Vultisig SDK)
      panoplia.peer/             <-- On/off-ramp hooks (ZKP2P)
      panoplia.defi/             <-- DeFi swap/bridge hooks (LiFi SDK)
    tests/                       <-- Playwright E2E tests
  panoplia.app/                  <-- Electron desktop wallet app
```

### Key Components

| Component | Stack | Purpose |
|-----------|-------|---------|
| **MPC Server** | Express, SQLite, Vultisig SDK | Key generation, co-signing, vault management, social recovery |
| **Web Demo** | React 18, Vite, Tailwind, wagmi | Browser-based wallet showcasing all MPC features |
| **Desktop App** | Electron, React 19, Tailwind v4, shadcn/ui, Zustand | Native wallet with premium UI, connected to MPC server |

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### Running the Web Demo

```bash
cd demo
npm run setup        # Install dependencies & create .env files
npm run dev          # Start MPC server + web app concurrently
```

The MPC server starts on `http://localhost:3000`, web app on `http://localhost:5173`.

### Running the Electron App

```bash
cd panoplia.app
pnpm install
pnpm dev             # Starts the Electron app (connects to MPC server on :3000)
```

**Note:** The MPC server must be running first (`cd demo && npm run dev:mpc`).

### Running Tests

```bash
# MPC server unit + integration tests (107 tests)
cd demo/submodules/panoplia.mpc
npm test

# Playwright E2E tests (12 tests)
cd demo
npm test             # Requires MPC server running on :3000
```

## Features

### MPC Wallet Operations
- **Register/Login** - JWT-based auth with bcrypt password hashing
- **Create Vault** - 2-of-2 MPC key generation ceremony via Vultisig SDK
- **Send Transactions** - MPC co-signing (server + user device sign together)
- **Multi-Chain** - Ethereum, Bitcoin, Solana address derivation
- **Export/Import** - Base64 vault backup and restore

### Social Recovery (Shamir Secret Sharing)
- **Setup Guardians** - Split vault recovery key into N shares with K threshold
- **Initiate Recovery** - Start a 72-hour recovery window
- **Guardian Approval** - Guardians submit their shares via a public URL
- **Complete Recovery** - Reconstruct vault when threshold is met

### DeFi Integration
- **Token Swap** - MPC-signed swap transactions
- **Portfolio View** - Multi-token portfolio tracking
- **Token Discovery** - Browse and add new tokens

### P2P Transfers
- **Chat-Style Transfers** - Send ETH via a messaging interface
- **Contact Management** - Save and manage recipient addresses
- **Real MPC Signing** - All transfers go through MPC co-signing

## Modifications Made

### Electron App (`panoplia.app`)

**Backend Integration:**
- Rewrote `services/api-client.ts` to match actual MPC server REST API endpoints
- Created `store/auth-store.ts` (Zustand) for JWT auth state management
- Rewrote `store/wallet-store.ts` to fetch real vault data from MPC server
- Fixed API base URL from port 3001 to 3000
- Updated CSP in `index.html` to allow connections to the MPC server

**Auth Flow:**
- Created `views/Auth/index.tsx` - Login/Register form with validation
- Updated `views/SplashScreen/index.tsx` - Server health check + token validation
- Added `/auth` route to `App.tsx`

**Views Made Functional:**
- `WalletSelection` - Uses wallet store, creates real vaults via MPC keygen
- `WalletDashboard` - Displays real vault data, fetches transactions
- `Transfer` - Calls `api.signTransaction()` for MPC co-signing
- `Transfers` (P2P) - Chat transfers wired to real MPC signing
- `Security/SocialRecovery` - Full guardian setup/revoke via recovery API
- `Security/ExportWallet` - Real vault export via `api.exportVault()`
- `ImportWalletDialog` - Vault import and social recovery completion
- `DeFi/TokenSwap` - Swap button triggers MPC signing flow

**Design & Branding:**
- App title changed to "Panoplia"
- Window size set to 480x860 (mobile wallet form factor)
- Custom app icon (shield + lock, purple theme) in SVG, PNG, and ICNS formats
- Updated `electron-builder.yml` with new appId and productName
- Fixed `BalanceDisplay` default change percentage
- Removed hardcoded ENS mock from `WalletInfo`
- Updated `ActionButtons` - "Send", "Receive", "P2P", "DeFi", "Security"

**Cleanup:**
- Removed unused hook files: `use-wallet.ts`, `use-wallets.ts`, `use-balance.ts`, `use-transfer.ts`
- Removed unused service files: `wallet-service.ts`, `transaction-service.ts`, `balance-service.ts`
- Updated barrel exports in `hooks/index.ts` and `services/index.ts`

### Web Demo (`demo/app`)

**Theme Alignment:**
- Changed primary color from indigo to purple across all 15+ files
- Matches the Electron app's purple/violet design language
- Updated buttons, links, badges, gradients, spinners, and focus rings

**Features (from earlier session):**
- `GuardianSubmit` page for public guardian approval flow
- Full social recovery UI with progress tracking
- All pages connected to MPC server via API client

### Testing

**Playwright E2E Tests (12 tests, all passing):**
- `auth.spec.ts` - Login, register, validation errors, session persistence
- `wallet.spec.ts` - Empty state, wallet creation, MPC keygen flow
- `navigation.spec.ts` - Route protection, sidebar navigation, branding

### Infrastructure
- `playwright.config.ts` - Playwright configuration with Vite dev server
- `npm test` script added to demo root `package.json`

## Demo Flow (for video showcase)

1. **Start** - Launch the Electron app, splash screen connects to MPC server
2. **Register** - Create account with email/password
3. **Create Wallet** - Name the wallet, watch MPC key generation
4. **Dashboard** - View wallet with balance chart and action buttons
5. **Send Transaction** - Enter recipient, amount, and chain; watch MPC co-signing
6. **P2P Transfer** - Open chat with a contact, send ETH via the messaging interface
7. **DeFi Swap** - Select tokens and swap with MPC-signed approval
8. **Social Recovery Setup** - Add guardians with email/name and set threshold
9. **Export Vault** - Download vault backup as JSON
10. **Security** - Show the recovery configuration and guardian list

## Tech Stack

| Layer | Technology |
|-------|-----------|
| MPC | Vultisig SDK (WASM), 2-of-2 threshold |
| Recovery | Shamir Secret Sharing (Privy) |
| Backend | Express 4, SQLite, JWT, Zod |
| Web Demo | React 18, Vite, Tailwind CSS, wagmi, viem |
| Desktop | Electron 39, React 19, Tailwind v4, shadcn/ui, Zustand, motion |
| Testing | Vitest (unit), Playwright (E2E) |
