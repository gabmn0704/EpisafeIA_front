import { useState } from 'react'
import { Check, Clock, Pencil, Pill, Plus, SkipForward, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { MedicationForm } from '@/components/medications/MedicationForm'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ConfirmSheet } from '@/components/ui/ConfirmSheet'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States'
import { useQuery } from '@/hooks/useQuery'
import { medicationsApi } from '@/lib/api/endpoints'
import type { DoseStatus, Medication, MedicationInput, ScheduleItem } from '@/lib/api/types'
import { formatTime, percent } from '@/lib/format'
import { useToast } from '@/providers/ToastProvider'

const statusUi: Record<DoseStatus, { label: string; tone: 'ok' | 'coral' | 'neutral' | 'amber' }> = {
  taken: { label: 'Tomada', tone: 'ok' },
  missed: { label: 'Omitida', tone: 'coral' },
  skipped: { label: 'Saltada', tone: 'neutral' },
  pending: { label: 'Pendiente', tone: 'amber' },
}

export default function MedicationsPage() {
  const toast = useToast()
  const schedule = useQuery(() => medicationsApi.scheduleToday())
  const meds = useQuery(() => medicationsApi.list())
  const adherence = useQuery(() => medicationsApi.adherence(30))
  const [editing, setEditing] = useState<Medication | 'new' | null>(null)
  const [removing, setRemoving] = useState<Medication | null>(null)

  const mark = async (item: ScheduleItem, status: DoseStatus) => {
    const prev = schedule.data
    schedule.setData((rows) => rows?.map((r) => (r.medicationId === item.medicationId && r.scheduledFor === item.scheduledFor ? { ...r, status } : r)))
    try {
      await medicationsApi.log(item.medicationId, item.scheduledFor, status)
      if (status === 'taken') toast.success(`${item.name} registrada`, `Dosis de las ${formatTime(item.scheduledFor)} marcada como tomada.`)
      adherence.reload()
    } catch (e) {
      schedule.setData(() => prev)
      toast.error('No se pudo registrar la toma', e instanceof Error ? e.message : undefined)
    }
  }

  const save = async (input: MedicationInput) => {
    try {
      if (editing && editing !== 'new') await medicationsApi.update(editing.id, input)
      else await medicationsApi.create(input)
      toast.success(editing === 'new' ? 'Medicamento agregado' : 'Cambios guardados')
      setEditing(null)
      meds.reload()
      schedule.reload()
    } catch (e) {
      toast.error('No se pudo guardar', e instanceof Error ? e.message : undefined)
    }
  }

  const remove = async (m: Medication) => {
    try {
      await medicationsApi.remove(m.id)
      toast.success(`${m.name} eliminado`)
      setRemoving(null)
      meds.reload()
      schedule.reload()
    } catch (e) {
      toast.error('No se pudo eliminar', e instanceof Error ? e.message : undefined)
    }
  }

  const done = schedule.data?.filter((r) => r.status === 'taken').length ?? 0
  const total = schedule.data?.length ?? 0

  return (
    <div>
      <PageHeader
        title="Medicamentos"
        description="Tomar tus dosis a tiempo es lo más poderoso que puedes hacer por ti."
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" aria-hidden /> Agregar medicamento
          </Button>
        }
      />

      <div className="grid grid-flow-dense gap-4 sm:gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader title="Agenda de hoy" subtitle={total ? `${done} de ${total} dosis tomadas` : 'Sin dosis programadas'} icon={<Clock className="size-5" />} />
          {total > 0 && (
            <div className="mb-5 h-3.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={total} aria-label="Progreso de dosis de hoy">
              <div className="h-full rounded-full bg-lime transition-all duration-700" style={{ width: `${(done / total) * 100}%` }} />
            </div>
          )}
          {schedule.loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : schedule.error ? (
            <ErrorState compact error={schedule.error} onRetry={schedule.reload} />
          ) : total === 0 ? (
            <EmptyState icon={<Pill className="size-6" />} title="No tienes dosis hoy" description="Agrega un medicamento con sus horarios para recibir tu agenda diaria." action={<Button onClick={() => setEditing('new')}>Agregar medicamento</Button>} />
          ) : (
            <ul className="stagger space-y-3">
              {schedule.data?.map((item) => {
                const ui = statusUi[item.status]
                const taken = item.status === 'taken'
                return (
                  <li key={`${item.medicationId}-${item.scheduledFor}`} className={clsx('relative overflow-hidden rounded-3xl p-4 pl-5 transition-colors duration-300', taken ? 'bg-ok/10' : 'bg-surface-2/70')}>
                    <span className={clsx('absolute inset-y-0 left-0 w-1.5', taken ? 'bg-ok' : item.status === 'pending' ? 'bg-amber' : 'bg-line')} aria-hidden />
                    <div className="flex items-start gap-3">
                      <div className="grid shrink-0 place-items-center rounded-2xl bg-ink px-3 py-2 font-display text-lg font-bold tabular-nums text-bg">{formatTime(item.scheduledFor)}</div>
                      <div className="min-w-0 flex-1">
                        <p className={clsx('font-display text-[1.05rem] font-semibold leading-tight', taken && 'line-through opacity-60')}>{item.name}</p>
                        <p className="mt-0.5 text-sm text-muted">
                          {item.dose} {item.unit}
                        </p>
                      </div>
                      <Badge tone={ui.tone}>{ui.label}</Badge>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {!taken ? (
                        <>
                          <Button className="flex-1" variant="lime" onClick={() => mark(item, 'taken')}>
                            <Check className="size-5" aria-hidden /> Tomada
                          </Button>
                          <Button variant="outline" className="!px-4" onClick={() => mark(item, 'skipped')} aria-label={`Saltar ${item.name}`}>
                            <SkipForward className="size-5" aria-hidden />
                          </Button>
                        </>
                      ) : (
                        <Button className="flex-1" size="sm" variant="ghost" onClick={() => mark(item, 'pending')}>
                          Deshacer
                        </Button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <div className="space-y-5 lg:col-span-5">
          <div className="bg-hero relative overflow-hidden rounded-[2rem] p-5 text-white shadow-elev-3 sm:p-6">
            <p className="text-sm font-semibold text-white/80">Adherencia últimos 30 días</p>
            <p className="mt-4 font-display text-6xl font-bold tabular-nums tracking-tighter">{adherence.data ? percent(adherence.data.rate) : '--'}</p>
            <p className="mt-1 text-sm text-white/75">{adherence.data ? `${adherence.data.taken} de ${adherence.data.total} dosis tomadas` : 'Calculando'}</p>
            {adherence.data?.byDay && (
              <div className="mt-5 flex h-12 items-end gap-[3px]" aria-hidden>
                {adherence.data.byDay.map((d) => (
                  <span key={d.date} className="flex-1 rounded-full bg-lime" style={{ height: `${Math.max(12, d.rate * 100)}%`, opacity: d.rate >= 1 ? 1 : 0.4 }} />
                ))}
              </div>
            )}
          </div>

          <Card>
            <CardHeader title="Mis medicamentos" icon={<Pill className="size-5" />} />
            {meds.loading ? (
              <Skeleton className="h-32" />
            ) : meds.error ? (
              <ErrorState compact error={meds.error} onRetry={meds.reload} />
            ) : (
              <ul className="space-y-2.5">
                {meds.data?.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 rounded-2xl bg-surface-2/70 p-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand">
                      <Pill className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold leading-tight">{m.name}</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {m.dose} {m.unit} &middot; {m.scheduleTimes.join(', ')}
                      </p>
                    </div>
                    <button type="button" onClick={() => setEditing(m)} aria-label={`Editar ${m.name}`} className="press grid size-11 place-items-center rounded-full text-muted">
                      <Pencil className="size-5" />
                    </button>
                    <button type="button" onClick={() => setRemoving(m)} aria-label={`Eliminar ${m.name}`} className="press grid size-11 place-items-center rounded-full text-coral">
                      <Trash2 className="size-5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <ConfirmSheet open={removing !== null} title={`Eliminar ${removing?.name ?? ''}`} message="Esta acción no se puede deshacer. Dejarás de recibir recordatorios de este medicamento." onConfirm={() => (removing ? remove(removing) : undefined)} onCancel={() => setRemoving(null)} />

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Nuevo medicamento' : 'Editar medicamento'}>
        {editing !== null && <MedicationForm initial={editing === 'new' ? undefined : editing} onSubmit={save} onCancel={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}
