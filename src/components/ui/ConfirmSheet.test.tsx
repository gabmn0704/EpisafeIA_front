import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmSheet } from './ConfirmSheet'

describe('ConfirmSheet', () => {
  it('confirms or cancels a destructive action', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(<ConfirmSheet open title="Eliminar X" message="No se puede deshacer" onConfirm={onConfirm} onCancel={onCancel} />)
    expect(screen.getByRole('dialog', { name: 'Eliminar X' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
