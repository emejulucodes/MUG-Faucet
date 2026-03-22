import { ArrowRightLeft, BadgePlus, Droplets } from 'lucide-react'
import type { FaucetTx } from '../types/faucet'
import { formatRelativeTime, formatToken, shortenAddress } from '../utils/format'

type ActivityFeedProps = {
  activities: FaucetTx[]
  isLoading?: boolean
  symbol: string
  decimals: number
}

export const ActivityFeed = ({ activities, isLoading = false, symbol, decimals }: ActivityFeedProps) => {
  if (isLoading) {
    return (
      <ul className="space-y-2.5">
        {[...Array(5)].map((_, idx) => (
          <li key={idx} className="h-12 animate-pulse rounded-xl border border-slate-800 bg-slate-900/70" />
        ))}
      </ul>
    )
  }

  if (!activities.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 px-4 py-8 text-center">
        <p className="text-sm font-medium text-slate-300">No activity yet</p>
        <p className="mt-1 text-xs text-slate-500">New claims, mints, and transfers will appear here.</p>
      </div>
    )
  }

  const actionMeta = {
    Claim: { icon: Droplets, badge: 'text-cyan-200 border-cyan-700/60 bg-cyan-900/30' },
    Mint: { icon: BadgePlus, badge: 'text-violet-200 border-violet-700/60 bg-violet-900/30' },
    Transfer: { icon: ArrowRightLeft, badge: 'text-emerald-200 border-emerald-700/60 bg-emerald-900/30' },
  }

  return (
    <ul className="space-y-2.5">
      {activities.slice(0, 6).map((item) => {
        const meta = actionMeta[item.action]
        const Icon = meta.icon
        return (
        <li
          key={item.hash}
          className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/55 px-3.5 py-2.5 text-sm transition-colors duration-200 hover:border-slate-700"
        >
          <div className="flex items-center gap-2.5">
            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md border ${meta.badge}`}>
              <Icon size={14} />
            </span>
            <div>
              <p className="text-slate-200">{shortenAddress(item.address)}</p>
              <p className="text-xs text-slate-500">{formatRelativeTime(item.timestamp)}</p>
            </div>
          </div>
          <span className="font-medium text-slate-100">{formatToken(item.amount, decimals, 2)} {symbol}</span>
        </li>
      )})}
    </ul>
  )
}
