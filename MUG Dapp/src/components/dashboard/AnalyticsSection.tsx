import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Skeleton } from '../ui/skeleton'
import type { FaucetTx } from '../../types/faucet'

const ranges = ['24h', '7d', '30d'] as const

type AnalyticsSectionProps = {
  transactions: FaucetTx[]
  isLoading?: boolean
}

export const AnalyticsSection = ({ transactions, isLoading = false }: AnalyticsSectionProps) => {
  const [range, setRange] = useState<(typeof ranges)[number]>('24h')

  const chartData = useMemo(() => {
    const now = Math.floor(Date.now() / 1000)
    const hours = range === '24h' ? 24 : range === '7d' ? 24 * 7 : 24 * 30
    const bucketSeconds = range === '24h' ? 3 * 60 * 60 : 24 * 60 * 60
    const bucketCount = Math.ceil((hours * 60 * 60) / bucketSeconds)

    return Array.from({ length: bucketCount }).map((_, index) => {
      const bucketStart = now - (bucketCount - index) * bucketSeconds
      const bucketEnd = bucketStart + bucketSeconds

      const bucketTx = transactions.filter((tx) => tx.timestamp >= bucketStart && tx.timestamp < bucketEnd)
      const claims = bucketTx.filter((tx) => tx.action === 'Claim').length
      const distributed = bucketTx.reduce((sum, tx) => sum + Number(tx.amount / 10n ** 18n), 0)

      return {
        label: range === '24h' ? `${index * 3}h` : `D${index + 1}`,
        claims,
        distributed,
      }
    })
  }, [range, transactions])

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Analytics</h3>
            <p className="text-sm text-muted-foreground">Claims and distribution over time</p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-52 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Analytics</h3>
          <p className="text-sm text-muted-foreground">Claims and distribution over time</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-background/40 p-1">
          {ranges.map((item) => (
            <Button
              key={item}
              size="sm"
              variant={range === item ? 'primary' : 'ghost'}
              onClick={() => setRange(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="h-64 rounded-xl border border-border/70 bg-background/45 p-3">
          <p className="mb-2 text-xs text-muted-foreground">Claims over time</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Line type="monotone" dataKey="claims" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="h-64 rounded-xl border border-border/70 bg-background/45 p-3">
          <p className="mb-2 text-xs text-muted-foreground">Distribution</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="distributed" fill="hsl(var(--secondary-accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
