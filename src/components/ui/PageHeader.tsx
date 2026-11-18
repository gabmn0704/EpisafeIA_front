import type { ReactNode } from 'react'

export function PageHeader({ title, description, actions, eyebrow }: { title: string; description?: string; actions?: ReactNode; eyebrow?: string }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.12em] text-brand">{eyebrow}</p>}
        <h1 className="font-display text-[1.9rem] font-bold leading-[1.05] tracking-tight text-balance sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-[0.95rem] leading-snug text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3 no-print max-sm:[&>*:only-child]:w-full">{actions}</div>}
    </header>
  )
}
