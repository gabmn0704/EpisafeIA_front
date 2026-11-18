import { API_URL, asList, request } from './client'
import { toAdherence, toDashboardSummary, toEmergencyEvent, toInsight, toMedicalReport, toMedication, toRiskHistory, toRiskToday, toScheduleItem, unwrap } from './adapters'
import { tokenStore } from './tokenStore'
import type {
  AuthResponse,
  DailyLog,
  DailyLogInput,
  DashboardSummary,
  EmergencyContact,
  EmergencyContactInput,
  EmergencyEvent,
  EmergencyInput,
  Insight,
  MedicalReport,
  MedicationInput,
  RiskHistoryPoint,
  RiskToday,
  Seizure,
  SeizureInput,
  SeizureStats,
  StreamEvent,
  User,
  WearableAlert,
  WearableDevice,
  WearableProvider,
  WearableSample,
  WearableSampleInput,
  WearableSummary,
  DoseStatus,
} from './types'

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (input: { email: string; password: string; fullName: string; birthDate?: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: input, auth: false }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
  me: async () => unwrap<User>(await request<unknown>('/auth/me'), 'user'),
  /** Password recovery is not in the contract yet: the call is best effort and always resolves. */
  forgot: (email: string) => request<void>('/auth/forgot', { method: 'POST', body: { email }, auth: false }),
}

export const contactsApi = {
  list: async () => asList<EmergencyContact>(await request<unknown>('/contacts')),
  create: async (input: EmergencyContactInput) => unwrap<EmergencyContact>(await request<unknown>('/contacts', { method: 'POST', body: input }), 'contact'),
  update: async (id: string, input: EmergencyContactInput) => unwrap<EmergencyContact>(await request<unknown>(`/contacts/${id}`, { method: 'PUT', body: input }), 'contact'),
  remove: (id: string) => request<void>(`/contacts/${id}`, { method: 'DELETE' }),
}

export const medicationsApi = {
  list: async () => asList<unknown>(await request<unknown>('/medications')).map(toMedication),
  create: async (input: MedicationInput) => toMedication(unwrap(await request<unknown>('/medications', { method: 'POST', body: input }), 'medication')),
  update: async (id: string, input: MedicationInput) => toMedication(unwrap(await request<unknown>(`/medications/${id}`, { method: 'PUT', body: input }), 'medication')),
  remove: (id: string) => request<void>(`/medications/${id}`, { method: 'DELETE' }),
  search: async (q: string) => {
    const payload = await request<unknown>('/medications/search', { query: { q } })
    return asList<string | { name: string }>(unwrap<unknown>(payload, 'results'))
  },
  scheduleToday: async () => asList<unknown>(await request<unknown>('/medications/schedule/today')).map(toScheduleItem),
  log: (medicationId: string, scheduledFor: string, status: DoseStatus) =>
    request<void>('/medications/logs', { method: 'POST', body: { medicationId, scheduledFor, status } }),
  adherence: async (days = 30) => toAdherence(await request<unknown>('/medications/adherence', { query: { days } }), days),
}

export const dailyLogsApi = {
  list: async (from?: string, to?: string) => asList<DailyLog>(await request<unknown>('/daily-logs', { query: { from, to } })),
  get: async (date: string) => unwrap<DailyLog>(await request<unknown>(`/daily-logs/${date}`), 'log'),
  upsert: async (date: string, input: DailyLogInput) => unwrap<DailyLog>(await request<unknown>(`/daily-logs/${date}`, { method: 'PUT', body: input }), 'log'),
}

export const seizuresApi = {
  /** El backend limita a 100 por página: pedimos varias páginas hasta cubrir `limit`. */
  list: async (params: { from?: string; to?: string; page?: number; limit?: number } = {}) => {
    const want = params.limit ?? 20
    const pageSize = Math.min(100, want)
    const out: Seizure[] = []
    for (let page = params.page ?? 1; out.length < want && page < (params.page ?? 1) + 10; page++) {
      const rows = asList<Seizure>(await request<unknown>('/seizures', { query: { ...params, page, limit: pageSize } }))
      out.push(...rows)
      if (rows.length < pageSize) break
    }
    return out.slice(0, want)
  },
  get: async (id: string) => unwrap<Seizure>(await request<unknown>(`/seizures/${id}`), 'seizure'),
  create: async (input: SeizureInput) => unwrap<Seizure>(await request<unknown>('/seizures', { method: 'POST', body: input }), 'seizure'),
  update: async (id: string, input: Partial<SeizureInput>) => unwrap<Seizure>(await request<unknown>(`/seizures/${id}`, { method: 'PUT', body: input }), 'seizure'),
  remove: (id: string) => request<void>(`/seizures/${id}`, { method: 'DELETE' }),
  stats: () => request<SeizureStats>('/seizures/stats'),
}

export const emergencyApi = {
  trigger: async (input: EmergencyInput) => toEmergencyEvent(await request<unknown>('/emergency', { method: 'POST', body: input })),
  resolve: async (id: string) => toEmergencyEvent(await request<unknown>(`/emergency/${id}/resolve`, { method: 'POST' })),
  falseAlarm: async (id: string) => toEmergencyEvent(await request<unknown>(`/emergency/${id}/false-alarm`, { method: 'POST' })),
  active: async () => asList<unknown>(await request<unknown>('/emergency/active')).map(toEmergencyEvent),
}

export const reportsApi = {
  medical: async (from: string, to: string): Promise<MedicalReport> => {
    const days = Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000))
    const [raw, adherence] = await Promise.all([
      request<unknown>('/reports/medical', { query: { from, to, format: 'json' } }),
      request<unknown>('/medications/adherence', { query: { days: Math.min(365, days) } }).then((a) => toAdherence(a, days)).catch(() => null),
    ])
    return toMedicalReport(raw, adherence)
  },
}

export const aiApi = {
  insights: async (): Promise<Insight[]> => asList<unknown>(unwrap<unknown>(await request<unknown>('/ai/insights'), 'insights')).map(toInsight),
  refreshInsights: async (): Promise<Insight[]> => asList<unknown>(unwrap<unknown>(await request<unknown>('/ai/insights/refresh', { method: 'POST' }), 'insights')).map(toInsight),
  riskToday: async (): Promise<RiskToday> => toRiskToday(await request<unknown>('/ai/risk/today')),
  riskHistory: async (days = 30): Promise<RiskHistoryPoint[]> => toRiskHistory(asList<unknown>(unwrap<unknown>(await request<unknown>('/ai/risk/history', { query: { days } }), 'assessments'))),
}

export const wearablesApi = {
  devices: async () => asList<WearableDevice>(await request<unknown>('/wearables/devices')),
  addDevice: (input: { provider: WearableProvider; deviceName: string; externalId?: string }) =>
    request<WearableDevice>('/wearables/devices', { method: 'POST', body: input }),
  removeDevice: (id: string) => request<void>(`/wearables/devices/${id}`, { method: 'DELETE' }),
  sendSamples: (samples: WearableSampleInput[], deviceId?: string) =>
    request<{ accepted: number }>('/wearables/samples', { method: 'POST', body: { deviceId, samples } }),
  live: async (minutes = 10) => asList<WearableSample>(await request<unknown>('/wearables/live', { query: { minutes } })),
  summary: (hours = 24) => request<WearableSummary>('/wearables/summary', { query: { hours } }),
  alerts: async () => asList<WearableAlert>(await request<unknown>('/wearables/alerts')),
  escalate: (id: string) => request<EmergencyEvent>(`/wearables/alerts/${id}/escalate`, { method: 'POST' }),
}

export const dashboardApi = {
  summary: async (): Promise<DashboardSummary> => {
    const [raw, adherence] = await Promise.all([
      request<unknown>('/dashboard/summary'),
      request<unknown>('/medications/adherence', { query: { days: 30 } }).then((a) => toAdherence(a, 30)).catch(() => null),
    ])
    return toDashboardSummary(raw, adherence)
  },
}

/** Opens the authenticated SSE stream. Returns a disposer. */
export function openStream(onEvent: (e: StreamEvent) => void, onStatus?: (open: boolean) => void): () => void {
  const token = tokenStore.get()?.accessToken
  // With dev mocks there is no SSE server: skip instead of hitting a real backend.
  const mocked = import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true'
  if (!token || mocked || typeof EventSource === 'undefined') return () => undefined
  const es = new EventSource(`${API_URL}/stream?token=${encodeURIComponent(token)}`)
  es.onopen = () => onStatus?.(true)
  es.onerror = () => onStatus?.(false)
  for (const type of ['emergency', 'wearable_alert', 'risk_updated'] as const) {
    es.addEventListener(type, (ev) => {
      try {
        onEvent({ type, data: JSON.parse((ev as MessageEvent<string>).data) } as StreamEvent)
      } catch {
        /* ignore malformed frames */
      }
    })
  }
  return () => es.close()
}
