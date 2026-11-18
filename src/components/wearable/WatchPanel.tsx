import { AlertTriangle, Bluetooth, BluetoothOff, HeartPulse, Loader2, Radio, RefreshCw, Unplug } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { HeartRateMonitor } from '@/hooks/useHeartRateMonitor'
import { LiveHeartChart } from './LiveHeartChart'

const contactText = { unsupported: 'El sensor no informa contacto', no_contact: 'Sin contacto con la piel', contact: 'Contacto correcto' } as const

/** Presentational card for the Web Bluetooth heart-rate monitor. Never renders simulated data. */
export function WatchPanel({ monitor }: { monitor: HeartRateMonitor }) {
  const { support, status } = monitor

  if (!support.supported) {
    return (
      <Card>
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber/20 text-ink">
            <BluetoothOff className="size-6" />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold">{support.title}</h2>
            <p className="mt-1 max-w-xl text-muted">{support.message}</p>
            <p className="mt-3 text-sm text-muted">Mientras tanto, tus registros diarios y medicamentos siguen funcionando con normalidad.</p>
          </div>
        </div>
      </Card>
    )
  }

  const live = status === 'connected' || status === 'reconnecting'

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand">
            <Bluetooth className="size-6" />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold">Reloj o banda por Bluetooth</h2>
            <p className="text-sm text-muted">Cualquier dispositivo con el servicio estándar de pulso cardíaco (0x180D).</p>
          </div>
        </div>
        {live ? (
          <Button variant="outline" onClick={monitor.disconnect}>
            <Unplug className="size-4" aria-hidden /> Desconectar
          </Button>
        ) : (
          <Button onClick={monitor.connect} loading={status === 'connecting'}>
            <Bluetooth className="size-4" aria-hidden /> {status === 'error' ? 'Reintentar conexión' : 'Conectar dispositivo'}
          </Button>
        )}
      </div>

      {status === 'idle' && (
        <div className="mt-6 rounded-2xl bg-surface-2 p-6">
          <p className="font-semibold">Aún no hay un dispositivo conectado</p>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted">
            <li>Activa Bluetooth en tu computador o teléfono Android.</li>
            <li>En tu reloj, activa la transmisión de pulso (a veces se llama &quot;Broadcast heart rate&quot;).</li>
            <li>Pulsa Conectar dispositivo y elige tu reloj en la lista.</li>
          </ol>
          <p className="mt-4 text-sm text-muted">No mostramos datos hasta que tu dispositivo envíe mediciones reales.</p>
        </div>
      )}

      {status === 'connecting' && (
        <p role="status" className="mt-6 flex items-center gap-3 text-muted">
          <Loader2 className="size-5 animate-spin" aria-hidden /> Esperando que elijas un dispositivo y conectando...
        </p>
      )}

      {status === 'error' && monitor.error && (
        <div role="alert" className="mt-6 flex items-start gap-3 rounded-2xl bg-coral-soft p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-coral" aria-hidden />
          <p className="font-medium">{monitor.error}</p>
        </div>
      )}

      {live && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={status === 'connected' ? 'ok' : 'amber'}>
              <Radio className="size-3.5" aria-hidden /> {status === 'connected' ? `Conectado a ${monitor.deviceName}` : `Reconectando (intento ${monitor.reconnectAttempt})`}
            </Badge>
            {monitor.sensorContact && <Badge tone={monitor.sensorContact === 'no_contact' ? 'coral' : 'neutral'}>{contactText[monitor.sensorContact]}</Badge>}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[14rem_1fr]">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              <div className="rounded-3xl bg-coral p-5 text-white">
                <p className="flex items-center gap-2 text-sm font-semibold opacity-90">
                  <HeartPulse className="size-4" aria-hidden /> Pulso
                </p>
                <p className="mt-3 font-display text-5xl font-bold tabular-nums" aria-live="polite">
                  {monitor.current ?? '--'}
                  <span className="ml-1 text-lg font-semibold opacity-85">lpm</span>
                </p>
              </div>
              <div className="rounded-3xl bg-surface-2 p-5">
                <p className="text-sm font-semibold text-muted">Variabilidad (RMSSD)</p>
                <p className="mt-3 font-display text-3xl font-bold tabular-nums">
                  {monitor.hrvMs ?? '--'}
                  <span className="ml-1 text-base text-muted">ms</span>
                </p>
                {monitor.hrvMs === null && <p className="mt-1 text-xs text-muted">Tu dispositivo aún no envía intervalos RR.</p>}
              </div>
            </div>
            <div>
              {monitor.points.length === 0 ? (
                <div className="grid h-64 place-items-center rounded-2xl border border-dashed border-line text-center text-sm text-muted">
                  <p className="max-w-xs">Esperando la primera medición real. Verifica que el reloj esté ajustado a la muñeca.</p>
                </div>
              ) : (
                <LiveHeartChart points={monitor.points} />
              )}
            </div>
          </div>

          <p className="mt-5 flex items-center gap-2 text-sm text-muted">
            <RefreshCw className="size-4" aria-hidden />
            {monitor.sentSamples} muestras enviadas &middot; {monitor.pendingSamples} en cola
          </p>
        </div>
      )}
    </Card>
  )
}
