import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Moon, Sun, X } from 'lucide-react'
import clsx from 'clsx'
import { Logo } from '@/components/ui/Logo'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { useAuth } from '@/providers/AuthProvider'
import { useTheme } from '@/providers/ThemeProvider'

const links = [
  { href: '#problema', label: 'El problema' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#funciones', label: 'Funciones' },
  { href: '#seguridad', label: 'Seguridad' },
]

/** Floating glass pill navigation. */
export function LandingNav() {
  const { theme, toggle } = useTheme()
  const { status } = useAuth()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const authed = status === 'authenticated'

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div className={clsx('w-full max-w-5xl rounded-[2rem] border backdrop-blur-xl transition-all duration-300', scrolled ? 'border-white/15 bg-[#0b0630]/80 shadow-[0_20px_60px_-20px_rgba(11,6,48,0.8)]' : 'border-white/10 bg-[#0b0630]/45')}>
        <div className="flex items-center justify-between gap-4 px-4 py-2.5 pl-5">
          <Link to="/" aria-label="EpiSafe IA, inicio">
            <Logo tone="light" />
          </Link>
          <nav aria-label="Secciones" className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="rounded-full px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggle} aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} className="grid size-10 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white">
              {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
            <Link to={authed ? '/app' : '/iniciar-sesion'} className="hidden px-3 text-sm font-semibold text-white/85 hover:text-white sm:block">
              {authed ? 'Ir a mi panel' : 'Iniciar sesión'}
            </Link>
            {!authed && (
              <Link to="/registro" className={buttonClasses('lime', 'sm', 'hidden sm:inline-flex')}>
                Empezar gratis
              </Link>
            )}
            <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? 'Cerrar menú' : 'Abrir menú'} className="grid size-10 place-items-center rounded-full text-white md:hidden">
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="border-t border-white/10 p-3 md:hidden">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 font-medium text-white/90 hover:bg-white/10">
                {l.label}
              </a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link to={authed ? '/app' : '/iniciar-sesion'} className={buttonClasses('outline', 'md', '!border-white/25 !bg-transparent !text-white')}>
                {authed ? 'Mi panel' : 'Entrar'}
              </Link>
              {!authed && (
                <Link to="/registro" className={buttonClasses('lime', 'md')}>
                  Empezar
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
