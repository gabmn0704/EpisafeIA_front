import { LogoMark } from '@/components/ui/Logo'

/** Loader de marca: el escudo late mientras carga algo. */
export function BrandLoader({ label = 'Cargando', fullscreen = true }: { label?: string; fullscreen?: boolean }) {
  return (
    <div role="status" className={fullscreen ? 'grid min-h-dvh place-items-center bg-bg' : 'grid place-items-center py-16'}>
      <div className="flex flex-col items-center gap-4">
        <LogoMark className="size-16 animate-[heartbeat_1.2s_ease-in-out_infinite]" />
        <p className="text-sm font-medium text-muted">{label}...</p>
      </div>
    </div>
  )
}
