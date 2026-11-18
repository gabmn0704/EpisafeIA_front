import { tokenStore } from './tokenStore'
import type { ApiErrorBody, TokenPair } from './types'

export const API_URL: string = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:4000/api/v1'

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown[],
  ) {
    super(message)
    this.name = 'ApiError'
  }

  get isNetwork(): boolean {
    return this.status === 0
  }
}

/** Margen amplio para tolerar el arranque en frío del backend gratuito. */
const REQUEST_TIMEOUT_MS = 60_000

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number | undefined | null>
  auth?: boolean
  signal?: AbortSignal
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(API_URL + path, window.location.origin)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
    }
  }
  return url.toString()
}

async function parseError(res: Response): Promise<ApiError> {
  let body: Partial<ApiErrorBody> | null = null
  try {
    body = (await res.json()) as Partial<ApiErrorBody>
  } catch {
    /* no JSON body */
  }
  const err = body?.error
  return new ApiError(res.status, err?.code ?? 'HTTP_ERROR', err?.message ?? `Error ${res.status}`, err?.details)
}

let refreshing: Promise<TokenPair | null> | null = null

/** Single-flight refresh: concurrent 401s share one refresh request. */
export function refreshTokens(): Promise<TokenPair | null> {
  if (refreshing) return refreshing
  const current = tokenStore.get()
  if (!current) return Promise.resolve(null)
  refreshing = (async () => {
    try {
      const res = await fetch(buildUrl('/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      })
      if (!res.ok) {
        tokenStore.clear()
        return null
      }
      const next = (await res.json()) as Partial<TokenPair>
      if (!next.accessToken) {
        tokenStore.clear()
        return null
      }
      const pair = { accessToken: next.accessToken, refreshToken: next.refreshToken ?? current.refreshToken }
      tokenStore.set(pair)
      return pair
    } catch {
      return null
    } finally {
      refreshing = null
    }
  })()
  return refreshing
}

async function send(path: string, opts: RequestOptions, token: string | null): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  // Tiempo máximo por petición: el servidor gratuito puede estar despertando.
  const timeout = new AbortController()
  const timer = setTimeout(() => timeout.abort(), REQUEST_TIMEOUT_MS)
  const external = opts.signal
  const onExternalAbort = () => timeout.abort()
  external?.addEventListener('abort', onExternalAbort)
  try {
    return await fetch(buildUrl(path, opts.query), {
      method: opts.method ?? 'GET',
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: timeout.signal,
    })
  } catch (e) {
    if (external?.aborted) throw e
    if (timeout.signal.aborted) throw new ApiError(0, 'NETWORK_ERROR', 'El servidor está tardando en responder. Inténtalo de nuevo en un momento.')
    throw new ApiError(0, 'NETWORK_ERROR', 'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.')
  } finally {
    clearTimeout(timer)
    external?.removeEventListener('abort', onExternalAbort)
  }
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const useAuth = opts.auth !== false
  let res = await send(path, opts, useAuth ? (tokenStore.get()?.accessToken ?? null) : null)

  if (res.status === 401 && useAuth && tokenStore.get()) {
    const pair = await refreshTokens()
    if (pair) res = await send(path, opts, pair.accessToken)
    else tokenStore.clear()
  }

  if (!res.ok) throw await parseError(res)
  if (res.status === 204) return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

/** Normalizes endpoints that may answer with an array or a { items } / { data } envelope. */
export function asList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object') {
    const o = payload as Record<string, unknown>
    for (const key of ['items', 'data', 'results']) if (Array.isArray(o[key])) return o[key] as T[]
  }
  return []
}
