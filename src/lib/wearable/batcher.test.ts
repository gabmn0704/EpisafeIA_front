import { vi } from 'vitest'
import { SampleBatcher } from './batcher'

const sample = (n: number) => ({ sampledAt: new Date(1_700_000_000_000 + n * 1000).toISOString(), heartRate: 60 + (n % 20) })

describe('SampleBatcher', () => {
  it('flushes in batches of at most 200', async () => {
    const send = vi.fn().mockResolvedValue(undefined)
    const b = new SampleBatcher({ send, maxBatch: 500, intervalMs: 60_000 })
    for (let i = 0; i < 450; i++) b.add(sample(i))
    await b.flush()
    const sizes = send.mock.calls.map((c) => (c[0] as unknown[]).length)
    expect(Math.max(...sizes)).toBeLessThanOrEqual(200)
    expect(sizes.reduce((a, c) => a + c, 0)).toBe(450)
    expect(b.queued).toBe(0)
  })

  it('keeps samples when sending fails and retries later', async () => {
    const send = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined)
    const b = new SampleBatcher({ send, intervalMs: 60_000 })
    b.add(sample(1))
    b.add(sample(2))
    expect(await b.flush()).toBe(0)
    expect(b.queued).toBe(2)
    expect(await b.flush()).toBe(2)
    expect(b.queued).toBe(0)
  })

  it('caps retained samples while offline', async () => {
    const send = vi.fn().mockRejectedValue(new Error('offline'))
    const b = new SampleBatcher({ send, maxPending: 5, maxBatch: 1000 })
    for (let i = 0; i < 12; i++) b.add(sample(i))
    expect(b.queued).toBe(5)
  })

  it('flushes on a timer', async () => {
    vi.useFakeTimers()
    const send = vi.fn().mockResolvedValue(undefined)
    const b = new SampleBatcher({ send, intervalMs: 1000 })
    b.start()
    b.add(sample(1))
    await vi.advanceTimersByTimeAsync(1100)
    expect(send).toHaveBeenCalledTimes(1)
    await b.stop()
    vi.useRealTimers()
  })
})
