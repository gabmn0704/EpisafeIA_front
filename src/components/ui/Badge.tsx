import type { ReactNode } from 'react'
import clsx from 'clsx'

type Tone = 'brand' | 'lime' | 'coral' | 'amber' | 'ok' | 'neutral'

const tones: Record<Tone, string> = {
  brand: 'bg-brand-soft text-brand',
  lime: 'bg-lime text-lime-ink',
  coral: 'bg-coral-soft text-coral',
  amber: 'bg-amber/20 text-ink',
  ok: 'bg-ok/15 text-ok',
  neutral: 'bg-surface-2 text-muted',
}

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', tones[tone], className)}>{children}</span>
}
