import type { EmergencyEvent } from '@/lib/api/types'
import { formatTime } from '@/lib/format'

/** Mensaje de ayuda con nombre, hora y enlace de mapa (si hay ubicación). */
export function buildHelpMessage(name: string, event: EmergencyEvent | null): string {
  const time = formatTime(event?.triggeredAt ?? new Date().toISOString())
  const where = event?.latitude != null && event?.longitude != null ? `https://maps.google.com/?q=${event.latitude},${event.longitude}` : 'sin ubicación disponible'
  return `${name} necesita ayuda ahora (alerta de EpiSafe IA a las ${time}). Ubicación: ${where}`
}
