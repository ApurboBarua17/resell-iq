import { useCallback, useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import Header from './components/Header.jsx'
import SearchForm from './components/SearchForm.jsx'
import LoadingState from './components/LoadingState.jsx'
import PriceRangeCard from './components/PriceRangeCard.jsx'
import ListingPreview from './components/ListingPreview.jsx'
import ComparableListings from './components/ComparableListings.jsx'
import HistorySidebar from './components/HistorySidebar.jsx'
import { search, pollResult, getHistory, getCacheStats } from './api.js'

export default function App() {
  const [phase, setPhase] = useState('idle') // idle | loading | done | error
  const [result, setResult] = useState(null)
  const [cached, setCached] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [cacheStats, setCacheStats] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const refreshMeta = useCallback(async () => {
    // Sidebar and stats are best-effort decorations — never block the UI.
    try {
      const [searches, stats] = await Promise.all([getHistory(10), getCacheStats()])
      setHistory(searches)
      setCacheStats(stats)
    } catch {
      /* gateway may not be up yet */
    }
  }, [])

  useEffect(() => {
    refreshMeta()
  }, [refreshMeta])

  async function handleSearch(itemDescription, condition, category) {
    setPhase('loading')
    setError(null)
    setResult(null)
    try {
      const res = await search(itemDescription, condition, category)
      if (res.cached) {
        setResult(res.result)
        setCached(true)
      } else {
        setResult(await pollResult(res.job_id))
        setCached(false)
      }
      setPhase('done')
      refreshMeta()
    } catch (err) {
      setError(err.message)
      setPhase('error')
    }
  }

  function showHistoryEntry(entry) {
    setResult(entry.result)
    setCached(false)
    setError(null)
    setPhase('done')
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen">
      <Header
        cacheStats={cacheStats}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
      />
      <div className="flex">
        <HistorySidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          history={history}
          onSelect={showHistoryEntry}
        />
        <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-8">
          <SearchForm onSubmit={handleSearch} loading={phase === 'loading'} />

          {phase === 'loading' && <LoadingState />}

          {phase === 'error' && (
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-rose-900/60 bg-rose-950/40 p-4 text-rose-200">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Something went wrong</p>
                <p className="mt-1 text-sm text-rose-300/80">{error}</p>
              </div>
            </div>
          )}

          {phase === 'done' && result && (
            <div className="mt-8 space-y-6">
              <PriceRangeCard
                stats={result.stats}
                advice={result.advice}
                cached={cached}
              />
              <ListingPreview advice={result.advice} />
              <ComparableListings listings={result.comparables} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
