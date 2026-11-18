import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BellRing, CheckCircle2, Loader2, MapPin, MapPinOff, Send, ShieldAlert, Siren, Users } from 'lucide-react'
import clsx from 'clsx'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { useEmergencyFlow } from '@/hooks/useEmergencyFlow'
import { useGeolocationPermission, useNotificationPermission, type PermissionUi } from '@/hooks/usePermissions'
import { useQuery } from '@/hooks/useQuery'
import { contactsApi } from '@/lib/api/endpoints'
import { formatDateTime } from '@/lib/format'

const permLabel: Record<PermissionUi, { text: string; tone: 'ok' | 'coral' | 'amber' | 'neutral' }> = {
  granted: { text: 'Activado', tone: 'ok' },
  denied: { text: 'Bloqueado', tone: 'coral' },
  prompt: { text: 'Pendiente', tone: 'amber' },
  unsupported: { text: 'No disponible', tone: 'neutral' },
}

const channelLabel = { sms: 'SMS', email: 'Correo', push: 'Notificación', log: 'Registro' } as const
const statusLabel = { queued: 'En cola', sent: 'Enviado', failed: 'Falló' } as const

export default function EmergencyPage() {
  const flow = useEmergencyFlow(5)
  const geo = useGeolocationPermission()
  const notif = useNotificationPermission()
  const contacts = useQuery(() => contactsApi.list())
  const noContacts = !contacts.loading && !contacts.error && (contacts.data?.length ?? 0) === 0
  const busy = flow.phase === 'locating' || flow.phase === 'sending'

  return (
    <div>
      <PageHeader title="Emergencia" description="Un toque avisa a tus contactos con tu hora y tu ubicación. Tienes 5 segundos para cancelar si fue un error." />

      <div className="grid grid-flow-dense gap-5 lg:grid-cols-12">
        <div className="relative overflow-hidden rounded-[2rem] shadow-elev-3 bg-[radial-gradient(80%_80%_at_50%_0%,#ff5c78_0%,#d0003c_60%,#7a0024_100%)] p-5 text-white sm:p-8 lg:col-span-8 lg:p-12" aria-live="assertive">
          <AnimatePresence mode="wait">
            {flow.phase === 'idle' || flow.phase === 'error' ? (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-6 text-center">
                <div className="relative">
                  <span className="absolute inset-0 animate-[pulse-ring_2.2s_ease-out_infinite] rounded-full bg-white/50" aria-hidden />
                  <span className="absolute inset-0 animate-[pulse-ring_2.2s_ease-out_0.9s_infinite] rounded-full bg-white/40" aria-hidden />
                  <button
                    type="button"
                    onClick={flow.start}
                    aria-label="Activar emergencia. Se enviará una alerta en 5 segundos."
                    className="relative grid size-52 place-items-center rounded-full border-8 border-white/40 bg-white text-[#d0003c] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] transition active:scale-95 sm:size-64"
                  >
                    <span className="flex flex-col items-center gap-2">
                      <Siren className="size-16 sm:size-20" aria-hidden />
                      <span className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">AYUDA</span>
                    </span>
                  </button>
                </div>
                <p className="mt-20 max-w-md text-lg text-white/90">Presiónalo si estás por tener una crisis o necesitas ayuda ahora.</p>
                {flow.phase === 'error' && (
                  <div role="alert" className="mt-6 w-full max-w-md rounded-2xl bg-black/30 p-4 text-sm">
                    <p className="font-semibold">No pudimos enviar la alerta: {flow.error}</p>
                    <p className="mt-1 text-white/80">Si es grave, llama de inmediato a tu línea local de emergencias.</p>
                    <Button className="mt-3" variant="lime" onClick={flow.triggerNow}>
                      Reintentar ahora
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : flow.phase === 'countdown' ? (
              <motion.div key="count" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-6 text-center">
                <p className="text-lg font-semibold">Enviando alerta en</p>
                <div className="relative my-6 grid size-56 place-items-center">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
                    <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="6" />
                    <motion.circle cx="50" cy="50" r="46" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeDasharray={289} initial={{ strokeDashoffset: 0 }} animate={{ strokeDashoffset: 289 }} transition={{ duration: 5, ease: 'linear' }} />
                  </svg>
                  <span className="font-display text-9xl font-extrabold tabular-nums" role="timer" aria-label={`${flow.secondsLeft} segundos`}>
                    {flow.secondsLeft}
                  </span>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button size="lg" variant="dark" onClick={flow.cancel} className="!bg-white !text-[#7a0024]">
                    Cancelar, fue un error
                  </Button>
                  <Button size="lg" variant="ghost" onClick={flow.triggerNow} className="!text-white hover:!bg-white/15">
                    Enviar ahora
                  </Button>
                </div>
              </motion.div>
            ) : busy ? (
              <motion.div key="busy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-16 text-center" role="status">
                <Loader2 className="size-16 animate-spin" aria-hidden />
                <p className="mt-6 font-display text-3xl font-bold">{flow.phase === 'locating' ? 'Obteniendo tu ubicación' : 'Avisando a tus contactos'}</p>
                <p className="mt-2 text-white/80">No cierres esta pantalla.</p>
              </motion.div>
            ) : (
              <motion.div key="active" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-2">
                <div className="flex items-center gap-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-full bg-white text-ok">
                    <CheckCircle2 className="size-9" aria-hidden />
                  </span>
                  <div>
                    <h2 className="font-display text-3xl font-bold">Alerta enviada</h2>
                    <p className="text-white/85">{flow.event ? formatDateTime(flow.event.triggeredAt) : ''}</p>
                  </div>
                </div>
                <ul className="mt-8 space-y-3" aria-label="Estado de notificaciones">
                  {(flow.event?.notifications ?? []).map((n) => (
                    <li key={n.id} className="flex items-center justify-between gap-3 rounded-2xl bg-black/25 px-5 py-4">
                      <span className="flex items-center gap-3 font-semibold">
                        <Send className="size-4" aria-hidden /> {n.contactName}
                      </span>
                      <span className="text-sm text-white/85">
                        {channelLabel[n.channel]} &middot; {statusLabel[n.status]}
                      </span>
                    </li>
                  ))}
                  {(flow.event?.notifications?.length ?? 0) === 0 && <li className="rounded-2xl bg-black/25 px-5 py-4 text-sm">No hay contactos configurados: la alerta quedó registrada pero nadie fue notificado.</li>}
                </ul>
                <p className="mt-5 flex items-center gap-2 text-sm text-white/85">
                  {flow.location === 'granted' ? <MapPin className="size-4" aria-hidden /> : <MapPinOff className="size-4" aria-hidden />}
                  {flow.location === 'granted' ? 'Tu ubicación fue compartida.' : 'Se envió sin ubicación (permiso no disponible).'}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button variant="lime" size="lg" onClick={flow.resolve}>
                    Ya estoy bien
                  </Button>
                  <Button variant="ghost" size="lg" onClick={flow.falseAlarm} className="!text-white hover:!bg-white/15">
                    Fue una falsa alarma
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-5 lg:col-span-4">
          <Card>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <ShieldAlert className="size-5 text-coral" aria-hidden /> Listo para actuar
            </h2>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 font-medium">
                  <MapPin className="size-4 text-muted" aria-hidden /> Ubicación
                </span>
                <Badge tone={permLabel[geo].tone}>{permLabel[geo].text}</Badge>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 font-medium">
                  <BellRing className="size-4 text-muted" aria-hidden /> Notificaciones del navegador
                </span>
                {notif.state === 'prompt' ? (
                  <Button size="sm" variant="outline" onClick={notif.request}>
                    Activar
                  </Button>
                ) : (
                  <Badge tone={permLabel[notif.state].tone}>{permLabel[notif.state].text}</Badge>
                )}
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 font-medium">
                  <Users className="size-4 text-muted" aria-hidden /> Contactos
                </span>
                <Badge tone={noContacts ? 'coral' : 'ok'}>{contacts.loading ? '...' : `${contacts.data?.length ?? 0} configurados`}</Badge>
              </li>
            </ul>
            {noContacts && (
              <Link to="/app/contactos" className="mt-5 block rounded-2xl bg-coral-soft p-4 text-sm font-semibold text-ink hover:underline">
                Aún no tienes contactos. Agrégalos para que la alerta llegue a alguien.
              </Link>
            )}
            {geo === 'denied' && <p className="mt-4 text-sm text-muted">Activa el permiso de ubicación del sitio en tu navegador para que tus contactos sepan dónde estás.</p>}
          </Card>

          <Card className={clsx('!bg-surface-2')}>
            <p className="text-sm text-muted">
              En una emergencia médica grave, llama siempre primero a tu número local de emergencias. EpiSafe IA complementa, no reemplaza, la atención médica.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
