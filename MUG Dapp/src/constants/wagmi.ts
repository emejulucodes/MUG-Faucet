import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import {
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
  rainbowWallet,
  trustWallet,
  ledgerWallet,
  uniswapWallet,
  zerionWallet,
  phantomWallet,
  safeWallet,
  braveWallet,
  injectedWallet,
  frameWallet,
  okxWallet,
  binanceWallet,
  krakenWallet,
  bybitWallet,
  gateWallet,
  bitgetWallet,
  magicEdenWallet,
  rabbyWallet,
  safepalWallet,
  talismanWallet,
  coin98Wallet,
  tokenPocketWallet,
  oneKeyWallet,
  foxWallet,
  coreWallet,
  backpackWallet,
  enkryptWallet,
  argentWallet,
  mewWallet,
  imTokenWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { QueryClient } from '@tanstack/react-query'
import { defineChain, http } from 'viem'

const chainId = Number(import.meta.env.VITE_CHAIN_ID ?? 1)
const rpcUrl = import.meta.env.VITE_RPC_URL ?? 'https://rpc.ankr.com/eth_sepolia'

export const targetChain = defineChain({
  id: chainId,
  name: chainId === 4202 ? 'Lisk Sepolia' : `Chain ${chainId}`,
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [rpcUrl] },
    public: { http: [rpcUrl] },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: import.meta.env.VITE_EXPLORER_URL ?? 'https://sepolia-blockscout.lisk.com',
    },
  },
})

export const wagmiConfig = getDefaultConfig({
  appName: 'MUG Faucet',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? 'MUG_FAUCET_PROJECT_ID',
  chains: [targetChain],
  wallets: [
    {
      groupName: 'Popular',
      wallets: [
        metaMaskWallet,
        rainbowWallet,
        coinbaseWallet,
        walletConnectWallet,
        trustWallet,
        phantomWallet,
      ],
    },
    {
      groupName: 'Hardware Wallets',
      wallets: [
        ledgerWallet,
        safeWallet,
      ],
    },
    {
      groupName: 'Exchange Wallets',
      wallets: [
        binanceWallet,
        okxWallet,
        bybitWallet,
        gateWallet,
        krakenWallet,
        bitgetWallet,
      ],
    },
    {
      groupName: 'DeFi & Trading',
      wallets: [
        uniswapWallet,
        zerionWallet,
        rabbyWallet,
        magicEdenWallet,
      ],
    },
    {
      groupName: 'Other Wallets',
      wallets: [
        safepalWallet,
        talismanWallet,
        coin98Wallet,
        tokenPocketWallet,
        oneKeyWallet,
        foxWallet,
        coreWallet,
        backpackWallet,
        enkryptWallet,
        argentWallet,
        braveWallet,
        frameWallet,
        injectedWallet,
        mewWallet,
        imTokenWallet,
      ],
    },
  ],
  transports: {
    [targetChain.id]: http(rpcUrl),
  },
  ssr: false,
})

export const queryClient = new QueryClient()
