import type {
  Adherence,
  DashboardSummary,
  EmergencyEvent,
  Insight,
  MedicalReport,
  Medication,
  RiskHistoryPoint,
  RiskToday,
  ScheduleItem,
} from './types'

/**
 * El backend responde con sobres ({ user }, { medications }, { doses }...) y algunos campos con otra forma
 * que los tipos del front. Estos adaptadores son tolerantes: aceptan tanto el sobre real como la forma plana
 * (usada por los mocks) y entregan siempre el tipo del front.
 */

type Rec = Record<string, unknown>
const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Saca `payload[key]` si existe; si no, devuelve el payload tal cual. */
export function unwrap<T>(payload: unknown, key: string): T {
  if (isRec(payload) && key in payload) return payload[key] as T
  return payload as T
}

export const str = (v: unknown, fallback = ''): string => (v === null || v === undefined ? fallback : String(v))

export function toMedication(raw: unknown): Medication {
  const m = (raw ?? {}) as Rec
  return {
    id: str(m.id),
    name: str(m.name),
    dose: str(m.dose),
    unit: str(m.unit),
    scheduleTimes: Array.isArray(m.scheduleTimes) ? (m.scheduleTimes as string[]) : [],
    active: m.active !== false,
    notes: (m.notes as string | null | undefined) ?? null,
  }
}

export function toScheduleItem(raw: unknown): ScheduleItem {
  const d = (raw ?? {}) as Rec
  return {
    medicationId: str(d.medicationId),
    name: str(d.name),
    dose: str(d.dose),
    unit: str(d.unit),
    scheduledFor: str(d.scheduledFor),
    status: (d.status as ScheduleItem['status']) ?? 'pending',
    takenAt: (d.takenAt as string | null | undefined) ?? null,
  }
}

/** Adherencia sin NaN: si no hay dosis programadas, el total es 0 y la tasa 0. */
export function toAdherence(raw: unknown, days = 30): Adherence {
  const a = (raw ?? {}) as Rec
  const total = Number(a.total ?? 0) || 0
  const taken = Number(a.taken ?? 0) || 0
  const rate = Number.isFinite(Number(a.rate)) && a.rate !== undefined ? Number(a.rate) : total > 0 ? taken / total : 0
  return { rate, taken, total, days: Number(a.days ?? days) || days, byDay: Array.isArray(a.byDay) ? (a.byDay as Adherence['byDay']) : undefined }
}

export function toRiskToday(raw: unknown): RiskToday {
  const r = (raw ?? {}) as Rec
  const a = (isRec(r.assessment) ? r.assessment : r) as Rec
  return {
    score: Number(a.score ?? 0),
    level: (a.level as RiskToday['level']) ?? 'low',
    factors: Array.isArray(a.factors) ? (a.factors as RiskToday['factors']) : [],
    modelVersion: (a.modelVersion as string | undefined) ?? undefined,
    confidence: (r.confidence as number | undefined) ?? (a.confidence as number | undefined),
    degraded: (r.degraded as boolean | undefined) ?? (a.degraded as boolean | undefined),
    assessedOn: a.assessedOn as string | undefined,
  }
}

export function toRiskHistory(items: unknown[]): RiskHistoryPoint[] {
  return items.map((i) => {
    const p = i as Rec
    return { assessedOn: str(p.assessedOn), score: Number(p.score ?? 0), level: (p.level as RiskHistoryPoint['level']) ?? 'low' }
  })
}

/** Normaliza `kind` (p. ej. "sleep_pattern" pasa a "sleep") y la evidencia estadística. */
export function toInsight(raw: unknown): Insight {
  const i = (raw ?? {}) as Rec
  const ev = (isRec(i.evidence) ? i.evidence : {}) as Rec
  const wilson = Array.isArray(ev.wilson95) ? (ev.wilson95 as number[]) : null
  const evidence: Insight['evidence'] = {
    ...ev,
    n: (ev.n as number | undefined) ?? undefined,
    total: (ev.total as number | undefined) ?? (ev.totalSeizures as number | undefined),
    ciLow: (ev.ciLow as number | undefined) ?? wilson?.[0],
    ciHigh: (ev.ciHigh as number | undefined) ?? wilson?.[1],
  }
  return {
    id: str(i.id),
    kind: str(i.kind).replace(/_pattern$/, ''),
    title: str(i.title),
    body: str(i.body),
    evidence,
    confidence: i.confidence as number | undefined,
    createdAt: str(i.createdAt),
  }
}

export function toEmergencyEvent(raw: unknown): EmergencyEvent {
  const r = (raw ?? {}) as Rec
  const ev = (isRec(r.event) ? r.event : r) as Rec
  const records = Array.isArray(r.notifications) ? r.notifications : Array.isArray(ev.notifications) ? ev.notifications : []
  return {
    id: str(ev.id),
    seizureId: (ev.seizureId as string | null | undefined) ?? null,
    triggeredAt: str(ev.triggeredAt),
    status: (ev.status as EmergencyEvent['status']) ?? 'active',
    latitude: (ev.latitude as number | null | undefined) ?? null,
    longitude: (ev.longitude as number | null | undefined) ?? null,
    notifications: records.map((n) => {
      const x = n as Rec
      const payload = (isRec(x.payload) ? x.payload : {}) as Rec
      return {
        id: str(x.id),
        contactName: str(x.contactName ?? payload.contactName ?? payload.name, 'Contacto'),
        channel: (x.channel as 'email' | 'sms' | 'push' | 'log') ?? 'log',
        status: (x.status as 'queued' | 'sent' | 'failed') ?? 'queued',
      }
    }),
  }
}

/** Resumen del dashboard real -> forma del front (rellena taken/total con la adherencia a 30 días). */
export function toDashboardSummary(raw: unknown, adherence: Adherence | null): DashboardSummary {
  const s = (raw ?? {}) as Rec
  const alerts = s.activeAlerts
  const items = Array.isArray(alerts) ? alerts : isRec(alerts) && Array.isArray(alerts.items) ? alerts.items : []
  const a = isRec(s.adherence) ? s.adherence : null
  const merged: Adherence | null = a || adherence ? toAdherence({ ...(adherence ?? {}), ...(a ?? {}), taken: adherence?.taken ?? a?.taken, total: adherence?.total ?? a?.total }, 30) : null
  return {
    risk: s.risk ? toRiskToday(s.risk) : null,
    adherence: merged,
    lastSeizure: (s.lastSeizure as DashboardSummary['lastSeizure']) ?? null,
    seizureFreeDays: Number(s.seizureFreeDays ?? s.seizureFreeStreakDays ?? 0),
    currentHeartRate: (s.currentHeartRate as number | null | undefined) ?? null,
    activeAlerts: items as DashboardSummary['activeAlerts'],
  }
}

/** Informe real -> forma del front. */
export function toMedicalReport(raw: unknown, adherence: Adherence | null): MedicalReport {
  const r = unwrap<Rec>(raw, 'report')
  const patient = (isRec(r.patient) ? r.patient : {}) as Rec
  const period = (isRec(r.period) ? r.period : isRec(r.range) ? r.range : {}) as Rec
  const sz = r.seizures
  const items = Array.isArray(sz) ? sz : isRec(sz) && Array.isArray(sz.items) ? sz.items : []
  return {
    patient: { fullName: str(patient.fullName, 'Paciente'), birthDate: (patient.birthDate as string | null | undefined) ?? null },
    range: { from: str(period.from), to: str(period.to) },
    generatedAt: str(r.generatedAt, new Date().toISOString()),
    seizures: items.map((x, idx) => {
      const s = x as Rec
      return {
        id: str(s.id, `r${idx}`),
        startedAt: str(s.startedAt),
        durationSeconds: (s.durationSeconds as number | null | undefined) ?? null,
        severity: (s.severity as number | null | undefined) ?? null,
        seizureType: (s.seizureType as string | null | undefined) ?? null,
        triggersNoted: (s.triggersNoted as string[] | undefined) ?? (s.triggers as string[] | undefined) ?? [],
        location: (s.location as string | null | undefined) ?? null,
        notes: (s.notes as string | null | undefined) ?? null,
        source: (s.source as 'manual' | 'emergency' | 'wearable' | undefined) ?? 'manual',
      }
    }),
    medications: (Array.isArray(r.medications) ? r.medications : []).map((m, idx) => ({ ...toMedication(m), id: str((m as Rec).id, `m${idx}`) })),
    adherence,
    insights: Array.isArray(r.insights) ? (r.insights as unknown[]).map(toInsight) : [],
    stats: null,
  }
}
