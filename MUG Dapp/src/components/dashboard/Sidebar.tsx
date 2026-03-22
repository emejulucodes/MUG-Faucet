import { BarChart3, Droplets, LayoutDashboard, Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils/cn'

type SidebarProps = {
  collapsed: boolean
  onToggle: () => void
}

const items = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Faucet', icon: Droplets },
  { label: 'Activity', icon: Menu },
  { label: 'Analytics', icon: BarChart3 },
]

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  return (
    <aside className={cn('sticky top-0 hidden h-screen border-r border-border bg-card/75 backdrop-blur lg:block', collapsed ? 'w-20' : 'w-64')}>
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.p
              key="full"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              className="text-sm font-semibold text-foreground"
            >
              MUG Dashboard
            </motion.p>
          ) : (
            <motion.div key="short" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-semibold text-primary">
              MUG
            </motion.div>
          )}
        </AnimatePresence>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </Button>
      </div>

      <nav className="space-y-1 p-3">
        {items.map((item) => (
          <button key={item.label} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <item.icon size={16} />
            {!collapsed ? item.label : null}
          </button>
        ))}
      </nav>
    </aside>
  )
}
