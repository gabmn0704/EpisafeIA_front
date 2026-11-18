import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellRing, Trash2, Watch } from 'lucide-react'
import { CloudProviders } from '@/components/wearable/CloudProviders'
import { WatchPanel } from '@/components/wearable/WatchPanel'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { ErrorState, Skeleton } from '@/components/ui/States'
import { useHeartRateMonitor } from '@/hooks/useHeartRateMonitor'
import { useQuery } from '@/hooks/useQuery'
import { wearablesApi } from '@/lib/api/endpoints'
import type { WearableSampleInput } from '@/lib/api/types'
import { relativeTime } from '@/lib/format'
import { useToast } from '@/providers/ToastProvider'

const providerLabel = { web_bluetooth: 'Bluetooth', fitbit: 'Fitbit', google_health: 'Google Health', apple_health: 'Apple Health', garmin: 'Garmin', manual: 'Manual' } as const
const alertLabel = { tachycardia: 'Taquicardia sostenida', motion_convulsive: 'Movimiento convulsivo', hr_anomaly: 'Pulso anómalo', fall: 'Posible caída' } as const

export default function DevicesPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const devices = useQuery(() => wearablesApi.devices())
  const alerts = useQuery(() => wearablesApi.alerts())

  const send = useCallback((samples: WearableSampleInput[], deviceId?: string) => wearablesApi.sendSamples(samples, deviceId), [])
  const onDeviceConnected = useCallback(
    async ({ name, id }: { name: string; id: string }) => {
      const existing = devices.data?.find((d) => d.externalId === id)
      if (existing) return existing.id
      const created = await wearablesApi.addDevice({ provider: 'web_bluetooth', deviceName: name, externalId: id })
      devices.reload()
      return created.id
    },
    [devices],
  )
  const monitor = useHeartRateMonitor({ send, onDeviceConnected })

  const removeDevice = async (id: string, name: string) => {
    if (!window.confirm(`¿Quitar ${name}?`)) return
    try {
      await wearablesApi.removeDevice(id)
      devices.reload()
    } catch (e) {
      toast.error('No se pudo quitar', e instanceof Error ? e.message : undefined)
    }
  }

  const escalate = async (id: string) => {
    try {
      await wearablesApi.escalate(id)
      toast.success('Alerta convertida en emergencia', 'Avisamos a tus contactos.')
      alerts.reload()
      navigate('/app/emergencia')
    } catch (e) {
      toast.error('No se pudo escalar', e instanceof Error ? e.message : undefined)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Reloj y dispositivos" description="Tu pulso en tiempo real ayuda a detectar señales antes de que tú las sientas." />

      <WatchPanel monitor={monitor} />

      <div className="grid grid-flow-dense gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Dispositivos vinculados" icon={<Watch className="size-5" />} />
          {devices.loading ? (
            <Skeleton className="h-24" />
          ) : devices.error ? (
            <ErrorState compact error={devices.error} onRetry={devices.reload} />
          ) : (devices.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted">Cuando conectes un dispositivo por primera vez, aparecerá aquí.</p>
          ) : (
            <ul className="divide-y divide-line">
              {devices.data?.map((d) => (
                <li key={d.id} className="flex items-center gap-3 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{d.deviceName}</p>
                    <p className="text-sm text-muted">
                      {providerLabel[d.provider]}
                      {d.lastSeenAt ? ` · visto ${relativeTime(d.lastSeenAt)}` : ''}
                    </p>
                  </div>
                  <Badge tone={d.active ? 'ok' : 'neutral'}>{d.active ? 'Activo' : 'Inactivo'}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => removeDevice(d.id, d.deviceName)} aria-label={`Quitar ${d.deviceName}`}>
                    <Trash2 className="size-4 text-coral" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Alertas del reloj" subtitle="Detectadas por las reglas en streaming" icon={<BellRing className="size-5" />} />
          {alerts.loading ? (
            <Skeleton className="h-24" />
          ) : alerts.error ? (
            <ErrorState compact error={alerts.error} onRetry={alerts.reload} />
          ) : (alerts.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted">Sin alertas. Si tu reloj detecta taquicardia sostenida o movimiento convulsivo, la verás aquí.</p>
          ) : (
            <ul className="space-y-3">
              {alerts.data?.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 rounded-2xl bg-coral-soft p-4">
                  <div>
                    <p className="font-semibold">{alertLabel[a.kind]}</p>
                    <p className="text-sm text-muted">
                      {relativeTime(a.detectedAt)} &middot; confianza {Math.round(a.confidence * 100)}%
                    </p>
                  </div>
                  {!a.convertedEventId && (
                    <Button size="sm" variant="danger" onClick={() => escalate(a.id)}>
                      Escalar
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <CloudProviders />
    </div>
  )
}
