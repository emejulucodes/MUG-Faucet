import { useQueryClient } from '@tanstack/react-query'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Coins, Copy, ExternalLink, Github, Loader2, Moon, Radio, Send, ShieldCheck, Sun, TrendingDown, TrendingUp, Users, Wallet, Zap } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { parseUnits } from 'viem'
import { useAccount, usePublicClient, useSwitchChain, useWalletClient, useWriteContract } from 'wagmi'
import logo from '../assets/logo.png'
import { AnalyticsSection } from '../components/dashboard/AnalyticsSection'
import { LiveActivityFeed } from '../components/dashboard/LiveActivityFeed'
import { RecentTransactionsTable } from '../components/dashboard/RecentTransactionsTable'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../constants/contract'
import { targetChain } from '../constants/wagmi'
import { useFaucetData } from '../hooks/web3/use-faucet-data'
import { useTheme } from '../providers/theme-provider'
import type { FaucetTx } from '../types/faucet'
import { formatToken, shortenAddress } from '../utils/format'

const explorerUrl = targetChain.blockExplorers?.default.url ?? ''
const TREND_WINDOW_SECONDS = 24 * 60 * 60

const calculatePercentChange = (current: number, previous: number) => {
  if (previous === 0) return current === 0 ? 0 : 100
  return ((current - previous) / Math.abs(previous)) * 100
}

const formatTrendPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`

type StatValueProps = {
  value: number
  format?: (value: number) => string
}

const StatValue = ({ value, format = (next) => Math.round(next).toLocaleString() }: StatValueProps) => {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const start = display
    const duration = 700
    const startedAt = performance.now()
    let rafId = 0

    const step = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration)
      const eased = 1 - (1 - progress) ** 3
      setDisplay(start + (value - start) * eased)
      if (progress < 1) {
        rafId = requestAnimationFrame(step)
      }
    }

    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
    // display keeps the previous rendered value for smooth transitions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const displayText = format(display)
  const finalText = format(value)

  return (
    <span className="relative inline-block whitespace-nowrap tabular-nums">
      <span className="invisible">{finalText}</span>
      <span className="absolute inset-0">{displayText}</span>
    </span>
  )
}

const LoadingDots = () => {
  const [dotCount, setDotCount] = useState(1)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setDotCount((current) => (current % 3) + 1)
    }, 350)

    return () => window.clearInterval(intervalId)
  }, [])

  return <span>{'.'.repeat(dotCount)}</span>
}

export const FaucetPage = () => {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient({ chainId: targetChain.id })
  const { data: walletClient } = useWalletClient()
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync } = useWriteContract()
  const { theme, toggleTheme } = useTheme()
  const queryClient = useQueryClient()
  const { faucet, txQuery, countdown } = useFaucetData()

  const [isClaimPending, setIsClaimPending] = useState(false)
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>()
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | undefined>()
  const [gasEstimate, setGasEstimate] = useState('-')
  const [showClaimGlow, setShowClaimGlow] = useState(false)

  // Transfer state
  const [isTransferPending, setIsTransferPending] = useState(false)
  const [transferRecipient, setTransferRecipient] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferRecipientError, setTransferRecipientError] = useState<string>()
  const [transferAmountError, setTransferAmountError] = useState<string>()
  const [pendingTransferHash, setPendingTransferHash] = useState<`0x${string}` | undefined>()
  const [lastTransferHash, setLastTransferHash] = useState<`0x${string}` | undefined>()
  const [showTransferGlow, setShowTransferGlow] = useState(false)

  // Mint state
  const [isMintPending, setIsMintPending] = useState(false)
  const [mintRecipient, setMintRecipient] = useState('')
  const [mintAmount, setMintAmount] = useState('')
  const [mintRecipientError, setMintRecipientError] = useState<string>()
  const [mintAmountError, setMintAmountError] = useState<string>()
  const [pendingMintHash, setPendingMintHash] = useState<`0x${string}` | undefined>()
  const [lastMintHash, setLastMintHash] = useState<`0x${string}` | undefined>()
  const [showMintGlow, setShowMintGlow] = useState(false)

  const refreshAfterTx = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['recent-faucet-transactions', targetChain.id] }),
      queryClient.invalidateQueries({ queryKey: ['latestBlockTimestamp', targetChain.id] }),
      queryClient.invalidateQueries(),
    ])
  }

  const submitWithReceipt = async (hash: `0x${string}`) => {
    if (!publicClient) throw new Error('Public client not available')

    toast.loading('Transaction pending...', { id: hash })
    setPendingTxHash(hash)
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    if (receipt.status !== 'success') {
      setPendingTxHash(undefined)
      throw new Error('Transaction failed on-chain')
    }
    setPendingTxHash(undefined)
    setLastTxHash(hash)
    setShowClaimGlow(true)
    toast.success('Transaction confirmed', { id: hash })
    await refreshAfterTx()
  }

  useEffect(() => {
    if (!showClaimGlow) return
    const timer = window.setTimeout(() => setShowClaimGlow(false), 1400)
    return () => window.clearTimeout(timer)
  }, [showClaimGlow])

  useEffect(() => {
    if (!showTransferGlow) return
    const timer = window.setTimeout(() => setShowTransferGlow(false), 1400)
    return () => window.clearTimeout(timer)
  }, [showTransferGlow])

  useEffect(() => {
    if (!showMintGlow) return
    const timer = window.setTimeout(() => setShowMintGlow(false), 1400)
    return () => window.clearTimeout(timer)
  }, [showMintGlow])

  const handleClaim = async () => {
    if (!address) {
      toast.error('Connect wallet first')
      return
    }
    if (faucet.hasNetworkMismatch) {
      try {
        await switchChainAsync({ chainId: targetChain.id })
      } catch {
        toast.error('Switch to the correct network to claim')
        return
      }
    }
    if (!countdown.canClaim) {
      toast.error(countdown.countdownText)
      return
    }

    try {
      setIsClaimPending(true)
      if (!publicClient) throw new Error('Unable to connect to RPC')

      // Estimate gas before sending the faucet claim transaction.
      const gas = await publicClient.estimateContractGas({
        account: address,
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'requestToken',
      })

      const hash = await writeContractAsync({
        chainId: targetChain.id,
        account: address,
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'requestToken',
        gas: (gas * 12n) / 10n,
      })

      setGasEstimate(`${gas.toString()} units`)

      await submitWithReceipt(hash)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Claim failed')
      setPendingTxHash(undefined)
    } finally {
      setIsClaimPending(false)
    }
  }

  const addTokenToWallet = async () => {
    if (!walletClient) {
      toast.error('No active wallet client. Connect an injected wallet and try again.')
      return
    }

    try {
      const wasAdded = await walletClient.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: CONTRACT_ADDRESS,
            // Most wallets only accept token symbols up to 11 chars.
            symbol: faucet.symbol.slice(0, 11),
            decimals: faucet.decimals,
          },
        },
      })

      if (wasAdded) {
        toast.success('Token added to wallet')
      } else {
        toast('Token add request was canceled')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add token to wallet'
      toast.error(message)
    }
  }

  const handleTransfer = async () => {
    // Reset previous errors
    setTransferRecipientError(undefined)
    setTransferAmountError(undefined)

    if (!address) {
      toast.error('Connect wallet first')
      return
    }

    // Validate recipient address
    if (!transferRecipient.trim()) {
      setTransferRecipientError('Recipient address is required')
      return
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(transferRecipient.trim())) {
      setTransferRecipientError('Invalid recipient address')
      return
    }
    const recipientAddress = transferRecipient.trim() as `0x${string}`

    // Validate amount
    if (!transferAmount.trim()) {
      setTransferAmountError('Amount is required')
      return
    }
    const amountNumber = Number.parseFloat(transferAmount.trim())
    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      setTransferAmountError('Amount must be greater than 0')
      return
    }

    // Check balance
    const userBalanceNumber = Number.parseFloat(formatToken(faucet.userBalance, faucet.decimals))
    if (amountNumber > userBalanceNumber) {
      setTransferAmountError(`Insufficient balance. You have ${userBalanceNumber.toFixed(4)} ${faucet.symbol}`)
      return
    }

    if (faucet.hasNetworkMismatch) {
      try {
        await switchChainAsync({ chainId: targetChain.id })
      } catch {
        toast.error('Switch to the correct network to transfer')
        return
      }
    }

    try {
      setIsTransferPending(true)
      if (!publicClient) throw new Error('Unable to connect to RPC')

      // Parse the amount with token decimals
      const amount = parseUnits(amountNumber.toString(), faucet.decimals)

      // Estimate gas before sending the transfer transaction
      const gas = await publicClient.estimateContractGas({
        account: address,
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'transfer',
        args: [recipientAddress, amount],
      })

      const hash = await writeContractAsync({
        chainId: targetChain.id,
        account: address,
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'transfer',
        args: [recipientAddress, amount],
        gas: (gas * 12n) / 10n,
      })

      // Wait for receipt
      toast.loading('Transfer pending...', { id: hash })
      setPendingTransferHash(hash)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      if (receipt.status !== 'success') {
        setPendingTransferHash(undefined)
        throw new Error('Transaction failed on-chain')
      }

      setPendingTransferHash(undefined)
      setLastTransferHash(hash)
      setShowTransferGlow(true)
      toast.success('Transfer confirmed', { id: hash })

      // Reset form and refresh data
      setTransferRecipient('')
      setTransferAmount('')
      await refreshAfterTx()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Transfer failed')
      setPendingTransferHash(undefined)
    } finally {
      setIsTransferPending(false)
    }
  }

  const handleMint = async () => {
    // Reset previous errors
    setMintRecipientError(undefined)
    setMintAmountError(undefined)

    if (!address) {
      toast.error('Connect wallet first')
      return
    }

    // Check if user is owner
    if (address.toLowerCase() !== faucet.owner.toLowerCase()) {
      toast.error('Only the contract owner can mint tokens')
      return
    }

    // Validate recipient address
    if (!mintRecipient.trim()) {
      setMintRecipientError('Recipient address is required')
      return
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(mintRecipient.trim())) {
      setMintRecipientError('Invalid recipient address')
      return
    }
    const recipientAddress = mintRecipient.trim() as `0x${string}`

    // Validate amount
    if (!mintAmount.trim()) {
      setMintAmountError('Amount is required')
      return
    }
    const amountNumber = Number.parseFloat(mintAmount.trim())
    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      setMintAmountError('Amount must be greater than 0')
      return
    }

    // Check max supply
    const totalSupplyNumber = Number.parseFloat(formatToken(faucet.totalSupply, faucet.decimals))
    const maxSupplyNumber = Number.parseFloat(formatToken(faucet.maxSupply, faucet.decimals))
    if (totalSupplyNumber + amountNumber > maxSupplyNumber) {
      setMintAmountError(`Minting would exceed max supply. Available: ${(maxSupplyNumber - totalSupplyNumber).toFixed(4)} ${faucet.symbol}`)
      return
    }

    if (faucet.hasNetworkMismatch) {
      try {
        await switchChainAsync({ chainId: targetChain.id })
      } catch {
        toast.error('Switch to the correct network to mint')
        return
      }
    }

    try {
      setIsMintPending(true)
      if (!publicClient) throw new Error('Unable to connect to RPC')

      // Parse the amount with token decimals
      const amount = parseUnits(amountNumber.toString(), faucet.decimals)

      // Estimate gas before sending the mint transaction
      const gas = await publicClient.estimateContractGas({
        account: address,
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'mint',
        args: [recipientAddress, amount],
      })

      const hash = await writeContractAsync({
        chainId: targetChain.id,
        account: address,
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'mint',
        args: [recipientAddress, amount],
        gas: (gas * 12n) / 10n,
      })

      // Wait for receipt
      toast.loading('Mint pending...', { id: hash })
      setPendingMintHash(hash)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      if (receipt.status !== 'success') {
        setPendingMintHash(undefined)
        throw new Error('Transaction failed on-chain')
      }

      setPendingMintHash(undefined)
      setLastMintHash(hash)
      setShowMintGlow(true)
      toast.success('Mint confirmed', { id: hash })

      // Reset form and refresh data
      setMintRecipient('')
      setMintAmount('')
      await refreshAfterTx()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Mint failed')
      setPendingMintHash(undefined)
    } finally {
      setIsMintPending(false)
    }
  }

  const claimText = `${formatToken(faucet.claimAmount, faucet.decimals, 4)} ${faucet.symbol}`
  const userBalanceText = `${formatToken(faucet.userBalance, faucet.decimals, 4)} ${faucet.symbol}`
  const isTransactionsPending = txQuery.isLoading || (txQuery.isFetching && txQuery.data === undefined)

  const transactions = useMemo(() => txQuery.data ?? [], [txQuery.data])

  const uniqueUsers = useMemo(() => new Set(transactions.map((tx) => tx.address.toLowerCase())).size, [transactions])

  const distributedNumber = useMemo(() => Number.parseFloat(formatToken(faucet.totalSupply, faucet.decimals, 3)), [faucet.decimals, faucet.totalSupply])
  const remainingMintCapacityNumber = useMemo(() => {
    const remainingSupply = faucet.maxSupply > faucet.totalSupply ? faucet.maxSupply - faucet.totalSupply : 0n
    return Number.parseFloat(formatToken(remainingSupply, faucet.decimals, 3))
  }, [faucet.decimals, faucet.maxSupply, faucet.totalSupply])
  const claimCount = useMemo(() => transactions.filter((tx) => tx.action === 'Claim').length, [transactions])

  const trendMetrics = useMemo(() => {
    const now = Math.floor(Date.now() / 1000)
    const currentWindowStart = now - TREND_WINDOW_SECONDS
    const previousWindowStart = currentWindowStart - TREND_WINDOW_SECONDS

    const currentWindowTransactions = transactions.filter((tx) => tx.timestamp >= currentWindowStart)
    const previousWindowTransactions = transactions.filter(
      (tx) => tx.timestamp >= previousWindowStart && tx.timestamp < currentWindowStart,
    )

    const isSupplyAction = (tx: FaucetTx) => tx.action === 'Claim' || tx.action === 'Mint'
    const toTokenValue = (amount: bigint) => Number.parseFloat(formatToken(amount, faucet.decimals, 6))

    const distributedInWindow = (windowTransactions: FaucetTx[]) =>
      windowTransactions
        .filter(isSupplyAction)
        .reduce((sum, tx) => sum + toTokenValue(tx.amount), 0)

    const currentDistributed = distributedInWindow(currentWindowTransactions)
    const previousDistributed = distributedInWindow(previousWindowTransactions)

    const currentClaims = currentWindowTransactions.filter((tx) => tx.action === 'Claim').length
    const previousClaims = previousWindowTransactions.filter((tx) => tx.action === 'Claim').length

    const currentUsers = new Set(currentWindowTransactions.map((tx) => tx.address.toLowerCase())).size
    const previousUsers = new Set(previousWindowTransactions.map((tx) => tx.address.toLowerCase())).size

    const previousRemainingMintCapacity = remainingMintCapacityNumber + currentDistributed

    return {
      distributedTrend: calculatePercentChange(currentDistributed, previousDistributed),
      claimTrend: calculatePercentChange(currentClaims, previousClaims),
      activeUsersTrend: calculatePercentChange(currentUsers, previousUsers),
      remainingMintCapacityTrend: calculatePercentChange(
        remainingMintCapacityNumber,
        previousRemainingMintCapacity,
      ),
    }
  }, [transactions, faucet.decimals, remainingMintCapacityNumber])

  const statsStrip = [
    {
      label: 'Total Tokens Distributed',
      icon: Coins,
      value: distributedNumber,
      format: (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${faucet.symbol}`,
      trend: formatTrendPercentage(trendMetrics.distributedTrend),
      trendPositive: trendMetrics.distributedTrend >= 0,
      note: 'All-time faucet output',
    },
    {
      label: 'Total Claims',
      icon: Zap,
      value: claimCount,
      format: (value: number) => Math.round(value).toLocaleString(),
      trend: formatTrendPercentage(trendMetrics.claimTrend),
      trendPositive: trendMetrics.claimTrend >= 0,
      note: 'Claim count growth',
      isLoading: isTransactionsPending,
    },
    {
      label: 'Active Users',
      icon: Users,
      value: uniqueUsers,
      format: (value: number) => Math.round(value).toLocaleString(),
      trend: formatTrendPercentage(trendMetrics.activeUsersTrend),
      trendPositive: trendMetrics.activeUsersTrend >= 0,
      note: 'Unique claiming wallets',
      isLoading: isTransactionsPending,
    },
    {
      label: 'Remaining Mint Capacity',
      value: remainingMintCapacityNumber,
      icon: Wallet,
      format: (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${faucet.symbol}`,
      trend: formatTrendPercentage(trendMetrics.remainingMintCapacityTrend),
      trendPositive: trendMetrics.remainingMintCapacityTrend >= 0,
      note: 'Unminted supply before max cap',
    },
  ]

  const copyContractAddress = async () => {
    await navigator.clipboard.writeText(CONTRACT_ADDRESS)
    toast.success('Contract address copied')
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background pt-16 text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-28 top-16 h-96 w-96 rounded-full bg-primary/25 blur-[80px]" />
        <div className="absolute right-6 top-44 h-[24rem] w-[24rem] rounded-full bg-secondary-accent/18 blur-[85px]" />
        <div className="absolute -right-24 bottom-20 h-[26rem] w-[26rem] rounded-full bg-secondary-accent/22 blur-[85px]" />
        <div className="absolute bottom-0 right-16 h-80 w-80 rounded-full bg-primary/14 blur-[85px]" />
        <div className="grid-overlay absolute inset-0 opacity-70" />
        <div className="noise-overlay absolute inset-0 opacity-[0.07]" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/55 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
          <a href="#top" className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-foreground">
            <span className="inline-flex h-10 w-35 items-center justify-center">
              <img src={logo} alt="MUG Logo" className="h-10 w-30" />
            </span>
          </a>

          <div className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
            <a href="#faucet" className="transition-colors hover:text-foreground">Faucet</a>
            <a href="#analytics" className="transition-colors hover:text-foreground">Analytics</a>
            <a href="#transactions" className="transition-colors hover:text-foreground">Transactions</a>
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </Button>
            <ConnectButton showBalance={false} chainStatus="icon" />
          </div>
        </div>
      </header>

      <section id="top" className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-14 md:px-6 md:pt-20">
        <div className="hero-radial pointer-events-none absolute left-1/2 top-8 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full" />
        <div className="relative grid gap-10 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-6 lg:col-span-7"
          >
            <Badge tone="accent" className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs">Live on {targetChain.name}</Badge>
            <h1 className="text-gradient-animated text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Claim Free MUG Token Instantly
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                Experience the MUG faucet - your go-to source for free tokens. Claim instantly with on-chain cooldown checks and explore live analytics and activity.
            </p>

            <div className="flex flex-wrap gap-3">
              <ConnectButton.Custom>
                {({ account, chain, mounted, openConnectModal, openChainModal }) => {
                  const ready = mounted
                  const connected = ready && account && chain
                  const wrongChain = connected && chain.unsupported

                  return (
                    <Button
                      size="lg"
                      className="cta-pulse relative shadow-lg shadow-primary/30"
                      onClick={() => {
                        if (!connected) {
                          openConnectModal()
                          return
                        }
                        if (wrongChain) {
                          openChainModal()
                          return
                        }
                        void handleClaim()
                      }}
                    >
                      {!connected ? 'Connect Wallet' : 'Claim Tokens'}
                    </Button>
                  )
                }}
              </ConnectButton.Custom>

              <Button asChild variant="secondary" size="lg">
                <a href="#transactions">Explore Activity</a>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Zap size={15} className="text-primary" /> Near-instant claims</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} className="text-success" /> Auditable on-chain state</span>
              <span className="inline-flex items-center gap-1.5"><Radio size={15} className="text-secondary-accent" /> Live activity stream</span>
            </div>
          </motion.div>

          <div className="relative mx-auto grid w-full max-w-xl content-center gap-4 sm:grid-cols-2 lg:col-span-5">
            {statsStrip.map((metric, index) => (
              <motion.div
                key={`${metric.label}-${index}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * (index + 1) }}
                whileHover={{ y: -4 }}
                className="glass-card group rounded-2xl p-5 text-center transition-all duration-300 hover:shadow-[0_18px_34px_-20px_hsl(var(--primary)/0.7)]"
              >
                <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <metric.icon size={18} />
                </div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {metric.isLoading ? (
                    <span className="text-muted-foreground"><LoadingDots /></span>
                  ) : (
                    <StatValue value={Number.isFinite(metric.value) ? metric.value : 0} format={metric.format} />
                  )}
                </p>
                {metric.isLoading ? (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground">
                    <LoadingDots />
                  </span>
                ) : (
                  <span className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${metric.trendPositive ? 'border-success/40 bg-success/10 text-success' : 'border-danger/40 bg-danger/10 text-danger'}`}>
                    {metric.trendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {metric.trend}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 w-full max-w-7xl px-4 pb-20 md:px-6">
        <div className="rounded-3xl border border-border/60 bg-card/45 p-3 backdrop-blur-xl sm:p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {statsStrip.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: index * 0.06 }}
                whileHover={{ y: -4 }}
                className="gradient-border-card group rounded-2xl"
              >
                <div className="glass-card rounded-[15px] px-4 py-5 transition-all duration-300 group-hover:shadow-[0_18px_36px_-20px_hsl(var(--primary)/0.7)]">
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <stat.icon size={17} />
                    </span>
                    {stat.isLoading ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground">
                        <LoadingDots />
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${stat.trendPositive ? 'border-success/40 bg-success/10 text-success' : 'border-danger/40 bg-danger/10 text-danger'}`}>
                        {stat.trendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {stat.trend}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.13em] text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {stat.isLoading ? (
                      <span className="text-muted-foreground"><LoadingDots /></span>
                    ) : (
                      <StatValue value={Number.isFinite(stat.value) ? stat.value : 0} format={stat.format} />
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="gradient-divider mx-auto mb-16 h-px w-full max-w-7xl" />

      <section id="faucet" className="mx-auto w-full max-w-7xl px-4 pb-20 md:px-6">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Faucet Interaction</h2>
            <p className="mt-2 text-muted-foreground">Claim directly from the contract with cooldown-aware wallet UX.</p>
          </div>
          <Button variant="secondary" onClick={() => void addTokenToWallet()}>
            <Wallet size={16} className="mr-2" />
            Add Token
          </Button>
        </div>

        {faucet.hasNetworkMismatch ? (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
            <span className="inline-flex items-center gap-2"><AlertTriangle size={16} /> Wrong network. Switch to {targetChain.name}.</span>
            <Button variant="secondary" size="sm" onClick={() => void switchChainAsync({ chainId: targetChain.id })}>Switch Network</Button>
          </div>
        ) : null}

        <div className="gradient-border-card mx-auto max-w-10xl rounded-[26px] p-[1px]">
          <Card className={`glass-card relative overflow-hidden border-0 transition-all duration-300 ${showClaimGlow ? 'shadow-[0_0_0_1px_hsl(var(--success)/0.35),0_0_42px_hsl(var(--success)/0.35)]' : 'shadow-[0_24px_55px_-30px_hsl(var(--primary)/0.65)]'}`}>
            <div className="pointer-events-none absolute -right-12 -top-10 h-44 w-44 rounded-full bg-secondary-accent/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <CardHeader className="relative flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-secondary-accent/25 text-primary">
                  <Coins size={22} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Faucet Claim</p>
                  <h3 className="mt-1 text-2xl font-semibold">{faucet.name}</h3>
                </div>
              </div>
              <Badge tone={countdown.canClaim ? 'success' : 'warning'}>{countdown.canClaim ? 'Ready' : 'Cooldown'}</Badge>
            </CardHeader>

          <CardContent>
            {!isConnected ? (
              <div className="space-y-4 rounded-2xl border border-dashed border-border bg-background/45 px-5 py-8 text-center">
                <p className="text-muted-foreground">Connect your wallet to view your balance and claim status.</p>
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              </div>
            ) : faucet.isLoadingReads ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-border/70 bg-background/45 p-6 text-center">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Claimable Amount</p>
                  <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{claimText}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Claim once every 24 hours with on-chain cooldown checks.</p>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border/70 bg-background/55 p-4">
                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Your Balance</p>
                    <p className="mt-2 text-lg font-semibold text-success">{userBalanceText}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/55 p-4">
                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Cooldown Timer</p>
                    <p className={`mt-2 text-lg font-semibold ${countdown.canClaim ? 'text-success' : 'text-warning'}`}>{countdown.countdownText}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/55 p-4">
                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Estimated Gas</p>
                    <p className="mt-2 text-lg font-semibold">{gasEstimate}</p>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="cta-pulse mt-5 w-full"
                  onClick={() => void handleClaim()}
                  disabled={isClaimPending || !countdown.canClaim || faucet.hasNetworkMismatch}
                >
                  {isClaimPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                  Claim Tokens
                </Button>

                <AnimatePresence>
                  {pendingTxHash ? (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-sm text-primary"
                    >
                      <Loader2 size={14} className="animate-spin" />
                      Pending: {shortenAddress(pendingTxHash, 6)}
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {lastTxHash ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-success/25 bg-success/10 px-3 py-1 text-sm text-success">
                    <CheckCircle2 size={14} />
                    Confirmed
                    <a href={`${explorerUrl}/tx/${lastTxHash}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
                      View tx
                      <ExternalLink size={13} />
                    </a>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 md:px-6">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Transfer MUG Token</h2>
            <p className="mt-2 text-muted-foreground">Send your MUG tokens to another wallet with on-chain verification.</p>
          </div>
        </div>

        {faucet.hasNetworkMismatch ? (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
            <span className="inline-flex items-center gap-2"><AlertTriangle size={16} /> Wrong network. Switch to {targetChain.name}.</span>
            <Button variant="secondary" size="sm" onClick={() => void switchChainAsync({ chainId: targetChain.id })}>Switch Network</Button>
          </div>
        ) : null}

        <div className="gradient-border-card mx-auto max-w-10xl rounded-[26px] p-[1px]">
          <Card className={`glass-card relative overflow-hidden border-0 transition-all duration-300 ${showTransferGlow ? 'shadow-[0_0_0_1px_hsl(var(--success)/0.35),0_0_42px_hsl(var(--success)/0.35)]' : 'shadow-[0_24px_55px_-30px_hsl(var(--primary)/0.65)]'}`}>
            <div className="pointer-events-none absolute -right-12 -top-10 h-44 w-44 rounded-full bg-secondary-accent/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <CardHeader className="relative flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-secondary-accent/25 text-primary">
                  <Send size={22} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Token Transfer</p>
                  <h3 className="mt-1 text-2xl font-semibold">Send {faucet.symbol}</h3>
                </div>
              </div>
              <Badge tone={faucet.userBalance > 0n ? 'success' : 'warning'}>{faucet.userBalance > 0n ? 'Ready' : 'No Balance'}</Badge>
            </CardHeader>

            <CardContent>
              {!isConnected ? (
                <div className="space-y-4 rounded-2xl border border-dashed border-border bg-background/45 px-5 py-8 text-center">
                  <p className="text-muted-foreground">Connect your wallet to transfer tokens.</p>
                  <div className="flex justify-center">
                    <ConnectButton />
                  </div>
                </div>
              ) : faucet.isLoadingReads ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Skeleton className="h-24 w-full rounded-2xl" />
                  <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
              ) : (
                <>
                  <div className="rounded-2xl border border-border/70 bg-background/45 p-6">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Your Balance</p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{userBalanceText}</p>
                    <p className="mt-2 text-sm text-muted-foreground">Enter the recipient address and amount to transfer.</p>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {/* Recipient Address */}
                    <label className="space-y-2">
                      <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Recipient Address</span>
                      <input
                        value={transferRecipient}
                        onChange={(e) => setTransferRecipient(e.target.value)}
                        placeholder="0x..."
                        className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none ring-2 ring-transparent transition focus:ring-primary/35 ${transferRecipientError ? 'border-danger/60' : 'border-border'}`}
                      />
                      {transferRecipientError ? <p className="text-xs text-danger">{transferRecipientError}</p> : null}
                    </label>

                    {/* Amount */}
                    <label className="space-y-2">
                      <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Amount ({faucet.symbol})</span>
                      <input
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="0.0"
                        className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none ring-2 ring-transparent transition focus:ring-primary/35 ${transferAmountError ? 'border-danger/60' : 'border-border'}`}
                      />
                      {transferAmountError ? <p className="text-xs text-danger">{transferAmountError}</p> : null}
                    </label>
                  </div>

                  <Button
                    size="lg"
                    className="cta-pulse mt-5 w-full"
                    onClick={() => void handleTransfer()}
                    disabled={isTransferPending || faucet.hasNetworkMismatch || faucet.userBalance === 0n}
                  >
                    {isTransferPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                    Transfer Tokens
                  </Button>

                  <AnimatePresence>
                    {pendingTransferHash ? (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-sm text-primary"
                      >
                        <Loader2 size={14} className="animate-spin" />
                        Pending: {shortenAddress(pendingTransferHash, 6)}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  {lastTransferHash ? (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-success/25 bg-success/10 px-3 py-1 text-sm text-success">
                      <CheckCircle2 size={14} />
                      Confirmed
                      <a href={`${explorerUrl}/tx/${lastTransferHash}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
                        View tx
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 md:px-6">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Mint MUG Token</h2>
            <p className="mt-2 text-muted-foreground">Create new tokens and distribute them. Contract owner only.</p>
          </div>
        </div>

        {faucet.hasNetworkMismatch ? (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
            <span className="inline-flex items-center gap-2"><AlertTriangle size={16} /> Wrong network. Switch to {targetChain.name}.</span>
            <Button variant="secondary" size="sm" onClick={() => void switchChainAsync({ chainId: targetChain.id })}>Switch Network</Button>
          </div>
        ) : null}

        {address?.toLowerCase() !== faucet.owner.toLowerCase() && isConnected ? (
          <div className="mb-5 flex items-center justify-center rounded-2xl border border-danger/40 bg-danger/10 px-4 py-6 text-center text-sm text-danger">
            <span className="inline-flex items-center gap-2"><AlertTriangle size={16} /> Only the contract owner can mint tokens.</span>
          </div>
        ) : (
          <div className="gradient-border-card mx-auto max-w-10xl rounded-[26px] p-[1px]">
            <Card className={`glass-card relative overflow-hidden border-0 transition-all duration-300 ${showMintGlow ? 'shadow-[0_0_0_1px_hsl(var(--success)/0.35),0_0_42px_hsl(var(--success)/0.35)]' : 'shadow-[0_24px_55px_-30px_hsl(var(--primary)/0.65)]'}`}>
              <div className="pointer-events-none absolute -right-12 -top-10 h-44 w-44 rounded-full bg-secondary-accent/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
              <CardHeader className="relative flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-secondary-accent/25 text-primary">
                    <Coins size={22} />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Token Minting</p>
                    <h3 className="mt-1 text-2xl font-semibold">Mint {faucet.symbol}</h3>
                  </div>
                </div>
                <Badge tone="accent">Owner Only</Badge>
              </CardHeader>

              <CardContent>
                {!isConnected ? (
                  <div className="space-y-4 rounded-2xl border border-dashed border-border bg-background/45 px-5 py-8 text-center">
                    <p className="text-muted-foreground">Connect your wallet to access minting.</p>
                    <div className="flex justify-center">
                      <ConnectButton />
                    </div>
                  </div>
                ) : faucet.isLoadingReads ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                  </div>
                ) : (
                  <>
                    <div className="rounded-2xl border border-border/70 bg-background/45 p-6">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Max Supply Remaining</p>
                      <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{formatToken((faucet.maxSupply - faucet.totalSupply), faucet.decimals, 2)} {faucet.symbol}</p>
                      <p className="mt-2 text-sm text-muted-foreground">Total supply: {formatToken(faucet.totalSupply, faucet.decimals, 2)} / {formatToken(faucet.maxSupply, faucet.decimals, 2)} {faucet.symbol}</p>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {/* Recipient Address */}
                      <label className="space-y-2">
                        <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Recipient Address</span>
                        <input
                          value={mintRecipient}
                          onChange={(e) => setMintRecipient(e.target.value)}
                          placeholder="0x..."
                          className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none ring-2 ring-transparent transition focus:ring-primary/35 ${mintRecipientError ? 'border-danger/60' : 'border-border'}`}
                        />
                        {mintRecipientError ? <p className="text-xs text-danger">{mintRecipientError}</p> : null}
                      </label>

                      {/* Amount */}
                      <label className="space-y-2">
                        <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Amount ({faucet.symbol})</span>
                        <input
                          value={mintAmount}
                          onChange={(e) => setMintAmount(e.target.value)}
                          placeholder="0.0"
                          className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none ring-2 ring-transparent transition focus:ring-primary/35 ${mintAmountError ? 'border-danger/60' : 'border-border'}`}
                        />
                        {mintAmountError ? <p className="text-xs text-danger">{mintAmountError}</p> : null}
                      </label>
                    </div>

                    <Button
                      size="lg"
                      className="cta-pulse mt-5 w-full"
                      onClick={() => void handleMint()}
                      disabled={isMintPending || faucet.hasNetworkMismatch}
                    >
                      {isMintPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                      Mint Tokens
                    </Button>

                    <AnimatePresence>
                      {pendingMintHash ? (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-sm text-primary"
                        >
                          <Loader2 size={14} className="animate-spin" />
                          Pending: {shortenAddress(pendingMintHash, 6)}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>

                    {lastMintHash ? (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-success/25 bg-success/10 px-3 py-1 text-sm text-success">
                        <CheckCircle2 size={14} />
                        Confirmed
                        <a href={`${explorerUrl}/tx/${lastMintHash}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
                          View tx
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    ) : null}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      <section id="analytics" className="bg-background/45 py-20">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <div className="mb-6">
            <h2 className="text-3xl font-semibold tracking-tight">Analytics</h2>
            <p className="mt-2 text-muted-foreground">Claims over time and token distribution with range filters.</p>
          </div>
          <AnalyticsSection transactions={transactions} isLoading={txQuery.isLoading} />
        </div>
      </section>

      <section id="transactions" className="mx-auto w-full max-w-7xl px-4 py-20 md:px-6">
        <div className="grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <RecentTransactionsTable
              transactions={transactions}
              isLoading={txQuery.isLoading}
              explorerUrl={explorerUrl}
              symbol={faucet.symbol}
              decimals={faucet.decimals}
            />
          </div>
          <div className="xl:col-span-4">
            <LiveActivityFeed
              transactions={transactions}
              isLoading={txQuery.isLoading}
              symbol={faucet.symbol}
              decimals={faucet.decimals}
            />
          </div>
        </div>
      </section>

      <section id="features" className="bg-background/45 py-20">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <div className="mb-7">
            <h2 className="text-3xl font-semibold tracking-tight">Built for Web3 Teams</h2>
            <p className="mt-2 text-muted-foreground">Landing page polish with product-grade faucet interactions.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Fast Claims', body: 'Optimized transaction flow with responsive pending and confirmation states.', icon: Zap },
              { title: 'Secure Smart Contract', body: 'Direct contract interactions through wagmi, viem, and verified reads.', icon: ShieldCheck },
              { title: 'Real-time Data', body: 'Query polling keeps stats, transactions, and activity continuously fresh.', icon: Radio },
              { title: 'Multi-wallet Support', body: 'RainbowKit connection UX for modern EVM wallets across devices.', icon: Wallet },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Card className="glass-card h-full">
                  <CardHeader>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <feature.icon size={18} />
                    </span>
                    <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-card/45 py-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <p className="text-sm font-semibold">MUG Faucet</p>
            <p className="mt-1 text-sm text-muted-foreground">{targetChain.name} • {faucet.name}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <button className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 transition-colors hover:bg-muted" onClick={() => void copyContractAddress()}>
              {shortenAddress(CONTRACT_ADDRESS, 6)}
              <Copy size={13} />
            </button>
            <a href="https://github.com/emejulucodes/MUG-Faucet" target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 transition-colors hover:bg-muted">
              <Github size={14} />
              GitHub
            </a>
            <a href="https://docs.ethers.org" target="_blank" rel="noreferrer noopener" className="rounded-full border border-border px-3 py-1.5 transition-colors hover:bg-muted">
              Docs
            </a>
            <a href={explorerUrl ? `${explorerUrl}/address/${CONTRACT_ADDRESS}` : '#'} target="_blank" rel="noreferrer noopener" className="rounded-full border border-border px-3 py-1.5 transition-colors hover:bg-muted">
              Explorer
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
