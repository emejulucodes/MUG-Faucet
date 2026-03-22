import { getDefaultConfig } from '@rainbow-me/rainbowkit'
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
  transports: {
    [targetChain.id]: http(rpcUrl),
  },
  ssr: false,
})

export const queryClient = new QueryClient()
