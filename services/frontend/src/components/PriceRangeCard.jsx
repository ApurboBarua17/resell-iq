import { Zap } from 'lucide-react'
import {
  Bar,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

const CONFIDENCE_STYLES = {
  high: 'border-emerald-800 bg-emerald-950/60 text-emerald-300',
  medium: 'border-amber-800 bg-amber-950/60 text-amber-300',
  low: 'border-rose-800 bg-rose-950/60 text-rose-300',
}

function formatPrice(value) {
  if (value == null) return '—'
  return `$${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: value % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`
}

function RangeChart({ stats, recommended }) {
  const { min, p25, median, p75, max } = stats
  const low = Math.min(min, recommended ?? min)
  const high = Math.max(max, recommended ?? max)
  const pad = (high - low || high || 1) * 0.06
  const data = [
    { name: 'prices', base: min, low: p25 - min, iqr: p75 - p25, high: max - p75 },
  ]

  return (
    <ResponsiveContainer width="100%" height={96}>
      <ComposedChart
        layout="vertical"
        data={data}
        margin={{ top: 24, right: 16, bottom: 0, left: 16 }}
      >
        <XAxis
          type="number"
          domain={[low - pad, high + pad]}
          stroke="#475569"
          tickFormatter={(value) => `$${Math.round(value)}`}
          tickLine={false}
          axisLine={{ stroke: '#1e293b' }}
          fontSize={11}
        />
        <YAxis type="category" dataKey="name" hide />
        <Bar dataKey="base" stackId="range" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="low" stackId="range" fill="#334155" radius={[4, 0, 0, 4]} barSize={18} />
        <Bar dataKey="iqr" stackId="range" fill="#6366f1" barSize={18} />
        <Bar dataKey="high" stackId="range" fill="#334155" radius={[0, 4, 4, 0]} barSize={18} />
        <ReferenceLine x={median} stroke="#e2e8f0" strokeDasharray="4 4" />
        {recommended != null && (
          <ReferenceLine
            x={recommended}
            stroke="#34d399"
            strokeWidth={2}
            label={{ value: 'recommended', fill: '#34d399', fontSize: 11, position: 'top' }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export default function PriceRangeCard({ stats, advice, cached }) {
  const confidence = advice?.confidence?.toLowerCase()
  const hasComparables = stats?.count > 0

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-medium uppercase tracking-wider text-slate-400">
          Recommended price
        </h2>
        <div className="ml-auto flex items-center gap-2">
          {cached && (
            <span className="flex items-center gap-1 rounded-full border border-amber-800 bg-amber-950/60 px-2.5 py-0.5 text-xs font-medium text-amber-300">
              <Zap className="h-3 w-3" /> Cached
            </span>
          )}
          {confidence && CONFIDENCE_STYLES[confidence] && (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${CONFIDENCE_STYLES[confidence]}`}
            >
              {confidence} confidence
            </span>
          )}
        </div>
      </div>

      <p className="mt-3 bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-5xl font-bold tracking-tight text-transparent">
        {formatPrice(advice?.recommended_price)}
      </p>

      {advice?.price_reasoning && (
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-slate-400">
          {advice.price_reasoning}
        </p>
      )}

      {hasComparables ? (
        <div className="mt-4">
          <RangeChart stats={stats} recommended={advice?.recommended_price} />
          <div className="mt-1 flex justify-between text-xs text-slate-500">
            <span>min {formatPrice(stats.min)}</span>
            <span>
              median {formatPrice(stats.median)} · {stats.count} active listing
              {stats.count === 1 ? '' : 's'}
              {stats.low_confidence && ' — limited data'}
            </span>
            <span>max {formatPrice(stats.max)}</span>
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-xs text-slate-500">
          No comparable active listings found — this estimate is based on general
          market knowledge rather than live data.
        </p>
      )}
    </section>
  )
}
