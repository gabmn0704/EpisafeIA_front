import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { gsap, useScrollScene } from './gsap'

export function FinalCta() {
  const root = useRef<HTMLElement>(null)

  useScrollScene(root, ({ full }) => {
    if (!full) return
    gsap.from('[data-cta]', { scale: 0.9, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 70%' } })
  })

  return (
    <section ref={root} className="bg-bg px-4 pb-8 pt-32 md:pt-48">
      <div data-cta className="grain relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-[radial-gradient(90%_100%_at_50%_0%,#6a3cff_0%,#3a1fb8_45%,#0b0630_100%)] px-6 py-24 text-center text-white sm:px-12 md:py-36">
        <div className="pointer-events-none absolute -bottom-32 left-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-lime/30 blur-[120px]" />
        <h2 className="relative mx-auto max-w-5xl text-balance font-display text-[clamp(2.6rem,6.2vw,6rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
          Tu próxima crisis puede avisar. <span className="text-lime">Escúchala a tiempo.</span>
        </h2>
        <p className="relative mx-auto mt-6 max-w-xl text-lg text-white/75">Crea tu cuenta en un minuto. Es gratis y puedes cerrarla cuando quieras.</p>
        <div className="relative mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/registro" className={buttonClasses('lime', 'lg', 'min-w-60')}>
            Empezar ahora <ArrowUpRight className="size-5" aria-hidden />
          </Link>
          <Link to="/iniciar-sesion" className={buttonClasses('outline', 'lg', 'min-w-60 !border-white/30 !bg-white/5 !text-white hover:!bg-white/15 hover:!text-white')}>
            Ya tengo cuenta
          </Link>
        </div>
      </div>

      <footer className="mx-auto mt-16 flex max-w-7xl flex-col items-center justify-between gap-6 px-2 pb-8 text-sm text-muted sm:flex-row">
        <Logo />
        <nav aria-label="Pie de página" className="flex flex-wrap justify-center gap-x-8 gap-y-2 font-medium">
          <a href="#problema" className="hover:text-ink">El problema</a>
          <a href="#como-funciona" className="hover:text-ink">Cómo funciona</a>
          <a href="#funciones" className="hover:text-ink">Funciones</a>
          <a href="#seguridad" className="hover:text-ink">Seguridad</a>
        </nav>
        <p className="max-w-xs text-center sm:text-right">EpiSafe IA no reemplaza la atención médica. Ante una emergencia, EpiSafe te lleva a llamar o escribir a tus propios contactos.</p>
      </footer>
    </section>
  )
}
