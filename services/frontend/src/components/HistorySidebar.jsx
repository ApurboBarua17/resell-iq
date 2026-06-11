import { Clock, X } from 'lucide-react'

export default function HistorySidebar({ open, onClose, history, onSelect }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 shrink-0 border-r border-slate-800 bg-slate-950 transition-transform duration-200 md:sticky md:top-[57px] md:z-0 md:h-[calc(100vh-57px)] md:bg-transparent ${
          open ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
      >
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-slate-400">
              <Clock className="h-4 w-4" /> Recent searches
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-900 hover:text-slate-200 md:hidden"
              aria-label="Close history"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex-1 space-y-1 overflow-y-auto">
            {history.length === 0 && (
              <p className="px-3 text-sm text-slate-600">
                No searches yet — your history will show up here.
              </p>
            )}
            {history.map((entry) => (
              <button
                key={entry.id}
                onClick={() => onSelect(entry)}
                className="w-full rounded-lg border border-transparent px-3 py-2.5 text-left transition hover:border-slate-800 hover:bg-slate-900"
              >
                <p className="truncate text-sm text-slate-200">
                  {entry.item_description}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <span>{entry.condition}</span>
                  {entry.result?.advice?.recommended_price != null && (
                    <span className="font-medium text-emerald-400">
                      ${entry.result.advice.recommended_price}
                    </span>
                  )}
                  <span className="ml-auto">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}
