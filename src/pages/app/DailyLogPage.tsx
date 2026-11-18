import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Coffee, Dumbbell, Frown, Meh, Moon, Smile, SmilePlus, Annoyed, Undo2, Zap } from 'lucide-react'
import clsx from 'clsx'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { TextArea } from '@/components/ui/Field'
import { PageHeader } from '@/components/ui/PageHeader'
import { ErrorState, Skeleton } from '@/components/ui/States'
import { useUndoableState } from '@/hooks/useUndoableState'
import { ApiError } from '@/lib/api/client'
import { dailyLogsApi } from '@/lib/api/endpoints'
import { addDays, formatDate, parseISODate, toISODate, todayISO } from '@/lib/format'
import { dailyLogSchema, fieldErrors, type DailyLogValues } from '@/lib/schemas'
import { useToast } from '@/providers/ToastProvider'

const DEFAULTS: DailyLogValues = { sleepHours: 7, stressLevel: 4, caffeineMg: 0, exerciseMinutes: 0, mood: 3, notes: '' }

function Slider({
  id,
  label,
  icon,
  value,
  min,
  max,
  step,
  unit,
  hint,
  onChange,
  error,
}: {
  id: string
  label: string
  icon: ReactNode
  value: number
  min: number
  max: number
  step: number
  unit: string
  hint?: string
  onChange: (n: number) => void
  error?: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="rounded-3xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="flex items-center gap-3 font-semibold">
          <span className="grid size-10 place-items-center rounded-2xl bg-brand-soft text-brand">{icon}</span>
          {label}
        </label>
        <p className="font-display text-3xl font-bold tabular-nums">
          {value}
          <span className="ml-1 text-base font-semibold text-muted">{unit}</span>
        </p>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-invalid={error ? true : undefined}
        style={{ background: `linear-gradient(90deg, var(--brand) ${pct}%, var(--surface-2) ${pct}%)` }}
        className="mt-5 h-3 w-full cursor-pointer appearance-none rounded-full accent-[var(--lime)] [&::-moz-range-thumb]:size-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-brand [&::-moz-range-thumb]:bg-lime [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-brand [&::-webkit-slider-thumb]:bg-lime"
      />
      {hint && <p className="mt-3 text-sm text-muted">{hint}</p>}
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-coral">
          {error}
        </p>
      )}
    </div>
  )
}

const moods = [
  { v: 1, label: 'Muy mal', Icon: Frown },
  { v: 2, label: 'Mal', Icon: Annoyed },
  { v: 3, label: 'Normal', Icon: Meh },
  { v: 4, label: 'Bien', Icon: Smile },
  { v: 5, label: 'Excelente', Icon: SmilePlus },
]

export default function DailyLogPage() {
  const toast = useToast()
  const [date, setDate] = useState(todayISO())
  const form = useUndoableState<DailyLogValues>(DEFAULTS)
  const { reset, undo } = form
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<unknown>(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [existing, setExisting] = useState(false)

  const load = useCallback(
    async (d: string) => {
      setLoading(true)
      setLoadError(null)
      try {
        const log = await dailyLogsApi.get(d)
        setExisting(true)
        reset({
          sleepHours: log.sleepHours ?? DEFAULTS.sleepHours,
          stressLevel: log.stressLevel ?? DEFAULTS.stressLevel,
          caffeineMg: log.caffeineMg ?? 0,
          exerciseMinutes: log.exerciseMinutes ?? 0,
          mood: log.mood ?? 3,
          notes: log.notes ?? '',
        })
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) {
          setExisting(false)
          reset(DEFAULTS)
        } else setLoadError(e)
      } finally {
        setLoading(false)
      }
    },
    [reset],
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(date)
  }, [date, load])

  // Ctrl/Cmd + Z undoes the last change (outside of text areas).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        undo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo])

  const v = form.value
  const patch = (p: Partial<DailyLogValues>) => form.set((prev) => ({ ...prev, ...p }))

  const onSave = async () => {
    const parsed = dailyLogSchema.safeParse(v)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setSaving(true)
    try {
      await dailyLogsApi.upsert(date, { ...parsed.data, notes: parsed.data.notes || null })
      setExisting(true)
      toast.success('Registro guardado', 'La IA usará estos datos para tu riesgo de mañana.')
    } catch (e) {
      toast.error('No se pudo guardar', e instanceof Error ? e.message : undefined)
    } finally {
      setSaving(false)
    }
  }

  const isToday = date === todayISO()
  const shift = (n: number) => {
    const next = toISODate(addDays(parseISODate(date), n))
    if (next <= todayISO()) setDate(next)
  }

  return (
    <div>
      <PageHeader
        title="Registro diario"
        description="Cuatro datos al día bastan para que la IA encuentre tus patrones."
        actions={
          <div className="flex items-center gap-2 rounded-full border border-line bg-surface p-1">
            <Button variant="ghost" size="sm" onClick={() => shift(-1)} aria-label="Día anterior">
              &larr;
            </Button>
            <span className="min-w-36 text-center text-sm font-semibold capitalize">{isToday ? 'Hoy' : formatDate(date, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            <Button variant="ghost" size="sm" onClick={() => shift(1)} disabled={isToday} aria-label="Día siguiente">
              &rarr;
            </Button>
          </div>
        }
      />

      {loadError ? (
        <ErrorState error={loadError} onRetry={() => void load(date)} />
      ) : loading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : (
        <div className="grid grid-flow-dense gap-5 lg:grid-cols-6">
          <div className="lg:col-span-3">
            <Slider id="sleep" label="Sueño de anoche" icon={<Moon className="size-5" />} value={v.sleepHours} min={0} max={14} step={0.5} unit="h" hint={v.sleepHours < 5 ? 'Menos de 5 horas es tu mayor factor de riesgo.' : 'Dormir 7 horas o más protege tu cerebro.'} onChange={(n) => patch({ sleepHours: n })} error={errors.sleepHours} />
          </div>
          <div className="lg:col-span-3">
            <Slider id="stress" label="Estrés" icon={<Zap className="size-5" />} value={v.stressLevel} min={1} max={10} step={1} unit="/10" hint="1 es calma total, 10 es el día más tenso." onChange={(n) => patch({ stressLevel: n })} error={errors.stressLevel} />
          </div>
          <div className="lg:col-span-3">
            <Slider id="caffeine" label="Cafeína" icon={<Coffee className="size-5" />} value={v.caffeineMg} min={0} max={600} step={30} unit="mg" hint="Una taza de café suele tener cerca de 90 mg." onChange={(n) => patch({ caffeineMg: n })} error={errors.caffeineMg} />
          </div>
          <div className="lg:col-span-3">
            <Slider id="exercise" label="Ejercicio" icon={<Dumbbell className="size-5" />} value={v.exerciseMinutes} min={0} max={180} step={5} unit="min" hint="Caminar también cuenta." onChange={(n) => patch({ exerciseMinutes: n })} error={errors.exerciseMinutes} />
          </div>

          <Card className="lg:col-span-6">
            <fieldset>
              <legend className="mb-4 font-display text-lg font-semibold">¿Cómo te sientes hoy?</legend>
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {moods.map(({ v: mv, label, Icon }) => {
                  const active = v.mood === mv
                  return (
                    <button
                      key={mv}
                      type="button"
                      aria-pressed={active}
                      onClick={() => patch({ mood: mv })}
                      className={clsx(
                        'flex flex-col items-center gap-2 rounded-2xl border-2 px-1 py-4 text-xs font-semibold transition active:scale-95 sm:text-sm',
                        active ? 'border-brand bg-brand text-brand-ink shadow-[0_10px_24px_-10px_var(--brand)]' : 'border-line bg-surface text-muted hover:border-brand hover:text-ink',
                      )}
                    >
                      <Icon className="size-7" aria-hidden />
                      {label}
                    </button>
                  )
                })}
              </div>
            </fieldset>
            <div className="mt-6">
              <TextArea label="Notas (opcional)" placeholder="Algo que quieras recordar de hoy" value={v.notes ?? ''} onChange={(e) => patch({ notes: e.target.value })} error={errors.notes} />
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-4 lg:col-span-6">
            <Button variant="outline" onClick={() => undo()} disabled={!form.canUndo} aria-label="Deshacer último cambio">
              <Undo2 className="size-4" aria-hidden /> Deshacer {form.canUndo && <span className="text-muted">({form.depth})</span>}
            </Button>
            <Button size="lg" onClick={onSave} loading={saving}>
              {existing ? 'Actualizar registro' : 'Guardar registro'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
