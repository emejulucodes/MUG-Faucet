import { formatUnits } from 'viem'

export const shortenAddress = (address?: string, size = 4): string => {
  if (!address) return 'Not connected'
  return `${address.slice(0, size + 2)}...${address.slice(-size)}`
}

export const formatToken = (value: bigint, decimals: number, digits = 4): string => {
  const raw = formatUnits(value, decimals)
  const [whole, fraction = ''] = raw.split('.')
  const trimmedFraction = fraction.slice(0, digits).replace(/0+$/, '')
  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole
}

export const formatNumberCompact = (value: bigint, decimals = 18): string => {
  const normalized = Number(formatUnits(value, decimals))
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    notation: 'compact',
  }).format(normalized)
}

export const formatDateTime = (unixSeconds: number): string => {
  if (!unixSeconds) return '-'
  return new Date(unixSeconds * 1000).toLocaleString()
}

export const formatRelativeTime = (unixSeconds: number): string => {
  if (!unixSeconds) return 'just now'
  const diff = Math.max(0, Math.floor(Date.now() / 1000) - unixSeconds)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}
