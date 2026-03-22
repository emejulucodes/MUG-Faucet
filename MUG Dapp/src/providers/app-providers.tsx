import { QueryClientProvider } from '@tanstack/react-query'
import { useAppKitTheme } from '@reown/appkit/react'
import { Toaster } from 'react-hot-toast'
import { WagmiProvider } from 'wagmi'
import { useEffect, type PropsWithChildren } from 'react'
import { queryClient, wagmiConfig } from '../constants/wagmi'
import { ThemeProvider, useTheme } from './theme-provider'

const ProvidersWithTheme = ({ children }: PropsWithChildren) => {
  const { theme } = useTheme()
  const { setThemeMode } = useAppKitTheme()

  useEffect(() => {
    setThemeMode(theme)
  }, [setThemeMode, theme])

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
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
