import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { MotionConfig, motion } from 'framer-motion'
import { LogOut, Moon, Siren, Sun } from 'lucide-react'
import clsx from 'clsx'
import { Logo, LogoMark } from '@/components/ui/Logo'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/providers/AuthProvider'
import { useTheme } from '@/providers/ThemeProvider'
import { useToast } from '@/providers/ToastProvider'
import { openStream } from '@/lib/api/endpoints'
import { moreItems, navItems, tabItems } from './nav'

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
              'press group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium',
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

function initialsOf(name?: string) {
  return (name ?? 'EP')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <Link to="/app" className="px-2 pt-1" aria-label="EpiSafe IA, ir al resumen">
        <Logo tone="light" />
      </Link>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <NavList />
      </div>
      <div className="rounded-3xl bg-white/8 p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-lime font-display font-bold text-lime-ink">{initialsOf(user?.fullName)}</span>
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
          className="press mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-white/20 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
        >
          <LogOut className="size-4" aria-hidden /> Cerrar sesión
        </button>
      </div>
    </div>
  )
}

function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  return (
    <Modal open={open} onClose={onClose} title="Más opciones">
      <div className="flex items-center gap-3 rounded-3xl bg-surface-2 p-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-brand font-display text-lg font-bold text-brand-ink">{initialsOf(user?.fullName)}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{user?.fullName}</p>
          <p className="truncate text-sm text-muted">{user?.email}</p>
        </div>
      </div>
      <nav aria-label="Más secciones" className="mt-4 grid grid-cols-2 gap-3">
        {moreItems.map(({ to, label, icon: Icon, tint }) => (
          <Link key={to} to={to} onClick={onClose} className="press flex min-h-[4.5rem] items-center gap-3 rounded-3xl border border-line bg-surface p-3.5 font-semibold">
            <span className={clsx('grid size-11 shrink-0 place-items-center rounded-2xl', tint)}>
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="leading-tight">{label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-4 space-y-2">
        <button type="button" onClick={toggle} className="press flex min-h-[3.25rem] w-full items-center justify-between rounded-2xl border border-line bg-surface px-4 font-semibold">
          <span className="flex items-center gap-3">
            {theme === 'dark' ? <Sun className="size-5 text-amber" aria-hidden /> : <Moon className="size-5 text-brand" aria-hidden />}
            {theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          </span>
        </button>
        <button
          type="button"
          onClick={async () => {
            onClose()
            await logout()
            navigate('/', { replace: true })
          }}
          className="press flex min-h-[3.25rem] w-full items-center gap-3 rounded-2xl px-4 font-semibold text-coral"
        >
          <LogOut className="size-5" aria-hidden /> Cerrar sesión
        </button>
      </div>
    </Modal>
  )
}

function TabBar({ onMore, moreActive }: { onMore: () => void; moreActive: boolean }) {
  const tab = 'press relative flex min-h-[3.5rem] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold'
  const [left, right] = [tabItems.slice(0, 2), tabItems.slice(2)]
  const renderTab = ({ to, label, icon: Icon, end }: (typeof tabItems)[number]) => (
    <NavLink key={to} to={to} end={end} className={({ isActive }) => clsx(tab, isActive ? 'text-brand' : 'text-muted')}>
      {({ isActive }) => (
        <>
          {isActive && <motion.span layoutId="tab-dot" className="absolute top-0 h-1 w-7 rounded-b-full bg-brand" transition={{ type: 'spring', stiffness: 500, damping: 34 }} />}
          <Icon className="size-[1.4rem]" strokeWidth={isActive ? 2.5 : 2} aria-hidden />
          {label}
        </>
      )}
    </NavLink>
  )
  return (
    <nav
      aria-label="Navegación principal"
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 pb-safe backdrop-blur-2xl lg:hidden"
    >
      <div className="mx-auto flex max-w-xl items-stretch px-2">
        {left.map(renderTab)}
        <div className="relative flex flex-1 justify-center">
          <Link
            to="/app/emergencia"
            aria-label="Emergencia: pedir ayuda"
            className="press absolute -top-8 grid size-16 place-items-center rounded-full bg-coral text-white ring-4 ring-bg animate-[sos-breathe_2.4s_ease-in-out_infinite]"
          >
            <Siren className="size-7" aria-hidden />
          </Link>
          <span className="mt-auto pb-1.5 text-[11px] font-bold text-coral" aria-hidden>
            SOS
          </span>
        </div>
        {right.map(renderTab)}
        <button type="button" onClick={onMore} aria-haspopup="dialog" className={clsx(tab, moreActive ? 'text-brand' : 'text-muted')}>
          <span className="grid size-[1.4rem] grid-cols-2 gap-[3px] p-[2px]" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="rounded-[3px] bg-current" />
            ))}
          </span>
          Más
        </button>
      </div>
    </nav>
  )
}

export function AppLayout() {
  const { theme, toggle } = useTheme()
  const [more, setMore] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const moreActive = moreItems.some((i) => pathname.startsWith(i.to))

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

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh bg-bg">
        <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-lime focus:px-4 focus:py-2 focus:text-lime-ink">
          Saltar al contenido
        </a>

        <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-72 bg-[radial-gradient(120%_80%_at_0%_0%,#3a1fb8_0%,#150c4d_55%,#0a0628_100%)] lg:block">
          <Sidebar />
        </aside>

        <div className="lg:pl-72 print:pl-0">
          <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line/70 bg-bg/80 px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-2xl sm:px-8 lg:h-16 lg:py-0">
            <Link to="/app" aria-label="EpiSafe IA, ir al resumen" className="press flex items-center gap-2 lg:hidden">
              <LogoMark className="size-9" />
              <span className="font-display text-lg font-bold tracking-tight">
                EpiSafe<span className="text-brand"> IA</span>
              </span>
            </Link>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggle}
                aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                className="press grid size-11 place-items-center rounded-full bg-surface text-ink shadow-elev-1"
              >
                {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
              </button>
              <Link
                to="/app/emergencia"
                className="press hidden h-11 items-center gap-2 rounded-full bg-coral px-5 text-sm font-bold text-white shadow-[0_8px_24px_-8px_var(--coral)] lg:inline-flex"
              >
                <Siren className="size-4" aria-hidden /> Emergencia
              </Link>
            </div>
          </header>

          <main id="contenido" tabIndex={-1} className="mx-auto w-full max-w-7xl px-4 pb-[calc(var(--tabbar-h)+2.5rem+env(safe-area-inset-bottom))] pt-5 outline-none sm:px-8 sm:pt-8 lg:pb-16">
            <motion.div key={pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}>
              <Outlet />
            </motion.div>
          </main>
        </div>

        <TabBar onMore={() => setMore(true)} moreActive={moreActive} />
        <MoreSheet open={more} onClose={() => setMore(false)} />
      </div>
    </MotionConfig>
  )
}
