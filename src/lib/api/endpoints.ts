import { API_URL, asList, request } from './client'
import { tokenStore } from './tokenStore'
import type {
  Adherence,
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
  Medication,
  MedicationInput,
  RiskHistoryPoint,
  RiskToday,
  ScheduleItem,
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
  me: () => request<User>('/auth/me'),
  /** Password recovery is not in the contract yet: the call is best effort and always resolves. */
  forgot: (email: string) => request<void>('/auth/forgot', { method: 'POST', body: { email }, auth: false }),
}

export const contactsApi = {
  list: async () => asList<EmergencyContact>(await request<unknown>('/contacts')),
  create: (input: EmergencyContactInput) => request<EmergencyContact>('/contacts', { method: 'POST', body: input }),
  update: (id: string, input: EmergencyContactInput) =>
    request<EmergencyContact>(`/contacts/${id}`, { method: 'PUT', body: input }),
  remove: (id: string) => request<void>(`/contacts/${id}`, { method: 'DELETE' }),
}

export const medicationsApi = {
  list: async () => asList<Medication>(await request<unknown>('/medications')),
  create: (input: MedicationInput) => request<Medication>('/medications', { method: 'POST', body: input }),
  update: (id: string, input: MedicationInput) => request<Medication>(`/medications/${id}`, { method: 'PUT', body: input }),
  remove: (id: string) => request<void>(`/medications/${id}`, { method: 'DELETE' }),
  search: async (q: string) => asList<string | { name: string }>(await request<unknown>('/medications/search', { query: { q } })),
  scheduleToday: async () => asList<ScheduleItem>(await request<unknown>('/medications/schedule/today')),
  log: (medicationId: string, scheduledFor: string, status: DoseStatus) =>
    request<void>('/medications/logs', { method: 'POST', body: { medicationId, scheduledFor, status } }),
  adherence: (days = 30) => request<Adherence>('/medications/adherence', { query: { days } }),
}

export const dailyLogsApi = {
  list: async (from?: string, to?: string) => asList<DailyLog>(await request<unknown>('/daily-logs', { query: { from, to } })),
  get: (date: string) => request<DailyLog>(`/daily-logs/${date}`),
  upsert: (date: string, input: DailyLogInput) => request<DailyLog>(`/daily-logs/${date}`, { method: 'PUT', body: input }),
}

export const seizuresApi = {
  list: async (params: { from?: string; to?: string; page?: number; limit?: number } = {}) =>
    asList<Seizure>(await request<unknown>('/seizures', { query: params })),
  get: (id: string) => request<Seizure>(`/seizures/${id}`),
  create: (input: SeizureInput) => request<Seizure>('/seizures', { method: 'POST', body: input }),
  update: (id: string, input: Partial<SeizureInput>) => request<Seizure>(`/seizures/${id}`, { method: 'PUT', body: input }),
  remove: (id: string) => request<void>(`/seizures/${id}`, { method: 'DELETE' }),
  stats: () => request<SeizureStats>('/seizures/stats'),
}

export const emergencyApi = {
  trigger: (input: EmergencyInput) => request<EmergencyEvent>('/emergency', { method: 'POST', body: input }),
  resolve: (id: string) => request<EmergencyEvent>(`/emergency/${id}/resolve`, { method: 'POST' }),
  falseAlarm: (id: string) => request<EmergencyEvent>(`/emergency/${id}/false-alarm`, { method: 'POST' }),
  active: async () => asList<EmergencyEvent>(await request<unknown>('/emergency/active')),
}

export const reportsApi = {
  medical: (from: string, to: string) => request<MedicalReport>('/reports/medical', { query: { from, to, format: 'json' } }),
}

export const aiApi = {
  insights: async () => asList<Insight>(await request<unknown>('/ai/insights')),
  refreshInsights: async () => asList<Insight>(await request<unknown>('/ai/insights/refresh', { method: 'POST' })),
  riskToday: () => request<RiskToday>('/ai/risk/today'),
  riskHistory: async (days = 30) => asList<RiskHistoryPoint>(await request<unknown>('/ai/risk/history', { query: { days } })),
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
  summary: () => request<DashboardSummary>('/dashboard/summary'),
}

/** Opens the authenticated SSE stream. Returns a disposer. */
export function openStream(onEvent: (e: StreamEvent) => void, onStatus?: (open: boolean) => void): () => void {
  const token = tokenStore.get()?.accessToken
  if (!token || typeof EventSource === 'undefined') return () => undefined
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
