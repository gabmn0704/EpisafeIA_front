import type { HTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('rounded-3xl border border-line bg-surface p-6 shadow-card', className)} {...rest} />
}

export function CardHeader({ title, subtitle, action, icon }: { title: string; subtitle?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        {icon && <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand">{icon}</span>}
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-semibold text-ink">{title}</h3>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
