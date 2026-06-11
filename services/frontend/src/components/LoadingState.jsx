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
    <div className="mt-8 animate-fade-up space-y-4">
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin text-azure" />
        <span key={messageIndex} className="animate-fade-up">
          {MESSAGES[messageIndex]}
        </span>
      </div>
      {[0, 1, 2].map((card) => (
        <div
          key={card}
          className="animate-pulse rounded-3xl border border-black/[0.06] bg-white p-6"
        >
          <div className="h-4 w-1/3 rounded bg-neutral-100" />
          <div className="mt-4 h-8 w-1/2 rounded bg-neutral-100" />
          <div className="mt-3 h-3 w-full rounded bg-neutral-100" />
          <div className="mt-2 h-3 w-4/5 rounded bg-neutral-100" />
        </div>
      ))}
    </div>
  )
}
