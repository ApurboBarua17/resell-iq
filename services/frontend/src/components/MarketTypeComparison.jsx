const LABELS = {
  ebay: { name: 'Marketplace', note: 'eBay' },
  etsy: { name: 'Curated/Vintage', note: 'Etsy' },
}

export default function MarketTypeComparison({ breakdown }) {
  // Render nothing unless BOTH sources produced comparables.
  if (breakdown?.ebay?.median == null || breakdown?.etsy?.median == null) return null

  const max = Math.max(breakdown.ebay.median, breakdown.etsy.median)

  return (
    <section className="animate-fade-up rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] [animation-delay:180ms]">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400">
        Marketplace vs curated
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {['ebay', 'etsy'].map((source) => {
          const { median, count } = breakdown[source]
          const { name, note } = LABELS[source]
          return (
            <div
              key={source}
              className="rounded-2xl border border-black/[0.06] bg-neutral-50 p-4"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                {name} <span className="text-neutral-300">· {note}</span>
              </p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-neutral-900">
                ${median % 1 ? median.toFixed(2) : median}
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full rounded-full bg-azure transition-all duration-700"
                  style={{ width: `${(median / max) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-neutral-400">
                median of {count} listing{count === 1 ? '' : 's'}
              </p>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-neutral-400">
        Curated vintage shops typically ask more than general marketplace sellers —
        price between the two to capture the spread.
      </p>
    </section>
  )
}
