# MUG Faucet Dapp

A modern Web3 faucet dashboard for claiming, transferring, and minting MUG tokens on an EVM network.

The app is built with React + Vite + TypeScript, and uses Wagmi, Viem, RainbowKit, and TanStack Query for wallet connections, contract calls, and live on-chain data.

## Features

- Wallet connection with RainbowKit.
- Network-aware UX with chain mismatch detection and switch prompt.
- Claim tokens through `requestToken()` with cooldown enforcement.
- Transfer tokens through `transfer(to, amount)` with validation.
- Owner-only mint flow through `mint(to, amount)`.
- Live stats and analytics powered by on-chain reads.
- Recent transaction feed from contract event logs.
- Add token to wallet via `wallet_watchAsset`.
- Light/dark theme toggle.

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Wagmi + Viem
- RainbowKit + WalletConnect
- TanStack Query
- Framer Motion + Lucide icons

## License

Add your preferred license here (for example: MIT).
