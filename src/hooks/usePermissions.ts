import { useCallback, useEffect, useState } from 'react'

export type PermissionUi = 'granted' | 'denied' | 'prompt' | 'unsupported'

/** Browser notification permission, with a request helper. */
export function useNotificationPermission() {
  const supported = typeof Notification !== 'undefined'
  const [state, setState] = useState<PermissionUi>(() => {
    if (typeof Notification === 'undefined') return 'unsupported'
    return Notification.permission === 'default' ? 'prompt' : Notification.permission
  })

  const request = useCallback(async () => {
    if (!supported) return
    const r = await Notification.requestPermission()
    setState(r === 'default' ? 'prompt' : r)
  }, [supported])

  return { state, request }
}

/** Geolocation permission through the Permissions API when available. */
export function useGeolocationPermission(): PermissionUi {
  const [state, setState] = useState<PermissionUi>(() => (typeof navigator !== 'undefined' && 'geolocation' in navigator ? 'prompt' : 'unsupported'))

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.permissions) return
    let status: PermissionStatus | null = null
    let alive = true
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((s) => {
        if (!alive) return
        status = s
        setState(s.state)
        s.onchange = () => setState(s.state)
      })
      .catch(() => undefined)
    return () => {
      alive = false
      if (status) status.onchange = null
    }
  }, [])

  return state
}
