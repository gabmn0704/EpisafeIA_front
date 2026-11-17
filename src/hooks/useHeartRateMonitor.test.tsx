import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { useHeartRateMonitor } from './useHeartRateMonitor'

type Listener = (e: Event) => void

function makeFakeBluetooth() {
  const charListeners = new Set<Listener>()
  const devListeners = new Map<string, Listener>()
  const characteristic = {
    value: undefined as DataView | undefined,
    addEventListener: (_: string, l: Listener) => charListeners.add(l),
    removeEventListener: (_: string, l: Listener) => charListeners.delete(l),
    startNotifications: vi.fn().mockResolvedValue(undefined),
  }
  const server = {
    connected: true,
    getPrimaryService: vi.fn().mockResolvedValue({ getCharacteristic: vi.fn().mockResolvedValue(characteristic) }),
  }
  const device = {
    id: 'dev-1',
    name: 'Banda de prueba',
    gatt: { connect: vi.fn().mockResolvedValue(server), connected: true, disconnect: vi.fn() },
    addEventListener: (n: string, l: Listener) => devListeners.set(n, l),
    removeEventListener: (n: string) => devListeners.delete(n),
  }
  const emit = (hex: number[]) => {
    characteristic.value = new DataView(new Uint8Array(hex).buffer)
    charListeners.forEach((l) => l({ target: characteristic } as unknown as Event))
  }
  return { device, emit, devListeners, requestDevice: vi.fn().mockResolvedValue(device) }
}

describe('useHeartRateMonitor', () => {
  const original = Object.getOwnPropertyDescriptor(navigator, 'bluetooth')
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
  afterEach(() => {
    vi.useRealTimers()
    if (original) Object.defineProperty(navigator, 'bluetooth', original)
    else Reflect.deleteProperty(navigator, 'bluetooth')
  })

  it('reports lack of support without throwing', () => {
    Reflect.deleteProperty(navigator, 'bluetooth')
    const { result } = renderHook(() => useHeartRateMonitor())
    expect(result.current.support.supported).toBe(false)
    expect(result.current.status).toBe('idle')
  })

  it('connects, parses notifications and fills the buffer without inventing data', async () => {
    const fake = makeFakeBluetooth()
    Object.defineProperty(navigator, 'bluetooth', { value: { requestDevice: fake.requestDevice }, configurable: true })
    const send = vi.fn().mockResolvedValue({ accepted: 1 })
    const { result } = renderHook(() => useHeartRateMonitor({ send, flushIntervalMs: 1000 }))
    expect(result.current.points).toEqual([])

    await act(async () => {
      await result.current.connect()
    })
    expect(result.current.status).toBe('connected')
    expect(result.current.deviceName).toBe('Banda de prueba')

    act(() => fake.emit([0x16, 72, 0x00, 0x04, 0x00, 0x04]))
    expect(result.current.current).toBe(72)
    expect(result.current.points).toHaveLength(1)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200)
    })
    await waitFor(() => expect(send).toHaveBeenCalled())
    const batch = send.mock.calls[0]?.[0] as { heartRate: number }[]
    expect(batch[0]?.heartRate).toBe(72)
  })

  it('ignores readings while the sensor has no skin contact', async () => {
    const fake = makeFakeBluetooth()
    Object.defineProperty(navigator, 'bluetooth', { value: { requestDevice: fake.requestDevice }, configurable: true })
    const { result } = renderHook(() => useHeartRateMonitor())
    await act(async () => {
      await result.current.connect()
    })
    act(() => fake.emit([0x04, 80]))
    expect(result.current.points).toHaveLength(0)
    expect(result.current.sensorContact).toBe('no_contact')
  })

  it('tries to reconnect after an unexpected disconnect', async () => {
    const fake = makeFakeBluetooth()
    Object.defineProperty(navigator, 'bluetooth', { value: { requestDevice: fake.requestDevice }, configurable: true })
    const { result } = renderHook(() => useHeartRateMonitor())
    await act(async () => {
      await result.current.connect()
    })
    act(() => fake.devListeners.get('gattserverdisconnected')?.(new Event('gattserverdisconnected')))
    expect(result.current.status).toBe('reconnecting')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1100)
    })
    expect(result.current.status).toBe('connected')
  })

  it('returns to idle silently when the user cancels the chooser', async () => {
    const requestDevice = vi.fn().mockRejectedValue(new DOMException('User cancelled the requestDevice() chooser.', 'NotFoundError'))
    Object.defineProperty(navigator, 'bluetooth', { value: { requestDevice }, configurable: true })
    const { result } = renderHook(() => useHeartRateMonitor())
    await act(async () => {
      await result.current.connect()
    })
    expect(result.current.status).toBe('idle')
    expect(result.current.error).toBeNull()
  })
})
