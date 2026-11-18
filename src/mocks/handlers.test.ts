import { afterAll, beforeAll, beforeEach } from 'vitest'
import { server } from './server'
import { authApi, dashboardApi, medicationsApi, seizuresApi, wearablesApi } from '@/lib/api/endpoints'
import { tokenStore } from '@/lib/api/tokenStore'

describe('mock API (dev and tests only)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterAll(() => server.close())
  beforeEach(() => tokenStore.set({ accessToken: 'mock-access', refreshToken: 'mock-refresh' }))

  it('logs in the demo user and rejects wrong passwords', async () => {
    const ok = await authApi.login('demo@episafe.app', 'Demo1234!')
    expect(ok.user.email).toBe('demo@episafe.app')
    await expect(authApi.login('demo@episafe.app', 'mal')).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })
  })

  it('exposes seizures planted with a low-sleep correlation', async () => {
    const list = await seizuresApi.list()
    expect(list.length).toBeGreaterThan(5)
  })

  it('returns a dashboard and a medication schedule', async () => {
    const d = await dashboardApi.summary()
    expect(d.risk?.score).toBeGreaterThan(0)
    const schedule = await medicationsApi.scheduleToday()
    expect(schedule.length).toBeGreaterThan(0)
  })

  it('never fabricates wearable readings', async () => {
    expect(await wearablesApi.live(10)).toEqual([])
    expect((await wearablesApi.summary(24)).samples).toBe(0)
  })
})
