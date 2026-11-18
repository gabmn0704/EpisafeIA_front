import { useEffect, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
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
  const drag = useDragControls()

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
            className="absolute inset-0 bg-ink/55 backdrop-blur-sm"
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
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
            drag="y"
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose()
            }}
            className="relative flex max-h-[92dvh] w-full flex-col rounded-t-[2rem] border-t border-line bg-surface shadow-elev-3 outline-none sm:max-w-lg sm:rounded-[2rem] sm:border"
          >
            <div
              onPointerDown={(e) => drag.start(e)}
              className="flex shrink-0 cursor-grab touch-none justify-center pb-1 pt-3 sm:hidden"
              aria-hidden
            >
              <span className="h-1.5 w-11 rounded-full bg-line" />
            </div>
            <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-2 sm:px-6 sm:pt-6">
              <h2 className="font-display text-xl font-semibold">{title}</h2>
              <button type="button" onClick={onClose} aria-label="Cerrar" className="press grid size-11 place-items-center rounded-full bg-surface-2 text-muted">
                <X className="size-5" />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
