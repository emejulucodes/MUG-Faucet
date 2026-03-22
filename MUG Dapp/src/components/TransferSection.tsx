import { Loader2 } from 'lucide-react'
import { SectionCard } from './SectionCard'

type TransferSectionProps = {
  recipient: string
  amount: string
  recipientError?: string
  amountError?: string
  onRecipientChange: (value: string) => void
  onAmountChange: (value: string) => void
  onTransfer: () => Promise<void>
  isPending: boolean
}

export const TransferSection = ({
  recipient,
  amount,
  recipientError,
  amountError,
  onRecipientChange,
  onAmountChange,
  onTransfer,
  isPending,
}: TransferSectionProps) => {
  return (
    <SectionCard title="Transfer Tokens" subtitle="Send MUG tokens to any address.">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-slate-400">Recipient address</span>
          <input
            value={recipient}
            onChange={(event) => onRecipientChange(event.target.value)}
            placeholder="0x..."
            className={`w-full rounded-xl border bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 outline-none ring-cyan-300/50 transition duration-200 focus:ring-2 ${recipientError ? 'border-rose-500/70' : 'border-slate-700 focus:border-cyan-400'}`}
          />
          {recipientError ? <p className="text-xs text-rose-300">{recipientError}</p> : null}
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-slate-400">Amount</span>
          <input
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
            placeholder="0.0"
            className={`w-full rounded-xl border bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 outline-none ring-cyan-300/50 transition duration-200 focus:ring-2 ${amountError ? 'border-rose-500/70' : 'border-slate-700 focus:border-cyan-400'}`}
          />
          {amountError ? <p className="text-xs text-rose-300">{amountError}</p> : null}
        </label>
      </div>
      <button
        type="button"
        onClick={() => void onTransfer()}
        disabled={isPending}
        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-100 transition-all duration-200 hover:border-cyan-500/60 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? <Loader2 className="animate-spin" size={16} /> : null}
        Transfer
      </button>
    </SectionCard>
  )
}
