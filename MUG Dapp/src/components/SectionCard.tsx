import type { PropsWithChildren, ReactNode } from 'react'
import { clsx } from 'clsx'

type SectionCardProps = PropsWithChildren<{
  title: string
  subtitle?: string
  rightSlot?: ReactNode
  className?: string
}>

export const SectionCard = ({ title, subtitle, rightSlot, className, children }: SectionCardProps) => {
  return (
    <section
      className={clsx(
        'group rounded-2xl border border-slate-800/90 bg-slate-900/80 p-6 shadow-[0_8px_20px_-12px_rgba(15,23,42,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-[0_18px_34px_-18px_rgba(14,116,144,0.55)] md:p-7',
        className,
      )}
    >
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-100">{title}</h2>
          {subtitle ? <p className="mt-1.5 text-sm text-slate-400">{subtitle}</p> : null}
        </div>
        {rightSlot}
      </header>
      {children}
    </section>
  )
}
