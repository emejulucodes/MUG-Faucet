import { motion } from 'framer-motion'
import { Copy, ExternalLink } from 'lucide-react'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import type { FaucetTx } from '../../types/faucet'
import { formatRelativeTime, formatToken, shortenAddress } from '../../utils/format'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

type RecentTransactionsTableProps = {
  transactions: FaucetTx[]
  isLoading?: boolean
  explorerUrl: string
  symbol: string
  decimals: number
}

export const RecentTransactionsTable = ({ transactions, isLoading = false, explorerUrl, symbol, decimals }: RecentTransactionsTableProps) => {
  const [page, setPage] = useState(1)
  const pageSize = 8
  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize))

  const visibleRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return transactions.slice(start, start + pageSize)
  }, [page, transactions])

  const copyValue = async (value: string) => {
    await navigator.clipboard.writeText(value)
    toast.success('Copied to clipboard')
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
        <p className="text-sm text-muted-foreground">Claims, mints, and transfers</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        ) : null}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Address</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Explorer</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && visibleRows.map((tx) => (
                <motion.tr
                  key={`${tx.hash}-${tx.action}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t border-border transition-colors hover:bg-muted/50"
                >
                  <td className="px-4 py-3">
                    <button className="inline-flex items-center gap-1.5 text-foreground" onClick={() => void copyValue(tx.address)}>
                      {shortenAddress(tx.address)}
                      <Copy size={13} className="text-muted-foreground" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-foreground">{formatToken(tx.amount, decimals, 4)} {symbol}</td>
                  <td className="px-4 py-3">
                    <Badge tone={tx.action === 'Claim' ? 'accent' : tx.action === 'Mint' ? 'warning' : 'success'}>{tx.action}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatRelativeTime(tx.timestamp)}</td>
                  <td className="px-4 py-3">
                    <a className="inline-flex items-center gap-1 text-primary hover:underline" href={`${explorerUrl}/tx/${tx.hash}`} target="_blank" rel="noreferrer">
                      {shortenAddress(tx.hash)}
                      <ExternalLink size={14} />
                    </a>
                  </td>
                </motion.tr>
              ))}
              {!isLoading && visibleRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-muted-foreground" colSpan={5}>No transactions yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="secondary" size="sm" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
