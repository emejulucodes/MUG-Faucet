import { Moon, Sun } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { useTheme } from '../../providers/theme-provider'
import { shortenAddress } from '../../utils/format'

type TopNavbarProps = {
  networkName: string
  address?: `0x${string}`
}

export const TopNavbar = ({ networkName, address }: TopNavbarProps) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <Badge tone="accent">{networkName}</Badge>
        <Badge>{shortenAddress(address)}</Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={toggleTheme}>
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
        </Button>
        <appkit-button balance="hide" />
      </div>
    </header>
  )
}
