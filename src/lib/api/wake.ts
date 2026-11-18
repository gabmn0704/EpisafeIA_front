import { API_URL } from './client'

/** El plan gratuito del backend puede tardar ~50 s en despertar; esperamos hasta 90 s. */
export const WAKE_MAX_MS = 90_000
const ATTEMPT_TIMEOUT_MS = 8_000
const RETRY_DELAY_MS = 2_000
/** Si responde antes de esto no mostramos nada: no hay nada que explicar. */
export const WAKE_NOTICE_AFTER_MS = 2_500

export type WakeStatus = 'idle' | 'checking' | 'waking' | 'awake' | 'failed'
export interface WakeState {
  status: WakeStatus
  elapsedMs: number
}

let state: WakeState = { status: 'idle', elapsedMs: 0 }
let inflight: Promise<boolean> | null = null
const listeners = new Set<() => void>()

const set = (next: WakeState) => {
  state = next
  listeners.forEach((l) => l())
}

export const wakeStore = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

async function ping(): Promise<boolean> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ATTEMPT_TIMEOUT_MS)
  try {
    const res = await fetch(`${API_URL}/health`, { signal: ctrl.signal, cache: 'no-store' })
    return res.ok
  } catch {
    // Si CORS bloquea la lectura pero el servidor contesta, está despierto: que la petición real
    // reporte el problema de CORS en lugar de esperar 90 s por algo que no es un arranque en frío.
    try {
      await fetch(`${API_URL}/health`, { mode: 'no-cors', signal: ctrl.signal, cache: 'no-store' })
      return true
    } catch {
      return false
    }
  } finally {
    clearTimeout(t)
  }
}

/**
 * Hace ping a /health con reintentos hasta que el servidor responda o pasen 90 s.
 * Es idempotente: las llamadas concurrentes comparten la misma espera.
 */
export function ensureAwake(): Promise<boolean> {
  if (state.status === 'awake') return Promise.resolve(true)
  if (inflight) return inflight
  const started = Date.now()
  set({ status: 'checking', elapsedMs: 0 })
  inflight = (async () => {
    while (Date.now() - started < WAKE_MAX_MS) {
      if (await ping()) {
        set({ status: 'awake', elapsedMs: Date.now() - started })
        return true
      }
      const elapsedMs = Date.now() - started
      set({ status: elapsedMs >= WAKE_NOTICE_AFTER_MS ? 'waking' : 'checking', elapsedMs })
      await sleep(RETRY_DELAY_MS)
    }
    set({ status: 'failed', elapsedMs: Date.now() - started })
    return false
  })().finally(() => {
    inflight = null
  })
  return inflight
}

/** Vuelve a intentarlo tras un fallo. */
export function retryWake(): Promise<boolean> {
  if (state.status === 'failed') state = { status: 'idle', elapsedMs: 0 }
  return ensureAwake()
}

/** Solo para pruebas. */
export function resetWakeForTests() {
  inflight = null
  set({ status: 'idle', elapsedMs: 0 })
}
