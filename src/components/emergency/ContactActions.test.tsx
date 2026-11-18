import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { EmergencyContact } from '@/lib/api/types'
import { buildHelpMessage } from '@/lib/helpMessage'
import { ContactActions } from './ContactActions'

const c = (id: string, name: string, priority: number, phone: string): EmergencyContact => ({ id, name, relationship: 'Familiar', phone, email: null, priority, notifySms: true, notifyEmail: false })
const event = { id: 'e1', triggeredAt: '2026-11-18T10:30:00.000Z', status: 'active', latitude: 4.6, longitude: -74.1 } as never

describe('ContactActions', () => {
  it('lists every contact by priority with call, SMS and WhatsApp links', () => {
    render(
      <MemoryRouter>
        <ContactActions contacts={[c('b', 'Julián', 2, '+57 311 765 4321'), c('a', 'Marta', 1, '+57 300 123 4567')]} name="Camila" event={event} />
      </MemoryRouter>,
    )
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Marta')
    expect(screen.getByRole('link', { name: 'Llamar a Marta' })).toHaveAttribute('href', 'tel:+573001234567')
    expect(screen.getByRole('link', { name: 'Enviar SMS a Marta' }).getAttribute('href')).toMatch(/^sms:\+573001234567\?body=/)
    expect(screen.getByRole('link', { name: 'Enviar WhatsApp a Marta' }).getAttribute('href')).toMatch(/^https:\/\/wa\.me\/573001234567\?text=/)
  })

  it('shows an empty state that leads to adding a contact', () => {
    render(
      <MemoryRouter>
        <ContactActions contacts={[]} name="Camila" event={null} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /Agregar un contacto/ })).toHaveAttribute('href', '/app/contactos')
  })

  it('builds a message with name and map link', () => {
    const msg = buildHelpMessage('Camila', event)
    expect(msg).toContain('Camila')
    expect(msg).toContain('https://maps.google.com/?q=4.6,-74.1')
  })
})
