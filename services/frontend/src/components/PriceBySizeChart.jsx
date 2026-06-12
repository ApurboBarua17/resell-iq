import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export default function PriceBySizeChart({ listings }) {
  const bySize = new Map()
  for (const listing of listings || []) {
    const size = listing.extra?.size
    if (!size || typeof listing.price !== 'number') continue
    if (!bySize.has(size)) bySize.set(size, [])
    bySize.get(size).push(listing.price)
  }
  // Render nothing unless multiple distinct sizes are present.
  if (bySize.size < 2) return null

  const data = [...bySize.entries()]
    .map(([size, prices]) => ({
      size,
      median: Math.round(median(prices)),
      count: prices.length,
    }))
    .sort((a, b) => parseFloat(a.size) - parseFloat(b.size))

  return (
    <section className="animate-fade-up rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] [animation-delay:180ms]">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400">
        Price by size
      </h2>
      <div className="mt-4 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <XAxis
              dataKey="size"
              tickLine={false}
              axisLine={{ stroke: '#e5e5e5' }}
              fontSize={11}
              stroke="#a3a3a3"
              label={null}
            />
            <YAxis
              tickFormatter={(value) => `$${value}`}
              tickLine={false}
              axisLine={false}
              fontSize={10}
              stroke="#a3a3a3"
            />
            <Tooltip
              cursor={{ fill: 'rgba(0, 153, 255, 0.06)' }}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.08)',
                fontSize: 12,
              }}
              formatter={(value, _name, entry) => [
                `$${value} median (${entry.payload.count} listing${entry.payload.count === 1 ? '' : 's'})`,
                `US ${entry.payload.size}`,
              ]}
            />
            <Bar dataKey="median" fill="#0099ff" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-neutral-400">
        Median asking price per US size, from sizes quoted in comparable listings.
      </p>
    </section>
  )
}
