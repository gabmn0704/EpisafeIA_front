import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { Queue } from '@/lib/structures'

export type ToastTone = 'success' | 'error' | 'info' | 'warning'

export interface ToastInput {
  title: string
  description?: string
  tone?: ToastTone
  durationMs?: number
  action?: { label: string; onClick: () => void }
}

interface Toast extends ToastInput {
  id: number
  tone: ToastTone
}

interface ToastApi {
  push: (t: ToastInput) => number
  dismiss: (id: number) => void
  success: (title: string, description?: string) => number
  error: (title: string, description?: string) => number
  info: (title: string, description?: string) => number
}

const MAX_VISIBLE = 3
const ToastContext = createContext<ToastApi | null>(null)

const icons = { success: CheckCircle2, error: XCircle, info: Info, warning: AlertTriangle }
const tones: Record<ToastTone, string> = {
  success: 'text-ok',
  error: 'text-coral',
  info: 'text-brand',
  warning: 'text-amber',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState<Toast[]>([])
  // Overflow toasts wait here in FIFO order until a slot frees up.
  const waiting = useRef(new Queue<Toast>())
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    waiting.current.remove((t) => t.id === id)
    setVisible((list) => {
      const rest = list.filter((t) => t.id !== id)
      if (rest.length < list.length) {
        const promoted = waiting.current.dequeue()
        if (promoted) rest.push(promoted)
      }
      return rest
    })
  }, [])

  const push = useCallback((input: ToastInput) => {
    const toast: Toast = { ...input, id: nextId.current++, tone: input.tone ?? 'info' }
    setVisible((list) => {
      if (list.length < MAX_VISIBLE) return [...list, toast]
      waiting.current.enqueue(toast)
      return list
    })
    return toast.id
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      push,
      dismiss,
      success: (title, description) => push({ title, description, tone: 'success' }),
      error: (title, description) => push({ title, description, tone: 'error', durationMs: 7000 }),
      info: (title, description) => push({ title, description, tone: 'info' }),
    }),
    [push, dismiss],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="no-print pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
        role="region"
        aria-label="Notificaciones"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {visible.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={() => dismiss(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const Icon = icons[toast.tone]
  const duration = toast.durationMs ?? 4500
  useEffect(() => {
    const id = setTimeout(onClose, duration)
    return () => clearTimeout(id)
  }, [duration, onClose])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      role={toast.tone === 'error' ? 'alert' : 'status'}
      className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card"
    >
      <Icon className={`mt-0.5 size-5 shrink-0 ${tones[toast.tone]}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-sm text-muted">{toast.description}</p>}
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick()
              onClose()
            }}
            className="mt-2 text-sm font-semibold text-brand underline-offset-4 hover:underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button type="button" onClick={onClose} aria-label="Cerrar notificación" className="rounded-md p-1 text-muted hover:text-ink">
        <X className="size-4" />
      </button>
    </motion.div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
