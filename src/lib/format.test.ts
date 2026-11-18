import { addDays, formatDuration, parseISODate, relativeTime, toISODate } from './format'

describe('format helpers', () => {
  it('formats durations', () => {
    expect(formatDuration(45)).toBe('45 s')
    expect(formatDuration(120)).toBe('2 min')
    expect(formatDuration(135)).toBe('2 min 15 s')
    expect(formatDuration(null)).toBe('Sin dato')
  })

  it('round-trips local ISO dates without timezone drift', () => {
    const d = parseISODate('2026-03-01')
    expect(toISODate(d)).toBe('2026-03-01')
    expect(toISODate(addDays(d, 31))).toBe('2026-04-01')
  })

  it('describes relative time in Spanish', () => {
    const now = new Date('2026-01-10T12:00:00Z').getTime()
    expect(relativeTime('2026-01-10T12:00:20Z', now)).toBe('justo ahora')
    expect(relativeTime('2026-01-09T12:00:00Z', now)).toMatch(/ayer/)
  })
})
