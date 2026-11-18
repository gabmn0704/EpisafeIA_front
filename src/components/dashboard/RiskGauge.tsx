import { useEffect } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import type { RiskLevel } from '@/lib/api/types'
import { riskLabel } from '@/lib/format'

const R = 88
const C = 2 * Math.PI * R
const SWEEP = 0.75 // anillo de 270 grados
const ARC = C * SWEEP

/** Colores vivos sobre el fondo oscuro del hero, por nivel de riesgo. */
const heroColor: Record<string, string> = { low: '#4df0a8', moderate: '#ffd04a', high: '#ff6b86', critical: '#ff8aa0' }

/** Anillo de riesgo de 270 grados: el arco se dibuja y el número cuenta al montar. */
export function RiskGauge({ score, level }: { score: number; level: RiskLevel }) {
  const reduce = useReducedMotion()
  const value = useMotionValue(reduce ? score : 0)
  const dash = useTransform(value, (v) => `${(Math.min(100, v) / 100) * ARC} ${C}`)
  const rounded = useTransform(value, (v) => Math.round(v))

  useEffect(() => {
    if (reduce) {
      value.set(score)
      return
    }
    const controls = animate(value, score, { duration: 1.4, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [score, reduce, value])

  const color = heroColor[level] ?? '#ffffff'

  return (
    <div className="relative mx-auto aspect-[220/190] w-full max-w-[17.5rem]" role="img" aria-label={`Riesgo de hoy: ${score} de 100, nivel ${riskLabel[level]}`}>
      <svg viewBox="0 0 220 190" className="absolute inset-0 size-full overflow-visible">
        <g transform="rotate(135 110 102)">
        <circle cx="110" cy="102" r={R} fill="none" stroke="rgb(255 255 255 / 0.14)" strokeWidth="18" strokeLinecap="round" strokeDasharray={`${ARC} ${C}`} />
        <motion.circle cx="110" cy="102" r={R} fill="none" stroke={color} strokeWidth="18" strokeLinecap="round" style={{ strokeDasharray: dash, filter: `drop-shadow(0 0 10px ${color})` }} />
              </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pb-3 text-center text-white">
        <motion.span className="font-display text-[5.25rem] font-bold leading-none tabular-nums tracking-tighter">{rounded}</motion.span>
        <span className="mt-1 rounded-full px-3.5 py-1 text-sm font-bold text-[#150c4d]" style={{ background: color }}>
          Riesgo {riskLabel[level]?.toLowerCase()}
        </span>
      </div>
    </div>
  )
}
