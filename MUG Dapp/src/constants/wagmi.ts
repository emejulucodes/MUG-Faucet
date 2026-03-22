import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { QueryClient } from '@tanstack/react-query'
import { defineChain, http } from 'viem'

const chainId = Number(import.meta.env.VITE_CHAIN_ID ?? 1)
const rpcUrl = import.meta.env.VITE_RPC_URL ?? 'https://rpc.ankr.com/eth_sepolia'
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? 'MUG_FAUCET_PROJECT_ID'

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

const networks = [targetChain] as [typeof targetChain]

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  ssr: false,
  transports: {
    [targetChain.id]: http(rpcUrl),
  },
})

export const wagmiConfig = wagmiAdapter.wagmiConfig

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: targetChain,
  metadata: {
    name: 'MUG Faucet',
    description: 'MUG token faucet and dashboard',
    url: import.meta.env.VITE_APP_URL ?? 'http://localhost:5173',
    icons: ['https://avatars.githubusercontent.com/u/179229932'],
  },
})

export const queryClient = new QueryClient()
