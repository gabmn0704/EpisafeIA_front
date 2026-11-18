import { useId } from 'react'
import clsx from 'clsx'

/**
 * Marca de EpiSafe IA: escudo con pulso. Misma geometría que public/logo.svg
 * (fuente única, reutilizable en la app móvil).
 */
export function LogoMark({ className }: { className?: string }) {
  // Ids únicos por instancia: un gradiente definido dentro de un SVG oculto (display:none) no se resuelve.
  const uid = useId().replace(/:/g, '')
  const shield = `es-shield-${uid}`
  const shine = `es-shine-${uid}`
  return (
    <svg viewBox="0 0 512 512" className={clsx('size-9', className)} aria-hidden>
      <defs>
        <linearGradient id={shield} x1="96" y1="40" x2="416" y2="480" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8B5CFF" />
          <stop offset="0.55" stopColor="#5B2BFF" />
          <stop offset="1" stopColor="#2A0F9C" />
        </linearGradient>
        <linearGradient id={shine} x1="256" y1="40" x2="256" y2="300" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M256 36c68 36 142 52 196 52v170c0 112-84 184-196 220C144 442 60 370 60 258V88c54 0 128-16 196-52Z" fill={`url(#${shield})`} />
      <path d="M256 36c68 36 142 52 196 52v170c0 112-84 184-196 220C144 442 60 370 60 258V88c54 0 128-16 196-52Z" fill={`url(#${shine})`} />
      <path d="M104 270h76l40-96 62 190 42-118 22 24h62" fill="none" stroke="#C6FF3D" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="404" cy="270" r="19" fill="#FF3D5E" />
    </svg>
  )
}

export function Logo({ className, tone = 'auto' }: { className?: string; tone?: 'auto' | 'light' }) {
  return (
    <span className={clsx('inline-flex items-center gap-2.5 whitespace-nowrap', className)}>
      <LogoMark />
      <span className={clsx('font-display text-xl font-bold tracking-tight', tone === 'light' ? 'text-white' : 'text-ink')}>
        EpiSafe<span className={tone === 'light' ? 'text-lime' : 'text-brand'}> IA</span>
      </span>
    </span>
  )
}
