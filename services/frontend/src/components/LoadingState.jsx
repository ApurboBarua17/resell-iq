import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

const MESSAGES = [
  'Searching eBay listings…',
  'Analyzing condition…',
  'Generating recommendations…',
]

export default function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(
      () => setMessageIndex((index) => (index + 1) % MESSAGES.length),
      2200,
    )
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-2 text-sm text-indigo-300">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span key={messageIndex} className="animate-pulse">
          {MESSAGES[messageIndex]}
        </span>
      </div>
      {[0, 1, 2].map((card) => (
        <div
          key={card}
          className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
        >
          <div className="h-4 w-1/3 rounded bg-slate-800" />
          <div className="mt-4 h-8 w-1/2 rounded bg-slate-800" />
          <div className="mt-3 h-3 w-full rounded bg-slate-800/70" />
          <div className="mt-2 h-3 w-4/5 rounded bg-slate-800/70" />
        </div>
      ))}
    </div>
  )
}
