import { useRef } from 'react'
import { gsap, useScrollScene } from './gsap'

const TEXT =
  'Una crisis parece llegar sin aviso. Casi nunca es así: una noche de poco sueño, una dosis olvidada, días de estrés acumulado. Las señales ya están en tus datos, y hoy nadie las junta por ti.'

export function Problem() {
  const root = useRef<HTMLElement>(null)
  const words = TEXT.split(' ')

  useScrollScene(root, ({ full }) => {
    if (!full) return
    gsap.fromTo(
      '[data-word]',
      { opacity: 0.12 },
      { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: '[data-scrub]', start: 'top 80%', end: 'bottom 45%', scrub: 0.6 } },
    )
    gsap.from('[data-fact]', { y: 60, opacity: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '[data-facts]', start: 'top 85%' } })
  })

  return (
    <section ref={root} id="problema" className="relative bg-bg py-32 md:py-48">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p data-scrub className="font-display text-[clamp(1.9rem,4.4vw,4rem)] font-medium leading-[1.12] tracking-[-0.025em] text-ink">
          {words.map((w, i) => (
            <span key={i} data-word className="mr-[0.26em] inline-block">
              {w}
            </span>
          ))}
        </p>

        <div data-facts className="mt-24 grid gap-5 md:grid-cols-3 md:gap-6">
          <div data-fact className="rounded-[2rem] bg-brand p-8 text-brand-ink md:p-10">
            <p className="font-display text-7xl font-bold tracking-tight">50 M</p>
            <p className="mt-4 text-lg opacity-90">de personas viven con epilepsia en el mundo, según la Organización Mundial de la Salud.</p>
          </div>
          <div data-fact className="rounded-[2rem] bg-lime p-8 text-lime-ink md:p-10">
            <p className="font-display text-7xl font-bold tracking-tight">70%</p>
            <p className="mt-4 text-lg">podría vivir sin crisis con diagnóstico y tratamiento adecuados, según la OMS.</p>
          </div>
          <div data-fact className="rounded-[2rem] border border-line bg-surface p-8 md:p-10">
            <p className="font-display text-7xl font-bold tracking-tight text-coral">1</p>
            <p className="mt-4 text-lg text-muted">dosis olvidada o una mala noche basta para cambiar tu riesgo. Medirlo es el primer paso para prevenirlo.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
