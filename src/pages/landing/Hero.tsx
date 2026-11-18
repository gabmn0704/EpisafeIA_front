import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { gsap, useScrollScene } from './gsap'

function EegPill({ className = '' }: { className?: string }) {
  return (
    <span className={`relative mx-2 inline-block h-[0.78em] w-[1.9em] -translate-y-[0.08em] overflow-hidden rounded-full bg-lime align-middle ${className}`} aria-hidden>
      <svg viewBox="0 0 120 40" className="absolute inset-0 size-full" preserveAspectRatio="none">
        <path d="M0 20h18l5-12 8 26 7-20 5 6h15l5-14 7 28 6-14h20" fill="none" stroke="#1b2a00" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export function Hero() {
  const root = useRef<HTMLElement>(null)

  useScrollScene(root, ({ full }) => {
    if (!full) return
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
    tl.from('[data-hero-word]', { yPercent: 110, opacity: 0, duration: 1.1, stagger: 0.07 })
      .from('[data-hero-sub]', { y: 24, opacity: 0, duration: 0.9 }, '-=0.6')
      .from('[data-hero-cta]', { y: 20, opacity: 0, duration: 0.8 }, '-=0.5')
      .from('[data-hero-orb]', { scale: 0.6, opacity: 0, duration: 1.6, stagger: 0.2 }, 0)
    gsap.to('[data-hero-orb]', { y: -60, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
    gsap.to('[data-hero-content]', { opacity: 0.15, y: -80, ease: 'none', scrollTrigger: { trigger: root.current, start: 'center top', end: 'bottom top', scrub: true } })
  })

  const line1 = ['Anticipa', 'tu', 'próxima', 'crisis']
  const line2 = ['y', 'vive', 'con']
  const line3 = ['más', 'calma']

  return (
    <section ref={root} className="grain relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#08051f] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_50%_0%,#4b22e6_0%,rgba(75,34,230,0)_70%),radial-gradient(50%_50%_at_90%_90%,rgba(255,61,94,0.35)_0%,rgba(255,61,94,0)_70%),radial-gradient(45%_45%_at_5%_80%,rgba(198,255,61,0.18)_0%,rgba(198,255,61,0)_70%)]" />
      <div data-hero-orb className="pointer-events-none absolute -left-32 top-1/4 -z-10 size-[28rem] rounded-full bg-brand/40 blur-[120px]" />
      <div data-hero-orb className="pointer-events-none absolute -right-24 bottom-10 -z-10 size-[24rem] rounded-full bg-coral/30 blur-[120px]" />

      <svg className="pointer-events-none absolute inset-x-0 bottom-16 -z-10 w-full opacity-30" viewBox="0 0 1440 160" fill="none" aria-hidden>
        <path d="M0 90h380l30-70 50 140 40-100 30 30h210l30-60 40 110 30-50h570" stroke="#C6FF3D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div data-hero-content className="mx-auto w-full max-w-7xl px-5 pb-24 pt-36 text-center sm:px-8">
        <h1 className="mx-auto max-w-6xl text-balance font-display text-[clamp(2.75rem,6.4vw,6.25rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
          {[line1, line2, line3].map((words, li) => (
            <span key={li} className={li === 0 ? 'block' : 'inline'}>
              {words.map((w) => (
                <span key={w + li} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                  <span data-hero-word className={`inline-block pr-[0.22em] ${w === 'calma' ? 'text-lime' : ''}`}>
                    {w}
                  </span>
                </span>
              ))}
              {li === 1 && <EegPill />}
            </span>
          ))}
        </h1>
        <p data-hero-sub className="mx-auto mt-8 max-w-2xl text-lg text-white/75 sm:text-xl">
          EpiSafe IA aprende de tu sueño, tu medicación y tus hábitos para avisarte cuando tu riesgo sube, y alerta a quienes te cuidan si lo necesitas.
        </p>
        <div data-hero-cta className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/registro" className={buttonClasses('lime', 'lg', 'min-w-56')}>
            Crear mi cuenta gratis <ArrowRight className="size-5" aria-hidden />
          </Link>
          <a href="#como-funciona" className={buttonClasses('outline', 'lg', 'min-w-56 !border-white/30 !bg-white/5 !text-white hover:!bg-white/15 hover:!text-white')}>
            Ver cómo funciona
          </a>
        </div>
      </div>

      <a href="#problema" aria-label="Seguir bajando" className="absolute bottom-6 left-1/2 grid size-11 -translate-x-1/2 place-items-center rounded-full border border-white/25 text-white/80 transition hover:bg-white/10">
        <ChevronDown className="size-5 animate-bounce" />
      </a>
    </section>
  )
}
