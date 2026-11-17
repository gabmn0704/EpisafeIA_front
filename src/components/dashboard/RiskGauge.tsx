import { useEffect } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import type { RiskLevel } from '@/lib/api/types'
import { riskColor, riskLabel } from '@/lib/format'

const R = 96
const ARC = Math.PI * R // half circle length

/** Semi-circular risk meter. The needle sweeps and the number counts up on mount. */
export function RiskGauge({ score, level }: { score: number; level: RiskLevel }) {
  const reduce = useReducedMotion()
  const value = useMotionValue(reduce ? score : 0)
  const dash = useTransform(value, (v) => `${(v / 100) * ARC} ${ARC}`)
  const rounded = useTransform(value, (v) => Math.round(v))
  const angle = useTransform(value, (v) => -90 + (v / 100) * 180)

  useEffect(() => {
    if (reduce) {
      value.set(score)
      return
    }
    const controls = animate(value, score, { duration: 1.6, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [score, reduce, value])

  const color = riskColor[level] ?? 'var(--brand)'

  return (
    <div className="relative mx-auto w-full max-w-[22rem]" role="img" aria-label={`Riesgo de hoy: ${score} de 100, nivel ${riskLabel[level]}`}>
      <svg viewBox="0 0 240 140" className="w-full overflow-visible">
        <defs>
          <linearGradient id="gauge-track" x1="0" x2="1">
            <stop offset="0" stopColor="var(--ok)" />
            <stop offset="0.5" stopColor="var(--amber)" />
            <stop offset="1" stopColor="var(--coral)" />
          </linearGradient>
        </defs>
        <path d="M24 120 A96 96 0 0 1 216 120" fill="none" stroke="var(--surface-2)" strokeWidth="20" strokeLinecap="round" />
        <path d="M24 120 A96 96 0 0 1 216 120" fill="none" stroke="url(#gauge-track)" strokeWidth="20" strokeLinecap="round" opacity="0.28" />
        <motion.path d="M24 120 A96 96 0 0 1 216 120" fill="none" stroke={color} strokeWidth="20" strokeLinecap="round" style={{ strokeDasharray: dash }} />
        <motion.g style={{ rotate: angle, originX: '120px', originY: '120px' }}>
          <line x1="120" y1="120" x2="120" y2="44" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="120" cy="120" r="9" fill="var(--ink)" />
          <circle cx="120" cy="120" r="3.5" fill="var(--lime)" />
        </motion.g>
      </svg>
      <div className="-mt-2 text-center">
        <motion.span className="font-display text-6xl font-bold tabular-nums tracking-tight">{rounded}</motion.span>
        <span className="font-display text-2xl font-semibold text-muted">/100</span>
        <p className="mt-1 text-lg font-bold" style={{ color }}>
          Riesgo {riskLabel[level]?.toLowerCase()}
        </p>
      </div>
    </div>
  )
}
