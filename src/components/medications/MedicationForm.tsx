import { useState, type FormEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import type { Medication, MedicationInput } from '@/lib/api/types'
import { fieldErrors, medicationSchema } from '@/lib/schemas'
import { MedicationAutocomplete } from './MedicationAutocomplete'

export function MedicationForm({ initial, onSubmit, onCancel }: { initial?: Medication; onSubmit: (m: MedicationInput) => Promise<void>; onCancel: () => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [dose, setDose] = useState(initial?.dose ?? '')
  const [unit, setUnit] = useState(initial?.unit ?? 'mg')
  const [times, setTimes] = useState<string[]>(initial?.scheduleTimes ?? ['08:00'])
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const r = medicationSchema.safeParse({ name, dose, unit, scheduleTimes: times, notes })
    if (!r.success) {
      setErrors(fieldErrors(r.error))
      return
    }
    setErrors({})
    setSaving(true)
    try {
      await onSubmit({ ...r.data, notes: r.data.notes || null, active: initial?.active ?? true })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <MedicationAutocomplete value={name} onChange={setName} error={errors.name} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Dosis" inputMode="decimal" value={dose} error={errors.dose} onChange={(e) => setDose(e.target.value)} />
        <Input label="Unidad" value={unit} error={errors.unit} onChange={(e) => setUnit(e.target.value)} />
      </div>
      <div>
        <p className="mb-1.5 text-sm font-semibold">Horarios de toma</p>
        <div className="flex flex-wrap items-center gap-2">
          {times.map((t, i) => (
            <div key={i} className="flex items-center rounded-full border border-line bg-surface pl-3">
              <input
                type="time"
                value={t}
                aria-label={`Horario ${i + 1}`}
                onChange={(e) => setTimes((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))}
                className="bg-transparent py-2 text-sm font-semibold outline-none"
              />
              {times.length > 1 && (
                <button type="button" onClick={() => setTimes((arr) => arr.filter((_, j) => j !== i))} aria-label={`Quitar horario ${t}`} className="grid size-9 place-items-center text-muted hover:text-coral">
                  <X className="size-4" />
                </button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setTimes((arr) => [...arr, '12:00'])}>
            <Plus className="size-4" aria-hidden /> Horario
          </Button>
        </div>
        {errors.scheduleTimes && (
          <p role="alert" className="mt-1.5 text-sm font-medium text-coral">
            {errors.scheduleTimes}
          </p>
        )}
      </div>
      <Input label="Notas (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej. Con comida" />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          {initial ? 'Guardar cambios' : 'Agregar medicamento'}
        </Button>
      </div>
    </form>
  )
}
