import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, Menu, Moon, Siren, Sun, X } from 'lucide-react'
import clsx from 'clsx'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/providers/AuthProvider'
import { useTheme } from '@/providers/ThemeProvider'
import { useToast } from '@/providers/ToastProvider'
import { openStream } from '@/lib/api/endpoints'
import { navItems } from './nav'

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Navegación principal" className="flex flex-col gap-1">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            clsx(
              'group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium transition',
              isActive ? 'bg-white/12 text-white' : 'text-white/70 hover:bg-white/8 hover:text-white',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && <motion.span layoutId="nav-pill" className="absolute inset-y-2 left-0 w-1 rounded-full bg-lime" />}
              <Icon className={clsx('size-5', isActive && 'text-lime')} aria-hidden />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = (user?.fullName ?? 'EP')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <Link to="/app" className="px-2 pt-1" onClick={onNavigate} aria-label="EpiSafe IA, ir al resumen">
        <Logo tone="light" />
      </Link>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <NavList onNavigate={onNavigate} />
      </div>
      <div className="rounded-3xl bg-white/8 p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-lime font-display font-bold text-lime-ink">{initials}</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.fullName}</p>
            <p className="truncate text-xs text-white/60">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            await logout()
            navigate('/', { replace: true })
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-white/20 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <LogOut className="size-4" aria-hidden /> Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export function AppLayout() {
  const { theme, toggle } = useTheme()
  const [drawer, setDrawer] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    return openStream((e) => {
      if (e.type === 'wearable_alert') {
        toast.push({
          tone: 'warning',
          title: 'Alerta de tu reloj',
          description: 'Detectamos un patrón inusual. Revisa cómo te sientes.',
          durationMs: 9000,
          action: { label: 'Ver dispositivos', onClick: () => navigate('/app/dispositivos') },
        })
      } else if (e.type === 'emergency') {
        toast.push({ tone: 'error', title: 'Emergencia activa', description: 'Se avisó a tus contactos.', durationMs: 9000 })
      }
    })
  }, [toast, navigate])

  return (
    <div className="min-h-dvh bg-bg">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-lime focus:px-4 focus:py-2 focus:text-lime-ink">
        Saltar al contenido
      </a>

      <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-72 bg-[radial-gradient(120%_80%_at_0%_0%,#3a1fb8_0%,#150c4d_55%,#0a0628_100%)] lg:block">
        <SidebarBody />
      </aside>

      <div className="lg:pl-72">
        <header className="no-print sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-bg/80 px-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <button type="button" onClick={() => setDrawer(true)} aria-label="Abrir menú" className="grid size-10 place-items-center rounded-full border border-line bg-surface">
              <Menu className="size-5" />
            </button>
            <Logo className="[&>span:last-child]:hidden sm:[&>span:last-child]:inline" />
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="grid size-10 place-items-center rounded-full border border-line bg-surface text-ink transition hover:border-brand"
            >
              {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
            <Link
              to="/app/emergencia"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-coral px-4 text-sm font-bold text-white shadow-[0_8px_24px_-8px_var(--coral)] transition hover:brightness-110 active:scale-95"
            >
              <Siren className="size-4" aria-hidden /> Emergencia
            </Link>
          </div>
        </header>

        <main id="contenido" tabIndex={-1} className="mx-auto w-full max-w-7xl px-4 pb-24 pt-8 sm:px-8 lg:pb-16">
          <Outlet />
        </main>
      </div>

      <AnimatePresence>
        {drawer && (
          <div className="no-print fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Menú"
              className="absolute inset-y-0 left-0 w-[19rem] max-w-[86vw] bg-[radial-gradient(120%_80%_at_0%_0%,#3a1fb8_0%,#150c4d_55%,#0a0628_100%)]"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            >
              <button type="button" onClick={() => setDrawer(false)} aria-label="Cerrar menú" className="absolute right-3 top-4 z-10 grid size-9 place-items-center rounded-full bg-white/10 text-white">
                <X className="size-5" />
              </button>
              <SidebarBody onNavigate={() => setDrawer(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
