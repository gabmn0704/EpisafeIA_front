import { http, HttpResponse, delay } from 'msw'
import { API_URL } from '@/lib/api/client'
import type {
  DailyLogInput,
  DoseStatus,
  EmergencyContact,
  EmergencyEvent,
  Medication,
  ScheduleItem,
  Seizure,
  WearableDevice,
} from '@/lib/api/types'
import { addDays, toISODate, todayISO } from '@/lib/format'
import {
  DEMO_PASSWORD,
  buildDailyLogs,
  buildRiskHistory,
  buildSeizures,
  contacts as seedContacts,
  demoUser,
  insights,
  medicationCatalog,
  medications as seedMeds,
  riskToday,
} from './data'

const url = (p: string) => `${API_URL}${p}`
const err = (status: number, code: string, message: string) => HttpResponse.json({ error: { code, message } }, { status })

/** Fresh in-memory state per call, so tests can reset between cases. */
export function createHandlers() {
  // Una cuenta recién registrada (marca en sessionStorage) empieza sin medicamentos ni contactos.
  const fresh = (() => {
    try {
      return globalThis.sessionStorage?.getItem('episafe.mock.fresh') === '1'
    } catch {
      return false
    }
  })()
  const setFresh = (v: boolean) => {
    try {
      if (v) globalThis.sessionStorage?.setItem('episafe.mock.fresh', '1')
      else globalThis.sessionStorage?.removeItem('episafe.mock.fresh')
    } catch {
      /* sin sessionStorage */
    }
  }
  const dailyLogs = buildDailyLogs()
  const seizures = fresh ? [] : buildSeizures(dailyLogs)
  const meds: Medication[] = fresh ? [] : structuredClone(seedMeds)
  const contacts: EmergencyContact[] = fresh ? [] : structuredClone(seedContacts)
  const doseStatus = new Map<string, DoseStatus>()
  const devices: WearableDevice[] = []
  const emergencies: EmergencyEvent[] = []
  let counter = 100
  const nid = (p: string) => `${p}-${++counter}`

  const authed = (req: Request) => req.headers.get('Authorization')?.startsWith('Bearer ')
  const unauthorized = () => err(401, 'UNAUTHORIZED', 'Sesión no válida')

  /** Adherencia derivada de los medicamentos activos: sin medicamentos no hay porcentaje que mostrar. */
  const adherenceFor = (days: number) => {
    const perDay = meds.filter((m) => m.active).reduce((n, m) => n + m.scheduleTimes.length, 0)
    const total = days * perDay
    const taken = Math.round(total * 0.94)
    return { rate: total > 0 ? taken / total : 0, taken, total, days }
  }

  const schedule = (): ScheduleItem[] => {
    const day = todayISO()
    const items: ScheduleItem[] = []
    for (const m of meds.filter((x) => x.active)) {
      for (const t of m.scheduleTimes) {
        const scheduledFor = new Date(`${day}T${t}:00`).toISOString()
        const key = `${m.id}|${scheduledFor}`
        const stored = doseStatus.get(key)
        const late = new Date(scheduledFor).getTime() < Date.now() - 60 * 60_000
        items.push({
          medicationId: m.id,
          name: m.name,
          dose: m.dose,
          unit: m.unit,
          scheduledFor,
          status: stored ?? (late ? 'pending' : 'pending'),
        })
      }
    }
    return items.sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))
  }

  const freeDays = () => {
    const last = seizures[0]
    if (!last) return 90
    return Math.floor((Date.now() - new Date(last.startedAt).getTime()) / 86_400_000)
  }

  return [
    http.get(url('/health'), () => HttpResponse.json({ status: 'ok' })),

    http.post(url('/auth/login'), async ({ request }) => {
      await delay(350)
      const body = (await request.json()) as { email?: string; password?: string }
      if (body.email?.toLowerCase() !== demoUser.email || body.password !== DEMO_PASSWORD) {
        return err(401, 'INVALID_CREDENTIALS', 'Correo o contraseña incorrectos.')
      }
      setFresh(false)
      if (seizures.length === 0) seizures.push(...buildSeizures(dailyLogs))
      meds.splice(0, meds.length, ...structuredClone(seedMeds))
      contacts.splice(0, contacts.length, ...structuredClone(seedContacts))
      return HttpResponse.json({ user: demoUser, accessToken: 'mock-access', refreshToken: 'mock-refresh' })
    }),
    http.post(url('/auth/register'), async ({ request }) => {
      await delay(450)
      const body = (await request.json()) as { email: string; fullName: string }
      if (body.email.toLowerCase() === demoUser.email) return err(409, 'EMAIL_TAKEN', 'Ya existe una cuenta con ese correo.')
      // Una cuenta nueva empieza sin medicamentos ni contactos: cada persona configura los suyos.
      meds.splice(0, meds.length)
      contacts.splice(0, contacts.length)
      seizures.splice(0, seizures.length)
      setFresh(true)
      return HttpResponse.json({ user: { ...demoUser, email: body.email, fullName: body.fullName }, accessToken: 'mock-access', refreshToken: 'mock-refresh' }, { status: 201 })
    }),
    http.post(url('/auth/refresh'), () => HttpResponse.json({ accessToken: 'mock-access', refreshToken: 'mock-refresh' })),
    http.post(url('/auth/logout'), () => new HttpResponse(null, { status: 204 })),
    http.post(url('/auth/forgot'), async () => {
      await delay(400)
      return new HttpResponse(null, { status: 204 })
    }),
    http.get(url('/auth/me'), ({ request }) => (authed(request) ? HttpResponse.json(demoUser) : unauthorized())),

    http.get(url('/dashboard/summary'), async () => {
      await delay(300)
      const rows = schedule()
      const taken = rows.filter((r) => r.status === 'taken').length
      return HttpResponse.json({
        risk: fresh ? null : riskToday,
        adherence: adherenceFor(30),
        lastSeizure: seizures[0] ?? null,
        seizureFreeDays: freeDays(),
        currentHeartRate: null,
        activeAlerts: [],
        todayDoses: { taken, total: rows.length },
      })
    }),

    http.get(url('/ai/risk/today'), () => (fresh ? err(404, 'NOT_FOUND', 'Sin riesgo calculado') : HttpResponse.json(riskToday))),
    http.get(url('/ai/risk/history'), ({ request }) => {
      const days = Number(new URL(request.url).searchParams.get('days') ?? 30)
      return HttpResponse.json(fresh ? [] : buildRiskHistory(days, dailyLogs))
    }),
    http.get(url('/ai/insights'), async () => {
      await delay(300)
      return HttpResponse.json(fresh ? [] : insights)
    }),
    http.post(url('/ai/insights/refresh'), async () => {
      await delay(900)
      return HttpResponse.json(insights)
    }),

    http.get(url('/daily-logs'), ({ request }) => {
      const q = new URL(request.url).searchParams
      const from = q.get('from') ?? '0000'
      const to = q.get('to') ?? '9999'
      return HttpResponse.json(dailyLogs.filter((l) => l.logDate >= from && l.logDate <= to))
    }),
    http.get(url('/daily-logs/:date'), ({ params }) => {
      const found = dailyLogs.find((l) => l.logDate === params.date)
      return found ? HttpResponse.json(found) : err(404, 'NOT_FOUND', 'Sin registro para ese día')
    }),
    http.put(url('/daily-logs/:date'), async ({ params, request }) => {
      await delay(250)
      const body = (await request.json()) as DailyLogInput
      const date = String(params.date)
      const i = dailyLogs.findIndex((l) => l.logDate === date)
      const next = { id: nid('dl'), ...body, logDate: date }
      if (i >= 0) dailyLogs[i] = { ...dailyLogs[i], ...next }
      else dailyLogs.push(next)
      return HttpResponse.json(next)
    }),

    http.get(url('/medications/search'), ({ request }) => {
      const q = (new URL(request.url).searchParams.get('q') ?? '').toLowerCase()
      return HttpResponse.json(medicationCatalog.filter((n) => n.toLowerCase().startsWith(q)).slice(0, 8))
    }),
    http.get(url('/medications/schedule/today'), () => HttpResponse.json(schedule())),
    http.get(url('/medications/adherence'), ({ request }) => {
      const days = Number(new URL(request.url).searchParams.get('days') ?? 30)
      const byDay = meds.length === 0 ? [] : Array.from({ length: days }, (_, i) => ({
        date: toISODate(addDays(new Date(), -(days - 1 - i))),
        rate: i % 9 === 4 ? 0.5 : 1,
      }))
      return HttpResponse.json({ ...adherenceFor(days), byDay })
    }),
    http.post(url('/medications/logs'), async ({ request }) => {
      const b = (await request.json()) as { medicationId: string; scheduledFor: string; status: DoseStatus }
      doseStatus.set(`${b.medicationId}|${b.scheduledFor}`, b.status)
      return new HttpResponse(null, { status: 204 })
    }),
    http.get(url('/medications'), () => HttpResponse.json(meds)),
    http.post(url('/medications'), async ({ request }) => {
      const b = (await request.json()) as Omit<Medication, 'id'>
      const m = { ...b, id: nid('m') }
      meds.push(m)
      return HttpResponse.json(m, { status: 201 })
    }),
    http.put(url('/medications/:id'), async ({ params, request }) => {
      const b = (await request.json()) as Omit<Medication, 'id'>
      const i = meds.findIndex((m) => m.id === params.id)
      if (i < 0) return err(404, 'NOT_FOUND', 'Medicamento no encontrado')
      meds[i] = { ...b, id: String(params.id) }
      return HttpResponse.json(meds[i])
    }),
    http.delete(url('/medications/:id'), ({ params }) => {
      const i = meds.findIndex((m) => m.id === params.id)
      if (i >= 0) meds.splice(i, 1)
      return new HttpResponse(null, { status: 204 })
    }),

    http.get(url('/seizures/stats'), () =>
      HttpResponse.json({
        total: seizures.length,
        last30Days: seizures.filter((s) => Date.now() - new Date(s.startedAt).getTime() < 30 * 86_400_000).length,
        avgDurationSeconds: Math.round(seizures.reduce((a, s) => a + (s.durationSeconds ?? 0), 0) / Math.max(1, seizures.length)),
      }),
    ),
    http.get(url('/seizures'), () => HttpResponse.json(seizures)),
    http.get(url('/seizures/:id'), ({ params }) => {
      const s = seizures.find((x) => x.id === params.id)
      return s ? HttpResponse.json(s) : err(404, 'NOT_FOUND', 'Crisis no encontrada')
    }),
    http.post(url('/seizures'), async ({ request }) => {
      const b = (await request.json()) as Omit<Seizure, 'id'>
      const s: Seizure = { ...b, id: nid('sz') }
      seizures.unshift(s)
      seizures.sort((a, c) => c.startedAt.localeCompare(a.startedAt))
      return HttpResponse.json(s, { status: 201 })
    }),
    http.delete(url('/seizures/:id'), ({ params }) => {
      const i = seizures.findIndex((s) => s.id === params.id)
      if (i >= 0) seizures.splice(i, 1)
      return new HttpResponse(null, { status: 204 })
    }),

    http.get(url('/contacts'), () => HttpResponse.json([...contacts].sort((a, b) => a.priority - b.priority))),
    http.post(url('/contacts'), async ({ request }) => {
      const b = (await request.json()) as Omit<EmergencyContact, 'id'>
      const c = { ...b, id: nid('c') }
      contacts.push(c)
      return HttpResponse.json(c, { status: 201 })
    }),
    http.put(url('/contacts/:id'), async ({ params, request }) => {
      const b = (await request.json()) as Omit<EmergencyContact, 'id'>
      const i = contacts.findIndex((c) => c.id === params.id)
      if (i < 0) return err(404, 'NOT_FOUND', 'Contacto no encontrado')
      contacts[i] = { ...b, id: String(params.id) }
      return HttpResponse.json(contacts[i])
    }),
    http.delete(url('/contacts/:id'), ({ params }) => {
      const i = contacts.findIndex((c) => c.id === params.id)
      if (i >= 0) contacts.splice(i, 1)
      return new HttpResponse(null, { status: 204 })
    }),

    http.post(url('/emergency'), async ({ request }) => {
      await delay(600)
      const b = (await request.json()) as { latitude?: number; longitude?: number }
      const ev: EmergencyEvent = {
        id: nid('em'),
        triggeredAt: new Date().toISOString(),
        status: 'notified',
        latitude: b.latitude ?? null,
        longitude: b.longitude ?? null,
        notifications: [...contacts]
          .sort((a, c) => a.priority - c.priority)
          .map((c, i) => ({
            id: nid('n'),
            contactName: c.name,
            channel: c.notifySms ? 'sms' : 'email',
            status: i === 0 ? 'sent' : 'queued',
          })),
      }
      emergencies.unshift(ev)
      return HttpResponse.json(ev, { status: 201 })
    }),
    http.post(url('/emergency/:id/resolve'), ({ params }) => {
      const ev = emergencies.find((e) => e.id === params.id)
      if (ev) ev.status = 'resolved'
      return HttpResponse.json(ev ?? {})
    }),
    http.post(url('/emergency/:id/false-alarm'), ({ params }) => {
      const ev = emergencies.find((e) => e.id === params.id)
      if (ev) ev.status = 'false_alarm'
      return HttpResponse.json(ev ?? {})
    }),
    http.get(url('/emergency/active'), () => HttpResponse.json(emergencies.filter((e) => e.status === 'active' || e.status === 'notified'))),

    http.get(url('/reports/medical'), ({ request }) => {
      const q = new URL(request.url).searchParams
      const from = q.get('from') ?? '0000'
      const to = q.get('to') ?? '9999'
      return HttpResponse.json({
        patient: { fullName: demoUser.fullName, birthDate: demoUser.birthDate },
        range: { from, to },
        generatedAt: new Date().toISOString(),
        seizures: seizures.filter((s) => s.startedAt.slice(0, 10) >= from && s.startedAt.slice(0, 10) <= to),
        medications: meds,
        adherence: adherenceFor(30),
        insights,
        stats: null,
      })
    }),

    http.get(url('/wearables/devices'), () => HttpResponse.json(devices)),
    http.post(url('/wearables/devices'), async ({ request }) => {
      const b = (await request.json()) as { provider: WearableDevice['provider']; deviceName: string; externalId?: string }
      const d: WearableDevice = { id: nid('d'), active: true, lastSeenAt: null, ...b }
      devices.push(d)
      return HttpResponse.json(d, { status: 201 })
    }),
    http.delete(url('/wearables/devices/:id'), ({ params }) => {
      const i = devices.findIndex((d) => d.id === params.id)
      if (i >= 0) devices.splice(i, 1)
      return new HttpResponse(null, { status: 204 })
    }),
    http.post(url('/wearables/samples'), async ({ request }) => {
      const b = (await request.json()) as { samples: unknown[] }
      return HttpResponse.json({ accepted: b.samples.length })
    }),
    http.get(url('/wearables/live'), () => HttpResponse.json([])),
    http.get(url('/wearables/summary'), () => HttpResponse.json({ hours: 24, avgHeartRate: null, minHeartRate: null, maxHeartRate: null, samples: 0 })),
    http.get(url('/wearables/alerts'), () => HttpResponse.json([])),
  ]
}
