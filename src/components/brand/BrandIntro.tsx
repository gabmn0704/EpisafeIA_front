import { useEffect, useRef, useState } from 'react'
import { markIntroSeen, shouldPlayIntro } from './intro'

const SHIELD = 'M256 36c68 36 142 52 196 52v170c0 112-84 184-196 220C144 442 60 370 60 258V88c54 0 128-16 196-52Z'
const PULSE = 'M104 270h76l40-96 62 190 42-118 22 24h62'

/**
 * Intro de marca (~1.7 s): el escudo se dibuja, el pulso se traza y un brillo lo recorre.
 * Es saltable (toque, Escape o botón) y se muestra una vez por sesión. Mismo SVG que public/logo.svg.
 */
export function BrandIntro() {
  const [playing, setPlaying] = useState(shouldPlayIntro)
  const root = useRef<HTMLDivElement>(null)
  const skip = useRef<() => void>(() => {})

  useEffect(() => {
    if (!playing) {
      markIntroSeen()
      return
    }
    let cancelled = false
    let tl: { kill: () => void; progress: (n: number) => unknown } | null = null
    const finish = () => {
      if (cancelled) return
      cancelled = true
      tl?.kill()
      markIntroSeen()
      setPlaying(false)
    }
    skip.current = finish
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') finish()
    }
    window.addEventListener('keydown', onKey)

    void import('gsap').then(({ default: gsap }) => {
      const el = root.current
      if (cancelled || !el) return
      const q = <T extends Element>(s: string) => el.querySelector<T>(s)
      const outline = q<SVGPathElement>('[data-outline]')
      const fill = q<SVGGElement>('[data-fill]')
      const pulse = q<SVGPathElement>('[data-pulse]')
      const dot = q<SVGCircleElement>('[data-dot]')
      const shine = q<SVGRectElement>('[data-shine]')
      const word = q<HTMLElement>('[data-word]')
      if (!outline || !fill || !pulse || !dot || !shine || !word) return finish()
      const oLen = outline.getTotalLength()
      const pLen = pulse.getTotalLength()
      gsap.set(outline, { strokeDasharray: oLen, strokeDashoffset: oLen })
      gsap.set(pulse, { strokeDasharray: pLen, strokeDashoffset: pLen, opacity: 0 })
      gsap.set(fill, { opacity: 0, scale: 0.92, transformOrigin: '50% 50%' })
      gsap.set(dot, { scale: 0, transformOrigin: '50% 50%' })
      gsap.set(shine, { x: -260 })
      gsap.set(word, { opacity: 0, y: 10 })
      const t = gsap.timeline({ onComplete: () => gsap.to(el, { opacity: 0, duration: 0.3, ease: 'power2.out', onComplete: finish }) })
      t.to(outline, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut' })
        .to(fill, { opacity: 1, scale: 1, duration: 0.32, ease: 'power3.out' }, '-=0.1')
        .to(outline, { opacity: 0, duration: 0.25 }, '<')
        .set(pulse, { opacity: 1 })
        .to(pulse, { strokeDashoffset: 0, duration: 0.42, ease: 'power2.inOut' })
        .to(dot, { scale: 1, duration: 0.28, ease: 'back.out(3)' }, '-=0.05')
        .to(shine, { x: 520, duration: 0.5, ease: 'power1.inOut' }, '-=0.2')
        .to(word, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }, '-=0.5')
        .to({}, { duration: 0.15 })
      tl = t
    })

    return () => {
      cancelled = true
      window.removeEventListener('keydown', onKey)
      tl?.kill()
    }
  }, [playing])

  if (!playing) return null

  return (
    <div
      ref={root}
      role="dialog"
      aria-label="EpiSafe IA"
      onClick={() => skip.current()}
      className="fixed inset-0 z-[300] grid place-items-center bg-[radial-gradient(120%_90%_at_50%_0%,#3a1fb8_0%,#150c4d_60%,#0a0628_100%)]"
    >
      <div className="relative">
        <svg viewBox="0 0 512 512" className="size-32" aria-hidden>
          <defs>
            <linearGradient id="in-shield" x1="96" y1="40" x2="416" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#8B5CFF" />
              <stop offset="0.55" stopColor="#5B2BFF" />
              <stop offset="1" stopColor="#2A0F9C" />
            </linearGradient>
            <clipPath id="in-clip">
              <path d={SHIELD} />
            </clipPath>
            <linearGradient id="in-shine" x1="0" x2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.45" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path data-outline d={SHIELD} fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="6" strokeLinejoin="round" />
          <g data-fill>
            <path d={SHIELD} fill="url(#in-shield)" />
            <g clipPath="url(#in-clip)">
              <rect data-shine x="0" y="0" width="120" height="512" fill="url(#in-shine)" transform="skewX(-18)" />
            </g>
          </g>
          <path data-pulse d={PULSE} fill="none" stroke="#C6FF3D" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
          <circle data-dot cx="404" cy="270" r="19" fill="#FF3D5E" />
        </svg>
        <p data-word className="absolute left-1/2 top-full mt-5 w-max -translate-x-1/2 font-display text-3xl font-bold tracking-tight text-white">
          EpiSafe<span className="text-lime"> IA</span>
        </p>
      </div>
      <button type="button" onClick={(e) => { e.stopPropagation(); skip.current() }} className="press absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-5 min-h-11 rounded-full px-4 text-sm font-semibold text-white/70">
        Saltar
      </button>
    </div>
  )
}
