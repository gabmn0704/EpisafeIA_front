import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { Logo } from '@/components/ui/Logo'

function FullScreenLoader() {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg" role="status" aria-label="Verificando sesión">
      <div className="flex flex-col items-center gap-5">
        <Logo />
        <span className="size-6 animate-spin rounded-full border-2 border-brand border-t-transparent" aria-hidden />
      </div>
    </div>
  )
}

/** Blocks private routes; remembers where the person was heading. */
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()
  if (status === 'loading') return <FullScreenLoader />
  if (status === 'anonymous') return <Navigate to="/iniciar-sesion" replace state={{ from: location.pathname + location.search }} />
  return <Outlet />
}

/** Keeps authenticated people out of login / register pages. */
export function GuestOnly() {
  const { status } = useAuth()
  if (status === 'loading') return <FullScreenLoader />
  if (status === 'authenticated') return <Navigate to="/app" replace />
  return <Outlet />
}
