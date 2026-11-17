import { useState, type FormEvent } from 'react'
import { Mail, MessageSquare, Pencil, Phone, Plus, Trash2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Field'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States'
import { useQuery } from '@/hooks/useQuery'
import { contactsApi } from '@/lib/api/endpoints'
import type { EmergencyContact, EmergencyContactInput } from '@/lib/api/types'
import { contactSchema, fieldErrors } from '@/lib/schemas'
import { useToast } from '@/providers/ToastProvider'

function ContactForm({ initial, nextPriority, onSubmit, onCancel }: { initial?: EmergencyContact; nextPriority: number; onSubmit: (c: EmergencyContactInput) => Promise<void>; onCancel: () => void }) {
  const [v, setV] = useState({
    name: initial?.name ?? '',
    relationship: initial?.relationship ?? '',
    phone: initial?.phone ?? '',
    email: initial?.email ?? '',
    priority: initial?.priority ?? nextPriority,
    notifySms: initial?.notifySms ?? true,
    notifyEmail: initial?.notifyEmail ?? false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const r = contactSchema.safeParse(v)
    if (!r.success) {
      setErrors(fieldErrors(r.error))
      return
    }
    setErrors({})
    setSaving(true)
    try {
      await onSubmit({ ...r.data, email: r.data.email || null })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Input label="Nombre" value={v.name} error={errors.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Parentesco" value={v.relationship} error={errors.relationship} onChange={(e) => setV({ ...v, relationship: e.target.value })} />
        <Input label="Prioridad" type="number" min={1} max={9} hint="1 se avisa primero" value={v.priority} onChange={(e) => setV({ ...v, priority: Number(e.target.value) })} />
      </div>
      <Input label="Teléfono" type="tel" autoComplete="off" value={v.phone} error={errors.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} />
      <Input label="Correo (opcional)" type="email" value={v.email} error={errors.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Cómo avisarle</legend>
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2.5 font-medium">
            <input type="checkbox" className="size-5 accent-[var(--brand)]" checked={v.notifySms} onChange={(e) => setV({ ...v, notifySms: e.target.checked })} /> SMS
          </label>
          <label className="flex items-center gap-2.5 font-medium">
            <input type="checkbox" className="size-5 accent-[var(--brand)]" checked={v.notifyEmail} onChange={(e) => setV({ ...v, notifyEmail: e.target.checked })} /> Correo
          </label>
        </div>
        {errors.notifySms && (
          <p role="alert" className="mt-1.5 text-sm font-medium text-coral">
            {errors.notifySms}
          </p>
        )}
      </fieldset>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          Guardar contacto
        </Button>
      </div>
    </form>
  )
}

export default function ContactsPage() {
  const toast = useToast()
  const contacts = useQuery(() => contactsApi.list())
  const [editing, setEditing] = useState<EmergencyContact | 'new' | null>(null)

  const save = async (input: EmergencyContactInput) => {
    try {
      if (editing && editing !== 'new') await contactsApi.update(editing.id, input)
      else await contactsApi.create(input)
      toast.success('Contacto guardado')
      setEditing(null)
      contacts.reload()
    } catch (e) {
      toast.error('No se pudo guardar', e instanceof Error ? e.message : undefined)
    }
  }

  const remove = async (c: EmergencyContact) => {
    if (!window.confirm(`¿Quitar a ${c.name} de tus contactos de emergencia?`)) return
    try {
      await contactsApi.remove(c.id)
      toast.success('Contacto eliminado')
      contacts.reload()
    } catch (e) {
      toast.error('No se pudo eliminar', e instanceof Error ? e.message : undefined)
    }
  }

  return (
    <div>
      <PageHeader
        title="Contactos de emergencia"
        description="Se les avisa en orden de prioridad cuando activas una emergencia."
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" aria-hidden /> Agregar contacto
          </Button>
        }
      />

      {contacts.error ? (
        <ErrorState error={contacts.error} onRetry={contacts.reload} />
      ) : contacts.loading ? (
        <div className="grid gap-5 md:grid-cols-2">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : (contacts.data?.length ?? 0) === 0 ? (
        <EmptyState icon={<Users className="size-6" />} title="Aún no tienes contactos" description="Agrega al menos una persona de confianza para que alguien reciba tu alerta." action={<Button onClick={() => setEditing('new')}>Agregar contacto</Button>} />
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          {contacts.data?.map((c) => (
            <li key={c.id} className="relative rounded-3xl border border-line bg-surface p-6 shadow-card">
              <span className="absolute -top-3 left-6 grid size-8 place-items-center rounded-full bg-lime font-display text-sm font-extrabold text-lime-ink" title={`Prioridad ${c.priority}`}>
                {c.priority}
              </span>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl font-semibold">{c.name}</p>
                  <p className="text-sm text-muted">{c.relationship}</p>
                </div>
                <div className="flex">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(c)} aria-label={`Editar ${c.name}`}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(c)} aria-label={`Eliminar ${c.name}`}>
                    <Trash2 className="size-4 text-coral" />
                  </Button>
                </div>
              </div>
              <p className="mt-5 flex items-center gap-2 font-semibold">
                <Phone className="size-4 text-brand" aria-hidden /> {c.phone}
              </p>
              {c.email && (
                <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                  <Mail className="size-4" aria-hidden /> {c.email}
                </p>
              )}
              <div className="mt-5 flex gap-2">
                {c.notifySms && (
                  <Badge tone="brand">
                    <MessageSquare className="size-3.5" aria-hidden /> SMS
                  </Badge>
                )}
                {c.notifyEmail && (
                  <Badge tone="brand">
                    <Mail className="size-3.5" aria-hidden /> Correo
                  </Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Nuevo contacto' : 'Editar contacto'}>
        {editing !== null && <ContactForm initial={editing === 'new' ? undefined : editing} nextPriority={(contacts.data?.length ?? 0) + 1} onSubmit={save} onCancel={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}
