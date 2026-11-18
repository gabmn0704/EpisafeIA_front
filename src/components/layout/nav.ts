import { Activity, ClipboardList, FileText, Home, LayoutDashboard, Pill, Sparkles, Users, Watch } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export interface MoreItem extends NavItem {
  tint: string
}

export const navItems: NavItem[] = [
  { to: '/app', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/app/registro', label: 'Registro diario', icon: ClipboardList },
  { to: '/app/medicamentos', label: 'Medicamentos', icon: Pill },
  { to: '/app/crisis', label: 'Crisis', icon: Activity },
  { to: '/app/insights', label: 'Insights de IA', icon: Sparkles },
  { to: '/app/dispositivos', label: 'Reloj y dispositivos', icon: Watch },
  { to: '/app/contactos', label: 'Contactos', icon: Users },
  { to: '/app/informe', label: 'Informe médico', icon: FileText },
]

/** Pestañas de la barra inferior móvil (el botón SOS va al centro y "Más" al final). */
export const tabItems: NavItem[] = [
  { to: '/app', label: 'Inicio', icon: Home, end: true },
  { to: '/app/registro', label: 'Registro', icon: ClipboardList },
  { to: '/app/medicamentos', label: 'Medicinas', icon: Pill },
]

/** Secciones que viven en la hoja "Más". */
export const moreItems: MoreItem[] = [
  { to: '/app/crisis', label: 'Crisis', icon: Activity, tint: 'bg-coral-soft text-coral' },
  { to: '/app/insights', label: 'Insights de IA', icon: Sparkles, tint: 'bg-brand-soft text-brand' },
  { to: '/app/dispositivos', label: 'Reloj', icon: Watch, tint: 'bg-cyan/20 text-cyan' },
  { to: '/app/contactos', label: 'Contactos', icon: Users, tint: 'bg-lime/40 text-lime-ink' },
  { to: '/app/informe', label: 'Informe médico', icon: FileText, tint: 'bg-surface-2 text-ink' },
]
