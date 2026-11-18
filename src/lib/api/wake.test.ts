import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ensureAwake, resetWakeForTests, wakeStore } from './wake'

describe('ensureAwake (cold start)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetWakeForTests()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('retries /health until the server answers and reports "waking" meanwhile', async () => {
    let calls = 0
    vi.stubGlobal('fetch', vi.fn(async (_u: string, init?: RequestInit) => {
      if (init?.mode === 'no-cors') throw new TypeError('network')
      calls++
      if (calls < 4) throw new TypeError('network')
      return new Response('{"status":"ok"}', { status: 200 })
    }))
    const p = ensureAwake()
    await vi.advanceTimersByTimeAsync(4_500)
    expect(wakeStore.get().status).toBe('waking')
    await vi.advanceTimersByTimeAsync(8_000)
    await expect(p).resolves.toBe(true)
    expect(wakeStore.get().status).toBe('awake')
    expect(calls).toBe(4)
  })

  it('gives up after about 90 seconds', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('network')
    }))
    const p = ensureAwake()
    await vi.advanceTimersByTimeAsync(95_000)
    await expect(p).resolves.toBe(false)
    expect(wakeStore.get().status).toBe('failed')
  })

  it('treats a CORS-blocked but reachable server as awake', async () => {
    vi.stubGlobal('fetch', vi.fn(async (_u: string, init?: RequestInit) => {
      if (init?.mode === 'no-cors') return new Response(null)
      throw new TypeError('CORS')
    }))
    await expect(ensureAwake()).resolves.toBe(true)
  })

  it('answers immediately once awake', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 200 })))
    await ensureAwake()
    await expect(ensureAwake()).resolves.toBe(true)
  })
})
