import { Route, Routes } from 'react-router-dom'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, beforeAll, beforeEach } from 'vitest'
import { tokenStore } from '@/lib/api/tokenStore'
import { server } from '@/mocks/server'
import { renderWithProviders } from '@/test/renderWithProviders'
import LoginPage from './LoginPage'

const ui = (
  <Routes>
    <Route path="/iniciar-sesion" element={<LoginPage />} />
    <Route path="/app" element={<p>panel privado</p>} />
  </Routes>
)

describe('LoginPage', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
  afterAll(() => server.close())
  beforeEach(() => tokenStore.clear())

  it('shows validation messages without calling the API', async () => {
    const user = userEvent.setup()
    renderWithProviders(ui, { route: '/iniciar-sesion' })
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(await screen.findByText('Ingresa tu correo')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu contraseña')).toBeInTheDocument()
  })

  it('shows the server error for wrong credentials', async () => {
    const user = userEvent.setup()
    renderWithProviders(ui, { route: '/iniciar-sesion' })
    await user.type(screen.getByLabelText('Correo electrónico'), 'demo@episafe.app')
    await user.type(screen.getByLabelText('Contraseña'), 'incorrecta')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos')
  })

  it('logs in and navigates to the private area', async () => {
    const user = userEvent.setup()
    renderWithProviders(ui, { route: '/iniciar-sesion' })
    await user.type(screen.getByLabelText('Correo electrónico'), 'demo@episafe.app')
    await user.type(screen.getByLabelText('Contraseña'), 'Demo1234!')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(await screen.findByText('panel privado')).toBeInTheDocument()
    expect(tokenStore.get()?.accessToken).toBeTruthy()
  })
})
