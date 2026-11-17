import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { RiskHistoryPoint } from '@/lib/api/types'
import { formatDate, riskLabel } from '@/lib/format'

export function RiskHistoryChart({ data }: { data: RiskHistoryPoint[] }) {
  return (
    <div className="h-64 w-full" role="img" aria-label={`Evolución del riesgo en ${data.length} días`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.55} />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 5" />
          <XAxis dataKey="assessedOn" tickFormatter={(d: string) => formatDate(d, { day: 'numeric', month: 'short' })} tick={{ fill: 'var(--muted)', fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={32} />
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fill: 'var(--muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
          <ReferenceLine y={55} stroke="var(--coral)" strokeDasharray="4 4" label={{ value: 'Alto', fill: 'var(--coral)', fontSize: 11, position: 'insideTopRight' }} />
          <Tooltip
            cursor={{ stroke: 'var(--brand)', strokeWidth: 1 }}
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, color: 'var(--ink)' }}
            labelFormatter={(d) => formatDate(String(d))}
            formatter={(v, _n, item) => [`${String(v)} (${riskLabel[(item.payload as RiskHistoryPoint).level] ?? ''})`, 'Riesgo']}
          />
          <Area type="monotone" dataKey="score" stroke="var(--brand)" strokeWidth={3} fill="url(#riskFill)" activeDot={{ r: 6, fill: 'var(--lime)', stroke: 'var(--brand)', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
