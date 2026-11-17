import type { Seizure } from '@/lib/api/types'
import { addDays, toISODate } from '@/lib/format'

export interface HeatCell {
  date: string
  count: number
  maxSeverity: number
  future: boolean
}

/**
 * Builds a calendar grid: `weeks` columns of 7 days (Monday first) ending at the week of `today`.
 */
export function buildHeatmap(seizures: Seizure[], weeks = 20, today = new Date()): HeatCell[][] {
  const byDay = new Map<string, { count: number; maxSeverity: number }>()
  for (const s of seizures) {
    const key = toISODate(new Date(s.startedAt))
    const cur = byDay.get(key) ?? { count: 0, maxSeverity: 0 }
    cur.count++
    cur.maxSeverity = Math.max(cur.maxSeverity, s.severity ?? 1)
    byDay.set(key, cur)
  }
  const todayIso = toISODate(today)
  const mondayOffset = (today.getDay() + 6) % 7
  const start = addDays(today, -mondayOffset - (weeks - 1) * 7)
  const columns: HeatCell[][] = []
  for (let w = 0; w < weeks; w++) {
    const col: HeatCell[] = []
    for (let d = 0; d < 7; d++) {
      const date = toISODate(addDays(start, w * 7 + d))
      const hit = byDay.get(date)
      col.push({ date, count: hit?.count ?? 0, maxSeverity: hit?.maxSeverity ?? 0, future: date > todayIso })
    }
    columns.push(col)
  }
  return columns
}

/** Hour-of-day distribution, useful to show when crises tend to happen. */
export function hourHistogram(seizures: Seizure[]): number[] {
  const bins = new Array<number>(24).fill(0)
  for (const s of seizures) {
    const h = new Date(s.startedAt).getHours()
    bins[h] = (bins[h] ?? 0) + 1
  }
  return bins
}
