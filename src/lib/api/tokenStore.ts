import type { TokenPair } from './types'

const KEY = 'episafe.session'

type Listener = (tokens: TokenPair | null) => void
const listeners = new Set<Listener>()

let memory: TokenPair | null = null

function read(): TokenPair | null {
  if (memory) return memory
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<TokenPair>
    if (typeof parsed.accessToken === 'string' && typeof parsed.refreshToken === 'string') {
      memory = { accessToken: parsed.accessToken, refreshToken: parsed.refreshToken }
      return memory
    }
  } catch {
    /* storage unavailable or corrupted */
  }
  return null
}

export const tokenStore = {
  get: read,
  set(tokens: TokenPair): void {
    memory = tokens
    try {
      localStorage.setItem(KEY, JSON.stringify(tokens))
    } catch {
      /* ignore quota or privacy mode errors */
    }
    listeners.forEach((l) => l(tokens))
  },
  clear(): void {
    memory = null
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l(null))
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
