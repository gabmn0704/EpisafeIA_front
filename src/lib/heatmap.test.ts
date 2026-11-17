import type { Seizure } from '@/lib/api/types'
import { buildHeatmap, hourHistogram } from './heatmap'

const sz = (iso: string, severity = 3): Seizure => ({ id: iso, startedAt: iso, durationSeconds: 60, severity, source: 'manual' })

describe('buildHeatmap', () => {
  const today = new Date(2026, 5, 17, 12) // Wednesday

  it('creates full weeks starting on Monday and ending with this week', () => {
    const grid = buildHeatmap([], 4, today)
    expect(grid).toHaveLength(4)
    expect(grid.every((c) => c.length === 7)).toBe(true)
    expect(grid[3]?.[2]?.date).toBe('2026-06-17')
    expect(grid[3]?.[3]?.future).toBe(true)
    expect(grid[0]?.[0]?.date).toBe('2026-05-25')
  })

  it('counts events per day and keeps the max severity', () => {
    const grid = buildHeatmap([sz(new Date(2026, 5, 16, 8).toISOString(), 2), sz(new Date(2026, 5, 16, 22).toISOString(), 5)], 2, today)
    const cell = grid.flat().find((c) => c.date === '2026-06-16')
    expect(cell).toMatchObject({ count: 2, maxSeverity: 5 })
  })

  it('builds the hour histogram', () => {
    const h = hourHistogram([sz(new Date(2026, 0, 1, 7).toISOString()), sz(new Date(2026, 0, 2, 7).toISOString())])
    expect(h[7]).toBe(2)
    expect(h).toHaveLength(24)
  })
})
