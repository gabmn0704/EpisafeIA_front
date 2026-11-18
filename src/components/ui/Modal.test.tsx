import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'

describe('Modal (bottom sheet)', () => {
  it('renders an accessible dialog and closes with Escape and the close button', async () => {
    const onClose = vi.fn()
    render(
      <Modal open title="Hoja de prueba" onClose={onClose}>
        <p>Contenido</p>
      </Modal>,
    )
    expect(screen.getByRole('dialog', { name: 'Hoja de prueba' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('renders nothing when closed', () => {
    render(
      <Modal open={false} title="Oculta" onClose={() => {}}>
        <p>x</p>
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
