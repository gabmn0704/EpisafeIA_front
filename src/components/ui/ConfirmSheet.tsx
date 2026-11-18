import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from './Button'
import { Modal } from './Modal'

/** Confirmación destructiva como hoja inferior (sustituye a window.confirm). */
export function ConfirmSheet({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => Promise<void> | void
  onCancel: () => void
}) {
  const [busy, setBusy] = useState(false)
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="flex items-start gap-3 rounded-3xl bg-coral-soft p-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-coral text-white">
          <Trash2 className="size-5" aria-hidden />
        </span>
        <p className="text-[0.95rem] leading-snug">{message}</p>
      </div>
      <div className="mt-5 grid gap-3">
        <Button
          variant="danger"
          size="lg"
          loading={busy}
          onClick={async () => {
            setBusy(true)
            try {
              await onConfirm()
            } finally {
              setBusy(false)
            }
          }}
        >
          {confirmLabel}
        </Button>
        <Button variant="ghost" size="lg" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </Modal>
  )
}
