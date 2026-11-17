import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'
import { enableMocks } from './mocks/enable'
import { AuthProvider } from './providers/AuthProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { ToastProvider } from './providers/ToastProvider'
import { AppRoutes } from './routes/AppRoutes'

async function bootstrap() {
  // Mocks are only ever active in development with VITE_USE_MOCKS=true.
  await enableMocks()
  const root = document.getElementById('root')
  if (!root) throw new Error('Root element not found')
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <ToastProvider>
            <BrowserRouter>
              <AuthProvider>
                <AppRoutes />
              </AuthProvider>
            </BrowserRouter>
          </ToastProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </StrictMode>,
  )
}

void bootstrap()
