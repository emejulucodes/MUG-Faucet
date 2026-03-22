import { motion } from 'framer-motion'
import { Activity, Coins, TrendingUp, Users } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

type Metric = {
  title: string
  value: string
  change: string
  positive: boolean
  icon: React.ComponentType<{ size?: number; className?: string }>
  data: Array<{ v: number }>
}

type MetricsCardsProps = {
  loading?: boolean
  metrics: {
    distributed: string
    claims: string
    users: string
    balance: string
  }
}

const sparkline = [
  [{ v: 10 }, { v: 15 }, { v: 12 }, { v: 18 }, { v: 22 }, { v: 19 }, { v: 25 }],
  [{ v: 8 }, { v: 11 }, { v: 9 }, { v: 14 }, { v: 12 }, { v: 16 }, { v: 19 }],
  [{ v: 2 }, { v: 4 }, { v: 6 }, { v: 8 }, { v: 7 }, { v: 10 }, { v: 12 }],
  [{ v: 28 }, { v: 27 }, { v: 26 }, { v: 25 }, { v: 24 }, { v: 24 }, { v: 23 }],
]

export const MetricsCards = ({ loading = false, metrics }: MetricsCardsProps) => {
  const cards: Metric[] = [
    { title: 'Total Tokens Distributed', value: metrics.distributed, change: '+12.4%', positive: true, icon: Coins, data: sparkline[0] },
    { title: 'Total Claims', value: metrics.claims, change: '+7.1%', positive: true, icon: TrendingUp, data: sparkline[1] },
    { title: 'Active Users', value: metrics.users, change: '+3.2%', positive: true, icon: Users, data: sparkline[2] },
    { title: 'Contract Balance', value: metrics.balance, change: '-1.2%', positive: false, icon: Activity, data: sparkline[3] },
  ]

  if (loading) {
    return (
      <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
        {[...Array(4)].map((_, idx) => (
          <Card key={idx}>
            <CardHeader>
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="mt-3 h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <card.icon size={16} className="text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{card.value}</p>
              <div className="mt-2 flex items-center justify-between">
                <Badge tone={card.positive ? 'success' : 'danger'}>{card.change}</Badge>
                <div className="h-12 w-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={card.data}>
                      <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.25)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
