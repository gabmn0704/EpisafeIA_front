import { Link } from 'react-router-dom'
import { BellRing, HeartPulse, ShieldCheck, Sparkles } from 'lucide-react'
import { buttonClasses } from '@/components/ui/buttonStyles'

const teasers = [
  { icon: HeartPulse, title: 'Pulso en tiempo real', body: 'Tu ritmo cardíaco sumado a tu riesgo diario.', tint: 'bg-coral-soft text-coral' },
  { icon: BellRing, title: 'Alertas anticipadas', body: 'Avisos cuando algo se sale de lo habitual.', tint: 'bg-brand-soft text-brand' },
  { icon: ShieldCheck, title: 'Más tranquilidad', body: 'Tus contactos, un paso más cerca de ayudarte.', tint: 'bg-ok/15 text-ok' },
]

/** Reloj y dispositivos: aún no disponible. Sin emparejamiento ni permisos de Bluetooth. */
export default function DevicesPage() {
  return (
    <div>
      <section className="bg-hero relative overflow-hidden rounded-[2rem] p-6 text-center text-white shadow-elev-3 sm:p-10">
        <div className="grain pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid size-44 place-items-center" aria-hidden>
          <span className="absolute inset-0 animate-[pulse-ring_3s_ease-out_infinite] rounded-full bg-white/20" />
          <span className="absolute inset-0 animate-[pulse-ring_3s_ease-out_1.2s_infinite] rounded-full bg-white/15" />
          <svg viewBox="0 0 64 64" className="relative size-32 drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]">
            <rect x="22" y="2" width="20" height="14" rx="5" fill="#ffffff" opacity="0.35" />
            <rect x="22" y="48" width="20" height="14" rx="5" fill="#ffffff" opacity="0.35" />
            <rect x="11" y="11" width="42" height="42" rx="14" fill="#150c4d" stroke="#c6ff3d" strokeWidth="2.5" />
            <path d="M16 33h9l3.5-8 5.5 15 3.5-9 2 2h9" fill="none" stroke="#c6ff3d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-lime px-3.5 py-1.5 text-sm font-bold text-lime-ink">
          <Sparkles className="size-4" aria-hidden /> Próximamente
        </p>
        <h1 className="relative mt-4 font-display text-[2rem] font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl">Reloj y dispositivos</h1>
        <p className="relative mx-auto mt-3 max-w-md text-base text-white/80">Estamos preparando la conexión con tu reloj. Mientras tanto, tu registro diario y tu medicación ya alimentan a la IA.</p>
        <Link to="/app/registro" className={buttonClasses('lime', 'lg', 'relative mt-6 w-full sm:w-auto')}>
          Registrar mi día
        </Link>
      </section>

      <ul className="stagger mt-4 grid gap-3 sm:grid-cols-3">
        {teasers.map(({ icon: Icon, title, body, tint }) => (
          <li key={title} className="flex items-start gap-3 rounded-[1.75rem] border border-line/70 bg-surface p-4 shadow-elev-1">
            <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${tint}`}>
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-display font-semibold leading-tight">{title}</p>
              <p className="mt-1 text-sm text-muted">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
