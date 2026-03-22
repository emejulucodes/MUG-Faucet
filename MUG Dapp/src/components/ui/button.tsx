import { Slot } from '@radix-ui/react-slot'
import { tv, type VariantProps } from 'tailwind-variants'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils/cn'

const buttonVariants = tv({
  base: 'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-60',
  variants: {
    variant: {
      primary: 'bg-primary text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25',
      secondary: 'border border-border bg-card text-foreground hover:bg-muted',
      ghost: 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
      danger: 'bg-danger text-white hover:bg-danger/90',
    },
    size: {
      sm: 'h-9 px-3',
      md: 'h-10 px-4',
      lg: 'h-12 px-5 text-base',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export const Button = ({ asChild, className, variant, size, ...props }: ButtonProps) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
