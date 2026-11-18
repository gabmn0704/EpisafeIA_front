import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, BellRing, CalendarCheck2, Flame, HeartPulse, ShieldCheck, Sparkles, Watch } from 'lucide-react'
import { FactorList } from '@/components/dashboard/FactorList'
import { RiskGauge } from '@/components/dashboard/RiskGauge'
import { RiskHistoryChart } from '@/components/dashboard/RiskHistoryChart'
import { StatTile } from '@/components/dashboard/StatTile'
import { Badge } from '@/components/ui/Badge'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { Card, CardHeader } from '@/components/ui/Card'
import { ErrorState, Skeleton } from '@/components/ui/States'
import { useQuery } from '@/hooks/useQuery'
import { aiApi, dashboardApi } from '@/lib/api/endpoints'
import { formatDate, greeting, percent, relativeTime } from '@/lib/format'
import { useAuth } from '@/providers/AuthProvider'

const alertText: Record<string, string> = {
  tachycardia: 'Taquicardia sostenida',
  motion_convulsive: 'Movimiento convulsivo',
  hr_anomaly: 'Pulso fuera de lo habitual',
  fall: 'Posible caída',
}

/** El resplandor del hero cambia con el nivel de riesgo. */
const glow: Record<string, string> = { low: '#18d98b', moderate: '#ffb020', high: '#ff3d7a', critical: '#ff1f4b' }

export default function DashboardPage() {
  const { user } = useAuth()
  const summary = useQuery(() => dashboardApi.summary())
  const history = useQuery(() => aiApi.riskHistory(30))
  const first = user?.fullName.split(' ')[0] ?? ''

  if (summary.error) return <ErrorState error={summary.error} onRetry={summary.reload} />

  const s = summary.data

  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand">{formatDate(new Date().toISOString(), { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="mt-1 font-display text-[1.9rem] font-bold leading-[1.05] tracking-tight text-balance sm:text-4xl">
            {greeting()}, {first}
          </h1>
        </div>
        <Link to="/app/registro" className={buttonClasses('primary', 'md', 'max-sm:hidden shrink-0')}>
          Registrar mi día
        </Link>
      </div>

      <div className="stagger grid grid-flow-dense grid-cols-2 gap-3 sm:gap-5 md:grid-cols-12">
        <section style={{ ['--hero-glow' as string]: glow[s?.risk?.level ?? ''] ?? undefined }} className="relative col-span-2 overflow-hidden rounded-[2rem] bg-hero p-5 text-white shadow-elev-3 sm:p-7 md:col-span-5 md:row-span-2">
          <div className="grain pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-sans text-sm font-semibold tracking-normal text-white/85">
                <Sparkles className="size-4 text-lime" aria-hidden /> Riesgo de hoy con IA
              </h2>
              <p className="mt-0.5 text-xs text-white/60">{s?.risk?.modelVersion ? `Modelo ${s.risk.modelVersion}` : 'Calculado con tus datos'}</p>
            </div>
            {s?.risk?.degraded && <Badge tone="amber">Modo simplificado</Badge>}
          </div>
          {summary.loading || !s ? (
            <div className="relative mt-4 grid place-items-center">
              <Skeleton className="size-60 !rounded-full !bg-white/10 !bg-none" />
            </div>
          ) : s.risk ? (
            <>
              <div className="relative mt-3">
                <RiskGauge score={s.risk.score} level={s.risk.level} />
              </div>
              <Link to="/app/registro" className={buttonClasses('lime', 'lg', 'relative mt-4 w-full')}>
                Registrar mi día
              </Link>
              <p className="relative mt-4 text-center text-xs leading-relaxed text-white/65">Estimación estadística para ayudarte a prepararte, no un diagnóstico. Ante cualquier duda, consulta a tu neurólogo.</p>
            </>
          ) : (
            <div className="relative mt-6 text-center">
              <p className="font-display text-xl font-semibold">Aún no hay riesgo calculado</p>
              <p className="mt-1 text-sm text-white/70">Completa tu registro diario para que la IA estime tu riesgo.</p>
              <Link to="/app/registro" className={buttonClasses('lime', 'lg', 'mt-5 w-full')}>
                Registrar mi día
              </Link>
            </div>
          )}
        </section>

        <StatTile className="md:col-span-3" tone="brand" label="Adherencia 30 días" icon={<ShieldCheck className="size-5" />} value={s?.adherence && s.adherence.total > 0 ? percent(s.adherence.rate) : '--'} caption={s?.adherence && s.adherence.total > 0 ? `${s.adherence.taken} de ${s.adherence.total} dosis` : 'Agrega tu medicación para verla'} />
        <StatTile className="md:col-span-4" tone="lime" label="Racha sin crisis" icon={<Flame className="size-5" />} value={s ? s.seizureFreeDays : '--'} unit={s?.seizureFreeDays === 1 ? 'día' : 'días'} caption={s?.lastSeizure ? `Última: ${relativeTime(s.lastSeizure.startedAt)}` : 'Sin crisis registradas'} />
        <StatTile className="md:col-span-3" tone="ink" label="Última crisis" icon={<CalendarCheck2 className="size-5" />} value={s?.lastSeizure ? formatDate(s.lastSeizure.startedAt, { day: 'numeric', month: 'short' }) : '--'} caption={s?.lastSeizure ? `Intensidad ${s.lastSeizure.severity ?? '?'} de 5` : 'Nada que reportar'} />

        <Card className="relative overflow-hidden md:col-span-4">
          <div className="flex items-center justify-between">
            <p className="text-[0.8rem] font-semibold leading-tight text-muted">Pulso en vivo</p>
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-coral-soft text-coral">
              <HeartPulse className="size-5" />
            </span>
          </div>
          {s?.currentHeartRate != null ? (
            <div className="mt-5 flex items-end gap-2">
              <motion.span animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 0.9, repeat: Infinity }} className="origin-left font-display text-5xl font-bold tabular-nums leading-none text-coral">
                {s.currentHeartRate}
              </motion.span>
              <span className="pb-1 font-semibold text-muted">lpm</span>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-[0.8rem] leading-snug text-muted">Ningún reloj envía pulso ahora.</p>
              <Link to="/app/dispositivos" className="press mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand">
                <Watch className="size-4" aria-hidden /> Conectar
              </Link>
            </div>
          )}
        </Card>

        <Card className="col-span-2 md:col-span-7">
          <CardHeader title="Qué mueve tu riesgo" subtitle="Factores ordenados por impacto" icon={<Activity className="size-5" />} />
          {summary.loading || !s ? (
            <div className="space-y-5">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : s.risk && s.risk.factors.length > 0 ? (
            <FactorList factors={[...s.risk.factors].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))} />
          ) : (
            <p className="text-muted">Todavía no hay factores para mostrar.</p>
          )}
        </Card>

        <Card className="col-span-2 md:col-span-8">
          <CardHeader title="Evolución de 30 días" subtitle="Tu puntaje diario de riesgo" icon={<Activity className="size-5" />} />
          {history.loading ? <Skeleton className="h-56" /> : history.error ? <ErrorState compact error={history.error} onRetry={history.reload} /> : history.data && history.data.length > 0 ? <RiskHistoryChart data={history.data} /> : <p className="text-muted">Aún no hay historial.</p>}
        </Card>

        <Card className="col-span-2 md:col-span-4">
          <CardHeader title="Alertas activas" subtitle="Detectadas por tu reloj" icon={<BellRing className="size-5" />} />
          {summary.loading || !s ? (
            <Skeleton className="h-24" />
          ) : s.activeAlerts.length === 0 ? (
            <div className="rounded-2xl bg-ok/10 p-5 text-center">
              <ShieldCheck className="mx-auto size-8 text-ok" aria-hidden />
              <p className="mt-2 font-semibold">Todo en calma</p>
              <p className="text-sm text-muted">No hay alertas pendientes.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {s.activeAlerts.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 rounded-2xl bg-coral-soft p-4">
                  <div>
                    <p className="font-semibold">{alertText[a.kind] ?? a.kind}</p>
                    <p className="text-sm text-muted">{relativeTime(a.detectedAt)}</p>
                  </div>
                  <Badge tone="coral">{Math.round(a.confidence * 100)}%</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
