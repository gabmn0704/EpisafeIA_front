import { useRef } from 'react'
import { EyeOff, KeyRound, Lock, ShieldCheck, type LucideIcon } from 'lucide-react'
import { gsap, useScrollScene } from './gsap'

const points: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Lock, title: 'Cifrado en tránsito', body: 'Toda la comunicación viaja por HTTPS entre tu dispositivo y nuestros servidores.' },
  { icon: KeyRound, title: 'Sesiones de corta vida', body: 'Tu sesión se renueva sola cada 15 minutos y puedes cerrarla en cualquier momento.' },
  { icon: ShieldCheck, title: 'Contraseñas protegidas', body: 'Se guardan con hash bcrypt: ni nosotros podemos leerlas.' },
  { icon: EyeOff, title: 'Tus datos son tuyos', body: 'No vendemos información de salud. Tú decides qué compartes y con quién.' },
]

const marquee = ['Cifrado HTTPS', 'Tokens de 15 minutos', 'Hash bcrypt', 'Sin venta de datos', 'Informe bajo tu control', 'IA que nunca diagnostica']

export function Security() {
  const root = useRef<HTMLElement>(null)

  useScrollScene(root, ({ full }) => {
    if (!full) return
    gsap.from('[data-sec]', { y: 50, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '[data-sec-grid]', start: 'top 80%' } })
  })

  const row = [...marquee, ...marquee]

  return (
    <section ref={root} id="seguridad" className="grain relative overflow-hidden bg-[#08051f] py-32 text-white md:py-48">
      <div className="pointer-events-none absolute left-1/2 top-0 size-[40rem] -translate-x-1/2 rounded-full bg-brand/30 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <h2 className="max-w-5xl font-display text-[clamp(2.4rem,5vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-balance">
          Información tan sensible merece <span className="text-lime">protección de verdad</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-white/70">La IA propone, pero no diagnostica ni cambia dosis. Siempre te recuerda consultar a tu neurólogo.</p>

        <ul data-sec-grid className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {points.map(({ icon: Icon, title, body }) => (
            <li key={title} data-sec className="rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur">
              <span className="grid size-12 place-items-center rounded-2xl bg-lime text-lime-ink">
                <Icon className="size-6" aria-hidden />
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-white/70">{body}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-24 overflow-hidden border-y border-white/10 py-6" aria-hidden>
        <div className="flex w-max animate-[marquee_32s_linear_infinite] gap-12 whitespace-nowrap motion-reduce:animate-none">
          {row.map((t, i) => (
            <span key={i} className="flex items-center gap-12 font-display text-3xl font-semibold text-white/80">
              {t}
              <span className="size-2 rounded-full bg-lime" />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
