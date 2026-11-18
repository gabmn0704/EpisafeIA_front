import type { HTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('min-w-0 rounded-[1.75rem] border border-line/70 bg-surface p-5 shadow-elev-1 sm:p-6', className)} {...rest} />
}

export function CardHeader({ title, subtitle, action, icon }: { title: string; subtitle?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        {icon && <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand">{icon}</span>}
        <div className="min-w-0">
          <h3 className="truncate font-display text-[1.05rem] font-semibold text-ink">{title}</h3>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
