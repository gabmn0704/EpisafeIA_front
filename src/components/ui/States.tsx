import type { ReactNode } from 'react'
import { AlertOctagon, WifiOff } from 'lucide-react'
import clsx from 'clsx'
import { Button } from './Button'
import { ApiError } from '@/lib/api/client'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={clsx(
        'animate-[shimmer_1.6s_linear_infinite] rounded-2xl bg-[linear-gradient(110deg,var(--surface-2)_30%,var(--line)_50%,var(--surface-2)_70%)] bg-[length:200%_100%]',
        className,
      )}
    />
  )
}

export function Spinner({ label = 'Cargando' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-10 text-muted">
      <span className="size-5 animate-spin rounded-full border-2 border-brand border-t-transparent" aria-hidden />
      <span className="text-sm">{label}...</span>
    </div>
  )
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-12 text-center">
      <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand">{icon}</span>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ error, onRetry, compact }: { error: unknown; onRetry?: () => void; compact?: boolean }) {
  const network = error instanceof ApiError && error.isNetwork
  const message = error instanceof Error ? error.message : 'Algo salió mal.'
  const Icon = network ? WifiOff : AlertOctagon
  return (
    <div role="alert" className={clsx('flex flex-col items-center rounded-3xl bg-coral-soft text-center', compact ? 'p-6' : 'px-6 py-12')}>
      <Icon className="mb-3 size-8 text-coral" aria-hidden />
      <p className="font-display text-lg font-semibold text-ink">{network ? 'Sin conexión con el servidor' : 'No pudimos cargar esto'}</p>
      <p className="mt-1 max-w-md text-sm text-muted">{message}</p>
      {onRetry && (
        <Button className="mt-4" variant="outline" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
