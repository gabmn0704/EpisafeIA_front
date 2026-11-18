import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CircularBuffer } from '@/lib/structures'
import { SampleBatcher } from '@/lib/wearable/batcher'
import { parseHeartRateMeasurement, rmssd, type SensorContact } from '@/lib/wearable/heartRate'
import { describeBluetoothError, detectBluetoothSupport, type BluetoothSupport } from '@/lib/wearable/support'
import type { WearableSampleInput } from '@/lib/api/types'

export type MonitorStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error'

export interface HeartRatePoint {
  t: number
  bpm: number
}

export interface UseHeartRateMonitorOptions {
  /** Ships batches to the backend (POST /wearables/samples). */
  send?: (samples: WearableSampleInput[], deviceId?: string) => Promise<unknown>
  /** Called once a device is connected so the page can register it with the API. */
  onDeviceConnected?: (device: { name: string; id: string }) => Promise<string | undefined> | void
  bufferSize?: number
  maxReconnectAttempts?: number
  flushIntervalMs?: number
}

export interface HeartRateMonitor {
  support: BluetoothSupport
  status: MonitorStatus
  deviceName: string | null
  current: number | null
  sensorContact: SensorContact | null
  hrvMs: number | null
  points: HeartRatePoint[]
  error: string | null
  reconnectAttempt: number
  pendingSamples: number
  sentSamples: number
  connect: () => Promise<void>
  disconnect: () => void
}

const RR_WINDOW = 30

export function useHeartRateMonitor(options: UseHeartRateMonitorOptions = {}): HeartRateMonitor {
  const { send, onDeviceConnected, bufferSize = 120, maxReconnectAttempts = 5, flushIntervalMs = 10_000 } = options

  const support = useMemo(() => detectBluetoothSupport(), [])
  const [status, setStatus] = useState<MonitorStatus>('idle')
  const [deviceName, setDeviceName] = useState<string | null>(null)
  const [current, setCurrent] = useState<number | null>(null)
  const [sensorContact, setSensorContact] = useState<SensorContact | null>(null)
  const [hrvMs, setHrvMs] = useState<number | null>(null)
  const [points, setPoints] = useState<HeartRatePoint[]>([])
  const [error, setError] = useState<string | null>(null)
  const [reconnectAttempt, setReconnectAttempt] = useState(0)
  const [pendingSamples, setPendingSamples] = useState(0)
  const [sentSamples, setSentSamples] = useState(0)

  const bufferRef = useRef(new CircularBuffer<HeartRatePoint>(bufferSize))
  const rrRef = useRef(new CircularBuffer<number>(RR_WINDOW))
  const deviceRef = useRef<BluetoothDevice | null>(null)
  const charRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null)
  const batcherRef = useRef<SampleBatcher | null>(null)
  const deviceIdRef = useRef<string | undefined>(undefined)
  const manualStopRef = useRef(false)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sendRef = useRef(send)
  const onConnectedRef = useRef(onDeviceConnected)
  const retryRef = useRef<(attempt: number) => void>(() => undefined)

  useEffect(() => {
    sendRef.current = send
    onConnectedRef.current = onDeviceConnected
  })

  const handleValue = useCallback((event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic
    if (!target.value) return
    try {
      const m = parseHeartRateMeasurement(target.value)
      setSensorContact(m.sensorContact)
      // Ignore readings while the strap reports it is not touching the skin.
      if (m.sensorContact === 'no_contact' || m.heartRate <= 0) return
      const now = Date.now()
      bufferRef.current.push({ t: now, bpm: m.heartRate })
      for (const rr of m.rrIntervalsMs) rrRef.current.push(rr)
      const hrv = rmssd(rrRef.current.toArray())
      setCurrent(m.heartRate)
      setHrvMs(hrv === null ? null : Math.round(hrv * 10) / 10)
      setPoints(bufferRef.current.toArray())
      const sample: WearableSampleInput = { sampledAt: new Date(now).toISOString(), heartRate: m.heartRate }
      if (hrv !== null) sample.hrvMs = Math.round(hrv * 10) / 10
      batcherRef.current?.add(sample)
      setPendingSamples(batcherRef.current?.queued ?? 0)
    } catch {
      /* a malformed frame must not kill the stream */
    }
  }, [])

  const startNotifications = useCallback(
    async (device: BluetoothDevice) => {
      const server = await device.gatt?.connect()
      if (!server) throw new Error('GATT no disponible')
      const service = await server.getPrimaryService('heart_rate')
      const characteristic = await service.getCharacteristic('heart_rate_measurement')
      charRef.current?.removeEventListener('characteristicvaluechanged', handleValue)
      characteristic.addEventListener('characteristicvaluechanged', handleValue)
      await characteristic.startNotifications()
      charRef.current = characteristic
    },
    [handleValue],
  )

  const scheduleReconnect = useCallback(
    (attempt: number) => {
      const device = deviceRef.current
      if (!device || manualStopRef.current) return
      if (attempt > maxReconnectAttempts) {
        setStatus('error')
        setError('Perdimos la conexión con el reloj y no logramos recuperarla. Acércalo y vuelve a conectar.')
        return
      }
      setStatus('reconnecting')
      setReconnectAttempt(attempt)
      const delay = Math.min(1000 * 2 ** (attempt - 1), 15_000)
      reconnectTimer.current = setTimeout(async () => {
        try {
          await startNotifications(device)
          setStatus('connected')
          setReconnectAttempt(0)
          setError(null)
        } catch {
          retryRef.current(attempt + 1)
        }
      }, delay)
    },
    [maxReconnectAttempts, startNotifications],
  )

  useEffect(() => {
    retryRef.current = scheduleReconnect
  }, [scheduleReconnect])

  const onDisconnected = useCallback(() => {
    if (manualStopRef.current) return
    scheduleReconnect(1)
  }, [scheduleReconnect])

  const teardown = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
    reconnectTimer.current = null
    const device = deviceRef.current
    device?.removeEventListener('gattserverdisconnected', onDisconnected)
    charRef.current?.removeEventListener('characteristicvaluechanged', handleValue)
    try {
      if (device?.gatt?.connected) device.gatt.disconnect()
    } catch {
      /* already disconnected */
    }
    charRef.current = null
    deviceRef.current = null
  }, [handleValue, onDisconnected])

  const connect = useCallback(async () => {
    if (!support.supported) return
    setError(null)
    setStatus('connecting')
    manualStopRef.current = false
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service'],
      })
      teardown()
      deviceRef.current = device
      device.addEventListener('gattserverdisconnected', onDisconnected)
      await startNotifications(device)

      const name = device.name ?? 'Dispositivo Bluetooth'
      setDeviceName(name)
      try {
        deviceIdRef.current = (await onConnectedRef.current?.({ name, id: device.id })) ?? undefined
      } catch {
        /* registration failure should not block live monitoring */
      }

      const batcher = new SampleBatcher({
        send: async (samples) => {
          if (!sendRef.current) throw new Error('send no configurado')
          await sendRef.current(samples, deviceIdRef.current)
          setSentSamples((n) => n + samples.length)
          setPendingSamples(batcherRef.current?.queued ?? 0)
        },
        intervalMs: flushIntervalMs,
      })
      batcherRef.current?.stop().catch(() => undefined)
      batcherRef.current = batcher
      if (sendRef.current) batcher.start()
      setStatus('connected')
    } catch (e) {
      const info = describeBluetoothError(e)
      teardown()
      if (info.kind === 'cancelled') {
        setStatus('idle')
        setError(null)
      } else {
        setStatus('error')
        setError(info.message)
      }
    }
  }, [support.supported, teardown, onDisconnected, startNotifications, flushIntervalMs])

  const disconnect = useCallback(() => {
    manualStopRef.current = true
    teardown()
    batcherRef.current?.stop().catch(() => undefined)
    batcherRef.current = null
    setStatus('idle')
    setCurrent(null)
    setSensorContact(null)
    setReconnectAttempt(0)
  }, [teardown])

  useEffect(
    () => () => {
      manualStopRef.current = true
      teardown()
      batcherRef.current?.stop().catch(() => undefined)
    },
    [teardown],
  )

  return {
    support,
    status,
    deviceName,
    current,
    sensorContact,
    hrvMs,
    points,
    error,
    reconnectAttempt,
    pendingSamples,
    sentSamples,
    connect,
    disconnect,
  }
}
