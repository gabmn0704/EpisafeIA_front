import { CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { HeartRatePoint } from '@/hooks/useHeartRateMonitor'

const timeLabel = (t: number) => new Date(t).toLocaleTimeString('es-CO', { minute: '2-digit', second: '2-digit' })

export function LiveHeartChart({ points }: { points: HeartRatePoint[] }) {
  const values = points.map((p) => p.bpm)
  const min = values.length ? Math.max(30, Math.min(...values) - 10) : 50
  const max = values.length ? Math.min(220, Math.max(...values) + 10) : 120
  return (
    <div className="h-64 w-full" role="img" aria-label="Gráfica en vivo de pulso cardíaco">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 5" />
          <XAxis dataKey="t" type="number" domain={['dataMin', 'dataMax']} tickFormatter={timeLabel} tick={{ fill: 'var(--muted)', fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={48} />
          <YAxis domain={[min, max]} allowDecimals={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
          <ReferenceArea y1={60} y2={100} fill="var(--ok)" fillOpacity={0.08} />
          <Tooltip labelFormatter={(t) => timeLabel(Number(t))} formatter={(v) => [`${String(v)} lpm`, 'Pulso']} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, color: 'var(--ink)' }} />
          <Line type="monotone" dataKey="bpm" stroke="var(--coral)" strokeWidth={3} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
