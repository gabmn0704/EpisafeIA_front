import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Field'
import type { SeizureInput } from '@/lib/api/types'
import { fieldErrors, seizureSchema } from '@/lib/schemas'
import clsx from 'clsx'

const TYPES = ['Focal consciente', 'Focal con alteración de conciencia', 'Tónico-clónica generalizada', 'Ausencia', 'Otra / no sé']

const toLocalInput = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export function SeizureForm({ onSubmit, onCancel }: { onSubmit: (s: SeizureInput) => Promise<void>; onCancel: () => void }) {
  const [startedAt, setStartedAt] = useState(toLocalInput(new Date()))
  const [minutes, setMinutes] = useState('1')
  const [severity, setSeverity] = useState(3)
  const [type, setType] = useState(TYPES[0] ?? '')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const r = seizureSchema.safeParse({ startedAt, durationSeconds: Math.round(Number(minutes) * 60), severity, seizureType: type, notes })
    if (!r.success) {
      setErrors(fieldErrors(r.error))
      return
    }
    setErrors({})
    setSaving(true)
    try {
      await onSubmit({
        startedAt: new Date(r.data.startedAt).toISOString(),
        durationSeconds: r.data.durationSeconds,
        severity: r.data.severity,
        seizureType: r.data.seizureType || null,
        notes: r.data.notes || null,
        triggersNoted: [],
        source: 'manual',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Input label="Fecha y hora" type="datetime-local" max={toLocalInput(new Date())} value={startedAt} error={errors.startedAt} onChange={(e) => setStartedAt(e.target.value)} />
      <Input label="Duración aproximada (minutos)" type="number" min="0.5" step="0.5" inputMode="decimal" value={minutes} error={errors.durationSeconds} onChange={(e) => setMinutes(e.target.value)} />
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Intensidad</legend>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" aria-pressed={severity === n} onClick={() => setSeverity(n)} className={clsx('h-12 rounded-2xl border-2 font-display text-lg font-bold transition active:scale-95', severity === n ? 'border-brand bg-brand text-brand-ink' : 'border-line bg-surface hover:border-brand')}>
              {n}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-muted">1 es leve, 5 es muy intensa.</p>
      </fieldset>
      <div className="space-y-1.5">
        <label htmlFor="seizure-type" className="block text-sm font-semibold">
          Tipo
        </label>
        <select id="seizure-type" value={type} onChange={(e) => setType(e.target.value)} className="h-12 w-full rounded-2xl border border-line bg-surface px-4">
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <TextArea label="Notas (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} error={errors.notes} placeholder="Qué pasó antes, cómo te sentiste después" />
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          Guardar crisis
        </Button>
      </div>
    </form>
  )
}
