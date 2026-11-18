import { useEffect, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/** Accessible dialog: focus moves in, Escape closes, focus returns to the trigger. */
export function Modal({ open, title, onClose, children }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    panel.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previous?.focus()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="no-print fixed inset-0 z-[90] grid place-items-end sm:place-items-center">
          <motion.div
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-line bg-surface p-6 shadow-card sm:max-w-lg sm:rounded-3xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">{title}</h2>
              <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-ink">
                <X className="size-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
