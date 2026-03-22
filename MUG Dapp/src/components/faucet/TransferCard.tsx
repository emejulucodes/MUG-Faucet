import { Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader } from '../ui/card'

type TransferCardProps = {
  recipient: string
  amount: string
  recipientError?: string
  amountError?: string
  isPending: boolean
  onRecipientChange: (value: string) => void
  onAmountChange: (value: string) => void
  onTransfer: () => Promise<void>
}

export const TransferCard = ({
  recipient,
  amount,
  recipientError,
  amountError,
  isPending,
  onRecipientChange,
  onAmountChange,
  onTransfer,
}: TransferCardProps) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-foreground">Transfer Tokens</h3>
        <p className="text-sm text-muted-foreground">Send MUG tokens to another wallet.</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Recipient address</span>
            <input
              value={recipient}
              onChange={(event) => onRecipientChange(event.target.value)}
              placeholder="0x..."
              className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none ring-2 ring-transparent transition focus:ring-primary/35 ${recipientError ? 'border-danger/60' : 'border-border'}`}
            />
            {recipientError ? <p className="text-xs text-danger">{recipientError}</p> : null}
          </label>

          <label className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Amount</span>
            <input
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              placeholder="0.0"
              className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none ring-2 ring-transparent transition focus:ring-primary/35 ${amountError ? 'border-danger/60' : 'border-border'}`}
            />
            {amountError ? <p className="text-xs text-danger">{amountError}</p> : null}
          </label>
        </div>

        <Button variant="secondary" className="mt-5" onClick={() => void onTransfer()} disabled={isPending}>
          {isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
          Transfer
        </Button>
      </CardContent>
    </Card>
  )
}
