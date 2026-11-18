import { useSyncExternalStore } from 'react'
import { wakeStore } from '@/lib/api/wake'

/** Estado del arranque en frío del servidor (idle, checking, waking, awake, failed). */
export function useServerWake() {
  return useSyncExternalStore(wakeStore.subscribe, wakeStore.get, wakeStore.get)
}
