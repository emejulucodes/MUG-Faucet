import { ExternalLink, Loader2 } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader } from '../ui/card'

type ClaimHeroCardProps = {
  userBalance: string
  claimAmount: string
  countdownText: string
  canClaim: boolean
  remainingSeconds: number
  claimIntervalSeconds: number
  gasEstimate: string
  hasWallet: boolean
  hasNetworkMismatch: boolean
  isPending: boolean
  txHash?: `0x${string}`
  explorerUrl: string
  onClaim: () => Promise<void>
}

export const ClaimHeroCard = ({
  userBalance,
  claimAmount,
  countdownText,
  canClaim,
  remainingSeconds,
  claimIntervalSeconds,
  gasEstimate,
  hasWallet,
  hasNetworkMismatch,
  isPending,
  txHash,
  explorerUrl,
  onClaim,
}: ClaimHeroCardProps) => {
  const progress = claimIntervalSeconds > 0 ? Math.min(100, ((claimIntervalSeconds - remainingSeconds) / claimIntervalSeconds) * 100) : 100

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Faucet Claim</h2>
            <p className="mt-1 text-sm text-muted-foreground">Claim tokens once every 24 hours with on-chain cooldown checks.</p>
          </div>
          <Badge tone={canClaim ? 'success' : 'warning'}>{canClaim ? 'Ready' : 'Cooldown'}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <p className="text-xs text-muted-foreground">Your balance</p>
            <p className="mt-1.5 text-lg font-semibold text-success">{userBalance}</p>
          </div>
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <p className="text-xs text-muted-foreground">Claim amount</p>
            <p className="mt-1.5 text-lg font-semibold text-foreground">{claimAmount}</p>
          </div>
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <p className="text-xs text-muted-foreground">Cooldown</p>
            <p className={`mt-1.5 text-lg font-semibold ${canClaim ? 'text-success' : 'text-warning'}`}>{countdownText}</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div className={`h-full rounded-full ${canClaim ? 'bg-success' : 'bg-warning'} transition-all duration-300`} style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>Estimated gas: {gasEstimate}</span>
          {txHash ? (
            <a href={`${explorerUrl}/tx/${txHash}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
              View latest tx
              <ExternalLink size={14} />
            </a>
          ) : null}
        </div>

        <Button
          className="mt-5 w-full"
          size="lg"
          onClick={() => void onClaim()}
          disabled={!hasWallet || hasNetworkMismatch || !canClaim || isPending}
        >
          {isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
          Claim Tokens
        </Button>
      </CardContent>
    </Card>
  )
}
