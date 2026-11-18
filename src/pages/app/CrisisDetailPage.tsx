import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Moon, Timer, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ErrorState, Skeleton } from '@/components/ui/States'
import { useQuery } from '@/hooks/useQuery'
import { dailyLogsApi, seizuresApi } from '@/lib/api/endpoints'
import { toISODate, addDays, formatDateTime, formatDuration } from '@/lib/format'
import { DoublyLinkedList } from '@/lib/structures'
import type { Seizure } from '@/lib/api/types'
import { useToast } from '@/providers/ToastProvider'

export default function CrisisDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const list = useQuery(() => seizuresApi.list({ limit: 500 }))

  // Chronological doubly linked list: prev = older, next = newer.
  const timeline = useMemo(() => {
    const sorted = [...(list.data ?? [])].sort((a, b) => a.startedAt.localeCompare(b.startedAt))
    const dll = DoublyLinkedList.from<Seizure>(sorted)
    const hit = dll.seek((s) => s.id === id)
    return { size: dll.size, found: hit ? dll.current() : undefined, prev: hit ? dll.peekPrev() : undefined, next: hit ? dll.peekNext() : undefined, position: sorted.findIndex((s) => s.id === id) + 1 }
  }, [list.data, id])
  const { found, prev: prevSeizure, next: nextSeizure } = timeline

  const eve = found ? toISODate(addDays(new Date(found.startedAt), -1)) : ''
  const prevNight = useQuery(() => (eve ? dailyLogsApi.get(eve).catch(() => null) : Promise.resolve(null)), [eve])

  const remove = async () => {
    if (!found || !window.confirm('¿Eliminar este registro de crisis?')) return
    try {
      await seizuresApi.remove(found.id)
      toast.success('Registro eliminado')
      navigate('/app/crisis', { replace: true })
    } catch (e) {
      toast.error('No se pudo eliminar', e instanceof Error ? e.message : undefined)
    }
  }

  if (list.error) return <ErrorState error={list.error} onRetry={list.reload} />
  if (list.loading) return <Skeleton className="h-96" />
  if (!found) {
    return (
      <div className="rounded-3xl border border-dashed border-line p-12 text-center">
        <p className="font-display text-xl font-semibold">No encontramos esa crisis</p>
        <Link to="/app/crisis" className="mt-4 inline-flex items-center gap-2 font-semibold text-brand hover:underline">
          <ArrowLeft className="size-4" aria-hidden /> Volver al historial
        </Link>
      </div>
    )
  }

  const position = timeline.position

  return (
    <div className="space-y-6">
      <Link to="/app/crisis" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Historial de crisis
      </Link>

      <div className="grid grid-flow-dense gap-5 lg:grid-cols-12">
        <div className="relative overflow-hidden rounded-3xl bg-ink p-8 text-bg lg:col-span-8">
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-brand/50 blur-[80px]" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="lime">Crisis {position} de {timeline.size}</Badge>
              <Badge tone="neutral">{found.source === 'manual' ? 'Registro manual' : found.source === 'emergency' ? 'Desde emergencia' : 'Detectada por reloj'}</Badge>
            </div>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{found.seizureType ?? 'Crisis'}</h1>
            <p className="mt-2 text-lg opacity-80">{formatDateTime(found.startedAt)}</p>
            <dl className="mt-8 grid grid-cols-3 gap-4">
              <div>
                <dt className="flex items-center gap-1.5 text-sm opacity-70">
                  <Timer className="size-4" aria-hidden /> Duración
                </dt>
                <dd className="mt-1 font-display text-2xl font-bold">{formatDuration(found.durationSeconds)}</dd>
              </div>
              <div>
                <dt className="text-sm opacity-70">Intensidad</dt>
                <dd className="mt-2 flex gap-1" aria-label={`${found.severity ?? 0} de 5`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={clsx('h-6 w-3 rounded-full', n <= (found.severity ?? 0) ? 'bg-lime' : 'bg-white/20')} />
                  ))}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-sm opacity-70">
                  <MapPin className="size-4" aria-hidden /> Lugar
                </dt>
                <dd className="mt-1 font-display text-2xl font-bold">{found.location ?? 'No indicado'}</dd>
              </div>
            </dl>
          </div>
        </div>

        <Card className="lg:col-span-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand">
              <Moon className="size-5" />
            </span>
            <h2 className="font-display text-lg font-semibold">La noche anterior</h2>
          </div>
          {prevNight.loading ? (
            <Skeleton className="mt-5 h-20" />
          ) : prevNight.data ? (
            <div className="mt-5">
              <p className="font-display text-5xl font-bold tabular-nums">
                {prevNight.data.sleepHours ?? '--'}
                <span className="ml-1 text-xl text-muted">h</span>
              </p>
              <p className="mt-2 text-sm text-muted">{(prevNight.data.sleepHours ?? 8) < 5 ? 'Dormiste menos de 5 horas, un factor frecuente en tus crisis.' : 'Dormiste en un rango razonable.'}</p>
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted">No hay un registro de sueño para ese día.</p>
          )}
        </Card>

        <Card className="lg:col-span-12">
          <h2 className="font-display text-lg font-semibold">Notas</h2>
          <p className="mt-2 text-muted">{found.notes ?? 'Sin notas.'}</p>
          {found.triggersNoted && found.triggersNoted.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {found.triggersNoted.map((t) => (
                <Badge key={t} tone="amber">
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </Card>
      </div>

      <nav aria-label="Línea de tiempo de crisis" className="flex items-center justify-between gap-3">
        <Button variant="outline" disabled={!prevSeizure} onClick={() => prevSeizure && navigate(`/app/crisis/${prevSeizure.id}`)}>
          <ChevronLeft className="size-4" aria-hidden /> Anterior
          {prevSeizure && <span className="hidden text-muted sm:inline">&middot; {formatDateTime(prevSeizure.startedAt)}</span>}
        </Button>
        <Button variant="ghost" onClick={remove} aria-label="Eliminar registro">
          <Trash2 className="size-4 text-coral" aria-hidden />
        </Button>
        <Button variant="outline" disabled={!nextSeizure} onClick={() => nextSeizure && navigate(`/app/crisis/${nextSeizure.id}`)}>
          {nextSeizure && <span className="hidden text-muted sm:inline">{formatDateTime(nextSeizure.startedAt)} &middot;</span>} Siguiente <ChevronRight className="size-4" aria-hidden />
        </Button>
      </nav>
    </div>
  )
}
