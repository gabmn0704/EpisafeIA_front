import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterAll, beforeAll, beforeEach } from 'vitest'
import { AuthProvider } from '@/providers/AuthProvider'
import { tokenStore } from '@/lib/api/tokenStore'
import { server } from '@/mocks/server'
import { GuestOnly, RequireAuth } from './guards'

const tree = (initial: string) => (
  <MemoryRouter initialEntries={[initial]}>
    <AuthProvider>
      <Routes>
        <Route element={<GuestOnly />}>
          <Route path="/iniciar-sesion" element={<p>pantalla de login</p>} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="/app" element={<p>zona privada</p>} />
        </Route>
      </Routes>
    </AuthProvider>
  </MemoryRouter>
)

describe('route guards', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
  afterAll(() => server.close())
  beforeEach(() => tokenStore.clear())

  it('redirects anonymous visitors to login', async () => {
    render(tree('/app'))
    expect(await screen.findByText('pantalla de login')).toBeInTheDocument()
  })

  it('lets authenticated users into the private area and out of login', async () => {
    tokenStore.set({ accessToken: 'mock-access', refreshToken: 'mock-refresh' })
    render(tree('/app'))
    expect(await screen.findByText('zona privada')).toBeInTheDocument()
  })

  it('sends authenticated users away from the login page', async () => {
    tokenStore.set({ accessToken: 'mock-access', refreshToken: 'mock-refresh' })
    render(tree('/iniciar-sesion'))
    expect(await screen.findByText('zona privada')).toBeInTheDocument()
  })
})
