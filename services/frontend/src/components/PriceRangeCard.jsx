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
  high: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  medium: 'border-amber-200 bg-amber-50 text-amber-700',
  low: 'border-rose-200 bg-rose-50 text-rose-700',
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
          stroke="#a3a3a3"
          tickFormatter={(value) => `$${Math.round(value)}`}
          tickLine={false}
          axisLine={{ stroke: '#e5e5e5' }}
          fontSize={11}
        />
        <YAxis type="category" dataKey="name" hide />
        <Bar dataKey="base" stackId="range" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="low" stackId="range" fill="#ececec" radius={[4, 0, 0, 4]} barSize={18} />
        <Bar dataKey="iqr" stackId="range" fill="#0099ff" barSize={18} />
        <Bar dataKey="high" stackId="range" fill="#ececec" radius={[0, 4, 4, 0]} barSize={18} />
        <ReferenceLine x={median} stroke="#a3a3a3" strokeDasharray="4 4" />
        {recommended != null && (
          <ReferenceLine
            x={recommended}
            stroke="#111111"
            strokeWidth={2}
            label={{ value: 'recommended', fill: '#111111', fontSize: 11, position: 'top' }}
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
    <section className="animate-fade-up rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400">
          Recommended price
        </h2>
        <div className="ml-auto flex items-center gap-2">
          {cached && (
            <span className="flex items-center gap-1 rounded-full border border-azure/25 bg-azure/5 px-2.5 py-0.5 text-xs font-medium text-azure">
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

      <p className="mt-3 text-5xl font-semibold tracking-tight text-neutral-900 sm:text-6xl">
        {formatPrice(advice?.recommended_price)}
      </p>

      {advice?.price_reasoning && (
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-neutral-500">
          {advice.price_reasoning}
        </p>
      )}

      {hasComparables ? (
        <div className="mt-4">
          <RangeChart stats={stats} recommended={advice?.recommended_price} />
          <div className="mt-1 flex justify-between text-xs text-neutral-400">
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
        <p className="mt-4 rounded-2xl border border-black/[0.06] bg-neutral-50 p-3 text-xs text-neutral-500">
          No comparable active listings found — this estimate is based on general
          market knowledge rather than live data.
        </p>
      )}
    </section>
  )
}
