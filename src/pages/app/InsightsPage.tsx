import { useState } from 'react'
import { Link } from 'react-router-dom'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { motion } from 'framer-motion'
import { Brain, RefreshCw, Sparkles, Stethoscope } from 'lucide-react'
import { EvidenceBar } from '@/components/insights/EvidenceBar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States'
import { useQuery } from '@/hooks/useQuery'
import { aiApi } from '@/lib/api/endpoints'
import { formatDate } from '@/lib/format'
import { useToast } from '@/providers/ToastProvider'

const kindLabel: Record<string, string> = { sleep: 'Sueño', adherence: 'Medicación', stress: 'Estrés', caffeine: 'Cafeína', alcohol: 'Alcohol', exercise: 'Ejercicio' }

const accent: Record<string, string> = { sleep: 'bg-brand', adherence: 'bg-ok', stress: 'bg-coral', caffeine: 'bg-amber', alcohol: 'bg-cyan', exercise: 'bg-lime' }

export default function InsightsPage() {
  const toast = useToast()
  const insights = useQuery(() => aiApi.insights())
  const [refreshing, setRefreshing] = useState(false)

  const refresh = async () => {
    setRefreshing(true)
    try {
      const next = await aiApi.refreshInsights()
      insights.setData(() => next)
      toast.success('Análisis actualizado', `${next.length} patrones encontrados en tus datos.`)
    } catch (e) {
      toast.error('No se pudo actualizar el análisis', e instanceof Error ? e.message : undefined)
    } finally {
      setRefreshing(false)
    }
  }

  const [lead, ...rest] = insights.data ?? []

  return (
    <div>
      <PageHeader
        title="Insights de IA"
        description="Patrones reales encontrados en tus propios registros, siempre con la evidencia a la vista."
        actions={
          <Button variant="outline" onClick={refresh} loading={refreshing}>
            <RefreshCw className="size-4" aria-hidden /> Actualizar análisis
          </Button>
        }
      />

      {insights.error ? (
        <ErrorState error={insights.error} onRetry={insights.reload} />
      ) : insights.loading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-60" />
          <Skeleton className="h-60" />
        </div>
      ) : !lead ? (
        <EmptyState icon={<Brain className="size-6" />} title="Todavía no hay patrones" description="La IA necesita al menos 3 crisis y unos días de registro para encontrar relaciones confiables. Sigue registrando tu día." action={<Link to="/app/registro" className={buttonClasses('primary', 'md')}>Registrar mi día</Link>} />
      ) : (
        <div className="grid grid-flow-dense gap-4 sm:gap-5 lg:grid-cols-2">
          <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative overflow-hidden rounded-[2rem] bg-hero p-5 text-white shadow-elev-3 sm:p-8 lg:col-span-2 lg:p-12">
            <div className="pointer-events-none absolute -right-10 -top-10 size-72 rounded-full bg-lime/25 blur-[90px]" />
            <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
              <div>
                <Badge tone="lime">
                  <Sparkles className="size-3.5" aria-hidden /> Hallazgo principal
                </Badge>
                <h2 className="mt-5 font-display text-[1.75rem] font-bold leading-[1.1] tracking-tight text-balance sm:text-5xl">{lead.title}</h2>
                <p className="mt-3 max-w-2xl text-base text-white/80 sm:text-lg">{lead.body}</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4 text-white sm:p-6 [&_.text-muted]:text-white/70 [&_.text-ink]:text-white [&_.bg-surface-2]:bg-white/15">
                <EvidenceBar evidence={lead.evidence} />
              </div>
            </div>
          </motion.article>

          {rest.map((i, idx) => (
            <motion.div key={i.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 * (idx + 1) }}>
              <Card className="relative h-full overflow-hidden">
                <span className={`absolute inset-x-0 top-0 h-1.5 ${accent[i.kind] ?? 'bg-brand'}`} aria-hidden />
                <div className="flex items-center justify-between">
                  <Badge tone="brand">{kindLabel[i.kind] ?? 'Patrón'}</Badge>
                  {i.confidence !== undefined && <span className="text-xs font-semibold text-muted">Confianza {Math.round(i.confidence * 100)}%</span>}
                </div>
                <h3 className="mt-4 font-display text-[1.35rem] font-semibold leading-snug text-balance">{i.title}</h3>
                <p className="mt-3 text-muted">{i.body}</p>
                <EvidenceBar evidence={i.evidence} />
                <p className="mt-5 text-xs text-muted">Detectado el {formatDate(i.createdAt)}</p>
              </Card>
            </motion.div>
          ))}

          <Card className="!bg-surface-2 lg:col-span-2">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-surface text-brand">
                <Stethoscope className="size-5" />
              </span>
              <p className="text-sm text-muted">
                Estos hallazgos son correlaciones estadísticas de tus datos, no un diagnóstico ni una indicación médica. Nunca cambies una dosis por tu cuenta: comparte este análisis con tu neurólogo.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
