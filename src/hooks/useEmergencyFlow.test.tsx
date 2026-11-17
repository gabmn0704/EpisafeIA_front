import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { emergencyApi } from '@/lib/api/endpoints'
import { useEmergencyFlow } from './useEmergencyFlow'

const fakeEvent = { id: 'em-1', triggeredAt: new Date().toISOString(), status: 'notified' as const }

describe('useEmergencyFlow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (ok: (p: GeolocationPosition) => void) => ok({ coords: { latitude: 4.65, longitude: -74.08 } } as GeolocationPosition),
      },
    })
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('counts down and then sends the alert with the location', async () => {
    const trigger = vi.spyOn(emergencyApi, 'trigger').mockResolvedValue(fakeEvent)
    const { result } = renderHook(() => useEmergencyFlow(3))
    act(() => result.current.start())
    expect(result.current.phase).toBe('countdown')
    expect(result.current.secondsLeft).toBe(3)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3100)
    })
    expect(trigger).toHaveBeenCalledWith({ latitude: 4.65, longitude: -74.08 })
    expect(result.current.phase).toBe('active')
    expect(result.current.location).toBe('granted')
  })

  it('does nothing when cancelled during the countdown', async () => {
    const trigger = vi.spyOn(emergencyApi, 'trigger').mockResolvedValue(fakeEvent)
    const { result } = renderHook(() => useEmergencyFlow(3))
    act(() => result.current.start())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500)
    })
    act(() => result.current.cancel())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })
    expect(trigger).not.toHaveBeenCalled()
    expect(result.current.phase).toBe('idle')
  })

  it('still sends the alert when location is denied', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition: (_ok: unknown, fail: (e: unknown) => void) => fail({ code: 1, PERMISSION_DENIED: 1, TIMEOUT: 3 }) },
    })
    const trigger = vi.spyOn(emergencyApi, 'trigger').mockResolvedValue(fakeEvent)
    const { result } = renderHook(() => useEmergencyFlow(3))
    await act(async () => {
      result.current.triggerNow()
      await vi.advanceTimersByTimeAsync(50)
    })
    expect(trigger).toHaveBeenCalledWith({})
    expect(result.current.location).toBe('denied')
    expect(result.current.phase).toBe('active')
  })

  it('surfaces an error and allows retry when the API fails', async () => {
    vi.spyOn(emergencyApi, 'trigger').mockRejectedValue(new Error('sin red'))
    const { result } = renderHook(() => useEmergencyFlow(3))
    await act(async () => {
      result.current.triggerNow()
      await vi.advanceTimersByTimeAsync(50)
    })
    expect(result.current.phase).toBe('error')
    expect(result.current.error).toBe('sin red')
  })

  it('returns to idle after marking a false alarm', async () => {
    vi.spyOn(emergencyApi, 'trigger').mockResolvedValue(fakeEvent)
    const fa = vi.spyOn(emergencyApi, 'falseAlarm').mockResolvedValue({ ...fakeEvent, status: 'false_alarm' })
    const { result } = renderHook(() => useEmergencyFlow(3))
    await act(async () => {
      result.current.triggerNow()
      await vi.advanceTimersByTimeAsync(50)
    })
    await act(async () => {
      await result.current.falseAlarm()
    })
    expect(fa).toHaveBeenCalledWith('em-1')
    expect(result.current.phase).toBe('idle')
  })
})
