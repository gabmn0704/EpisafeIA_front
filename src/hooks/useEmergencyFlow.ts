import { useCallback, useEffect, useRef, useState } from 'react'
import { emergencyApi } from '@/lib/api/endpoints'
import type { EmergencyEvent } from '@/lib/api/types'

export type EmergencyPhase = 'idle' | 'countdown' | 'locating' | 'sending' | 'active' | 'error'
export type LocationState = 'unknown' | 'granted' | 'denied' | 'unavailable' | 'timeout'

export interface EmergencyFlow {
  phase: EmergencyPhase
  secondsLeft: number
  event: EmergencyEvent | null
  location: LocationState
  error: string | null
  start: () => void
  cancel: () => void
  triggerNow: () => void
  resolve: () => Promise<void>
  falseAlarm: () => Promise<void>
}

export function getPosition(timeoutMs = 7000): Promise<{ latitude: number; longitude: number } | { error: LocationState }> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return resolve({ error: 'unavailable' })
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
      (e) => resolve({ error: e.code === e.PERMISSION_DENIED ? 'denied' : e.code === e.TIMEOUT ? 'timeout' : 'unavailable' }),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 30_000 },
    )
  })
}

/**
 * One tap starts a cancellable countdown. When it reaches zero we try to obtain the location
 * (never blocking the alert for longer than the timeout) and then POST /emergency.
 */
export function useEmergencyFlow(countdownSeconds = 5): EmergencyFlow {
  const [phase, setPhase] = useState<EmergencyPhase>('idle')
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds)
  const [event, setEvent] = useState<EmergencyEvent | null>(null)
  const [location, setLocation] = useState<LocationState>('unknown')
  const [error, setError] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const aborted = useRef(false)

  const clear = useCallback(() => {
    if (timer.current) clearInterval(timer.current)
    timer.current = null
  }, [])

  const send = useCallback(async () => {
    aborted.current = false
    setPhase('locating')
    const pos = await getPosition()
    if (aborted.current) return
    if ('error' in pos) setLocation(pos.error)
    else setLocation('granted')
    setPhase('sending')
    try {
      const ev = await emergencyApi.trigger('error' in pos ? {} : pos)
      if (aborted.current) return
      setEvent(ev)
      setPhase('active')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos enviar la alerta.')
      setPhase('error')
    }
  }, [])

  const triggerNow = useCallback(() => {
    clear()
    setError(null)
    void send()
  }, [clear, send])

  const start = useCallback(() => {
    clear()
    setError(null)
    setSecondsLeft(countdownSeconds)
    setPhase('countdown')
    timer.current = setInterval(() => {
      setSecondsLeft((s) => s - 1)
    }, 1000)
  }, [clear, countdownSeconds])

  useEffect(() => {
    if (phase === 'countdown' && secondsLeft <= 0) {
      clear()
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void send()
    }
  }, [phase, secondsLeft, clear, send])

  const cancel = useCallback(() => {
    aborted.current = true
    clear()
    setPhase('idle')
    setSecondsLeft(countdownSeconds)
  }, [clear, countdownSeconds])

  const finish = useCallback(
    async (fn: (id: string) => Promise<EmergencyEvent>) => {
      if (!event) return
      try {
        await fn(event.id)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No pudimos actualizar el estado.')
        return
      }
      setEvent(null)
      setPhase('idle')
      setLocation('unknown')
    },
    [event],
  )

  useEffect(() => clear, [clear])

  return {
    phase,
    secondsLeft: Math.max(0, secondsLeft),
    event,
    location,
    error,
    start,
    cancel,
    triggerNow,
    resolve: () => finish(emergencyApi.resolve),
    falseAlarm: () => finish(emergencyApi.falseAlarm),
  }
}
