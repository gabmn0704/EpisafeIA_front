const LOCALE = 'es-CO'

export const toISODate = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const todayISO = (): string => toISODate(new Date())

export const addDays = (d: Date, n: number): Date => {
  const out = new Date(d)
  out.setDate(out.getDate() + n)
  return out
}

export const parseISODate = (iso: string): Date => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

export const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }): string =>
  new Intl.DateTimeFormat(LOCALE, opts).format(iso.length <= 10 ? parseISODate(iso) : new Date(iso))

export const formatTime = (iso: string): string =>
  new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso))

export const formatDateTime = (iso: string): string =>
  new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso))

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null) return 'Sin dato'
  if (seconds < 60) return `${seconds} s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s === 0 ? `${m} min` : `${m} min ${s} s`
}

export function relativeTime(iso: string, now = Date.now()): string {
  const diff = new Date(iso).getTime() - now
  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' })
  const abs = Math.abs(diff)
  const min = 60_000
  if (abs < min) return 'justo ahora'
  if (abs < 60 * min) return rtf.format(Math.round(diff / min), 'minute')
  if (abs < 24 * 60 * min) return rtf.format(Math.round(diff / (60 * min)), 'hour')
  return rtf.format(Math.round(diff / (24 * 60 * min)), 'day')
}

export const greeting = (hour = new Date().getHours()): string => (hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches')

export const percent = (n: number, digits = 0): string => `${(n * 100).toFixed(digits)}%`

export const riskLabel: Record<string, string> = { low: 'Bajo', moderate: 'Moderado', high: 'Alto', critical: 'Crítico' }

export const riskColor: Record<string, string> = {
  low: 'var(--risk-low)',
  moderate: 'var(--risk-moderate)',
  high: 'var(--risk-high)',
  critical: 'var(--risk-critical)',
}

export const riskSoft: Record<string, string> = {
  low: 'var(--risk-low-soft)',
  moderate: 'var(--risk-moderate-soft)',
  high: 'var(--risk-high-soft)',
  critical: 'var(--risk-critical-soft)',
}
