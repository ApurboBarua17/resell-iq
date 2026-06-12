import { Link } from 'react-router-dom'
import { PanelLeft, Tag, Zap } from 'lucide-react'

export default function Header({ cacheStats, onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-20 border-b border-black/[0.06] bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
          aria-label="Toggle search history"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <span className="rounded-lg bg-neutral-900 p-1.5">
            <Tag className="h-4 w-4 text-white" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-neutral-900">
            Resell<span className="text-azure">IQ</span>
          </span>
        </Link>
        <div className="ml-auto">
          {cacheStats?.total > 0 && (
            <span className="flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-3 py-1 font-mono text-[11px] text-neutral-500">
              <Zap className="h-3.5 w-3.5 text-azure" />
              {Math.round(cacheStats.hit_rate * 100)}% CACHE HIT RATE
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
