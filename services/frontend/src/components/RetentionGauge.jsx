function gaugeColor(pct) {
  if (pct > 70) return '#10b981'
  if (pct >= 40) return '#f59e0b'
  return '#f43f5e'
}

export default function RetentionGauge({ retentionPct, retail }) {
  // Risk flag 9: absent when the eBay "New" search returned nothing.
  if (retentionPct == null) return null

  const clamped = Math.max(0, Math.min(retentionPct, 100))
  const color = gaugeColor(retentionPct)
  const radius = 56
  const circumference = 2 * Math.PI * radius
  const arc = (clamped / 100) * circumference * 0.75 // gauge spans 270°

  return (
    <section className="animate-fade-up rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] [animation-delay:60ms]">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400">
        Value retention vs new
      </h2>
      <div className="mt-4 flex items-center gap-6">
        <svg viewBox="0 0 140 140" className="h-32 w-32 shrink-0">
          <g transform="rotate(135 70 70)">
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#ececec"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${circumference * 0.75} ${circumference}`}
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${arc} ${circumference}`}
              style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.22, 1, 0.36, 1)' }}
            />
          </g>
          <text
            x="70"
            y="74"
            textAnchor="middle"
            className="fill-neutral-900"
            fontSize="26"
            fontWeight="600"
          >
            {Math.round(retentionPct)}%
          </text>
        </svg>
        <div className="text-sm leading-relaxed text-neutral-500">
          <p>
            Used units currently sell for{' '}
            <span className="font-medium" style={{ color }}>
              {retentionPct}%
            </span>{' '}
            of the going new price
            {retail?.median != null && (
              <>
                {' '}
                (new median ${retail.median}
                {retail.count ? `, ${retail.count} listings` : ''})
              </>
            )}
            .
          </p>
        </div>
      </div>
    </section>
  )
}
