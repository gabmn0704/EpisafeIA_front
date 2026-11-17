import { Activity, ClipboardList, FileText, LayoutDashboard, Pill, Sparkles, Users, Watch } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
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
