import { Loader2 } from 'lucide-react'
import { SectionCard } from './SectionCard'

type ClaimSectionProps = {
  claimAmountText: string
  userBalanceText: string
  countdownText: string
  remainingSeconds: number
  claimIntervalSeconds: number
  canClaim: boolean
  hasWallet: boolean
  hasNetworkMismatch: boolean
  isPending: boolean
  onClaim: () => Promise<void>
}

export const ClaimSection = ({
  claimAmountText,
  userBalanceText,
  countdownText,
  remainingSeconds,
  claimIntervalSeconds,
  canClaim,
  hasWallet,
  hasNetworkMismatch,
  isPending,
  onClaim,
}: ClaimSectionProps) => {
  const isDisabled = !hasWallet || !canClaim || hasNetworkMismatch || isPending
  const progress = claimIntervalSeconds > 0 ? Math.min(100, ((claimIntervalSeconds - remainingSeconds) / claimIntervalSeconds) * 100) : 100

  return (
    <SectionCard title="Faucet Claim" subtitle="Claim once every 24 hours per wallet." className="border-cyan-900/60 bg-gradient-to-b from-slate-900 to-slate-900/80">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs text-slate-400">Claim per request</p>
          <p className="mt-2 text-base font-semibold text-cyan-300">{claimAmountText}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs text-slate-400">Your token balance</p>
          <p className="mt-2 text-base font-semibold text-emerald-300">{userBalanceText}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs text-slate-400">Cooldown</p>
          <p className={`mt-2 text-base font-semibold ${canClaim ? 'text-emerald-300' : 'text-amber-300'}`}>{countdownText}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${canClaim ? 'bg-emerald-400' : 'bg-amber-400'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void onClaim()}
        disabled={isDisabled}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_14px_30px_-16px_rgba(34,211,238,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
      >
        {isPending ? <Loader2 className="animate-spin" size={16} /> : null}
        Claim Tokens
      </button>
    </SectionCard>
  )
}
