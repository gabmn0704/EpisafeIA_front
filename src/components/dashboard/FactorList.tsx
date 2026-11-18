import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import type { RiskFactor } from '@/lib/api/types'

export function FactorList({ factors }: { factors: RiskFactor[] }) {
  const max = Math.max(1, ...factors.map((f) => Math.abs(f.impact)))
  return (
    <ul className="space-y-4">
      {factors.map((f, i) => {
        const up = f.direction === 'up'
        const Icon = f.direction === 'neutral' ? Minus : up ? ArrowUpRight : ArrowDownRight
        const pct = (Math.abs(f.impact) / max) * 100
        return (
          <li key={f.name}>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <span className={`grid size-6 place-items-center rounded-full ${up ? 'bg-coral-soft text-coral' : 'bg-ok/15 text-ok'}`}>
                  <Icon className="size-3.5" aria-hidden />
                </span>
                {f.name}
              </span>
              <span className={`text-sm font-bold tabular-nums ${up ? 'text-coral' : 'text-ok'}`}>
                {f.impact > 0 ? '+' : ''}
                {f.impact}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
              <motion.div
                className={`h-full rounded-full ${up ? 'bg-coral' : 'bg-ok'}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p className="mt-1.5 text-sm text-muted">{f.detail}</p>
          </li>
        )
      })}
    </ul>
  )
}
