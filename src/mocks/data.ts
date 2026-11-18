import type {
  DailyLog,
  EmergencyContact,
  Insight,
  Medication,
  RiskHistoryPoint,
  RiskLevel,
  RiskToday,
  Seizure,
  User,
} from '@/lib/api/types'
import { addDays, toISODate } from '@/lib/format'

/** Deterministic pseudo random so mock data is stable between reloads (dev and tests only). */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

export const demoUser: User = {
  id: 'u-demo',
  email: 'demo@episafe.app',
  fullName: 'Camila Restrepo',
  birthDate: '1996-04-12',
  timezone: 'America/Bogota',
  role: 'patient',
}

export const DEMO_PASSWORD = 'Demo1234!'

export function buildDailyLogs(days = 90, today = new Date()): DailyLog[] {
  const r = rng(42)
  const out: DailyLog[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(today, -i)
    out.push({
      id: `dl-${i}`,
      logDate: toISODate(d),
      sleepHours: Math.round((4 + r() * 4.5) * 10) / 10,
      stressLevel: 2 + Math.floor(r() * 8),
      caffeineMg: Math.floor(r() * 4) * 90,
      exerciseMinutes: Math.floor(r() * 5) * 15,
      mood: 1 + Math.floor(r() * 5),
      alcoholUnits: 0,
      notes: null,
    })
  }
  return out
}

export function buildSeizures(logs: DailyLog[]): Seizure[] {
  const r = rng(7)
  const types = ['Focal consciente', 'Focal con alteración de conciencia', 'Tónico-clónica generalizada', 'Ausencia']
  const out: Seizure[] = []
  // Seizures cluster after nights with less than 5 hours of sleep (planted correlation).
  logs.forEach((l, idx) => {
    const lowSleep = (l.sleepHours ?? 8) < 5
    if ((lowSleep && r() < 0.55) || r() < 0.012) {
      const day = new Date(l.logDate + 'T00:00:00')
      day.setHours(6 + Math.floor(r() * 14), Math.floor(r() * 60))
      out.push({
        id: `sz-${idx}`,
        startedAt: day.toISOString(),
        durationSeconds: 30 + Math.floor(r() * 150),
        severity: 1 + Math.floor(r() * 5),
        seizureType: types[Math.floor(r() * types.length)] ?? types[0],
        triggersNoted: lowSleep ? ['Poco sueño'] : [],
        location: 'Casa',
        notes: null,
        source: r() < 0.2 ? 'emergency' : 'manual',
        resolvedAt: day.toISOString(),
      })
    }
  })
  return out.sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}

export const medications: Medication[] = [
  { id: 'm1', name: 'Levetiracetam', dose: '500', unit: 'mg', scheduleTimes: ['08:00', '20:00'], active: true, notes: 'Con comida' },
  { id: 'm2', name: 'Lamotrigina', dose: '100', unit: 'mg', scheduleTimes: ['09:00'], active: true, notes: null },
  { id: 'm3', name: 'Clobazam', dose: '10', unit: 'mg', scheduleTimes: ['22:00'], active: true, notes: 'Antes de dormir' },
]

export const medicationCatalog = [
  'Levetiracetam',
  'Lamotrigina',
  'Lacosamida',
  'Carbamazepina',
  'Oxcarbazepina',
  'Ácido valproico',
  'Topiramato',
  'Clobazam',
  'Clonazepam',
  'Fenitoína',
  'Fenobarbital',
  'Zonisamida',
  'Brivaracetam',
  'Perampanel',
]

export const contacts: EmergencyContact[] = [
  { id: 'c1', name: 'Marta Restrepo', relationship: 'Madre', phone: '+57 300 123 4567', email: 'marta@correo.co', priority: 1, notifySms: true, notifyEmail: true },
  { id: 'c2', name: 'Julián Ortega', relationship: 'Pareja', phone: '+57 311 765 4321', email: null, priority: 2, notifySms: true, notifyEmail: false },
]

export const insights: Insight[] = [
  {
    id: 'i1',
    kind: 'sleep',
    title: 'El 80% de tus crisis ocurrieron tras dormir menos de 5 horas',
    body: 'En 8 de 10 crisis registradas, la noche anterior dormiste menos de 5 horas. Dormir 7 horas o más reduce de forma notable tu riesgo diario.',
    evidence: { n: 8, total: 10, lift: 2.9, ciLow: 0.49, ciHigh: 0.94, metric: 'sleepHours < 5' },
    confidence: 0.82,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'i2',
    kind: 'adherence',
    title: 'Olvidar la dosis nocturna duplica tu riesgo del día siguiente',
    body: 'Los días posteriores a una toma omitida de las 20:00 tuvieron más del doble de crisis que el resto.',
    evidence: { n: 5, total: 9, lift: 2.1, ciLow: 0.27, ciHigh: 0.81, metric: 'missed_evening_dose' },
    confidence: 0.67,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'i3',
    kind: 'stress',
    title: 'Niveles de estrés de 8 o más anteceden el 40% de tus crisis',
    body: 'Hay una asociación moderada entre estrés alto y crisis en las 24 horas siguientes. Las pausas activas ayudan.',
    evidence: { n: 4, total: 10, lift: 1.6, ciLow: 0.17, ciHigh: 0.69, metric: 'stress >= 8' },
    confidence: 0.54,
    createdAt: new Date().toISOString(),
  },
]

export const riskToday: RiskToday = {
  score: 64,
  level: 'high',
  modelVersion: 'logit-v1.3',
  confidence: 0.78,
  degraded: false,
  factors: [
    { name: 'Sueño de anoche', impact: 24, direction: 'up', detail: 'Dormiste 4.5 h, por debajo de tu mínimo seguro de 6 h.' },
    { name: 'Estrés reciente', impact: 14, direction: 'up', detail: 'Nivel 7 de 10 en los últimos dos días.' },
    { name: 'Cafeína', impact: 6, direction: 'up', detail: '270 mg ayer, sobre tu promedio.' },
    { name: 'Adherencia a medicación', impact: -8, direction: 'down', detail: 'Tomaste el 96% de tus dosis esta semana.' },
    { name: 'Ejercicio', impact: -4, direction: 'down', detail: '45 minutos de actividad ayer.' },
  ],
}

export function buildRiskHistory(days: number, logs: DailyLog[]): RiskHistoryPoint[] {
  return logs.slice(-days).map((l) => {
    const sleepPenalty = Math.max(0, 7 - (l.sleepHours ?? 7)) * 11
    const score = Math.max(4, Math.min(96, Math.round(18 + sleepPenalty + (l.stressLevel ?? 4) * 3)))
    const level: RiskLevel = score < 30 ? 'low' : score < 55 ? 'moderate' : score < 80 ? 'high' : 'critical'
    return { assessedOn: l.logDate, score, level }
  })
}
