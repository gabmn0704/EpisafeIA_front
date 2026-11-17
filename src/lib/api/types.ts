/** Domain types mirroring the shared API contract (camelCase JSON). */

export type Role = 'patient' | 'caregiver' | 'admin'

export interface User {
  id: string
  email: string
  fullName: string
  birthDate?: string | null
  timezone?: string
  role: Role
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface ApiErrorBody {
  error: { code: string; message: string; details?: unknown[] }
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical'

export interface RiskFactor {
  name: string
  impact: number
  direction: 'up' | 'down' | 'neutral'
  detail: string
}

export interface RiskToday {
  score: number
  level: RiskLevel
  factors: RiskFactor[]
  modelVersion?: string
  confidence?: number
  degraded?: boolean
  assessedOn?: string
}

export interface RiskHistoryPoint {
  assessedOn: string
  score: number
  level: RiskLevel
}

export interface Insight {
  id: string
  kind: string
  title: string
  body: string
  evidence: {
    n?: number
    total?: number
    lift?: number
    ciLow?: number
    ciHigh?: number
    metric?: string
    [key: string]: unknown
  }
  confidence?: number
  createdAt: string
}

export interface DailyLog {
  id?: string
  logDate: string
  sleepHours: number | null
  stressLevel: number | null
  caffeineMg: number | null
  exerciseMinutes: number | null
  mood: number | null
  alcoholUnits?: number | null
  notes?: string | null
}

export type DailyLogInput = Omit<DailyLog, 'id' | 'logDate'>

export interface Medication {
  id: string
  name: string
  dose: string
  unit: string
  scheduleTimes: string[]
  active: boolean
  notes?: string | null
}

export type MedicationInput = Omit<Medication, 'id'>

export type DoseStatus = 'taken' | 'missed' | 'skipped' | 'pending'

export interface ScheduleItem {
  medicationId: string
  name: string
  dose: string
  unit: string
  scheduledFor: string
  status: DoseStatus
  takenAt?: string | null
}

export interface Adherence {
  rate: number
  taken: number
  total: number
  days: number
  byDay?: { date: string; rate: number }[]
}

export type SeizureSource = 'manual' | 'emergency' | 'wearable'

export interface Seizure {
  id: string
  startedAt: string
  durationSeconds: number | null
  severity: number | null
  seizureType?: string | null
  triggersNoted?: string[]
  location?: string | null
  notes?: string | null
  source: SeizureSource
  resolvedAt?: string | null
}

export type SeizureInput = Omit<Seizure, 'id' | 'resolvedAt'>

export interface SeizureStats {
  total: number
  last30Days: number
  avgDurationSeconds: number | null
  byHour?: { hour: number; count: number }[]
  bySeverity?: { severity: number; count: number }[]
}

export interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
  email?: string | null
  priority: number
  notifySms: boolean
  notifyEmail: boolean
}

export type EmergencyContactInput = Omit<EmergencyContact, 'id'>

export type EmergencyStatus = 'active' | 'notified' | 'resolved' | 'false_alarm'

export interface EmergencyNotification {
  id: string
  contactName: string
  channel: 'email' | 'sms' | 'push' | 'log'
  status: 'queued' | 'sent' | 'failed'
}

export interface EmergencyEvent {
  id: string
  seizureId?: string | null
  triggeredAt: string
  status: EmergencyStatus
  latitude?: number | null
  longitude?: number | null
  notifications?: EmergencyNotification[]
}

export interface EmergencyInput {
  latitude?: number
  longitude?: number
  note?: string
}

export type WearableProvider = 'web_bluetooth' | 'fitbit' | 'google_health' | 'apple_health' | 'garmin' | 'manual'

export interface WearableDevice {
  id: string
  provider: WearableProvider
  deviceName: string
  externalId?: string | null
  lastSeenAt?: string | null
  active: boolean
}

export interface WearableSampleInput {
  sampledAt: string
  heartRate?: number
  hrvMs?: number
  spo2?: number
  motionIntensity?: number
  skinTempC?: number
  steps?: number
}

export interface WearableSample extends WearableSampleInput {
  id?: number
}

export type WearableAlertKind = 'tachycardia' | 'motion_convulsive' | 'hr_anomaly' | 'fall'

export interface WearableAlert {
  id: string
  deviceId: string
  detectedAt: string
  kind: WearableAlertKind
  confidence: number
  payload?: Record<string, unknown>
  convertedEventId?: string | null
}

export interface WearableSummary {
  hours: number
  avgHeartRate: number | null
  minHeartRate: number | null
  maxHeartRate: number | null
  samples: number
}

export interface DashboardSummary {
  risk: RiskToday | null
  adherence: Adherence | null
  lastSeizure: Seizure | null
  seizureFreeDays: number
  currentHeartRate: number | null
  activeAlerts: WearableAlert[]
}

export interface MedicalReport {
  patient: { fullName: string; birthDate?: string | null }
  range: { from: string; to: string }
  generatedAt: string
  seizures: Seizure[]
  medications: Medication[]
  adherence: Adherence | null
  insights: Insight[]
  stats: SeizureStats | null
}

export type StreamEvent =
  | { type: 'emergency'; data: EmergencyEvent }
  | { type: 'wearable_alert'; data: WearableAlert }
  | { type: 'risk_updated'; data: RiskToday }
