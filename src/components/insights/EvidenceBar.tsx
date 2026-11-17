import type { Insight } from '@/lib/api/types'

/** Shows observed proportion with its Wilson confidence interval so the claim is auditable. */
export function EvidenceBar({ evidence }: { evidence: Insight['evidence'] }) {
  const { n, total, ciLow, ciHigh, lift } = evidence
  if (n === undefined || total === undefined || total === 0) return null
  const p = n / total
  const hasCi = ciLow !== undefined && ciHigh !== undefined
  return (
    <div className="mt-6">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-semibold">
          {n} de {total} crisis
        </span>
        <span className="font-display text-2xl font-bold tabular-nums">{Math.round(p * 100)}%</span>
      </div>
      <div className="relative mt-2 h-4 rounded-full bg-surface-2" role="img" aria-label={`${Math.round(p * 100)} por ciento${hasCi ? `, intervalo de confianza de ${Math.round(ciLow * 100)} a ${Math.round(ciHigh * 100)} por ciento` : ''}`}>
        <div className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: `${p * 100}%` }} />
        {hasCi && <div className="absolute inset-y-0 rounded-full border-2 border-lime bg-lime/30" style={{ left: `${ciLow * 100}%`, width: `${(ciHigh - ciLow) * 100}%` }} />}
      </div>
      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
        {hasCi && (
          <div className="flex gap-1.5">
            <dt>Intervalo de confianza (Wilson):</dt>
            <dd className="font-semibold text-ink">
              {Math.round(ciLow * 100)}% a {Math.round(ciHigh * 100)}%
            </dd>
          </div>
        )}
        {lift !== undefined && (
          <div className="flex gap-1.5">
            <dt>Aumento de riesgo:</dt>
            <dd className="font-semibold text-ink">x{lift.toFixed(1)}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}
