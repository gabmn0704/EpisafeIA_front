import { useMemo } from 'react'
import clsx from 'clsx'
import type { Seizure } from '@/lib/api/types'
import { formatDate } from '@/lib/format'
import { buildHeatmap } from '@/lib/heatmap'

const severityClass = ['bg-surface-2', 'bg-brand/30', 'bg-brand/55', 'bg-brand', 'bg-coral', 'bg-coral ring-2 ring-ink/40']
const dayLabels = ['L', '', 'M', '', 'V', '', 'D']

export function SeizureHeatmap({ seizures, weeks = 20, onSelect }: { seizures: Seizure[]; weeks?: number; onSelect?: (date: string) => void }) {
  const grid = useMemo(() => buildHeatmap(seizures, weeks), [seizures, weeks])
  const total = seizures.length

  return (
    <div>
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex min-w-max gap-2" role="grid" aria-label={`Calendario de crisis de las últimas ${weeks} semanas, ${total} en total`}>
          <div className="flex flex-col gap-[5px] pt-0.5 text-[11px] font-semibold text-muted" aria-hidden>
            {dayLabels.map((l, i) => (
              <span key={i} className="grid h-[22px] place-items-center">
                {l}
              </span>
            ))}
          </div>
          {grid.map((col, ci) => (
            <div key={ci} role="row" className="flex flex-col gap-[5px]">
              {col.map((cell) => {
                if (cell.future) return <span key={cell.date} className="size-[22px]" aria-hidden />
                const label = `${formatDate(cell.date)}: ${cell.count === 0 ? 'sin crisis' : `${cell.count} crisis, intensidad máxima ${cell.maxSeverity}`}`
                return (
                  <button
                    key={cell.date}
                    type="button"
                    role="gridcell"
                    title={label}
                    aria-label={label}
                    disabled={cell.count === 0}
                    onClick={() => onSelect?.(cell.date)}
                    className={clsx('size-[22px] rounded-[5px] transition hover:scale-125 disabled:hover:scale-100', severityClass[Math.min(5, cell.maxSeverity)])}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted" aria-hidden>
        Sin crisis
        {[0, 1, 2, 3, 4].map((s) => (
          <span key={s} className={clsx('size-3.5 rounded-[4px]', severityClass[s])} />
        ))}
        Más intensa
      </div>
    </div>
  )
}
