import { describe, expect, it } from 'vitest'
import { toAdherence, toDashboardSummary, toEmergencyEvent, toInsight, toMedicalReport, toMedication, toRiskToday, unwrap } from './adapters'

describe('API adapters (real backend contract)', () => {
  it('unwraps envelopes and tolerates flat payloads', () => {
    expect(unwrap({ user: { id: 1 } }, 'user')).toEqual({ id: 1 })
    expect(unwrap({ id: 1 }, 'user')).toEqual({ id: 1 })
  })

  it('stringifies numeric doses', () => {
    expect(toMedication({ id: 'a', name: 'Levetiracetam', dose: 500, unit: 'mg', scheduleTimes: ['08:00'], active: true }).dose).toBe('500')
  })

  it('never yields NaN adherence', () => {
    const a = toAdherence({ total: 0, taken: 0 })
    expect(a.rate).toBe(0)
    expect(Number.isNaN(toAdherence({}).rate)).toBe(false)
  })

  it('maps the risk assessment envelope', () => {
    const r = toRiskToday({ assessment: { score: 20, level: 'low', factors: [], assessedOn: '2026-11-18' }, confidence: 0.7, degraded: true })
    expect(r).toMatchObject({ score: 20, level: 'low', degraded: true, confidence: 0.7 })
  })

  it('maps insights evidence and kind', () => {
    const i = toInsight({ id: '1', kind: 'sleep_pattern', title: 't', body: 'b', evidence: { n: 5, totalSeizures: 6, wilson95: [0.4, 0.9] }, createdAt: 'x' })
    expect(i.kind).toBe('sleep')
    expect(i.evidence).toMatchObject({ n: 5, total: 6, ciLow: 0.4, ciHigh: 0.9 })
  })

  it('builds the dashboard summary from the real shape', () => {
    const s = toDashboardSummary(
      { risk: { score: 20, level: 'low', factors: [] }, adherence: { rate: 0.96, streakDays: 6 }, seizureFreeStreakDays: 1, activeAlerts: { count: 0, items: [] } },
      { rate: 0.96, taken: 85, total: 89, days: 30 },
    )
    expect(s.seizureFreeDays).toBe(1)
    expect(s.activeAlerts).toEqual([])
    expect(s.adherence).toMatchObject({ taken: 85, total: 89 })
  })

  it('maps the emergency outcome and medical report', () => {
    const e = toEmergencyEvent({ event: { id: 'e', triggeredAt: 't', status: 'active' }, notifications: [{ id: 'n', channel: 'sms', status: 'sent', payload: { contactName: 'Marta' } }] })
    expect(e.notifications?.[0]?.contactName).toBe('Marta')
    const r = toMedicalReport({ report: { patient: { fullName: 'L' }, period: { from: 'a', to: 'b' }, seizures: { total: 1, items: [{ startedAt: 's', durationSeconds: 5, severity: 2, triggers: ['x'] }] }, medications: [{ name: 'Lamotrigina', dose: 100, unit: 'mg', scheduleTimes: ['21:00'] }] } }, null)
    expect(r.seizures[0]?.triggersNoted).toEqual(['x'])
    expect(r.medications[0]?.dose).toBe('100')
    expect(r.range).toEqual({ from: 'a', to: 'b' })
  })
})
