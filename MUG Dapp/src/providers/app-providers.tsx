import { QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import { Toaster } from 'react-hot-toast'
import { WagmiProvider } from 'wagmi'
import type { PropsWithChildren } from 'react'
import { queryClient, targetChain, wagmiConfig } from '../constants/wagmi'
import { ThemeProvider, useTheme } from './theme-provider'

const ProvidersWithTheme = ({ children }: PropsWithChildren) => {
  const { theme } = useTheme()

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          theme={
            theme === 'light'
              ? lightTheme({ accentColor: 'hsl(224 77% 57%)', borderRadius: 'medium' })
              : darkTheme({ accentColor: 'hsl(224 77% 57%)', borderRadius: 'medium' })
          }
          initialChain={targetChain}
        >
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: theme === 'light' ? '#ffffff' : '#111827',
                color: theme === 'light' ? '#0f172a' : '#f8fafc',
                border: `1px solid ${theme === 'light' ? '#e2e8f0' : '#1f2937'}`,
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider>
      <ProvidersWithTheme>{children}</ProvidersWithTheme>
    </ThemeProvider>
  )
}
