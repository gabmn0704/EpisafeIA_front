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
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States'
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

export default function DashboardPage() {
  const { user } = useAuth()
  const summary = useQuery(() => dashboardApi.summary())
  const history = useQuery(() => aiApi.riskHistory(30))
  const first = user?.fullName.split(' ')[0] ?? ''

  if (summary.error) return <ErrorState error={summary.error} onRetry={summary.reload} />

  const s = summary.data

  return (
    <div>
      <PageHeader
        eyebrow={formatDate(new Date().toISOString(), { weekday: 'long', day: 'numeric', month: 'long' })}
        title={`${greeting()}, ${first}`}
        description="Esto es lo que tu sueño, tu medicación y tu pulso dicen de hoy."
        actions={
          <Link to="/app/registro" className={buttonClasses('primary', 'md')}>
            Registrar mi día
          </Link>
        }
      />

      <div className="grid grid-flow-dense grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
        <Card className="md:col-span-2 lg:col-span-5">
          <CardHeader title="Riesgo de hoy" subtitle={s?.risk?.modelVersion ? `Modelo ${s.risk.modelVersion}` : 'Calculado con tus datos'} icon={<Sparkles className="size-5" />} action={s?.risk?.degraded ? <Badge tone="amber">Modo simplificado</Badge> : undefined} />
          {summary.loading || !s ? (
            <Skeleton className="mx-auto h-56 w-full max-w-sm" />
          ) : s.risk ? (
            <>
              <RiskGauge score={s.risk.score} level={s.risk.level} />
              <p className="mt-5 rounded-2xl bg-surface-2 p-4 text-sm text-muted">
                Es una estimación estadística para ayudarte a prepararte, no un diagnóstico. Ante cualquier duda, consulta a tu neurólogo.
              </p>
            </>
          ) : (
            <EmptyState icon={<Sparkles className="size-6" />} title="Aún no hay riesgo calculado" description="Completa tu registro diario para que la IA pueda estimar tu riesgo." />
          )}
        </Card>

        <Card className="md:col-span-2 lg:col-span-7">
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

        <StatTile className="lg:col-span-3" tone="brand" label="Adherencia 30 días" icon={<ShieldCheck className="size-5" />} value={s?.adherence ? percent(s.adherence.rate) : '--'} caption={s?.adherence ? `${s.adherence.taken} de ${s.adherence.total} dosis tomadas` : 'Sin datos aún'} />
        <StatTile className="lg:col-span-3" tone="lime" label="Racha sin crisis" icon={<Flame className="size-5" />} value={s ? s.seizureFreeDays : '--'} unit="días" caption={s?.lastSeizure ? `Última: ${relativeTime(s.lastSeizure.startedAt)}` : 'Sin crisis registradas'} />
        <StatTile className="lg:col-span-3" tone="ink" label="Última crisis" icon={<CalendarCheck2 className="size-5" />} value={s?.lastSeizure ? formatDate(s.lastSeizure.startedAt, { day: 'numeric', month: 'short' }) : '--'} caption={s?.lastSeizure ? `Intensidad ${s.lastSeizure.severity ?? '?'} de 5` : 'Nada que reportar'} />

        <Card className="relative overflow-hidden lg:col-span-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted">Pulso en vivo</p>
            <span className="grid size-9 place-items-center rounded-xl bg-coral-soft text-coral">
              <HeartPulse className="size-5" />
            </span>
          </div>
          {s?.currentHeartRate != null ? (
            <div className="mt-6">
              <div className="flex items-end gap-2">
                <motion.span animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 0.9, repeat: Infinity }} className="font-display text-6xl font-bold tabular-nums leading-none text-coral">
                  {s.currentHeartRate}
                </motion.span>
                <span className="pb-1 font-semibold text-muted">lpm</span>
              </div>
            </div>
          ) : (
            <div className="mt-5">
              <p className="text-sm text-muted">No hay un reloj enviando pulso ahora mismo.</p>
              <Link to="/app/dispositivos" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
                <Watch className="size-4" aria-hidden /> Conectar un reloj
              </Link>
            </div>
          )}
        </Card>

        <Card className="md:col-span-2 lg:col-span-8">
          <CardHeader title="Evolución de 30 días" subtitle="Tu puntaje diario de riesgo" icon={<Activity className="size-5" />} />
          {history.loading ? <Skeleton className="h-64" /> : history.error ? <ErrorState compact error={history.error} onRetry={history.reload} /> : history.data && history.data.length > 0 ? <RiskHistoryChart data={history.data} /> : <p className="text-muted">Aún no hay historial.</p>}
        </Card>

        <Card className="md:col-span-2 lg:col-span-4">
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
