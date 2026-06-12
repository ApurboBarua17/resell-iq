import { useCallback, useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import Header from './components/Header.jsx'
import ModeSwitcher, { MODES } from './components/ModeSwitcher.jsx'
import SearchForm from './components/SearchForm.jsx'
import LoadingState from './components/LoadingState.jsx'
import PriceRangeCard from './components/PriceRangeCard.jsx'
import ListingPreview from './components/ListingPreview.jsx'
import ComparableListings from './components/ComparableListings.jsx'
import HistorySidebar from './components/HistorySidebar.jsx'
import { search, pollResult, getHistory, getCacheStats } from './api.js'

function initialMode() {
  const requested = new URLSearchParams(window.location.search).get('mode')
  return MODES.some((m) => m.id === requested) ? requested : 'electronics'
}

export default function App() {
  const [mode, setMode] = useState(initialMode)
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

  function changeMode(nextMode) {
    setMode(nextMode)
    setPhase('idle')
    setResult(null)
    setError(null)
    const url = new URL(window.location)
    url.searchParams.set('mode', nextMode)
    window.history.replaceState(null, '', url)
  }

  async function handleSearch(fields) {
    setPhase('loading')
    setError(null)
    setResult(null)
    try {
      const res = await search({ mode, ...fields })
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
      <div className="bg-blob bg-blob-peach" aria-hidden="true" />
      <div className="bg-blob bg-blob-pink" aria-hidden="true" />
      <div className="bg-blob bg-blob-azure" aria-hidden="true" />
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
          <div className="mb-6 animate-fade-up">
            <ModeSwitcher mode={mode} onChange={changeMode} />
          </div>
          <SearchForm
            key={mode}
            mode={mode}
            onSubmit={handleSearch}
            loading={phase === 'loading'}
          />

          {phase === 'loading' && <LoadingState />}

          {phase === 'error' && (
            <div className="mt-8 flex animate-fade-up items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-600">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium text-rose-700">Something went wrong</p>
                <p className="mt-1 text-sm">{error}</p>
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
