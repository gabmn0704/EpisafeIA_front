import { useRef } from 'react'
import { BellRing, FileText, HeartPulse, Pill, Siren, Sparkles } from 'lucide-react'
import { gsap, useScrollScene } from './gsap'

function MiniGauge() {
  return (
    <svg viewBox="0 0 200 110" className="w-full max-w-[16rem]" aria-hidden>
      <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="16" strokeLinecap="round" />
      <path d="M20 100 A80 80 0 0 1 150 38" fill="none" stroke="#C6FF3D" strokeWidth="16" strokeLinecap="round" />
      <line x1="100" y1="100" x2="146" y2="52" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="100" r="8" fill="#fff" />
    </svg>
  )
}

function MiniPulse() {
  return (
    <svg viewBox="0 0 400 80" className="w-full" fill="none" aria-hidden>
      <path d="M0 40h90l14-30 22 62 18-44 12 12h60l14-26 20 48 14-22h136" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Features() {
  const root = useRef<HTMLElement>(null)

  useScrollScene(root, ({ full }) => {
    if (!full) return
    gsap.from('[data-card]', { y: 80, opacity: 0, scale: 0.96, duration: 1, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '[data-bento]', start: 'top 80%' } })
  })

  const card = 'group relative overflow-hidden rounded-[2rem] p-8 sm:p-10'
  const hoverImg = 'transition-transform duration-700 ease-out group-hover:scale-105'

  return (
    <section ref={root} id="funciones" className="bg-bg py-32 md:py-48">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 className="max-w-5xl font-display text-[clamp(2.4rem,5vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-balance">
          Todo lo que necesitas, <span className="text-brand">en un solo lugar</span> que sí entiende tu condición
        </h2>

        <div data-bento className="mt-16 grid auto-rows-[minmax(15rem,auto)] grid-flow-dense grid-cols-1 gap-5 md:grid-cols-6">
          <article data-card className={`${card} bg-brand text-brand-ink md:col-span-4`}>
            <div className="grid h-full gap-6 sm:grid-cols-[1.2fr_1fr] sm:items-end">
              <div>
                <Sparkles className="size-8 text-lime" aria-hidden />
                <h3 className="mt-5 font-display text-4xl font-semibold tracking-tight">Riesgo del día, explicado</h3>
                <p className="mt-3 max-w-md text-lg opacity-85">Un puntaje de 0 a 100 y los cinco factores que lo mueven: qué sube tu riesgo y qué lo baja.</p>
              </div>
              <div className={hoverImg}>
                <MiniGauge />
              </div>
            </div>
          </article>

          <article data-card className={`${card} bg-coral text-white md:col-span-2 md:row-span-2`}>
            <div className="flex h-full flex-col justify-between gap-10">
              <div>
                <Siren className="size-9" aria-hidden />
                <h3 className="mt-5 font-display text-4xl font-semibold tracking-tight">Emergencia en un toque</h3>
                <p className="mt-3 text-lg opacity-90">Cuenta regresiva para cancelar, ubicación y aviso por orden de prioridad a tus contactos.</p>
              </div>
              <div className={`relative mx-auto grid size-40 place-items-center rounded-full bg-white text-coral ${hoverImg}`}>
                <span className="absolute inset-0 animate-[pulse-ring_2.2s_ease-out_infinite] rounded-full bg-white/50" aria-hidden />
                <span className="relative font-display text-3xl font-extrabold">AYUDA</span>
              </div>
            </div>
          </article>

          <article data-card className={`${card} border border-line bg-surface md:col-span-2`}>
            <Pill className="size-8 text-brand" aria-hidden />
            <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight">Medicación sin olvidos</h3>
            <p className="mt-3 text-muted">Agenda del día, autocompletado de fármacos y tu adherencia de 30 días.</p>
          </article>

          <article data-card className={`${card} bg-lime text-lime-ink md:col-span-2`}>
            <FileText className="size-8" aria-hidden />
            <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight">Informe para tu neurólogo</h3>
            <p className="mt-3 opacity-85">Crisis, tratamiento y patrones en un PDF listo para imprimir.</p>
          </article>

          <article data-card className={`${card} bg-ink text-bg md:col-span-6`}>
            <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <HeartPulse className="size-8 text-coral" aria-hidden />
                  <BellRing className="size-8 text-lime" aria-hidden />
                </div>
                <h3 className="mt-5 font-display text-4xl font-semibold tracking-tight">Tu reloj, muy pronto</h3>
                <p className="mt-3 max-w-md text-lg opacity-80">Estamos preparando la conexión con tu reloj para sumar tu pulso al análisis. Por ahora, tu registro diario y tu medicación ya alimentan a la IA.</p>
              </div>
              <div className={`rounded-3xl bg-white/5 p-6 ${hoverImg}`}>
                <MiniPulse />
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
