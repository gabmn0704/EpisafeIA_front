import clsx from 'clsx'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={clsx('size-9', className)} aria-hidden>
      <rect width="64" height="64" rx="18" fill="#5B2BFF" />
      <path d="M8 34h12l6-14 8 26 6-16 4 4h12" fill="none" stroke="#C6FF3D" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Logo({ className, tone = 'auto' }: { className?: string; tone?: 'auto' | 'light' }) {
  return (
    <span className={clsx('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className={clsx('font-display text-xl font-bold tracking-tight', tone === 'light' ? 'text-white' : 'text-ink')}>
        EpiSafe<span className="text-brand"> IA</span>
      </span>
    </span>
  )
}
