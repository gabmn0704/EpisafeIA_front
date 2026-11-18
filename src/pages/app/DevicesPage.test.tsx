import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import DevicesPage from './DevicesPage'

describe('DevicesPage', () => {
  it('shows a coming-soon card with no pairing button', () => {
    renderWithProviders(<DevicesPage />)
    expect(screen.getByText('Próximamente')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /conectar/i })).toBeNull()
    expect('bluetooth' in navigator).toBe(false)
  })
})
