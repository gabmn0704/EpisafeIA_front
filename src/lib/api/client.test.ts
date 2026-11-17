import { afterEach, beforeEach, vi } from 'vitest'
import { ApiError, asList, request } from './client'
import { tokenStore } from './tokenStore'

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('api client', () => {
  beforeEach(() => {
    tokenStore.clear()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('attaches the bearer token', async () => {
    tokenStore.set({ accessToken: 'a1', refreshToken: 'r1' })
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(json(200, { ok: true }))
    await request('/auth/me')
    const init = spy.mock.calls[0]?.[1] as RequestInit
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer a1')
  })

  it('refreshes once on 401 and retries the request', async () => {
    tokenStore.set({ accessToken: 'old', refreshToken: 'r1' })
    const spy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(json(401, { error: { code: 'UNAUTHORIZED', message: 'x' } }))
      .mockResolvedValueOnce(json(200, { accessToken: 'new', refreshToken: 'r2' }))
      .mockResolvedValueOnce(json(200, { id: 'u1' }))
    const out = await request<{ id: string }>('/auth/me')
    expect(out.id).toBe('u1')
    expect(spy).toHaveBeenCalledTimes(3)
    expect(tokenStore.get()?.accessToken).toBe('new')
  })

  it('clears the session when refresh fails', async () => {
    tokenStore.set({ accessToken: 'old', refreshToken: 'r1' })
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(json(401, { error: { code: 'UNAUTHORIZED', message: 'x' } }))
      .mockResolvedValueOnce(json(401, { error: { code: 'UNAUTHORIZED', message: 'x' } }))
    await expect(request('/auth/me')).rejects.toBeInstanceOf(ApiError)
    expect(tokenStore.get()).toBeNull()
  })

  it('maps the uniform error body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      json(422, { error: { code: 'VALIDATION_ERROR', message: 'Correo invalido', details: [{ field: 'email' }] } }),
    )
    await expect(request('/auth/login', { method: 'POST', body: {}, auth: false })).rejects.toMatchObject({
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Correo invalido',
    })
  })

  it('reports network failures with status 0', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('fail'))
    await expect(request('/health', { auth: false })).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' })
  })

  it('asList accepts arrays and envelopes', () => {
    expect(asList<number>([1, 2])).toEqual([1, 2])
    expect(asList<number>({ items: [3] })).toEqual([3])
    expect(asList<number>(null)).toEqual([])
  })
})
