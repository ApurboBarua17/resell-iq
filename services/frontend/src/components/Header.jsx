import { PanelLeft, Tag, Zap } from 'lucide-react'

export default function Header({ cacheStats, onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-900 hover:text-slate-200"
          aria-label="Toggle search history"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 p-1.5">
            <Tag className="h-4 w-4 text-white" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Resell<span className="text-indigo-400">IQ</span>
          </span>
        </div>
        <div className="ml-auto">
          {cacheStats?.total > 0 && (
            <span className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs text-slate-400">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              {Math.round(cacheStats.hit_rate * 100)}% cache hit rate
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
