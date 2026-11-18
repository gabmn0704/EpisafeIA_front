import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/providers/AuthProvider'
import { ToastProvider } from '@/providers/ToastProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'

export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
  return render(
    <ThemeProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={[route]}>
          <AuthProvider>{ui}</AuthProvider>
        </MemoryRouter>
      </ToastProvider>
    </ThemeProvider>,
  )
}
