import type { ReactNode } from 'react'
import clsx from 'clsx'

type Tone = 'brand' | 'lime' | 'coral' | 'ink'

const tones: Record<Tone, string> = {
  brand: 'bg-brand text-brand-ink',
  lime: 'bg-lime text-lime-ink',
  coral: 'bg-coral text-white',
  ink: 'bg-ink text-bg',
}

export function StatTile({
  label,
  value,
  unit,
  caption,
  icon,
  tone = 'brand',
  className,
}: {
  label: string
  value: ReactNode
  unit?: string
  caption?: string
  icon: ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <div className={clsx('relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] p-4 sm:p-6', tones[tone], className)}>
      <div className="flex items-center justify-between">
        <p className="text-[0.8rem] font-semibold leading-tight opacity-85">{label}</p>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/20">{icon}</span>
      </div>
      <div className="mt-5 sm:mt-8">
        <p className="font-display text-4xl sm:text-5xl font-bold leading-none tabular-nums tracking-tight">
          {value}
          {unit && <span className="ml-1.5 text-xl font-semibold opacity-80">{unit}</span>}
        </p>
        {caption && <p className="mt-1.5 text-[0.8rem] leading-snug opacity-85">{caption}</p>}
      </div>
    </div>
  )
}
