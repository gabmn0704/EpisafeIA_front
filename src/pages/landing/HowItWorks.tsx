import { useRef } from 'react'
import { BrainCircuit, ClipboardList, LineChart, UsersRound, type LucideIcon } from 'lucide-react'
import { gsap, useScrollScene } from './gsap'

const steps: { icon: LucideIcon; title: string; body: string; color: string }[] = [
  { icon: ClipboardList, title: 'Registras tu día en 30 segundos', body: 'Sueño, estrés, cafeína, ejercicio y ánimo. Marcas tus tomas de medicamento con un toque.', color: 'bg-brand text-brand-ink' },
  { icon: BrainCircuit, title: 'La IA aprende tus patrones', body: 'Un modelo logístico se ajusta a tu historial y encuentra relaciones reales, con su evidencia y su margen de error.', color: 'bg-lime text-lime-ink' },
  { icon: LineChart, title: 'Ves tu riesgo de hoy', body: 'Un medidor claro y los factores que más lo mueven, para que sepas qué cuidar antes de que pase algo.', color: 'bg-coral text-white' },
  { icon: UsersRound, title: 'Tu red responde si lo necesitas', body: 'Un toque en el botón de emergencia avisa a tus contactos por prioridad, con tu hora y tu ubicación.', color: 'bg-ink text-bg' },
]

export function HowItWorks() {
  const root = useRef<HTMLElement>(null)

  useScrollScene(root, ({ full, desktop }) => {
    if (!full) return
    if (desktop) {
      gsap.to('[data-pin-title]', {
        ease: 'none',
        scrollTrigger: { trigger: '[data-pin-wrap]', start: 'top 18%', end: 'bottom 80%', pin: '[data-pin-title]', pinSpacing: false },
      })
    }
    gsap.utils.toArray<HTMLElement>('[data-step]').forEach((el) => {
      gsap.fromTo(
        el,
        { scale: 0.88, opacity: 0.35 },
        { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 45%', scrub: true } },
      )
      gsap.to(el, { opacity: 0.25, scale: 0.96, ease: 'none', scrollTrigger: { trigger: el, start: 'bottom 35%', end: 'bottom 5%', scrub: true } })
    })
  })

  return (
    <section ref={root} id="como-funciona" className="bg-surface-2 py-32 md:py-48">
      <div data-pin-wrap className="mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
        <div>
          <div data-pin-title>
            <h2 className="font-display text-[clamp(2.4rem,5vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-balance">
              Cuatro pasos entre un dato y <span className="text-brand">una decisión a tiempo</span>
            </h2>
            <p className="mt-6 max-w-md text-lg text-muted">Sin configuraciones raras ni conocimientos técnicos. Tú vives, EpiSafe IA conecta los puntos.</p>
          </div>
        </div>
        <ol className="space-y-8 lg:space-y-[18vh] lg:pb-[10vh] lg:pt-[8vh]">
          {steps.map(({ icon: Icon, title, body, color }, i) => (
            <li key={title} data-step className={`rounded-[2rem] p-8 sm:p-10 ${color}`}>
              <div className="flex items-center justify-between">
                <span className="grid size-14 place-items-center rounded-2xl bg-white/20">
                  <Icon className="size-7" aria-hidden />
                </span>
                <span className="font-display text-6xl font-bold opacity-30" aria-hidden>
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-10 font-display text-3xl font-semibold leading-tight tracking-tight">{title}</h3>
              <p className="mt-3 max-w-md text-lg opacity-85">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
