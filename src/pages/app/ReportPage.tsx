import { useState } from 'react'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { ErrorState, Skeleton } from '@/components/ui/States'
import { useQuery } from '@/hooks/useQuery'
import { reportsApi } from '@/lib/api/endpoints'
import { addDays, formatDate, formatDateTime, formatDuration, percent, toISODate } from '@/lib/format'
import clsx from 'clsx'

const ranges = [
  { days: 30, label: '30 días' },
  { days: 90, label: '3 meses' },
  { days: 180, label: '6 meses' },
]

export default function ReportPage() {
  const [days, setDays] = useState(90)
  const to = toISODate(new Date())
  const from = toISODate(addDays(new Date(), -days))
  const report = useQuery(() => reportsApi.medical(from, to), [days])

  return (
    <div>
      <PageHeader
        title="Informe médico"
        description="Un resumen listo para llevar a tu consulta. Usa Imprimir y elige Guardar como PDF."
        actions={
          <>
            <div className="flex w-full rounded-full bg-surface p-1 shadow-elev-1 sm:w-auto" role="group" aria-label="Periodo del informe">
              {ranges.map((r) => (
                <button key={r.days} type="button" aria-pressed={days === r.days} onClick={() => setDays(r.days)} className={clsx('press min-h-11 flex-1 rounded-full px-4 text-sm font-semibold sm:flex-none', days === r.days ? 'bg-brand text-brand-ink' : 'text-muted hover:text-ink')}>
                  {r.label}
                </button>
              ))}
            </div>
            <Button onClick={() => window.print()} disabled={!report.data}>
              <Printer className="size-4" aria-hidden /> Imprimir o guardar PDF
            </Button>
          </>
        }
      />

      {report.error ? (
        <ErrorState error={report.error} onRetry={report.reload} />
      ) : report.loading || !report.data ? (
        <Skeleton className="h-[40rem]" />
      ) : (
        <article className="print-sheet mx-auto max-w-4xl rounded-[1.75rem] border border-line/70 bg-surface p-5 shadow-elev-1 sm:p-12" aria-label="Informe médico">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-ink pb-6">
            <div>
              <p className="font-display text-sm font-bold text-brand">EpiSafe IA</p>
              <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Resumen clínico del paciente</h2>
            </div>
            <div className="text-sm sm:text-right">
              <p className="font-semibold">{report.data.patient.fullName}</p>
              {report.data.patient.birthDate && <p className="text-muted">Nacimiento: {formatDate(report.data.patient.birthDate)}</p>}
              <p className="text-muted">
                Periodo: {formatDate(report.data.range.from)} a {formatDate(report.data.range.to)}
              </p>
              <p className="text-muted">Generado: {formatDateTime(report.data.generatedAt)}</p>
            </div>
          </header>

          <section className="mt-6 grid grid-cols-3 gap-2 text-center sm:mt-8 sm:gap-4">
            <div className="rounded-2xl bg-surface-2 p-3 sm:p-4">
              <p className="font-display text-3xl font-bold sm:text-4xl">{report.data.seizures.length}</p>
              <p className="text-xs text-muted sm:text-sm">Crisis en el periodo</p>
            </div>
            <div className="rounded-2xl bg-surface-2 p-3 sm:p-4">
              <p className="font-display text-3xl font-bold sm:text-4xl">{report.data.adherence && report.data.adherence.total > 0 ? percent(report.data.adherence.rate) : '--'}</p>
              <p className="text-sm text-muted">Adherencia</p>
            </div>
            <div className="rounded-2xl bg-surface-2 p-3 sm:p-4">
              <p className="font-display text-3xl font-bold sm:text-4xl">{report.data.medications.filter((m) => m.active).length}</p>
              <p className="text-xs text-muted sm:text-sm">Medicamentos activos</p>
            </div>
          </section>

          <section className="mt-10">
            <h3 className="font-display text-xl font-semibold">Tratamiento actual</h3>
            {report.data.medications.length === 0 ? (
              <p className="mt-3 text-muted">No hay medicamentos registrados.</p>
            ) : (
            <div className="-mx-1 overflow-x-auto px-1"><table className="mt-3 w-full min-w-[26rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="py-2 font-semibold">Medicamento</th>
                  <th className="py-2 font-semibold">Dosis</th>
                  <th className="py-2 font-semibold">Horarios</th>
                </tr>
              </thead>
              <tbody>
                {report.data.medications.map((m) => (
                  <tr key={m.id} className="border-b border-line/60">
                    <td className="py-2.5 font-semibold">{m.name}</td>
                    <td className="py-2.5">
                      {m.dose} {m.unit}
                    </td>
                    <td className="py-2.5">{m.scheduleTimes.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
            )}
          </section>

          <section className="mt-10">
            <h3 className="font-display text-xl font-semibold">Registro de crisis</h3>
            {report.data.seizures.length === 0 ? (
              <p className="mt-3 text-muted">No se registraron crisis en este periodo.</p>
            ) : (
              <div className="-mx-1 overflow-x-auto px-1"><table className="mt-3 w-full min-w-[26rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-muted">
                    <th className="py-2 font-semibold">Fecha</th>
                    <th className="py-2 font-semibold">Tipo</th>
                    <th className="py-2 font-semibold">Duración</th>
                    <th className="py-2 font-semibold">Intensidad</th>
                  </tr>
                </thead>
                <tbody>
                  {report.data.seizures.map((s) => (
                    <tr key={s.id} className="border-b border-line/60 break-inside-avoid">
                      <td className="py-2.5">{formatDateTime(s.startedAt)}</td>
                      <td className="py-2.5">{s.seizureType ?? 'No indicado'}</td>
                      <td className="py-2.5">{formatDuration(s.durationSeconds)}</td>
                      <td className="py-2.5">{s.severity ?? '-'} / 5</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            )}
          </section>

          {report.data.insights.length > 0 && (
            <section className="mt-10 break-inside-avoid">
              <h3 className="font-display text-xl font-semibold">Patrones detectados por IA</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                {report.data.insights.map((i) => (
                  <li key={i.id}>
                    <span className="font-semibold">{i.title}.</span> <span className="text-muted">{i.body}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <footer className="mt-12 border-t border-line pt-4 text-xs text-muted">
            Documento generado automáticamente a partir de los registros del paciente. Las correlaciones son estadísticas y no constituyen un diagnóstico ni una recomendación de tratamiento.
          </footer>
        </article>
      )}
    </div>
  )
}
