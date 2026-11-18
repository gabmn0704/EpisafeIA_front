import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, beforeAll, beforeEach } from 'vitest'
import { tokenStore } from '@/lib/api/tokenStore'
import { server } from '@/mocks/server'
import { renderWithProviders } from '@/test/renderWithProviders'
import MedicationsPage from './MedicationsPage'

describe('MedicationsPage', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
  afterAll(() => server.close())
  beforeEach(() => tokenStore.set({ accessToken: 'mock-access', refreshToken: 'mock-refresh' }))

  it('marks a dose as taken and updates the progress', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MedicationsPage />)
    expect(await screen.findByText('0 de 4 dosis tomadas')).toBeInTheDocument()
    const buttons = await screen.findAllByRole('button', { name: /tomada/i })
    await user.click(buttons[0] as HTMLElement)
    await waitFor(() => expect(screen.getByText('1 de 4 dosis tomadas')).toBeInTheDocument())
  })

  it('suggests medications from the local trie while typing', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MedicationsPage />)
    await user.click(await screen.findByRole('button', { name: /agregar medicamento/i }))
    await user.type(screen.getByRole('combobox'), 'lamo')
    expect(await screen.findByRole('option', { name: 'Lamotrigina' })).toBeInTheDocument()
  })
})
