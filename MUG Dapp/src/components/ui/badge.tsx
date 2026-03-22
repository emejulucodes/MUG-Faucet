import { tv, type VariantProps } from 'tailwind-variants'
import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils/cn'

const badgeVariants = tv({
  base: 'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
  variants: {
    tone: {
      default: 'border-border bg-muted text-muted-foreground',
      success: 'border-success/40 bg-success/10 text-success',
      warning: 'border-warning/40 bg-warning/10 text-warning',
      danger: 'border-danger/40 bg-danger/10 text-danger',
      accent: 'border-primary/40 bg-primary/10 text-primary',
    },
  },
  defaultVariants: {
    tone: 'default',
  },
})

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

export const Badge = ({ className, tone, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ tone }), className)} {...props} />
)
