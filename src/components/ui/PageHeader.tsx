import type { ReactNode } from 'react'

export function PageHeader({ title, description, actions, eyebrow }: { title: string; description?: string; actions?: ReactNode; eyebrow?: string }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-2 text-sm font-semibold text-brand">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3 no-print">{actions}</div>}
    </header>
  )
}
