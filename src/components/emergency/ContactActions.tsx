import { Link } from 'react-router-dom'
import { MessageCircle, MessageSquare, Phone, UserPlus } from 'lucide-react'
import type { EmergencyContact, EmergencyEvent } from '@/lib/api/types'
import { buildHelpMessage } from '@/lib/helpMessage'

const digits = (phone: string) => phone.replace(/[^0-9]/g, '')
const dialable = (phone: string) => phone.replace(/[^+0-9]/g, '')

/** Cada contacto, por prioridad, con acciones directas: llamar, SMS y WhatsApp. */
export function ContactActions({ contacts, name, event }: { contacts: EmergencyContact[]; name: string; event: EmergencyEvent | null }) {
  const sorted = [...contacts].sort((a, b) => a.priority - b.priority)
  const text = buildHelpMessage(name, event)

  if (sorted.length === 0) {
    return (
      <div className="rounded-3xl bg-black/25 p-5 text-center">
        <p className="font-semibold">Aún no tienes contactos de emergencia</p>
        <p className="mt-1 text-sm text-white/80">Agrega a una persona de confianza para poder avisarle con un toque.</p>
        <Link to="/app/contactos" className="press mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-lime px-5 font-bold text-lime-ink">
          <UserPlus className="size-5" aria-hidden /> Agregar un contacto
        </Link>
      </div>
    )
  }

  const action = 'press flex min-h-12 min-w-0 items-center justify-center gap-1.5 rounded-2xl px-1 text-[0.8rem] font-bold'
  return (
    <ul className="space-y-3" aria-label="Avisar a mis contactos">
      {sorted.map((c) => (
        <li key={c.id} className="rounded-3xl bg-black/25 p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-lime font-display text-sm font-extrabold text-lime-ink">{c.priority}</span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-semibold leading-tight">{c.name}</p>
              <p className="truncate text-sm text-white/75">
                {c.relationship} &middot; {c.phone}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <a href={`tel:${dialable(c.phone)}`} className={`${action} bg-white text-[#7a0024]`} aria-label={`Llamar a ${c.name}`}>
              <Phone className="size-4" aria-hidden /> Llamar
            </a>
            <a href={`sms:${dialable(c.phone)}?body=${encodeURIComponent(text)}`} className={`${action} bg-white/15 text-white`} aria-label={`Enviar SMS a ${c.name}`}>
              <MessageSquare className="size-4" aria-hidden /> SMS
            </a>
            <a href={`https://wa.me/${digits(c.phone)}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className={`${action} bg-[#25D366] text-[#052e16]`} aria-label={`Enviar WhatsApp a ${c.name}`}>
              <MessageCircle className="size-4" aria-hidden /> WhatsApp
            </a>
          </div>
        </li>
      ))}
    </ul>
  )
}
