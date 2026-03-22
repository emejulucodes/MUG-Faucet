import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRightLeft, BadgePlus, Droplets } from 'lucide-react'
import type { FaucetTx } from '../../types/faucet'
import { formatRelativeTime, formatToken, shortenAddress } from '../../utils/format'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

type LiveActivityFeedProps = {
  transactions: FaucetTx[]
  isLoading?: boolean
  symbol: string
  decimals: number
}

export const LiveActivityFeed = ({ transactions, isLoading = false, symbol, decimals }: LiveActivityFeedProps) => {
  const topItems = transactions.slice(0, 8)

  const iconMap = {
    Claim: Droplets,
    Mint: BadgePlus,
    Transfer: ArrowRightLeft,
  }

  const actionVerbMap = {
    Claim: 'claimed',
    Mint: 'minted',
    Transfer: 'transferred',
  } as const

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-foreground">Live Activity</h3>
        <p className="text-sm text-muted-foreground">Recent faucet interactions</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </>
          ) : null}
          <AnimatePresence>
            {!isLoading && topItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
                Waiting for on-chain activity...
              </div>
            ) : (
              topItems.map((item) => {
                const Icon = iconMap[item.action]
                const actionVerb = actionVerbMap[item.action]
                return (
                  <motion.div
                    key={`${item.hash}-${item.action}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-muted">
                        <Icon size={14} />
                      </span>
                      <div>
                        <p className="text-sm text-foreground">{shortenAddress(item.address)} {actionVerb} {formatToken(item.amount, decimals, 2)} {symbol}</p>
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(item.timestamp)}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
