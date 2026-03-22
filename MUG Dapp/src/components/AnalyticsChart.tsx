import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { FaucetTx } from '../types/faucet'
import { formatToken } from '../utils/format'

type AnalyticsChartProps = {
  transactions: FaucetTx[]
  decimals: number
}

export const AnalyticsChart = ({ transactions, decimals }: AnalyticsChartProps) => {
  const grouped = transactions.reduce<Record<string, bigint>>((acc, tx) => {
    const key = tx.action
    acc[key] = (acc[key] ?? 0n) + tx.amount
    return acc
  }, {})

  const data = [
    { action: 'Claim', amount: Number(formatToken(grouped.Claim ?? 0n, decimals, 2)) || 0 },
    { action: 'Mint', amount: Number(formatToken(grouped.Mint ?? 0n, decimals, 2)) || 0 },
    { action: 'Transfer', amount: Number(formatToken(grouped.Transfer ?? 0n, decimals, 2)) || 0 },
  ]

  const isEmpty = data.every((item) => item.amount === 0)

  if (isEmpty) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/55 text-center">
        <div>
          <p className="text-sm font-medium text-slate-300">No chart data yet</p>
          <p className="mt-1 text-xs text-slate-500">Interact with the faucet to populate analytics.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="#1f2937" />
          <XAxis dataKey="action" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0b1220',
              border: '1px solid #1e293b',
              borderRadius: '0.75rem',
              color: '#cbd5e1',
            }}
            cursor={{ fill: '#1e293b', opacity: 0.18 }}
          />
          <Bar dataKey="amount" fill="#22d3ee" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
