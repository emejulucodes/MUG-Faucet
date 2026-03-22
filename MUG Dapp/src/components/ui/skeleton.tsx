import { cn } from '../../lib/utils/cn'

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-xl bg-muted', className)} />
)
