import { useEffect, useState } from 'react'
import { RefreshCw, WifiOff } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * Registra el service worker (solo en producción, para no chocar con MSW en desarrollo)
 * y avisa cuando hay una versión nueva o la app ya está lista para usarse sin conexión.
 */
export function UpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const [update, setUpdate] = useState<(() => Promise<void>) | null>(null)

  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
    let cancelled = false
    void import('virtual:pwa-register').then(({ registerSW }) => {
      if (cancelled) return
      const fn = registerSW({
        onNeedRefresh: () => setNeedRefresh(true),
        onOfflineReady: () => setOfflineReady(true),
      })
      setUpdate(() => () => fn(true))
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!offlineReady) return
    const t = window.setTimeout(() => setOfflineReady(false), 5000)
    return () => window.clearTimeout(t)
  }, [offlineReady])

  const show = needRefresh || offlineReady
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className="no-print fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[120] mx-auto flex max-w-md items-center gap-3 rounded-3xl bg-ink p-3 pl-4 text-bg shadow-elev-3 lg:bottom-6"
        >
          {needRefresh ? <RefreshCw className="size-5 shrink-0 text-lime" aria-hidden /> : <WifiOff className="size-5 shrink-0 text-lime" aria-hidden />}
          <p className="flex-1 text-sm font-medium">{needRefresh ? 'Hay una versión nueva de EpiSafe.' : 'Lista para usarse sin conexión.'}</p>
          {needRefresh ? (
            <button type="button" onClick={() => void update?.()} className="press min-h-11 rounded-full bg-lime px-4 text-sm font-bold text-lime-ink">
              Actualizar
            </button>
          ) : (
            <button type="button" onClick={() => setOfflineReady(false)} className="press min-h-11 rounded-full px-3 text-sm font-semibold text-bg/80">
              Ok
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
