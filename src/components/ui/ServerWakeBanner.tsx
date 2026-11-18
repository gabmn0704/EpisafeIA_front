import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CloudOff } from 'lucide-react'
import { LogoMark } from '@/components/ui/Logo'
import { useServerWake } from '@/hooks/useServerWake'
import { ensureAwake, retryWake, WAKE_MAX_MS } from '@/lib/api/wake'

/**
 * Hace ping al servidor al cargar la app y, si tarda en despertar, muestra un aviso amable
 * con progreso en lugar de errores de red.
 */
export function ServerWakeBanner() {
  const wake = useServerWake()

  useEffect(() => {
    void ensureAwake()
  }, [])

  const waking = wake.status === 'waking'
  const failed = wake.status === 'failed'
  const pct = Math.min(100, Math.round((wake.elapsedMs / WAKE_MAX_MS) * 100))

  return (
    <AnimatePresence>
      {(waking || failed) && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="no-print fixed inset-x-4 top-[max(0.75rem,env(safe-area-inset-top))] z-[130] mx-auto max-w-md rounded-3xl bg-ink p-4 text-bg shadow-elev-3"
        >
          <div className="flex items-start gap-3">
            {failed ? (
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-lime text-lime-ink">
                <CloudOff className="size-5" aria-hidden />
              </span>
            ) : (
              <LogoMark className="size-10 shrink-0 animate-[heartbeat_1.2s_ease-in-out_infinite]" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-display font-semibold leading-tight">{failed ? 'El servidor no responde todavía' : 'Despertando el servidor…'}</p>
              <p className="mt-0.5 text-sm text-bg/75">{failed ? 'Revisa tu conexión e inténtalo de nuevo en un momento.' : 'La primera vez del día puede tardar hasta un minuto. Tus datos están a salvo.'}</p>
            </div>
          </div>
          {failed ? (
            <button type="button" onClick={() => void retryWake()} className="press mt-3 min-h-11 w-full rounded-full bg-lime px-4 text-sm font-bold text-lime-ink">
              Reintentar
            </button>
          ) : (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg/15" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Progreso al despertar el servidor">
              <div className="h-full rounded-full bg-lime transition-[width] duration-1000 ease-linear" style={{ width: `${Math.max(4, pct)}%` }} />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
