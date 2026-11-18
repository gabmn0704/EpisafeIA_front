import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, CalendarDays, ChevronRight, Clock3, Plus } from 'lucide-react'
import { SeizureForm } from '@/components/crisis/SeizureForm'
import { SeizureHeatmap } from '@/components/crisis/SeizureHeatmap'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States'
import { useQuery } from '@/hooks/useQuery'
import { seizuresApi } from '@/lib/api/endpoints'
import type { SeizureInput } from '@/lib/api/types'
import { formatDate, formatDateTime, formatDuration, toISODate } from '@/lib/format'
import { hourHistogram } from '@/lib/heatmap'
import { useToast } from '@/providers/ToastProvider'

const sourceLabel = { manual: 'Manual', emergency: 'Emergencia', wearable: 'Reloj' } as const

export default function CrisisPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const list = useQuery(() => seizuresApi.list({ limit: 500 }))
  const [creating, setCreating] = useState(false)
  const [day, setDay] = useState<string | null>(null)
  const [now] = useState(() => Date.now())

  const seizures = useMemo(() => list.data ?? [], [list.data])
  const visible = useMemo(() => (day ? seizures.filter((s) => toISODate(new Date(s.startedAt)) === day) : seizures), [seizures, day])
  const hours = useMemo(() => hourHistogram(seizures), [seizures])
  const peak = Math.max(1, ...hours)
  const last30 = seizures.filter((s) => now - new Date(s.startedAt).getTime() < 30 * 86_400_000).length
  const avg = seizures.length ? Math.round(seizures.reduce((a, s) => a + (s.durationSeconds ?? 0), 0) / seizures.length) : null

  const create = async (input: SeizureInput) => {
    try {
      const s = await seizuresApi.create(input)
      toast.success('Crisis registrada', 'Gracias por llevar el registro, ayuda a tu equipo médico.')
      setCreating(false)
      list.reload()
      navigate(`/app/crisis/${s.id}`)
    } catch (e) {
      toast.error('No se pudo guardar', e instanceof Error ? e.message : undefined)
    }
  }

  return (
    <div>
      <PageHeader
        title="Crisis"
        description="Tu historial completo, para detectar patrones y compartirlo con tu neurólogo."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" aria-hidden /> Registrar crisis
          </Button>
        }
      />

      {list.error ? (
        <ErrorState error={list.error} onRetry={list.reload} />
      ) : (
        <div className="grid grid-flow-dense gap-5 lg:grid-cols-12">
          <Card className="lg:col-span-8">
            <CardHeader title="Calendario" subtitle="Últimas 20 semanas. Toca un día para filtrar." icon={<CalendarDays className="size-5" />} action={day ? <Button size="sm" variant="outline" onClick={() => setDay(null)}>Quitar filtro</Button> : undefined} />
            {list.loading ? <Skeleton className="h-44" /> : <SeizureHeatmap seizures={seizures} onSelect={(d) => setDay((cur) => (cur === d ? null : d))} />}
          </Card>

          <div className="grid grid-cols-3 gap-3 lg:col-span-4 lg:grid-cols-1">
            <div className="rounded-3xl bg-brand p-5 text-brand-ink">
              <p className="text-sm font-semibold opacity-85">Total</p>
              <p className="mt-3 font-display text-4xl font-bold tabular-nums">{list.loading ? '--' : seizures.length}</p>
            </div>
            <div className="rounded-3xl bg-lime p-5 text-lime-ink">
              <p className="text-sm font-semibold opacity-85">Últimos 30 días</p>
              <p className="mt-3 font-display text-4xl font-bold tabular-nums">{list.loading ? '--' : last30}</p>
            </div>
            <div className="rounded-3xl bg-ink p-5 text-bg">
              <p className="text-sm font-semibold opacity-85">Duración media</p>
              <p className="mt-3 font-display text-3xl font-bold">{list.loading ? '--' : formatDuration(avg)}</p>
            </div>
          </div>

          <Card className="lg:col-span-5">
            <CardHeader title="Horas del día" subtitle="Cuándo suelen ocurrir" icon={<Clock3 className="size-5" />} />
            <div className="flex h-36 items-end gap-[3px]" role="img" aria-label="Distribución de crisis por hora del día">
              {hours.map((n, h) => (
                <div key={h} className="group relative flex h-full flex-1 items-end">
                  <div title={`${h}:00 - ${n} crisis`} className="w-full rounded-t-md bg-brand transition group-hover:bg-lime" style={{ height: `${Math.max(4, (n / peak) * 100)}%`, opacity: n === 0 ? 0.2 : 1 }} />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs font-medium text-muted" aria-hidden>
              <span>0h</span>
              <span>6h</span>
              <span>12h</span>
              <span>18h</span>
              <span>23h</span>
            </div>
          </Card>

          <Card className="lg:col-span-7">
            <CardHeader title={day ? `Crisis del ${formatDate(day)}` : 'Historial'} subtitle={`${visible.length} registros`} icon={<Activity className="size-5" />} />
            {list.loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <EmptyState icon={<Activity className="size-6" />} title="Sin crisis registradas" description="Cuando registres una, la verás aquí con su duración e intensidad." action={<Button onClick={() => setCreating(true)}>Registrar crisis</Button>} />
            ) : (
              <ul className="max-h-[28rem] divide-y divide-line overflow-y-auto pr-1 scrollbar-thin">
                {visible.map((s) => (
                  <li key={s.id}>
                    <Link to={`/app/crisis/${s.id}`} className="group flex items-center gap-4 rounded-2xl px-2 py-3.5 transition hover:bg-surface-2">
                      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-soft font-display text-lg font-bold text-brand">{s.severity ?? '?'}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{s.seizureType ?? 'Crisis'}</p>
                        <p className="text-sm text-muted">
                          {formatDateTime(s.startedAt)} &middot; {formatDuration(s.durationSeconds)}
                        </p>
                      </div>
                      <Badge tone={s.source === 'manual' ? 'neutral' : s.source === 'emergency' ? 'coral' : 'brand'}>{sourceLabel[s.source]}</Badge>
                      <ChevronRight className="size-5 text-muted transition group-hover:translate-x-1" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="Registrar crisis">
        <SeizureForm onSubmit={create} onCancel={() => setCreating(false)} />
      </Modal>
    </div>
  )
}
