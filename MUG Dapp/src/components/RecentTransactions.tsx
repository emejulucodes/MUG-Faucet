import { ExternalLink } from 'lucide-react'
import type { FaucetTx } from '../types/faucet'
import { formatDateTime, formatToken, shortenAddress } from '../utils/format'

type RecentTransactionsProps = {
  transactions: FaucetTx[]
  isLoading?: boolean
  symbol: string
  decimals: number
  explorerBaseUrl: string
}

export const RecentTransactions = ({
  transactions,
  isLoading = false,
  symbol,
  decimals,
  explorerBaseUrl,
}: RecentTransactionsProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, idx) => (
          <div key={idx} className="h-11 animate-pulse rounded-lg border border-slate-800 bg-slate-950/60" />
        ))}
      </div>
    )
  }

  if (!transactions.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 px-4 py-8 text-center">
        <p className="text-sm font-medium text-slate-300">No transactions yet</p>
        <p className="mt-1 text-xs text-slate-500">Recent claims, mints, and transfers will show up here.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
      <table className="min-w-full text-left text-sm text-slate-300">
        <thead className="border-b border-slate-800 text-xs tracking-wide text-slate-400">
          <tr>
            <th className="py-3 pl-4 pr-4">Address</th>
            <th className="py-3 pr-4">Action</th>
            <th className="py-3 pr-4">Amount</th>
            <th className="py-3 pr-4">Timestamp</th>
            <th className="py-3 pr-4">Hash</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={`${tx.hash}-${tx.action}`} className="border-b border-slate-900/70 transition-colors duration-150 hover:bg-slate-900/40">
              <td className="py-3 pl-4 pr-4 text-slate-200">{shortenAddress(tx.address)}</td>
              <td className="py-3 pr-4">
                <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs">{tx.action}</span>
              </td>
              <td className="py-3 pr-4">{formatToken(tx.amount, decimals, 4)} {symbol}</td>
              <td className="py-3 pr-4 text-slate-400">{formatDateTime(tx.timestamp)}</td>
              <td className="py-3 pr-4">
                <a
                  href={`${explorerBaseUrl}/tx/${tx.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300"
                >
                  {shortenAddress(tx.hash)}
                  <ExternalLink size={14} />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
