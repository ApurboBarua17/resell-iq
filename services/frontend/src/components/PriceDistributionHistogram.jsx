import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function buildBins(prices, binCount = 6) {
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  if (min === max) return null
  const width = (max - min) / binCount
  const bins = Array.from({ length: binCount }, (_, index) => ({
    label: `$${Math.round(min + index * width)}–${Math.round(min + (index + 1) * width)}`,
    count: 0,
  }))
  for (const price of prices) {
    const index = Math.min(Math.floor((price - min) / width), binCount - 1)
    bins[index].count += 1
  }
  return bins
}

export default function PriceDistributionHistogram({ listings }) {
  const prices = (listings || [])
    .map((listing) => listing.price)
    .filter((price) => typeof price === 'number')
  if (prices.length < 4) return null
  const bins = buildBins(prices)
  if (!bins) return null

  return (
    <section className="animate-fade-up rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] [animation-delay:180ms]">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400">
        Price distribution
      </h2>
      <div className="mt-4 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bins} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: '#e5e5e5' }}
              fontSize={10}
              stroke="#a3a3a3"
              interval={0}
            />
            <YAxis
              allowDecimals={false}
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
              formatter={(value) => [`${value} listings`, null]}
            />
            <Bar dataKey="count" fill="#0099ff" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-neutral-400">
        How the {prices.length} comparable listings are spread across price ranges.
      </p>
    </section>
  )
}
