import { Coins, Droplet, ShieldCheck, TrendingUp, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { formatNumberCompact, formatToken } from '../utils/format'

type StatsGridProps = {
  totalSupply: bigint
  maxSupply: bigint
  userBalance: bigint
  decimals: number
  symbol: string
}

export const StatsGrid = ({ totalSupply, maxSupply, userBalance, decimals, symbol }: StatsGridProps) => {
  const remainingSupply = maxSupply > totalSupply ? maxSupply - totalSupply : 0n

  const cards: Array<{ label: string; value: string; hint: string; icon: LucideIcon }> = [
    { label: 'Total Supply', value: `${formatToken(totalSupply, decimals, 2)} ${symbol}`, hint: 'Minted on-chain', icon: Coins },
    { label: 'Max Supply', value: `${formatToken(maxSupply, decimals, 2)} ${symbol}`, hint: 'Hard cap', icon: ShieldCheck },
    { label: 'Remaining Supply', value: `${formatToken(remainingSupply, decimals, 2)} ${symbol}`, hint: 'Available to mint', icon: Droplet },
    { label: 'Total Distributed', value: `${formatNumberCompact(totalSupply, decimals)} ${symbol}`, hint: 'All-time', icon: TrendingUp },
    { label: 'Your Balance', value: `${formatToken(userBalance, decimals, 4)} ${symbol}`, hint: 'Wallet holdings', icon: Wallet },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-[0_8px_18px_-14px_rgba(14,165,233,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-slate-300">{card.label}</p>
            <card.icon size={16} className="text-cyan-300" />
          </div>
          <p className="mt-2.5 text-2xl font-semibold tracking-tight text-slate-100">{card.value}</p>
          <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
        </div>
      ))}
    </div>
  )
}
